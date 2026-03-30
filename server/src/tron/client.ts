// TRON client setup
import { config, TRON_TOKENS } from '../config';

// We use dynamic import since tronweb may need special handling
let tronWebInstance: any = null;

export async function getTronWeb(): Promise<any> {
  if (tronWebInstance) return tronWebInstance;

  if (config.mockMode) {
    console.log('[TRON] Running in MOCK mode - no real blockchain interactions');
    return createMockTronWeb();
  }

  try {
    const TronWeb = require('tronweb');
    tronWebInstance = new TronWeb({
      fullHost: config.tronFullHost,
      privateKey: config.tronPrivateKey,
    });
    console.log(`[TRON] Connected to ${config.tronNetwork} (${config.tronFullHost})`);
    return tronWebInstance;
  } catch (e: any) {
    console.warn('[TRON] Failed to init TronWeb, falling back to mock:', e.message);
    return createMockTronWeb();
  }
}

function createMockTronWeb(): any {
  return {
    address: {
      fromHex: (hex: string) => hex,
      toHex: (addr: string) => addr,
    },
    trx: {
      getBalance: async () => 10000000000, // 10000 TRX (in SUN)
      getAccount: async (addr: string) => ({ address: addr, balance: 10000000000 }),
    },
    contract: () => ({
      at: async () => ({
        balanceOf: async () => ({ toString: () => '1000000000' }), // 1000 USDT
        transfer: async () => ({ toString: () => 'mock_tx_hash_' + Date.now() }),
      }),
    }),
    transactionBuilder: {
      triggerSmartContract: async () => ({
        result: { result: true },
        transaction: { txID: 'mock_tx_' + Date.now() },
      }),
      triggerConstantContract: async () => ({
        constant_result: ['000000000000000000000000000000000000000000000000000000003b9aca00'],
      }),
    },
    trx2: {
      sign: async (tx: any) => ({ ...tx, signature: ['mock_sig'] }),
      sendRawTransaction: async (tx: any) => ({ result: true, txid: tx.txID }),
    },
    isMock: true,
  };
}

// Get TRX balance
export async function getTrxBalance(address: string): Promise<string> {
  const tronWeb = await getTronWeb();
  if (tronWeb.isMock) return '10000.000000';

  try {
    const balance = await tronWeb.trx.getBalance(address);
    return (balance / 1e6).toFixed(6); // SUN to TRX
  } catch (e: any) {
    console.error('[TRON] getTrxBalance error:', e.message);
    return '0';
  }
}

// Get TRC20 token balance
export async function getTrc20Balance(address: string, token: string): Promise<string> {
  const tronWeb = await getTronWeb();
  const tokenAddr = TRON_TOKENS[config.tronNetwork]?.[token];

  if (!tokenAddr) return '0';
  if (tronWeb.isMock) return token === 'USDT' ? '1000.000000' : '500.000000';

  try {
    const contract = await tronWeb.contract().at(tokenAddr);
    const balance = await contract.balanceOf(address).call();
    const decimals = token === 'USDT' ? 6 : 18;
    return (BigInt(balance.toString()) / BigInt(10 ** decimals)).toString();
  } catch (e: any) {
    console.error(`[TRON] getTrc20Balance(${token}) error:`, e.message);
    return '0';
  }
}

// Send TRC20 payment
export async function sendTrc20Payment(
  to: string,
  amount: number,
  token: string
): Promise<{ success: boolean; txHash: string; error?: string }> {
  const tronWeb = await getTronWeb();
  const tokenAddr = TRON_TOKENS[config.tronNetwork]?.[token];

  if (!tokenAddr) {
    return { success: false, txHash: '', error: `Token ${token} not supported on ${config.tronNetwork}` };
  }

  if (tronWeb.isMock) {
    const mockHash = `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[TRON:MOCK] Simulated payment: ${amount} ${token} to ${to} => ${mockHash}`);
    return { success: true, txHash: mockHash };
  }

  try {
    const decimals = token === 'USDT' ? 6 : 18;
    const amountBig = BigInt(Math.round(amount * (10 ** decimals)));

    const functionSelector = 'transfer(address,uint256)';
    const parameter = [
      { type: 'address', value: to },
      { type: 'uint256', value: amountBig.toString() },
    ];

    const tx = await tronWeb.transactionBuilder.triggerSmartContract(
      tokenAddr,
      functionSelector,
      { feeLimit: 100000000 },
      parameter,
      tronWeb.defaultAddress.hex
    );

    if (!tx.result?.result) {
      return { success: false, txHash: '', error: 'Transaction build failed' };
    }

    const signedTx = await tronWeb.trx.sign(tx.transaction);
    const result = await tronWeb.trx.sendRawTransaction(signedTx);

    return {
      success: result.result === true,
      txHash: result.txid || tx.transaction.txID,
    };
  } catch (e: any) {
    console.error('[TRON] sendTrc20Payment error:', e.message);
    return { success: false, txHash: '', error: e.message };
  }
}

// Verify a transaction exists on-chain
export async function verifyTransaction(txHash: string): Promise<boolean> {
  const tronWeb = await getTronWeb();
  if (tronWeb.isMock) return txHash.startsWith('mock_tx_');

  try {
    const tx = await tronWeb.trx.getTransactionInfo(txHash);
    return tx && tx.id === txHash;
  } catch {
    return false;
  }
}

// Get wallet address from private key
export function getWalletAddress(): string {
  if (config.mockMode || !config.tronPrivateKey) {
    return 'TMockPayGateAddress1234567890ABC';
  }
  try {
    const TronWeb = require('tronweb');
    return TronWeb.address.fromPrivateKey(config.tronPrivateKey);
  } catch {
    return '';
  }
}
