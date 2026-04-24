/**
 * lib/r2.ts
 * Cloudflare R2 (S3-compatible) client — mirrors the Python s3_client.py
 *
 * Bucket layout:
 *   frombucketprod/JDI/input/<requestId>/    — raw uploaded file
 *   frombucketprod/JDI/output/<requestId>/   — processed result file
 *   frombucketprod/JDI/logs/<requestId>/app.log  — per-request log
 */

import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

// ─── constants ─────────────────────────────────────────────────────────────
const ROUTE = 'JDI'; // fixed to JDI per the bucket structure shown
const REQUEST_ID_SAFE = /[^A-Za-z0-9._-]+/g;

// ─── singleton S3 client ────────────────────────────────────────────────────
let _client: S3Client | null = null;

function getR2Client(): S3Client {
  if (_client) return _client;

  const endpoint = (
    process.env.S3_API ??
    process.env.R2_ENDPOINT ??
    ''
  ).trim();

  const accessKeyId = (
    process.env.S3_ACCESS_KEY_ID ??
    process.env.AWS_ACCESS_KEY_ID ??
    ''
  ).trim();

  const secretAccessKey = (
    process.env.Secret_Access_Key ??
    process.env.AWS_SECRET_ACCESS_KEY ??
    ''
  ).trim();

  if (!endpoint || !accessKeyId || !secretAccessKey) {
    throw new Error(
      'R2 env vars missing. Need: S3_API (or R2_ENDPOINT), ' +
      'S3_ACCESS_KEY_ID (or AWS_ACCESS_KEY_ID), ' +
      'Secret_Access_Key (or AWS_SECRET_ACCESS_KEY)'
    );
  }

  _client = new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });
  return _client;
}

function getBucketName(): string {
  const name = (
    process.env.Bucket ??
    process.env.R2_BUCKET_NAME ??
    process.env.AWS_BUCKET_NAME ??
    ''
  ).trim();
  if (!name) throw new Error('R2 bucket name missing. Need: Bucket (or R2_BUCKET_NAME)');
  return name;
}

/** Validate R2 configuration at startup */
export function validateR2Config(): { valid: boolean; missing: string[] } {
  const missing: string[] = [];

  const endpoint = (
    process.env.S3_API ??
    process.env.R2_ENDPOINT ??
    ''
  ).trim();
  if (!endpoint) missing.push('S3_API (or R2_ENDPOINT)');

  const accessKeyId = (
    process.env.S3_ACCESS_KEY_ID ??
    process.env.AWS_ACCESS_KEY_ID ??
    ''
  ).trim();
  if (!accessKeyId) missing.push('S3_ACCESS_KEY_ID (or AWS_ACCESS_KEY_ID)');

  const secretAccessKey = (
    process.env.Secret_Access_Key ??
    process.env.AWS_SECRET_ACCESS_KEY ??
    ''
  ).trim();
  if (!secretAccessKey) missing.push('Secret_Access_Key (or AWS_SECRET_ACCESS_KEY)');

  const bucketName = (
    process.env.Bucket ??
    process.env.R2_BUCKET_NAME ??
    process.env.AWS_BUCKET_NAME ??
    ''
  ).trim();
  if (!bucketName) missing.push('Bucket (or R2_BUCKET_NAME)');

  return { valid: missing.length === 0, missing };
}

function getEndpointUrl(): string {
  return (process.env.S3_API ?? process.env.R2_ENDPOINT ?? '').trim().replace(/\/$/, '');
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Strip unsafe chars from a request ID */
export function sanitizeRequestId(id: string): string {
  const safe = id.trim().replace(REQUEST_ID_SAFE, '_').replace(/^[._-]+|[._-]+$/g, '');
  if (!safe) throw new Error('requestId must contain at least one valid character');
  return safe;
}

/** Generate a fresh unique request ID */
export function generateRequestId(): string {
  return randomUUID();
}

/** Build the S3 key prefix: JDI/<category>/<requestId>/ */
export function buildPrefix(category: 'input' | 'output' | 'logs', requestId: string): string {
  return `${ROUTE}/${category}/${sanitizeRequestId(requestId)}/`;
}

/** Public object URL for the R2 bucket */
function buildObjectUrl(bucket: string, key: string): string {
  return `${getEndpointUrl()}/${bucket}/${key}`;
}

// ─── upload helpers ──────────────────────────────────────────────────────────

export interface UploadResult {
  bucket: string;
  key: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  etag: string | undefined;
  objectUrl: string;
}

/**
 * Upload the raw input file to JDI/input/<requestId>/<fileName>
 */
export async function uploadInput(
  requestId: string,
  fileName: string,
  body: Buffer,
  contentType: string
): Promise<UploadResult> {
  const client = getR2Client();
  const bucket = getBucketName();
  const prefix = buildPrefix('input', requestId);
  const key = `${prefix}${fileName}`;

  const res: PutObjectCommandOutput = await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );

  return {
    bucket, key,
    fileName,
    contentType,
    sizeBytes: body.length,
    etag: res.ETag,
    objectUrl: buildObjectUrl(bucket, key),
  };
}

/**
 * Upload the processed output file to JDI/output/<requestId>/<fileName>
 */
export async function uploadOutput(
  requestId: string,
  fileName: string,
  body: Buffer,
  contentType: string
): Promise<UploadResult> {
  const client = getR2Client();
  const bucket = getBucketName();
  const prefix = buildPrefix('output', requestId);
  const key = `${prefix}${fileName}`;

  const res: PutObjectCommandOutput = await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: contentType })
  );

  return {
    bucket, key,
    fileName,
    contentType,
    sizeBytes: body.length,
    etag: res.ETag,
    objectUrl: buildObjectUrl(bucket, key),
  };
}

/**
 * Append a log line to JDI/logs/<requestId>/app.log
 */
export async function uploadLog(
  requestId: string,
  message: string
): Promise<UploadResult> {
  const client = getR2Client();
  const bucket = getBucketName();
  const prefix = buildPrefix('logs', requestId);
  const key = `${prefix}app.log`;
  const timestamp = new Date().toISOString();
  const body = Buffer.from(`[${timestamp}] ${message}\n`, 'utf-8');

  const res: PutObjectCommandOutput = await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: 'text/plain' })
  );

  return {
    bucket, key,
    fileName: 'app.log',
    contentType: 'text/plain',
    sizeBytes: body.length,
    etag: res.ETag,
    objectUrl: buildObjectUrl(bucket, key),
  };
}
