import { GoogleGenAI } from '@google/genai';
import { PDFParse } from 'pdf-parse';
import mammoth from 'mammoth';
import { DocumentItem } from '../src/types';
import { searchPgVectorChunks, requireSupabaseAdmin, getSupabaseAdmin, isSupabaseConfigured } from './supabaseClient';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'kmrl-idms-rag',
    },
  },
});

const EMBEDDING_DIM = 768; // Gemini text-embedding-004 dimension
const RELEVANCE_THRESHOLD = 0.40;

/**
 * 1. REAL DOCUMENT TEXT EXTRACTION & OCR
 * Extracts actual text from PDF, DOCX, Images, and Text files
 */
export async function extractDocumentText(
  filename: string,
  buffer: Buffer,
  mimeType: string
): Promise<{ text: string; isScanned: boolean; error?: string }> {
  const ext = ('.' + (filename.split('.').pop() || '')).toLowerCase();

  try {
    // A. PDF Extraction (Native PDF text or OCR fallback)
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      try {
        const parser = new PDFParse({ data: buffer });
        const parsed = await parser.getText();
        const extracted = (parsed?.text || '').trim();
        if (extracted.length > 50) {
          return { text: extracted, isScanned: false };
        }
      } catch (pdfErr) {
        console.warn('[PDF Parse Native Text Warning]:', pdfErr);
      }

      // If PDF has no extractable text stream, process via Gemini Vision OCR
      if (process.env.GEMINI_API_KEY) {
        const base64Data = buffer.toString('base64');
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType: 'application/pdf',
                    data: base64Data,
                  },
                },
                {
                  text: 'You are an enterprise OCR engine for Kochi Metro Rail Limited. Extract all visible text from this document accurately with headings and section preservation. Output ONLY the raw extracted text.',
                },
              ],
            },
          ],
        });

        const ocrText = response.text || '';
        if (ocrText.trim().length > 0) {
          return { text: ocrText.trim(), isScanned: true };
        }
      }

      return { text: '', isScanned: true, error: 'OCR processing failed to extract text from document.' };
    }

    // B. DOCX Extraction (Real OpenXML document parsing)
    if (ext === '.docx' || mimeType.includes('wordprocessingml')) {
      const result = await mammoth.extractRawText({ buffer });
      const text = (result.value || '').trim();
      if (text.length > 0) {
        return { text, isScanned: false };
      }
      return { text: '', isScanned: false, error: 'DOCX document contains no readable text content.' };
    }

    // C. Image OCR (PNG, JPG, JPEG via Gemini Multimodal Vision)
    if (ext === '.png' || ext === '.jpg' || ext === '.jpeg' || mimeType.startsWith('image/')) {
      if (!process.env.GEMINI_API_KEY) {
        return { text: '', isScanned: true, error: 'GEMINI_API_KEY is required for image OCR extraction.' };
      }

      const imgMime = ext === '.png' ? 'image/png' : 'image/jpeg';
      const base64Data = buffer.toString('base64');

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                inlineData: {
                  mimeType: imgMime,
                  data: base64Data,
                },
              },
              {
                text: 'Extract all legible text from this Kochi Metro document or policy image. Preserve paragraph breaks and numerical values accurately. Output ONLY the extracted text.',
              },
            ],
          },
        ],
      });

      const ocrText = response.text || '';
      if (ocrText.trim().length > 0) {
        return { text: ocrText.trim(), isScanned: true };
      }

      return { text: '', isScanned: true, error: 'Image OCR could not identify readable text.' };
    }

    // D. Plain Text Extraction
    if (ext === '.txt' || mimeType === 'text/plain') {
      const text = buffer.toString('utf-8').trim();
      return { text, isScanned: false };
    }

    return { text: '', isScanned: false, error: `Unsupported file type for text extraction: ${ext}` };
  } catch (err: any) {
    return { text: '', isScanned: false, error: `Document extraction failed: ${err.message}` };
  }
}

/**
 * 2. SEMANTIC CHUNKING
 */
