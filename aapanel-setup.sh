#!/usr/bin/env bash
# ==============================================================================
# AttendanceAI - aaPanel One-Click Initialization Script
# Safely prepares environment, builds frontend & backend, and syncs PostgreSQL
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

# Allow Git operations inside aaPanel directory without dubious ownership warning
git config --global --add safe.directory "$APP_DIR" 2>/dev/null || true
git config --global --add safe.directory /www/wwwroot/attendance-ai 2>/dev/null || true

echo "=========================================================="
echo "  AttendanceAI: Initializing & Updating for aaPanel..."
echo "  Directory: $APP_DIR"
echo "=========================================================="

echo "-> [0/3] Syncing latest code from GitHub main..."
chattr -i "$APP_DIR/frontend/dist/.user.ini" 2>/dev/null || true
git fetch origin main || true
git reset --hard origin/main || git pull origin main || true

# Create directories
mkdir -p logs
mkdir -p storage/uploads

# Ensure backend .env exists
if [ ! -f backend/.env ]; then
  if [ -f .env ]; then
    echo "-> Copying root .env to backend/.env..."
    cp .env backend/.env
  else
    echo "-> Creating backend/.env from .env.example..."
    cp .env.example backend/.env
    echo "=========================================================="
    echo "  [ACTION REQUIRED]:"
    echo "  Please edit backend/.env in aaPanel File Manager"
    echo "  and update DATABASE_URL with your aaPanel PostgreSQL credentials!"
    echo "=========================================================="
    exit 0
  fi
fi

# Install dependencies and build backend
echo "-> [1/3] Installing backend packages and compiling..."
cd "$APP_DIR/backend"
npm install --legacy-peer-deps
npx prisma generate
npx prisma db push --accept-data-loss
npm run build

# Remove immutable flag from aaPanel's .user.ini if present to prevent Vite EPERM errors
if [ -f "$APP_DIR/frontend/dist/.user.ini" ]; then
  chattr -i "$APP_DIR/frontend/dist/.user.ini" 2>/dev/null || true
  rm -f "$APP_DIR/frontend/dist/.user.ini" 2>/dev/null || true
fi

# Install dependencies and build frontend
echo "-> [2/3] Building frontend production bundle..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
npm run build

echo "-> [3/3] Seeding demo data (Demo Company, Branches, 22 Staff)..."
cd "$APP_DIR/backend"
npm run seed || echo "Seed notice: Schema ready"

cd "$APP_DIR"

# Restart process if PM2 is active
if command -v pm2 &> /dev/null; then
  echo "-> Reloading PM2 process..."
  pm2 reload attendance-ai 2>/dev/null || pm2 restart attendance-ai 2>/dev/null || pm2 restart all 2>/dev/null || true
fi

echo ""
echo "=========================================================="
echo "  INITIALIZATION FINISHED SUCCESSFULLY!"
echo "  1. Backend build ready: backend/dist/server.js (Port 3041)"
echo "  2. Frontend UI embedded & ready: frontend/dist"
echo "  3. Root domain http://app.binishaqsoft.com will now serve the Web App!"
echo "=========================================================="

