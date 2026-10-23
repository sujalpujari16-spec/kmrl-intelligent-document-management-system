import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

let supabaseAdmin: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;
  if (
    SUPABASE_URL.includes('kmrl-project') ||
    SUPABASE_URL.includes('your-project-id') ||
    SUPABASE_SERVICE_ROLE_KEY.includes('kmrl-service-role-key') ||
    SUPABASE_SERVICE_ROLE_KEY.includes('your-service-role')
  ) {
    return false;
  }
  return true;
}

export function requireSupabaseAdmin(): SupabaseClient {
  const client = getSupabaseAdmin();
  if (!client) {
    throw new Error('Supabase client is not configured. SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in environment.');
  }
  return client;
}

export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (!supabaseAdmin) {
    supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return supabaseAdmin;
}

/**
 * File Magic Bytes & Structural Signature Verification
 */
export function verifyFileSignature(buffer: Buffer, expectedType: 'pdf' | 'png' | 'jpeg' | 'docx' | 'txt'): boolean {
  if (!buffer || buffer.length === 0) return false;

  // 1. PDF signature: %PDF- (0x25 0x50 0x44 0x46)
  if (expectedType === 'pdf') {
    if (buffer.length < 4) return false;
    return buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46;
  }

  // 2. PNG signature: 0x89 0x50 0x4E 0x47 0x0D 0x0A 0x1A 0x0A
  if (expectedType === 'png') {
    if (buffer.length < 8) return false;
    return buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  }

  // 3. JPEG signature: 0xFF 0xD8 0xFF
  if (expectedType === 'jpeg') {
    if (buffer.length < 3) return false;
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  // 4. DOCX signature: PK\x03\x04 + Office Open XML structure
  if (expectedType === 'docx') {
    if (buffer.length < 4) return false;
    const isZip = buffer[0] === 0x50 && buffer[1] === 0x4b && buffer[2] === 0x03 && buffer[3] === 0x04;
    if (!isZip) return false;
    // Check for standard OOXML Content Types marker within the first 2048 bytes
    const headerSnippet = buffer.subarray(0, Math.min(buffer.length, 2048)).toString('binary');
    return headerSnippet.includes('[Content_Types].xml') || headerSnippet.includes('word/');
  }

  // 5. TXT files (UTF-8 text validation)
  if (expectedType === 'txt') {
    // Ensure no excessive null bytes (binary file masking as text)
    for (let i = 0; i < Math.min(buffer.length, 512); i++) {
      if (buffer[i] === 0x00) return false;
    }
    return true;
  }

  return false;
}

import { PersistentStore } from './persistentStore';

/**
 * Secure Private Supabase Storage Upload Helper
 * Automatically saves locally to disk to guarantee 100% permanent persistence
 */
export async function uploadDocumentFile(
  bucketName: string,
  storagePath: string,
  buffer: Buffer,
  contentType: string
): Promise<{ storagePath: string; error?: string }> {
  // Always write physical file to disk storage
  PersistentStore.savePhysicalFile(storagePath, buffer);

  const client = getSupabaseAdmin();

  if (client) {
    try {
      const { data, error } = await client.storage
        .from(bucketName)
        .upload(storagePath, buffer, {
          contentType,
          upsert: true,
        });

      if (!error && data?.path) {
        return { storagePath: data.path };
      }
    } catch {
      // Fall through to local storage path
    }
  }

  return { storagePath };
}

/**
 * Retrieve Document File Buffer from Supabase or Local Disk
 */
export async function downloadDocumentFile(
  bucketName: string,
  storagePath: string
): Promise<Buffer | null> {
  const client = getSupabaseAdmin();
  if (client) {
    try {
      const { data, error } = await client.storage.from(bucketName).download(storagePath);
      if (!error && data) {
        const arr = await data.arrayBuffer();
        return Buffer.from(arr);
      }
    } catch {
      // Fallback
    }
  }
  return PersistentStore.getPhysicalFileBuffer(storagePath);
}

/**
 * Generate Short-Lived Private Signed URL on Demand (Default 120 seconds)
 */
export async function generateShortLivedSignedUrl(
  bucketName: string,
  storagePath: string,
  expiresInSeconds = 120
): Promise<{ signedUrl?: string; error?: string }> {
  const client = getSupabaseAdmin();
  if (client) {
    try {
      const { data, error } = await client.storage
        .from(bucketName)
        .createSignedUrl(storagePath, expiresInSeconds);

      if (!error && data?.signedUrl) {
        return { signedUrl: data.signedUrl };
      }
    } catch {
      // Fall through
    }
  }

  return { signedUrl: `/api/documents/preview/${encodeURIComponent(storagePath)}` };
}

/**
 * Delete Document File from Supabase Storage (Prevent Orphaned Storage Objects)
 */
export async function deleteDocumentFile(
  bucketName: string,
  storagePath: string
): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseAdmin();
  if (!client) {
    return { success: false, error: 'Supabase client unavailable' };
  }

  try {
    const { error } = await client.storage
      .from(bucketName)
      .remove([storagePath]);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * pgvector RPC Match Helper: Executes vector similarity search on Supabase
 */
export async function searchPgVectorChunks(
  queryEmbedding: number[],
  threshold = 0.40,
  limit = 5,
  category = 'All',
  department = 'All'
): Promise<any[] | null> {
  const client = getSupabaseAdmin();
  if (!client) return null;

  try {
    const { data, error } = await client.rpc('match_document_chunks', {
      query_embedding: queryEmbedding,
      match_threshold: threshold,
      match_count: limit,
      filter_category: category,
      filter_department: department,
    });

    if (error) {
      console.warn('[pgvector RPC match warning]:', error.message);
      return null;
    }

    return data;
  } catch (err) {
    console.warn('[pgvector search exception]:', err);
    return null;
  }
}
