import React, { useState } from 'react';
import { AuditLogItem } from '../types';
import { 
  History, 
  Search, 
  Download, 
  ShieldCheck, 
  User, 
  Clock, 
  Activity,
  Filter,
  FileSpreadsheet,
  Printer,
  ChevronDown
} from 'lucide-react';

interface AuditLogsViewProps {
  auditLogs: AuditLogItem[];
}

export const AuditLogsView: React.FC<AuditLogsViewProps> = ({ auditLogs }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const filteredLogs = auditLogs.filter((log) => {
    const matchesRole = roleFilter === 'All' || log.userRole === roleFilter;
    const matchesQuery =
      searchQuery === '' ||
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.documentTitle && log.documentTitle.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesRole && matchesQuery;
  });

  // 1. Export CSV
  const exportCSV = () => {
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Document', 'Details', 'IP Address'];
    const rows = filteredLogs.map((l) => [
      `"${l.timestamp}"`,
      `"${l.userName}"`,
      `"${l.userRole}"`,
      `"${l.action}"`,
      `"${(l.documentTitle || 'N/A').replace(/"/g, '""')}"`,
      `"${l.details.replace(/"/g, '""')}"`,
      `"${l.ipAddress || '192.168.10.1'}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KMRL_Audit_Logs_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // 2. Export Excel Workbook (XML/HTML format)
  const exportExcel = () => {
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <table border="1">
          <tr style="background-color: #0d9488; color: #ffffff; font-weight: bold;">
            <th>Timestamp</th><th>User Persona</th><th>Role</th><th>Action Event</th><th>Document</th><th>Details</th><th>IP Address</th>
          </tr>
          ${filteredLogs
            .map(
              (l) => `
            <tr>
              <td>${l.timestamp}</td>
              <td><b>${l.userName}</b></td>
              <td>${l.userRole}</td>
              <td>${l.action}</td>
              <td>${l.documentTitle || 'N/A'}</td>
              <td>${l.details}</td>
              <td>${l.ipAddress || '192.168.10.1'}</td>
            </tr>
          `
            )
            .join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KMRL_Audit_Logs_${new Date().toISOString().substring(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // 3. Print / Save as PDF
  const exportPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">KMRL Audit & Activity Logs</h2>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-teal-100 text-teal-800 border border-teal-200 rounded-md">
              IMMUTABLE
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time administrative audit logs, user security events, document uploads, and policy compliance verification.
          </p>
        </div>

        {/* Multi-Format Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export Reports</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-xl z-20 py-1 text-xs text-slate-700 animate-fade-in">
              <button
                onClick={exportCSV}
                className="w-full px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-left cursor-pointer font-medium"
              >
                <Download className="w-4 h-4 text-teal-600" />
                <span>Export as CSV (.csv)</span>
              </button>
              <button
                onClick={exportExcel}
                className="w-full px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-left cursor-pointer font-medium"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Export as Excel (.xls)</span>
              </button>
              <button
                onClick={exportPDF}
                className="w-full px-3.5 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-left cursor-pointer font-medium border-t border-slate-100"
              >
                <Printer className="w-4 h-4 text-blue-600" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search logs by user, action, document title, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="HR">HR</option>
            <option value="Employee">Employee</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Timestamp</th>
                <th className="p-3.5">User Persona</th>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Details</th>
                <th className="p-3.5 text-right">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 font-sans text-xs">
                    No audit log records match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  let roleColor = 'bg-blue-50 text-blue-700 border-blue-200';
                  if (log.userRole === 'Admin') roleColor = 'bg-purple-50 text-purple-700 border-purple-200';
                  if (log.userRole === 'HR') roleColor = 'bg-teal-50 text-teal-700 border-teal-200';

                  return (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>
                      <td className="p-3.5 font-sans">
                        <div className="font-bold text-slate-900">{log.userName}</div>
                        <span className={`inline-block px-1.5 py-0.2 text-[9px] font-bold rounded-md border mt-0.5 ${roleColor}`}>
                          {log.userRole}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans">
                        <span className="font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 text-[11px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3.5 font-sans max-w-md">
                        <p className="text-slate-800 text-xs font-normal leading-relaxed">{log.details}</p>
                        {log.documentTitle && (
                          <div className="text-[10px] text-teal-800 font-semibold mt-0.5">
                            Doc: "{log.documentTitle}"
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-right text-slate-400 text-[11px] whitespace-nowrap">
                        {log.ipAddress || '192.168.10.45'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
