// Express server setup
import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './config';
import aiServiceRoutes from './routes/ai-services';
import paymentRoutes from './routes/payments';
import chatRoutes from './routes/chat';

export function createApp() {
  const app = express();

  // Middleware
  app.use(cors({ origin: config.corsOrigin }));
  app.use(express.json({ limit: '10mb' }));

  // API routes
  app.use('/api/v1', aiServiceRoutes);
  app.use('/api/v1', paymentRoutes);
  app.use('/api/v1', chatRoutes);

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'ai-paygate',
      version: '1.0.0',
      network: config.tronNetwork,
      mockMode: config.mockMode,
      timestamp: new Date().toISOString(),
    });
  });

  // Serve static frontend (production)
  const clientDist = path.join(__dirname, '../../client/dist');
  app.use(express.static(clientDist));

  // SPA fallback
  app.get('*', (_req, res) => {
    const indexPath = path.join(clientDist, 'index.html');
    const fs = require('fs');
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.json({
        service: 'AI PayGate',
        message: 'Backend is running. Frontend not built yet. Run "cd client && npm run build" first.',
        docs: '/api/v1/services',
      });
    }
  });

  return app;
}
