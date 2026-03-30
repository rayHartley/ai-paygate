import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, Shield, Globe, Cpu, ArrowRight } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'x402 Micropayments',
    desc: 'Pay per request with USDT/USDD on TRON. No subscriptions, no minimums.',
  },
  {
    icon: Shield,
    title: 'Trustless Payments',
    desc: 'Built on the x402 protocol - zero friction, zero centralization, zero fees.',
  },
  {
    icon: Globe,
    title: 'TRON Network',
    desc: 'Fast, low-cost transactions on TRON blockchain. Supports USDT and USDD.',
  },
  {
    icon: Cpu,
    title: 'AI-Powered Services',
    desc: 'Writing, translation, code review, data analysis - all powered by GPT-4.1.',
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="inline-block px-3 py-1 rounded-full bg-tron-accent/10 text-tron-accent text-sm mb-4">
          TRON x Bank of AI Hackathon 2026
        </div>
        <h1 className="text-5xl font-bold mb-4">
          <span className="gradient-text">AI PayGate</span>
        </h1>
        <p className="text-xl text-gray-400 mb-2">
          AI Payment Agent — Pay-Per-Use AI Services on TRON
        </p>
        <p className="text-gray-500 max-w-2xl mx-auto mb-8">
          An AI-powered service marketplace where you pay per request using USDT/USDD
          on TRON via the x402 payment protocol. No subscriptions. No accounts needed.
          Just connect your wallet and start using AI.
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/services"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-tron-accent to-tron-red text-white font-medium flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            Explore Services <ArrowRight size={18} />
          </Link>
          <Link
            to="/chat"
            className="px-6 py-3 rounded-xl border border-tron-accent/30 text-tron-accent font-medium hover:bg-tron-accent/10 transition-colors"
          >
            Try Free Chat
          </Link>
        </div>
      </motion.div>

      {/* Features grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i, duration: 0.5 }}
            className="glass rounded-xl p-6 hover:border-tron-accent/30 transition-colors"
          >
            <f.icon className="text-tron-accent mb-3" size={28} />
            <h3 className="font-semibold text-white mb-2">{f.title}</h3>
            <p className="text-sm text-gray-400">{f.desc}</p>
          </motion.div>
        ))}
      </div>

      {/* How it works */}
      <div className="glass rounded-2xl p-8 mb-16">
        <h2 className="text-2xl font-bold text-center mb-8 gradient-text">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-6">
          {[
            { step: '1', title: 'Connect Wallet', desc: 'Connect your TRON wallet (TronLink, etc.) or use demo mode' },
            { step: '2', title: 'Choose Service', desc: 'Browse AI services: Writing, Translation, Code Review, and more' },
            { step: '3', title: 'Pay with USDT', desc: 'Micropayment via x402 protocol — pay only for what you use' },
            { step: '4', title: 'Get AI Result', desc: 'Receive high-quality AI output instantly after payment confirms' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-tron-accent/20 text-tron-accent font-bold flex items-center justify-center mx-auto mb-3">
                {item.step}
              </div>
              <h4 className="font-semibold text-white mb-1">{item.title}</h4>
              <p className="text-sm text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Architecture */}
      <div className="glass rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-center mb-6 gradient-text">Architecture</h2>
        <div className="text-center text-sm text-gray-400 font-mono bg-tron-darker/50 rounded-xl p-6">
          <pre className="whitespace-pre-wrap">{`
┌─────────────┐     x402 (HTTP 402)     ┌──────────────────┐
│  User/Agent │ ◄──────────────────────► │   AI PayGate     │
│  + Wallet   │    USDT/USDD on TRON    │   (Express.js)   │
└─────────────┘                          │                  │
                                         │  ┌────────────┐  │
  ┌────────────────┐                     │  │ x402 Gate  │  │
  │   TRON Network │ ◄──── Payment ────► │  │ Middleware  │  │
  │  (Nile/Main)   │    Verification     │  └────────────┘  │
  └────────────────┘                     │                  │
                                         │  ┌────────────┐  │
  ┌────────────────┐                     │  │  AI Engine  │  │
  │ Bank of AI     │ ◄── Facilitator ──► │  │  (GPT-4.1) │  │
  │ Facilitator    │                     │  └────────────┘  │
  └────────────────┘                     └──────────────────┘
          `}</pre>
        </div>
      </div>
    </div>
  );
}
