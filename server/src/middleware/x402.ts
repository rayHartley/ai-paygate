// x402 Payment Gate Middleware
// Implements the x402 payment protocol for AI service endpoints
import { Request, Response, NextFunction } from 'express';
import { config, AI_SERVICES } from '../config';
import { createPayment, getPayment, updatePaymentStatus } from '../db';
import { verifyTransaction, getWalletAddress } from '../tron/client';
import type { X402PaymentRequired } from '../types';

interface X402GateOptions {
  serviceId: string;
}

/**
 * x402 Payment Gate Middleware
 *
 * Flow:
 * 1. Client requests AI service endpoint
 * 2. If no payment header → return 402 with payment requirements
 * 3. If payment header present → verify payment → allow access
 */
export function x402Gate(options: X402GateOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const { serviceId } = options;
    const service = AI_SERVICES.find(s => s.id === serviceId);

    if (!service) {
      res.status(404).json({ success: false, error: 'Service not found' });
      return;
    }

    // Check for x402 payment signature header
    const paymentHeader = req.headers['x-payment-signature'] || req.headers['payment-signature'];
    const txHash = req.headers['x-tx-hash'] as string || req.body?.txHash;
    const payId = req.headers['x-pay-id'] as string || req.body?.payId;
    const payer = req.headers['x-payer'] as string || req.body?.payer;

    // If we have a payId, check if it's already paid
    if (payId) {
      const payment = getPayment(payId);
      if (payment && payment.status === 'paid') {
        // Payment already verified, allow through
        (req as any).payment = payment;
        next();
        return;
      }
    }

    // If we have a tx hash, verify the payment
    if (txHash) {
      try {
        const isValid = await verifyTransaction(txHash);
        if (isValid) {
          // Create or update payment record
          const newPayId = payId || createPayment(serviceId, service.priceUsdt, 'USDT', getWalletAddress());
          updatePaymentStatus(newPayId, 'paid', txHash, payer || '');

          (req as any).payment = {
            payId: newPayId,
            txHash,
            amount: service.priceUsdt,
            status: 'paid',
          };
          next();
          return;
        }
      } catch (e: any) {
        console.error('[x402] Payment verification error:', e.message);
      }
    }

    // Check for mock mode bypass (for demo purposes)
    if (config.mockMode && (req.headers['x-demo-mode'] === 'true' || req.query.demo === 'true')) {
      const demoPayId = createPayment(serviceId, service.priceUsdt, 'USDT', getWalletAddress());
      const mockTxHash = `mock_demo_${Date.now()}`;
      updatePaymentStatus(demoPayId, 'paid', mockTxHash, 'TDemoUser' + Date.now().toString(36));

      (req as any).payment = {
        payId: demoPayId,
        txHash: mockTxHash,
        amount: service.priceUsdt,
        status: 'paid',
        isDemo: true,
      };
      next();
      return;
    }

    // No valid payment found → return 402 Payment Required
    const recipient = config.paymentRecipient || getWalletAddress();
    const network = `tron:${config.tronNetwork}`;

    const paymentRequired: X402PaymentRequired = {
      version: '1',
      requirements: [
        {
          scheme: 'exact',
          network,
          asset: 'USDT',
          amount: service.priceUsdt.toString(),
          recipient,
          extra: {
            serviceId: service.id,
            serviceName: service.name,
            facilitator: config.facilitatorUrl,
          },
        },
      ],
    };

    // Create a pending payment
    const pendingPayId = createPayment(serviceId, service.priceUsdt, 'USDT', recipient);

    // Return 402 with payment details
    const paymentRequiredBase64 = Buffer.from(JSON.stringify(paymentRequired)).toString('base64');

    res.status(402)
      .set('X-Payment-Required', paymentRequiredBase64)
      .set('X-Pay-Id', pendingPayId)
      .set('X-Payment-Network', network)
      .set('X-Payment-Amount', service.priceUsdt.toString())
      .set('X-Payment-Asset', 'USDT')
      .set('X-Payment-Recipient', recipient)
      .json({
        success: false,
        error: 'Payment Required',
        paymentRequired: {
          ...paymentRequired,
          payId: pendingPayId,
          message: `This service requires ${service.priceUsdt} USDT on TRON (${config.tronNetwork}). Send payment to ${recipient} and include the tx hash in the X-Tx-Hash header.`,
        },
      });
  };
}
