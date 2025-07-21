/**
 * Data source adapters for merge tags
 * Provides interfaces for connecting to external data sources
 */

export interface DataSource {
  id: string;
  name: string;
  type: 'shopify' | 'woocommerce' | 'csv' | 'api';
  connected: boolean;
  lastSync?: string;
}

export interface DataSourceConfig {
  apiKey?: string;
  apiSecret?: string;
  storeUrl?: string;
  accessToken?: string;
  endpoint?: string;
}

export interface DataMapping {
  sourceField: string;
  targetTag: string;
  transform?: (value: any) => any;
}

export interface FetchOptions {
  customerId?: string;
  orderId?: string;
  productId?: string;
  limit?: number;
  fields?: string[];
}

export abstract class DataSourceAdapter {
  protected config: DataSourceConfig;
  protected mappings: DataMapping[];

  constructor(config: DataSourceConfig, mappings: DataMapping[] = []) {
    this.config = config;
    this.mappings = mappings;
  }

  abstract connect(): Promise<boolean>;
  abstract disconnect(): Promise<void>;
  abstract fetchData(options: FetchOptions): Promise<Record<string, any>>;
  abstract testConnection(): Promise<boolean>;
  
  /**
   * Map external data to merge tag format
   */
  protected mapData(sourceData: Record<string, any>): Record<string, any> {
    const mappedData: Record<string, any> = {};

    this.mappings.forEach(mapping => {
      const value = this.getValueByPath(sourceData, mapping.sourceField);
      if (value !== undefined) {
        const transformedValue = mapping.transform ? mapping.transform(value) : value;
        this.setValueByPath(mappedData, mapping.targetTag, transformedValue);
      }
    });

    return mappedData;
  }

  protected getValueByPath(obj: Record<string, any>, path: string): any {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  }

  protected setValueByPath(obj: Record<string, any>, path: string, value: any): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    
    const target = keys.reduce((acc, key) => {
      if (!acc[key]) acc[key] = {};
      return acc[key];
    }, obj);
    
    target[lastKey] = value;
  }
}

/**
 * Shopify data source adapter
 */
export class ShopifyAdapter extends DataSourceAdapter {
  private client: any = null;

  async connect(): Promise<boolean> {
    try {
      // In real implementation, use Shopify Admin API client
      // This is a placeholder for the actual connection logic
      const { storeUrl, accessToken } = this.config;
      
      if (!storeUrl || !accessToken) {
        throw new Error('Missing Shopify credentials');
      }

      // Initialize Shopify client here
      this.client = {
        connected: true,
        storeUrl,
        // ... other client properties
      };

      return true;
    } catch (error) {
      console.error('Failed to connect to Shopify:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.client = null;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test API call to verify credentials
      const response = await this.fetchData({ limit: 1 });
      return !!response;
    } catch {
      return false;
    }
  }

  async fetchData(options: FetchOptions): Promise<Record<string, any>> {
    if (!this.client) {
      throw new Error('Not connected to Shopify');
    }

    try {
      // Placeholder for actual Shopify API calls
      // In real implementation, fetch data from Shopify based on options
      
      const mockData = {
        customer: {
          id: options.customerId || '123',
          email: 'customer@example.com',
          first_name: 'John',
          last_name: 'Doe',
          phone: '+1234567890',
          orders_count: 5,
          total_spent: '1234.56',
          tags: ['vip', 'repeat_customer']
        },
        order: options.orderId ? {
          id: options.orderId,
          name: '#1001',
          total_price: '129.99',
          fulfillment_status: 'fulfilled',
          financial_status: 'paid',
          line_items: []
        } : null
      };

      return this.mapData(mockData);
    } catch (error) {
      console.error('Error fetching Shopify data:', error);
      throw error;
    }
  }
}

/**
 * WooCommerce data source adapter
 */
export class WooCommerceAdapter extends DataSourceAdapter {
  private apiClient: any = null;

