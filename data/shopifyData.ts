import { shopifyService } from '@/services/shopifyService';
import { AppProduct, AppCollection } from '@/types/shopify';
import { Store, StoreCategory } from '@/types';
import { supabase, getStoreProfileByHandle, syncShopifyStoreToSupabase, getStoreByHandle, syncShopifyProducts, getStoreCategories } from '@/lib/supabase';
import { CurrencyService } from '@/services/currencyService';

// Cache para productos y colecciones
let cachedProducts: AppProduct[] = [];
let cachedCollections: AppCollection[] = [];
let lastFetch: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para verificar si el cache es válido
const isCacheValid = () => {
  return Date.now() - lastFetch < CACHE_DURATION;
};

// Obtener productos de Shopify con cache
export const getShopifyProducts = async (): Promise<AppProduct[]> => {
  console.log('🔍 Verificando cache de productos Shopify...');
  if (isCacheValid() && cachedProducts.length > 0) {
    console.log('✅ Usando cache de productos Shopify');
    return cachedProducts;
  }

  try {
    console.log('🛒 Fetching products from Shopify...');
    const products = await shopifyService.getProducts(100);
    cachedProducts = products;
    lastFetch = Date.now();
    console.log(`✅ Loaded ${products.length} products from Shopify`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching Shopify products:', error);
    // Retornar productos mock si falla la conexión
    return getMockShopifyProducts();
  }
};

// Obtener colecciones de Shopify con cache
export const getShopifyCollections = async (): Promise<AppCollection[]> => {
  console.log('🔍 Verificando cache de colecciones Shopify...');
  if (isCacheValid() && cachedCollections.length > 0) {
    console.log('✅ Usando cache de colecciones Shopify');
    return cachedCollections;
  }

  try {
    console.log('📂 Fetching collections from Shopify...');
    const collections = await shopifyService.getCollections();
    cachedCollections = collections;
    lastFetch = Date.now();
    console.log(`✅ Loaded ${collections.length} collections from Shopify`);
    return collections;
  } catch (error) {
    console.error('❌ Error fetching Shopify collections:', error);
    // Retornar colecciones mock si falla la conexión
    return getMockShopifyCollections();
  }
};

// Buscar productos en Shopify
export const searchShopifyProducts = async (query: string): Promise<AppProduct[]> => {
  try {
    console.log(`🔍 Searching Shopify products for: "${query}"`);
    const products = await shopifyService.searchProducts(query);
    console.log(`✅ Found ${products.length} products matching "${query}"`);
    return products;
  } catch (error) {
    console.error('❌ Error searching Shopify products:', error);
    // Buscar en cache local si falla la conexión
    const allProducts = await getShopifyProducts();
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  }
};

// Obtener productos por colección
export const getShopifyProductsByCollection = async (collectionHandle: string): Promise<AppProduct[]> => {
  try {
    console.log(`📦 Fetching products from collection: ${collectionHandle}`);
    const products = await shopifyService.getProductsByCollection(collectionHandle);
    console.log(`✅ Loaded ${products.length} products from collection ${collectionHandle}`);
    return products;
  } catch (error) {
    console.error(`❌ Error fetching products from collection ${collectionHandle}:`, error);
    return [];
  }
};

// Función para sincronizar productos con Supabase
export const syncProductsWithSupabase = async (): Promise<boolean> => {
  try {
    console.log('🔄 Iniciando sincronización de productos con Supabase...');
    const products = await getShopifyProducts();
    if (products.length === 0) {
      console.log('No products to sync');
      return false;
    }

    const success = await syncShopifyProducts('obrerayzangano', products);
    if (success) {
      console.log(`✅ ${products.length} productos sincronizados con Supabase exitosamente`);
    }
    
    return success;
  } catch (error) {
    console.error('Error syncing products with Supabase:', error);
    return false;
  }
};

// Crear tienda Shopify para la app
export const createShopifyStore = async (): Promise<Store> => {
  console.log('🏪 Creando tienda Shopify para la app...');
  // Intentar obtener datos de la tienda desde Supabase
  const storeProfile = await getStoreProfileByHandle('obrerayzangano');
  console.log('📊 Perfil de tienda obtenido:', storeProfile?.name || 'No encontrado');
  
  // Intentar obtener categorías desde Supabase primero
  let categories: StoreCategory[] = await getStoreCategories('obrerayzangano');
  
  // Si no hay categorías en Supabase, obtenerlas de Shopify
  if (categories.length === 0) {
    console.log('🔄 Obteniendo colecciones desde Shopify...');
    const collections = await getShopifyCollections();
    
    // Mapear colecciones a categorías de tienda
    categories = collections.map(collection => ({
      id: collection.handle,
      name: collection.name,
      icon: getCategoryIcon(collection.name),
      productCount: collection.productCount,
      description: collection.description || `Productos de ${collection.name}`,
    }));
    
    // Agregar categoría "Todos" al inicio
    categories.unshift({
      id: 'todos',
      name: 'Todos los Productos',
      icon: '🛒',
      productCount: cachedProducts.length,
      description: 'Todos los productos disponibles',
    });
  } else {
    console.log(`✅ ${categories.length} categorías obtenidas desde Supabase`);
  }
  
  return {
    id: 'obrerayzangano',
    name: storeProfile?.name || 'La Obrera y el Zángano',
    logo: storeProfile?.logo_url || 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=400',
    description: storeProfile?.description || 'Productos apícolas artesanales y naturales de calidad premium',
    type: storeProfile?.store_type || 'Especializado',
    categories,
    rating: storeProfile?.rating || 4.9,
    deliveryTime: storeProfile?.delivery_time || '2-3 días',
    minimumOrder: storeProfile?.minimum_order || 15000,
    isActive: storeProfile?.is_active ?? true,
    specialties: storeProfile?.specialties || ['Miel Artesanal', 'Productos Apícolas', 'Origen Local', 'Calidad Premium'],
    handle: 'obrerayzangano'
  };
};

// Función para obtener icono de categoría
const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  
  if (name.includes('miel') || name.includes('honey')) return '🍯';
  if (name.includes('café') || name.includes('coffee')) return '☕';
  if (name.includes('jabón') || name.includes('soap')) return '🧼';
  if (name.includes('cosmetic') || name.includes('belleza')) return '💄';
  if (name.includes('limpieza') || name.includes('cleaning')) return '🧽';
  if (name.includes('hogar') || name.includes('home')) return '🏠';
  if (name.includes('regalo') || name.includes('gift')) return '🎁';
  if (name.includes('natural') || name.includes('organic')) return '🌿';
  
  return '📦'; // Icono por defecto
};

