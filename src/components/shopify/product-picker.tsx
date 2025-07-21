'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Package, Check, Loader2 } from 'lucide-react';
import { formatPrice } from '@/lib/integrations/shopify/utils';

interface ProductPickerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (products: any[]) => void;
  multiple?: boolean;
  selectedProducts?: string[];
}

export function ProductPicker({
  open,
  onOpenChange,
  onSelect,
  multiple = false,
  selectedProducts = []
}: ProductPickerProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set(selectedProducts));

  useEffect(() => {
    if (open) {
      fetchProducts();
    }
  }, [open]);

  const fetchProducts = async (search?: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      params.set('limit', '50');

      const response = await fetch(`/api/shopify/sync/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      }
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const toggleSelection = (productId: string) => {
    const newSelected = new Set(selected);
    if (newSelected.has(productId)) {
      newSelected.delete(productId);
    } else {
      if (!multiple) {
        newSelected.clear();
      }
      newSelected.add(productId);
    }
    setSelected(newSelected);
  };

  const handleConfirm = () => {
    const selectedProductData = products.filter(p => 
      selected.has(p.shopify_product_id)
    );
    onSelect(selectedProductData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select Products</DialogTitle>
          <DialogDescription>
            {multiple 
              ? 'Select products to add to your email template'
              : 'Select a product to add to your email template'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" disabled={loading}>
            <Search className="w-4 h-4" />
          </Button>
        </form>

        <ScrollArea className="h-[400px] pr-4">
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No products found</p>
              <p className="text-sm mt-1">Try syncing your products first</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {products.map((product) => {
                const isSelected = selected.has(product.shopify_product_id);
                const mainImage = product.images?.[0];
                const price = product.variants?.[0]?.price;

                return (
                  <div
                    key={product.shopify_product_id}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-300'
                    }`}
                    onClick={() => toggleSelection(product.shopify_product_id)}
                  >
                    <div className="flex gap-3">
                      {multiple && (
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => toggleSelection(product.shopify_product_id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                      {mainImage && (
                        <img
                          src={mainImage.url}
                          alt={product.title}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{product.title}</h4>
                        <p className="text-sm text-gray-600 line-clamp-1">
                          {product.vendor}
                        </p>
                        {price && (
                          <p className="text-sm font-semibold mt-1">
                            {formatPrice(price)}
                          </p>
                        )}
                        <div className="flex gap-1 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {product.status}
                          </Badge>
                          {product.tags?.slice(0, 2).map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      {isSelected && !multiple && (
                        <Check className="w-5 h-5 text-blue-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">
            {selected.size} product{selected.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm}
              disabled={selected.size === 0}
            >
              Add to Template
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}