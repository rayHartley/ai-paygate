import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getStats, getInvocations, getWalletInfo, getHealth } from '../api';
import { BarChart3, Coins, Users, Activity, Server, Wallet } from 'lucide-react';

export default function Dashboard() {
  const [stats, setStats] = useState<any>(null);
  const [invocations, setInvocations] = useState<any[]>([]);
  const [walletInfo, setWalletInfo] = useState<any>(null);
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      getStats().then((r) => r.success && setStats(r.data)),
      getInvocations(10).then((r) => r.success && setInvocations(r.data)),
      getWalletInfo().then((r) => r.success && setWalletInfo(r.data)),
      getHealth().then((r) => setHealth(r)),
    ]).catch(console.error);
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold gradient-text mb-6">Dashboard</h1>

      {/* Stats cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          {
            icon: BarChart3,
            label: 'Total Payments',
            value: stats?.total_payments ?? '—',
            color: 'text-blue-400',
          },
          {
            icon: Coins,
            label: 'Total Volume (USDT)',
            value: stats?.total_volume?.toFixed(2) ?? '—',
            color: 'text-green-400',
          },
          {
            icon: Users,
            label: 'Unique Payers',
            value: stats?.unique_payers ?? '—',
            color: 'text-purple-400',
          },
          {
            icon: Activity,
            label: 'Paid Invocations',
            value: stats?.paid_count ?? '—',
            color: 'text-tron-accent',
          },
        ].map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="glass rounded-xl p-5"
          >
            <card.icon className={`${card.color} mb-2`} size={22} />
            <div className="text-2xl font-bold text-white">{card.value}</div>
            <div className="text-xs text-gray-400">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Server status */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Server size={18} className="text-tron-accent" />
            Server Status
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Status</span>
              <span className="text-green-400">{health?.status ?? 'checking...'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Network</span>
              <span className="text-white">{health?.network ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Mock Mode</span>
              <span className={health?.mockMode ? 'text-yellow-400' : 'text-green-400'}>
                {health?.mockMode ? 'Yes (Demo)' : 'No (Live)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Version</span>
              <span className="text-white">{health?.version ?? '—'}</span>
            </div>
          </div>
        </div>

        {/* Wallet info */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Wallet size={18} className="text-tron-accent" />
            Service Wallet
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Address</span>
              <span className="text-white font-mono text-xs">
                {walletInfo?.address
                  ? `${walletInfo.address.slice(0, 8)}...${walletInfo.address.slice(-6)}`
                  : '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">TRX</span>
              <span className="text-white">{walletInfo?.balances?.TRX ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">USDT</span>
              <span className="text-green-400">{walletInfo?.balances?.USDT ?? '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">USDD</span>
              <span className="text-blue-400">{walletInfo?.balances?.USDD ?? '—'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent invocations */}
      <div className="glass rounded-xl p-6 mt-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Activity size={18} className="text-tron-accent" />
          Recent Invocations
        </h2>
        {invocations.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No invocations yet. Try a service!</p>
        ) : (
          <div className="space-y-2">
            {invocations.map((inv: any) => (
              <div
                key={inv.id}
                className="bg-tron-darker/50 rounded-lg px-4 py-3 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white truncate">{inv.prompt?.slice(0, 60)}...</div>
                  <div className="text-xs text-gray-500">
                    {inv.service_id} | {new Date(inv.created_at).toLocaleString()}
                  </div>
                </div>
                {inv.tx_hash && (
                  <div className="text-xs text-green-400 ml-4 flex-shrink-0">
                    tx: {inv.tx_hash.slice(0, 10)}...
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
