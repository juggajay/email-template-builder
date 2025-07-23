'use client';

import { useState, useEffect } from 'react';
import { ProductBlock } from './product-block';
import { Loader2 } from 'lucide-react';

interface ProductGridBlockProps {
  productIds: string[];
  columns?: 2 | 3 | 4;
  showPrice?: boolean;
  showTitle?: boolean;
  imageAspectRatio?: 'square' | 'landscape' | 'portrait';
  buttonText?: string;
  buttonColor?: string;
}

export function ProductGridBlock({
  productIds,
  columns = 3,
  showPrice = true,
  showTitle = true,
  imageAspectRatio = 'square',
  buttonText = 'Shop Now',
  buttonColor = '#000000'
}: ProductGridBlockProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for demo
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {productIds.map((productId) => (
        <ProductBlock
          key={productId}
          productId={productId}
          layout="card"
          showPrice={showPrice}
          showDescription={false}
          showButton={true}
          buttonText={buttonText}
          buttonColor={buttonColor}
        />
      ))}
    </div>
  );
}

// Static preview for email editor
export function ProductGridPreview({
  columns = 3,
  count = 6
}: {
  columns?: 2 | 3 | 4;
  count?: number;
}) {
  const gridClasses = {
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
  };

  const sampleProducts = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    title: `Product ${i + 1}`,
    price: (29.99 + i * 10).toFixed(2),
    image: `/images/template-placeholder.svg`
  }));

  return (
    <div className={`grid ${gridClasses[columns]} gap-4`}>
      {sampleProducts.map((product) => (
        <div key={product.id} className="border rounded-lg overflow-hidden">
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">Product Image</span>
          </div>
          <div className="p-4">
            <h3 className="font-semibold mb-2">{product.title}</h3>
            <p className="text-lg font-bold mb-3">${product.price}</p>
            <button className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors">
              Shop Now
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}