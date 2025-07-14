import { createClient } from '@supabase/supabase-js';

// Valores por defecto para desarrollo local
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://qeasirszwsitmmmjhcbl.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFlYXNpcnN6d3NpdG1tbWpoY2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MTc2MDAsImV4cCI6MjA2NjE5MzYwMH0.T__ysRUw8LRnQC3lD6vs5tRUjgcK8vx--sVRWTiP_oE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas de Supabase
export interface SupabaseStore {
  id: number;
  handle: string;
  name: string;
  logo_url?: string;
  description?: string;
  store_type?: 'Supermercado' | 'Local' | 'Especializado';
  rating?: number;
  delivery_time?: string;
  minimum_order?: number;
  is_open?: boolean;
  specialties?: string[];
  shopify_domain?: string;
  shopify_storefront_token?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseProduct {
  id: number;
  store_id: number;
  handle: string;
  name: string;
  description?: string;
  price_clp: number;
  image_url?: string;
  category?: string;
  origin?: string;
  in_stock?: boolean;
  tags?: string[];
  brand?: string;
  size?: string;
  shopify_product_id?: string;
  shopify_handle?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseStoreCategory {
  id: number;
  store_id: number;
  handle: string;
  name: string;
  icon?: string;
  product_count?: number;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipos para la base de datos
export interface StoreProfile {
  id: number;
  handle: string;
  name: string;
  logo_url: string;
  description: string;
  store_type: 'Supermercado' | 'Local' | 'Especializado';
  rating: number;
  delivery_time: string;
  minimum_order: number;
  is_active: boolean;
  specialties: string[];
  shopify_domain?: string;
  shopify_storefront_token?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductProfile {
  id: number;
  store_id: number;
  name: string;
  description: string;
  price_clp: number;
  image_url: string;
  category: string;
  origin: string;
  in_stock: boolean;
  tags: string[];
  brand?: string;
  size?: string;
  shopify_product_id?: string;
  shopify_handle?: string;
  handle?: string;
  created_at: string;
  updated_at: string;
}

// Funciones para gestionar tiendas
export const getStoreProfileByHandle = async (storeHandle: string): Promise<StoreProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .eq('handle', storeHandle)
      .single();

    if (error) {
      console.error('Error fetching store profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getStoreProfileByHandle:', error);
    return null;
  }
};

export const getAllStoreProfiles = async (): Promise<StoreProfile[]> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching store profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getAllStoreProfiles:', error);
    return [];
  }
};

export const upsertStoreProfile = async (store: Partial<StoreProfile>): Promise<StoreProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('stores')
      .upsert(store)
      .select()
      .single();

    if (error) {
      console.error('Error upserting store profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertStoreProfile:', error);
    return null;
  }
};

