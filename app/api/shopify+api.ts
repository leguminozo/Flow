import { shopifyService } from '@/services/shopifyService';

// API endpoint para obtener productos de Shopify
export async function GET(request: Request) {
  const url = new URL(request.url);
  const action = url.searchParams.get('action');
  const query = url.searchParams.get('query');
  const collection = url.searchParams.get('collection');
  const handle = url.searchParams.get('handle');
  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
    switch (action) {
      case 'products':
        const products = await shopifyService.getProducts(limit);
        return Response.json({ 
          success: true, 
          data: products,
          count: products.length 
        });

      case 'search':
        if (!query) {
          return Response.json({ 
            success: false, 
            error: 'Query parameter is required for search' 
          }, { status: 400 });
        }
        const searchResults = await shopifyService.searchProducts(query, limit);
        return Response.json({ 
          success: true, 
          data: searchResults,
          count: searchResults.length,
          query 
        });

      case 'collections':
        const collections = await shopifyService.getCollections();
        return Response.json({ 
          success: true, 
          data: collections,
          count: collections.length 
        });

      case 'collection-products':
        if (!collection) {
          return Response.json({ 
            success: false, 
            error: 'Collection parameter is required' 
          }, { status: 400 });
        }
        const collectionProducts = await shopifyService.getProductsByCollection(collection, limit);
        return Response.json({ 
          success: true, 
          data: collectionProducts,
          count: collectionProducts.length,
          collection 
        });

      case 'product':
        if (!handle) {
          return Response.json({ 
            success: false, 
            error: 'Handle parameter is required' 
          }, { status: 400 });
        }
        const product = await shopifyService.getProductByHandle(handle);
        if (!product) {
          return Response.json({ 
            success: false, 
            error: 'Product not found' 
          }, { status: 404 });
        }
        return Response.json({ 
          success: true, 
          data: product 
        });

      default:
        return Response.json({ 
          success: false, 
          error: 'Invalid action. Available actions: products, search, collections, collection-products, product' 
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Shopify API error:', error);
    return Response.json({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// API endpoint para crear checkout (para futuras compras)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, lineItems } = body;

    if (action === 'create-checkout') {
      if (!lineItems || !Array.isArray(lineItems)) {
        return Response.json({ 
          success: false, 
          error: 'lineItems array is required' 
        }, { status: 400 });
      }

      const checkout = await shopifyService.createCheckout(lineItems);
      return Response.json({ 
        success: true, 
        data: checkout 
      });
    }

    return Response.json({ 
      success: false, 
      error: 'Invalid action' 
    }, { status: 400 });
  } catch (error) {
    console.error('Shopify checkout error:', error);
    return Response.json({ 
      success: false, 
      error: 'Failed to create checkout',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}