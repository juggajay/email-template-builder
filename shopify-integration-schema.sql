-- Shopify Integration Database Schema

-- Shopify connections table
CREATE TABLE IF NOT EXISTS shopify_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shop_domain TEXT NOT NULL UNIQUE,
  access_token TEXT NOT NULL,
  shop_name TEXT,
  shop_email TEXT,
  shop_owner TEXT,
  shop_plan TEXT,
  shop_created_at TIMESTAMPTZ,
  scopes TEXT[],
  webhook_notifications_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Shopify products cache
CREATE TABLE IF NOT EXISTS shopify_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  shopify_product_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  vendor TEXT,
  product_type TEXT,
  tags TEXT[],
  status TEXT,
  images JSONB DEFAULT '[]',
  variants JSONB DEFAULT '[]',
  options JSONB DEFAULT '[]',
  seo JSONB,
  collections TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  UNIQUE(shop_id, shopify_product_id)
);

-- Shopify customers
CREATE TABLE IF NOT EXISTS shopify_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  shopify_customer_id TEXT NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  tags TEXT[],
  total_spent DECIMAL(10, 2),
  orders_count INTEGER DEFAULT 0,
  accepts_marketing BOOLEAN DEFAULT false,
  marketing_opt_in_level TEXT,
  sms_marketing_consent JSONB,
  addresses JSONB DEFAULT '[]',
  default_address JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  UNIQUE(shop_id, shopify_customer_id)
);

-- Customer segments
CREATE TABLE IF NOT EXISTS shopify_customer_segments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  query TEXT NOT NULL,
  customer_count INTEGER DEFAULT 0,
  last_updated TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Abandoned checkouts/carts
CREATE TABLE IF NOT EXISTS shopify_abandoned_carts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  shopify_checkout_id TEXT NOT NULL,
  customer_id UUID REFERENCES shopify_customers(id),
  email TEXT,
  phone TEXT,
  line_items JSONB DEFAULT '[]',
  subtotal_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  total_tax DECIMAL(10, 2),
  currency TEXT,
  abandoned_checkout_url TEXT,
  cart_token TEXT,
  completed_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  shopify_created_at TIMESTAMPTZ,
  shopify_updated_at TIMESTAMPTZ,
  UNIQUE(shop_id, shopify_checkout_id)
);

-- Orders cache
CREATE TABLE IF NOT EXISTS shopify_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  shopify_order_id TEXT NOT NULL,
  order_number TEXT NOT NULL,
  customer_id UUID REFERENCES shopify_customers(id),
  email TEXT,
  financial_status TEXT,
  fulfillment_status TEXT,
  line_items JSONB DEFAULT '[]',
  shipping_address JSONB,
  billing_address JSONB,
  subtotal_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  total_tax DECIMAL(10, 2),
  total_discounts DECIMAL(10, 2),
  currency TEXT,
  tags TEXT[],
  note TEXT,
  tracking_numbers TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  shopify_created_at TIMESTAMPTZ,
  shopify_processed_at TIMESTAMPTZ,
  UNIQUE(shop_id, shopify_order_id)
);

-- Sync logs
CREATE TABLE IF NOT EXISTS shopify_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL, -- 'products', 'customers', 'orders', 'carts'
  status TEXT NOT NULL, -- 'started', 'completed', 'failed'
  records_synced INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- Webhook events
CREATE TABLE IF NOT EXISTS shopify_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_id UUID NOT NULL REFERENCES shopify_connections(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT false,
  processed_at TIMESTAMPTZ,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_shopify_products_shop_id ON shopify_products(shop_id);
CREATE INDEX idx_shopify_products_status ON shopify_products(status);
CREATE INDEX idx_shopify_products_tags ON shopify_products USING gin(tags);

CREATE INDEX idx_shopify_customers_shop_id ON shopify_customers(shop_id);
CREATE INDEX idx_shopify_customers_email ON shopify_customers(email);
CREATE INDEX idx_shopify_customers_tags ON shopify_customers USING gin(tags);

CREATE INDEX idx_shopify_abandoned_carts_shop_id ON shopify_abandoned_carts(shop_id);
CREATE INDEX idx_shopify_abandoned_carts_email ON shopify_abandoned_carts(email);
CREATE INDEX idx_shopify_abandoned_carts_created ON shopify_abandoned_carts(shopify_created_at);

CREATE INDEX idx_shopify_orders_shop_id ON shopify_orders(shop_id);
CREATE INDEX idx_shopify_orders_customer_id ON shopify_orders(customer_id);
CREATE INDEX idx_shopify_orders_status ON shopify_orders(financial_status, fulfillment_status);

-- RLS Policies
ALTER TABLE shopify_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_customer_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shopify_webhook_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for shopify_connections
CREATE POLICY "Users can view their own Shopify connections"
  ON shopify_connections FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own Shopify connections"
  ON shopify_connections FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own Shopify connections"
  ON shopify_connections FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own Shopify connections"
  ON shopify_connections FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- RLS Policies for related tables (via shop connection)
CREATE POLICY "Users can view products from their shops"
  ON shopify_products FOR SELECT
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage products from their shops"
  ON shopify_products FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view customers from their shops"
  ON shopify_customers FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage customer segments from their shops"
  ON shopify_customer_segments FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view abandoned carts from their shops"
  ON shopify_abandoned_carts FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view orders from their shops"
  ON shopify_orders FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view sync logs from their shops"
  ON shopify_sync_logs FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view webhook events from their shops"
  ON shopify_webhook_events FOR ALL
  TO authenticated
  USING (
    shop_id IN (
      SELECT id FROM shopify_connections WHERE user_id = auth.uid()
    )
  );

-- Functions for data management
CREATE OR REPLACE FUNCTION update_shopify_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE shopify_connections 
  SET last_sync_at = now() 
  WHERE id = NEW.shop_id AND NEW.status = 'completed';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_sync_timestamp
  AFTER INSERT OR UPDATE ON shopify_sync_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_shopify_sync_timestamp();