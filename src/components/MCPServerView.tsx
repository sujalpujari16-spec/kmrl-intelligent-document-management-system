import React, { useState, useEffect } from 'react';
import { Database, FolderTree, Terminal, Play, RefreshCw, CheckCircle2, AlertCircle, Cpu, Layers } from 'lucide-react';

interface MCPLog {
  id: string;
  server: 'postgres' | 'filesystem';
  tool: string;
  input: any;
  result: any;
  timestamp: string;
}

export function MCPServerView() {
  const [activeServer, setActiveServer] = useState<'postgres' | 'filesystem'>('postgres');
  const [selectedTool, setSelectedTool] = useState<string>('query_table');
  const [queryInput, setQueryInput] = useState<string>('Documents');
  const [filterField, setFilterField] = useState<string>('');
  const [filterValue, setFilterValue] = useState<string>('');
  
  const [executing, setExecuting] = useState(false);
  const [toolResult, setToolResult] = useState<any>(null);
  const [mcpLogs, setMcpLogs] = useState<MCPLog[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/mcp/logs');
      if (res.ok) {
        const data = await res.json();
        setMcpLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch MCP logs:', err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleRunMCPTool = async () => {
    setExecuting(true);
    setErrorMsg(null);
    setToolResult(null);

    try {
      const endpoint = activeServer === 'postgres' ? '/api/mcp/postgres' : '/api/mcp/filesystem';
      let args: any = {};

      if (activeServer === 'postgres') {
        if (selectedTool === 'get_schema') {
          args = {};
        } else if (selectedTool === 'query_table') {
          args = {
            tableName: queryInput || 'Documents',
            filterField: filterField || undefined,
            filterValue: filterValue || undefined,
            limit: 10,
          };
        } else if (selectedTool === 'insert_record') {
          args = {
            targetTable: 'Documents',
            recordData: {
              title: queryInput || 'MCP Test Form',
              category: 'Leave Policies',
              uploadedBy: 'MCP Server Agent',
              uploadedByRole: 'Admin',
              fileType: 'pdf',
              extractedText: 'Inserted via MCP Protocol execution',
            },
          };
        }
      } else {
        if (selectedTool === 'list_directory') {
          args = { path: queryInput || '/kmrl/documents' };
        } else if (selectedTool === 'read_file') {
          args = { fileName: queryInput || 'KMRL_Leave_Policy_2026.pdf' };
        } else if (selectedTool === 'get_file_info') {
          args = { targetId: queryInput || 'doc-1' };
        }
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tool: selectedTool,
          arguments: args,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setToolResult(data.result);
      } else {
        setErrorMsg(data.error || 'MCP tool execution failed.');
      }
      await fetchLogs();
    } catch (err: any) {
      setErrorMsg(err.message || 'Execution error');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-emerald-100 rounded-xl text-emerald-800">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              Model Context Protocol (MCP) Server Portal
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                LIVE MCP Standard v1.0
              </span>
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Active Server Connections: Postgres MCP Server (Relational DB) & Filesystem MCP Server (Document Storage)
            </p>
          </div>
        </div>
        <button
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-xl transition"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh Protocol Status
        </button>
      </div>

      {/* Main Grid: Tool Tester & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Panel: Tool Invocation Console */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Terminal className="w-5 h-5 text-teal-700" />
            MCP Tool Invocation Sandbox
          </h2>

          {/* Server Selector Tabs */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => {
                setActiveServer('postgres');
                setSelectedTool('query_table');
                setQueryInput('Documents');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition ${
                activeServer === 'postgres'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Database className="w-4 h-4" />
              Postgres MCP Server
            </button>
            <button
              onClick={() => {
                setActiveServer('filesystem');
                setSelectedTool('list_directory');
                setQueryInput('/kmrl/documents');
              }}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg transition ${
                activeServer === 'filesystem'
                  ? 'bg-white text-teal-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FolderTree className="w-4 h-4" />
              Filesystem MCP Server
            </button>
          </div>

          {/* Tool Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Select Protocol Tool
            </label>
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            >
              {activeServer === 'postgres' ? (
                <>
                  <option value="query_table">mcp::postgres::query_table (Query Relational Collection)</option>
                  <option value="get_schema">mcp::postgres::get_schema (Inspect Database Tables)</option>
                  <option value="insert_record">mcp::postgres::insert_record (Insert Structured Document Record)</option>
                </>
              ) : (
                <>
                  <option value="list_directory">mcp::filesystem::list_directory (Explore Repository Tree)</option>
                  <option value="read_file">mcp::filesystem::read_file (Read OCR Document Data)</option>
                  <option value="get_file_info">mcp::filesystem::get_file_info (Inspect File Metadata & Versions)</option>
                </>
              )}
            </select>
          </div>

          {/* Dynamic Arguments Input */}
          <div className="space-y-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase text-slate-500 tracking-wider">Tool Arguments (JSON Schema)</h3>
            
            {activeServer === 'postgres' && selectedTool === 'query_table' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Table Name</label>
                  <select
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                  >
                    <option value="Documents">Documents</option>
                    <option value="Users">Users</option>
                    <option value="AuditLogs">AuditLogs</option>
                    <option value="Notifications">Notifications</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Filter Field (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. status or category"
                      value={filterField}
                      onChange={(e) => setFilterField(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">Filter Value (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Approved or Leave Policies"
                      value={filterValue}
                      onChange={(e) => setFilterValue(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeServer === 'postgres' && selectedTool === 'get_schema' && (
              <p className="text-sm text-slate-600">No input arguments required. Fetches relational schema for PostgreSQL cluster.</p>
            )}

            {activeServer === 'postgres' && selectedTool === 'insert_record' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Document Form Title</label>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="e.g. Metro Depot Attendance Reconciled Circular"
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800"
                />
              </div>
            )}

            {activeServer === 'filesystem' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {selectedTool === 'list_directory' ? 'Directory Path' : selectedTool === 'read_file' ? 'File Name / Identifier' : 'File Target ID'}
                </label>
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-mono"
                />
              </div>
            )}

            <button
              onClick={handleRunMCPTool}
              disabled={executing}
              className="w-full py-3 bg-teal-800 hover:bg-teal-900 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {executing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Executing MCP Tool Call...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  Execute MCP Tool Request
                </>
              )}
            </button>
          </div>

          {/* Results Output */}
          {errorMsg && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-3 text-sm">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {toolResult && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-600 uppercase tracking-wider">
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  MCP Protocol Response Data
                </span>
                <span className="font-mono text-slate-400">JSON Output</span>
              </div>
              <pre className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto max-h-72 border border-slate-800">
                {JSON.stringify(toolResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Right Panel: MCP Execution Audit Log */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-xs border border-slate-200 space-y-4 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-700" />
              MCP Protocol Audit Stream
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md">
              {mcpLogs.length} Events
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[550px] pr-1">
            {mcpLogs.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No MCP tool calls executed yet. Try invoking a tool above.
              </div>
            ) : (
              mcpLogs.map((log) => (
                <div key={log.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-md ${
                      log.server === 'postgres' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {log.server.toUpperCase()} MCP
                    </span>
                    <span className="text-xs font-mono text-slate-400">{log.timestamp.substring(11, 19)}</span>
                  </div>
                  
                  <div className="text-sm font-semibold text-slate-900 font-mono">
                    tool: {log.tool}
                  </div>

                  <div className="text-xs text-slate-600 font-mono truncate bg-white p-2 rounded-lg border border-slate-200">
                    args: {JSON.stringify(log.input)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
