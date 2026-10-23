import React, { useState, useEffect } from 'react';
import { 
  DocumentItem, 
  AuditLogItem, 
  AnalyticsData, 
  UserRole,
  LeaveApplication,
  User
} from '../types';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Bot, 
  BrainCircuit, 
  Search, 
  Upload, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Train,
  Layers,
  Database,
  Activity,
  CalendarDays
} from 'lucide-react';

interface DashboardViewProps {
  analytics: AnalyticsData;
  documents: DocumentItem[];
  auditLogs: AuditLogItem[];
  users?: User[];
  userRole: UserRole;
  onNavigate: (tab: string) => void;
  onOpenUploadModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  documents,
  auditLogs,
  users = [],
  userRole,
  onNavigate,
  onOpenUploadModal,
}) => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);

  useEffect(() => {
    fetch('/api/leaves')
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setLeaves(data);
      })
      .catch(() => {});
  }, []);

  // Real-time calculated live metrics
  const totalDocs = documents.length;
  const approvedDocs = documents.filter((d) => d.status === 'Approved').length;
  const pendingDocs = documents.filter((d) => d.status === 'Pending Approval');
  const pendingLeaves = leaves.filter((l) => l.status === 'Pending Approval' || (l.status as string) === 'Pending');
  const totalPending = pendingDocs.length + pendingLeaves.length;
  const recentUploads = documents.slice(0, 4);
  const recentLogs = auditLogs.slice(0, 5);

  // Real distinct departments from registered staff
  const distinctDepts = Array.from(new Set(users.map((u) => u.department).filter(Boolean)));
  const deptCount = distinctDepts.length > 0 ? distinctDepts.length : 3;

  // Real live category distribution directly from loaded documents
  const dynamicCategoryCounts: Record<string, number> = {};
  documents.forEach((d) => {
    const cat = d.category || 'General Policies';
    dynamicCategoryCounts[cat] = (dynamicCategoryCounts[cat] || 0) + 1;
  });

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 rounded-2xl p-6 text-white shadow-lg border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-full uppercase tracking-wider">
                Kochi Metro Rail Limited
              </span>
              <span className="text-xs text-slate-400">Staff & Document Portal</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight">KMRL Document Portal</h2>
            <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Official portal for Kochi Metro documents, staff circulars, leave requests, and departmental approvals.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Upload Document</span>
            </button>

            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold text-xs rounded-xl backdrop-blur-xs transition-all flex items-center gap-2 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-teal-400" />
              <span>Helpdesk Assistant</span>
            </button>
          </div>
        </div>

        {/* Decorative Grid Accent */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Top Live Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Total Documents</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{totalDocs}</div>
          <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">{approvedDocs}</span> approved & ready
          </p>
        </div>

        {/* Metric 2 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Pending Approvals</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-amber-600">{totalPending}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {totalPending > 0 ? `${pendingLeaves.length} leave, ${pendingDocs.length} doc` : 'All requests up to date'}
          </p>
        </div>

        {/* Metric 3 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Approved Documents</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{approvedDocs}</div>
          <p className="text-[11px] text-emerald-600 mt-1 font-medium">In effect across KMRL</p>
        </div>

        {/* Metric 4 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Departments</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{deptCount} Depts</div>
          <p className="text-[11px] text-slate-500 mt-1">{users.length} staff registered</p>
        </div>

        {/* Metric 5 */}
        <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">Leave Requests</span>
            <div className="p-2 bg-teal-50 text-teal-600 rounded-lg">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-teal-700">{leaves.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">{pendingLeaves.length} pending review</p>
        </div>

      </div>

      {/* Two Column Layout: Quick Actions & Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Recent Documents & Pending Approvals */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Pending Approvals Card (if any) */}
          {totalPending > 0 && (
            <div className="p-5 bg-amber-50/60 border border-amber-200 rounded-2xl">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600" />
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wider">
                    Action Required: Pending Approvals ({totalPending})
                  </h3>
                </div>
                <button
                  onClick={() => onNavigate('approvals')}
                  className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  Review Queue <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {/* Pending Leaves */}
                {pendingLeaves.map((leave) => (
                  <div key={leave.id} className="p-3 bg-white border border-amber-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-teal-100 text-teal-800 rounded-lg text-xs font-bold">
                        <CalendarDays className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">
                          {leave.employeeName} — {leave.leaveType} ({leave.durationDays} Day{leave.durationDays > 1 ? 's' : ''})
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {leave.startDate} → {leave.endDate} • Reason: "{leave.reason}"
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('approvals')}
                      className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}

                {/* Pending Docs */}
                {pendingDocs.map((doc) => (
                  <div key={doc.id} className="p-3 bg-white border border-amber-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-100 text-amber-800 rounded-lg text-xs font-bold uppercase">
                        {doc.fileType}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-500">
                          Uploaded by <span className="font-semibold">{doc.uploadedBy}</span> ({doc.uploadedByRole}) • {doc.uploadDate}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigate('approvals')}
                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer"
                    >
                      Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Document Repository */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Recent Documents</h3>
                <p className="text-xs text-slate-500">Latest uploaded KMRL policies, tenders, and forms.</p>
              </div>

              <button
                onClick={() => onNavigate('documents')}
                className="text-xs font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer"
              >
                View Library <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {recentUploads.map((doc) => (
                <div key={doc.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 border border-teal-100 flex items-center justify-center font-bold text-xs uppercase">
                      {doc.fileType}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{doc.title}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                        <span className="px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded-sm text-[10px]">
                          {doc.category}
                        </span>
                        <span>• Uploaded by {doc.uploadedBy}</span>
                        <span>• {(doc.uploadDate || '').split(' ')[0] || doc.uploadDate || 'Recent'}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-full border ${
                      doc.status === 'Approved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : doc.status === 'Pending Approval'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 1 Col: Category Breakdown & Audit Activity */}
        <div className="space-y-6">
          
          {/* Document Categories Breakdown */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
              Category Distribution
            </h3>

            <div className="space-y-3">
              {Object.entries(dynamicCategoryCounts).map(([catName, count]) => {
                const total = totalDocs || 1;
                const cntNum = Number(count) || 0;
                const percentage = Math.round((cntNum / total) * 100);

                return (
                  <div key={catName} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{catName}</span>
                      <span className="font-bold text-slate-900">{count} doc(s) ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 8)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Activity Logs Stream */}
          <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Recent Activity
              </h3>
              <button
                onClick={() => onNavigate('audit')}
                className="text-xs font-semibold text-teal-700 hover:underline cursor-pointer"
              >
                All Logs
              </button>
            </div>

            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs">
                  <div className="flex items-center justify-between font-semibold text-slate-800">
                    <span>{log.action}</span>
                    <span className="text-[10px] text-slate-400 font-normal">{(log.timestamp || (log as any).createdAt || '').split(' ')[1] || log.timestamp || ''}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{log.details}</div>
                  <div className="text-[10px] text-teal-700 font-medium mt-1">
                    {log.userName} ({log.userRole})
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
