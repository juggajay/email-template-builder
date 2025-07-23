'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/integrations/shopify/utils';
import { ShoppingCart, ArrowRight, Package } from 'lucide-react';
import { getImageUrl, handleImageError } from '@/lib/utils/image-fallback';

interface AbandonedCartBlockProps {
  email?: string;
  showImage?: boolean;
  showPrice?: boolean;
  showQuantity?: boolean;
  showSubtotal?: boolean;
  buttonText?: string;
  buttonColor?: string;
}

export function AbandonedCartBlock({
  email,
  showImage = true,
  showPrice = true,
  showQuantity = true,
  showSubtotal = true,
  buttonText = 'Complete Your Purchase',
  buttonColor = '#000000'
}: AbandonedCartBlockProps) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (email) {
      fetchCart();
    }
  }, [email]);

  const fetchCart = async () => {
    try {
      const response = await fetch(`/api/shopify/sync/carts?email=${email}`);
      if (response.ok) {
        const data = await response.json();
        setCart(data.carts?.[0]);
      }
    } catch (error) {
      console.error('Failed to fetch abandoned cart:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-6">
          <div className="h-32 bg-gray-200 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (!cart || !cart.line_items?.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <ShoppingCart className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-600">No abandoned cart found</p>
          {!email && (
            <p className="text-sm text-gray-500 mt-1">
              Merge tag {'{{customer.email}}'} will be used when sending
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  const calculateSavings = () => {
    let totalSavings = 0;
    cart.line_items.forEach((item: any) => {
      if (item.compareAtPrice && parseFloat(item.compareAtPrice) > parseFloat(item.price)) {
        const savings = (parseFloat(item.compareAtPrice) - parseFloat(item.price)) * item.quantity;
        totalSavings += savings;
      }
    });
    return totalSavings;
  };

  const savings = calculateSavings();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart is Waiting
          </CardTitle>
          {savings > 0 && (
            <Badge variant="destructive">
              Save {formatPrice(savings, cart.currency)}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {cart.line_items.map((item: any, index: number) => (
            <div key={index} className="p-4 flex gap-4">
              {showImage && (
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded"
                  onError={handleImageError}
                />
              )}
              <div className="flex-1">
                <h4 className="font-medium">{item.title}</h4>
                {item.variantTitle && item.variantTitle !== 'Default Title' && (
                  <p className="text-sm text-gray-600">{item.variantTitle}</p>
                )}
                {showQuantity && (
                  <p className="text-sm text-gray-500 mt-1">
                    Quantity: {item.quantity}
                  </p>
                )}
              </div>
              {showPrice && (
                <div className="text-right">
                  <p className="font-semibold">
                    {formatPrice(item.linePrice, cart.currency)}
                  </p>
                  {item.compareAtPrice && parseFloat(item.compareAtPrice) > parseFloat(item.price) && (
                    <p className="text-sm text-gray-500 line-through">
                      {formatPrice(
                        (parseFloat(item.compareAtPrice) * item.quantity).toString(),
                        cart.currency
                      )}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {showSubtotal && (
          <div className="border-t bg-gray-50 p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-lg font-semibold">Subtotal</span>
              <span className="text-lg font-bold">
                {formatPrice(cart.subtotal_price, cart.currency)}
              </span>
            </div>
            {cart.total_tax > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>Estimated Tax</span>
                <span>{formatPrice(cart.total_tax, cart.currency)}</span>
              </div>
            )}
          </div>
        )}

        <div className="p-4">
          <Button
            className="w-full"
            size="lg"
            style={{ backgroundColor: buttonColor }}
          >
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          {cart.abandoned_checkout_url && (
            <p className="text-xs text-gray-500 text-center mt-2">
              Your items are saved and ready for checkout
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Static preview for email editor
export function AbandonedCartPreview() {
  const sampleCart = {
    currency: 'USD',
    subtotal_price: 149.97,
    total_tax: 12.75,
    line_items: [
      {
        title: 'Premium Wireless Headphones',
        variantTitle: 'Black',
        quantity: 1,
        price: '79.99',
        linePrice: '79.99',
        compareAtPrice: '99.99',
        image: '/images/template-placeholder.svg'
      },
      {
        title: 'Laptop Stand',
        variantTitle: 'Silver',
        quantity: 2,
        price: '34.99',
        linePrice: '69.98',
        image: '/images/template-placeholder.svg'
      }
    ]
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Your Cart is Waiting
          </CardTitle>
          <Badge variant="destructive">
            Save {formatPrice(30.01)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y">
          {sampleCart.line_items.map((item, index) => (
            <div key={index} className="p-4 flex gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded flex items-center justify-center">
                <Package className="w-8 h-8 text-gray-400" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{item.title}</h4>
                <p className="text-sm text-gray-600">{item.variantTitle}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Quantity: {item.quantity}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">
                  {formatPrice(item.linePrice)}
                </p>
                <p className="text-sm text-gray-500 line-through">
                  {formatPrice((parseFloat(item.compareAtPrice || '0') * item.quantity).toString())}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t bg-gray-50 p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold">Subtotal</span>
            <span className="text-lg font-bold">
              {formatPrice(sampleCart.subtotal_price)}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Estimated Tax</span>
            <span>{formatPrice(sampleCart.total_tax)}</span>
          </div>
        </div>

        <div className="p-4">
          <Button className="w-full" size="lg">
            Complete Your Purchase
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Your items are saved and ready for checkout
          </p>
        </div>
      </CardContent>
    </Card>
  );
}