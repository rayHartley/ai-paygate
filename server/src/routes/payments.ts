// Payment Routes
import { Router, Request, Response } from 'express';
import { config } from '../config';
import { createPayment, getPayment, updatePaymentStatus, getPaymentStats, getRecentInvocations } from '../db';
import { verifyTransaction, getWalletAddress, getTrxBalance, getTrc20Balance } from '../tron/client';
import { ok, err } from '../types';

const router = Router();

// Create a payment request
router.post('/payments/create', (req: Request, res: Response) => {
  const { serviceId, token = 'USDT' } = req.body;
  const { AI_SERVICES } = require('../config');
  const service = AI_SERVICES.find((s: any) => s.id === serviceId);

  if (!service) {
    res.status(404).json(err('Service not found'));
    return;
  }

  const recipient = config.paymentRecipient || getWalletAddress();
  const payId = createPayment(serviceId, service.priceUsdt, token, recipient);

  res.json(ok({
    payId,
    amount: service.priceUsdt,
    token,
    recipient,
    network: `tron:${config.tronNetwork}`,
    expiresInMinutes: 30,
  }));
});

// Check payment status
router.get('/payments/:payId', (req: Request, res: Response) => {
  const payment = getPayment(req.params.payId);
  if (!payment) {
    res.status(404).json(err('Payment not found'));
    return;
  }
  res.json(ok(payment));
});

// Verify and settle payment
router.post('/payments/:payId/verify', async (req: Request, res: Response) => {
  const { txHash, payer } = req.body;
  const payment = getPayment(req.params.payId);

  if (!payment) {
    res.status(404).json(err('Payment not found'));
    return;
  }

  if (payment.status === 'paid') {
    res.json(ok({ verified: true, message: 'Payment already verified' }));
    return;
  }

  if (!txHash) {
    res.status(400).json(err('txHash required'));
    return;
  }

  try {
    const isValid = await verifyTransaction(txHash);
    if (isValid) {
      updatePaymentStatus(req.params.payId, 'paid', txHash, payer);

      // Broadcast via WebSocket
      const wsServer = (req.app as any).wsServer;
      if (wsServer) {
        wsServer.broadcast({
          type: 'payment',
          data: {
            payId: req.params.payId,
            txHash,
            amount: payment.amount,
            token: payment.token,
            payer,
            status: 'paid',
          },
        });
      }

      res.json(ok({ verified: true, txHash }));
    } else {
      res.json(ok({ verified: false, message: 'Transaction not found or not confirmed' }));
    }
  } catch (e: any) {
    res.status(500).json(err(`Verification failed: ${e.message}`));
  }
});

// Get payment stats
router.get('/stats', (_req: Request, res: Response) => {
  const stats = getPaymentStats();
  res.json(ok(stats));
});

// Get recent invocations
router.get('/invocations', (req: Request, res: Response) => {
  const limit = parseInt(req.query.limit as string) || 20;
  const invocations = getRecentInvocations(limit);
  res.json(ok(invocations));
});

// Get wallet info
router.get('/wallet', async (_req: Request, res: Response) => {
  const address = config.paymentRecipient || getWalletAddress();
  try {
    const [trx, usdt, usdd] = await Promise.all([
      getTrxBalance(address),
      getTrc20Balance(address, 'USDT'),
      getTrc20Balance(address, 'USDD'),
    ]);

    res.json(ok({
      address,
      network: config.tronNetwork,
      mockMode: config.mockMode,
      balances: { TRX: trx, USDT: usdt, USDD: usdd },
    }));
  } catch (e: any) {
    res.status(500).json(err(`Wallet query failed: ${e.message}`));
  }
});

export default router;
