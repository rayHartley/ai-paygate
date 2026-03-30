# AI PayGate — AI Payment Agent on TRON

> **TRON x Bank of AI Hackathon 2026** — AI Payment Agent

AI PayGate is an AI-powered micropayment gateway that lets AI agents provide services and automatically collect payments in USDT/USDD on the TRON blockchain via the **x402 payment protocol**.

## Features

- **5 AI Services**: Writing Assistant, Translator, Code Review, Data Analyst, Summarizer
- **x402 Payment Protocol**: Pay-per-request micropayments — no subscriptions, no accounts needed
- **TRON Network**: Fast, low-cost payments in USDT/USDD
- **Bank of AI Integration**: Uses facilitator for payment verification and settlement
- **Real-time Dashboard**: Monitor payments, invocations, and system status via WebSocket
- **Demo Mode**: Try everything without real TRON keys

## Architecture

```
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
```

### Payment Flow (x402 Protocol)

1. Client requests AI service endpoint (e.g., `POST /api/v1/services/ai-writer/invoke`)
2. Server returns **HTTP 402 Payment Required** with payment details in `X-Payment-Required` header
3. Client sends USDT payment to the recipient address on TRON
4. Client retries the request with `X-Tx-Hash` header containing the transaction hash
5. Server verifies the payment on-chain and delivers the AI service result

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express + TypeScript |
| Blockchain | TronWeb 6.x (TRON SDK) |
| AI Engine | GPT-4.1 (OpenAI-compatible API) |
| Payment | x402 Protocol (Bank of AI Facilitator) |
| Database | SQLite (better-sqlite3, WAL mode) |
| WebSocket | ws 8.x (real-time events) |
| Frontend | React 18 + Vite + Tailwind CSS |
| State | Zustand |
| Animation | Framer Motion |

## Bank of AI Integration

### x402 Payment Protocol
- Custom Express middleware (`x402Gate`) implements the x402 payment flow
- Returns HTTP 402 with `PaymentRequired` object containing network, asset, amount, recipient
- Supports payment verification via on-chain transaction lookup
- Integrates with Bank of AI facilitator at `https://facilitator.bankofai.io`

### TRON Network
- Supports TRON Nile (testnet), Shasta (testnet), and Mainnet
- TRC20 token operations: balance queries, transfers, payment verification
- Multi-token support: USDT, USDD

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Installation

```bash
# Clone the repo
cd ai-paygate

# Install all dependencies
cd server && npm install && cd ../client && npm install && cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your API keys
```

### Run in Demo Mode

```bash
# Start the backend (port 3000)
cd server && npx tsx src/index.ts

# In another terminal, start the frontend (port 5173)
cd client && npx vite --host 0.0.0.0 --port 5173
```

Open http://localhost:5173 in your browser.

### Run with Real TRON Keys

Edit `server/.env`:
```env
TRON_NETWORK=nile
TRON_PRIVATE_KEY=your_private_key_here
PAYMENT_RECIPIENT=your_tron_address
MOCK_MODE=false
LLM_API_KEY=your_llm_api_key
```

## API Reference

### Services

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/services` | GET | List all AI services |
| `/api/v1/services/:id` | GET | Get service details |
| `/api/v1/services/:id/invoke` | POST | Invoke service (x402 gated) |

### Chat

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/chat/free` | POST | Free chat (no payment) |
| `/api/v1/chat/service` | POST | Paid service chat (x402) |

### Payments

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/payments/create` | POST | Create payment request |
| `/api/v1/payments/:payId` | GET | Check payment status |
| `/api/v1/payments/:payId/verify` | POST | Verify payment with tx hash |
| `/api/v1/wallet` | GET | Get service wallet info |
| `/api/v1/stats` | GET | Get payment statistics |

### x402 Headers

| Header | Direction | Description |
|--------|-----------|-------------|
| `X-Payment-Required` | Response | Base64 encoded payment requirements |
| `X-Pay-Id` | Response | Payment ID for tracking |
| `X-Tx-Hash` | Request | Transaction hash for verification |
| `X-Payer` | Request | Payer wallet address |
| `X-Demo-Mode: true` | Request | Skip payment (demo mode only) |

## AI Services & Pricing

| Service | Price | Description |
|---------|-------|-------------|
| AI Writing Assistant | 0.10 USDT | Professional content writing |
| AI Translator | 0.05 USDT | Multi-language translation |
| AI Code Review | 0.15 USDT | Expert code analysis |
| AI Data Analyst | 0.20 USDT | Data insights & recommendations |
| AI Summarizer | 0.03 USDT | Text summarization |

## Project Structure

```
ai-paygate/
├── server/                    # Backend
│   ├── src/
│   │   ├── index.ts          # Entry point
│   │   ├── server.ts         # Express app setup
│   │   ├── config.ts         # Configuration & service definitions
│   │   ├── types.ts          # TypeScript types
│   │   ├── routes/
│   │   │   ├── ai-services.ts  # Service endpoints with x402
│   │   │   ├── payments.ts     # Payment management
│   │   │   └── chat.ts         # Chat endpoints
│   │   ├── middleware/
│   │   │   └── x402.ts        # x402 payment gate middleware
│   │   ├── services/
│   │   │   └── llm.ts         # LLM API wrapper
│   │   ├── tron/
│   │   │   └── client.ts      # TRON blockchain client
│   │   ├── db/
│   │   │   └── index.ts       # SQLite database
│   │   └── ws/
│   │       └── index.ts       # WebSocket server
│   └── .env                   # Environment config
├── client/                    # Frontend
│   ├── src/
│   │   ├── App.tsx           # Routes
│   │   ├── api.ts            # API client
│   │   ├── stores.ts         # Zustand stores
│   │   ├── components/
│   │   │   └── Layout.tsx    # App layout
│   │   └── pages/
│   │       ├── Home.tsx      # Landing page
│   │       ├── Services.tsx  # Service marketplace
│   │       ├── Chat.tsx      # Chat interface
│   │       └── Dashboard.tsx # Analytics dashboard
│   └── index.html
└── README.md
```

## License

MIT

---

*Built for TRON x Bank of AI Hackathon 2026*
