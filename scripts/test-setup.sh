#!/bin/bash

echo "🚀 Setting up test environment..."

# Copy test environment if not exists
if [ ! -f .env.local ]; then
    cp .env.test .env.local
    echo "✅ Created .env.local from .env.test"
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "📦 Building Docker containers..."
docker-compose build

echo "🔄 Starting services..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 5

echo "🎭 Installing Playwright..."
npx playwright install

echo "✅ Test environment setup complete!"
echo ""
echo "To run tests:"
echo "  - Full test suite: npm run test:e2e"
echo "  - With UI: npm run test:e2e:ui"
echo "  - Specific test: npm run test:e2e -- tests/e2e/auth.spec.ts"