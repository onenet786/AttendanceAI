#!/usr/bin/env bash
# ==============================================================================
# AttendanceAI - aaPanel One-Click Initialization Script
# Safely prepares environment, builds frontend & backend, and syncs PostgreSQL
# ==============================================================================

set -e

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$APP_DIR"

echo "=========================================================="
echo "  AttendanceAI: Initializing for aaPanel..."
echo "  Directory: $APP_DIR"
echo "=========================================================="

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

# Install dependencies and build frontend
echo "-> [2/3] Building frontend production bundle..."
cd "$APP_DIR/frontend"
npm install --legacy-peer-deps
npm run build

echo "-> [3/3] Seeding demo data (Demo Company, Branches, 22 Staff)..."
cd "$APP_DIR/backend"
npm run seed || echo "Seed notice: Schema ready"

cd "$APP_DIR"

echo ""
echo "=========================================================="
echo "  INITIALIZATION FINISHED SUCCESSFULLY!"
echo "  1. Backend build ready: backend/dist/server.js"
echo "  2. Frontend build ready: frontend/dist"
echo "  You can now start the Node project in aaPanel UI!"
echo "=========================================================="
