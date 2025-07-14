/*
  # Integración de La Obrera y el Zángano con Supabase

  1. Mejoras en Tablas Existentes
    - Actualización de la tabla `stores` para soportar integración con Shopify
    - Mejora de la tabla `products` para precios en CLP y metadatos de Shopify
    - Creación de `store_categories` para organización de productos

  2. Seguridad
    - Políticas RLS para acceso seguro a los datos
    - Índices para optimizar consultas

  3. Datos Iniciales
    - Configuración de la tienda "La Obrera y el Zángano"
    - Categorías de productos apícolas
*/

-- Agregar columnas necesarias a la tabla stores existente
DO $$
BEGIN
  -- Agregar handle si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'handle'
  ) THEN
    ALTER TABLE stores ADD COLUMN handle text;
    -- Crear índice único para handle
    CREATE UNIQUE INDEX stores_handle_key ON stores(handle) WHERE handle IS NOT NULL;
  END IF;

  -- Agregar delivery_time si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'delivery_time'
  ) THEN
    ALTER TABLE stores ADD COLUMN delivery_time text DEFAULT '30-45 min';
  END IF;

  -- Agregar minimum_order si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'minimum_order'
  ) THEN
    ALTER TABLE stores ADD COLUMN minimum_order integer DEFAULT 10000;
  END IF;

  -- Agregar specialties si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'specialties'
  ) THEN
    ALTER TABLE stores ADD COLUMN specialties text[] DEFAULT '{}';
  END IF;

  -- Agregar shopify_domain si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'shopify_domain'
  ) THEN
    ALTER TABLE stores ADD COLUMN shopify_domain text;
  END IF;

  -- Agregar shopify_storefront_token si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'shopify_storefront_token'
  ) THEN
    ALTER TABLE stores ADD COLUMN shopify_storefront_token text;
  END IF;

  -- Agregar updated_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE stores ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Agregar columnas necesarias a la tabla products existente
DO $$
BEGIN
  -- Agregar handle si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'handle'
  ) THEN
    ALTER TABLE products ADD COLUMN handle text;
  END IF;

  -- Agregar price_clp si no existe (sin modificar price existente)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'price_clp'
  ) THEN
    ALTER TABLE products ADD COLUMN price_clp integer DEFAULT 0;
    
    -- Actualizar price_clp con valores de price si existe
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'price'
    ) THEN
      UPDATE products SET price_clp = CAST(ROUND(price) AS integer) WHERE price_clp = 0;
    END IF;
  END IF;

  -- Agregar shopify_product_id si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'shopify_product_id'
  ) THEN
    ALTER TABLE products ADD COLUMN shopify_product_id text;
  END IF;

  -- Agregar shopify_handle si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'shopify_handle'
  ) THEN
    ALTER TABLE products ADD COLUMN shopify_handle text;
  END IF;

  -- Agregar updated_at si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE products ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Crear tabla de categorías de tienda si no existe
CREATE TABLE IF NOT EXISTS store_categories (
  id bigserial PRIMARY KEY,
  store_id bigint REFERENCES stores(id) ON DELETE CASCADE,
  handle text NOT NULL,
  name text NOT NULL,
  icon text DEFAULT '📦',
  product_count integer DEFAULT 0,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Crear índices únicos y de rendimiento
DO $$
BEGIN
  -- Índice único para store_id, handle en products si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'products' AND indexname = 'products_store_id_handle_key'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX products_store_id_handle_key ON products(store_id, handle) WHERE handle IS NOT NULL;
    EXCEPTION
      WHEN duplicate_table THEN
        NULL;
    END;
  END IF;

  -- Índice único para store_id, handle en store_categories si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'store_categories' AND indexname = 'store_categories_store_id_handle_key'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX store_categories_store_id_handle_key ON store_categories(store_id, handle);
    EXCEPTION
      WHEN duplicate_table THEN
        NULL;
    END;
  END IF;
END $$;

-- Crear índices adicionales para rendimiento
CREATE INDEX IF NOT EXISTS idx_stores_handle ON stores(handle);
CREATE INDEX IF NOT EXISTS idx_products_store_id ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_handle ON products(handle);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_shopify_handle ON products(shopify_handle);
CREATE INDEX IF NOT EXISTS idx_store_categories_store_id ON store_categories(store_id);
CREATE INDEX IF NOT EXISTS idx_store_categories_handle ON store_categories(handle);

-- Habilitar RLS en store_categories
ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;

-- Políticas para store_categories
DO $$
BEGIN
  DROP POLICY IF EXISTS "Store categories are viewable by everyone" ON store_categories;
  CREATE POLICY "Store categories are viewable by everyone"
    ON store_categories
    FOR SELECT
    TO public
    USING (true);

  DROP POLICY IF EXISTS "Store categories can be inserted by authenticated users" ON store_categories;
  CREATE POLICY "Store categories can be inserted by authenticated users"
    ON store_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  DROP POLICY IF EXISTS "Store categories can be updated by authenticated users" ON store_categories;
  CREATE POLICY "Store categories can be updated by authenticated users"
    ON store_categories
    FOR UPDATE
    TO authenticated
    USING (true);
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creando políticas: %', SQLERRM;
END $$;

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
DO $$
BEGIN
  -- Para stores
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'stores' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_stores_updated_at ON stores;
    CREATE TRIGGER update_stores_updated_at
      BEFORE UPDATE ON stores
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Para products
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'products' AND column_name = 'updated_at'
  ) THEN
    DROP TRIGGER IF EXISTS update_products_updated_at ON products;
    CREATE TRIGGER update_products_updated_at
      BEFORE UPDATE ON products
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;

  -- Para store_categories
  DROP TRIGGER IF EXISTS update_store_categories_updated_at ON store_categories;
  CREATE TRIGGER update_store_categories_updated_at
    BEFORE UPDATE ON store_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creando triggers: %', SQLERRM;