// Productos mock para fallback (basados en obrerayzangano.com)
const getMockShopifyProducts = (): AppProduct[] => [
  {
    id: 'mock-miel-ulmo',
    name: 'Miel de Ulmo Pura',
    description: 'Miel pura de ulmo del sur de Chile. Sabor único y propiedades medicinales.',
    price: CurrencyService.roundToNearestTen(12990),
    image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Shopify',
    store: 'Obrera y Zángano',
    inStock: true,
    tags: ['miel', 'ulmo', 'natural', 'artesanal', 'medicinal'],
    brand: 'Obrera y Zángano',
    size: '500g',
        shopifyData: {
      handle: 'miel-ulmo-pura',
      variantId: 'mock-variant-1',
      productType: 'Miel',
      vendor: 'Obrera y Zángano',
      sku: 'MIEL-ULMO-500G',
      weight: 0.5,
      compareAtPrice: undefined
    }
  },
  {
    id: 'mock-jabon-lavanda',
    name: 'Jabón de Lavanda Artesanal',
    description: 'Jabón natural de lavanda. Hidratante y relajante.',
    price: CurrencyService.roundToNearestTen(8990),
    image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Cuidado Personal',
    origin: 'Shopify',
    store: 'Obrera y Zángano',
    inStock: true,
    tags: ['jabón', 'lavanda', 'natural', 'artesanal', 'hidratante'],
    brand: 'Obrera y Zángano',
    size: '100g',
    shopifyData: {
      handle: 'jabon-lavanda-artesanal',
      variantId: 'mock-variant-2',
      productType: 'Jabón',
      vendor: 'Obrera y Zángano',
      sku: 'JABON-LAVANDA-100G',
      weight: 0.1,
      compareAtPrice: undefined
    }
  },
  {
    id: 'mock-cafe-etiopia',
    name: 'Café Etíope Yirgacheffe',
    description: 'Café gourmet etíope. Aroma floral y sabor cítrico.',
    price: CurrencyService.roundToNearestTen(15990),
    image: 'https://images.pexels.com/photos/312418/pexels-photo-312418.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Alimentos',
    origin: 'Shopify',
    store: 'Obrera y Zángano',
    inStock: true,
    tags: ['café', 'etíope', 'gourmet', 'artesanal', 'tostado'],
    brand: 'Obrera y Zángano',
    size: '250g',
    shopifyData: {
      handle: 'cafe-etiope-yirgacheffe',
      variantId: 'mock-variant-3',
      productType: 'Café',
      vendor: 'Obrera y Zángano',
      sku: 'CAFE-ETIOPE-250G',
      weight: 0.25,
      compareAtPrice: undefined
    }
  }
];

