#!/bin/bash

echo "Quick Save Functionality Test"
echo "============================"
echo ""

# Test if editor page loads
echo "1. Testing editor page..."
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/editor)
if [ "$RESPONSE" = "200" ]; then
    echo "   ✓ Editor page loads (HTTP 200)"
else
    echo "   ✗ Editor page failed (HTTP $RESPONSE)"
fi

# Get the HTML and check for save button
echo -e "\n2. Checking for Save button in HTML..."
HTML=$(curl -s http://localhost:3003/editor)

if echo "$HTML" | grep -q "Save Template"; then
    echo "   ✓ 'Save Template' text found in HTML"
else
    echo "   ✗ 'Save Template' text NOT found in HTML"
fi

# Check for UnlayerWrapperFixed
if echo "$HTML" | grep -q "unlayer-editor-fixed"; then
    echo "   ✓ Editor container 'unlayer-editor-fixed' found"
else
    echo "   ✗ Editor container NOT found"
fi

# Check API health
echo -e "\n3. Testing API health..."
API_RESPONSE=$(curl -s http://localhost:3003/api/health)
echo "   API Response: $API_RESPONSE"

# Check if authentication endpoints work
echo -e "\n4. Testing auth endpoints..."
AUTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/auth/session)
echo "   Auth session endpoint: HTTP $AUTH_RESPONSE"

# Display instructions for manual testing
echo -e "\n5. Manual Testing Steps:"
echo "   a. Open http://localhost:3003/editor in your browser"
echo "   b. Wait for the editor to fully load (should see Unlayer interface)"
echo "   c. Look for 'Save Template' button (should be visible after editor loads)"
echo "   d. Open browser console (F12) to see debug logs"
echo "   e. Click the Save button and check console for:"
echo "      - '[UnlayerFixed] Save button clicked'"
echo "      - '[UnlayerFixed] Getting design...'"
echo "      - '[UnlayerFixed] Design obtained:'"
echo "      - '[UnlayerFixed] Exported:'"
echo "      - Any error messages"
echo ""
echo "Test completed. Container is running on port 3003."