#!/bin/bash
# AI PayGate - Start Demo
set -e

echo "=========================================="
echo "  AI PayGate - AI Payment Agent on TRON"
echo "=========================================="
echo ""

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Check server .env
if [ ! -f "$PROJECT_DIR/server/.env" ]; then
  echo "[!] No server/.env found. Copying from .env.example..."
  cp "$PROJECT_DIR/server/.env.example" "$PROJECT_DIR/server/.env"
fi

# Kill existing processes
echo "[*] Cleaning up existing processes..."
kill $(lsof -ti:3000) 2>/dev/null || true
kill $(lsof -ti:5173) 2>/dev/null || true
sleep 1

# Start server
echo "[*] Starting backend server on port 3000..."
cd "$PROJECT_DIR/server"
npx tsx src/index.ts &
SERVER_PID=$!
sleep 3

# Health check
echo "[*] Checking server health..."
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null || echo "failed")
if echo "$HEALTH" | grep -q "ok"; then
  echo "[+] Server is healthy!"
else
  echo "[-] Server health check failed: $HEALTH"
  exit 1
fi

# Start frontend dev server
echo "[*] Starting frontend on port 5173..."
cd "$PROJECT_DIR/client"
npx vite --host 0.0.0.0 --port 5173 &
FRONTEND_PID=$!
sleep 3

echo ""
echo "=========================================="
echo "  AI PayGate is running!"
echo "=========================================="
echo ""
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:3000"
echo "  API Docs:  http://localhost:3000/api/v1/services"
echo "  Health:    http://localhost:3000/health"
echo ""
echo "  Press Ctrl+C to stop"
echo ""

# Wait for both
trap "kill $SERVER_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