END $$;

-- Actualizar handles para productos existentes si no los tienen
UPDATE products 
SET handle = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ñ', 'n'), 'á', 'a'))
WHERE handle IS NULL AND name IS NOT NULL;

-- Actualizar handles para tiendas existentes si no los tienen
UPDATE stores 
SET handle = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ñ', 'n'), 'á', 'a'))
WHERE handle IS NULL AND name IS NOT NULL;

-- Insertar datos iniciales para La Obrera y el Zángano
DO $$
DECLARE
  store_id_var bigint;
BEGIN
  -- Insertar o actualizar la tienda
  INSERT INTO stores (
    handle,
    name,
    logo_url,
    description,
    store_type,
    rating,
    delivery_time,
    minimum_order,
    is_active,
    specialties,
    shopify_domain,
    shopify_storefront_token
  ) VALUES (
    'obrera-zangano',
    'La Obrera y el Zángano',
    'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=200',
    'Productos apícolas artesanales y naturales de calidad premium. Especialistas en miel pura y productos de la colmena.',
    'Especializado',
    4.9,
    '2-3 días',
    15000,
    true,
    ARRAY['Miel Artesanal', 'Productos Apícolas', 'Origen Local', 'Calidad Premium', 'Sustentable'],
    'obrerayzangano.myshopify.com',
    'd055a743803cd8f6a67038719dd1067f'
  ) 
  ON CONFLICT (handle) 
  DO UPDATE SET
    name = EXCLUDED.name,
    logo_url = EXCLUDED.logo_url,
    description = EXCLUDED.description,
    store_type = EXCLUDED.store_type,
    rating = EXCLUDED.rating,
    delivery_time = EXCLUDED.delivery_time,
    minimum_order = EXCLUDED.minimum_order,
    is_active = EXCLUDED.is_active,
    specialties = EXCLUDED.specialties,
    shopify_domain = EXCLUDED.shopify_domain,
    shopify_storefront_token = EXCLUDED.shopify_storefront_token
  RETURNING id INTO store_id_var;

  -- Si no se insertó (conflicto), obtener el ID existente
  IF store_id_var IS NULL THEN
    SELECT id INTO store_id_var FROM stores WHERE handle = 'obrera-zangano';
  END IF;

  -- Solo insertar categorías si tenemos un store_id válido
  IF store_id_var IS NOT NULL THEN
    -- Insertar categorías iniciales para La Obrera y el Zángano
    INSERT INTO store_categories (
      store_id,
      handle,
      name,
      icon,
      description
    ) VALUES 
      (
        store_id_var,
        'miel-artesanal',
        'Miel Artesanal',
        '🍯',
        'Miel pura y natural de diferentes flores'
      ),
      (
        store_id_var,
        'productos-colmena',
        'Productos de la Colmena',
        '🐝',
        'Propóleo, polen, cera y otros productos naturales'
      ),
      (
        store_id_var,
        'infusiones',
        'Infusiones',
        '🌿',
        'Tés e infusiones naturales con miel'
      ),
      (
        store_id_var,
        'cosmetica-natural',
        'Cosmética Natural',
        '✨',
        'Productos de belleza y cuidado personal con miel'
      ),
      (
        store_id_var,
        'todos',
        'Todos los Productos',
        '🛒',
        'Catálogo completo de La Obrera y el Zángano'
      )
    ON CONFLICT (store_id, handle) DO UPDATE SET
      name = EXCLUDED.name,
      icon = EXCLUDED.icon,
      description = EXCLUDED.description,
      updated_at = now();
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    -- Si hay algún error, continuar sin fallar
    RAISE NOTICE 'Error insertando datos iniciales: %', SQLERRM;
END $$;

-- Función para actualizar logo de tienda desde brand_assets
CREATE OR REPLACE FUNCTION update_store_logo_from_brand()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar logo_url en stores si existe un registro con el mismo dominio
  UPDATE stores
  SET logo_url = NEW.logo_url,
      updated_at = now()
  WHERE shopify_domain = NEW.domain;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente el logo de la tienda
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_store_logo_trigger ON brand_assets;
  CREATE TRIGGER update_store_logo_trigger
    AFTER INSERT OR UPDATE ON brand_assets
    FOR EACH ROW
    EXECUTE FUNCTION update_store_logo_from_brand();
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creando trigger para actualización de logo: %', SQLERRM;
END $$;