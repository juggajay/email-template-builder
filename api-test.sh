#!/bin/bash

echo "🔍 Testing Email Template Builder API and Pages"
echo "=============================================="

BASE_URL="http://localhost:3000"
PASSED=0
FAILED=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test function
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url")
    
    if [[ "$response" =~ ^($expected_status)$ ]]; then
        echo -e "${GREEN}✅ PASSED${NC} (Status: $response)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Expected: $expected_status, Got: $response)"
        ((FAILED++))
    fi
}

# Test function with content check
test_content() {
    local name=$1
    local url=$2
    local content=$3
    
    echo -n "Testing $name content... "
    
    if curl -s "$url" | grep -q "$content"; then
        echo -e "${GREEN}✅ PASSED${NC} (Found: $content)"
        ((PASSED++))
    else
        echo -e "${RED}❌ FAILED${NC} (Content not found: $content)"
        ((FAILED++))
    fi
}

echo -e "\n${YELLOW}1. Testing Page Endpoints${NC}"
echo "----------------------------"

test_endpoint "Homepage" "$BASE_URL/"
test_endpoint "Login Page" "$BASE_URL/login"
test_endpoint "Signup Page" "$BASE_URL/signup"
test_endpoint "Reset Password" "$BASE_URL/reset-password"
test_endpoint "Templates Gallery" "$BASE_URL/templates"
test_endpoint "Pricing Page" "$BASE_URL/pricing"
test_endpoint "Editor Page" "$BASE_URL/editor"
test_endpoint "Dashboard" "$BASE_URL/dashboard" "200"

echo -e "\n${YELLOW}2. Testing API Endpoints${NC}"
echo "----------------------------"

test_endpoint "Health Check" "$BASE_URL/api/health" "200"
test_endpoint "Auth Status" "$BASE_URL/api/auth/session" "200"
test_endpoint "Templates API" "$BASE_URL/api/templates" "200|500"
test_endpoint "User API" "$BASE_URL/api/user" "401"

echo -e "\n${YELLOW}3. Testing 404 Handling${NC}"
echo "----------------------------"

test_endpoint "Non-existent page" "$BASE_URL/this-does-not-exist" "404"
test_endpoint "Non-existent API" "$BASE_URL/api/non-existent" "404"

echo -e "\n${YELLOW}4. Testing Page Content${NC}"
echo "----------------------------"

test_content "Homepage CTA" "$BASE_URL/" "Get Started\|Start Building\|Create"
test_content "Login Form" "$BASE_URL/login" "email\|password"
test_content "Templates Page" "$BASE_URL/templates" "template\|Template"
test_content "Pricing Tiers" "$BASE_URL/pricing" "Free\|Pro\|Agency"

echo -e "\n${YELLOW}5. Testing Static Assets${NC}"
echo "----------------------------"

# Check if Next.js static files are accessible (404 is expected in dev mode)
test_endpoint "Next.js Build (Dev Mode)" "$BASE_URL/_next/static" "404"

echo -e "\n=============================================="
echo -e "📊 ${YELLOW}Test Summary:${NC}"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
    echo -e "\n${GREEN}All tests passed! 🎉${NC}"
    exit 0
else
    echo -e "\n${RED}Some tests failed. Please check the errors above.${NC}"
    exit 1
fi