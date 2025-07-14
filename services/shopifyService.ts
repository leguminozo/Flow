import { ShopifyProduct, ShopifyCollection, AppProduct, AppCollection } from '@/types/shopify';
import { CurrencyService } from './currencyService';

const SHOPIFY_DOMAIN = process.env.EXPO_PUBLIC_SHOPIFY_DOMAIN || 'obrerayzangano.myshopify.com';
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN || 'd055a743803cd8f6a67038719dd1067f';

class ShopifyService {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor() {
    this.baseUrl = `https://${SHOPIFY_DOMAIN}/api/2023-10/graphql.json`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      'Accept': 'application/json',
    };
  }

  // GraphQL query para obtener productos
  private getProductsQuery = `
    query getProducts($first: Int!, $after: String) {
      products(first: $first, after: $after) {
        edges {
          node {
            id
            title
            description
            handle
            productType
            vendor
            tags
            createdAt
            updatedAt
            availableForSale
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
              maxVariantPrice {
                amount
                currencyCode
              }
            }
            compareAtPriceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 5) {
              edges {
                node {
                  id
                  url
                  altText
                  width
                  height
                }
              }
            }
            variants(first: 10) {
              edges {
                node {
                  id
                  title
                  price {
                    amount
                    currencyCode
                  }
                  compareAtPrice {
                    amount
                    currencyCode
                  }
                  availableForSale
                  quantityAvailable
                  sku
                  weight
                  weightUnit
                  selectedOptions {
                    name
                    value
                  }
                }
              }
            }
          }
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  // GraphQL query para obtener colecciones
  private getCollectionsQuery = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            description
            handle
            updatedAt
            image {
              id
              url
              altText
              width
              height
            }
            products(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  // Método para hacer peticiones GraphQL
  private async graphqlRequest(query: string, variables: any = {}) {
    try {
      console.log(`🔄 Realizando petición GraphQL a ${this.baseUrl}`);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          query,
          variables,
        }),
      });

      if (!response.ok) {
        console.error(`❌ Error HTTP: ${response.status} - ${response.statusText}`);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.errors) {
        console.error('❌ Errores GraphQL:', data.errors);
        throw new Error(`GraphQL error: ${JSON.stringify(data.errors)}`);
      }

      console.log('✅ Petición GraphQL exitosa');
      return data.data;
    } catch (error) {
      console.error('❌ Error en petición GraphQL:', error);
      
      // Si es un error de red, retornar datos mock para desarrollo
      if (error instanceof Error && (error.message.includes('Network request failed') || error.message.includes('fetch'))) {
        console.log('🔄 Usando datos mock debido a error de red');
        return this.getMockData(query);
      }
      
      throw error;
    }
  }

  // Método para obtener datos mock cuando hay problemas de red
  private getMockData(query: string) {
    if (query.includes('getProducts')) {
      return {
        products: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Product/1',
                title: 'Café Premium',
                description: 'Café de especialidad tostado artesanalmente',
                handle: 'cafe-premium',
                productType: 'Bebidas',
                vendor: 'Obrera y Zángano',
                tags: ['Premium', 'Artesanal'],
                availableForSale: true,
                priceRange: {
                  minVariantPrice: { amount: '9990', currencyCode: 'CLP' },
                  maxVariantPrice: { amount: '9990', currencyCode: 'CLP' }
                },
                images: {
                  edges: [{
                    node: {
                      id: 'gid://shopify/ProductImage/1',
                      url: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800',
                      altText: 'Café Premium',
                      width: 800,
                      height: 600
                    }
                  }]
                },
                variants: {
                  edges: [{
                    node: {
                      id: 'gid://shopify/ProductVariant/1',
                      title: '250g',
                      price: { amount: '9990', currencyCode: 'CLP' },
                      availableForSale: true,
                      quantityAvailable: 50,
                      sku: 'CAFE-001',
                      weight: 250,
                      weightUnit: 'GRAMS'
                    }
                  }]
                }
              }
            }
          ],
          pageInfo: { hasNextPage: false, endCursor: null }
        }
      };
    }
    
    if (query.includes('getCollections')) {
      return {
        collections: {
          edges: [
            {
              node: {
                id: 'gid://shopify/Collection/1',
                title: 'Café de Especialidad',
                description: 'Los mejores cafés artesanales',
                handle: 'cafe-especialidad',
                image: {
                  id: 'gid://shopify/CollectionImage/1',
                  url: 'https://images.pexels.com/photos/324028/pexels-photo-324028.jpeg?auto=compress&cs=tinysrgb&w=800',
                  altText: 'Café de Especialidad',
                  width: 800,
                  height: 600
                },
                products: { edges: [{ node: { id: 'gid://shopify/Product/1' } }] }
              }
            }
          ]
        }
      };
    }
    
    return null;
  }

  // Obtener todos los productos
  async getProducts(limit: number = 50): Promise<AppProduct[]> {
    try {
      console.log(`🛒 Obteniendo ${limit} productos de Shopify (${SHOPIFY_DOMAIN})...`);
      const result = await this.graphqlRequest(this.getProductsQuery, {
        first: limit,
      });

      if (!result || !result.products || !result.products.edges) {
        console.error('❌ Respuesta de Shopify inválida:', result);
        return [];
      }

      const products = result.products.edges.map((edge: any) => this.transformProduct(edge.node));
      console.log(`✅ Obtenidos ${products.length} productos de Shopify`);
      return products;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Obtener productos por colección
  async getProductsByCollection(collectionHandle: string, limit: number = 50): Promise<AppProduct[]> {
    const query = `
      query getProductsByCollection($handle: String!, $first: Int) {
        collectionByHandle(handle: $handle) {
          products(first: $first) {
            edges {
              node {
                id
                title
                description
                handle
                productType
                vendor
                tags
                availableForSale
                priceRange {
                  minVariantPrice {
                    amount
                    currencyCode
                  }
                }
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      sku
                      weight
                      weightUnit
                      availableForSale
                      quantityAvailable
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      console.log(`🛒 Obteniendo productos de colección ${collectionHandle}...`);
      const data = await this.graphqlRequest(query, {
        handle: collectionHandle,
        first: limit,
      });

      if (!data.collectionByHandle) {
        return [];
      }

      const products = data.collectionByHandle.products.edges.map((edge: any) => 
        this.transformProduct(edge.node)
      );
      
      return products;
    } catch (error) {
      console.error('Error fetching products by collection:', error);
      return [];
    }
  }

  // Obtener colecciones
  async getCollections(): Promise<AppCollection[]> {
    try {
      console.log('📂 Obteniendo colecciones de Shopify...');
      const data = await this.graphqlRequest(this.getCollectionsQuery, {
        first: 50,
      });

      console.log(`✅ Obtenidas ${data.collections.edges.length} colecciones de Shopify`);
      return data.collections.edges.map((edge: any) => this.transformCollection(edge.node));
    } catch (error) {
      console.error('Error fetching collections:', error);
      return [];
    }
  }

  // Buscar productos
  async searchProducts(query: string, limit: number = 20): Promise<AppProduct[]> {
    const searchQuery = `
      query searchProducts($query: String!, $first: Int) {
        products(first: $first, query: $query) {
          edges {
            node {
              id
              title
              description
              handle
              productType
              vendor
              tags
              availableForSale
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 1) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    id
                    sku
                    weight
                    weightUnit
                    availableForSale
                    quantityAvailable
                  }
                }
              }
            }
          }
        }
      }
    `;

    try {
      console.log(`🔍 Buscando productos con query: "${query}"...`);
      const data = await this.graphqlRequest(searchQuery, {
        query,
        first: limit,
      });

      const products = data.products.edges.map((edge: any) => this.transformProduct(edge.node));
      console.log(`✅ Encontrados ${products.length} productos para la búsqueda "${query}"`);
      return products;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  }

  // Obtener producto por handle
  async getProductByHandle(handle: string): Promise<AppProduct | null> {
    const query = `
      query getProductByHandle($handle: String) {
        productByHandle(handle: $handle) {
          id
          title
          description
          handle
          productType
          vendor
          tags
          availableForSale
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
            maxVariantPrice {
              amount
              currencyCode
            }
          }
          compareAtPriceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          images(first: 5) {
            edges {
              node {
                url
                altText
              }
            }
          }
          variants(first: 10) {
            edges {
              node {
                id
                title
                price {
                  amount
                  currencyCode
                }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                sku
                weight
                weightUnit
                selectedOptions {
                  name
                  value
                }
              }
            }
          }
        }
      }
    `;

    try {
      console.log(`🔍 Buscando producto con handle: "${handle}"...`);
      const data = await this.graphqlRequest(query, { handle });
      
      if (!data.productByHandle) {
        console.log(`❌ No se encontró producto con handle: "${handle}"`);
        return null;
      }

      const product = this.transformProduct(data.productByHandle);
      console.log(`✅ Producto encontrado: "${product.name}"`);
      return product;
    } catch (error) {
      console.error('Error fetching product by handle:', error);
      return null;
    }
  }

  // Transformar producto de Shopify a formato de la app
  private transformProduct(shopifyProduct: any): AppProduct {
    const firstVariant = shopifyProduct.variants.edges[0]?.node;
    const firstImage = shopifyProduct.images.edges[0]?.node;
    
    // Convertir precio a pesos chilenos
    const priceInCLP = CurrencyService.normalizeToChileanPrice(
      shopifyProduct.priceRange.minVariantPrice.amount
    );
    
    // Precio de comparación si existe
    const compareAtPrice = shopifyProduct.compareAtPriceRange?.minVariantPrice?.amount
      ? CurrencyService.normalizeToChileanPrice(shopifyProduct.compareAtPriceRange.minVariantPrice.amount)
      : undefined;
    
    // Determinar categoría basada en productType o tags
    const category = this.mapToCategory(shopifyProduct.productType, shopifyProduct.tags);
    
    return {
      id: shopifyProduct.id,
      name: shopifyProduct.title,
      description: shopifyProduct.description || '',
      price: priceInCLP,
      image: firstImage?.url || 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800',
      category,
      origin: 'Shopify',
      store: 'Obrera y Zángano',
      inStock: shopifyProduct.availableForSale && (firstVariant?.quantityAvailable > 0),
      tags: shopifyProduct.tags || [],
      brand: shopifyProduct.vendor,
      size: firstVariant?.title !== 'Default Title' ? firstVariant?.title : undefined,
      shopifyData: {
        handle: shopifyProduct.handle,
        variantId: firstVariant?.id || '',
        productType: shopifyProduct.productType,
        vendor: shopifyProduct.vendor,
        sku: firstVariant?.sku || '',
        weight: firstVariant?.weight || 0,
        compareAtPrice: compareAtPrice,
      },
    };
  }

  // Transformar colección de Shopify a formato de la app
  private transformCollection(shopifyCollection: any): AppCollection {
    return {
      // Datos básicos de la colección
      id: shopifyCollection.id,
      name: shopifyCollection.title,
      description: shopifyCollection.description || '',
      image: shopifyCollection.image?.url,
      productCount: shopifyCollection.products.edges.length,
      handle: shopifyCollection.handle,
    };
  }

  // Mapear tipo de producto a categorías de la app
  private mapToCategory(productType: string, tags: string[]): string {
    const type = productType?.toLowerCase() || '';
    const tagList = Array.isArray(tags) ? tags.map(tag => tag.toLowerCase()) : [];
    
    // Mapeo basado en el tipo de producto
    if (type.includes('miel') || type.includes('honey') || tagList.includes('miel')) {
      return 'Alimentos';
    }
    if (type.includes('café') || type.includes('coffee') || tagList.includes('café')) {
      return 'Bebidas';
    }
    if (type.includes('jabón') || type.includes('soap') || type.includes('limpieza')) {
      return 'Limpieza';
    }
    if (type.includes('cuidado') || type.includes('cosmetic') || type.includes('belleza')) {
      return 'Cuidado Personal';
    }
    if (type.includes('papel') || type.includes('paper')) {
      return 'Papel';
    }
    
    // Categoría por defecto
    return 'Otros';
  }

  // Crear checkout (para futuras integraciones de compra)
  async createCheckout(lineItems: Array<{ variantId: string; quantity: number }>) {
    const mutation = `
      mutation checkoutCreate($input: CheckoutCreateInput) {
        checkoutCreate(input: $input) {
          checkout {
            id
            webUrl
            totalPriceV2 {
              amount
              currencyCode
            }
            lineItems(first: 5) {
              edges {
                node {
                  title
                  quantity
                }
              }
            }
          }
          checkoutUserErrors {
            field
            message
          }
        }
      }
    `;

    try {
      console.log('🛒 Creando checkout en Shopify...');
      const data = await this.graphqlRequest(mutation, {
        input: {
          lineItems: lineItems.map(item => ({
            variantId: item.variantId,
            quantity: item.quantity,
          })),
        },
      });

      if (data.checkoutCreate.checkoutUserErrors.length > 0) {
        console.error('❌ Errores al crear checkout:', data.checkoutCreate.checkoutUserErrors);
        throw new Error(`Checkout errors: ${JSON.stringify(data.checkoutCreate.checkoutUserErrors)}`);
      }

      console.log('✅ Checkout creado exitosamente');
      return data.checkoutCreate.checkout; 
    } catch (error) {
      console.error('Error creating checkout:', error);
      throw error;
    }
  }
}

export const shopifyService = new ShopifyService();