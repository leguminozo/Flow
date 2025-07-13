import { Product, Plan, DeliveryService, Address, Store, StoreCategory } from '@/types';
import { getShopifyProducts, createShopifyStore } from './shopifyData';
import { AppProduct } from '@/types/shopify';

// Función para combinar productos mock con productos de Shopify
export const getAllProducts = async (): Promise<Product[]> => {
  try {
    // Obtener productos de Shopify
    const shopifyProducts = await getShopifyProducts();
    
    // Convertir productos de Shopify al formato de la app
    const convertedShopifyProducts: Product[] = shopifyProducts.map((shopifyProduct: AppProduct) => ({
      id: parseInt(shopifyProduct.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000000),
      name: shopifyProduct.name,
      description: shopifyProduct.description,
      price: shopifyProduct.price,
      image: shopifyProduct.image,
      category: shopifyProduct.category as Product['category'],
      origin: 'Local' as Product['origin'], // Shopify products are considered local
      store: shopifyProduct.store,
      inStock: shopifyProduct.inStock,
      tags: shopifyProduct.tags,
      brand: shopifyProduct.brand,
      size: shopifyProduct.size,
    }));
    
    // Combinar con productos mock existentes
    return [...mockProducts, ...convertedShopifyProducts];
  } catch (error) {
    console.error('Error fetching Shopify products, using mock data:', error);
    return mockProducts;
  }
};

// Función para obtener todas las tiendas (incluyendo Shopify)
export const getAllStores = async (): Promise<Store[]> => {
  try {
    const shopifyStore = await createShopifyStore();
    return [...mockStores, shopifyStore];
  } catch (error) {
    console.error('Error creating Shopify store, using mock data:', error);
    return mockStores;
  }
};