// Funciones para gestionar productos
export const getProductProfiles = async (storeId?: string): Promise<ProductProfile[]> => {
  try {
    let query = supabase.from('products').select('*');
    
    if (storeId) {
      query = query.eq('store_id', storeId);
    }

    const { data, error } = await query.order('name');

    if (error) {
      console.error('Error fetching product profiles:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getProductProfiles:', error);
    return [];
  }
};

export const upsertProductProfile = async (product: Partial<ProductProfile>): Promise<ProductProfile | null> => {
  try {
    const { data, error } = await supabase
      .from('products')
      .upsert(product)
      .select()
      .single();

    if (error) {
      console.error('Error upserting product profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertProductProfile:', error);
    return null;
  }
};

// Función para sincronizar datos de Shopify con Supabase
export const syncShopifyStoreToSupabase = async (
  shopifyStoreData: any,
  shopifyProducts: any[]
): Promise<void> => {
  try {
    // Sincronizar tienda
    const storeProfile: Partial<StoreProfile> = {
      handle: 'obrerayzangano',
      name: 'Obrera y Zángano',
      logo_url: 'https://cdn.shopify.com/s/files/1/0123/4567/files/logo.png', // URL del logo desde Shopify
      description: 'Productos artesanales y naturales de calidad premium',
      store_type: 'Especializado',
      rating: 4.9,
      delivery_time: '2-3 días',
      minimum_order: 15000,
      is_active: true,
      specialties: ['Productos Artesanales', 'Miel Natural', 'Origen Local', 'Calidad Premium'],
      shopify_domain: 'obrerayzangano.myshopify.com',
      shopify_storefront_token: process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    };

    const upsertedStore = await upsertStoreProfile(storeProfile);
    
    if (!upsertedStore) {
      console.error('Failed to upsert store profile');
      return;
    }
    
    const supabaseStoreId = upsertedStore.id;

    // Sincronizar productos
    for (const shopifyProduct of shopifyProducts) {
      // Generar handle único para el producto
      const productHandle = shopifyProduct.handle || 
        shopifyProduct.name?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') ||
        `product-${Date.now()}`;
        
      const productProfile: Partial<ProductProfile> = {
        store_id: supabaseStoreId,
        handle: productHandle,
        name: shopifyProduct.name,
        description: shopifyProduct.description,
        price_clp: shopifyProduct.price,
        image_url: shopifyProduct.image,
        category: shopifyProduct.category,
        origin: 'Shopify',
        in_stock: shopifyProduct.inStock,
        tags: shopifyProduct.tags,
        brand: shopifyProduct.brand,
        size: shopifyProduct.size,
        shopify_product_id: shopifyProduct.id,
        shopify_handle: shopifyProduct.shopifyData?.handle,
      };

      await upsertProductProfile(productProfile);
    }

    console.log('✅ Shopify data synced to Supabase successfully');
  } catch (error) {
    console.error('❌ Error syncing Shopify data to Supabase:', error);
  }
};

// Función para obtener el logo de una tienda desde Supabase
export async function getStoreLogo(storeHandle: string): Promise<string | null> {
  try {
    console.log('🔍 Buscando logo para tienda:', storeHandle);
    const { data, error } = await supabase
      .from('stores')
      .select('logo_url')
      .eq('handle', storeHandle)
      .single();

    if (error) {
      console.error('Error fetching store logo:', error);
      return null;
    }
    
    console.log('✅ Logo encontrado:', data?.logo_url);
    return data?.logo_url || null;
  } catch (error) {
    console.error('Error in getStoreLogo:', error);
    return null;
  }
}

// Función para obtener información completa de una tienda
export async function getStoreByHandle(handle: string): Promise<SupabaseStore | null> {
  console.log('🔍 Buscando tienda por handle:', handle);
  
  const retryFetch = async (retries = 3): Promise<SupabaseStore | null> => {
    try {
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('handle', handle)
        .maybeSingle();

      if (error) {
        console.error('Error fetching store:', error);
        if (retries > 0) {
          console.log(`⚠️ Reintentando fetch (${retries} intentos restantes)...`);
          return retryFetch(retries - 1);
        }
        return null;
      }
      
      if (data) {
        console.log('✅ Tienda encontrada:', data.name);
        return data;
      } else {
        console.log('ℹ️ Tienda no encontrada:', handle);
        if (handle === 'obrerayzangano') {
          console.log('🛠️ Creando tienda obrerayzangano automáticamente...');
          const defaultStore = {
            handle: 'obrerayzangano',
            name: 'Obrera y Zángano',
            logo_url: 'https://cdn.shopify.com/s/files/1/0123/4567/files/logo.png',
            description: 'Productos artesanales y naturales de calidad premium',
            store_type: 'Especializado' as const,
            rating: 4.9,
            delivery_time: '2-3 días',
            minimum_order: 15000,
            is_active: true,
            specialties: ['Productos Artesanales', 'Miel Natural', 'Origen Local', 'Calidad Premium'],
            shopify_domain: 'obrerayzangano.myshopify.com',
            shopify_storefront_token: process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
          };
          const createdStore = await upsertStoreProfile(defaultStore);
          if (createdStore) {
            console.log('✅ Tienda creada automáticamente:', createdStore.name);
            return createdStore;
          } else {
            console.error('❌ Falló la creación automática de la tienda');
            return null;
          }
        }
        return null;
      }
    } catch (error) {
      console.error('Error in getStoreByHandle:', error);
      if (retries > 0) {
        console.log(`⚠️ Reintentando por error de red (${retries} intentos restantes)...`);
        return retryFetch(retries - 1);
      }
      return null;
    }
  };
  
  return retryFetch();
}

// Función para sincronizar productos de Shopify con Supabase
export async function syncShopifyProducts(storeHandle: string, products: any[]): Promise<boolean> {
  try {
    console.log(`🔄 Sincronizando ${products.length} productos para ${storeHandle}...`);
    // Obtener el store_id
    const store = await getStoreByHandle(storeHandle);
    if (!store) {
      console.error('Store not found:', storeHandle);
      return false;
    }

    // Preparar productos para inserción
    const productsToInsert = products.map(product => ({
      store_id: store.id,
      handle: product.handle || product.shopifyData?.handle || 
        (product.name ? product.name.toLowerCase().replace(/\s+/g, '-') : `product-${Date.now()}`),
      name: product.title || product.name,
      description: product.description,
      price_clp: product.price_clp || product.price || 
        Math.round(parseFloat(product.variants?.[0]?.price || '0') * 900), // USD to CLP
      image_url: product.image_url || product.image || product.images?.[0]?.src || null,
      category: product.category || product.product_type || 'General',
      origin: product.origin || 'Especializado',
      in_stock: product.in_stock ?? product.variants?.[0]?.available ?? true,
      tags: product.tags ? 
        (Array.isArray(product.tags) ? product.tags : product.tags.split(',').map((tag: string) => tag.trim())) : 
        [],
      brand: product.brand || product.vendor || store.name,
      size: product.size || product.variants?.[0]?.title,
      shopify_product_id: product.shopify_product_id || product.id,
      shopify_handle: product.shopify_handle || product.handle
    }));

    // Insertar o actualizar productos
    const { error } = await supabase
      .from('products')
      .upsert(productsToInsert);

    if (error) {
      console.error('Error syncing products:', error);
      return false;
    }
    
    console.log(`✅ Synced ${productsToInsert.length} products for ${store.name}`);
    return true;
  } catch (error) {
    console.error('Error in syncShopifyProducts:', error);
    return false;
  }
}

// Función para obtener productos de una tienda desde Supabase
export async function getStoreProducts(storeHandle: string): Promise<SupabaseProduct[]> {
  try {
    console.log('🔍 Buscando productos para tienda:', storeHandle);
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        stores!inner(handle)
      `)
      .eq('stores.handle', storeHandle)
      .eq('in_stock', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching store products:', error);
      return [];
    }
    
    console.log(`✅ Encontrados ${data?.length || 0} productos`);
    return data || [];
  } catch (error) {
    console.error('Error in getStoreProducts:', error);
    return [];
  }
}

// Función para actualizar el logo de una tienda
export async function updateStoreLogo(storeHandle: string, logoUrl: string): Promise<boolean> {
  try {
    console.log('🔄 Actualizando logo para tienda:', storeHandle);
    const { error } = await supabase
      .from('stores')
      .update({ logo_url: logoUrl })
      .eq('handle', storeHandle);

    if (error) {
      console.error('Error updating store logo:', error);
      return false;
    }
    
    console.log('✅ Logo actualizado correctamente');
    return true;
  } catch (error) {
    console.error('Error in updateStoreLogo:', error);
    return false;
  }
}

// Función para obtener todas las tiendas
export async function getAllStores(): Promise<SupabaseStore[]> {
  try {
    console.log('🔍 Obteniendo todas las tiendas...');
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching stores:', error);
      return [];
    }
    
    console.log(`✅ Encontradas ${data?.length || 0} tiendas`);
    return data || [];
  } catch (error) {
    console.error('Error in getAllStores:', error);
    return [];
  }
}

// Función para obtener todos los productos
export async function getAllProducts(): Promise<SupabaseProduct[]> {
  try {
    console.log('🔍 Obteniendo todos los productos...');
    const { data, error } = await supabase
      .from('products')
      .select('*, stores(name)')
      .order('name');

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    console.log(`✅ Encontrados ${data?.length || 0} productos`);
    return data || [];
  } catch (error) {
    console.error('Error in getAllProducts:', error);
    return [];
  }
}

// Función para obtener categorías de una tienda
export async function getStoreCategories(storeHandle: string): Promise<any[]> {
  try {
    console.log('🔍 Obteniendo categorías para tienda:', storeHandle);
    const store = await getStoreByHandle(storeHandle);
    if (!store) {
      console.error('Store not found:', storeHandle);
      return [];
    }

    const { data, error } = await supabase
      .from('store_categories')
      .select('*')
      .eq('store_id', store.id)
      .order('name');

    if (error) {
      console.error('Error fetching store categories:', error);
      return [];
    }
    
    console.log(`✅ Encontradas ${data?.length || 0} categorías`);
    return data || [];
  } catch (error) {
    console.error('Error in getStoreCategories:', error);
    return [];
  }
}