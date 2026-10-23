import React, { useState, useEffect, useCallback } from 'react';
import { DocumentItem } from '../types';
import { 
  Search, 
  FileText, 
  Eye, 
  Download,
  Filter,
  CheckCircle2,
  X,
  Train,
  ShieldCheck,
  BookOpen,
  ArrowRight,
  Sparkles,
  Tag
} from 'lucide-react';

interface RAGSearchPortalViewProps {
  documents: DocumentItem[];
}

export const RAGSearchPortalView: React.FC<RAGSearchPortalViewProps> = ({ documents }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const categories = [
    'All',
    'Leave Policies',
    'HR Circulars',
    'Attendance & Shifts',
    'Procurement & Tenders',
    'Metro Operations',
    'General Policies',
  ];

  const suggestedQueries = [
    'Casual Leave entitlement',
    'Maternity leave policy',
    'Train evacuation SOP',
    'Signalling operations',
    'Tender procurement rules',
  ];

  const executeSearch = useCallback(async (queryToSearch: string, cat: string) => {
    setLoading(true);
    try {
      const q = queryToSearch.trim();
      const url = `/api/search?query=${encodeURIComponent(q)}&category=${encodeURIComponent(cat)}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.results || []);
        setResults(items);
      } else {
        setResults([]);
      }
      setHasSearched(true);
    } catch (err) {
      console.error('Search query error:', err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load: show top verified repository documents
  useEffect(() => {
    executeSearch('', categoryFilter);
  }, [executeSearch, categoryFilter]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery, categoryFilter);
  };

  const handleQuickSuggestion = (text: string) => {
    setSearchQuery(text);
    executeSearch(text, categoryFilter);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim() || !text) return text;
    const words = query.trim().split(/\s+/).filter((w) => w.length > 1);
    if (words.length === 0) return text;
    const regex = new RegExp(`(${words.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);
    return (
      <>
        {parts.map((part, i) =>
          regex.test(part) ? (
            <mark key={i} className="bg-teal-100 text-teal-900 font-bold px-1 rounded-xs">
              {part}
            </mark>
          ) : (
            part
          )
        )}
      </>
    );
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Executive KMRL Search Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 text-white rounded-2xl p-6 md:p-8 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-600/30 border border-teal-500/40 rounded-xl text-teal-300">
              <Train className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold tracking-widest text-teal-400 uppercase">
                Kochi Metro Rail Limited • Enterprise Portal
              </span>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                KMRL Knowledge Base & Circular Search
              </h1>
            </div>
          </div>

          <p className="text-xs md:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Search official KMRL standard operating procedures, HR manuals, metro signalling circulars, and procurement guidelines with contextual matching.
          </p>

          {/* Search Input Bar */}
          <form onSubmit={handleFormSubmit} className="pt-2">
            <div className="flex flex-col sm:flex-row items-stretch gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 shadow-inner">
              <div className="relative flex-1 flex items-center">
                <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search policies, leave rules, SOPs, tender notices, or metro circulars..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-8 py-2.5 text-xs md:text-sm bg-transparent text-white placeholder-slate-400 focus:outline-hidden"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      executeSearch('', categoryFilter);
                    }}
                    className="absolute right-2 text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Search Documents'}</span>
              </button>
            </div>
          </form>

          {/* Quick Suggested Queries */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-300">
            <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Tag className="w-3 h-3 text-teal-400" /> Suggested:
            </span>
            {suggestedQueries.map((item) => (
              <button
                key={item}
                onClick={() => handleQuickSuggestion(item)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-[11px] text-slate-200 border border-white/10 transition-colors cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>

        </div>

        {/* Subtle Background Glow Accent */}
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        <span className="text-xs font-bold text-slate-500 flex items-center gap-1 shrink-0">
          <Filter className="w-3.5 h-3.5 text-teal-700" /> Category:
        </span>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setCategoryFilter(cat);
              executeSearch(searchQuery, cat);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              categoryFilter === cat
                ? 'bg-teal-700 text-white shadow-2xs font-bold'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 uppercase tracking-wider px-1">
          <span>
            {searchQuery ? `Matching Documents (${results.length} Found)` : `Official KMRL Document Repository (${results.length} Indexed)`}
          </span>
          <span className="text-teal-700 font-semibold normal-case text-xs">
            {categoryFilter !== 'All' ? `Filtered by: ${categoryFilter}` : 'All KMRL Departments'}
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl text-xs text-slate-500 space-y-2">
            <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p>Searching official KMRL documents...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800">No Documents Matched Your Query</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try searching with broader terms such as <span className="font-semibold text-teal-700">"leave"</span>, <span className="font-semibold text-teal-700">"signalling"</span>, or select <span className="font-semibold text-teal-700">"All"</span> from the category filter.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.map((res, idx) => {
              const matchedDoc = documents.find((d) => d.id === res.docId) || {
                id: res.docId,
                title: res.docTitle,
                category: res.category,
                uploadedBy: res.uploadedBy || 'KMRL Administration',
                uploadedByRole: 'Admin',
                uploadDate: res.uploadDate || '2026-08-12',
                extractedText: res.snippet,
                status: 'Approved',
                filename: `${res.docTitle.replace(/\s+/g, '_')}.pdf`,
              };

              const relevancePercent = Math.round((res.score || 0.95) * 100);

              return (
                <div
                  key={idx}
                  className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md hover:border-teal-500 transition-all flex flex-col justify-between space-y-3"
                >
                  <div className="space-y-2">
                    {/* Card Header Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-teal-50 text-teal-800 border border-teal-200 rounded-md text-[10px] font-bold">
                        {res.category}
                      </span>
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-extrabold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {relevancePercent}% Match
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug">
                      {res.docTitle}
                    </h3>

                    {/* Excerpt with Highlighted Matching Terms */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 leading-relaxed font-sans line-clamp-3">
                      {highlightMatch(res.snippet, searchQuery)}
                    </div>
                  </div>

                  {/* Card Footer Meta & Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <div className="text-[11px] text-slate-400">
                      <span>By <strong>{matchedDoc.uploadedBy}</strong></span>
                      {matchedDoc.uploadDate && <span> • {matchedDoc.uploadDate}</span>}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDoc(matchedDoc as DocumentItem)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Read Policy</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* EXECUTIVE FULL DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8 space-y-0">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" />
                <div>
                  <h3 className="font-bold text-base">{previewDoc.title}</h3>
                  <span className="text-[11px] text-slate-400">{previewDoc.category} • Official Circular</span>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Author</span>
                  <p className="font-bold text-slate-800">{previewDoc.uploadedBy}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Date Indexed</span>
                  <p className="font-bold text-slate-800">{previewDoc.uploadDate}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Verification</span>
                  <p className="font-bold text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Validated Policy
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Official Policy & Standard Text</label>
                <div className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                  {previewDoc.extractedText}
                </div>
              </div>

              {/* Modal Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(previewDoc.extractedText)}`}
                  download={previewDoc.filename || 'KMRL_Document.txt'}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>Download Document</span>
                </a>

                <button
                  onClick={() => setPreviewDoc(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