export const mockStores: Store[] = [
  {
    id: 'jumbo',
    name: 'Jumbo',
    logo: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Supermercado líder con la mayor variedad de productos para el hogar',
    type: 'Supermercado',
    rating: 4.5,
    deliveryTime: '45-60 min',
    minimumOrder: 15000,
    isActive: true,
    specialties: ['Productos frescos', 'Marcas premium', 'Variedad internacional'],
    categories: [
      { id: 'bebidas', name: 'Bebidas', icon: '☕', productCount: 45, description: 'Café, té, jugos y bebidas calientes' },
      { id: 'alimentos', name: 'Alimentos', icon: '🥗', productCount: 120, description: 'Productos frescos y enlatados' },
      { id: 'limpieza', name: 'Limpieza', icon: '🧽', productCount: 35, description: 'Detergentes y productos de limpieza' },
      { id: 'papel', name: 'Papel', icon: '🧻', productCount: 20, description: 'Papel higiénico y toallas' }
    ]
  },
  {
    id: 'lider',
    name: 'Líder',
    logo: 'https://images.pexels.com/photos/1005638/pexels-photo-1005638.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Precios bajos todos los días en productos esenciales',
    type: 'Supermercado',
    rating: 4.2,
    deliveryTime: '30-45 min',
    minimumOrder: 12000,
    isActive: true,
    specialties: ['Precios bajos', 'Ofertas diarias', 'Productos básicos'],
    categories: [
      { id: 'papel', name: 'Papel', icon: '🧻', productCount: 25, description: 'Papel higiénico y servilletas' },
      { id: 'limpieza', name: 'Limpieza', icon: '🧽', productCount: 40, description: 'Productos de limpieza económicos' },
      { id: 'alimentos', name: 'Alimentos', icon: '🥗', productCount: 80, description: 'Alimentos básicos y conservas' }
    ]
  },
  {
    id: 'unimarc',
    name: 'Unimarc',
    logo: 'https://images.pexels.com/photos/1267320/pexels-photo-1267320.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Supermercado de barrio con productos de calidad',
    type: 'Supermercado',
    rating: 4.3,
    deliveryTime: '40-55 min',
    minimumOrder: 10000,
    isActive: true,
    specialties: ['Productos locales', 'Atención personalizada', 'Calidad garantizada'],
    categories: [
      { id: 'limpieza', name: 'Limpieza', icon: '🧽', productCount: 30, description: 'Detergentes concentrados' },
      { id: 'alimentos', name: 'Alimentos', icon: '🥗', productCount: 60, description: 'Productos frescos diarios' },
      { id: 'cuidado', name: 'Cuidado Personal', icon: '🧴', productCount: 25, description: 'Higiene y cuidado' }
    ]
  },
  {
    id: 'apiario-del-sur',
    name: 'Apiario del Sur',
    logo: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Productor local de miel artesanal y productos naturales',
    type: 'Local',
    rating: 4.8,
    deliveryTime: '2-3 días',
    minimumOrder: 8000,
    isActive: true,
    specialties: ['Miel cruda', 'Productos artesanales', 'Origen local'],
    categories: [
      { id: 'miel', name: 'Miel', icon: '🍯', productCount: 12, description: 'Miel cruda de diferentes flores' },
      { id: 'naturales', name: 'Productos Naturales', icon: '🌿', productCount: 8, description: 'Propóleo, polen y más' }
    ]
  },
  {
    id: 'olivares-del-valle',
    name: 'Olivares del Valle',
    logo: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=200',
    description: 'Aceites de oliva premium del Valle del Maipo',
    type: 'Local',
    rating: 4.9,
    deliveryTime: '1-2 días',
    minimumOrder: 12000,
    isActive: true,
    specialties: ['Extra virgen', 'Prensado en frío', 'Valle del Maipo'],
    categories: [
      { id: 'aceites', name: 'Aceites', icon: '🫒', productCount: 6, description: 'Aceites de oliva premium' },
      { id: 'gourmet', name: 'Gourmet', icon: '✨', productCount: 4, description: 'Productos gourmet selectos' }
    ]
  },
  {
    id: 'tostadores-artesanales',
    name: 'Tostadores Artesanales',
    logo: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Café de especialidad tostado artesanalmente',
    type: 'Especializado',
    rating: 4.7,
    deliveryTime: '1-2 días',
    minimumOrder: 15000,
    isActive: true,
    specialties: ['Tostado artesanal', 'Origen único', 'Café de especialidad'],
    categories: [
      { id: 'cafe', name: 'Café', icon: '☕', productCount: 15, description: 'Granos de diferentes orígenes' },
      { id: 'accesorios', name: 'Accesorios', icon: '⚙️', productCount: 8, description: 'Equipos para preparar café' }
    ]
  },
  {
    id: 'jabones-naturales',
    name: 'Jabones Naturales',
    logo: 'https://images.pexels.com/photos/4465828/pexels-photo-4465828.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Jabones artesanales con ingredientes naturales',
    type: 'Especializado',
    rating: 4.6,
    deliveryTime: '2-3 días',
    minimumOrder: 6000,
    isActive: true,
    specialties: ['Ingredientes naturales', 'Sin químicos', 'Artesanal'],
    categories: [
      { id: 'jabones', name: 'Jabones', icon: '🧼', productCount: 10, description: 'Jabones con aceites esenciales' },
      { id: 'cosmetica', name: 'Cosmética Natural', icon: '🌸', productCount: 6, description: 'Cremas y bálsamos naturales' }
    ]
  },
  {
    id: 'granos-andinos',
    name: 'Granos Andinos',
    logo: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=200',
    description: 'Quinoa y granos orgánicos del altiplano',
    type: 'Local',
    rating: 4.4,
    deliveryTime: '2-4 días',
    minimumOrder: 10000,
    isActive: false,
    specialties: ['Quinoa orgánica', 'Altiplano', 'Comercio justo'],
    categories: [
      { id: 'granos', name: 'Granos', icon: '🌾', productCount: 8, description: 'Quinoa, amaranto y más' },
      { id: 'organicos', name: 'Orgánicos', icon: '🌱', productCount: 5, description: 'Productos certificados orgánicos' }
    ]
  }
];

