import React, { useState, useEffect, useCallback } from 'react';
import { 
  User, 
  DocumentItem, 
  AuditLogItem, 
  NotificationItem, 
  AnalyticsData 
} from './types';
import { 
  INITIAL_USERS, 
  INITIAL_DOCUMENTS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialData';

import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { DocumentLibraryView } from './components/DocumentLibraryView';
import { LeaveManagementView } from './components/LeaveManagementView';
import { AIChatbotView } from './components/AIChatbotView';
import { ApprovalWorkflowView } from './components/ApprovalWorkflowView';
import { AuditLogsView } from './components/AuditLogsView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { LoginView } from './components/LoginView';

export default function App() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>(INITIAL_AUDIT_LOGS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalDocuments: INITIAL_DOCUMENTS.length,
    pendingApprovals: INITIAL_DOCUMENTS.filter((d) => d.status === 'Pending Approval').length,
    approvedDocuments: INITIAL_DOCUMENTS.filter((d) => d.status === 'Approved').length,
    rejectedDocuments: INITIAL_DOCUMENTS.filter((d) => d.status === 'Rejected').length,
    totalUsers: INITIAL_USERS.length,
    totalStorageUsedMB: 18.4,
    categoryCounts: {
      'Leave Policies': 2,
      'HR Circulars': 0,
      'Attendance & Shifts': 1,
      'Procurement & Tenders': 1,
      'Metro Operations': 1,
      'General Policies': 0,
    },
    recentUploadsCount: INITIAL_DOCUMENTS.length,
    agentQueriesToday: 14,
  });

  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch API State
  const refreshData = useCallback(async () => {
    try {
      const authHeaders: Record<string, string> = {
        'x-user-id': currentUser?.id || '00000000-0000-0000-0000-000000000001',
        'x-user-email': currentUser?.email || 'admin@kmrl.in',
        'x-user-role': currentUser?.role || 'Admin',
      };

      const [docRes, logRes, notifRes, analyticsRes, usersRes] = await Promise.all([
        fetch('/api/documents', { headers: authHeaders, credentials: 'same-origin' }),
        fetch('/api/audit-logs', { headers: authHeaders, credentials: 'same-origin' }),
        fetch('/api/notifications', { headers: authHeaders, credentials: 'same-origin' }),
        fetch('/api/analytics', { headers: authHeaders, credentials: 'same-origin' }),
        fetch('/api/users', { headers: authHeaders, credentials: 'same-origin' }),
      ]);

      if (docRes.ok) {
        const rawDocs = await docRes.json();
        if (Array.isArray(rawDocs)) {
          setDocuments(rawDocs.map((d: any) => ({
            ...d,
            uploadDate: d.uploadDate || d.upload_date || new Date().toISOString().replace('T', ' ').substring(0, 16),
            status: d.status || 'Approved',
          })));
        }
      }

      if (logRes.ok) {
        const rawLogs = await logRes.json();
        if (Array.isArray(rawLogs)) {
          setAuditLogs(rawLogs.map((l: any) => ({
            ...l,
            timestamp: l.timestamp || l.createdAt || l.created_at || new Date().toISOString().replace('T', ' ').substring(0, 16),
          })));
        }
      }

      if (notifRes.ok) {
        const rawNotifs = await notifRes.json();
        if (Array.isArray(rawNotifs)) {
          setNotifications(rawNotifs.map((n: any) => ({
            ...n,
            timestamp: n.timestamp || n.createdAt || n.created_at || new Date().toISOString().replace('T', ' ').substring(0, 16),
          })));
        }
      }

      if (analyticsRes.ok) {
        const rawAnalytics = await analyticsRes.json();
        setAnalytics({
          totalDocuments: rawAnalytics.totalDocuments ?? 0,
          pendingApprovals: rawAnalytics.pendingApprovals ?? rawAnalytics.pendingDocuments ?? 0,
          approvedDocuments: rawAnalytics.approvedDocuments ?? 0,
          rejectedDocuments: rawAnalytics.rejectedDocuments ?? 0,
          totalUsers: rawAnalytics.totalUsers ?? 0,
          totalStorageUsedMB: rawAnalytics.totalStorageUsedMB ?? 18.4,
          categoryCounts: rawAnalytics.categoryCounts || rawAnalytics.categoryDistribution || {
            'Leave Policies': 0,
            'HR Circulars': 0,
            'Attendance & Shifts': 0,
            'Procurement & Tenders': 0,
            'Metro Operations': 0,
            'General Policies': 0,
          },
          recentUploadsCount: rawAnalytics.recentUploadsCount ?? rawAnalytics.totalDocuments ?? 0,
          agentQueriesToday: rawAnalytics.agentQueriesToday ?? 14,
        });
      }

      if (usersRes.ok) {
        const updatedUsers = await usersRes.json();
        if (Array.isArray(updatedUsers)) {
          setUsers(updatedUsers);
          setCurrentUser((prev) => {
            if (!prev) return prev;
            const match = updatedUsers.find((u: any) => u.id === prev.id || u.email === prev.email);
            if (match) {
              const updated = { ...prev, ...match };
              try {
                localStorage.setItem('kmrl_user', JSON.stringify(updated));
              } catch (e) {}
              return updated;
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('API sync warning:', err);
    }
  }, [currentUser?.id, currentUser?.email, currentUser?.role]);

  const handleUserUpdated = useCallback((updatedUser: User) => {
    if (currentUser && (currentUser.id === updatedUser.id || currentUser.email === updatedUser.email)) {
      setCurrentUser(updatedUser);
      try {
        localStorage.setItem('kmrl_user', JSON.stringify(updatedUser));
      } catch (e) {}
    }
    setUsers((prev) =>
      prev.map((u) =>
        u.id === updatedUser.id || u.email === updatedUser.email
          ? { ...u, avatar: updatedUser.avatar, name: updatedUser.name }
          : u
      )
    );
  }, [currentUser]);

  // Check active session on startup via secure HTTP-Only cookie or local cache
  useEffect(() => {
    async function checkAuthSession() {
      // 1. Immediate restore from localStorage
      try {
        const cached = localStorage.getItem('kmrl_user');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.email) {
            setCurrentUser(parsed);
            setIsAuthenticated(true);
          }
        }
      } catch (e) {}

      // 2. Verified session check from server
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setCurrentUser(data.user);
            setIsAuthenticated(true);
            localStorage.setItem('kmrl_user', JSON.stringify(data.user));
          }
        }
      } catch {
        // Not authenticated
      }
    }
    checkAuthSession();
    refreshData();
  }, [refreshData]);

  // Real-Time Server-Sent Events (SSE) Stream
  useEffect(() => {
    if (!isAuthenticated) return;
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/events');

      eventSource.addEventListener('document_created', () => {
        refreshData();
      });

      eventSource.addEventListener('document_approved', () => {
        refreshData();
      });

      eventSource.addEventListener('document_deleted', () => {
        refreshData();
      });

      eventSource.addEventListener('notification_created', () => {
        refreshData();
      });

      eventSource.addEventListener('user_registered', () => {
        refreshData();
      });

      eventSource.onerror = () => {
        // SSE will auto-reconnect
      };
    } catch (err) {
      console.warn('SSE EventSource not supported or failed to connect:', err);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [isAuthenticated, refreshData]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('kmrl_user');
    setCurrentUser(null);
    setIsAuthenticated(false);
    setActiveTab('dashboard');
  };

  // Upload Document Handler (Supports multipart FormData)
  const handleUploadDocument = async (formDataOrData: any) => {
    try {
      let res: Response;
      if (formDataOrData instanceof FormData) {
        res = await fetch('/api/documents', {
          method: 'POST',
          body: formDataOrData,
        });
      } else {
        res = await fetch('/api/documents', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formDataOrData),
        });
      }

      if (res.ok) {
        await refreshData();
      } else {
        const err = await res.json();
        throw new Error(err.message || err.error || 'Upload failed');
      }
    } catch (err) {
      console.error('Failed to upload document:', err);
      throw err;
    }
  };

  // Delete Document Handler
  const handleDeleteDocument = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed to delete document:', err);
    }
  };

  // Approve / Reject Handler
  const handleApproveReject = async (docId: string, action: 'approve' | 'reject', notes: string) => {
    try {
      const res = await fetch(`/api/approvals/${docId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          approvedBy: `${currentUser?.name} (${currentUser?.role})`,
          notes,
        }),
      });

      if (res.ok) {
        await refreshData();
      }
    } catch (err) {
      console.error('Failed approval action:', err);
    }
  };

  // Mark Notifications Read
  const handleMarkNotificationsRead = async () => {
    try {
      await fetch('/api/notifications/read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error('Failed notification read mark:', err);
    }
  };

  const pendingApprovalsCount = documents.filter((d) => d.status === 'Pending Approval').length;

  // Render Fullscreen 3D Login Screen if not logged in
  if (!isAuthenticated || !currentUser) {
    return (
      <LoginView
        currentUser={null}
        users={users}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          localStorage.setItem('kmrl_user', JSON.stringify(user));
          refreshData();
          setActiveTab('dashboard');
        }}
        onLogout={handleLogout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-900 antialiased flex flex-col">
      {/* Top Header Navbar with all Navigation Tabs */}
      <Navbar
        currentUser={currentUser}
        users={users}
        onSelectUser={(u) => {
          setCurrentUser(u);
          localStorage.setItem('kmrl_user', JSON.stringify(u));
        }}
        notifications={notifications}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onOpenSearch={() => {
          setActiveTab('documents');
        }}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingApprovalsCount={pendingApprovalsCount}
        onOpenUploadModal={() => {
          setActiveTab('documents');
          setUploadModalOpen(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Screen Content Area */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Dynamic Main View Rendering */}
        <main className="flex-1 pb-12">
          {activeTab === 'dashboard' && (
            <DashboardView
              analytics={analytics}
              documents={documents}
              auditLogs={auditLogs}
              users={users}
              userRole={currentUser.role}
              onNavigate={setActiveTab}
              onOpenUploadModal={() => {
                setActiveTab('documents');
                setUploadModalOpen(true);
              }}
            />
          )}

          {activeTab === 'documents' && (
            <DocumentLibraryView
              documents={documents}
              userRole={currentUser.role}
              currentUserName={currentUser.name}
              onUploadDocument={handleUploadDocument}
              onDeleteDocument={handleDeleteDocument}
              initialUploadOpen={uploadModalOpen}
            />
          )}

          {activeTab === 'leave' && (
            <LeaveManagementView
              userRole={currentUser.role}
              userName={currentUser.name}
              userId={currentUser.id}
              onRefreshNotifications={refreshData}
            />
          )}

          {activeTab === 'chat' && (
            <AIChatbotView
              userRole={currentUser.role}
              userName={currentUser.name}
            />
          )}

          {activeTab === 'approvals' && (
            <ApprovalWorkflowView
              documents={documents}
              userRole={currentUser.role}
              currentUserName={currentUser.name}
              onApproveReject={handleApproveReject}
            />
          )}

          {activeTab === 'audit' && (
            <AuditLogsView
              auditLogs={auditLogs}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              analytics={analytics}
              documents={documents}
            />
          )}

          {activeTab === 'login' && (
            <div className="p-4">
              <LoginView
                currentUser={currentUser}
                users={users}
                onLoginSuccess={(user) => {
                  setCurrentUser(user);
                  setIsAuthenticated(true);
                  localStorage.setItem('kmrl_user', JSON.stringify(user));
                  refreshData();
                  setActiveTab('dashboard');
                }}
                onLogout={handleLogout}
              />
            </div>
          )}

          {activeTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              allUsers={users}
              onUserCreated={refreshData}
              onUserUpdated={handleUserUpdated}
            />
          )}
        </main>

      </div>

    </div>
  );
}
