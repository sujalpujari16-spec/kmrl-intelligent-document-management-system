import { SupabaseDBService } from './dbService';
import { UserRole } from '../src/types';

export interface MCPToolCallRequest {
  server: 'postgres' | 'filesystem' | 'gemini';
  tool: string;
  arguments: Record<string, any>;
  userRole?: UserRole;
  userId?: string;
}

export interface MCPToolResponse {
  success: boolean;
  server: 'postgres' | 'filesystem' | 'gemini';
  tool: string;
  result: any;
  error?: string;
  timestamp: string;
}

// 1. Strict MCP Permission Matrix by User Role
const TOOL_PERMISSIONS: Record<string, UserRole[]> = {
  get_schema: ['Admin', 'HR'],
  get_document_count: ['Admin', 'HR'],
  search_documents: ['Admin', 'HR', 'Employee'],
  get_document_details: ['Admin', 'HR', 'Employee'],
  get_leave_balance: ['Admin', 'HR', 'Employee'],
  get_my_leave_requests: ['Admin', 'HR', 'Employee'],
  get_pending_approvals: ['Admin', 'HR'],
  get_employee_directory: ['Admin', 'HR'],
  get_statistics: ['Admin', 'HR'],
};

const FILESYSTEM_TOOL_PERMISSIONS: Record<string, UserRole[]> = {
  list_directory: ['Admin', 'HR'],
  read_file: ['Admin', 'HR', 'Employee'],
};

export function authorizeTool(tool: string, role: UserRole): boolean {
  const allowedRoles = TOOL_PERMISSIONS[tool];
  return Boolean(allowedRoles && allowedRoles.includes(role));
}

/**
 * Handle Postgres MCP Server Requests (Strict Permission Matrix + Scoped Queries)
 */
