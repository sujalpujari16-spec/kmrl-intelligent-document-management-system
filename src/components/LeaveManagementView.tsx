import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  LeaveApplication, 
  LeaveType, 
  LeaveStatus 
} from '../types';
import { 
  CalendarDays, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ShieldCheck, 
  Filter, 
  Search, 
  User as UserIcon,
  Calendar,
  Send,
  Sparkles,
  Paperclip,
  Check,
  X
} from 'lucide-react';

interface LeaveManagementViewProps {
  userRole: UserRole;
  userName: string;
  userId: string;
  onRefreshNotifications?: () => void;
}

export const LeaveManagementView: React.FC<LeaveManagementViewProps> = ({
  userRole,
  userName,
  userId,
  onRefreshNotifications,
}) => {
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Apply Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [medCertAttached, setMedCertAttached] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Review Modal state for HR / Admin
  const [reviewingLeave, setReviewingLeave] = useState<LeaveApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch leave records
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/leaves');
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error('Error fetching leaves:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  // Calculate duration in days
  const calculateDays = () => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 1;
  };

  // Submit Leave Application
  const handleApplyLeave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/leaves', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employeeId: userId,
          employeeName: userName,
          employeeRole: userRole,
          department: userRole === 'Employee' ? 'Metro Operations & Signalling' : 'Human Resources',
          leaveType,
          startDate,
          endDate,
          reason,
          medicalCertificateUrl: medCertAttached ? 'medical_cert_attached.pdf' : undefined,
        }),
      });

      if (res.ok) {
        setIsApplyModalOpen(false);
        setReason('');
        setStartDate('');
        setEndDate('');
        setMedCertAttached(false);
        fetchLeaves();
        if (onRefreshNotifications) onRefreshNotifications();
      }
    } catch (err) {
      console.error('Error submitting leave:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // Approve / Reject Leave
  const handleLeaveAction = async (id: string, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/leaves/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerName: userName,
          notes: reviewNotes,
        }),
      });

      if (res.ok) {
        setReviewingLeave(null);
        setReviewNotes('');
        fetchLeaves();
        if (onRefreshNotifications) onRefreshNotifications();
      }
    } catch (err) {
      console.error('Error reviewing leave:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Filter leaves based on user role and search
  const roleLeaves = leaves.filter((leave) => {
    if (userRole === 'Employee') {
      const matchId = userId && leave.employeeId && (
        leave.employeeId === userId || 
        userId.toLowerCase().includes(leave.employeeId.toLowerCase()) || 
        leave.employeeId.toLowerCase().includes(userId.toLowerCase())
      );
      const uName = (userName || '').toLowerCase().trim();
      const lName = (leave.employeeName || '').toLowerCase().trim();
      const matchName = uName && lName && (
        lName === uName ||
        uName.includes(lName) ||
        lName.includes(uName) ||
        (uName.includes('employee') && lName.includes('employee')) ||
        (uName.includes('tanisha') && lName.includes('tanisha'))
      );
      return Boolean(matchId || matchName);
    }
    return true;
  });

  const totalPendingCount = roleLeaves.filter((l) => l.status === 'Pending Approval' || (l.status as string) === 'Pending').length;
  const totalApprovedCount = roleLeaves.filter((l) => l.status === 'Approved').length;
  const totalRejectedCount = roleLeaves.filter((l) => l.status === 'Rejected').length;

  const displayedLeaves = roleLeaves.filter((leave) => {
    if (filterStatus !== 'All') {
      if (filterStatus === 'Pending Approval' || filterStatus === 'Pending') {
        if (leave.status !== 'Pending Approval' && (leave.status as string) !== 'Pending') {
          return false;
        }
      } else if (leave.status !== filterStatus) {
        return false;
      }
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        (leave.employeeName && leave.employeeName.toLowerCase().includes(q)) ||
        (leave.leaveType && leave.leaveType.toLowerCase().includes(q)) ||
        (leave.reason && leave.reason.toLowerCase().includes(q)) ||
        (leave.department && leave.department.toLowerCase().includes(q))
      );
    }

    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-teal-700 flex items-center justify-center text-white shadow-md">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {userRole === 'Employee' ? 'Leave Management & Balances' : 'Employee Leave Administration'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              {userRole === 'Employee'
                ? 'Apply for leave, check annual quotas, and track HR review status.'
                : 'Review, verify, and approve staff leave applications across KMRL departments.'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsApplyModalOpen(true)}
            className="px-4 py-2.5 bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Apply for Leave</span>
          </button>
        </div>
      </div>

      {/* Leave Quota Cards (Especially relevant for Employee & HR view) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        
        {/* Casual Leave */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Casual Leave (CL)</span>
            <span className="px-2 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-md text-[10px] font-extrabold">
              Annual
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">7</span>
            <span className="text-xs text-slate-400 font-bold">/ 12 Days Left</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-teal-600 h-full rounded-full" style={{ width: '58%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400">Max 3-4 consecutive days</p>
        </div>

        {/* Sick Leave */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Sick Leave (SL)</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-extrabold">
              Medical
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">8</span>
            <span className="text-xs text-slate-400 font-bold">/ 10 Days Left</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '80%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400">Doctor cert for &gt; 2 days</p>
        </div>

        {/* Earned Leave */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Earned Leave (EL)</span>
            <span className="px-2 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-[10px] font-extrabold">
              Accumulable
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">24</span>
            <span className="text-xs text-slate-400 font-bold">/ 30 Days Left</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-purple-600 h-full rounded-full" style={{ width: '80%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400">Encashable & carryover</p>
        </div>

        {/* Maternity Leave */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Maternity Leave</span>
            <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-md text-[10px] font-extrabold">
              Statutory
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">180</span>
            <span className="text-xs text-slate-400 font-bold">Days Paid</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400">For up to 2 children</p>
        </div>

        {/* Paternity Leave */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Paternity Leave</span>
            <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-md text-[10px] font-extrabold">
              Statutory
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-slate-900">15</span>
            <span className="text-xs text-slate-400 font-bold">Days Paid</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
          <p className="text-[10px] text-slate-400">Within 6 mos of childbirth</p>
        </div>

      </div>

      {/* Main Leave Applications Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {[
              { label: 'All', count: roleLeaves.length, badgeColor: 'bg-slate-500' },
              { label: 'Pending Approval', count: totalPendingCount, badgeColor: 'bg-amber-500' },
              { label: 'Approved', count: totalApprovedCount, badgeColor: 'bg-emerald-500' },
              { label: 'Rejected', count: totalRejectedCount, badgeColor: 'bg-rose-500' },
            ].map(({ label, count, badgeColor }) => (
              <button
                key={label}
                onClick={() => setFilterStatus(label)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === label
                    ? 'bg-teal-700 text-white shadow-2xs'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{label}</span>
                {count > 0 && (
                  <span
                    className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      filterStatus === label ? 'bg-white/25 text-white' : `${badgeColor} text-white`
                    }`}
                  >
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Search Field */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search leaves, employee, reason..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600"
            />
          </div>

        </div>

        {/* Table Body */}
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">Loading leave applications...</div>
        ) : displayedLeaves.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <CalendarDays className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-sm font-bold text-slate-700">No leave applications found</p>
            <p className="text-xs text-slate-500">
              {filterStatus !== 'All' ? `No applications with status "${filterStatus}".` : 'Click "Apply for Leave" above to submit a new request.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Employee</th>
                  <th className="p-3.5">Leave Type</th>
                  <th className="p-3.5">Dates & Duration</th>
                  <th className="p-3.5">Reason & Medical Cert</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions / Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedLeaves.map((leave) => {
                  const isPending = leave.status === 'Pending Approval';
                  const isApproved = leave.status === 'Approved';
                  const isRejected = leave.status === 'Rejected';

                  return (
                    <tr key={leave.id} className="hover:bg-slate-50/80 transition-colors">
                      
                      {/* Employee */}
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{leave.employeeName}</div>
                        <div className="text-[10px] text-slate-500">{leave.department}</div>
                      </td>

                      {/* Leave Type */}
                      <td className="p-3.5">
                        <span className="font-semibold text-slate-800">{leave.leaveType}</span>
                        <div className="text-[10px] text-slate-400">Applied on {leave.appliedDate}</div>
                      </td>

                      {/* Dates */}
                      <td className="p-3.5">
                        <div className="font-medium text-slate-800">
                          {leave.startDate} → {leave.endDate}
                        </div>
                        <div className="text-[10px] font-bold text-teal-700">
                          {leave.durationDays} Day{leave.durationDays > 1 ? 's' : ''}
                        </div>
                      </td>

                      {/* Reason */}
                      <td className="p-3.5 max-w-xs">
                        <p className="text-slate-700 truncate" title={leave.reason}>{leave.reason}</p>
                        {leave.medicalCertificateUrl && (
                          <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium">
                            <Paperclip className="w-2.5 h-2.5" /> Doctor Cert Attached
                          </span>
                        )}
                        {leave.reviewNotes && (
                          <div className="text-[10px] text-slate-500 mt-1 italic">
                            HR Note: "{leave.reviewNotes}"
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[10px]">
                            <Clock className="w-3 h-3 text-amber-600" /> Pending HR Review
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold text-[10px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
                          </span>
                        )}
                        {isRejected && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full font-bold text-[10px]">
                            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right">
                        {(userRole === 'Admin' || userRole === 'HR') && isPending ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setReviewingLeave(leave);
                                setReviewNotes('');
                              }}
                              className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-xs font-bold transition-all shadow-2xs cursor-pointer"
                            >
                              Review
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            {leave.reviewedBy ? `Reviewed by ${leave.reviewedBy}` : 'Awaiting HR Action'}
                          </span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Apply Leave Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-teal-50 text-teal-700 rounded-xl">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Apply for Leave</h3>
                  <p className="text-xs text-slate-500">KMRL Employee Leave Application Form</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplyLeave} className="space-y-4 text-xs">
              
              {/* Leave Type */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Leave Type</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                >
                  <option value="Casual Leave">Casual Leave (CL) — 7 days remaining</option>
                  <option value="Sick Leave">Sick / Medical Leave (SL) — 8 days remaining</option>
                  <option value="Earned Leave">Earned Leave (EL) — 24 days remaining</option>
                  <option value="Maternity Leave">Maternity Leave (180 days paid)</option>
                  <option value="Paternity Leave">Paternity Leave (15 days paid)</option>
                </select>
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {startDate && endDate && (
                <div className="p-2.5 bg-teal-50 border border-teal-200 rounded-xl text-teal-800 text-[11px] font-semibold flex items-center justify-between">
                  <span>Calculated Duration:</span>
                  <span className="font-bold text-teal-900">{calculateDays()} Calendar Day(s)</span>
                </div>
              )}

              {/* Reason */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Please describe the purpose of your leave request..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                />
              </div>

              {/* Medical Certificate Checkbox (for sick leaves or long durations) */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  id="medCert"
                  checked={medCertAttached}
                  onChange={(e) => setMedCertAttached(e.target.checked)}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <label htmlFor="medCert" className="text-xs text-slate-700 cursor-pointer">
                  Attach Registered Medical Certificate (Required for Sick Leave &gt; 2 days)
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submitting ? 'Submitting...' : 'Submit Application'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Review Modal for HR / Admin */}
      {reviewingLeave && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-sm text-slate-900">Review Leave Application</h3>
              <button onClick={() => setReviewingLeave(null)} className="p-1 text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Employee:</span>
                  <span className="font-bold text-slate-900">{reviewingLeave.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Type:</span>
                  <span className="font-bold text-slate-900">{reviewingLeave.leaveType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-medium">Duration:</span>
                  <span className="font-bold text-teal-700">
                    {reviewingLeave.startDate} → {reviewingLeave.endDate} ({reviewingLeave.durationDays} Days)
                  </span>
                </div>
                <div className="pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500 font-medium">Reason:</span>
                  <p className="text-slate-800 mt-0.5">{reviewingLeave.reason}</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Review Notes & Remarks</label>
                <textarea
                  rows={2}
                  placeholder="Optional review feedback..."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleLeaveAction(reviewingLeave.id, 'reject')}
                  className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Reject Request
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => handleLeaveAction(reviewingLeave.id, 'approve')}
                  className="py-2 px-3 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Approve Request
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
