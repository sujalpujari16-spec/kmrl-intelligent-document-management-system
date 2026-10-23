import React, { useState } from 'react';
import { AnalyticsData, DocumentItem } from '../types';
import {
  BarChart3,
  PieChart,
  Layers,
  CheckCircle2,
  Clock,
  FileText,
  Database,
  BrainCircuit,
  TrendingUp,
  HardDrive,
  Download,
  FileSpreadsheet,
  Printer,
  ChevronDown
} from 'lucide-react';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
  documents: DocumentItem[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ analytics, documents }) => {
  const [showExportMenu, setShowExportMenu] = useState(false);

  // 1. Export CSV
  const exportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Total Documents', analytics.totalDocuments],
      ['Approved Documents', analytics.approvedDocuments],
      ['Pending Approvals', analytics.pendingApprovals],
      ['Rejected Documents', analytics.rejectedDocuments],
      ['Repository Storage (MB)', analytics.totalStorageUsedMB],
      ['Active Users', analytics.totalUsers],
      [''],
      ['Category Name', 'Document Count'],
      ...Object.entries(analytics?.categoryCounts || {}).map(([k, v]) => [k, v]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map((r) => r.join(',')).join('\r\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KMRL_Analytics_Report_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportMenu(false);
  };

  // 2. Export Excel
  const exportExcel = () => {
    const tableHtml = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8"/></head>
      <body>
        <h2>Kochi Metro Rail Limited - IDMS Analytics Summary</h2>
        <table border="1">
          <tr style="background-color: #0d9488; color: #ffffff;"><th>Metric Name</th><th>Value</th></tr>
          <tr><td>Total Documents</td><td>${analytics.totalDocuments}</td></tr>
          <tr><td>Approved Documents</td><td>${analytics.approvedDocuments}</td></tr>
          <tr><td>Pending Approvals</td><td>${analytics.pendingApprovals}</td></tr>
          <tr><td>Storage Used</td><td>${analytics.totalStorageUsedMB} MB</td></tr>
          <tr><td>Active System Roles</td><td>${analytics.totalUsers}</td></tr>
        </table>
        <br/>
        <h3>Category Breakdown</h3>
        <table border="1">
          <tr style="background-color: #0d9488; color: #ffffff;"><th>Category</th><th>Document Count</th></tr>
          ${Object.entries(analytics?.categoryCounts || {})
        .map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`)
        .join('')}
        </table>
      </body>
      </html>
    `;

    const blob = new Blob([tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KMRL_Analytics_Report_${new Date().toISOString().substring(0, 10)}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // 3. Print / PDF
  const exportPDF = () => {
    window.print();
    setShowExportMenu(false);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">KMRL Document Management Analytics</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Operational metrics, storage allocation, vector DB index performance, and document category distribution.
          </p>
        </div>

        {/* Multi-Format Export Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4 text-teal-400" />
            <span>Export Analytics</span>
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

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Documents</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{documents.length}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Indexed across repository
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Approval Rate</div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {Math.round(((documents.filter((d) => d.status === 'Approved').length) / (documents.length || 1)) * 100)}%
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {documents.filter((d) => d.status === 'Approved').length} approved of {documents.length} total
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Review</div>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {documents.filter((d) => d.status === 'Pending Approval').length}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Awaiting administrative review
          </p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Staff</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{analytics.totalUsers}</div>
          <p className="text-[11px] text-slate-500 mt-1">
            Active staff accounts
          </p>
        </div>

      </div>

      {/* Category Distribution Chart Card */}
      <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Document Volume by Category</h3>
            <p className="text-xs text-slate-500">Breakdown of active documents across KMRL departments</p>
          </div>
          <BarChart3 className="w-5 h-5 text-teal-700" />
        </div>

        <div className="space-y-3 pt-2">
          {(() => {
            const counts: Record<string, number> = {};
            documents.forEach((d) => {
              const cat = d.category || 'General Policies';
              counts[cat] = (counts[cat] || 0) + 1;
            });
            const total = documents.length || 1;

            return Object.entries(counts).map(([catName, count]) => {
              const pct = Math.round((count / total) * 100);

              return (
                <div key={catName} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-700">{catName}</span>
                    <span className="text-slate-900">{count} document{count > 1 ? 's' : ''} ({pct}%)</span>
                  </div>

                  <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-teal-600 to-teal-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${Math.max(pct, 12)}%` }}
                    />
                  </div>
                </div>
              );
            });
          })()}
        </div>
      </div>

    </div>
  );
};
