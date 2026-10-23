import fs from 'fs';
import path from 'path';
import { DocumentItem, UserRole } from '../src/types';
import { DBUser, DBLeaveBalance, DBLeaveApplication, DBAuditLog, DBNotification } from './dbService';
import { BlockchainEngine } from './blockchainEngine';

interface DatabaseData {
  users: DBUser[];
  documents: DocumentItem[];
  leaveBalances: DBLeaveBalance[];
  leaveApplications: DBLeaveApplication[];
  auditLogs: DBAuditLog[];
  notifications: DBNotification[];
  originalFiles?: Record<string, string>; // docId -> original base64 for tamper testing/restoring
}

const isVercel = Boolean(process.env.VERCEL);
const DATA_DIR = isVercel ? path.join('/tmp', 'data') : path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'kmrl_idms_db.json');
const STORAGE_DIR = path.join(DATA_DIR, 'storage');

try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
  }
} catch (e) {
  // Gracefully handle read-only environments
}

export class PersistentStore {
  private static data: DatabaseData = {
    users: [],
    documents: [],
    leaveBalances: [],
    leaveApplications: [],
    auditLogs: [],
    notifications: [],
    originalFiles: {},
  };
  private static initialized = false;

  public static initialize(defaultSeed: DatabaseData): void {
    if (this.initialized) return;

    BlockchainEngine.initialize();

    const rootSeedFile = path.resolve(process.cwd(), 'data', 'kmrl_idms_db.json');
    if (!fs.existsSync(DB_FILE) && fs.existsSync(rootSeedFile)) {
      try {
        fs.copyFileSync(rootSeedFile, DB_FILE);
      } catch (err) {
        // Continue
      }
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          users: parsed.users || defaultSeed.users,
          documents: parsed.documents || defaultSeed.documents,
          leaveBalances: parsed.leaveBalances || defaultSeed.leaveBalances,
          leaveApplications: parsed.leaveApplications || defaultSeed.leaveApplications,
          auditLogs: parsed.auditLogs || defaultSeed.auditLogs,
          notifications: parsed.notifications || defaultSeed.notifications,
          originalFiles: parsed.originalFiles || {},
        };
        console.log(`[Persistent Store] Loaded persistent database from ${DB_FILE}`);
        console.log(`[Persistent Store] Records: ${this.data.users.length} Users, ${this.data.documents.length} Documents, ${this.data.leaveApplications.length} Leaves.`);
        this.initialized = true;
        this.ensureBlockchainForDocuments();
        return;
      } catch (err) {
        console.error('[Persistent Store] Error reading DB file, seeding fresh database:', err);
      }
    }

    // Initialize from seed
    this.data = {
      ...defaultSeed,
      originalFiles: {},
    };
    this.persist();
    this.initialized = true;
    console.log(`[Persistent Store] Initialized fresh persistent database at ${DB_FILE}`);
    this.ensureBlockchainForDocuments();
  }

  private static ensureBlockchainForDocuments(): void {
    for (const doc of this.data.documents) {
      const existingBlock = BlockchainEngine.getBlockByDocumentId(doc.id);
      if (!existingBlock) {
        // Create initial block using document content or extracted text
        const content = doc.extractedText || doc.title || 'KMRL Document';
        const block = BlockchainEngine.addDocumentBlock(doc.id, doc.title, Buffer.from(content, 'utf-8'), {
          category: doc.category,
          uploadedBy: doc.uploadedBy,
          uploadedByRole: doc.uploadedByRole,
          version: doc.version,
        });
        doc.blockchainHash = block.fileHash;
        doc.blockchainBlockNumber = block.blockNumber;
        doc.blockchainStatus = 'VERIFIED';
      } else {
        doc.blockchainHash = existingBlock.fileHash;
        doc.blockchainBlockNumber = existingBlock.blockNumber;
        doc.blockchainStatus = 'VERIFIED';
      }
    }
    this.persist();
  }

  public static persist(): void {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Persistent Store] Error writing to disk:', err);
    }
  }

  // ==========================================
  // PHYSICAL FILE STORAGE (On-Disk & Fallback)
  // ==========================================
  public static savePhysicalFile(storagePath: string, buffer: Buffer): string {
    const safeRelPath = storagePath.replace(/^\/+/, '');
    const fullPath = path.join(STORAGE_DIR, safeRelPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(fullPath, buffer);
    return fullPath;
  }

  public static getPhysicalFileBuffer(storagePath: string): Buffer | null {
    const safeRelPath = storagePath.replace(/^\/+/, '');
    const fullPath = path.join(STORAGE_DIR, safeRelPath);
    if (fs.existsSync(fullPath)) {
      return fs.readFileSync(fullPath);
    }
    return null;
  }

  public static storeOriginalFile(docId: string, contentBase64: string): void {
    if (!this.data.originalFiles) this.data.originalFiles = {};
    if (!this.data.originalFiles[docId]) {
      this.data.originalFiles[docId] = contentBase64;
      this.persist();
    }
  }

  public static getOriginalFile(docId: string): string | null {
    return this.data.originalFiles?.[docId] || null;
  }

  // ==========================================
  // USERS
  // ==========================================
  public static getUsers(): DBUser[] {
    return [...this.data.users];
  }

  public static getUserByIdOrEmail(idOrEmail: string): DBUser | null {
    const clean = idOrEmail.trim().toLowerCase();
    return (
      this.data.users.find(
        (u) =>
          u.email.toLowerCase() === clean ||
          u.employeeId.toLowerCase() === clean ||
          u.id === idOrEmail.trim()
      ) || null
    );
  }

  public static addUser(user: DBUser): DBUser {
    // Check if user already exists
    const existingIndex = this.data.users.findIndex(
      (u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      this.data.users[existingIndex] = { ...this.data.users[existingIndex], ...user };
    } else {
      this.data.users.push(user);
    }
    this.persist();
    return user;
  }

  public static updateUser(userId: string, updates: Partial<DBUser>): boolean {
    const user = this.data.users.find((u) => u.id === userId);
    if (user) {
      Object.assign(user, updates);
      this.persist();
      return true;
    }
    return false;
  }

  // ==========================================
  // DOCUMENTS
  // ==========================================
  public static getDocuments(): DocumentItem[] {
    return [...this.data.documents];
  }

  public static getDocumentById(id: string): DocumentItem | null {
    return this.data.documents.find((d) => d.id === id) || null;
  }

  public static addDocument(doc: DocumentItem): DocumentItem {
    this.data.documents.unshift(doc);
    this.persist();
    return doc;
  }

  public static updateDocument(id: string, updates: Partial<DocumentItem>): DocumentItem | null {
    const doc = this.data.documents.find((d) => d.id === id);
    if (doc) {
      Object.assign(doc, updates);
      this.persist();
      return doc;
    }
    return null;
  }

  public static deleteDocument(id: string): boolean {
    const idx = this.data.documents.findIndex((d) => d.id === id);
    if (idx >= 0) {
      this.data.documents.splice(idx, 1);
      this.persist();
      return true;
    }
    return false;
  }

  // ==========================================
  // LEAVE BALANCES & APPLICATIONS
  // ==========================================
  public static initializeUserLeaveBalances(employeeId: string): void {
    const existing = this.data.leaveBalances.filter((b) => b.employeeId === employeeId);
    if (existing.length === 0) {
      this.data.leaveBalances.push(
        { id: `lb-${Date.now()}-1`, employeeId, leaveType: 'Casual Leave', totalDays: 12, usedDays: 0, remainingDays: 12, year: 2026 },
        { id: `lb-${Date.now()}-2`, employeeId, leaveType: 'Sick Leave', totalDays: 10, usedDays: 0, remainingDays: 10, year: 2026 },
        { id: `lb-${Date.now()}-3`, employeeId, leaveType: 'Earned Leave', totalDays: 30, usedDays: 0, remainingDays: 30, year: 2026 }
      );
      this.persist();
    }
  }

  public static getLeaveBalances(): DBLeaveBalance[] {
    return [...this.data.leaveBalances];
  }

  public static getLeaveApplications(): DBLeaveApplication[] {
    return [...this.data.leaveApplications];
  }

  public static addLeaveApplication(app: DBLeaveApplication): DBLeaveApplication {
    this.data.leaveApplications.unshift(app);
    this.persist();
    return app;
  }

  public static updateLeaveApplication(
    id: string,
    status: 'Approved' | 'Pending Approval' | 'Rejected',
    reviewerName: string,
    reviewerId?: string,
    notes?: string
  ): DBLeaveApplication | null {
    const app = this.data.leaveApplications.find((a) => a.id === id);
    if (app) {
      app.status = status;
      app.reviewedBy = reviewerName;
      app.reviewedById = reviewerId;
      app.reviewDate = new Date().toISOString();
      app.reviewNotes = notes;

      // If approved, deduct days from leave balance
      if (status === 'Approved') {
        const bal = this.data.leaveBalances.find(
          (b) => b.employeeId === app.employeeId && b.leaveType === app.leaveType
        );
        if (bal) {
          bal.usedDays += app.durationDays;
          bal.remainingDays = Math.max(0, bal.totalDays - bal.usedDays);
        }
      }
      this.persist();
      return app;
    }
    return null;
  }

  // ==========================================
  // AUDIT LOGS
  // ==========================================
  public static getAuditLogs(): DBAuditLog[] {
    return [...this.data.auditLogs];
  }

  public static addAuditLog(log: DBAuditLog): void {
    this.data.auditLogs.unshift(log);
    // Keep max 2000 logs on disk
    if (this.data.auditLogs.length > 2000) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 2000);
    }
    this.persist();
  }

  // ==========================================
  // NOTIFICATIONS
  // ==========================================
  public static getNotifications(): DBNotification[] {
    return [...this.data.notifications];
  }

  public static addNotification(notif: DBNotification): void {
    this.data.notifications.unshift(notif);
    if (this.data.notifications.length > 500) {
      this.data.notifications = this.data.notifications.slice(0, 500);
    }
    this.persist();
  }

  public static markNotificationsRead(userId?: string): void {
    for (const notif of this.data.notifications) {
      if (!userId || notif.userId === userId || notif.targetRole === 'All') {
        notif.read = true;
      }
    }
    this.persist();
  }
}
