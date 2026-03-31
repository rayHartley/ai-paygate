// Zustand stores for wallet and app state
import { create } from 'zustand';

// Wallet store
interface WalletState {
  connected: boolean;
  address: string;
  network: string;
  balances: { TRX: string; USDT: string; USDD: string };
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  setBalances: (balances: { TRX: string; USDT: string; USDD: string }) => void;
}

export const useWallet = create<WalletState>((set) => ({
  connected: false,
  address: '',
  network: 'nile',
  balances: { TRX: '0', USDT: '0', USDD: '0' },
  connecting: false,

  connect: async () => {
    set({ connecting: true });
    try {
      // Try TronLink
      const tronLink = (window as any).tronLink || (window as any).tronWeb;
      if (tronLink) {
        if ((window as any).tronLink) {
          await (window as any).tronLink.request({ method: 'tron_requestAccounts' });
        }
        const tronWeb = (window as any).tronWeb;
        if (tronWeb && tronWeb.defaultAddress?.base58) {
          set({
            connected: true,
            address: tronWeb.defaultAddress.base58,
            connecting: false,
          });
          return;
        }
      }

      // Demo mode - use a mock address
      set({
        connected: true,
        address: 'TDemoUserPayGate' + Date.now().toString(36).slice(-8),
        network: 'nile',
        balances: { TRX: '10.00', USDT: '2.00', USDD: '1.00' },
        connecting: false,
      });
    } catch (e) {
      console.error('Wallet connect failed:', e);
      // Fallback to demo
      set({
        connected: true,
        address: 'TDemoUser' + Date.now().toString(36).slice(-8),
        balances: { TRX: '10.00', USDT: '2.00', USDD: '1.00' },
        connecting: false,
      });
    }
  },

  disconnect: () => {
    set({
      connected: false,
      address: '',
      balances: { TRX: '0', USDT: '0', USDD: '0' },
    });
  },

  setBalances: (balances) => set({ balances }),
}));

// Chat store
interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  serviceId?: string;
  payment?: any;
  timestamp: string;
}

interface ChatState {
  messages: ChatMessage[];
  loading: boolean;
  addMessage: (msg: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

export const useChat = create<ChatState>((set) => ({
  messages: [],
  loading: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...msg,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
          timestamp: new Date().toISOString(),
        },
      ],
    })),

  setLoading: (loading) => set({ loading }),
  clearMessages: () => set({ messages: [] }),
}));
