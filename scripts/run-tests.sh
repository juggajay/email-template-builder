#!/bin/bash

echo "🧪 Running comprehensive tests for Email Template Builder"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
PASSED=0
FAILED=0
ERRORS=()

# Function to run a test
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "\n${YELLOW}Running: ${test_name}${NC}"
    
    if eval "$test_command"; then
        echo -e "${GREEN}✅ ${test_name} passed${NC}"
        ((PASSED++))
    else
        echo -e "${RED}❌ ${test_name} failed${NC}"
        ((FAILED++))
        ERRORS+=("${test_name}")
    fi
}

# Start Docker services
echo "🐳 Starting Docker services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if app is running
echo "🔍 Checking if application is running..."
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Application is running${NC}"
else
    echo -e "${RED}❌ Application is not accessible${NC}"
    exit 1
fi

# Run different test suites
echo -e "\n📋 Starting test suites..."

# 1. API Health Checks
run_test "API Health Check" "curl -f http://localhost:3000/api/health || curl -f http://localhost:3000/api/ping"

# 2. Static Pages
run_test "Homepage" "curl -f http://localhost:3000"
run_test "Login Page" "curl -f http://localhost:3000/login"
run_test "Signup Page" "curl -f http://localhost:3000/signup"
run_test "Templates Page" "curl -f http://localhost:3000/templates"
run_test "Pricing Page" "curl -f http://localhost:3000/pricing"

# 3. Run Playwright tests
if command -v npx &> /dev/null && npx playwright --version > /dev/null 2>&1; then
    run_test "Playwright E2E Tests" "npx playwright test"
else
    echo -e "${YELLOW}⚠️  Playwright not installed, skipping E2E tests${NC}"
fi

# 4. Check for console errors
echo -e "\n🔍 Checking for console errors..."
node scripts/check-console-errors.js

# 5. Performance check
echo -e "\n⚡ Running performance checks..."
node scripts/performance-check.js

# Summary
echo -e "\n=================================================="
echo "📊 Test Summary:"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"

if [ ${FAILED} -gt 0 ]; then
    echo -e "\n${RED}Failed tests:${NC}"
    for error in "${ERRORS[@]}"; do
        echo -e "  - ${error}"
    done
    exit 1
else
    echo -e "\n${GREEN}All tests passed! 🎉${NC}"
fi

# Cleanup
echo -e "\n🧹 Cleaning up..."
docker-compose down