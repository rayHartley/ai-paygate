import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getServices } from '../api';
import { useWallet } from '../stores';
import { Coins, ArrowRight } from 'lucide-react';
import clsx from 'clsx';

interface ServiceInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  priceUsdt: number;
  icon: string;
}

export default function Services() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const navigate = useNavigate();
  const { connected, connect } = useWallet();

  useEffect(() => {
    getServices().then((res) => {
      if (res.success) setServices(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const categories = ['All', ...new Set(services.map((s) => s.category))];
  const filtered = selectedCategory === 'All'
    ? services
    : services.filter((s) => s.category === selectedCategory);

  const handleUseService = (serviceId: string) => {
    if (!connected) {
      connect().then(() => navigate(`/chat/${serviceId}`));
    } else {
      navigate(`/chat/${serviceId}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold gradient-text mb-2">AI Services</h1>
        <p className="text-gray-400">
          Pay-per-use AI services powered by x402 micropayments on TRON
        </p>
      </div>

      {/* Category filters */}
      <div className="flex gap-2 mb-6">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={clsx(
              'px-3 py-1.5 rounded-lg text-sm transition-all',
              selectedCategory === cat
                ? 'bg-tron-accent/20 text-tron-accent'
                : 'text-gray-400 hover:bg-white/5'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service cards */}
      {loading ? (
        <div className="text-center text-gray-400 py-12">Loading services...</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="glass rounded-xl p-6 hover:border-tron-accent/30 transition-all group cursor-pointer"
              onClick={() => handleUseService(service.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{service.icon}</div>
                <span className="px-2 py-0.5 rounded-full bg-tron-blue/30 text-xs text-gray-300">
                  {service.category}
                </span>
              </div>

              <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-tron-accent transition-colors">
                {service.name}
              </h3>
              <p className="text-sm text-gray-400 mb-4 line-clamp-2">{service.description}</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-tron-accent">
                  <Coins size={16} />
                  <span className="font-semibold">{service.priceUsdt} USDT</span>
                  <span className="text-xs text-gray-500">/ request</span>
                </div>
                <div className="text-gray-500 group-hover:text-tron-accent transition-colors">
                  <ArrowRight size={18} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
