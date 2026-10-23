import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Link2, 
  RefreshCw, 
  FileCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  History, 
  RotateCcw, 
  ExternalLink,
  Search,
  Key,
  Layers,
  FileText
} from 'lucide-react';
import { UserRole } from '../types';

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

interface BlockchainAuditResult {
  isChainValid: boolean;
  totalBlocks: number;
  blocks: BlockchainBlock[];
  invalidBlockIndices: number[];
  errors: string[];
}

interface BlockchainLedgerViewProps {
  userRole: UserRole;
  currentUserName: string;
}

export const BlockchainLedgerView: React.FC<BlockchainLedgerViewProps> = ({ userRole, currentUserName }) => {
  const [blocks, setBlocks] = useState<BlockchainBlock[]>([]);
  const [auditResult, setAuditResult] = useState<BlockchainAuditResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [auditing, setAuditing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<BlockchainBlock | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error' | 'warning'; text: string } | null>(null);

  // Fetch full ledger & audit
  const fetchLedger = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blockchain/ledger');
      if (res.ok) {
        const data = await res.json();
        setBlocks(data.blocks || []);
        setAuditResult(data.audit || null);
      }
    } catch (err) {
      console.error('Failed to load blockchain ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedger();
  }, []);

  // Trigger full cryptographic chain audit
  const handleAuditChain = async () => {
    setAuditing(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/blockchain/audit-chain', { method: 'POST' });
      if (res.ok) {
        const audit = await res.json();
        setAuditResult(audit);
        setBlocks(audit.blocks || []);
        setActionMessage({
          type: audit.isChainValid ? 'success' : 'error',
          text: audit.isChainValid 
            ? `Cryptographic proof audit complete: All ${audit.totalBlocks} blocks are cryptographically valid and untampered.`
            : `Audit Warning: Tamper detected in block indices: ${audit.invalidBlockIndices.join(', ')}`,
        });
      }
    } catch (err) {
      setActionMessage({ type: 'error', text: 'Failed to complete cryptographic audit.' });
    } finally {
      setAuditing(false);
    }
  };

  // Simulate Tampering for Demonstration
  const handleSimulateTamper = async (docId: string) => {
    setActionLoading(`tamper-${docId}`);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/blockchain/simulate-tamper/${docId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'warning',
          text: `Tamper payload injected into document ${docId}. Blockchain integrity check failed as expected (SHA-256 hash mismatch).`,
        });
        await fetchLedger();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to trigger tamper simulation.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  // Restore Genuine File from Blockchain Anchor
  const handleRestoreFile = async (docId: string) => {
    setActionLoading(`restore-${docId}`);
    setActionMessage(null);
    try {
      const res = await fetch(`/api/blockchain/restore/${docId}`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setActionMessage({
          type: 'success',
          text: `Genuine file restored for document ${docId}. Cryptographic proof matches blockchain root anchor.`,
        });
        await fetchLedger();
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Failed to restore document.' });
      }
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Network error' });
    } finally {
      setActionLoading(null);
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      b.documentTitle.toLowerCase().includes(q) ||
      b.documentId.toLowerCase().includes(q) ||
      b.blockHash.toLowerCase().includes(q) ||
      b.fileHash.toLowerCase().includes(q)
    );
  });

  const isChainHealthy = auditResult ? auditResult.isChainValid : true;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">KMRL Document Blockchain Ledger</h2>
                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-md uppercase">
                  Zero-Trust Immutability
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Cryptographic SHA-256 block-anchored proof ledger for legal, tender, and operational SOP compliance
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAuditChain}
            disabled={auditing}
            className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${auditing ? 'animate-spin' : ''}`} />
            <span>{auditing ? 'Verifying Proof Chain…' : 'Audit Proof Chain'}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Message */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-3 border shadow-xs animate-fade-in ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : actionMessage.type === 'warning'
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : actionMessage.type === 'warning' ? (
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          )}
          <span className="flex-1">{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">✕</button>
        </div>
      )}

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Metric 1: Total Blocks */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Ledger Blocks</span>
            <Layers className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{blocks.length}</div>
          <div className="text-[11px] text-slate-400 mt-1">Starting from Genesis Block #0</div>
        </div>

        {/* Metric 2: Integrity Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Ledger Cryptography</span>
            <Lock className="w-4 h-4 text-teal-600" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-slate-900">
              {isChainHealthy ? '100% Sealed' : 'Tamper Detected'}
            </span>
          </div>
          <div className="text-[11px] flex items-center gap-1.5 mt-1">
            <span className={`w-2 h-2 rounded-full ${isChainHealthy ? 'bg-emerald-500' : 'bg-rose-500 animate-ping'}`} />
            <span className={isChainHealthy ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-bold'}>
              {isChainHealthy ? 'Continuous Hash Validity' : 'Broken Chain Linkage'}
            </span>
          </div>
        </div>

        {/* Metric 3: Root Authority */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Validator Authority</span>
            <Cpu className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-sm font-bold text-slate-900 truncate">KMRL Authority Node 0</div>
          <div className="text-[11px] text-slate-400 mt-1">HMAC-SHA256 Digital Signatures</div>
        </div>

        {/* Metric 4: Hash Algorithm */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Hashing Standard</span>
            <Key className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-sm font-mono font-bold text-slate-900">SHA-256 (256-bit)</div>
          <div className="text-[11px] text-slate-400 mt-1">NIST FIPS 180-4 Approved</div>
        </div>

      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 border border-slate-200 rounded-2xl shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search block by document title, ID, or SHA-256 hash…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-600"
          />
        </div>
        <div className="text-xs text-slate-500 px-2 font-medium">
          Showing <strong>{filteredBlocks.length}</strong> of <strong>{blocks.length}</strong> blocks
        </div>
      </div>

      {/* Block Chain Grid / Timeline */}
      <div className="space-y-4">
        {loading ? (
          <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600 mb-2" />
            <p className="text-xs font-medium">Loading blockchain ledger from disk…</p>
          </div>
        ) : filteredBlocks.length === 0 ? (
          <div className="p-12 text-center text-slate-500 bg-white border border-slate-200 rounded-2xl">
            <p className="text-xs">No ledger blocks match your query.</p>
          </div>
        ) : (
          filteredBlocks.map((block, index) => {
            const isGenesis = block.blockNumber === 0;
            const isTampered = block.status === 'TAMPERED';

            return (
              <div
                key={block.blockNumber}
                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all ${
                  isTampered 
                    ? 'border-rose-400 bg-rose-50/30' 
                    : isGenesis 
                    ? 'border-teal-500/60 bg-teal-50/20' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Block Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border ${
                      isGenesis 
                        ? 'bg-teal-700 text-white border-teal-800' 
                        : isTampered 
                        ? 'bg-rose-700 text-white border-rose-800' 
                        : 'bg-slate-900 text-white border-slate-950'
                    }`}>
                      BLOCK #{block.blockNumber} {isGenesis && '(GENESIS ROOT)'}
                    </span>

                    <h3 className="font-bold text-slate-900 text-sm">{block.documentTitle}</h3>
                    <span className="text-xs font-mono text-slate-400">({block.documentId})</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-full flex items-center gap-1.5 border ${
                      isTampered
                        ? 'bg-rose-100 text-rose-700 border-rose-300'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}>
                      {isTampered ? (
                        <>
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>TAMPER DETECTED</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>CRYPTOGRAPHICALLY VERIFIED</span>
                        </>
                      )}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(block.timestamp).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Hashes & Cryptographic Proofs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 py-3 text-xs">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Current Block Hash:</span>
                    <div className="p-2 bg-slate-900 text-teal-400 rounded-xl font-mono text-[11px] break-all select-all">
                      {block.blockHash}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Previous Block Hash (Link):</span>
                    <div className="p-2 bg-slate-100 text-slate-700 rounded-xl font-mono text-[11px] break-all select-all">
                      {block.previousBlockHash}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">File Payload SHA-256 Hash:</span>
                    <div className="p-2 bg-slate-50 text-slate-800 rounded-xl font-mono text-[11px] break-all select-all border border-slate-200">
                      {block.fileHash}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Authority Signature:</span>
                    <div className="p-2 bg-slate-50 text-slate-600 rounded-xl font-mono text-[11px] break-all select-all border border-slate-200">
                      {block.signature.substring(0, 48)}…
                    </div>
                  </div>
                </div>

                {/* Interactive Proof Verification & Demo Simulation Tools */}
                {!isGenesis && (userRole === 'Admin' || userRole === 'HR') && (
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="text-[11px] text-slate-400">
                      Validator: <strong className="text-slate-600">{block.validator}</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTampered ? (
                        <button
                          onClick={() => handleRestoreFile(block.documentId)}
                          disabled={actionLoading !== null}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore Untampered File</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSimulateTamper(block.documentId)}
                          disabled={actionLoading !== null}
                          className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-semibold text-xs rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                          title="Simulate unauthorized content modification to demonstrate tamper detection"
                        >
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Simulate Tamper</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
