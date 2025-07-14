-- 1. Tabla de Usuarios (alineada con auth y perfiles)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  preferred_language TEXT DEFAULT 'es',  -- Para LanguageToggle
  subscription_level TEXT DEFAULT 'basico' CHECK (subscription_level IN ('basico', 'super')),  -- Enum para PaymentPlans
  time_saved_minutes INTEGER DEFAULT 0  -- Para calculateTimeSaved
);

-- RLS para usuarios
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);

-- 2. Tabla de Tiendas (para Shopify integration)
CREATE TABLE IF NOT EXISTS stores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  handle TEXT UNIQUE NOT NULL,  -- Usado en getStoreByHandle
  name TEXT NOT NULL,
  api_key TEXT,  -- Encriptar en producción
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_stores_handle ON stores(handle);

-- 3. Tabla de Productos (alineada con mockProducts y Shopify)
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  origin TEXT,  -- Para filtros en ProductSearchModal
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índice para queries frecuentes
CREATE INDEX idx_products_store ON products(store_id);
CREATE INDEX idx_products_name ON products(name);

-- 4. Tabla de Planes (para PaymentPlans y mockData)
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,  -- e.g., 'Núcleo Básico'
  price DECIMAL(10,2) NOT NULL,
  max_automations INTEGER DEFAULT -1,  -- -1 para ilimitado
  features JSONB,  -- Array de features como en mockData
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabla de Flujos/Automatizaciones (core de la app)
CREATE TABLE IF NOT EXISTS flows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  frequency TEXT CHECK (frequency IN ('mensual', 'quincenal', 'personalizada')),  -- Enum para SubscriptionBuilder
  next_delivery DATE,
  status TEXT DEFAULT 'activo' CHECK (status IN ('activo', 'pausado', 'cancelado')),
  products JSONB,  -- Temporal; mejor usar tabla relacionada
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla many-to-many para flujos y productos
CREATE TABLE IF NOT EXISTS flow_products (
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  PRIMARY KEY (flow_id, product_id)
);

-- RLS para flujos
ALTER TABLE flows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users own flows" ON flows FOR ALL USING (auth.uid() = user_id);

-- 6. Tabla de Direcciones (para AddressManager)
CREATE TABLE IF NOT EXISTS addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  address_text TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabla de Assets de Marca (para BrandAssetsDisplay)
CREATE TABLE IF NOT EXISTS brand_assets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
  logo_url TEXT,
  banner_url TEXT,
  colors JSONB,  -- e.g., {primary: '#D4AF37'}
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Función de Ejemplo para Sync (alineada con fetch-brand-assets)
CREATE OR REPLACE FUNCTION sync_shopify_assets(store_handle TEXT) RETURNS JSON AS $$
BEGIN
  -- Lógica para fetch de Shopify (usa tu Edge Function)
  RETURN (SELECT json_build_object('success', true));
END;
$$ LANGUAGE plpgsql;

-- Trigger de Ejemplo para Time Saved
CREATE OR REPLACE FUNCTION update_time_saved() RETURNS TRIGGER AS $$
BEGIN
  UPDATE users SET time_saved_minutes = time_saved_minutes + 120 WHERE id = NEW.user_id;  -- Asumiendo 120min por flujo
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_flow_insert
AFTER INSERT ON flows
FOR EACH ROW EXECUTE PROCEDURE update_time_saved(); 