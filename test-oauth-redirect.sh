#!/bin/bash

echo "Testing Shopify OAuth Callback Redirect..."
echo "==========================================="

# Test URL with sample parameters
TEST_URL="http://localhost:3000/api/shopify/callback?shop=xbbf0y-vp.myshopify.com&code=test123&state=test-state&hmac=test-hmac"

echo "Testing URL: $TEST_URL"
echo ""

# Make request and follow redirects (-L) but show headers (-I)
echo "Response headers:"
curl -s -I "$TEST_URL" | grep -E "(HTTP|Location|location)"

echo ""
echo "Expected redirect location:"
echo "https://admin.shopify.com/store/xbbf0y-vp/app/grant"
echo ""

# Alternative test with verbose output
echo "Detailed test with curl verbose mode:"
curl -v -L -X GET "$TEST_URL" 2>&1 | grep -E "(< HTTP|< Location|< location)" | head -10