// Colecciones mock para fallback
const getMockShopifyCollections = (): AppCollection[] => [
  {
    id: 'mock-collection-miel',
    name: 'Mieles Artesanales',
    description: 'Nuestra selección de mieles puras y artesanales',
    handle: 'mieles-artesanales',
    productCount: 8,
    image: 'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'mock-collection-jabones',
    name: 'Jabones Naturales',
    description: 'Jabones artesanales con ingredientes naturales',
    handle: 'jabones-naturales',
    productCount: 6,
    image: 'https://images.pexels.com/photos/4465828/pexels-photo-4465828.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
  {
    id: 'mock-collection-velas',
    name: 'Velas de Cera',
    description: 'Velas artesanales de cera de abeja',
    handle: 'velas-cera',
    productCount: 4,
    image: 'https://images.pexels.com/photos/1123262/pexels-photo-1123262.jpeg?auto=compress&cs=tinysrgb&w=400',
  },
];

// Función para invalidar cache (útil para refrescar datos)
export const invalidateShopifyCache = () => {
  cachedProducts = [];
  cachedCollections = [];
  lastFetch = 0;
  console.log('🔄 Shopify cache invalidated');
};

// Función para obtener estadísticas de la tienda
export const getShopifyStoreStats = async () => {
  const products = await getShopifyProducts();
  const collections = await getShopifyCollections(); 
  
  const priceStats = products.length > 0 ? {
    min: Math.min(...products.map(p => p.price)),
    max: Math.max(...products.map(p => p.price)),
    average: products.reduce((sum, p) => sum + p.price, 0) / products.length
  } : { min: 0, max: 0, average: 0 };
  
  return {
    totalProducts: products.length,
    totalCollections: collections.length,
    inStockProducts: products.filter(p => p.inStock).length,
    averagePrice: priceStats.average,
    minPrice: priceStats.min,
    maxPrice: priceStats.max,
    formattedAveragePrice: CurrencyService.formatCLPSimple(
      Math.round(priceStats.average)
    ),
    formattedPriceRange: CurrencyService.formatPriceRange(
      Math.round(priceStats.min),
      Math.round(priceStats.max)
    ),
    categories: [...new Set(products.map(p => p.category))],
    lastUpdated: new Date(lastFetch).toISOString(),
    syncStatus: 'connected',
    storeName: 'La Obrera y el Zángano',
    storeType: 'Especializado'
  };
};