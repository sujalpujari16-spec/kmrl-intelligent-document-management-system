export type UserRole = 'Admin' | 'HR' | 'Employee';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  department: string;
  avatar?: string;
}

export type DocumentCategory = 
  | 'Leave Policies' 
  | 'HR Circulars' 
  | 'Attendance & Shifts' 
  | 'Procurement & Tenders' 
  | 'Metro Operations' 
  | 'General Policies';

export type DocumentStatus = 'Approved' | 'Pending Approval' | 'Rejected';

export type LeaveType = 'Casual Leave' | 'Sick Leave' | 'Earned Leave' | 'Maternity Leave' | 'Paternity Leave';
export type LeaveStatus = 'Pending Approval' | 'Approved' | 'Rejected';

export interface LeaveApplication {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeRole: UserRole;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  durationDays: number;
  reason: string;
  medicalCertificateUrl?: string;
  status: LeaveStatus;
  appliedDate: string;
  reviewedBy?: string;
  reviewDate?: string;
  reviewNotes?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  filename: string;
  category: DocumentCategory;
  uploadedBy: string;
  uploadedByRole: UserRole;
  uploadDate: string;
  fileSize: string;
  fileType: 'pdf' | 'docx' | 'image' | 'txt';
  status: DocumentStatus;
  extractedText: string;
  isScanned: boolean;
  version: number;
  downloadUrl?: string;
  approvalNotes?: string;
  approvedBy?: string;
  approvalDate?: string;
  contentData?: string; // Raw content or base64
  blockchainHash?: string;
  blockchainBlockNumber?: number;
  blockchainStatus?: 'VERIFIED' | 'TAMPERED';
}

export interface BlockchainBlock {
  blockNumber: number;
  timestamp: string;
  documentId: string;
  documentTitle: string;
  fileHash: string;
  metadataHash: string;
  previousBlockHash: string;
  nonce: number;
  blockHash: string;
  validator: string;
  signature: string;
  status: 'VALID' | 'TAMPERED';
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  category: DocumentCategory;
  chunkIndex: number;
  text: string;
  vector?: number[];
}

export type AgentType = 
  | 'router' 
  | 'search_agent' 
  | 'hr_agent' 
  | 'document_agent' 
  | 'leave_agent' 
  | 'report_agent';

export interface AgentExecutionStep {
  agent: AgentType;
  agentName: string;
  action: string;
  thought: string;
  output: string;
  timestamp: string;
  sources?: { docId: string; docTitle: string; snippet: string; score: number }[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  agentFlow?: AgentExecutionStep[];
  sources?: { docId: string; docTitle: string; snippet: string; score: number }[];
  selectedAgent?: AgentType;
  mcpExecutions?: { server: 'postgres' | 'filesystem' | 'gemini'; tool: string; resultSummary: string }[];
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  documentTitle?: string;
  details: string;
  ipAddress?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'alert';
  read: boolean;
  targetRole?: UserRole | 'All';
}

export interface AnalyticsData {
  totalDocuments: number;
  pendingApprovals: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  totalUsers: number;
  totalStorageUsedMB: number;
  categoryCounts: Record<DocumentCategory, number>;
  recentUploadsCount: number;
  agentQueriesToday: number;
}
