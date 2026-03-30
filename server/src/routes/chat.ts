// Chat Route - Unified AI chat endpoint with payment gate
import { Router, Request, Response } from 'express';
import { AI_SERVICES, config } from '../config';
import { createPayment, updatePaymentStatus, createInvocation } from '../db';
import { verifyTransaction, getWalletAddress } from '../tron/client';
import { callLLM, getFallbackResponse } from '../services/llm';
import { ok, err } from '../types';
import type { ChatMessage } from '../types';

const router = Router();

// Free chat endpoint - general purpose, no payment needed
router.post('/chat/free', async (req: Request, res: Response) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    res.status(400).json(err('messages array required'));
    return;
  }

  const systemMessage: ChatMessage = {
    role: 'system',
    content: `You are AI PayGate Assistant, a helpful AI running on TRON blockchain via x402 payment protocol.
You can help users understand the platform, available AI services, and how payments work.
Available services: ${AI_SERVICES.map(s => `${s.name} (${s.priceUsdt} USDT)`).join(', ')}.
The platform runs on TRON ${config.tronNetwork} network.
Be concise, helpful, and encourage users to try the paid AI services for better results.`,
  };

  const allMessages = [systemMessage, ...messages];

  const result = await callLLM(allMessages);
  if (result.success) {
    res.json(ok({ reply: result.content, usage: result.usage }));
  } else {
    // Fallback response
    res.json(ok({
      reply: `Welcome to AI PayGate! I'm your assistant. We offer ${AI_SERVICES.length} AI services powered by x402 micropayments on TRON. Try our AI Writing Assistant, Translator, Code Review, Data Analyst, or Summarizer. Each service costs a small fee in USDT. How can I help you?`,
      isFallback: true,
    }));
  }
});

// Paid service chat endpoint
router.post('/chat/service', async (req: Request, res: Response) => {
  const { serviceId, prompt, txHash, payId, payer } = req.body;

  if (!serviceId || !prompt) {
    res.status(400).json(err('serviceId and prompt required'));
    return;
  }

  const service = AI_SERVICES.find(s => s.id === serviceId);
  if (!service) {
    res.status(404).json(err('Service not found'));
    return;
  }

  // Check payment
  let paymentValid = false;
  let finalPayId = payId;
  let finalTxHash = txHash;

  // Demo mode bypass
  if (config.mockMode && (req.headers['x-demo-mode'] === 'true' || req.body.demo === true)) {
    finalPayId = createPayment(serviceId, service.priceUsdt, 'USDT', getWalletAddress());
    finalTxHash = `mock_chat_${Date.now()}`;
    updatePaymentStatus(finalPayId, 'paid', finalTxHash, payer || 'TDemoUser');
    paymentValid = true;
  }

  // Verify tx hash if provided
  if (!paymentValid && txHash) {
    const isValid = await verifyTransaction(txHash);
    if (isValid) {
      if (!finalPayId) {
        finalPayId = createPayment(serviceId, service.priceUsdt, 'USDT', getWalletAddress());
      }
      updatePaymentStatus(finalPayId, 'paid', txHash, payer || '');
      paymentValid = true;
    }
  }

  if (!paymentValid) {
    // Return 402 - need payment
    const recipient = config.paymentRecipient || getWalletAddress();
    const newPayId = createPayment(serviceId, service.priceUsdt, 'USDT', recipient);

    res.status(402).json({
      success: false,
      error: 'Payment Required',
      paymentRequired: {
        payId: newPayId,
        amount: service.priceUsdt,
        token: 'USDT',
        recipient,
        network: `tron:${config.tronNetwork}`,
        serviceName: service.name,
        message: `Send ${service.priceUsdt} USDT to ${recipient} on TRON (${config.tronNetwork})`,
      },
    });
    return;
  }

  // Payment verified - execute service
  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: service.systemPrompt },
      { role: 'user', content: prompt },
    ];

    const llmResult = await callLLM(messages);
    const result = llmResult.success ? llmResult.content : getFallbackResponse(serviceId, prompt);

    const invocationId = createInvocation(serviceId, payer || '', prompt, result, finalPayId, finalTxHash);

    res.json(ok({
      result,
      invocationId,
      service: { id: service.id, name: service.name, price: service.priceUsdt },
      payment: { payId: finalPayId, txHash: finalTxHash },
      usage: llmResult.usage,
    }));
  } catch (e: any) {
    res.status(500).json(err(`Service execution failed: ${e.message}`));
  }
});

export default router;
