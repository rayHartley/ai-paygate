// API client for communicating with the backend
const API_BASE = '/api/v1';

async function fetchJson(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  return res.json();
}

// Services
export async function getServices() {
  return fetchJson(`${API_BASE}/services`);
}

export async function getServiceDetails(serviceId: string) {
  return fetchJson(`${API_BASE}/services/${serviceId}`);
}

// Invoke service with payment
export async function invokeService(
  serviceId: string,
  prompt: string,
  options: { txHash?: string; payId?: string; payer?: string; demo?: boolean } = {}
) {
  const headers: Record<string, string> = {};
  if (options.demo) headers['X-Demo-Mode'] = 'true';

  return fetchJson(`${API_BASE}/services/${serviceId}/invoke`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      prompt,
      txHash: options.txHash,
      payId: options.payId,
      payer: options.payer,
    }),
  });
}

// Chat
export async function chatFree(messages: { role: string; content: string }[]) {
  return fetchJson(`${API_BASE}/chat/free`, {
    method: 'POST',
    body: JSON.stringify({ messages }),
  });
}

export async function chatService(
  serviceId: string,
  prompt: string,
  options: { txHash?: string; payId?: string; payer?: string; demo?: boolean } = {}
) {
  return fetchJson(`${API_BASE}/chat/service`, {
    method: 'POST',
    body: JSON.stringify({
      serviceId,
      prompt,
      txHash: options.txHash,
      payId: options.payId,
      payer: options.payer,
      demo: options.demo,
    }),
  });
}

// Payments
export async function createPayment(serviceId: string, token: string = 'USDT') {
  return fetchJson(`${API_BASE}/payments/create`, {
    method: 'POST',
    body: JSON.stringify({ serviceId, token }),
  });
}

export async function getPaymentStatus(payId: string) {
  return fetchJson(`${API_BASE}/payments/${payId}`);
}

export async function verifyPayment(payId: string, txHash: string, payer?: string) {
  return fetchJson(`${API_BASE}/payments/${payId}/verify`, {
    method: 'POST',
    body: JSON.stringify({ txHash, payer }),
  });
}

// Stats
export async function getStats() {
  return fetchJson(`${API_BASE}/stats`);
}

export async function getInvocations(limit: number = 20) {
  return fetchJson(`${API_BASE}/invocations?limit=${limit}`);
}

// Wallet
export async function getWalletInfo() {
  return fetchJson(`${API_BASE}/wallet`);
}

// Health
export async function getHealth() {
  return fetchJson('/health');
}
