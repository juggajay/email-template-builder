'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPrice, getInventoryStatus } from '@/lib/integrations/shopify/utils';
import { ShoppingCart, ExternalLink } from 'lucide-react';

interface ProductBlockProps {
  productId: string;
  layout?: 'card' | 'horizontal' | 'minimal';
  showPrice?: boolean;
  showDescription?: boolean;
  showButton?: boolean;
  buttonText?: string;
  buttonColor?: string;
  shopDomain?: string;
}

export function ProductBlock({
  productId,
  layout = 'card',
  showPrice = true,
  showDescription = true,
  showButton = true,
  buttonText = 'Shop Now',
  buttonColor = '#000000',
  shopDomain
}: ProductBlockProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [productId]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/shopify/data/products/${productId}`);
      if (response.ok) {
        const data = await response.json();
        setProduct(data.product);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="bg-gray-200 h-48 rounded"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <Card className="p-4 text-center text-gray-500">
        Product not found
      </Card>
    );
  }

  const mainImage = product.images?.[0];
  const price = product.variants?.[0]?.price;
  const compareAtPrice = product.variants?.[0]?.compareAtPrice;
  const inventory = getInventoryStatus(product.variants?.[0]?.inventoryQuantity);

  if (layout === 'minimal') {
    return (
      <div className="text-center">
        {mainImage && (
          <img
            src={mainImage.url}
            alt={mainImage.altText || product.title}
            className="w-full h-48 object-cover rounded mb-2"
          />
        )}
        <h3 className="font-semibold">{product.title}</h3>
        {showPrice && price && (
          <p className="text-lg font-bold">{formatPrice(price)}</p>
        )}
        {showButton && (
          <Button
            className="mt-2"
            style={{ backgroundColor: buttonColor }}
          >
            {buttonText}
          </Button>
        )}
      </div>
    );
  }

  if (layout === 'horizontal') {
    return (
      <Card className="overflow-hidden">
        <div className="flex">
          {mainImage && (
            <img
              src={mainImage.url}
              alt={mainImage.altText || product.title}
              className="w-48 h-48 object-cover"
            />
          )}
          <CardContent className="flex-1 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{product.title}</h3>
              {inventory.status !== 'in_stock' && (
                <Badge variant={inventory.status === 'out_of_stock' ? 'destructive' : 'secondary'}>
                  {inventory.label}
                </Badge>
              )}
            </div>
            {showDescription && product.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>
            )}
            {showPrice && price && (
              <div className="mb-3">
                <span className="text-xl font-bold">{formatPrice(price)}</span>
                {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
                  <span className="text-sm text-gray-500 line-through ml-2">
                    {formatPrice(compareAtPrice)}
                  </span>
                )}
              </div>
            )}
            {showButton && (
              <Button
                className="w-full"
                style={{ backgroundColor: buttonColor }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                {buttonText}
              </Button>
            )}
          </CardContent>
        </div>
      </Card>
    );
  }

  // Default card layout
  return (
    <Card className="overflow-hidden">
      {mainImage && (
        <div className="aspect-square overflow-hidden">
          <img
            src={mainImage.url}
            alt={mainImage.altText || product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold line-clamp-1">{product.title}</h3>
          {inventory.status !== 'in_stock' && (
            <Badge variant={inventory.status === 'out_of_stock' ? 'destructive' : 'secondary'}>
              {inventory.label}
            </Badge>
          )}
        </div>
        {showDescription && product.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        {showPrice && price && (
          <div className="mb-3">
            <span className="text-xl font-bold">{formatPrice(price)}</span>
            {compareAtPrice && parseFloat(compareAtPrice) > parseFloat(price) && (
              <span className="text-sm text-gray-500 line-through ml-2">
                {formatPrice(compareAtPrice)}
              </span>
            )}
          </div>
        )}
        {showButton && (
          <Button
            className="w-full"
            style={{ backgroundColor: buttonColor }}
            disabled={inventory.status === 'out_of_stock'}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            {inventory.status === 'out_of_stock' ? 'Out of Stock' : buttonText}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}