export let mockProducts: Product[] = [
  // Jumbo - Bebidas
  {
    id: 1,
    name: 'Café Nescafé Gold',
    description: 'Café instantáneo premium de 200g',
    price: 4990,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    origin: 'Supermercado',
    store: 'Jumbo',
    inStock: true,
    tags: ['Premium', 'Instantáneo'],
    brand: 'Nescafé',
    size: '200g'
  },
  {
    id: 2,
    name: 'Café Nescafé Clásico',
    description: 'Café instantáneo tradicional de 170g',
    price: 3490,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    origin: 'Supermercado',
    store: 'Jumbo',
    inStock: true,
    tags: ['Clásico', 'Instantáneo'],
    brand: 'Nescafé',
    size: '170g'
  },
  {
    id: 3,
    name: 'Café Juan Valdez Grano',
    description: 'Café molido colombiano de 250g',
    price: 6990,
    image: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    origin: 'Supermercado',
    store: 'Jumbo',
    inStock: true,
    tags: ['Colombiano', 'Molido'],
    brand: 'Juan Valdez',
    size: '250g'
  },

  // Líder - Papel
  {
    id: 4,
    name: 'Papel Higiénico Elite',
    description: 'Papel higiénico doble hoja, pack de 12 rollos',
    price: 8990,
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Papel',
    origin: 'Supermercado',
    store: 'Lider',
    inStock: true,
    tags: ['Doble Hoja', 'Pack Familiar'],
    brand: 'Elite',
    size: '12 rollos'
  },
  {
    id: 5,
    name: 'Papel Higiénico Noble',
    description: 'Papel higiénico triple hoja, pack de 8 rollos',
    price: 7490,
    image: 'https://images.pexels.com/photos/4465124/pexels-photo-4465124.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Papel',
    origin: 'Supermercado',
    store: 'Lider',
    inStock: true,
    tags: ['Triple Hoja', 'Suave'],
    brand: 'Noble',
    size: '8 rollos'
  },

  // Unimarc - Limpieza
  {
    id: 6,
    name: 'Detergente Ariel',
    description: 'Detergente líquido concentrado 3L',
    price: 6990,
    image: 'https://images.pexels.com/photos/6197118/pexels-photo-6197118.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Limpieza',
    origin: 'Supermercado',
    store: 'Unimarc',
    inStock: true,
    tags: ['Concentrado', 'Ropa Blanca'],
    brand: 'Ariel',
    size: '3L'
  },
  {
    id: 7,
    name: 'Detergente Omo',
    description: 'Detergente en polvo multiactivo 1kg',
    price: 4990,
    image: 'https://images.pexels.com/photos/6197118/pexels-photo-6197118.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Limpieza',
    origin: 'Supermercado',
    store: 'Unimarc',
    inStock: true,
    tags: ['Polvo', 'Multiactivo'],
    brand: 'Omo',
    size: '1kg'
  },

  // Apiario del Sur - Miel
  {
    id: 8,
    name: 'Miel Artesanal de Bosque',
    description: 'Miel cruda de flores silvestres, 500g',
    price: 12990,
    image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Local',
    store: 'Apiario del Sur',
    inStock: true,
    tags: ['Cruda', 'Artesanal', 'Local'],
    brand: 'Apiario del Sur',
    size: '500g'
  },
  {
    id: 9,
    name: 'Miel de Ulmo',
    description: 'Miel pura de ulmo, 350g',
    price: 15990,
    image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Local',
    store: 'Apiario del Sur',
    inStock: true,
    tags: ['Ulmo', 'Pura', 'Premium'],
    brand: 'Apiario del Sur',
    size: '350g'
  },

  // Olivares del Valle - Aceites
  {
    id: 10,
    name: 'Aceite de Oliva Extra Virgen',
    description: 'Aceite de oliva premium del valle del Maipo, 500ml',
    price: 15990,
    image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Local',
    store: 'Olivares del Valle',
    inStock: true,
    tags: ['Extra Virgen', 'Premium', 'Valle del Maipo'],
    brand: 'Olivares del Valle',
    size: '500ml'
  },
  {
    id: 11,
    name: 'Aceite de Oliva Reserva',
    description: 'Aceite de oliva reserva especial, 250ml',
    price: 22990,
    image: 'https://images.pexels.com/photos/33783/olive-oil-salad-dressing-cooking-olive.jpg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Local',
    store: 'Olivares del Valle',
    inStock: true,
    tags: ['Reserva', 'Especial', 'Gourmet'],
    brand: 'Olivares del Valle',
    size: '250ml'
  },

  // Tostadores Artesanales - Café
  {
    id: 12,
    name: 'Café de Especialidad Etíope',
    description: 'Granos de café tostado artesanal, origen Etiopía, 250g',
    price: 18990,
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    origin: 'Especializado',
    store: 'Tostadores Artesanales',
    inStock: true,
    tags: ['Especialidad', 'Etíope', 'Tostado Artesanal'],
    brand: 'Tostadores Artesanales',
    size: '250g'
  },
  {
    id: 13,
    name: 'Café Colombiano Huila',
    description: 'Café de origen colombiano, región Huila, 250g',
    price: 16990,
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    origin: 'Especializado',
    store: 'Tostadores Artesanales',
    inStock: true,
    tags: ['Colombiano', 'Huila', 'Origen único'],
    brand: 'Tostadores Artesanales',
    size: '250g'
  },
  {
    id: 14,
    name: 'Café Brasileño Santos',
    description: 'Café brasileño de la región Santos, 250g',
    price: 14990,
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Bebidas',
    origin: 'Especializado',
    store: 'Tostadores Artesanales',
    inStock: true,
    tags: ['Brasileño', 'Santos', 'Suave'],
    brand: 'Tostadores Artesanales',
    size: '250g'
  },

  // Jabones Naturales
  {
    id: 15,
    name: 'Jabón Natural de Lavanda',
    description: 'Jabón artesanal con aceites esenciales, 120g',
    price: 4990,
    image: 'https://images.pexels.com/photos/4465828/pexels-photo-4465828.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Cuidado Personal',
    origin: 'Especializado',
    store: 'Jabones Naturales',
    inStock: true,
    tags: ['Natural', 'Lavanda', 'Artesanal'],
    brand: 'Jabones Naturales',
    size: '120g'
  },
  {
    id: 16,
    name: 'Jabón de Avena y Miel',
    description: 'Jabón exfoliante con avena y miel, 120g',
    price: 5490,
    image: 'https://images.pexels.com/photos/4465828/pexels-photo-4465828.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Cuidado Personal',
    origin: 'Especializado',
    store: 'Jabones Naturales',
    inStock: true,
    tags: ['Avena', 'Miel', 'Exfoliante'],
    brand: 'Jabones Naturales',
    size: '120g'
  },

  // Granos Andinos
  {
    id: 17,
    name: 'Quinoa Orgánica',
    description: 'Quinoa orgánica del altiplano, 1kg',
    price: 7990,
    image: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Local',
    store: 'Granos Andinos',
    inStock: false,
    tags: ['Orgánica', 'Altiplano', 'Superfood'],
    brand: 'Granos Andinos',
    size: '1kg'
  }
];

