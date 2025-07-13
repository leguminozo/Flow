export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  vendor: string;
  product_type: string;
  created_at: string;
  updated_at: string;
  published_at: string;
  template_suffix: string | null;
  status: string;
  published_scope: string;
  tags: string;
  admin_graphql_api_id: string;
  variants: ShopifyVariant[];
  options: ShopifyOption[];
  images: ShopifyImage[];
  image: ShopifyImage | null;
}

export interface ShopifyVariant {
  id: string;
  product_id: string;
  title: string;
  price: string;
  sku: string;
  position: number;
  inventory_policy: string;
  compare_at_price: string | null;
  fulfillment_service: string;
  inventory_management: string;
  option1: string | null;
  option2: string | null;
  option3: string | null;
  created_at: string;
  updated_at: string;
  taxable: boolean;
  barcode: string | null;
  grams: number;
  image_id: string | null;
  weight: number;
  weight_unit: string;
  inventory_item_id: string;
  inventory_quantity: number;
  old_inventory_quantity: number;
  requires_shipping: boolean;
  admin_graphql_api_id: string;
}

export interface ShopifyOption {
  id: string;
  product_id: string;
  name: string;
  position: number;
  values: string[];
}

export interface ShopifyImage {
  id: string;
  product_id: string;
  position: number;
  created_at: string;
  updated_at: string;
  alt: string | null;
  width: number;
  height: number;
  src: string;
  variant_ids: string[];
  admin_graphql_api_id: string;
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  updated_at: string;
  body_html: string;
  published_at: string;
  sort_order: string;
  template_suffix: string | null;
  disjunctive: boolean;
  rules: ShopifyCollectionRule[];
  published_scope: string;
  admin_graphql_api_id: string;
  image: ShopifyImage | null;
}

export interface ShopifyCollectionRule {
  column: string;
  relation: string;
  condition: string;
}

export interface ShopifyOrder {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  number: number;
  note: string | null;
  token: string;
  gateway: string;
  test: boolean;
  total_price: string;
  subtotal_price: string;
  total_weight: number;
  total_tax: string;
  taxes_included: boolean;
  currency: string;
  financial_status: string;
  confirmed: boolean;
  total_discounts: string;
  buyer_accepts_marketing: boolean;
  name: string;
  referring_site: string | null;
  landing_site: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  total_price_usd: string;
  checkout_token: string | null;
  reference: string | null;
  user_id: string | null;
  location_id: string | null;
  source_identifier: string | null;
  source_url: string | null;
  processed_at: string;
  device_id: string | null;
  phone: string | null;
  customer_locale: string | null;
  app_id: string;
  browser_ip: string | null;
  landing_site_ref: string | null;
  order_number: number;
  discount_applications: any[];
  discount_codes: any[];
  note_attributes: any[];
  payment_gateway_names: string[];
  processing_method: string;
  checkout_id: string | null;
  source_name: string;
  fulfillment_status: string | null;
  tax_lines: any[];
  tags: string;
  contact_email: string;
  order_status_url: string;
  presentment_currency: string;
  total_line_items_price_set: any;
  total_discounts_set: any;
  total_shipping_price_set: any;
  subtotal_price_set: any;
  total_price_set: any;
  total_tax_set: any;
  line_items: ShopifyLineItem[];
  shipping_lines: any[];
  billing_address: ShopifyAddress | null;
  shipping_address: ShopifyAddress | null;
  fulfillments: any[];
  client_details: any;
  refunds: any[];
  customer: ShopifyCustomer | null;
}

export interface ShopifyLineItem {
  id: string;
  variant_id: string;
  title: string;
  quantity: number;
  sku: string;
  variant_title: string | null;
  vendor: string;
  fulfillment_service: string;
  product_id: string;
  requires_shipping: boolean;
  taxable: boolean;
  gift_card: boolean;
  name: string;
  variant_inventory_management: string;
  properties: any[];
  product_exists: boolean;
  fulfillable_quantity: number;
  grams: number;
  price: string;
  total_discount: string;
  fulfillment_status: string | null;
  price_set: any;
  total_discount_set: any;
  discount_allocations: any[];
  duties: any[];
  admin_graphql_api_id: string;
  tax_lines: any[];
}

export interface ShopifyAddress {
  first_name: string;
  address1: string;
  phone: string | null;
  city: string;
  zip: string;
  province: string;
  country: string;
  last_name: string;
  address2: string | null;
  company: string | null;
  latitude: number | null;
  longitude: number | null;
  name: string;
  country_code: string;
  province_code: string;
}

export interface ShopifyCustomer {
  id: string;
  email: string;
  accepts_marketing: boolean;
  created_at: string;
  updated_at: string;
  first_name: string;
  last_name: string;
  orders_count: number;
  state: string;
  total_spent: string;
  last_order_id: string | null;
  note: string | null;
  verified_email: boolean;
  multipass_identifier: string | null;
  tax_exempt: boolean;
  phone: string | null;
  tags: string;
  last_order_name: string | null;
  currency: string;
  addresses: ShopifyAddress[];
  accepts_marketing_updated_at: string;
  marketing_opt_in_level: string | null;
  tax_exemptions: any[];
  admin_graphql_api_id: string;
  default_address: ShopifyAddress | null;
}

// Tipos adaptados para la app
export interface AppProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  origin: 'Shopify';
  store: string;
  inStock: boolean;
  tags: string[];
  brand?: string;
  size?: string;
  shopifyData: {
    handle: string;
    variantId: string;
    productType: string;
    vendor: string;
    sku: string;
    weight: number;
    compareAtPrice?: number;
  };
}

export interface AppCollection {
  id: string;
  name: string;
  description: string;
  image?: string;
  productCount: number;
  handle: string;
}