export function chunkText(text: string, chunkSize = 400, overlap = 60): string[] {
  const cleanText = text.trim().replace(/\s+/g, ' ');
  if (!cleanText) return [];

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < cleanText.length) {
      const lastPeriod = cleanText.lastIndexOf('.', endIndex);
      if (lastPeriod > startIndex + chunkSize / 2) {
        endIndex = lastPeriod + 1;
      } else {
        const lastSpace = cleanText.lastIndexOf(' ', endIndex);
        if (lastSpace > startIndex) {
          endIndex = lastSpace;
        }
      }
    }

    const chunk = cleanText.slice(startIndex, endIndex).trim();
    if (chunk.length > 20) {
      chunks.push(chunk);
    }

    startIndex = endIndex - overlap;
    if (startIndex >= cleanText.length || endIndex >= cleanText.length) break;
  }

  return chunks;
}

/**
 * 3. REAL GEMINI EMBEDDINGS (Fail Closed - No Mock Fallbacks)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (!text || text.trim().length === 0) {
    throw new Error('Cannot generate embedding for empty text.');
  }

  const key = process.env.GEMINI_API_KEY || '';
  if (!key || key.includes('enterprise-gemini-key') || key === 'your_gemini_api_key_here' || key.length < 20) {
    throw new Error('GEMINI_API_KEY is not configured with live credentials.');
  }

  const response = await ai.models.embedContent({
    model: 'text-embedding-004',
    contents: text.substring(0, 2048),
  });

  const resAny = response as any;
  if (resAny.embedding?.values && resAny.embedding.values.length > 0) {
    return resAny.embedding.values;
  }

  throw new Error('Gemini API returned empty vector embedding.');
}

/**
 * 4. PERSISTENT PGVECTOR INDEXING (Direct PostgreSQL Persistence)
 */
export async function indexDocumentToPgVector(doc: DocumentItem): Promise<{ chunksIndexed: number }> {
  if (doc.status !== 'Approved') {
    return { chunksIndexed: 0 };
  }

  if (!isSupabaseConfigured()) {
    return { chunksIndexed: 0 };
  }

  if (!doc.extractedText || doc.extractedText.trim().length === 0) {
    return { chunksIndexed: 0 };
  }

  const supabase = requireSupabaseAdmin();
  const rawChunks = chunkText(doc.extractedText);
  if (rawChunks.length === 0) return { chunksIndexed: 0 };

  // 1. Delete prior chunks for this document
  await supabase.from('document_chunks').delete().eq('document_id', doc.id);

  // 2. Generate embeddings and insert into PostgreSQL pgvector table
  const insertPayloads = [];
  for (let idx = 0; idx < rawChunks.length; idx++) {
    const chunkTextStr = rawChunks[idx];
    const embedding = await generateEmbedding(chunkTextStr);

    insertPayloads.push({
      document_id: doc.id,
      chunk_index: idx + 1,
      chunk_text: chunkTextStr,
      section: doc.title,
      category: doc.category,
      department: doc.uploadedByRole,
      version: doc.version || 1,
      embedding,
    });
  }

  const { error } = await supabase.from('document_chunks').insert(insertPayloads);
  if (error) {
    throw new Error(`Database error saving vector chunks to pgvector: ${error.message}`);
  }

  console.log(`[pgvector] Embedding generation & PostgreSQL persistence complete: ${insertPayloads.length} chunks for document "${doc.title}".`);
  return { chunksIndexed: insertPayloads.length };
}

/**
 * 5. DELETE DOCUMENT CHUNKS ON REJECTION OR REMOVAL
 */
export async function removeDocumentPgVectorChunks(documentId: string): Promise<void> {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    await supabase.from('document_chunks').delete().eq('document_id', documentId);
  }
}

/**
 * 6. VECTOR KNOWLEDGE BASE SEARCH
 */
