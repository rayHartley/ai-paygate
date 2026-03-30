// TypeScript types for AI PayGate

export interface ApiResponse<T = any> {
  success: boolean;
  data: T | null;
  error: string | null;
}

export function ok<T>(data: T): ApiResponse<T> {
  return { success: true, data, error: null };
}

export function err(message: string): ApiResponse<null> {
  return { success: false, data: null, error: message };
}

// Payment types
export interface PaymentRequest {
  payId: string;
  serviceId: string;
  amount: number;
  token: string; // USDT | USDD
  recipient: string;
  payer: string;
  status: 'pending' | 'paid' | 'expired' | 'failed';
  txHash: string | null;
  createdAt: string;
  expiresAt: string;
}

export interface PaymentVerification {
  valid: boolean;
  payId: string;
  txHash?: string;
  error?: string;
}

// x402 types
export interface X402PaymentRequired {
  version: '1';
  requirements: X402Requirement[];
}

export interface X402Requirement {
  scheme: 'exact';
  network: string;
  asset: string;
  amount: string;
  recipient: string;
  extra: {
    serviceId: string;
    serviceName: string;
    facilitator: string;
  };
}

export interface X402PaymentPayload {
  version: '1';
  scheme: 'exact';
  network: string;
  payload: {
    txHash: string;
    payer: string;
  };
}

// Service invocation
export interface ServiceInvocation {
  id: string;
  serviceId: string;
  userAddress: string;
  prompt: string;
  result: string;
  paymentId: string;
  txHash: string | null;
  createdAt: string;
}

// AI Chat
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  serviceId: string;
  prompt: string;
  paymentSignature?: string; // x402 payment signature header
  txHash?: string; // direct tx hash for verification
  payer?: string; // payer wallet address
}

export interface ChatResponse {
  result: string;
  paymentRequired?: X402PaymentRequired;
  invocationId?: string;
  txHash?: string;
}

// WebSocket events
export interface WSEvent {
  type: 'payment' | 'invocation' | 'whale' | 'system';
  data: any;
  timestamp: string;
}

// Wallet info
export interface WalletInfo {
  address: string;
  balances: {
    TRX: string;
    USDT: string;
    USDD?: string;
  };
  network: string;
}
