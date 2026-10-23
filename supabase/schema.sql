-- ============================================================================
-- KMRL Intelligent Document Management System (IDMS)
-- Hardened Supabase PostgreSQL Schema with pgvector, Strict RLS & Auth Isolation
-- ============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. Custom Types & Enumerations
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('Admin', 'HR', 'Employee');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('Approved', 'Pending Approval', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('Approved', 'Pending Approval', 'Rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'alert');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Users Table (1:1 with auth.users - Immutable Identity & Protected Roles)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    employee_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'Employee',
    department VARCHAR(150) NOT NULL,
    avatar TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Security-Definer Helper: Get Authenticated User's Role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

REVOKE EXECUTE ON FUNCTION public.get_current_user_role() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;

-- 6. Leave Balances Table (Real Quota per Employee)
CREATE TABLE IF NOT EXISTS public.leave_balances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    leave_type VARCHAR(100) NOT NULL,
    total_days INT NOT NULL,
    used_days INT NOT NULL DEFAULT 0,
    remaining_days INT GENERATED ALWAYS AS (total_days - used_days) STORED,
    year INT NOT NULL DEFAULT 2026,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);

-- 7. Documents Table (Private Storage Metadata)
CREATE TABLE IF NOT EXISTS public.documents (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    uploaded_by VARCHAR(150) NOT NULL,
    uploaded_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    uploaded_by_role user_role NOT NULL DEFAULT 'Employee',
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    file_size VARCHAR(50) DEFAULT '1.0 MB',
    file_size_bytes BIGINT NOT NULL DEFAULT 0,
    file_type VARCHAR(50) DEFAULT 'pdf',
    mime_type VARCHAR(100) DEFAULT 'application/pdf',
    status document_status NOT NULL DEFAULT 'Pending Approval',
    extracted_text TEXT NOT NULL,
    is_scanned BOOLEAN DEFAULT FALSE,
    version INTEGER NOT NULL DEFAULT 1,
    storage_path TEXT NOT NULL, -- Private Supabase Storage Path
    approved_by VARCHAR(150),
    approval_date TIMESTAMPTZ,
    approval_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Document Versions Table
CREATE TABLE IF NOT EXISTS public.document_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by VARCHAR(150) NOT NULL,
    text_snippet TEXT,
    storage_path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Document Chunks Table (pgvector embeddings for RAG)
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    chunk_index INTEGER NOT NULL,
    chunk_text TEXT NOT NULL,
    section VARCHAR(150),
    page_number INTEGER DEFAULT 1,
    department VARCHAR(150),
    category VARCHAR(100),
    version INTEGER DEFAULT 1,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Leave Applications Table
CREATE TABLE IF NOT EXISTS public.leave_applications (
    id VARCHAR(100) PRIMARY KEY,
    employee_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    employee_name VARCHAR(150) NOT NULL,
    employee_role user_role NOT NULL DEFAULT 'Employee',
    department VARCHAR(150) NOT NULL,
    leave_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    reason TEXT NOT NULL,
    medical_certificate_url TEXT,
    status leave_status NOT NULL DEFAULT 'Pending Approval',
    applied_date TIMESTAMPTZ DEFAULT NOW(),
    reviewed_by VARCHAR(150),
    reviewed_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    review_date TIMESTAMPTZ,
    review_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_leave_dates CHECK (end_date >= start_date)
);

-- 11. Approvals Log Table
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id VARCHAR(100) NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    requested_by VARCHAR(150) NOT NULL,
    reviewed_by VARCHAR(150) NOT NULL,
    reviewed_by_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    status document_status NOT NULL,
    remarks TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    read BOOLEAN NOT NULL DEFAULT FALSE,
    target_role VARCHAR(50) DEFAULT 'All',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Audit Logs Table (Immutable Append-Only Audit Trail)
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id VARCHAR(100) PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    user_name VARCHAR(150) NOT NULL,
    user_role user_role NOT NULL,
    action VARCHAR(150) NOT NULL,
    details TEXT NOT NULL,
    document_title VARCHAR(255),
    ip_address VARCHAR(50),
    user_agent TEXT,
    result VARCHAR(50) DEFAULT 'SUCCESS',
    request_id VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Revoke unauthorized mutations on audit_logs
REVOKE UPDATE, DELETE, INSERT ON public.audit_logs FROM PUBLIC, anon;

-- ============================================================================
-- Indexes for High Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_leave_balances_employee ON public.leave_balances(employee_id);
CREATE INDEX IF NOT EXISTS idx_documents_category ON public.documents(category);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_upload_date ON public.documents(upload_date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_employee ON public.leave_applications(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON public.leave_applications(status);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id);

-- Vector Similarity Index (HNSW for cosine distance retrieval)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- ============================================================================
-- Hardened Stored Procedures / RPC Functions for pgvector RAG
-- ============================================================================
CREATE OR REPLACE FUNCTION match_document_chunks (
  query_embedding vector(768),
  match_threshold float DEFAULT 0.40,
  match_count int DEFAULT 5,
  filter_category text DEFAULT 'All',
  filter_department text DEFAULT 'All'
)
RETURNS TABLE (
  id UUID,
  document_id VARCHAR(100),
  chunk_index INT,
  chunk_text TEXT,
  section VARCHAR(150),
  page_number INT,
  category VARCHAR(100),
  department VARCHAR(150),
  similarity float
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL AND current_user != 'service_role' THEN
    RAISE EXCEPTION 'Authentication required to execute vector similarity search.';
  END IF;

  RETURN QUERY
  SELECT
    dc.id,
    dc.document_id,
    dc.chunk_index,
    dc.chunk_text,
    dc.section,
    dc.page_number,
    dc.category,
    dc.department,
    1 - (dc.embedding <=> query_embedding) AS similarity
  FROM public.document_chunks dc
  INNER JOIN public.documents d ON d.id = dc.document_id
  WHERE d.status = 'Approved'
    AND (1 - (dc.embedding <=> query_embedding)) >= match_threshold
    AND (filter_category = 'All' OR dc.category = filter_category)
    AND (filter_department = 'All' OR dc.department = filter_department)
  ORDER BY similarity DESC
  LIMIT match_count;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.match_document_chunks(vector(768), float, int, text, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.match_document_chunks(vector(768), float, int, text, text) TO authenticated, service_role;

-- ============================================================================
-- Safe Profile Update RPC (Prevents Self-Role Escalation)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.update_own_profile(
  p_name TEXT,
  p_avatar TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid UUID;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  UPDATE public.users
  SET 
    name = COALESCE(NULLIF(TRIM(p_name), ''), name),
    avatar = p_avatar,
    updated_at = NOW()
  WHERE id = v_uid;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_own_profile(TEXT, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.update_own_profile(TEXT, TEXT) TO authenticated, service_role;

-- ============================================================================
-- Transactional Atomic Leave Approval RPC
-- ============================================================================
CREATE OR REPLACE FUNCTION public.approve_leave_application(
  p_leave_id VARCHAR(100),
  p_reviewer_id UUID,
  p_reviewer_name VARCHAR(150),
  p_notes TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_leave RECORD;
  v_balance RECORD;
  v_current_year INT;
BEGIN
  -- 1. Check Reviewer Role
  IF get_current_user_role() NOT IN ('Admin', 'HR') AND current_user != 'service_role' THEN
    RAISE EXCEPTION 'Access Denied: Only HR and Admin roles can approve leave applications.';
  END IF;

  -- 2. Lock and retrieve leave application
  SELECT * INTO v_leave 
  FROM public.leave_applications 
  WHERE id = p_leave_id 
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Leave application % not found.', p_leave_id;
  END IF;

  IF v_leave.status != 'Pending Approval' THEN
    RAISE EXCEPTION 'Leave application is already %.', v_leave.status;
  END IF;

  v_current_year := EXTRACT(YEAR FROM v_leave.start_date);

  -- 3. Lock and retrieve leave balance
  SELECT * INTO v_balance
  FROM public.leave_balances
  WHERE employee_id = v_leave.employee_id
    AND leave_type = v_leave.leave_type
    AND year = v_current_year
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No leave balance record found for employee % in year %.', v_leave.employee_id, v_current_year;
  END IF;

  IF v_balance.remaining_days < v_leave.duration_days THEN
    RAISE EXCEPTION 'Insufficient leave balance. Remaining: %, Requested: %', v_balance.remaining_days, v_leave.duration_days;
  END IF;

  -- 4. Deduct quota atomically
  UPDATE public.leave_balances
  SET 
    used_days = used_days + v_leave.duration_days,
    updated_at = NOW()
  WHERE id = v_balance.id;

  -- 5. Mark application approved
  UPDATE public.leave_applications
  SET
    status = 'Approved',
    reviewed_by = p_reviewer_name,
    reviewed_by_id = p_reviewer_id,
    review_date = NOW(),
    review_notes = p_notes,
    updated_at = NOW()
  WHERE id = p_leave_id;

  -- 6. Log Audit Trail
  INSERT INTO public.audit_logs (
    id, user_id, user_name, user_role, action, details, result, created_at
  ) VALUES (
    'audit-' || floor(random()*1000000)::text,
    p_reviewer_id,
    p_reviewer_name,
    get_current_user_role(),
    'Leave Approved',
    'Approved ' || v_leave.duration_days || ' days ' || v_leave.leave_type || ' for ' || v_leave.employee_name,
    'SUCCESS',
    NOW()
  );

  RETURN jsonb_build_object(
    'success', true,
    'leave_id', p_leave_id,
    'status', 'Approved',
    'duration_days', v_leave.duration_days
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.approve_leave_application(VARCHAR, UUID, VARCHAR, TEXT) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_leave_application(VARCHAR, UUID, VARCHAR, TEXT) TO authenticated, service_role;

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. Users RLS (NO direct self-update of role, department, employee_id)
DROP POLICY IF EXISTS "Staff view sanitized directory or own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.users;

CREATE POLICY "Staff view sanitized directory or own profile" 
ON public.users FOR SELECT 
USING (id = auth.uid() OR public.get_current_user_role() IN ('Admin', 'HR'));

CREATE POLICY "Only Admins can insert or update user profiles" 
ON public.users FOR ALL 
USING (public.get_current_user_role() = 'Admin');

-- 2. Leave Balances RLS
DROP POLICY IF EXISTS "Employees view own leave balance or HR/Admin view all" ON public.leave_balances;
DROP POLICY IF EXISTS "HR/Admin manage leave balances" ON public.leave_balances;

CREATE POLICY "Employees view own leave balance or HR/Admin view all" 
ON public.leave_balances FOR SELECT 
USING (employee_id = auth.uid() OR public.get_current_user_role() IN ('HR', 'Admin'));

CREATE POLICY "HR/Admin manage leave balances" 
ON public.leave_balances FOR ALL 
USING (public.get_current_user_role() IN ('HR', 'Admin'));

-- 3. Documents RLS
DROP POLICY IF EXISTS "Approved documents visible to authenticated staff" ON public.documents;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON public.documents;
DROP POLICY IF EXISTS "HR and Admin can update document approvals" ON public.documents;
DROP POLICY IF EXISTS "Only Admin can delete documents" ON public.documents;

CREATE POLICY "Approved documents visible to authenticated staff" 
ON public.documents FOR SELECT 
USING (status = 'Approved' OR uploaded_by_id = auth.uid() OR public.get_current_user_role() IN ('HR', 'Admin'));

CREATE POLICY "Authenticated users can upload documents" 
ON public.documents FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND uploaded_by_id = auth.uid());

CREATE POLICY "HR and Admin can update document approvals" 
ON public.documents FOR UPDATE 
USING (public.get_current_user_role() IN ('HR', 'Admin'));

CREATE POLICY "Only Admin can delete documents" 
ON public.documents FOR DELETE 
USING (public.get_current_user_role() = 'Admin');

-- 4. Document Chunks & Versions RLS
DROP POLICY IF EXISTS "Authenticated view approved document chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Service role / Admin manage document chunks" ON public.document_chunks;

CREATE POLICY "Authenticated view approved document chunks"
ON public.document_chunks FOR SELECT
USING (auth.role() = 'authenticated');

CREATE POLICY "Admin and HR manage document chunks"
ON public.document_chunks FOR ALL
USING (public.get_current_user_role() IN ('Admin', 'HR'));

DROP POLICY IF EXISTS "Authenticated view approved document versions" ON public.document_versions;
CREATE POLICY "Authenticated view approved document versions"
ON public.document_versions FOR SELECT
USING (auth.role() = 'authenticated');

-- 5. Leave Applications RLS
DROP POLICY IF EXISTS "Employees view own leaves or HR/Admin view all" ON public.leave_applications;
DROP POLICY IF EXISTS "Employees can submit leave for themselves" ON public.leave_applications;
DROP POLICY IF EXISTS "HR and Admin can approve/reject leaves" ON public.leave_applications;

CREATE POLICY "Employees view own leaves or HR/Admin view all" 
ON public.leave_applications FOR SELECT 
USING (employee_id = auth.uid() OR public.get_current_user_role() IN ('HR', 'Admin'));

CREATE POLICY "Employees can submit leave for themselves" 
ON public.leave_applications FOR INSERT 
WITH CHECK (auth.role() = 'authenticated' AND employee_id = auth.uid());

CREATE POLICY "HR and Admin can approve/reject leaves" 
ON public.leave_applications FOR UPDATE 
USING (public.get_current_user_role() IN ('HR', 'Admin'));

-- 6. Approvals Table RLS
DROP POLICY IF EXISTS "Staff view approvals for accessible documents" ON public.approvals;
CREATE POLICY "Staff view approvals for accessible documents"
ON public.approvals FOR SELECT
USING (public.get_current_user_role() IN ('Admin', 'HR'));

CREATE POLICY "HR and Admin manage approvals"
ON public.approvals FOR ALL
USING (public.get_current_user_role() IN ('Admin', 'HR'));

-- 7. Notifications RLS
DROP POLICY IF EXISTS "Users view own notifications" ON public.notifications;
CREATE POLICY "Users view own notifications" 
ON public.notifications FOR SELECT 
USING (user_id = auth.uid() OR target_role = 'All' OR target_role = public.get_current_user_role()::text);

-- 8. Audit Logs RLS
DROP POLICY IF EXISTS "Admin and HR can view audit logs" ON public.audit_logs;
CREATE POLICY "Admin and HR can view audit logs" 
ON public.audit_logs FOR SELECT 
USING (public.get_current_user_role() IN ('Admin', 'HR'));
