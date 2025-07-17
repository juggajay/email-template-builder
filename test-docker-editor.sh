#!/bin/bash

echo "Testing Editor in Docker Container..."
echo "=====================================

"

# Check if editor loads
echo "1. Checking if editor page loads..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/editor)
if [ "$STATUS" = "200" ]; then
    echo "   ✓ Editor page loads successfully (HTTP 200)"
else
    echo "   ✗ Editor page failed to load (HTTP $STATUS)"
fi

# Check the HTML content
echo -e "\n2. Checking editor HTML content..."
CONTENT=$(curl -s http://localhost:3003/editor)

# Check for Unlayer script
if echo "$CONTENT" | grep -q "unlayer.com/embed.js"; then
    echo "   ✓ Unlayer script reference found"
else
    echo "   ✗ Unlayer script reference NOT found"
fi

# Check for editor container
if echo "$CONTENT" | grep -q "unlayer-editor"; then
    echo "   ✓ Editor container found"
else
    echo "   ✗ Editor container NOT found"
fi

# Check for performance optimization script
if echo "$CONTENT" | grep -q "performance-optimizations.js"; then
    echo "   ✓ Performance optimization script found"
else
    echo "   ✗ Performance optimization script NOT found"
fi

# Test API health
echo -e "\n3. Checking API health..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003/api/health)
if [ "$API_STATUS" = "200" ]; then
    echo "   ✓ API is healthy (HTTP 200)"
else
    echo "   ✗ API health check failed (HTTP $API_STATUS)"
fi

# Check static resources
echo -e "\n4. Checking static resources..."
RESOURCES=(
    "/fix-percentage-style.js"
    "/fix-drag-drop.js"
    "/performance-optimizations.js"
)

for resource in "${RESOURCES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3003$resource)
    if [ "$STATUS" = "200" ]; then
        echo "   ✓ $resource - Found"
    else
        echo "   ✗ $resource - Not found (HTTP $STATUS)"
    fi
done

echo -e "\n5. Container Status:"
docker ps --filter name=email-builder-test --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo -e "\nTest completed!"