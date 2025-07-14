# 🚀 Integración Ética con Rappi - EssentialFlow

## Visión Trascendental

Esta integración implementa un sistema ético y rupturista que utiliza **Supabase Edge Functions** como espada gratuita contra fees injustos, orquestando llamadas seguras a Rappi mientras mantiene el frontend elegante y minimalista con estética old money.

**Rappi aparece como opción de delivery en el constructor de suscripciones**, permitiendo a los usuarios seleccionarlo como servicio de entrega para sus automatizaciones.

## 🏗️ Arquitectura Ética

### Backend (Supabase Edge Functions)
- **Gratuito y serverless**: Sin costos ocultos
- **Distribuido globalmente**: Latencia cero
- **Seguridad ética**: Variables de entorno para secretos
- **Escalabilidad automática**: Sin dependencias corruptas

### Frontend (React Native/Expo)
- **Interfaces old money**: Curiosas y profundas
- **Integración transparente**: Rappi como opción de delivery
- **Animaciones sutiles**: Para flujos vitales
- **Real-time updates**: Via Supabase Realtime

## 📁 Estructura de Archivos

```
supabase/
├── functions/
│   ├── create-rappi-order/     # Crear órdenes en Rappi
│   ├── rappi-webhook/          # Manejar webhooks
│   └── schedule-recurring-orders/ # Scheduling automático
├── migrations/
│   └── 20250711000000_rappi_integration.sql
data/
└── mockData.ts                 # Rappi agregado como delivery service
components/
└── SubscriptionBuilder.tsx     # Integración automática con Rappi
services/
└── rappiService.ts             # Servicio de integración
```

## 🔧 Configuración

### 1. Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```bash
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Rappi API (para Edge Functions)
RAPPI_CLIENT_ID=your_rappi_client_id
RAPPI_CLIENT_SECRET=your_rappi_client_secret
RAPPI_STORE_ID=your_store_id

# Webhook URL
RAPPI_WEBHOOK_URL=https://your-project.supabase.co/functions/v1/rappi-webhook
```

### 2. Configurar Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link proyecto
supabase link --project-ref your_project_ref

# Deploy Edge Functions
supabase functions deploy create-rappi-order
supabase functions deploy rappi-webhook
supabase functions deploy schedule-recurring-orders

# Aplicar migraciones
supabase db push
```

## 🚀 Edge Functions

### 1. create-rappi-order

**Propósito**: Crear órdenes en Rappi con autenticación OAuth ética.

**Endpoint**: `POST /functions/v1/create-rappi-order`

**Payload**:
```json
{
  "user_id": "uuid",
  "subscription_id": "uuid",
  "products": [
    {
      "product_id": "string",
      "quantity": 1,
      "name": "Café Premium",
      "price": 9990
    }
  ],
  "delivery_address": "Dirección de entrega",
  "delivery_time": "9:00-12:00"
}
```

**Respuesta**:
```json
{
  "success": true,
  "message": "Flujo esencial activado: orden regenerativa en camino",
  "order_id": "rappi_order_123",
  "estimated_delivery": "15-30 minutos",
  "total_value": 9990,
  "status": "fluyendo"
}
```

### 2. rappi-webhook

**Propósito**: Manejar eventos de Rappi y enviar notificaciones existenciales.

**Endpoint**: `POST /functions/v1/rappi-webhook`

**Eventos soportados**:
- `NEW_ORDER`: Orden confirmada
- `ORDER_READY`: Lista para entrega
- `ORDER_DELIVERED`: Entregada
- `ORDER_CANCELLED`: Cancelada

### 3. schedule-recurring-orders

**Propósito**: Scheduling automático de órdenes recurrentes.

**Trigger**: Diario via cron o trigger de base de datos.

## 📊 Base de Datos

### Tablas Principales

