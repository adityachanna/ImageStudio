/**
 * lib/requestStore.ts
 *
 * Persists every request ID + its associated R2 URLs to a local JSON file
 * at: <project_root>/data/requests.json
 *
 * File format:
 * [
 *   {
 *     "requestId": "...",
 *     "tool": "compress" | "resize" | "pdf",
 *     "createdAt": "<ISO>",
 *     "inputUrl":  "https://...",
 *     "outputUrl": "https://...",
 *     "logUrl":    "https://..."
 *   },
 *   ...
 * ]
 */

import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'requests.json');

export interface RequestRecord {
  requestId: string;
  tool: 'compress' | 'resize' | 'pdf';
  originalFileName: string;
  createdAt: string;
  inputKey: string;
  outputKey: string;
  logKey: string;
  inputUrl: string;
  outputUrl: string;
  logUrl: string;
}

function ensureDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readStore(): RequestRecord[] {
  ensureDir();
  if (!fs.existsSync(STORE_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8')) as RequestRecord[];
  } catch {
    return [];
  }
}

function writeStore(records: RequestRecord[]): void {
  ensureDir();
  fs.writeFileSync(STORE_FILE, JSON.stringify(records, null, 2), 'utf-8');
}

export function saveRequestRecord(record: RequestRecord): void {
  const records = readStore();
  records.unshift(record); // newest first
  writeStore(records);
}

export function getAllRequestRecords(): RequestRecord[] {
  return readStore();
}
