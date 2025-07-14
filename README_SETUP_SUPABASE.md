# Configuración de Supabase para EssentialFlow

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto
3. Anota la URL del proyecto y la clave anónima

### 2. Configurar Variables de Entorno

Actualiza tu archivo `.env`:

```env
# Supabase Configuration
EXPO_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 3. Ejecutar Migraciones

Las migraciones se encuentran en `supabase/migrations/`. Puedes ejecutarlas:

1. **Opción A: Dashboard de Supabase**
   - Ve a SQL Editor en tu dashboard
   - Copia y pega el contenido de `001_create_stores_and_products.sql`
   - Ejecuta la consulta

2. **Opción B: CLI de Supabase** (recomendado para desarrollo)
   ```bash
   npx supabase init
   npx supabase link --project-ref tu-project-ref
   npx supabase db push
   ```

## 📊 Estructura de Base de Datos

### Tablas Creadas

1. **`stores`** - Información de tiendas
   - `id` (text, PK)
   - `name` (text)
   - `logo_url` (text)
   - `description` (text)
   - `store_type` (enum)
   - `rating` (decimal)
   - `delivery_time` (text)
   - `minimum_order` (integer)
   - `is_open` (boolean)
   - `specialties` (text[])
   - `shopify_domain` (text)
   - `shopify_storefront_token` (text)

2. **`products`** - Productos de las tiendas
   - `id` (text, PK)
   - `store_id` (text, FK)
   - `name` (text)
   - `description` (text)
   - `price_clp` (integer)
   - `image_url` (text)
   - `category` (text)
   - `origin` (text)
   - `in_stock` (boolean)
   - `tags` (text[])
   - `brand` (text)
   - `size` (text)
   - `shopify_product_id` (text)
   - `shopify_handle` (text)

3. **`store_categories`** - Categorías por tienda
   - `id` (text, PK)
   - `store_id` (text, FK)
   - `name` (text)
   - `icon` (text)
   - `product_count` (integer)
   - `description` (text)
   - `handle` (text)

## 🔐 Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:

- **Lectura**: Pública para todos
- **Escritura**: Solo usuarios autenticados
- **Actualización**: Solo usuarios autenticados

## 🔄 Sincronización Automática

La app sincroniza automáticamente:

1. **Datos de Shopify → Supabase**
   - Productos actualizados en tiempo real
   - Información de tienda
   - Categorías y colecciones

2. **Logo desde Supabase**
   - El logo de la tienda se obtiene desde `stores.logo_url`
   - Fallback a imagen por defecto si no está disponible

## 🏪 Configuración Inicial de Tienda

**IMPORTANTE**: Antes de usar la aplicación, debes crear manualmente el registro de la tienda en Supabase para evitar errores de RLS.

Ejecuta este SQL en el SQL Editor de Supabase:

```sql
-- Insertar tienda obrera-zangano
INSERT INTO stores (
  id, 
  name, 
  logo_url, 
  description, 
  store_type, 
  rating, 
  delivery_time, 
  minimum_order, 
  is_active, 
  specialties, 
  handle,
  shopify_domain,
  shopify_storefront_token
) VALUES (
  1,
  'La Obrera y el Zángano',
  'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=400',
  'Productos apícolas artesanales y naturales de calidad premium',
  'Especializado',
  4.9,
  '2-3 días',
  15000,
  true,
  ARRAY['Miel Artesanal', 'Productos Apícolas', 'Origen Local', 'Calidad Premium'],
  'obrera-zangano',
  'obrera-zangano.myshopify.com',
  'tu-storefront-access-token'
) ON CONFLICT (handle) DO UPDATE SET
  name = EXCLUDED.name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  updated_at = now();
```

Este comando:
- Crea el registro de la tienda si no existe
- Actualiza los datos si ya existe
- Evita errores de RLS al intentar escribir desde el frontend

## 🛠️ Funciones Disponibles

### Tiendas
```typescript
// Obtener perfil de tienda
const store = await getStoreProfile('obrera-zangano');

// Obtener todas las tiendas
const stores = await getAllStoreProfiles();

// Actualizar/crear tienda
await upsertStoreProfile(storeData);
```

### Productos
```typescript
// Obtener productos de una tienda
const products = await getProductProfiles('obrera-zangano');

// Obtener todos los productos
const allProducts = await getProductProfiles();

// Actualizar/crear producto
await upsertProductProfile(productData);
```

### Sincronización
```typescript
// Sincronizar datos de Shopify
await syncShopifyStoreToSupabase(storeData, products);
```

## 📈 Monitoreo

### Logs de Sincronización
```javascript
console.log('✅ Shopify data synced to Supabase successfully');
console.log('❌ Error syncing Shopify data to Supabase:', error);
```

### Verificar Datos
Puedes verificar que los datos se sincronizaron correctamente:

1. Ve al dashboard de Supabase
2. Navega a "Table Editor"
3. Revisa las tablas `stores`, `products`, y `store_categories`

## 🔧 Troubleshooting

### Problemas Comunes

1. **Error de conexión**
   - Verifica las variables de entorno
   - Asegúrate de que la URL y clave sean correctas

2. **RLS bloqueando escritura**
   - Verifica que el usuario esté autenticado
   - Revisa las políticas de seguridad

3. **Migraciones no aplicadas**
   - Ejecuta manualmente desde SQL Editor
   - Verifica que las tablas existan

### Comandos Útiles

```sql
-- Verificar tablas creadas
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Ver datos de tiendas
SELECT * FROM stores;

-- Ver productos sincronizados
SELECT name, price_clp, in_stock FROM products 
WHERE store_id = 'obrera-zangano';

-- Limpiar datos (si necesario)
TRUNCATE products, store_categories, stores CASCADE;
```

## 🎯 Próximos Pasos

1. **Autenticación**: Implementar login de usuarios
2. **Webhooks**: Sincronización en tiempo real desde Shopify
3. **Analytics**: Tracking de productos más vistos
4. **Cache**: Optimizar consultas con cache inteligente
5. **Backup**: Respaldos automáticos de datos críticos

---

¡Tu base de datos está lista! La app ahora puede obtener el logo y datos de la tienda desde Supabase, manteniendo sincronización con Shopify.