#### `orders`
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  flow_id UUID REFERENCES flows(id),
  rappi_order_id TEXT UNIQUE,
  status TEXT DEFAULT 'creada',
  total_amount DECIMAL(10,2),
  delivery_address TEXT,
  created_at TIMESTAMP
);
```

#### `webhook_events`
```sql
CREATE TABLE webhook_events (
  id UUID PRIMARY KEY,
  order_id TEXT,
  user_id UUID REFERENCES users(id),
  event_type TEXT,
  status TEXT,
  payload JSONB,
  created_at TIMESTAMP
);
```

#### `rappi_config`
```sql
CREATE TABLE rappi_config (
  id UUID PRIMARY KEY,
  store_id TEXT UNIQUE,
  client_id TEXT,
  client_secret TEXT,
  webhook_url TEXT,
  is_active BOOLEAN
);
```

## 🎨 Frontend Integration

### Constructor de Suscripciones

Rappi aparece como opción de delivery en el `SubscriptionBuilder`:

```tsx
// En mockData.ts
export const mockDeliveryServices: DeliveryService[] = [
  {
    id: 'rappi',
    name: 'Rappi',
    estimatedCost: 1990,
    estimatedTime: '15-30 min',
    icon: '🚀'
  },
  // ... otros servicios
];
```

### Integración Automática

Cuando el usuario selecciona Rappi como servicio de entrega:

1. **Selección**: Usuario elige Rappi en el constructor
2. **Alerta**: Se muestra confirmación de integración activada
3. **Creación**: Al crear la suscripción, se llama automáticamente a la Edge Function
4. **Confirmación**: Se muestra resultado de la orden en Rappi

### Flujo de Usuario

```tsx
// En SubscriptionBuilder.tsx
onPress={() => {
  setSelectedDeliveryService(service);
  
  // Si se selecciona Rappi, activar integración automáticamente
  if (service.id === 'rappi') {
    Alert.alert(
      '🚀 Integración Rappi Activada',
      'Has seleccionado Rappi como servicio de entrega. Tu orden será procesada automáticamente a través de nuestra integración ética.',
      [{ text: 'Entendido' }]
    );
  }
}}
```

## 🔄 Flujo de Trabajo

### 1. Selección de Rappi
1. Usuario abre constructor de suscripciones
2. Selecciona productos y configuración
3. Elige Rappi como servicio de entrega
4. Se muestra alerta de integración activada

### 2. Creación de Orden
1. Usuario confirma la suscripción
2. Si Rappi está seleccionado, se llama a `create-rappi-order`
3. Edge Function autentica con Rappi via OAuth
4. Crea orden en Rappi y actualiza base de datos
5. Retorna confirmación al frontend

### 3. Webhooks y Notificaciones
1. Rappi envía webhook a `rappi-webhook`
2. Edge Function procesa evento
3. Actualiza estado de orden en base de datos
4. Envía notificación push al usuario
5. Registra evento en historial

## 💰 Modelo Freemium

### Plan Básico (Gratuito)
- ✅ Órdenes manuales con Rappi
- ✅ Tracking básico
- ✅ Historial de entregas

### Plan Premium ($9.99/mes)
- ✅ Scheduling automático con Rappi
- ✅ Notificaciones premium
- ✅ Analytics profundos
- ✅ Webhooks en tiempo real
- ✅ Entregas ultra-rápidas

## 🛡️ Seguridad Ética

### Variables de Entorno
- **Nunca hardcodear** credenciales
- Usar `Deno.env.get()` en Edge Functions
- Configurar en Supabase Dashboard

### Autenticación
- OAuth 2.0 con Rappi
- Tokens frescos en cada llamada
- Verificación de permisos por usuario

### Validación
- Validar todos los inputs
- Sanitizar datos antes de enviar
- Manejar errores gracefulmente

## 🧪 Testing

### Simular Webhook
```tsx
await rappiService.simulateWebhook('order_123', 'ORDER_DELIVERED');
```

### Verificar Estado
```tsx
const orders = await rappiService.getUserOrders(userId);
const analytics = await rappiService.getTimeSavedAnalytics(userId);
```

## 🚀 Deployment

### 1. Supabase
```bash
# Deploy Edge Functions
supabase functions deploy

# Aplicar migraciones
supabase db push

# Verificar funciones
supabase functions list
```

### 2. Variables de Entorno
```bash
# Configurar en Supabase Dashboard
# Settings > Edge Functions > Environment Variables
```

### 3. Webhooks
```bash
# Configurar webhook URL en Rappi Dashboard
# URL: https://your-project.supabase.co/functions/v1/rappi-webhook
```

## 📈 Analytics y Métricas

### Tiempo Ahorrado
- Calculado automáticamente por entrega
- 2 horas por entrega automática
- Mostrado en dashboard del usuario

### Estadísticas de Flujos
- Total de flujos activos
- Costo mensual estimado
- Próxima fecha de entrega

### Eventos de Webhook
- Tracking completo de eventos
- Historial de estados de órdenes
- Análisis de patrones de entrega

## 🔧 Troubleshooting

### Error de Autenticación
```bash
# Verificar variables de entorno
echo $RAPPI_CLIENT_ID
echo $RAPPI_CLIENT_SECRET

# Verificar logs de Edge Function
supabase functions logs create-rappi-order
```

### Webhook No Recibido
```bash
# Verificar URL configurada
# Verificar autenticación
# Revisar logs de webhook
supabase functions logs rappi-webhook
```

### Scheduling No Funciona
```bash
# Verificar trigger configurado
# Revisar logs de scheduling
supabase functions logs schedule-recurring-orders
```

## 🎯 Próximos Pasos

1. **Integrar con MercadoPago** para pagos automáticos
2. **Añadir notificaciones push** con Expo Notifications
3. **Implementar analytics avanzados** con Supabase Analytics
4. **Crear dashboard admin** para gestión de flujos
5. **Añadir soporte multi-tienda** para diferentes ubicaciones

## 📞 Soporte

Para dudas técnicas o problemas de implementación:
- Revisar logs de Edge Functions
- Verificar configuración de variables de entorno
- Consultar documentación de Rappi API
- Contactar equipo de desarrollo

---

**¡Rompe la realidad con EssentialFlow! 🚀** 