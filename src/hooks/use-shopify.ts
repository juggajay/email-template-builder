/**
 * React hooks for Shopify integration
 */

import { useState, useEffect } from 'react';

export function useShopifyConnection() {
  const [connection, setConnection] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConnection();
  }, []);

  const fetchConnection = async () => {
    try {
      const response = await fetch('/api/shopify/connection');
      if (response.ok) {
        const data = await response.json();
        setConnection(data.connection);
      } else {
        setError('Failed to load connection');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return { connection, loading, error, refetch: fetchConnection };
}

export function useShopifyProducts(search?: string) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = async (searchQuery?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (searchQuery || search) params.set('search', searchQuery || search || '');
      
      const response = await fetch(`/api/shopify/sync/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setError('Failed to load products');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  return { products, loading, error, refetch: fetchProducts };
}

export function useShopifyCustomers(tag?: string) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = async (customerTag?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (customerTag || tag) params.set('tag', customerTag || tag || '');
      
      const response = await fetch(`/api/shopify/sync/customers?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      } else {
        setError('Failed to load customers');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [tag]);

  return { customers, loading, error, refetch: fetchCustomers };
}

export function useShopifyAbandonedCarts(email?: string) {
  const [carts, setCarts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCarts = async (customerEmail?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (customerEmail || email) params.set('email', customerEmail || email || '');
      
      const response = await fetch(`/api/shopify/sync/carts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCarts(data.carts || []);
      } else {
        setError('Failed to load abandoned carts');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email) {
      fetchCarts();
    }
  }, [email]);

  return { carts, loading, error, refetch: fetchCarts };
}

export function useShopifySegments() {
  const [segments, setSegments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSegments();
  }, []);

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/shopify/data/segments');
      if (response.ok) {
        const data = await response.json();
        setSegments(data.segments || []);
      } else {
        setError('Failed to load segments');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return { segments, loading, error, refetch: fetchSegments };
}

export function useShopifySync() {
  const [syncing, setSyncing] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const sync = async (type: 'products' | 'customers' | 'orders' | 'carts', forceSync = true) => {
    setSyncing(type);
    setError(null);
    
    try {
      const response = await fetch(`/api/shopify/sync/${type}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ forceSync })
      });

      if (!response.ok) {
        throw new Error(`Failed to sync ${type}`);
      }

      const data = await response.json();
      return data.syncedCount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sync failed');
      throw err;
    } finally {
      setSyncing(null);
    }
  };

  return { sync, syncing, error };
}