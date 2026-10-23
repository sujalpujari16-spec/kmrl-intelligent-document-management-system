# Document Upload & OCR Ingestion Guide

## How to Upload Documents in KMRL IDMS
1. Navigate to **Document Management** from the sidebar or click the **"Upload Document"** button.
2. In the upload modal:
   - Enter the **Document Title**.
   - Select the **Category** (Leave Policies, HR Circulars, Attendance & Shifts, Procurement & Tenders, Metro Operations, or General Policies).
   - Drag and drop or browse for your file (PDF, scanned PNG/JPG, Word doc).
3. If you upload a scanned physical form or image, select **"Run Gemini Vision OCR"** to automatically extract and verify text from the scan.
4. Click **"Submit Document"**.

## What Happens After You Upload
- If you are an **Employee**, the document status is set to **"Pending Approval"** and immediately appears in the HR / Admin Approvals & Workflows queue.
- If you are an **Admin** or **HR Officer**, the document is immediately marked as **"Approved"** and automatically indexed into the vector database for RAG queries.
