import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

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

export interface ChainAuditResult {
  isChainValid: boolean;
  totalBlocks: number;
  blocks: BlockchainBlock[];
  invalidBlockIndices: number[];
  errors: string[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const LEDGER_FILE = path.join(DATA_DIR, 'blockchain_ledger.json');
const STORAGE_DIR = path.join(DATA_DIR, 'storage');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

export class BlockchainEngine {
  private static chain: BlockchainBlock[] = [];
  private static initialized = false;

  public static computeSha256(data: Buffer | string): string {
    const hash = crypto.createHash('sha256');
    if (Buffer.isBuffer(data)) {
      hash.update(data);
    } else {
      hash.update(Buffer.from(data, 'utf-8'));
    }
    return hash.digest('hex');
  }

  private static calculateBlockHash(
    blockNumber: number,
    timestamp: string,
    documentId: string,
    fileHash: string,
    metadataHash: string,
    previousBlockHash: string,
    nonce: number
  ): string {
    const raw = `${blockNumber}:${timestamp}:${documentId}:${fileHash}:${metadataHash}:${previousBlockHash}:${nonce}`;
    return this.computeSha256(raw);
  }

  public static initialize(): void {
    if (this.initialized) return;

    if (fs.existsSync(LEDGER_FILE)) {
      try {
        const raw = fs.readFileSync(LEDGER_FILE, 'utf-8');
        this.chain = JSON.parse(raw);
        console.log(`[Blockchain Engine] Loaded ${this.chain.length} blocks from persistent ledger.`);
        this.initialized = true;
        return;
      } catch (err) {
        console.error('[Blockchain Engine] Error loading ledger, reinitializing genesis block:', err);
      }
    }

    // Genesis Block
    const genesisTimestamp = '2026-01-01T00:00:00.000Z';
    const genesisFileHash = this.computeSha256('KMRL_GENESIS_ROOT_DOCUMENT_SEAL_2026');
    const genesisMetaHash = this.computeSha256('KMRL_GENESIS_METADATA_METRO_RAIL_SECURITY');
    const genesisPrevHash = '0'.repeat(64);
    const nonce = 10245;
    const blockHash = this.calculateBlockHash(
      0,
      genesisTimestamp,
      'KMRL-GENESIS-000',
      genesisFileHash,
      genesisMetaHash,
      genesisPrevHash,
      nonce
    );

    const genesisBlock: BlockchainBlock = {
      blockNumber: 0,
      timestamp: genesisTimestamp,
      documentId: 'KMRL-GENESIS-000',
      documentTitle: 'KMRL Genesis Anchor Block (Root of Trust)',
      fileHash: genesisFileHash,
      metadataHash: genesisMetaHash,
      previousBlockHash: genesisPrevHash,
      nonce,
      blockHash,
      validator: 'KMRL Authority Node 0 (Root Trust)',
      signature: crypto.createHmac('sha256', 'kmrl-root-key').update(blockHash).digest('hex'),
      status: 'VALID',
    };

    this.chain = [genesisBlock];
    this.persistLedger();
    this.initialized = true;
    console.log('[Blockchain Engine] Genesis block minted & anchored.');
  }

  private static persistLedger(): void {
    try {
      fs.writeFileSync(LEDGER_FILE, JSON.stringify(this.chain, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Blockchain Engine] Failed to persist ledger to disk:', err);
    }
  }

  public static getChain(): BlockchainBlock[] {
    this.initialize();
    return [...this.chain];
  }

  public static getBlockByDocumentId(documentId: string): BlockchainBlock | null {
    this.initialize();
    // Return the latest block for the document
    const blocks = this.chain.filter((b) => b.documentId === documentId);
    return blocks.length > 0 ? blocks[blocks.length - 1] : null;
  }

  public static addDocumentBlock(
    documentId: string,
    documentTitle: string,
    fileBuffer: Buffer | string,
    metadata: Record<string, any> = {}
  ): BlockchainBlock {
    this.initialize();

    const fileHash = this.computeSha256(fileBuffer);
    const metadataString = JSON.stringify({
      title: documentTitle,
      category: metadata.category || '',
      uploadedBy: metadata.uploadedBy || '',
      version: metadata.version || 1,
    });
    const metadataHash = this.computeSha256(metadataString);

    const previousBlock = this.chain[this.chain.length - 1];
    const previousBlockHash = previousBlock ? previousBlock.blockHash : '0'.repeat(64);
    const blockNumber = this.chain.length;
    const timestamp = new Date().toISOString();

    // Proof of verification nonce
    let nonce = 0;
    let blockHash = '';
    while (true) {
      blockHash = this.calculateBlockHash(
        blockNumber,
        timestamp,
        documentId,
        fileHash,
        metadataHash,
        previousBlockHash,
        nonce
      );
      // Lightweight proof-of-integrity check (hash begins with '0' or '00')
      if (blockHash.startsWith('0')) {
        break;
      }
      nonce++;
      if (nonce > 50000) break; // Avoid stalling in edge cases
    }

    const validatorNode = `KMRL Validator Node #${(blockNumber % 3) + 1} (${metadata.uploadedByRole || 'System'})`;
    const signature = crypto.createHmac('sha256', 'kmrl-validator-hmac').update(blockHash).digest('hex');

    const newBlock: BlockchainBlock = {
      blockNumber,
      timestamp,
      documentId,
      documentTitle,
      fileHash,
      metadataHash,
      previousBlockHash,
      nonce,
      blockHash,
      validator: validatorNode,
      signature,
      status: 'VALID',
    };

    this.chain.push(newBlock);
    this.persistLedger();

    console.log(`[Blockchain Engine] Block #${blockNumber} minted for Document "${documentTitle}" [Hash: ${fileHash.substring(0, 16)}...]`);
    return newBlock;
  }

  public static verifyDocumentIntegrity(
    documentId: string,
    currentFileBuffer: Buffer | string
  ): {
    verified: boolean;
    status: 'VERIFIED' | 'TAMPERED';
    currentHash: string;
    anchoredHash: string;
    block: BlockchainBlock | null;
    message: string;
  } {
    this.initialize();
    const block = this.getBlockByDocumentId(documentId);

    if (!block) {
      const currentHash = this.computeSha256(currentFileBuffer);
      return {
        verified: false,
        status: 'TAMPERED',
        currentHash,
        anchoredHash: 'NOT_FOUND_ON_CHAIN',
        block: null,
        message: 'No cryptographic block found for this document on the KMRL blockchain.',
      };
    }

    const currentHash = this.computeSha256(currentFileBuffer);
    const isMatch = currentHash === block.fileHash;

    if (isMatch) {
      return {
        verified: true,
        status: 'VERIFIED',
        currentHash,
        anchoredHash: block.fileHash,
        block,
        message: `Cryptographic proof verified! The file content matches Block #${block.blockNumber} exactly with zero alteration.`,
      };
    } else {
      return {
        verified: false,
        status: 'TAMPERED',
        currentHash,
        anchoredHash: block.fileHash,
        block,
        message: `CRITICAL ALERT: File tampering detected! Live hash (${currentHash.substring(0, 12)}...) differs from anchored blockchain hash (${block.fileHash.substring(0, 12)}...). Any unauthorized byte change alters the hash key completely.`,
      };
    }
  }

  public static auditEntireChain(): ChainAuditResult {
    this.initialize();
    const errors: string[] = [];
    const invalidBlockIndices: number[] = [];

    for (let i = 0; i < this.chain.length; i++) {
      const block = this.chain[i];

      // 1. Verify block internal hash
      const computedHash = this.calculateBlockHash(
        block.blockNumber,
        block.timestamp,
        block.documentId,
        block.fileHash,
        block.metadataHash,
        block.previousBlockHash,
        block.nonce
      );

      if (computedHash !== block.blockHash) {
        errors.push(`Block #${block.blockNumber} hash mismatch! Recorded: ${block.blockHash.substring(0, 12)}, Computed: ${computedHash.substring(0, 12)}`);
        invalidBlockIndices.push(i);
      }

      // 2. Verify chain linkage
      if (i > 0) {
        const prevBlock = this.chain[i - 1];
        if (block.previousBlockHash !== prevBlock.blockHash) {
          errors.push(`Broken link at Block #${block.blockNumber}: previousBlockHash does not match Block #${prevBlock.blockNumber} blockHash!`);
          if (!invalidBlockIndices.includes(i)) invalidBlockIndices.push(i);
        }
      }
    }

    return {
      isChainValid: errors.length === 0,
      totalBlocks: this.chain.length,
      blocks: this.chain,
      invalidBlockIndices,
      errors,
    };
  }
}
