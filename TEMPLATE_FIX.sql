-- Quick fix for templates loading issue

-- 1. Check if any public templates exist
SELECT COUNT(*) as public_template_count 
FROM email_templates 
WHERE is_public = true;

-- 2. If no templates exist, add some sample templates
INSERT INTO email_templates (
    name, 
    description, 
    category, 
    tags, 
    is_public, 
    is_premium, 
    html_content,
    created_by,
    thumbnail_url
) VALUES 
(
    'Welcome Email Series',
    'Professional welcome email for new subscribers',
    'welcome'::template_category,
    ARRAY['welcome', 'onboarding', 'new-subscriber'],
    true,
    false,
    E'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome Email</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #3b82f6; color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Welcome to Our Store!</h1>
        </div>
        <div class="content">
            <h2>Thanks for joining us!</h2>
            <p>We\'re excited to have you as part of our community. Get ready for exclusive deals, new product launches, and more!</p>
            <p><a href="#" class="button">Start Shopping</a></p>
        </div>
    </div>
</body>
</html>',
    NULL,
    'https://via.placeholder.com/300x200?text=Welcome+Email'
),
(
    'Abandoned Cart Reminder',
    'Recover lost sales with this compelling cart reminder',
    'abandoned-cart'::template_category,
    ARRAY['abandoned-cart', 'recovery', 'sales'],
    true,
    false,
    E'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Complete Your Purchase</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #ef4444; color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .product { border: 1px solid #ddd; padding: 20px; margin: 10px 0; display: flex; align-items: center; }
        .button { display: inline-block; padding: 12px 24px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>You left something behind!</h1>
        </div>
        <div class="content">
            <h2>Your cart is waiting for you</h2>
            <p>Don\'t miss out on these items. Complete your purchase before they\'re gone!</p>
            <div class="product">
                <div>
                    <h3>Product Name</h3>
                    <p>$99.99</p>
                </div>
            </div>
            <p><a href="#" class="button">Complete Purchase</a></p>
        </div>
    </div>
</body>
</html>',
    NULL,
    'https://via.placeholder.com/300x200?text=Cart+Reminder'
),
(
    'Flash Sale Announcement',
    'Eye-catching flash sale template with countdown timer',
    'promotional'::template_category,
    ARRAY['sale', 'flash-sale', 'promotion', 'discount'],
    true,
    false,
    E'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Flash Sale!</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #fbbf24; color: #000; padding: 40px; text-align: center; }
        .content { padding: 40px; text-align: center; }
        .countdown { font-size: 36px; font-weight: bold; color: #ef4444; margin: 20px 0; }
        .button { display: inline-block; padding: 16px 32px; background-color: #ef4444; color: white; text-decoration: none; border-radius: 4px; font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⚡ FLASH SALE ⚡</h1>
        </div>
        <div class="content">
            <h2>50% OFF EVERYTHING!</h2>
            <div class="countdown">24:00:00</div>
            <p>Hurry! This incredible deal ends soon!</p>
            <p><a href="#" class="button">SHOP NOW</a></p>
        </div>
    </div>
</body>
</html>',
    NULL,
    'https://via.placeholder.com/300x200?text=Flash+Sale'
),
(
    'Product Launch',
    'Announce new products with style',
    'product-launch'::template_category,
    ARRAY['product', 'launch', 'new', 'announcement'],
    true,
    false,
    E'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Product Launch</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #10b981; color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .product-image { width: 100%; max-width: 400px; height: auto; margin: 20px auto; display: block; }
        .button { display: inline-block; padding: 12px 24px; background-color: #10b981; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Introducing Our Latest Innovation</h1>
        </div>
        <div class="content">
            <h2>The Future is Here</h2>
            <img src="https://via.placeholder.com/400x300?text=New+Product" alt="New Product" class="product-image">
            <p>Be among the first to experience our groundbreaking new product. Limited quantities available!</p>
            <p style="text-align: center;"><a href="#" class="button">Learn More</a></p>
        </div>
    </div>
</body>
</html>',
    NULL,
    'https://via.placeholder.com/300x200?text=Product+Launch'
),
(
    'Order Confirmation',
    'Clean and professional order confirmation template',
    'order-confirmation'::template_category,
    ARRAY['order', 'confirmation', 'receipt', 'purchase'],
    true,
    false,
    E'<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
        .header { background-color: #059669; color: white; padding: 40px; text-align: center; }
        .content { padding: 40px; }
        .order-details { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 24px; background-color: #059669; color: white; text-decoration: none; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Order Confirmed!</h1>
        </div>
        <div class="content">
            <h2>Thank you for your order</h2>
            <p>Your order has been confirmed and will be shipped within 24 hours.</p>
            <div class="order-details">
                <h3>Order #12345</h3>
                <p>Estimated Delivery: 3-5 business days</p>
                <p>Total: $99.99</p>
            </div>
            <p style="text-align: center;"><a href="#" class="button">Track Order</a></p>
        </div>
    </div>
</body>
</html>',
    NULL,
    'https://via.placeholder.com/300x200?text=Order+Confirmation'
)
ON CONFLICT DO NOTHING;

-- 3. Check templates again
SELECT id, name, category, is_public, created_at 
FROM email_templates 
WHERE is_public = true
ORDER BY created_at DESC;

-- 4. If still having issues, check RLS policies
SELECT tablename, policyname, permissive, cmd, qual
FROM pg_policies
WHERE schemaname = 'public' 
AND tablename = 'email_templates';

-- 5. Alternative: Temporarily allow all reads on templates (for testing)
DROP POLICY IF EXISTS "Anyone can view public templates" ON email_templates;
CREATE POLICY "Anyone can view public templates" ON email_templates
    FOR SELECT USING (true);  -- Allow all reads temporarily