#!/usr/bin/env bash
# ==============================================================================
# AttendanceAI: Automated Server Deployment Script (Ubuntu / aaPanel)
# Safe, isolated deployment without affecting existing websites
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "--------------------------------------------------------"
echo "  Deploying AttendanceAI Platform on $(hostname)"
echo "  Directory: $APP_DIR"
echo "--------------------------------------------------------"

# 1. Ensure required storage and log directories exist
mkdir -p logs
mkdir -p storage/uploads

# 2. Check for root .env or backend/.env
if [ ! -f backend/.env ]; then
  if [ -f .env ]; then
    echo "[Config] Copying root .env to backend/.env..."
    cp .env backend/.env
  else
    echo "[ERROR] backend/.env file not found!"
    echo "Please create backend/.env from .env.example with your PostgreSQL credentials before running deploy.sh."
    exit 1
  fi
fi

# 3. Backend Deployment
echo "[1/4] Installing backend dependencies & generating Prisma Client..."
cd backend
npm install --omit=dev --legacy-peer-deps
npx prisma generate

echo "[2/4] Applying database migrations & building backend..."
npx prisma db push # Safe sync (or 'npx prisma migrate deploy' if using migrations)
npm run build
cd "$APP_DIR"

# 4. Frontend Deployment
echo "[3/4] Installing frontend dependencies & building production bundle..."
cd frontend
npm install --legacy-peer-deps
npm run build
cd "$APP_DIR"

# 5. Process Management (PM2)
echo "[4/4] Reloading PM2 processes with zero downtime..."
if command -v pm2 &> /dev/null; then
  pm2 startOrReload ecosystem.config.cjs
  pm2 save
  echo "PM2 processes successfully reloaded."
else
  echo "[WARNING] PM2 is not installed globally."
  echo "Install it with: sudo npm install -g pm2"
fi

echo "--------------------------------------------------------"
echo "  DEPLOYMENT COMPLETE!"
echo "  Backend API:  http://127.0.0.1:4000 (Internal)"
echo "  Frontend Web: http://127.0.0.1:3000 (Internal)"
echo "--------------------------------------------------------"
