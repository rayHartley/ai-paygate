// AI PayGate - Entry Point
import http from 'http';
import { createApp } from './server';
import { initDb } from './db';
import { WSServer } from './ws';
import { config } from './config';

async function main() {
  console.log('='.repeat(50));
  console.log('  AI PayGate - AI Payment Agent on TRON');
  console.log('='.repeat(50));

  // Initialize database
  initDb();

  // Create Express app
  const app = createApp();

  // Create HTTP server
  const server = http.createServer(app);

  // Attach WebSocket
  const wsServer = new WSServer(server);
  (app as any).wsServer = wsServer;

  // Start listening
  server.listen(config.port, () => {
    console.log(`\n[Server] AI PayGate running on http://localhost:${config.port}`);
    console.log(`[Server] Network: TRON ${config.tronNetwork}`);
    console.log(`[Server] Mock Mode: ${config.mockMode}`);
    console.log(`[Server] LLM Model: ${config.llmModel}`);
    console.log(`\n[API] Services:    GET  /api/v1/services`);
    console.log(`[API] Chat (free): POST /api/v1/chat/free`);
    console.log(`[API] Chat (paid): POST /api/v1/chat/service`);
    console.log(`[API] Payments:    POST /api/v1/payments/create`);
    console.log(`[API] Health:      GET  /health`);
    console.log(`[WS]  WebSocket:   ws://localhost:${config.port}/ws\n`);
  });
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
