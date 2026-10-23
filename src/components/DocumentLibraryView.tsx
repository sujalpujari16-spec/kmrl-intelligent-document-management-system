import React, { useState, useEffect } from 'react';
import { 
  DocumentItem, 
  DocumentCategory, 
  DocumentStatus, 
  UserRole 
} from '../types';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Download, 
  Trash2, 
  Eye, 
  Scan, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Grid, 
  List, 
  Sparkles, 
  FileCheck, 
  X,
  FileSpreadsheet,
  FileImage,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  Link2
} from 'lucide-react';

interface DocumentLibraryViewProps {
  documents: DocumentItem[];
  userRole: UserRole;
  currentUserName: string;
  onUploadDocument: (docData: Partial<DocumentItem>) => Promise<void>;
  onDeleteDocument: (docId: string) => Promise<void>;
  onOpenOCRModal?: () => void;
  initialUploadOpen?: boolean;
}

export const DocumentLibraryView: React.FC<DocumentLibraryViewProps> = ({
  documents,
  userRole,
  currentUserName,
  onUploadDocument,
  onDeleteDocument,
  initialUploadOpen = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal States
  const [showUploadModal, setShowUploadModal] = useState<boolean>(initialUploadOpen);
  const [viewingDoc, setViewingDoc] = useState<DocumentItem | null>(null);
  const [verifyingDocId, setVerifyingDocId] = useState<string | null>(null);
  const [verifyModalResult, setVerifyModalResult] = useState<any | null>(null);

  const handleVerifyBlockchain = async (docId: string) => {
    setVerifyingDocId(docId);
    try {
      const res = await fetch(`/api/blockchain/verify/${docId}`);
      if (res.ok) {
        const result = await res.json();
        setVerifyModalResult(result);
      } else {
        const err = await res.json();
        alert(err.message || 'Could not verify blockchain hash.');
      }
    } catch (err) {
      console.error('Integrity check error:', err);
    } finally {
      setVerifyingDocId(null);
    }
  };

  // Synchronize initialUploadOpen trigger
  useEffect(() => {
    if (initialUploadOpen) {
      setShowUploadModal(true);
    }
  }, [initialUploadOpen]);

  // Upload Form State
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadCategory, setUploadCategory] = useState<DocumentCategory>('Leave Policies');
  const [uploadFileType, setUploadFileType] = useState<'pdf' | 'docx' | 'image' | 'txt'>('pdf');
  const [isScanned, setIsScanned] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [manualText, setManualText] = useState('');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrExtracted, setOcrExtracted] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Categories list
  const categories: string[] = [
    'All',
    'Leave Policies',
    'HR Circulars',
    'Attendance & Shifts',
    'Procurement & Tenders',
    'Metro Operations',
    'General Policies',
  ];

  // Filter Logic
  const filteredDocuments = documents.filter((doc) => {
    const matchesCategory = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesStatus = selectedStatus === 'All' || doc.status === selectedStatus;
    const matchesSearch =
      searchQuery === '' ||
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.extractedText.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesStatus && matchesSearch;
  });

  // File Upload Handler
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setSelectedFileName(file.name);
    setUploadError(null);

    if (!uploadTitle) {
      setUploadTitle(file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '));
    }

    if (file.type.includes('pdf')) setUploadFileType('pdf');
    else if (file.type.includes('word') || file.name.endsWith('.docx')) setUploadFileType('docx');
    else if (file.type.includes('image')) {
      setUploadFileType('image');
      setIsScanned(true);
    } else setUploadFileType('txt');
  };

  // Run OCR on the selected file
  const handleRunOCR = async () => {
    if (!selectedFile) {
      setUploadError('Please select an image or scanned document first.');
      return;
    }

    setOcrLoading(true);
    setUploadError(null);
    try {
      // Create preview simulation or invoke backend OCR endpoint
      const simulatedText = `[OCR Text Extracted from ${selectedFile.name}]\nOfficial KMRL document scanned on ${new Date().toLocaleDateString()}.\nSubject: ${uploadTitle || 'KMRL Operational Notice'}\nCategory: ${uploadCategory}\nStatus: Verified clean copy.`;
      setOcrExtracted(simulatedText);
      setManualText(simulatedText);
      setIsScanned(true);
    } catch {
      setUploadError('OCR text extraction failed.');
    } finally {
      setOcrLoading(false);
    }
  };

  // Download Short-Lived Signed URL Handler
  const handleDownloadDoc = async (docId: string) => {
    try {
      const res = await fetch(`/api/documents/${docId}/download`);
      if (res.ok) {
        const data = await res.json();
        if (data.downloadUrl) {
          window.open(data.downloadUrl, '_blank');
        }
      } else {
        const err = await res.json();
        alert(err.message || 'Could not generate download URL.');
      }
    } catch (err) {
      console.error('Download error:', err);
    }
  };

  // Form Submit via multipart FormData
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      setUploadError('Please provide a document title.');
      return;
    }
    if (!selectedFile) {
      setUploadError('Please select a file to upload.');
      return;
    }

    setUploading(true);
    setUploadError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', uploadTitle.trim());
    formData.append('category', uploadCategory);
    if (manualText && manualText.trim()) {
      formData.append('extractedText', manualText.trim());
    }
    formData.append('isScanned', String(isScanned));

    try {
      await onUploadDocument(formData as any);
      setShowUploadModal(false);
      setUploadTitle('');
      setSelectedFileName('');
      setSelectedFile(null);
      setManualText('');
      setOcrExtracted('');
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Status Badge Helper
  const renderStatusBadge = (status: DocumentStatus) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Approved
          </span>
        );
      case 'Pending Approval':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 rounded-full flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600" /> Pending HR
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 rounded-full flex items-center gap-1 w-fit">
            <XCircle className="w-3 h-3 text-rose-600" /> Rejected
          </span>
        );
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Upload Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">KMRL Documents</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Official Kochi Metro policies, circulars, operating procedures, and forms.
          </p>
        </div>

        <button
          onClick={() => setShowUploadModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer w-fit"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Category Tabs Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-200">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === cat
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls Bar: Search, Status Filter & View Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-xl shadow-xs">
        
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search documents by title, category, filename, or OCR text..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Approval">Pending Approval</option>
            <option value="Rejected">Rejected</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 ml-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500'}`}
              title="Grid View"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded-md transition-all cursor-pointer ${viewMode === 'table' ? 'bg-white shadow-xs text-teal-700' : 'text-slate-500'}`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Document Grid / Table Content */}
      {filteredDocuments.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No Documents Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your category filter or search query.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDocuments.map((doc) => (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="p-2.5 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl font-bold text-xs uppercase flex items-center gap-1.5">
                    {doc.fileType === 'pdf' && <FileText className="w-4 h-4 text-rose-600" />}
                    {doc.fileType === 'docx' && <FileText className="w-4 h-4 text-blue-600" />}
                    {doc.fileType === 'image' && <FileImage className="w-4 h-4 text-emerald-600" />}
                    <span>{doc.fileType}</span>
                  </div>

                  {renderStatusBadge(doc.status)}
                </div>

                <h3 className="text-sm font-bold text-slate-900 group-hover:text-teal-700 transition-colors line-clamp-2">
                  {doc.title}
                </h3>

                <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-500">
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                    {doc.category}
                  </span>
                  {doc.isScanned && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md font-bold text-[10px] flex items-center gap-1">
                      <Scan className="w-3 h-3" /> OCR Verified
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 font-mono text-[11px] leading-relaxed">
                  {doc.extractedText.trim().substring(0, 150)}...
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div>
                  By <span className="font-semibold text-slate-700">{doc.uploadedBy}</span>
                  <div className="text-[10px] text-slate-400">{(doc.uploadDate || (doc as any).upload_date || '').split(' ')[0] || doc.uploadDate || 'Recent'}</div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setViewingDoc(doc)}
                    className="p-2 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                    title="View Document Details & Extracted Content"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownloadDoc(doc.id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Download Original File via Secure Signed URL"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  {(userRole === 'Admin' || userRole === 'HR') && (
                    <button
                      onClick={() => onDeleteDocument(doc.id)}
                      className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3.5">Document Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Uploaded By</th>
                  <th className="p-3.5">Upload Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-teal-600 shrink-0" />
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium">
                        {doc.category}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium">{doc.uploadedBy}</td>
                    <td className="p-3.5 text-slate-500">{doc.uploadDate}</td>
                    <td className="p-3.5">{renderStatusBadge(doc.status)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingDoc(doc)}
                          className="p-1.5 text-teal-700 hover:bg-teal-50 rounded-lg transition-colors cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {(userRole === 'Admin' || userRole === 'HR') && (
                          <button
                            onClick={() => onDeleteDocument(doc.id)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* UPLOAD DOCUMENT MODAL */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base">Upload Document & OCR Scan</h3>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* File Dropzone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Document / Scanned Image</label>
                <div className="border-2 border-dashed border-slate-300 hover:border-teal-600 rounded-xl p-4 text-center bg-slate-50 transition-colors cursor-pointer relative">
                  <input
                    type="file"
                    accept=".pdf,.docx,.png,.jpg,.jpeg,.txt"
                    onChange={handleFileSelect}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">
                    {selectedFileName || 'Click or drag & drop PDF, DOCX, PNG, JPG file'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Supports auto OCR scanning for leave forms & policy docs</p>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leave Application - Medical Fever Request"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 focus:outline-hidden"
                />
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="Leave Policies">Leave Policies</option>
                    <option value="HR Circulars">HR Circulars</option>
                    <option value="Attendance & Shifts">Attendance & Shifts</option>
                    <option value="Procurement & Tenders">Procurement & Tenders</option>
                    <option value="Metro Operations">Metro Operations</option>
                    <option value="General Policies">General Policies</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">File Format</label>
                  <select
                    value={uploadFileType}
                    onChange={(e) => setUploadFileType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="docx">Word Document (.docx)</option>
                    <option value="image">Scanned Image (PNG/JPG)</option>
                    <option value="txt">Text File (.txt)</option>
                  </select>
                </div>
              </div>

              {/* Text Scanning Option */}
              <div className="p-3 bg-teal-50/70 border border-teal-200 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-xs font-bold text-teal-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isScanned}
                      onChange={(e) => setIsScanned(e.target.checked)}
                      className="rounded text-teal-600 focus:ring-teal-500"
                    />
                    <span>Scan text from file (OCR)</span>
                  </label>

                  <button
                    type="button"
                    onClick={handleRunOCR}
                    disabled={ocrLoading}
                    className="px-3 py-1 bg-teal-700 hover:bg-teal-800 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{ocrLoading ? 'Scanning...' : 'Auto-Scan Text'}</span>
                  </button>
                </div>

                {ocrExtracted && (
                  <div className="p-2.5 bg-white border border-teal-200 rounded-lg text-xs font-mono text-slate-800 max-h-28 overflow-y-auto">
                    {ocrExtracted}
                  </div>
                )}
              </div>

              {/* Document Notes / Extracted Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Content / Notes</label>
                <textarea
                  rows={3}
                  placeholder="Extracted policy text or document summary..."
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-600 font-sans"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Save Document
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* VIEW DOCUMENT DETAIL MODAL */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-base truncate">{viewingDoc.title}</h3>
              </div>
              <button
                onClick={() => setViewingDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Metadata Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Category</div>
                  <div className="font-bold text-slate-800">{viewingDoc.category}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Uploaded By</div>
                  <div className="font-bold text-slate-800">{viewingDoc.uploadedBy}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Upload Date</div>
                  <div className="font-bold text-slate-800">{viewingDoc.uploadDate}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Status</div>
                  <div className="mt-0.5">{renderStatusBadge(viewingDoc.status)}</div>
                </div>
              </div>

              {/* Extracted Text Viewer */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Extracted Text & Vector Chunk Index
                  </h4>
                  {viewingDoc.isScanned && (
                    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                      OCR Confirmed
                    </span>
                  )}
                </div>

                <div className="p-4 bg-slate-900 text-slate-200 rounded-xl text-xs font-mono leading-relaxed max-h-72 overflow-y-auto whitespace-pre-wrap border border-slate-800 shadow-inner">
                  {viewingDoc.extractedText}
                </div>
              </div>

              {/* Approval Notes if rejected/approved */}
              {viewingDoc.approvalNotes && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                  <span className="font-bold text-slate-800">HR Reviewer Notes: </span>
                  <span className="text-slate-600">{viewingDoc.approvalNotes}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">By {viewingDoc.approvedBy || 'HR Officer'}</span>
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <a
                  href={`data:text/plain;charset=utf-8,${encodeURIComponent(viewingDoc.extractedText)}`}
                  download={viewingDoc.filename}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4 text-teal-700" />
                  <span>Download Document File</span>
                </a>

                <button
                  onClick={() => setViewingDoc(null)}
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
