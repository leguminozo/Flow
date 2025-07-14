# Integración con Shopify - EssentialFlow

Esta documentación explica cómo configurar y usar la integración con Shopify en la aplicación EssentialFlow.

## 🛒 Configuración de Shopify

### 1. Obtener el Storefront Access Token

Para conectar tu app con Shopify, necesitas crear un Storefront Access Token:

1. Ve a tu panel de administración de Shopify: `https://obrerayzangano.myshopify.com/admin`
2. Navega a **Apps** → **Manage private apps** (o **Apps and sales channels**)
3. Crea una nueva app privada o usa una existente
4. En la sección **Storefront API**, habilita el acceso
5. Copia el **Storefront access token**

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
EXPO_PUBLIC_SHOPIFY_DOMAIN=obrerayzangano.myshopify.com
EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=tu_token_aqui
```

### 3. Permisos Necesarios

Asegúrate de que tu Storefront API tenga estos permisos habilitados:

- `unauthenticated_read_products`
- `unauthenticated_read_collections`
- `unauthenticated_read_product_listings`
- `unauthenticated_read_checkouts` (para futuras compras)

## 🏗️ Arquitectura de la Integración

### Servicios Principales

1. **`services/shopifyService.ts`**: Cliente GraphQL para la API de Shopify
2. **`data/shopifyData.ts`**: Cache y transformación de datos
3. **`types/shopify.ts`**: Tipos TypeScript para datos de Shopify
4. **`app/api/shopify+api.ts`**: API endpoints para el frontend

### Flujo de Datos

```
Shopify Store → GraphQL API → ShopifyService → Cache → App Components
```

## 🔧 Funcionalidades Implementadas

### ✅ Productos
- Obtener todos los productos
- Buscar productos por texto
- Filtrar por colecciones
- Obtener producto individual por handle
- Cache automático (5 minutos)

### ✅ Colecciones
- Listar todas las colecciones
- Obtener productos por colección
- Mapeo automático a categorías de la app

### ✅ Integración con la App
- Tienda "Obrera y Zángano" aparece en el catálogo
- Productos de Shopify se muestran junto a productos mock
- Constructor de automatizaciones funciona con productos reales
- Búsqueda unificada (productos locales + Shopify)

## 🎨 Componentes UI

### `ShopifyProductCard`
Tarjeta especializada para productos de Shopify con:
- Badge de Shopify
- Precios con descuentos
- Información de stock en tiempo real
- Metadatos de producto (SKU, handle, etc.)

### `ShopifyStoreCard`
Tarjeta para la tienda de Shopify con:
- Indicador "En vivo"
- Badge de Shopify
- Información de sincronización

## 📊 Monitoreo y Debug

### Logs
La integración incluye logs detallados:
```javascript
console.log('🛒 Fetching products from Shopify...');
console.log('✅ Loaded 25 products from Shopify');
console.log('❌ Error fetching Shopify products:', error);
```

### Modo Debug
En desarrollo (`__DEV__`), los componentes muestran información adicional:
- SKU del producto
- Handle de Shopify
- ID de variante

## 🔄 Cache y Performance

### Sistema de Cache
- **Duración**: 5 minutos
- **Invalidación**: Automática o manual
- **Fallback**: Productos mock si falla la conexión

### Optimizaciones
- Requests paralelos para productos y colecciones
- Transformación de datos optimizada
- Manejo de errores robusto

## 🛠️ API Endpoints

### GET `/api/shopify`

Parámetros disponibles:

- `action=products` - Obtener todos los productos
- `action=search&query=miel` - Buscar productos
- `action=collections` - Obtener colecciones
- `action=collection-products&collection=mieles` - Productos por colección
- `action=product&handle=miel-ulmo` - Producto específico

### POST `/api/shopify`

Para crear checkouts (futuras compras):
```json
{
  "action": "create-checkout",
  "lineItems": [
    {
      "variantId": "gid://shopify/ProductVariant/123",
      "quantity": 2
    }
  ]
}
```

## 🚀 Próximos Pasos

### Funcionalidades Pendientes
1. **Compras Reales**: Integrar checkout de Shopify
2. **Webhooks**: Actualizaciones en tiempo real
3. **Inventario**: Sincronización de stock
4. **Precios Dinámicos**: Actualizaciones automáticas
5. **Cupones**: Sistema de descuentos

### Mejoras Técnicas
1. **GraphQL Subscriptions**: Para actualizaciones en tiempo real
2. **Offline Support**: Cache persistente
3. **Analytics**: Tracking de productos más vistos
4. **A/B Testing**: Diferentes layouts de productos

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de CORS**
   - Verifica que el dominio esté configurado en Shopify
   - Usa el Storefront API, no el Admin API

2. **Token Inválido**
   - Regenera el Storefront Access Token
   - Verifica que esté en las variables de entorno

3. **Productos No Aparecen**
   - Verifica que los productos estén publicados
   - Revisa los permisos del Storefront API

4. **Cache Desactualizado**
   - Usa `invalidateShopifyCache()` para limpiar
   - Reduce `CACHE_DURATION` en desarrollo

### Comandos Útiles

```javascript
// Limpiar cache
import { invalidateShopifyCache } from '@/data/shopifyData';
invalidateShopifyCache();

// Ver estadísticas
import { getShopifyStoreStats } from '@/data/shopifyData';
const stats = await getShopifyStoreStats();
console.log(stats);
```

## 📈 Métricas y Analytics

La integración rastrea:
- Número de productos cargados
- Tiempo de respuesta de API
- Errores de conexión
- Productos más buscados
- Conversión a automatizaciones

## 🔐 Seguridad

- Tokens almacenados en variables de entorno
- Solo lectura (no escritura) en Shopify
- Validación de datos de entrada
- Manejo seguro de errores

---

¡La integración está lista para usar! Tu tienda real de Shopify ahora está conectada con EssentialFlow y los usuarios pueden crear automatizaciones con productos reales.