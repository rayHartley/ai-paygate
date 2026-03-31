# AI PayGate — AI Payment Agent on TRON

> **TRON x Bank of AI Hackathon 2026** — AI Payment Agent

🌐 **[Live Website](https://ai-paygate.onrender.com)** — Try now with virtual wallet balances!

AI PayGate is an AI-powered micropayment gateway that lets AI agents provide services and automatically collect payments in USDT/USDD on the TRON blockchain via the **x402 payment protocol**.

## ✨ Features

- **5 AI Services**: Writing Assistant, Translator, Code Review, Data Analyst, Summarizer
- **x402 Payment Protocol**: Pay-per-request micropayments — no subscriptions, no accounts needed
- **TRON Network**: Fast, low-cost payments in USDT/USDD on Nile testnet or Mainnet
- **Bank of AI Integration**: x402 payment verification and settlement
- **Real-time Dashboard**: Monitor payments, invocations, and system status via WebSocket
- **Demo Mode**: Try everything with virtual wallet (2 USDT test balance) — no real payment needed
- **One-Click Deployment**: Deploy to Render in minutes with built-in CI/CD

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
| AI Engine | Claude Haiku 4.5 (Anthropic API) |
| Payment Protocol | x402 (Bank of AI) |
| Database | SQLite (better-sqlite3, WAL mode) |
| WebSocket | ws 8.x (real-time events) |
| Frontend | React 18 + Vite + Tailwind CSS |
| State Management | Zustand |
| Animation | Framer Motion |
| Deployment | Render (Node.js)

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

### 🌐 Public Demo (Easiest)

Visit the live deployment: **[https://ai-paygate.onrender.com](https://ai-paygate.onrender.com)**

1. Click "Connect Wallet" → Get virtual 2 USDT balance
2. Select a service (Chat tab)
3. Type your message → Auto-simulates x402 payment flow
4. See AI result instantly

**No wallet, no real payment needed!** This is Demo Mode in action.

### 💻 Local Development

#### Prerequisites
- Node.js >= 18
- npm >= 9
- TronLink wallet (optional, for real testnet)

#### Installation

```bash
# Clone the repo
git clone https://github.com/rayHartley/ai-paygate.git
cd ai-paygate

# Install dependencies for both frontend and backend
cd client && npm install && cd ../server && npm install && cd ..

# Configure environment
cp server/.env.example server/.env
# Edit server/.env with your keys
```

#### Run Locally in Demo Mode

```bash
# Terminal 1: Start backend (port 3000)
cd server
npx tsx src/index.ts

# Terminal 2: Start frontend (port 5173)
cd client
npx vite --host 0.0.0.0 --port 5173
```

Open http://localhost:5173

#### Configuration Options

**Demo Mode (Recommended for testing):**
```env
TRON_NETWORK=nile
MOCK_MODE=true
LLM_API_KEY=sk-ant-...
```

**Real Payment (Requires TRON Nile testnet account):**
```env
TRON_NETWORK=nile
MOCK_MODE=false
PAYMENT_RECIPIENT=your_tron_nile_address
LLM_API_KEY=sk-ant-...
```

**Mainnet (Requires real TRON account and USDT):**
```env
TRON_NETWORK=mainnet
MOCK_MODE=false
PAYMENT_RECIPIENT=your_tron_mainnet_address
LLM_API_KEY=sk-ant-...
```

### 🚀 Deploy to Render

1. Push code to GitHub
2. Connect GitHub to Render
3. Create Web Service → Select `ai-paygate` repo
4. Environment variables are in `render.yaml` (or set in Render Dashboard):
   - `TRON_NETWORK=nile`
   - `MOCK_MODE=true` (for demo)
   - `LLM_API_KEY=sk-ant-...`
5. Deploy!

### Run with Real TRON Keys

Edit `server/.env`:
```env
TRON_NETWORK=nile
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

## x402 Payment Flow (Demo Mode)

When `MOCK_MODE=true`, the payment flow is fully simulated:

```
1. User clicks "Connect Wallet"
   ↓
2. Frontend assigns virtual balance (2 USDT)
   ↓
3. User selects service and sends message
   ↓
4. Backend returns HTTP 402 Payment Required
   ↓
5. Frontend simulates payment (no real transaction)
   ↓
6. Backend verifies (mock verification)
   ↓
7. AI service processes request and returns result
```

## Real Payment Flow (MOCK_MODE=false)

With real TRON Nile/Mainnet:

```
1. User connects TRON wallet (TronLink)
   ↓
2. User sends message to AI service
   ↓
3. Server returns HTTP 402 with payment details:
   - Amount: 0.10 USDT (example)
   - Recipient: TYHPR2gWp2ABy7aKhC9uX6B9iXwWZEwFGB
   - Network: TRON Nile/Mainnet
   ↓
4. User approves payment in TronLink
   ↓
5. Frontend gets transaction hash
   ↓
6. Server verifies payment on-chain
   ↓
7. AI service processes and returns result
```

## Project Structure

```
ai-paygate/
├── server/                    # Backend (Node.js + Express)
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
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── App.tsx           # Routes
│   │   ├── api.ts            # API client
│   │   ├── stores.ts         # Zustand state stores
│   │   ├── index.css         # Tailwind + custom styles
│   │   ├── components/
│   │   │   └── Layout.tsx    # App layout & navigation
│   │   └── pages/
│   │       ├── Home.tsx      # Landing page
│   │       ├── Services.tsx  # Service marketplace
│   │       ├── Chat.tsx      # Chat interface (x402 gated)
│   │       └── Dashboard.tsx # Analytics dashboard
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
│
├── render.yaml               # Render deployment config
├── package.json              # Root package.json
└── README.md
```

## Testing & Usage

### Test Demo Mode Features

1. **Home Page** - See project overview and x402 architecture
2. **Services** - Browse 5 AI services with pricing
3. **Chat (Free)** - Free chat without payment
4. **Chat (Paid)** - Select service, message will trigger x402 flow
   - In Demo Mode: simulates payment automatically
   - In Real Mode: requires TronLink wallet payment
5. **Dashboard** - View payment statistics and transaction history

### How to Test Different Scenarios

**Scenario A: Quick Demo (No Setup)**
```
→ Visit https://ai-paygate-xxxxx.onrender.com
→ Click "Connect Wallet" (gets virtual 2 USDT)
→ Go to Chat, select service, type message
→ See x402 flow in action
```

**Scenario B: Local Testing**
```bash
# Terminal 1
cd server && npx tsx src/index.ts

# Terminal 2
cd client && npx vite

# Browser
→ http://localhost:5173
→ Same flow as Scenario A
```

**Scenario C: Real Nile Testnet**
```bash
# Setup
→ Create TRON Nile wallet (TronLink)
→ Get free TRX + USDT test coins from faucet
→ Set MOCK_MODE=false in .env
→ Set PAYMENT_RECIPIENT to your Nile address

# Test
→ Connect real wallet
→ Send payment for service
→ Check on TronScan Nile explorer
```

## Resources & Links

- **Live Demo**: https://ai-paygate-xxxxx.onrender.com
- **GitHub**: https://github.com/rayHartley/ai-paygate
- **Bank of AI**: https://bankofai.io
- **TRON Network**: https://tron.network
- **TRON Nile Faucet**: https://nile.trongrid.io (Get free test TRX/USDT)
- **TronScan Nile**: https://nile.tronscan.org (View transactions)
- **Render**: https://render.com (Deployment platform)

## Development

```bash
# Format code
npm run lint

# Build for production
npm run build

# Run tests (if added)
npm run test
```

## Common Issues

**Q: "Connect Wallet" not showing virtual balance**
- Clear browser cache (Ctrl+Shift+Del)
- Make sure you're in Demo Mode (MOCK_MODE=true)
- Check browser console for errors

**Q: Payment not working in real mode**
- Confirm you have USDT balance on TRON Nile/Mainnet
- Make sure TronLink is connected and unlocked
- Check that MOCK_MODE=false and PAYMENT_RECIPIENT is set

**Q: Render deployment fails**
- Verify `render.yaml` exists in root directory
- Check environment variables are set (especially LLM_API_KEY)
- View build logs in Render Dashboard for details

## License

MIT

---

## Citation

If you use this project in research or production, please cite:

```bibtex
@software{aipaygate2026,
  title={AI PayGate: AI Payment Agent on TRON},
  author={rayHartley},
  year={2026},
  howpublished={\url{https://github.com/rayHartley/ai-paygate}}
}
```

---

**Built for TRON x Bank of AI Hackathon 2026**

🚀 Deploy it. 🎯 Test it. 🌟 Share it.
