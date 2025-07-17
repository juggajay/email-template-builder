#!/bin/bash

echo "=== Email Template Builder - Comprehensive Test ==="
echo "Date: $(date)"
echo ""

BASE_URL="http://localhost:3000"

# Function to test a page
test_page() {
    local url="$1"
    local description="$2"
    local search_text="$3"
    
    echo -n "Testing $description ($url)... "
    
    # Get HTTP status code
    status=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$url")
    
    if [ "$status" = "200" ]; then
        echo -n "✓ Status: $status"
        
        # If search text provided, check if it exists
        if [ -n "$search_text" ]; then
            if curl -s "$BASE_URL$url" | grep -q "$search_text"; then
                echo " ✓ Found: '$search_text'"
            else
                echo " ✗ Missing: '$search_text'"
            fi
        else
            echo ""
        fi
    else
        echo "✗ Status: $status"
    fi
}

echo "1. TESTING PUBLIC PAGES"
echo "======================"
test_page "/" "Landing Page" "Get Started"
test_page "/templates" "Templates Page" "templates"
test_page "/login" "Login Page" "email"
test_page "/signup" "Signup Page" "password"
test_page "/reset-password" "Password Reset" "Reset"

echo ""
echo "2. TESTING PROTECTED PAGES"
echo "========================="
test_page "/dashboard" "Dashboard" "dashboard"
test_page "/editor" "Email Editor" "editor"
test_page "/billing" "Billing Page" "billing"
test_page "/settings" "Settings Page" "settings"

echo ""
echo "3. TESTING API ENDPOINTS"
echo "======================="
echo -n "Testing Supabase connection... "
if curl -s "$BASE_URL" | grep -q "supabase"; then
    echo "✓ Supabase client detected"
else
    echo "⚠ Supabase client not found in page"
fi

echo ""
echo "4. CHECKING CRITICAL FILES"
echo "========================="
files=(
    "src/app/(dashboard)/dashboard/page.tsx"
    "src/app/(dashboard)/templates/page.tsx"
    "src/app/(dashboard)/editor/page.tsx"
    "src/app/(auth)/login/page.tsx"
    "src/app/(auth)/signup/page.tsx"
    "src/components/editor/email-editor.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file exists"
    else
        echo "✗ $file missing"
    fi
done

echo ""
echo "5. TESTING TEMPLATE FUNCTIONALITY"
echo "================================"
echo "Checking templates endpoint..."
curl -s "$BASE_URL/templates" > /tmp/templates.html
if grep -q "Loading templates" /tmp/templates.html; then
    echo "⚠ Templates page shows loading spinner"
    echo "  This suggests RLS policies or empty templates table"
fi

if grep -q "template-card" /tmp/templates.html || grep -q "grid" /tmp/templates.html; then
    echo "✓ Template grid structure found"
else
    echo "✗ Template grid structure missing"
fi

echo ""
echo "6. AUTHENTICATION FLOW CHECK"
echo "==========================="
# Check if auth pages redirect properly
signup_response=$(curl -s -I "$BASE_URL/signup")
if echo "$signup_response" | grep -q "Location:"; then
    echo "⚠ Signup page redirects (user might be logged in)"
else
    echo "✓ Signup page accessible"
fi

echo ""
echo "=== TEST SUMMARY ==="
echo "Run the following SQL in Supabase to fix any issues:"
echo "1. supabase-complete-rls-fix.sql"
echo "2. TEMPLATE_FIX.sql" 
echo "3. Final fix from COMPLETE_FIX_PACKAGE.md (lines 222-252)"
echo ""
echo "For missing pages, implement code from COMPLETE_FIX_PACKAGE.md"