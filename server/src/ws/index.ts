// WebSocket server for real-time event broadcasting
import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';

export class WSServer {
  private wss: WebSocketServer;
  private clients: Set<WebSocket> = new Set();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      this.clients.add(ws);
      console.log(`[WS] Client connected (total: ${this.clients.size})`);

      ws.on('close', () => {
        this.clients.delete(ws);
        console.log(`[WS] Client disconnected (total: ${this.clients.size})`);
      });

      ws.on('error', () => {
        this.clients.delete(ws);
      });

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'system',
        data: { message: 'Connected to AI PayGate WebSocket' },
        timestamp: new Date().toISOString(),
      }));
    });
  }

  broadcast(event: { type: string; data: any }) {
    const message = JSON.stringify({
      ...event,
      timestamp: new Date().toISOString(),
    });

    for (const client of this.clients) {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    }
  }
}