export async function searchVectorDb(
  query: string,
  topK = 5,
  categoryFilter = 'All',
  minThreshold = RELEVANCE_THRESHOLD
): Promise<{
  docId: string;
  docTitle: string;
  category: string;
  chunkIndex: number;
  snippet: string;
  score: number;
  vectorDimension: number;
}[]> {
  if (!query || query.trim().length === 0) return [];

  // 1. Try pgvector search if Supabase & Gemini are configured
  try {
    const queryEmbedding = await generateEmbedding(query);
    const pgVectorResults = await searchPgVectorChunks(
      queryEmbedding,
      minThreshold,
      topK,
      categoryFilter
    );

    if (pgVectorResults && pgVectorResults.length > 0) {
      return pgVectorResults.map((r: any) => ({
        docId: r.document_id,
        docTitle: r.section || 'KMRL Official Document',
        category: r.category || 'General Policies',
        chunkIndex: r.chunk_index || 1,
        snippet: r.chunk_text,
        score: Math.min(Math.max(r.similarity, 0.05), 0.99),
        vectorDimension: EMBEDDING_DIM,
      }));
    }
  } catch {
    // Fall through to document text search
  }

  // 2. Search against approved repository documents
  try {
    const { SupabaseDBService } = await import('./dbService');
    const docs = await SupabaseDBService.getDocuments('Admin');
    const cleanQ = query.toLowerCase().trim();

    const STOP_WORDS = new Set([
      'what', 'is', 'the', 'in', 'of', 'and', 'to', 'a', 'an', 'for', 'on', 'with', 'at',
      'by', 'from', 'as', 'about', 'how', 'do', 'does', 'can', 'could', 'should', 'would',
      'i', 'me', 'my', 'we', 'our', 'you', 'your', 'he', 'she', 'it', 'they', 'them',
      'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'this', 'that',
      'these', 'those', 'there', 'their', 'which', 'who', 'whom', 'whose', 'tell', 'show',
      'give', 'please', 'any', 'some', 'many', 'much', 'so'
    ]);

    const allTerms = cleanQ.split(/\s+/).filter((t) => t.length > 1);
    const keyTerms = allTerms.filter((t) => !STOP_WORDS.has(t));
    const activeTerms = keyTerms.length > 0 ? keyTerms : allTerms;

    const matches: {
      docId: string;
      docTitle: string;
      category: string;
      chunkIndex: number;
      snippet: string;
      score: number;
      vectorDimension: number;
      uploadDate?: string;
      uploadedBy?: string;
      fileType?: string;
    }[] = [];

    for (const doc of docs) {
      if (categoryFilter !== 'All' && doc.category !== categoryFilter) continue;
      if (doc.status && doc.status !== 'Approved') continue;

      const titleLower = doc.title.toLowerCase();
      const catLower = doc.category.toLowerCase();
      const bodyLower = (doc.extractedText || '').toLowerCase();
      const combined = `${titleLower} ${catLower} ${bodyLower}`;

      let titleMatches = 0;
      let bodyMatches = 0;

      for (const term of activeTerms) {
        if (titleLower.includes(term) || catLower.includes(term)) {
          titleMatches++;
        }
        if (bodyLower.includes(term)) {
          bodyMatches++;
        }
      }

      const totalMatches = titleMatches + bodyMatches;
      const isExactPhrase = combined.includes(cleanQ);

      if (totalMatches > 0 || isExactPhrase) {
        let score = 0.5;
        if (isExactPhrase) score += 0.35;
        // Title matches have 3x weight
        score += Math.min((titleMatches * 0.15) + (bodyMatches * 0.05), 0.4);
        score = Math.min(Math.max(score, 0.45), 0.98);

        const snippet = (doc.extractedText && doc.extractedText.length > 20)
          ? doc.extractedText
          : `Official KMRL Document: ${doc.title} (${doc.category}).`;

        matches.push({
          docId: doc.id,
          docTitle: doc.title,
          category: doc.category,
          chunkIndex: 1,
          snippet,
          score,
          vectorDimension: EMBEDDING_DIM,
          uploadDate: doc.uploadDate,
          uploadedBy: doc.uploadedBy,
          fileType: doc.fileType,
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, topK);
  } catch (err) {
    console.error('[SearchVectorDb Error]:', err);
    return [];
  }
}