export async function handlePostgresMCP(
  tool: string,
  args: Record<string, any> = {},
  userRole: UserRole = 'Employee',
  userId?: string
): Promise<MCPToolResponse> {
  const timestamp = new Date().toISOString();

  // 1. Tool Permission Matrix Enforcement
  const allowedRoles = TOOL_PERMISSIONS[tool];
  if (!allowedRoles) {
    return {
      success: false,
      server: 'postgres',
      tool,
      result: null,
      error: `Security Violation: MCP tool '${tool}' is not registered in the Postgres tool allowlist.`,
      timestamp,
    };
  }

  if (!allowedRoles.includes(userRole)) {
    return {
      success: false,
      server: 'postgres',
      tool,
      result: null,
      error: `Access Denied: Role '${userRole}' is not authorized to execute tool '${tool}'. Required: [${allowedRoles.join(', ')}].`,
      timestamp,
    };
  }

  try {
    let result: any = null;

    switch (tool) {
      case 'get_schema':
        result = {
          database: 'Supabase PostgreSQL (KMRL Enterprise Cluster)',
          version: 'PostgreSQL 16.2 with pgvector 0.7.0',
          tables: [
            { name: 'users', description: 'Employee, HR and Admin identity profiles', columns: ['id', 'employee_id', 'name', 'email', 'role', 'department', 'created_at'] },
            { name: 'leave_balances', description: 'Real-time employee leave quotas and balances', columns: ['id', 'employee_id', 'leave_type', 'total_days', 'used_days', 'remaining_days', 'year'] },
            { name: 'documents', description: 'Enterprise documents with metadata and approval lifecycle', columns: ['id', 'title', 'filename', 'category', 'status', 'uploaded_by', 'upload_date', 'file_size', 'version', 'storage_path'] },
            { name: 'document_chunks', description: 'pgvector embeddings (768-dim) for RAG semantic search', columns: ['id', 'document_id', 'chunk_text', 'embedding', 'section', 'category'] },
            { name: 'leave_applications', description: 'Staff leave submissions and approval workflows', columns: ['id', 'employee_id', 'leave_type', 'start_date', 'end_date', 'status', 'reviewed_by'] },
            { name: 'approvals', description: 'Review audit records for documents and circulars', columns: ['document_id', 'status', 'reviewed_by', 'remarks'] },
            { name: 'audit_logs', description: 'Immutable activity and access logs', columns: ['id', 'user_id', 'action', 'details', 'ip_address', 'created_at'] },
          ],
        };
        break;

      case 'get_document_count': {
        const { category } = args;
        const allDocs = await SupabaseDBService.getDocuments(userRole, userId);
        const total = allDocs.length;
        const filtered = category && category !== 'All' ? allDocs.filter((d) => d.category === category).length : total;

        result = {
          totalDocuments: filtered,
          allCategoriesTotal: total,
          pendingApprovalCount: allDocs.filter((d) => d.status === 'Pending Approval').length,
          approvedCount: allDocs.filter((d) => d.status === 'Approved').length,
          rejectedCount: allDocs.filter((d) => d.status === 'Rejected').length,
          categories: {
            'Leave Policies': allDocs.filter((d) => d.category === 'Leave Policies').length,
            'HR Circulars': allDocs.filter((d) => d.category === 'HR Circulars').length,
            'Attendance & Shifts': allDocs.filter((d) => d.category === 'Attendance & Shifts').length,
            'Procurement & Tenders': allDocs.filter((d) => d.category === 'Procurement & Tenders').length,
            'Metro Operations': allDocs.filter((d) => d.category === 'Metro Operations').length,
            'General Policies': allDocs.filter((d) => d.category === 'General Policies').length,
          },
        };
        break;
      }

      case 'search_documents': {
        const { query, category, status } = args;
        let docs = await SupabaseDBService.getDocuments(userRole, userId);
        if (status) {
          docs = docs.filter((d) => d.status === status);
        }
        if (category && category !== 'All') {
          docs = docs.filter((d) => d.category === category);
        }
        if (query) {
          const q = query.toLowerCase();
          docs = docs.filter((d) => d.title.toLowerCase().includes(q) || d.extractedText.toLowerCase().includes(q));
        }
        result = docs.slice(0, 20).map((d) => ({
          id: d.id,
          title: d.title,
          category: d.category,
          status: d.status,
          uploadedBy: d.uploadedBy,
          uploadDate: d.uploadDate,
          fileSize: d.fileSize,
        }));
        break;
      }

      case 'get_document_details': {
        const { documentId } = args;
        // User Scoped: Employee can only see approved or documents they uploaded
        const docs = await SupabaseDBService.getDocuments(userRole, userId);
        const doc = docs.find((d) => d.id === documentId);
        if (!doc) {
          throw new Error(`Document '${documentId}' not found or access is restricted.`);
        }
        result = {
          id: doc.id,
          title: doc.title,
          category: doc.category,
          status: doc.status,
          uploadedBy: doc.uploadedBy,
          uploadDate: doc.uploadDate,
          fileSize: doc.fileSize,
          version: doc.version,
          approvedBy: doc.approvedBy,
          approvalDate: doc.approvalDate,
          approvalNotes: doc.approvalNotes,
          snippet: doc.extractedText ? doc.extractedText.substring(0, 300) + '...' : '',
        };
        break;
      }

      case 'get_leave_balance': {
        const targetUserId = userRole === 'Employee' ? userId : (args.employeeId || userId);
        if (!targetUserId) {
          throw new Error('Employee identifier is required to query leave balance.');
        }

        const balances = await SupabaseDBService.getLeaveBalances(targetUserId);
        const myLeaves = await SupabaseDBService.getLeaveApplications(userRole, targetUserId);
        const lastLeave = myLeaves.find((l) => l.status === 'Approved');

        if (balances.length === 0) {
          result = {
            employeeId: targetUserId,
            balances: [],
            message: 'No leave balances configured for this employee in the current year.',
            lastLeaveTaken: lastLeave ? `${lastLeave.startDate} to ${lastLeave.endDate} (${lastLeave.leaveType})` : 'None',
          };
        } else {
          result = {
            employeeId: targetUserId,
            balances: balances.map((b) => ({
              type: b.leaveType,
              remaining: b.remainingDays,
              used: b.usedDays,
              total: b.totalDays,
              year: b.year,
            })),
            lastLeaveTaken: lastLeave ? `${lastLeave.startDate} to ${lastLeave.endDate} (${lastLeave.leaveType})` : 'None',
          };
        }
        break;
      }

      case 'get_my_leave_requests': {
        const targetId = userRole === 'Employee' ? userId : (args.employeeId || userId);
        if (!targetId) {
          throw new Error('Employee ID required');
        }
        const requests = await SupabaseDBService.getLeaveApplications(userRole, targetId);
        result = requests;
        break;
      }

      case 'get_pending_approvals': {
        const docs = await SupabaseDBService.getDocuments('Admin');
        const leaves = await SupabaseDBService.getLeaveApplications('Admin');
        result = {
          pendingDocuments: docs.filter((d) => d.status === 'Pending Approval'),
          pendingLeaves: leaves.filter((l) => l.status === 'Pending Approval'),
        };
        break;
      }

      case 'get_employee_directory': {
        const users = await SupabaseDBService.getUsers();
        result = users.map((u) => ({
          id: u.id,
          employeeId: u.employeeId,
          name: u.name,
          role: u.role,
          department: u.department,
          email: u.email,
        }));
        break;
      }

      case 'get_statistics': {
        result = await SupabaseDBService.getAnalytics();
        break;
      }

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    return { success: true, server: 'postgres', tool, result, timestamp };
  } catch (err: any) {
    return { success: false, server: 'postgres', tool, result: null, error: err.message, timestamp };
  }
}

/**
 * Handle Storage MCP Server Requests (Scoped Permissions)
 */
export async function handleFilesystemMCP(
  tool: string,
  args: Record<string, any> = {},
  userRole: UserRole = 'Employee',
  userId?: string
): Promise<MCPToolResponse> {
  const timestamp = new Date().toISOString();

  const allowedRoles = FILESYSTEM_TOOL_PERMISSIONS[tool];
  if (!allowedRoles || !allowedRoles.includes(userRole)) {
    return {
      success: false,
      server: 'filesystem',
      tool,
      result: null,
      error: `Access Denied: Role '${userRole}' is not authorized to execute filesystem tool '${tool}'.`,
      timestamp,
    };
  }

  try {
    let result: any = null;

    switch (tool) {
      case 'list_directory': {
        const docs = await SupabaseDBService.getDocuments(userRole, userId);
        result = {
          path: 'kmrl-storage/kmrl-documents',
          files: docs.map((d) => ({
            name: d.filename,
            id: d.id,
            title: d.title,
            size: d.fileSize,
            category: d.category,
            uploadedBy: d.uploadedBy,
            uploadDate: d.uploadDate,
            isScanned: d.isScanned,
          })),
          totalFiles: docs.length,
        };
        break;
      }

      case 'read_file': {
        const { fileId, fileName } = args;
        const docs = await SupabaseDBService.getDocuments(userRole, userId);
        const targetDoc = docs.find(
          (d) => d.id === fileId || d.filename === fileName || d.title.toLowerCase().includes((fileName || '').toLowerCase())
        );
        if (!targetDoc) {
          throw new Error(`File '${fileId || fileName}' not found or access restricted.`);
        }
        result = {
          fileId: targetDoc.id,
          title: targetDoc.title,
          filename: targetDoc.filename,
          category: targetDoc.category,
          content: targetDoc.extractedText,
          size: targetDoc.fileSize,
          version: targetDoc.version,
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${tool}`);
    }

    return { success: true, server: 'filesystem', tool, result, timestamp };
  } catch (err: any) {
    return { success: false, server: 'filesystem', tool, result: null, error: err.message, timestamp };
  }
}

// ==========================================
// 3. GEMINI MCP SERVER (Google Gemini Inference & Tool Protocol)
// ==========================================

const GEMINI_TOOL_PERMISSIONS: Record<string, UserRole[]> = {
  gemini_query: ['Admin', 'HR', 'Employee'],
  gemini_analyze_policy: ['Admin', 'HR', 'Employee'],
  gemini_verify_compliance: ['Admin', 'HR'],
  gemini_extract_insights: ['Admin', 'HR', 'Employee'],
};

/**
 * Direct Gemini API / OpenRouter Model Invocation
 */
export async function callGeminiModel(systemPrompt: string, userPrompt: string, maxTokens = 1200): Promise<string> {
  const geminiKey = process.env.GEMINI_API_KEY || '';
  const openrouterKey = process.env.OPENROUTER_API_KEY || '';

  // 1. Try OpenRouter with Google Gemini 2.5 Flash
  if (openrouterKey && openrouterKey.startsWith('sk-or-')) {
    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openrouterKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content && content.trim().length > 0) {
          return content.trim();
        }
      }
    } catch (err) {
      console.warn('[Gemini MCP OpenRouter Warning]:', err);
    }
  }

  // 2. Try Google GenAI SDK if valid direct key
  if (geminiKey && !geminiKey.includes('enterprise-gemini-key') && geminiKey.length > 20) {
    try {
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiKey });
      const resp: any = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
      });
      if (resp && resp.text) {
        return resp.text.trim();
      }
    } catch (err) {
      console.warn('[Gemini MCP Direct GenAI Warning]:', err);
    }
  }

  return '';
}

/**
 * Handle Gemini MCP Server Requests
 */
export async function handleGeminiMCP(
  tool: string,
  args: Record<string, any> = {},
  userRole: UserRole = 'Employee',
  userId?: string
): Promise<MCPToolResponse> {
  const timestamp = new Date().toISOString();

  const allowedRoles = GEMINI_TOOL_PERMISSIONS[tool];
  if (!allowedRoles || !allowedRoles.includes(userRole)) {
    return {
      success: false,
      server: 'gemini',
      tool,
      result: null,
      error: `Access Denied: Role '${userRole}' is not authorized to execute Gemini tool '${tool}'.`,
      timestamp,
    };
  }

  try {
    let result: any = null;

    switch (tool) {
      case 'gemini_query': {
        const { query, context = '', systemInstruction = '' } = args;
        const system = systemInstruction || `You are the official KMRL AI Policy & Document Assistant for Kochi Metro Rail Limited (KMRL IDMS).
Answer questions accurately based on verified KMRL rules, leave quotas, and enterprise data.
Provide polite, concise, and structured answers formatted in clean markdown with bullet points and bold highlights.`;

        const userText = `${context ? `VERIFIED KMRL DOCUMENTS / CONTEXT:\n${context}\n\n` : ''}STAFF QUESTION: ${query}`;
        const output = await callGeminiModel(system, userText, 1200);

        result = {
          model: 'google/gemini-2.5-flash',
          provider: 'Google Gemini MCP',
          answer: output,
          hasModelResponse: Boolean(output && output.length > 0),
        };
        break;
      }

      case 'gemini_analyze_policy': {
        const { policyText, topic } = args;
        const system = 'You are the KMRL Senior Legal & HR Policy Compliance Officer. Extract and summarize the exact entitlements, restrictions, quotas, and procedure for the requested topic.';
        const output = await callGeminiModel(system, `TOPIC: ${topic}\n\nPOLICY TEXT:\n${policyText}`, 1000);
        result = { analysis: output, topic };
        break;
      }

      case 'gemini_verify_compliance': {
        const { request, policyContext } = args;
        const system = 'You are the KMRL Administrative Compliance Evaluator. Check whether this employee leave or document request adheres to the specified KMRL regulations. Output compliance status (COMPLIANT or NON_COMPLIANT), reason, and recommendations.';
        const output = await callGeminiModel(system, `EMPLOYEE REQUEST:\n${request}\n\nREGULATIONS:\n${policyContext}`, 800);
        result = { complianceReport: output };
        break;
      }

      default:
        throw new Error(`Unknown Gemini MCP tool: ${tool}`);
    }

    return { success: true, server: 'gemini', tool, result, timestamp };
  } catch (err: any) {
    return { success: false, server: 'gemini', tool, result: null, error: err.message, timestamp };
  }
}

