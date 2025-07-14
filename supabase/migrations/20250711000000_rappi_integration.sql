-- Migración para integración con Rappi
-- Tablas para manejar órdenes, webhooks y eventos

-- 1. Tabla de Órdenes (para tracking de órdenes Rappi)
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  flow_id UUID REFERENCES flows(id) ON DELETE CASCADE,
  rappi_order_id TEXT UNIQUE NOT NULL, -- ID de la orden en Rappi
  status TEXT DEFAULT 'creada' CHECK (status IN ('creada', 'confirmada', 'preparando', 'lista', 'en_camino', 'entregada', 'cancelada')),
  total_amount DECIMAL(10,2) NOT NULL,
  delivery_address TEXT NOT NULL,
  delivery_estimated_time TEXT,
  items JSONB NOT NULL, -- Array de productos en la orden
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para queries frecuentes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_flow_id ON orders(flow_id);
CREATE INDEX idx_orders_rappi_id ON orders(rappi_order_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- RLS para órdenes
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own orders" ON orders FOR UPDATE USING (auth.uid() = user_id);

-- 2. Tabla de Eventos de Webhook (para tracking de eventos Rappi)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id TEXT NOT NULL, -- ID de la orden en Rappi
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('NEW_ORDER', 'ORDER_READY', 'ORDER_DELIVERED', 'ORDER_CANCELLED')),
  status TEXT NOT NULL,
  payload JSONB NOT NULL, -- Payload completo del webhook
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para webhook events
CREATE INDEX idx_webhook_events_order_id ON webhook_events(order_id);
CREATE INDEX idx_webhook_events_user_id ON webhook_events(user_id);
CREATE INDEX idx_webhook_events_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);

-- RLS para webhook events
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own webhook events" ON webhook_events FOR SELECT USING (auth.uid() = user_id);

-- 3. Tabla de Configuración de Rappi (para credenciales y settings)
CREATE TABLE IF NOT EXISTS rappi_config (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  store_id TEXT UNIQUE NOT NULL,
  client_id TEXT NOT NULL,
  client_secret TEXT NOT NULL, -- Encriptar en producción
  webhook_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS para configuración (solo admin)
ALTER TABLE rappi_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Only admins can manage rappi config" ON rappi_config FOR ALL USING (
  auth.uid() IN (
    SELECT user_id FROM users WHERE subscription_level = 'admin'
  )
);

-- 4. Función para actualizar timestamp automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_rappi_config_updated_at BEFORE UPDATE ON rappi_config
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- 5. Función para calcular tiempo ahorrado por entrega
CREATE OR REPLACE FUNCTION calculate_time_saved()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando una orden se entrega, sumar tiempo ahorrado al usuario
  IF NEW.status = 'entregada' AND OLD.status != 'entregada' THEN
    UPDATE users 
    SET time_saved_minutes = time_saved_minutes + 120 -- 2 horas por entrega
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para calcular tiempo ahorrado
CREATE TRIGGER after_order_status_change
AFTER UPDATE ON orders
FOR EACH ROW EXECUTE PROCEDURE calculate_time_saved();

-- 6. Función para verificar flujos con entregas pendientes
CREATE OR REPLACE FUNCTION check_pending_deliveries()
RETURNS TABLE (
  flow_id UUID,
  user_id UUID,
  flow_name TEXT,
  next_delivery DATE,
  frequency TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    f.id,
    f.user_id,
    f.name,
    f.next_delivery::DATE,
    f.frequency
  FROM flows f
  WHERE f.status = 'activo' 
    AND f.next_delivery::DATE <= CURRENT_DATE
    AND EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id = f.user_id 
      AND u.subscription_level IN ('super', 'premium')
    );
END;
$$ LANGUAGE plpgsql;

-- 7. Vista para dashboard de órdenes
CREATE OR REPLACE VIEW orders_dashboard AS
SELECT 
  o.id,
  o.rappi_order_id,
  o.status,
  o.total_amount,
  o.delivery_address,
  o.created_at,
  f.name as flow_name,
  f.frequency,
  u.email as user_email,
  u.subscription_level
FROM orders o
JOIN flows f ON o.flow_id = f.id
JOIN users u ON o.user_id = u.id
ORDER BY o.created_at DESC;

-- 8. Vista para analytics de tiempo ahorrado
CREATE OR REPLACE VIEW time_saved_analytics AS
SELECT 
  u.id,
  u.email,
  u.subscription_level,
  u.time_saved_minutes,
  COUNT(o.id) as total_orders,
  AVG(o.total_amount) as avg_order_value,
  MAX(o.created_at) as last_order_date
FROM users u
LEFT JOIN orders o ON u.id = o.user_id AND o.status = 'entregada'
GROUP BY u.id, u.email, u.subscription_level, u.time_saved_minutes;

-- 9. Insertar configuración inicial de Rappi (valores de ejemplo)
INSERT INTO rappi_config (store_id, client_id, client_secret, webhook_url) 
VALUES (
  'essential-flow-store',
  'your-rappi-client-id',
  'your-rappi-client-secret',
  'https://your-project.supabase.co/functions/v1/rappi-webhook'
) ON CONFLICT (store_id) DO NOTHING;

-- 10. Comentarios para documentación
COMMENT ON TABLE orders IS 'Tabla para tracking de órdenes de Rappi';
COMMENT ON TABLE webhook_events IS 'Tabla para eventos de webhook de Rappi';
COMMENT ON TABLE rappi_config IS 'Configuración de integración con Rappi';
COMMENT ON FUNCTION check_pending_deliveries() IS 'Función para verificar flujos con entregas pendientes';
COMMENT ON VIEW orders_dashboard IS 'Vista para dashboard de órdenes';
COMMENT ON VIEW time_saved_analytics IS 'Vista para analytics de tiempo ahorrado'; 