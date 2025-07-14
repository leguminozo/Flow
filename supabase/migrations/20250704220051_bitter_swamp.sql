/*
  # Migración compatible con esquema existente y vistas

  1. Modificaciones Seguras
    - Agregar columnas nuevas a stores y products
    - Crear tabla store_categories
    - Manejar dependencias de vistas existentes

  2. Seguridad
    - Habilitar RLS en nuevas tablas
    - Crear políticas de acceso

  3. Datos Iniciales
    - Insertar tienda Obrera y Zángano
    - Crear categorías iniciales
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
    -- Si existe price, copiar sus valores a price_clp
    IF EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'products' AND column_name = 'price'
    ) THEN
      ALTER TABLE products ADD COLUMN price_clp integer;
      UPDATE products SET price_clp = COALESCE(price::integer, 0) WHERE price_clp IS NULL;
      ALTER TABLE products ALTER COLUMN price_clp SET NOT NULL;
      ALTER TABLE products ALTER COLUMN price_clp SET DEFAULT 0;
    ELSE
      ALTER TABLE products ADD COLUMN price_clp integer NOT NULL DEFAULT 0;
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

-- Crear índices únicos y de rendimiento de forma segura
DO $$
BEGIN
  -- Índice único para handle en stores si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'stores' AND indexname = 'stores_handle_key'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX stores_handle_key ON stores(handle) WHERE handle IS NOT NULL;
    EXCEPTION
      WHEN duplicate_table THEN
        -- Índice ya existe, continuar
        NULL;
    END;
  END IF;

  -- Índice único para store_id, handle en products si no existe
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'products' AND indexname = 'products_store_id_handle_key'
  ) THEN
    BEGIN
      CREATE UNIQUE INDEX products_store_id_handle_key ON products(store_id, handle) WHERE handle IS NOT NULL;
    EXCEPTION
      WHEN duplicate_table THEN
        -- Índice ya existe, continuar
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
        -- Índice ya existe, continuar
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

-- Habilitar RLS en store_categories si no está habilitado
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE tablename = 'store_categories' AND schemaname = 'public'
  ) THEN
    ALTER TABLE store_categories ENABLE ROW LEVEL SECURITY;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error, continuar
    NULL;
END $$;

-- Políticas para store_categories
DO $$
BEGIN
  -- Eliminar políticas existentes si existen
  DROP POLICY IF EXISTS "Store categories are viewable by everyone" ON store_categories;
  DROP POLICY IF EXISTS "Store categories can be inserted by authenticated users" ON store_categories;
  DROP POLICY IF EXISTS "Store categories can be updated by authenticated users" ON store_categories;

  -- Crear nuevas políticas
  CREATE POLICY "Store categories are viewable by everyone"
    ON store_categories
    FOR SELECT
    TO public
    USING (true);

  CREATE POLICY "Store categories can be inserted by authenticated users"
    ON store_categories
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

  CREATE POLICY "Store categories can be updated by authenticated users"
    ON store_categories
    FOR UPDATE
    TO authenticated
    USING (true);

EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error con las políticas, continuar
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

-- Triggers para actualizar updated_at en store_categories
DO $$
BEGIN
  DROP TRIGGER IF EXISTS update_store_categories_updated_at ON store_categories;
  CREATE TRIGGER update_store_categories_updated_at
    BEFORE UPDATE ON store_categories
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
  WHEN OTHERS THEN
    -- Si hay error con el trigger, continuar
    RAISE NOTICE 'Error creando trigger: %', SQLERRM;
END $$;

-- Actualizar handles para productos existentes si no los tienen
UPDATE products 
SET handle = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ñ', 'n'), 'á', 'a'))
WHERE handle IS NULL AND name IS NOT NULL;

-- Actualizar handles para tiendas existentes si no los tienen
UPDATE stores 
SET handle = LOWER(REPLACE(REPLACE(REPLACE(name, ' ', '-'), 'ñ', 'n'), 'á', 'a'))
WHERE handle IS NULL AND name IS NOT NULL;

-- Insertar datos iniciales para Obrera y Zángano
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
    'Obrera y Zángano',
    'https://images.pexels.com/photos/1002703/pexels-photo-1002703.jpeg?auto=compress&cs=tinysrgb&w=200',
    'Productos artesanales y naturales de calidad premium. Especialistas en miel pura y productos de la colmena.',
    'Especializado',
    4.9,
    '2-3 días',
    15000,
    true,
    ARRAY['Productos Artesanales', 'Miel Natural', 'Origen Local', 'Calidad Premium', 'Sustentable'],
    'obrerayzangano.myshopify.com',
    'd055a743803cd8f6a67038719dd1067f'
  ) ON CONFLICT (handle) DO UPDATE SET
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
    -- Insertar categorías iniciales para Obrera y Zángano
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