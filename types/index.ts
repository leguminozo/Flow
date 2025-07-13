export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'Alimentos' | 'Limpieza' | 'Cuidado Personal' | 'Papel' | 'Bebidas' | 'Otros';
  origin: 'Supermercado' | 'Local' | 'Especializado';
  store: string;
  inStock: boolean;
  tags: string[];
  externalLink?: string;
  brand?: string;
  size?: string;
}

export interface Store {
  id: string;
  name: string;
  logo: string;
  description: string;
  type: 'Supermercado' | 'Local' | 'Especializado';
  categories: StoreCategory[];
  rating: number;
  deliveryTime: string;
  minimumOrder: number;
  isActive: boolean;
  specialties: string[];
  handle?: string;
}

export interface StoreCategory {
  id: string;
  name: string;
  icon: string;
  productCount: number;
  description: string;
}

export interface Subscription {
  id: number;
  products: SubscriptionProduct[];
  frequency: 'semanal' | 'quincenal' | 'mensual' | 'personalizada';
  deliveryDay: number; // día del mes
  deliveryTime: string;
  status: 'activa' | 'pausada' | 'cancelada';
  nextDelivery: string;
  totalPrice: number;
  addressId: number;
}

export interface SubscriptionProduct {
  productId: number;
  product: Product;
  quantity: number;
}

export interface Address {
  id: number;
  name: string;
  address: string;
  city: string;
  notes?: string;
  isDefault: boolean;
}

export interface DeliveryService {
  id: string;
  name: string;
  estimatedCost: number;
  estimatedTime: string;
  icon: string;
}

export interface Plan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  netPrice?: number;
  iva?: number;
  features: string[];
  maxAutomations: number; // Changed from maxSubscriptions
  freeDelivery: boolean;
  isPopular?: boolean;
  isFree?: boolean;
  costPerAutomation?: number;
  description?: string;
  operationalCost?: number;
  margin?: number;
  marginPercentage?: number;
  targetAudience?: string;
  savings?: number;
}