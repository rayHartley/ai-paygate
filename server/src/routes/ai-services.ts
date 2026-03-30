// AI Service Routes
import { Router, Request, Response } from 'express';
import { AI_SERVICES } from '../config';
import { x402Gate } from '../middleware/x402';
import { executeAIService, getFallbackResponse } from '../services/llm';
import { createInvocation } from '../db';
import { ok, err } from '../types';

const router = Router();

// List all available services
router.get('/services', (_req: Request, res: Response) => {
  const services = AI_SERVICES.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    category: s.category,
    priceUsdt: s.priceUsdt,
    icon: s.icon,
  }));
  res.json(ok(services));
});

// Get service details
router.get('/services/:serviceId', (req: Request, res: Response) => {
  const service = AI_SERVICES.find(s => s.id === req.params.serviceId);
  if (!service) {
    res.status(404).json(err('Service not found'));
    return;
  }
  res.json(ok({
    id: service.id,
    name: service.name,
    description: service.description,
    category: service.category,
    priceUsdt: service.priceUsdt,
    icon: service.icon,
  }));
});

// Invoke an AI service (x402 gated)
// Each service has its own endpoint with x402 payment gate
for (const service of AI_SERVICES) {
  router.post(
    `/services/${service.id}/invoke`,
    x402Gate({ serviceId: service.id }),
    async (req: Request, res: Response) => {
      const { prompt } = req.body;
      const payment = (req as any).payment;

      if (!prompt || typeof prompt !== 'string') {
        res.status(400).json(err('Missing or invalid prompt'));
        return;
      }

      try {
        // Try LLM first, fall back to demo response
        const llmResult = await executeAIService(service.id, service.systemPrompt, prompt);
        const result = llmResult.success ? llmResult.content : getFallbackResponse(service.id, prompt);

        // Record the invocation
        const invocationId = createInvocation(
          service.id,
          payment?.payer || req.headers['x-payer'] as string || '',
          prompt,
          result,
          payment?.payId || '',
          payment?.txHash
        );

        // Broadcast via WebSocket if available
        const wsServer = (req.app as any).wsServer;
        if (wsServer) {
          wsServer.broadcast({
            type: 'invocation',
            data: {
              invocationId,
              serviceId: service.id,
              serviceName: service.name,
              txHash: payment?.txHash,
              timestamp: new Date().toISOString(),
            },
          });
        }

        res.json(ok({
          result,
          invocationId,
          service: {
            id: service.id,
            name: service.name,
            price: service.priceUsdt,
          },
          payment: {
            payId: payment?.payId,
            txHash: payment?.txHash,
            amount: payment?.amount,
            isDemo: payment?.isDemo || false,
          },
          usage: llmResult.usage,
        }));
      } catch (e: any) {
        console.error(`[AI:${service.id}] Error:`, e.message);
        res.status(500).json(err(`Service execution failed: ${e.message}`));
      }
    }
  );
}

export default router;
