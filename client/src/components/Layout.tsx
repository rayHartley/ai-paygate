import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../stores';
import { Zap, MessageSquare, LayoutGrid, BarChart3, Wallet } from 'lucide-react';
import clsx from 'clsx';

const navItems = [
  { path: '/', label: 'Home', icon: Zap },
  { path: '/services', label: 'Services', icon: LayoutGrid },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/dashboard', label: 'Dashboard', icon: BarChart3 },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { connected, address, connecting, connect, disconnect, balances } = useWallet();

  return (
    <div className="min-h-screen bg-tron-darker flex flex-col">
      {/* Header */}
      <header className="glass border-b border-tron-accent/20 px-6 py-3 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-tron-accent to-tron-red flex items-center justify-center font-bold text-white">
              P
            </div>
            <span className="text-lg font-bold gradient-text">AI PayGate</span>
          </Link>

          <nav className="flex gap-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-sm flex items-center gap-1.5 transition-all',
                  location.pathname === path
                    ? 'bg-tron-accent/20 text-tron-accent'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                )}
              >
                <Icon size={16} />
                {label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {connected && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-xs">
                {balances.USDT} USDT
              </span>
            </div>
          )}

          <button
            onClick={connected ? disconnect : connect}
            disabled={connecting}
            className={clsx(
              'px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all',
              connected
                ? 'bg-tron-blue/30 text-gray-300 hover:bg-red-500/20 hover:text-red-400'
                : 'bg-tron-accent/20 text-tron-accent hover:bg-tron-accent/30 animate-glow'
            )}
          >
            <Wallet size={16} />
            {connecting
              ? 'Connecting...'
              : connected
              ? `${address.slice(0, 6)}...${address.slice(-4)}`
              : 'Connect Wallet'}
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-tron-accent/10 px-6 py-4 text-center text-xs text-gray-500">
        AI PayGate - AI Payment Agent on TRON | x402 Protocol | Bank of AI Infrastructure
      </footer>
    </div>
  );
}
