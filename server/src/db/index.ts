// Database layer using better-sqlite3
import Database from 'better-sqlite3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const DB_PATH = path.join(__dirname, '../../data/paygate.db');

let db: Database.Database;

export function initDb(): Database.Database {
  const fs = require('fs');
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS payments (
      pay_id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      amount REAL NOT NULL,
      token TEXT NOT NULL DEFAULT 'USDT',
      recipient TEXT NOT NULL,
      payer TEXT DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending',
      tx_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      expires_at TEXT NOT NULL,
      settled_at TEXT
    );

    CREATE TABLE IF NOT EXISTS invocations (
      id TEXT PRIMARY KEY,
      service_id TEXT NOT NULL,
      user_address TEXT DEFAULT '',
      prompt TEXT NOT NULL,
      result TEXT NOT NULL DEFAULT '',
      payment_id TEXT,
      tx_hash TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (payment_id) REFERENCES payments(pay_id)
    );

    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      capabilities TEXT NOT NULL DEFAULT '[]',
      trust_score REAL NOT NULL DEFAULT 50.0,
      total_transactions INTEGER NOT NULL DEFAULT 0,
      success_rate REAL NOT NULL DEFAULT 1.0,
      registered_at TEXT NOT NULL DEFAULT (datetime('now')),
      last_active TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_payer ON payments(payer);
    CREATE INDEX IF NOT EXISTS idx_invocations_service ON invocations(service_id);
    CREATE INDEX IF NOT EXISTS idx_invocations_user ON invocations(user_address);
  `);

  console.log('[DB] Database initialized at', DB_PATH);
  return db;
}

export function getDb(): Database.Database {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

// Payment helpers
export function createPayment(serviceId: string, amount: number, token: string, recipient: string): string {
  const payId = uuidv4();
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 30 * 60 * 1000); // 30 min expiry

  getDb().prepare(`
    INSERT INTO payments (pay_id, service_id, amount, token, recipient, status, created_at, expires_at)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(payId, serviceId, amount, token, recipient, now.toISOString(), expiresAt.toISOString());

  return payId;
}

export function getPayment(payId: string): any {
  return getDb().prepare('SELECT * FROM payments WHERE pay_id = ?').get(payId);
}

export function updatePaymentStatus(payId: string, status: string, txHash?: string, payer?: string): void {
  const updates: string[] = ['status = ?'];
  const params: any[] = [status];

  if (txHash) {
    updates.push('tx_hash = ?');
    params.push(txHash);
  }
  if (payer) {
    updates.push('payer = ?');
    params.push(payer);
  }
  if (status === 'paid') {
    updates.push("settled_at = datetime('now')");
  }

  params.push(payId);
  getDb().prepare(`UPDATE payments SET ${updates.join(', ')} WHERE pay_id = ?`).run(...params);
}

export function createInvocation(serviceId: string, userAddress: string, prompt: string, result: string, paymentId: string, txHash?: string): string {
  const id = uuidv4();
  getDb().prepare(`
    INSERT INTO invocations (id, service_id, user_address, prompt, result, payment_id, tx_hash)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, serviceId, userAddress, prompt, result, paymentId, txHash || null);
  return id;
}

export function getRecentInvocations(limit: number = 20): any[] {
  return getDb().prepare('SELECT * FROM invocations ORDER BY created_at DESC LIMIT ?').all(limit);
}

export function getPaymentStats(): any {
  const stats = getDb().prepare(`
    SELECT
      COUNT(*) as total_payments,
      SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_count,
      SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as total_volume,
      COUNT(DISTINCT payer) as unique_payers
    FROM payments
  `).get();
  return stats;
}
