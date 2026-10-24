import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  UserRole 
} from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Search, 
  FileText, 
  BookOpen, 
  HelpCircle,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Layers,
  ExternalLink,
  X,
  ShieldCheck
} from 'lucide-react';

interface AIChatbotViewProps {
  userRole: UserRole;
  userName: string;
}

export const AIChatbotView: React.FC<AIChatbotViewProps> = ({ userRole, userName }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      text: `Hello ${userName}! I am the **KMRL Staff Assistant**.

I can assist you with:
- 📄 **Company Policies & Rules:** e.g., *"How many casual leaves can an employee take?"*
- 💡 **Requests & Procedures:** e.g., *"How do I apply for leave?"*
- ⚡ **Live Status & Records:** e.g., *"Show pending leave applications"* or *"How many documents are approved?"*
- 📋 **Staff Guidelines:** e.g., *"What is the medical leave rule?"*`,
      timestamp: '09:00 AM',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedFlows, setExpandedFlows] = useState<Record<string, boolean>>({});
  const [activeCitation, setActiveCitation] = useState<{ docTitle: string; snippet: string; docId?: string; score?: number } | null>(null);

  const toggleFlow = (msgId: string) => {
    setExpandedFlows((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Suggested Prompts across categories (Role-aware)
  const promptSuggestions = userRole === 'Employee' 
    ? [
        'How do I apply for leave?',
        'How many leaves do I have left?',
        'How many casual leaves can a KMRL employee take?',
        "Show Tanisha's pending leave request",
        'What is the maternity leave policy?',
        'Why is my document still pending?',
        'What is the medical certificate rule for sick leave?',
      ]
    : [
        'Show all pending leave requests',
        'How to approve or review leave requests?',
        'How many documents are there?',
        'What is the casual leave policy?',
        'What is the maternity leave policy?',
        'List all employees in the system',
        'Show recent HR circulars',
      ];

  // Send Message Handler
  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsgId = `user-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('kmrl_token') : null;
      let storedUser: any = {};
      try {
        const storedUserStr = typeof window !== 'undefined' ? localStorage.getItem('kmrl_user') : null;
        if (storedUserStr) storedUser = JSON.parse(storedUserStr);
      } catch {}

      const authHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
        'x-user-role': userRole || storedUser.role || 'Employee',
        'x-user-name': userName || storedUser.name || 'KMRL Staff',
        'x-user-id': storedUser.id || '',
        'x-user-email': storedUser.email || '',
      };
      if (token) {
        authHeaders['authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: authHeaders,
        credentials: 'include',
        body: JSON.stringify({
          query: textToSend,
          userRole: userRole || storedUser.role || 'Employee',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || `HTTP ${res.status}`);
      }

      const responseText = data.responseText || data.message || 'I am available to assist you with KMRL document queries and leave policies.';

      const aiMsgId = `ai-${Date.now()}`;
      const aiMsg: ChatMessage = {
        id: aiMsgId,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources,
        selectedAgent: data.selectedAgent,
        agentFlow: data.agentFlow,
        mcpExecutions: data.mcpExecutions,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Apologies, the KMRL AI Assistant encountered an issue: ${err.message || 'Connection error'}. Please try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto space-y-4 h-[calc(100vh-5rem)] flex flex-col">
      
      {/* Clean Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">KMRL Helpdesk & Policy Assistant</h2>
            <p className="text-xs text-slate-500">Official Staff Support & Document Assistant • Kochi Metro Rail Limited</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-teal-800 bg-teal-50 border border-teal-200 rounded-full shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
            Google Gemini MCP Online
          </span>
        </div>
      </div>

      {/* Main Chat Stream Container */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 md:p-6 overflow-y-auto space-y-4 shadow-xs">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}>
              
              {/* Message Header */}
              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <span className="font-bold text-slate-700">{isUser ? userName : 'KMRL Assistant'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-2xl rounded-2xl p-4 text-xs md:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-teal-700 text-white font-medium rounded-tr-none shadow-xs'
                    : 'bg-slate-50 text-slate-900 border border-slate-200 rounded-tl-none shadow-xs'
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap font-sans text-xs md:text-sm space-y-2">
                  {msg.text}
                </div>

                {/* Multi-Agent Reasoning Trace Collapsible */}
                {!isUser && msg.agentFlow && msg.agentFlow.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/80">
                    <button
                      type="button"
                      onClick={() => toggleFlow(msg.id)}
                      className="w-full flex items-center justify-between text-[11px] font-bold text-teal-700 hover:text-teal-800 transition-colors cursor-pointer py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-teal-600" />
                        <span>Steps Taken ({msg.agentFlow.length} steps)</span>
                      </span>
                      {expandedFlows[msg.id] ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>

                    {expandedFlows[msg.id] && (
                      <div className="mt-2 space-y-2 pl-2 border-l-2 border-teal-500/50">
                        {msg.agentFlow.map((step, sIdx) => (
                          <div key={sIdx} className="bg-white border border-slate-200 rounded-xl p-2.5 text-[11px] space-y-1 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-teal-600"></span>
                                {step.agentName}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">{step.timestamp}</span>
                            </div>
                            <div className="text-slate-600 italic">
                              "{step.thought}"
                            </div>
                            {step.output && (
                              <div className="p-1.5 bg-slate-900 text-teal-300 font-mono text-[10px] rounded-lg break-all">
                                {step.output.length > 180 ? `${step.output.substring(0, 180)}…` : step.output}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Inline RAG Source Badges */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200 space-y-1.5">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                      <BookOpen className="w-3 h-3 text-teal-700" /> Referenced Documents:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.sources.map((src, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setActiveCitation(src)}
                          className="px-2.5 py-1 bg-white hover:bg-teal-50 border border-slate-200 hover:border-teal-300 rounded-lg text-[10px] font-semibold text-slate-700 hover:text-teal-800 shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
                        >
                          <FileText className="w-3.5 h-3.5 text-teal-700" />
                          <span>{src.docTitle}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gemini MCP Protocol Badge */}
                {!isUser && msg.mcpExecutions && msg.mcpExecutions.some((m) => m.server === 'gemini') && (
                  <div className="mt-2.5 pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-teal-800 font-semibold bg-teal-50/60 px-2.5 py-1 rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                      <span>Synthesized via Google Gemini MCP Engine</span>
                    </span>
                    <span className="text-[10px] text-teal-600 font-mono">gemini-2.5-flash</span>
                  </div>
                )}
              </div>

            </div>
          );
        })}

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-2xl w-fit text-xs text-slate-600 animate-pulse">
            <Sparkles className="w-4 h-4 text-teal-600 animate-spin" />
            <span>Consulting KMRL knowledge base and formulating answer...</span>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Suggested:</span>
        {promptSuggestions.map((s, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(s)}
            className="px-3 py-1.5 bg-white hover:bg-teal-50 text-slate-700 hover:text-teal-800 border border-slate-200 rounded-xl text-xs whitespace-nowrap font-medium transition-colors cursor-pointer shrink-0 shadow-2xs"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white p-2 border border-slate-200 rounded-2xl shadow-xs shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a question about KMRL policies, portal help, or leave requests..."
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-teal-600 focus:bg-white"
        />

        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="p-3 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>

      {/* Citation Preview Modal */}
      {activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{activeCitation.docTitle}</h3>
                  <span className="text-[11px] text-slate-400">Official KMRL Policy Document Reference</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cited Policy Clause & Context:</span>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono whitespace-pre-wrap max-h-60 overflow-y-auto leading-relaxed">
                {activeCitation.snippet}
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <span className="text-[11px] text-teal-700 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> pgvector Match
              </span>
              <button
                type="button"
                onClick={() => setActiveCitation(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Close Citation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
