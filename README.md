# EssentialFlow App

Una aplicación móvil revolucionaria que automatiza las compras recurrentes y optimiza el tiempo de los usuarios mediante inteligencia artificial y integración con múltiples servicios.

## 🚀 Características Principales

### ✨ Funcionalidades Core
- **Automatización de Compras**: Crea flujos automáticos para productos recurrentes
- **Integración Multi-Tienda**: Conecta con Shopify, Rappi y tiendas locales
- **Sistema de Pagos**: Integración con MercadoPago y WebPay
- **Analytics Avanzados**: Seguimiento de tiempo y dinero ahorrado
- **Notificaciones Inteligentes**: Alertas personalizadas y recordatorios
- **Gestión de Direcciones**: Múltiples direcciones de entrega
- **Wallet Digital**: Gestión de métodos de pago y suscripciones

### 🛠 Tecnologías Utilizadas
- **Frontend**: React Native + Expo
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Autenticación**: Supabase Auth
- **Notificaciones**: Expo Notifications
- **Pagos**: MercadoPago API
- **E-commerce**: Shopify Storefront API
- **Delivery**: Rappi API
- **Estado**: React Hooks + Context
- **UI**: Lucide React Native + Linear Gradients

## 📱 Pantallas Principales

### 🏠 Home Dashboard
- Resumen de automatizaciones activas
- Próximas entregas
- Estadísticas de tiempo ahorrado
- Acceso rápido a funcionalidades

### 🛍 Catálogo de Productos
- Navegación por tiendas
- Filtros avanzados (precio, categoría, disponibilidad)
- Integración con Shopify
- Búsqueda inteligente

### ⚡ Automatizaciones
- Crear y gestionar flujos automáticos
- Programar entregas recurrentes
- Pausar/activar automatizaciones
- Historial de entregas

### 👤 Perfil de Usuario
- Información personal
- Métodos de pago
- Direcciones de entrega
- Configuración de notificaciones
- Planes de suscripción

### 💳 Wallet
- Gestión de métodos de pago
- Historial de transacciones
- Suscripciones activas
- Información de seguridad

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Expo CLI
- Cuenta de Supabase
- Cuenta de MercadoPago (opcional)
- Cuenta de Shopify (opcional)

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd essentialflow-app
```

### 2. Instalar Dependencias
```bash
npm install
# o
yarn install
```

### 3. Configurar Variables de Entorno
Crear archivo `.env` en la raíz del proyecto:

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Shopify (opcional)
EXPO_PUBLIC_SHOPIFY_DOMAIN=your_shopify_domain
EXPO_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_shopify_token

# MercadoPago (opcional)
EXPO_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_key

# Expo
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id
```

### 4. Configurar Supabase

#### 4.1 Crear Proyecto en Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Crea un nuevo proyecto
3. Copia las credenciales del proyecto

#### 4.2 Ejecutar Migraciones
```bash
# Instalar Supabase CLI
npm install -g supabase

# Iniciar sesión
supabase login

# Vincular proyecto
supabase link --project-ref your_project_ref

# Ejecutar migraciones
supabase db push
```

#### 4.3 Configurar Edge Functions
```bash
# Desplegar funciones
supabase functions deploy create-rappi-order
supabase functions deploy rappi-webhook
supabase functions deploy schedule-recurring-orders
supabase functions deploy fetch-brand-assets
```

### 5. Ejecutar la Aplicación

#### Desarrollo
```bash
npm run dev
# o
yarn dev
```

#### Producción
```bash
# Build para Android
expo build:android

# Build para iOS
expo build:ios

# Build para Web
npm run build:web
```

## 🗄 Estructura de la Base de Datos

### Tablas Principales

#### users
- Información de usuarios
- Nivel de suscripción
- Estadísticas de tiempo ahorrado

#### flows
- Automatizaciones de usuarios
- Configuración de entregas
- Estado de activación

#### stores
- Información de tiendas
- Integración con Shopify
- Configuración de delivery

#### products
- Catálogo de productos
- Precios y disponibilidad
- Categorías y tags

#### orders
- Historial de órdenes
- Integración con Rappi
- Estado de entregas

#### notifications
- Sistema de notificaciones
- Configuración de alertas
- Historial de mensajes

## 🔧 Configuración de Servicios

### Shopify Integration
1. Crear app en Shopify Partner Dashboard
2. Configurar Storefront API
3. Obtener access token
4. Configurar webhooks (opcional)

### MercadoPago Integration
1. Crear cuenta de MercadoPago
2. Obtener credenciales de API
3. Configurar webhooks
4. Crear planes de suscripción

### Rappi Integration
1. Contactar con Rappi Business
2. Obtener credenciales de API
3. Configurar webhooks
4. Probar integración

## 📊 Analytics y Métricas

### Métricas Principales
- **Tiempo Ahorrado**: Cálculo basado en automatizaciones activas
- **Dinero Ahorrado**: Comparación con compras manuales
- **Entregas Completadas**: Historial de entregas exitosas
- **Satisfacción del Usuario**: Ratings y feedback

### Dashboard de Analytics
- Gráficos de tendencias
- Comparación mensual/anual
- Análisis de categorías
- Predicciones de ahorro

## 🔐 Seguridad

### Implementaciones de Seguridad
- Autenticación con Supabase Auth
- Row Level Security (RLS)
- Encriptación de datos sensibles
- Validación de inputs
- Sanitización de datos

### Cumplimiento
- PCI DSS para pagos
- GDPR para datos personales
- CCPA para privacidad

## 🧪 Testing

### Ejecutar Tests
```bash
# Tests unitarios
npm test

# Tests de integración
npm run test:integration

# Tests E2E
npm run test:e2e
```

### Coverage
```bash
npm run test:coverage
```

## 📦 Deployment

### Expo Application Services (EAS)
```bash
# Instalar EAS CLI
npm install -g @expo/eas-cli

# Configurar build
eas build:configure

# Build para producción
eas build --platform all
```

### App Store / Google Play
1. Configurar certificados
2. Subir builds
3. Configurar metadata
4. Enviar para revisión

## 🤝 Contribución

### Guías de Contribución
1. Fork el proyecto
2. Crear feature branch
3. Commit cambios
4. Push al branch
5. Crear Pull Request

### Estándares de Código
- ESLint para linting
- Prettier para formateo
- TypeScript para tipado
- Conventional Commits

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🆘 Soporte

### Canales de Soporte
- **Email**: support@essentialflow.com
- **Discord**: [EssentialFlow Community](https://discord.gg/essentialflow)
- **Documentación**: [docs.essentialflow.com](https://docs.essentialflow.com)

### FAQ
- [Preguntas Frecuentes](https://docs.essentialflow.com/faq)
- [Guías de Uso](https://docs.essentialflow.com/guides)
- [Troubleshooting](https://docs.essentialflow.com/troubleshooting)

## 🗺 Roadmap

### Próximas Funcionalidades
- [ ] IA para recomendaciones de productos
- [ ] Integración con más tiendas
- [ ] Sistema de recompensas
- [ ] Marketplace de automatizaciones
- [ ] API pública para desarrolladores
- [ ] Widgets para iOS/Android
- [ ] Integración con asistentes virtuales

### Mejoras Técnicas
- [ ] Optimización de performance
- [ ] Mejoras en UX/UI
- [ ] Soporte offline
- [ ] Sync en tiempo real
- [ ] Analytics avanzados
- [ ] Machine Learning

---

**EssentialFlow** - Automatizando tu vida, un producto a la vez. 🚀 