  async connect(): Promise<boolean> {
    try {
      const { storeUrl, apiKey, apiSecret } = this.config;
      
      if (!storeUrl || !apiKey || !apiSecret) {
        throw new Error('Missing WooCommerce credentials');
      }

      // Initialize WooCommerce API client
      this.apiClient = {
        url: storeUrl,
        consumerKey: apiKey,
        consumerSecret: apiSecret,
        version: 'wc/v3'
      };

      return true;
    } catch (error) {
      console.error('Failed to connect to WooCommerce:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.apiClient = null;
  }

  async testConnection(): Promise<boolean> {
    try {
      // Test API call
      const response = await this.fetchData({ limit: 1 });
      return !!response;
    } catch {
      return false;
    }
  }

  async fetchData(options: FetchOptions): Promise<Record<string, any>> {
    if (!this.apiClient) {
      throw new Error('Not connected to WooCommerce');
    }

    try {
      // Placeholder for actual WooCommerce API calls
      const mockData = {
        customer: {
          id: options.customerId || 456,
          email: 'customer@shop.com',
          first_name: 'Jane',
          last_name: 'Smith',
          billing: {
            phone: '+1987654321'
          },
          orders_count: 3,
          total_spent: '567.89'
        },
        order: options.orderId ? {
          id: options.orderId,
          number: '1002',
          total: '89.99',
          status: 'completed',
          line_items: []
        } : null
      };

      return this.mapData(mockData);
    } catch (error) {
      console.error('Error fetching WooCommerce data:', error);
      throw error;
    }
  }
}

/**
 * CSV data source adapter
 */
export class CSVAdapter extends DataSourceAdapter {
  private data: any[] = [];

  async connect(): Promise<boolean> {
    return true; // CSV doesn't need connection
  }

  async disconnect(): Promise<void> {
    this.data = [];
  }

  async testConnection(): Promise<boolean> {
    return true;
  }

  async loadCSV(csvContent: string): Promise<void> {
    const lines = csvContent.trim().split('\n');
    if (lines.length < 2) {
      throw new Error('CSV must have headers and at least one data row');
    }

    const headers = lines[0].split(',').map(h => h.trim());
    this.data = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: Record<string, any> = {};
      
      headers.forEach((header, index) => {
        this.setValueByPath(row, header, values[index] || '');
      });
      
      return row;
    });
  }

  async fetchData(options: FetchOptions): Promise<Record<string, any>> {
    const index = options.customerId ? parseInt(options.customerId) : 0;
    
    if (index >= 0 && index < this.data.length) {
      return this.mapData(this.data[index]);
    }
    
    return {};
  }
}

/**
 * Generic API data source adapter
 */
export class APIAdapter extends DataSourceAdapter {
  async connect(): Promise<boolean> {
    const { endpoint } = this.config;
    return !!endpoint;
  }

  async disconnect(): Promise<void> {
    // No persistent connection for generic API
  }

  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(this.config.endpoint!, {
        method: 'HEAD',
        headers: this.getHeaders()
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async fetchData(options: FetchOptions): Promise<Record<string, any>> {
    const { endpoint } = this.config;
    if (!endpoint) {
      throw new Error('No API endpoint configured');
    }

    try {
      const url = new URL(endpoint);
      
      // Add query parameters
      Object.entries(options).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return this.mapData(data);
    } catch (error) {
      console.error('Error fetching API data:', error);
      throw error;
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    if (this.config.apiKey) {
      headers['Authorization'] = `Bearer ${this.config.apiKey}`;
    }

    return headers;
  }
}

/**
 * Create a data source adapter
 */
export function createDataSourceAdapter(
  type: DataSource['type'],
  config: DataSourceConfig,
  mappings?: DataMapping[]
): DataSourceAdapter {
  switch (type) {
    case 'shopify':
      return new ShopifyAdapter(config, mappings || getDefaultShopifyMappings());
    
    case 'woocommerce':
      return new WooCommerceAdapter(config, mappings || getDefaultWooCommerceMappings());
    
    case 'csv':
      return new CSVAdapter(config, mappings);
    
    case 'api':
      return new APIAdapter(config, mappings);
    
    default:
      throw new Error(`Unknown data source type: ${type}`);
  }
}

/**
 * Default field mappings for Shopify
 */
function getDefaultShopifyMappings(): DataMapping[] {
  return [
    { sourceField: 'customer.email', targetTag: 'customer.email' },
    { sourceField: 'customer.first_name', targetTag: 'customer.first_name' },
    { sourceField: 'customer.last_name', targetTag: 'customer.last_name' },
    { sourceField: 'customer.phone', targetTag: 'customer.phone' },
    { sourceField: 'customer.orders_count', targetTag: 'customer.total_orders' },
    { sourceField: 'customer.total_spent', targetTag: 'customer.lifetime_value', 
      transform: (value) => `$${value}` },
    { sourceField: 'order.name', targetTag: 'order.number' },
    { sourceField: 'order.total_price', targetTag: 'order.total',
      transform: (value) => `$${value}` },
    { sourceField: 'order.fulfillment_status', targetTag: 'order.status' }
  ];
}

/**
 * Default field mappings for WooCommerce
 */
function getDefaultWooCommerceMappings(): DataMapping[] {
  return [
    { sourceField: 'customer.email', targetTag: 'customer.email' },
    { sourceField: 'customer.first_name', targetTag: 'customer.first_name' },
    { sourceField: 'customer.last_name', targetTag: 'customer.last_name' },
    { sourceField: 'customer.billing.phone', targetTag: 'customer.phone' },
    { sourceField: 'customer.orders_count', targetTag: 'customer.total_orders' },
    { sourceField: 'customer.total_spent', targetTag: 'customer.lifetime_value',
      transform: (value) => `$${value}` },
    { sourceField: 'order.number', targetTag: 'order.number',
      transform: (value) => `#${value}` },
    { sourceField: 'order.total', targetTag: 'order.total',
      transform: (value) => `$${value}` },
    { sourceField: 'order.status', targetTag: 'order.status' }
  ];
}