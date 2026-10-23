import React, { useState, useEffect, useCallback } from 'react';
import { DocumentItem, LeaveApplication, UserRole } from '../types';
import { 
  CheckSquare, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CalendarDays,
  FileText, 
  Scan,
  AlertTriangle,
  Paperclip
} from 'lucide-react';

interface ApprovalWorkflowViewProps {
  documents: DocumentItem[];
  userRole: UserRole;
  currentUserName: string;
  onApproveReject: (docId: string, action: 'approve' | 'reject', notes: string) => Promise<void>;
  onRefreshLeaves?: () => void;
}

export const ApprovalWorkflowView: React.FC<ApprovalWorkflowViewProps> = ({
  documents,
  userRole,
  currentUserName,
  onApproveReject,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [reviewingDoc, setReviewingDoc] = useState<DocumentItem | null>(null);
  const [reviewingLeave, setReviewingLeave] = useState<LeaveApplication | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [leaves, setLeaves] = useState<LeaveApplication[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      setLoadingLeaves(true);
      const res = await fetch('/api/leaves');
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error('Error fetching leaves for approvals:', err);
    } finally {
      setLoadingLeaves(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const pendingDocs = documents.filter((d) => d.status === 'Pending Approval');
  const approvedDocs = documents.filter((d) => d.status === 'Approved');
  const rejectedDocs = documents.filter((d) => d.status === 'Rejected');

  const pendingLeaves = leaves.filter((l) => l.status === 'Pending Approval' || (l.status as string) === 'Pending');
  const approvedLeaves = leaves.filter((l) => l.status === 'Approved');
  const rejectedLeaves = leaves.filter((l) => l.status === 'Rejected');

  const totalPending = pendingDocs.length + pendingLeaves.length;
  const totalApproved = approvedDocs.length + approvedLeaves.length;
  const totalRejected = rejectedDocs.length + rejectedLeaves.length;

  const displayedDocs =
    activeTab === 'pending'
      ? pendingDocs
      : activeTab === 'approved'
      ? approvedDocs
      : rejectedDocs;

  const displayedLeaves =
    activeTab === 'pending'
      ? pendingLeaves
      : activeTab === 'approved'
      ? approvedLeaves
      : rejectedLeaves;

  const handleDocAction = async (action: 'approve' | 'reject') => {
    if (!reviewingDoc || loadingAction) return;
    setLoadingAction(true);
    try {
      await onApproveReject(
        reviewingDoc.id,
        action,
        reviewNotes.trim() || (action === 'approve' ? 'Approved by HR Reviewer.' : 'Rejected by HR.')
      );
      setReviewingDoc(null);
      setReviewNotes('');
    } catch (err) {
      console.error('Document approval action error:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleLeaveAction = async (action: 'approve' | 'reject') => {
    if (!reviewingLeave || loadingAction) return;
    setLoadingAction(true);
    try {
      const res = await fetch(`/api/leaves/${reviewingLeave.id}/approval`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          reviewerName: currentUserName,
          notes: reviewNotes.trim() || (action === 'approve' ? 'Approved by HR Reviewer.' : 'Rejected by HR.'),
        }),
      });

      if (res.ok) {
        setReviewingLeave(null);
        setReviewNotes('');
        await fetchLeaves();
      }
    } catch (err) {
      console.error('Leave approval action error:', err);
    } finally {
      setLoadingAction(false);
    }
  };

  const isHRorAdmin = userRole === 'HR' || userRole === 'Admin';

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">KMRL Unified Approval Workflow</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review and validate staff leave applications, medical forms, and official repository documents.
          </p>
        </div>

        {!isHRorAdmin && (
          <div className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs flex items-center gap-1.5 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>View Mode: Approvals are managed by HR / Admin officers.</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals ({totalPending})</span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Approved ({totalApproved})</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <XCircle className="w-4 h-4" />
          <span>Rejected ({totalRejected})</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
        
        {/* 1. Staff Leave Applications Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-teal-700" />
              <span>Staff Leave Applications ({displayedLeaves.length})</span>
            </h3>
          </div>

          {displayedLeaves.length === 0 ? (
            <div className="p-6 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
              No leave applications in {activeTab} queue.
            </div>
          ) : (
            <div className="space-y-3">
              {displayedLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 font-bold rounded-md text-[10px]">
                        {leave.leaveType}
                      </span>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-medium rounded-md text-[10px]">
                        {leave.department}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{leave.employeeName}</h4>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span><strong>{leave.startDate}</strong> → <strong>{leave.endDate}</strong></span>
                      <span>• <strong className="text-teal-700">{leave.durationDays} Day{leave.durationDays > 1 ? 's' : ''}</strong></span>
                      <span>• Applied {leave.appliedDate}</span>
                    </p>

                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      Reason: "{leave.reason}"
                    </p>

                    {leave.medicalCertificateUrl && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        <Paperclip className="w-3 h-3" /> Doctor Medical Certificate Attached
                      </span>
                    )}
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <button
                      onClick={() => {
                        setReviewingLeave(leave);
                        setReviewNotes('');
                      }}
                      className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {activeTab === 'pending' && isHRorAdmin ? 'Review & Approve' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 2. Repository Documents Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-700" />
              <span>Repository Documents & Circulars ({displayedDocs.length})</span>
            </h3>
          </div>

          {displayedDocs.length === 0 ? (
            <div className="p-6 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500">
              No documents in {activeTab} queue.
            </div>
          ) : (
            <div className="space-y-3">
              {displayedDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-teal-500 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md text-[10px]">
                        {doc.category}
                      </span>
                      {doc.isScanned && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 font-bold rounded-md text-[10px] flex items-center gap-1 border border-purple-200">
                          <Scan className="w-3 h-3" /> Scanned Form
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{doc.title}</h4>

                    <p className="text-xs text-slate-500 flex items-center gap-2">
                      <span>Uploaded by <strong className="text-slate-700">{doc.uploadedBy}</strong> ({doc.uploadedByRole})</span>
                      <span>• {doc.uploadDate}</span>
                    </p>

                    <p className="text-xs font-mono text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 line-clamp-2">
                      {doc.extractedText.trim().substring(0, 180)}...
                    </p>
                  </div>

                  {/* Action */}
                  <div className="flex items-center gap-2 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                    <button
                      onClick={() => {
                        setReviewingDoc(doc);
                        setReviewNotes('');
                      }}
                      className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      {activeTab === 'pending' && isHRorAdmin ? 'Review & Approve' : 'View Details'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* REVIEW & APPROVAL MODAL: LEAVE APPLICATION */}
      {reviewingLeave && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">Leave Review: {reviewingLeave.employeeName}</h3>
                <p className="text-xs text-slate-500">{reviewingLeave.department} • {reviewingLeave.leaveType}</p>
              </div>
              <button onClick={() => setReviewingLeave(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Duration</span>
                  <p className="font-bold text-slate-800">{reviewingLeave.durationDays} Day(s) ({reviewingLeave.startDate} to {reviewingLeave.endDate})</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold">Applied On</span>
                  <p className="font-bold text-slate-800">{reviewingLeave.appliedDate}</p>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Reason for Leave</span>
                <p className="text-slate-700 bg-white p-2 rounded-lg border border-slate-200 mt-0.5">{reviewingLeave.reason}</p>
              </div>
            </div>

            {/* Review Notes Input */}
            {isHRorAdmin && (reviewingLeave.status === 'Pending Approval' || (reviewingLeave.status as string) === 'Pending') && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HR Reviewer Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved leave application based on departmental coverage."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewingLeave(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {isHRorAdmin && (reviewingLeave.status === 'Pending Approval' || (reviewingLeave.status as string) === 'Pending') ? (
                <>
                  <button
                    onClick={() => handleLeaveAction('reject')}
                    disabled={loadingAction}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Reject Application
                  </button>

                  <button
                    onClick={() => handleLeaveAction('approve')}
                    disabled={loadingAction}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Approve Leave
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setReviewingLeave(null)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* REVIEW & APPROVAL MODAL: DOCUMENT */}
      {reviewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl p-6 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900">{reviewingDoc.title}</h3>
                <p className="text-xs text-slate-500">Applicant: {reviewingDoc.uploadedBy} ({reviewingDoc.uploadedByRole})</p>
              </div>
              <button onClick={() => setReviewingDoc(null)} className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Extracted Document Preview */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">OCR Extracted Text & Application Details</label>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap border border-slate-800">
                {reviewingDoc.extractedText}
              </div>
            </div>

            {/* Review Notes Input */}
            {isHRorAdmin && reviewingDoc.status === 'Pending Approval' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">HR Reviewer Notes / Remarks</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Approved document after validating policy alignment."
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReviewingDoc(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>

              {isHRorAdmin && reviewingDoc.status === 'Pending Approval' ? (
                <>
                  <button
                    onClick={() => handleDocAction('reject')}
                    disabled={loadingAction}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Reject Submission
                  </button>

                  <button
                    onClick={() => handleDocAction('approve')}
                    disabled={loadingAction}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                  >
                    Approve Document
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setReviewingDoc(null)}
                  className="px-5 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