export const mockPlans: Plan[] = [
  {
    id: 'esencial-flow',
    name: 'Esencial Flow',
    price: 0,
    isFree: true,
    features: [
      'Hasta 12 automatizaciones gratuitas',
      'Entrega estándar (costo adicional)',
      'Acceso a catálogo básico',
      'Soporte por email'
    ],
    maxAutomations: 12,
    costPerAutomation: 300,
    freeDelivery: false,
    description: 'Plan gratuito ideal para comenzar con automatización básica de compras esenciales.',
    targetAudience: 'Usuarios nuevos'
  },
  {
    id: 'super-esencial-flow',
    name: 'Súper Esencial Flow',
    price: 9990,
    features: [
      'Automatizaciones ilimitadas',
      'Envíos gratis',
      'Acceso completo al catálogo',
      'Soporte prioritario',
      'Descuentos exclusivos',
      'Recomendaciones AI personalizadas'
    ],
    maxAutomations: -1, // unlimited
    freeDelivery: true,
    isPopular: true,
    description: 'Plan premium con automatizaciones ilimitadas y beneficios exclusivos.',
    targetAudience: 'Usuarios frecuentes',
    savings: 5000
  }
];

export const mockDeliveryServices: DeliveryService[] = [
  {
    id: 'pedidosya',
    name: 'Pedidos Ya',
    estimatedCost: 2990,
    estimatedTime: '45-60 min',
    icon: '🛵'
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    estimatedCost: 3490,
    estimatedTime: '30-45 min',
    icon: '🚗'
  },
  {
    id: 'chilexpress',
    name: 'Chilexpress',
    estimatedCost: 4990,
    estimatedTime: '1-2 días',
    icon: '📦'
  }
];

// Global address state that can be updated from anywhere
export let mockAddresses: Address[] = [
  {
    id: 1,
    name: 'Casa',
    address: 'Av. Las Condes 12345, Las Condes',
    city: 'Santiago',
    notes: 'Portón azul, timbre 2B',
    isDefault: true
  },
  {
    id: 2,
    name: 'Trabajo',
    address: 'Av. Providencia 6789, Providencia',
    city: 'Santiago',
    notes: 'Oficina 1205, Torre Norte',
    isDefault: false
  }
];

// Function to update addresses globally
export const updateGlobalAddresses = (newAddresses: Address[]) => {
  mockAddresses.length = 0;
  mockAddresses.push(...newAddresses);
  console.log('🌐 Direcciones actualizadas globalmente:', mockAddresses);
};

// Function to get current addresses
export const getCurrentAddresses = (): Address[] => {
  return [...mockAddresses];
};

// Helper functions for store-based catalog
export const getStoreById = (storeId: string): Store | undefined => {
  return mockStores.find(store => store.id === storeId);
};

export const getProductsByStore = (storeId: string): Product[] => {
  const store = getStoreById(storeId);
  if (!store) return [];
  return mockProducts.filter(product => product.store === store.name);
};

export const getProductsByStoreAndCategory = (storeId: string, categoryId: string): Product[] => {
  const storeProducts = getProductsByStore(storeId);
  const store = getStoreById(storeId);
  
  if (!store) return [];
  
  const category = store.categories.find(cat => cat.id === categoryId);
  if (!category) return storeProducts;
  
  // Map category IDs to product categories
  const categoryMapping: {[key: string]: string} = {
    'bebidas': 'Bebidas',
    'alimentos': 'Alimentos',
    'limpieza': 'Limpieza',
    'papel': 'Papel',
    'cuidado': 'Cuidado Personal',
    'miel': 'Alimentos',
    'naturales': 'Alimentos',
    'aceites': 'Alimentos',
    'gourmet': 'Alimentos',
    'cafe': 'Bebidas',
    'accesorios': 'Otros',
    'jabones': 'Cuidado Personal',
    'cosmetica': 'Cuidado Personal',
    'granos': 'Alimentos',
    'organicos': 'Alimentos'
  };
  
  const productCategory = categoryMapping[categoryId];
  if (!productCategory) return storeProducts;
  
  return storeProducts.filter(product => product.category === productCategory);
};