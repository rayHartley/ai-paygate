import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import { Send, Coins, Loader2, Sparkles, Lock } from 'lucide-react';
import { chatFree, chatService, getServices } from '../api';
import { useWallet, useChat } from '../stores';
import clsx from 'clsx';

interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  priceUsdt: number;
  icon: string;
}

export default function Chat() {
  const { serviceId } = useParams<{ serviceId?: string }>();
  const [input, setInput] = useState('');
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [activeService, setActiveService] = useState<string | null>(serviceId || null);
  const { messages, loading, addMessage, setLoading } = useChat();
  const { connected, address, connect } = useWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getServices().then((res) => {
      if (res.success) setServices(res.data);
    });
  }, []);

  useEffect(() => {
    if (serviceId) setActiveService(serviceId);
  }, [serviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedService = services.find((s) => s.id === activeService);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMessage });
    setLoading(true);

    try {
      if (activeService && selectedService) {
        // Paid service chat
        const res = await chatService(activeService, userMessage, {
          payer: address || 'user_' + Date.now().toString(36),
          demo: false, // Use real mode with free trial
        });

        if (res.success) {
          addMessage({
            role: 'assistant',
            content: res.data.result,
            serviceId: activeService,
            payment: res.data.payment,
          });
        } else if (res.error === 'Payment Required') {
          addMessage({
            role: 'system',
            content: `**Payment Required**: ${selectedService.name} costs **${selectedService.priceUsdt} USDT** per request.\n\nSend payment to \`${res.paymentRequired?.recipient}\` on TRON (${res.paymentRequired?.network}).\n\nPay ID: \`${res.paymentRequired?.payId}\``,
          });
        } else {
          addMessage({ role: 'assistant', content: `Error: ${res.error}` });
        }
      } else {
        // Free chat
        const chatMessages = messages
          .filter((m) => m.role !== 'system')
          .slice(-10)
          .map((m) => ({ role: m.role, content: m.content }));
        chatMessages.push({ role: 'user', content: userMessage });

        const res = await chatFree(chatMessages);
        if (res.success) {
          addMessage({ role: 'assistant', content: res.data.reply });
        } else {
          addMessage({ role: 'assistant', content: `Sorry, I encountered an error. Please try again.` });
        }
      }
    } catch (e: any) {
      addMessage({ role: 'assistant', content: `Error: ${e.message || 'Request failed'}` });
    }

    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Service selector */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveService(null)}
          className={clsx(
            'px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all flex items-center gap-1.5',
            !activeService
              ? 'bg-tron-accent/20 text-tron-accent'
              : 'text-gray-400 hover:bg-white/5'
          )}
        >
          <Sparkles size={14} />
          Free Chat
        </button>
        {services.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveService(s.id)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-all flex items-center gap-1.5',
              activeService === s.id
                ? 'bg-tron-accent/20 text-tron-accent'
                : 'text-gray-400 hover:bg-white/5'
            )}
          >
            <span>{s.icon}</span>
            {s.name}
            <span className="text-xs opacity-60">{s.priceUsdt} USDT</span>
          </button>
        ))}
      </div>

      {/* Service info banner */}
      {selectedService && (
        <div className="glass rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{selectedService.icon}</span>
            <div>
              <div className="font-semibold text-white">{selectedService.name}</div>
              <div className="text-xs text-gray-400">{selectedService.description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Coins size={16} className="text-tron-accent" />
            <span className="text-tron-accent font-semibold">{selectedService.priceUsdt} USDT</span>
            <span className="text-xs text-gray-500">per request</span>
            <Lock size={14} className="text-gray-500 ml-2" />
            <span className="text-xs text-gray-500">x402</span>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            <Sparkles size={40} className="mx-auto mb-4 text-tron-accent/30" />
            <p className="text-lg mb-2">
              {activeService
                ? `Start a conversation with ${selectedService?.name || 'this service'}`
                : 'Ask me anything — I\'m AI PayGate Assistant'}
            </p>
            <p className="text-sm">
              {activeService
                ? 'Your message will be processed after x402 payment verification'
                : 'Free chat — no payment required. Try paid services for premium AI.'}
            </p>
          </div>
        )}

        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={clsx('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={clsx(
                'max-w-[80%] rounded-xl px-4 py-3',
                msg.role === 'user'
                  ? 'bg-tron-accent/20 text-white'
                  : msg.role === 'system'
                  ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-200'
                  : 'glass text-gray-200'
              )}
            >
              <div className="markdown-content text-sm">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>

              {msg.payment && (
                <div className="mt-2 pt-2 border-t border-white/10 text-xs text-gray-400 flex items-center gap-2">
                  <Coins size={12} className="text-green-400" />
                  <span>Paid: {msg.payment.amount} USDT</span>
                  {msg.payment.txHash && (
                    <span className="text-gray-500">tx: {msg.payment.txHash.slice(0, 12)}...</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="glass rounded-xl px-4 py-3 flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <span className="text-sm">Thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="glass rounded-xl p-3">
        {!connected && activeService && (
          <div className="text-center py-2 mb-2">
            <button
              onClick={() => connect()}
              className="px-4 py-1.5 rounded-lg bg-tron-accent/20 text-tron-accent text-sm hover:bg-tron-accent/30 transition-colors"
            >
              Connect Wallet to Use Paid Services
            </button>
          </div>
        )}
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder={
              activeService
                ? `Message ${selectedService?.name || 'AI Service'}... (${selectedService?.priceUsdt} USDT/req)`
                : 'Ask me anything (free)...'
            }
            className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-sm"
            disabled={loading}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="p-2 rounded-lg bg-tron-accent/20 text-tron-accent hover:bg-tron-accent/30 disabled:opacity-30 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
