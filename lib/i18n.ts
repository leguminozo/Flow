import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  es: {
    translation: {
      // Navigation
      nav: {
        home: 'Inicio',
        catalog: 'Catálogo',
        automations: 'Automatizaciones',
        profile: 'Perfil'
      },
      
      // Home Screen
      home: {
        title: 'Essential\nFlow',
        subtitle: 'Revoluciona tu hogar con automatización inteligente.\nConecta con cualquier tienda, catálogo o plataforma para crear un ecosistema de compras sin límites.',
        cta: 'Inicia tu Flujo Constructor',
        subscriptionSummary: 'Resumen de Flujos de Automatización',
        subscriptionSummarySubtitle: 'Toca cada portal para revelar más dimensiones',
        activePlans: 'Flujos Activos',
        nextDelivery: 'Próxima Entrega',
        timeSaved: 'Tiempo Ahorrado',
        monthly: 'mensual',
        inDays: 'en {{count}} días',
        featuredProducts: 'Productos Destacados',
        seeStores: 'Ver Tiendas',
        subscriptionPlans: 'Niveles del Núcleo Constructor',
        quickActions: 'Acciones Rápidas',
        exploreCatalog: 'Explorar Catálogo',
        exploreCatalogDesc: 'Productos de supermercados y tiendas locales',
        createSubscription: 'Crear Flujo de Automatización',
        createSubscriptionDesc: 'Da forma a tu universo de automatizaciones esenciales',
        manageAddresses: 'Gestionar Direcciones',
        manageAddressesDesc: 'Casa, trabajo y más ubicaciones',
        paymentMethods: 'Métodos de Pago',
        paymentMethodsDesc: 'WebPay, Mercado Pago y más',
        // New plan translations
        esencialFlow: 'Esencial Flow',
        superEsencialFlow: 'Súper Esencial Flow',
        yourCurrentPlan: 'Tu Plan Actual',
        upgradeToSuper: 'Mejorar a Súper',
        freeAutomations: 'automatizaciones gratuitas',
        unlimitedAutomations: 'Automatizaciones ilimitadas',
        freeShipping: 'Envíos gratis',
        costPerAutomation: 'Cada automatización adicional cuesta $300'
      },
      
      // Products Screen
      products: {
        title: 'Catálogo',
        subtitle: 'Tiendas disponibles para entrega',
        storeInfo: 'Información de la tienda',
        exploreCategories: 'Explora todas las categorías',
        searchPlaceholder: 'Buscar productos...',
        closed: 'Cerrado',
        enterStore: 'Entrar a la Tienda',
        storeClosed: 'Tienda Cerrada',
        categoriesAvailable: 'Categorías Disponibles:',
        categories: 'Categorías',
        allProducts: 'Todos los Productos',
        outOfStock: 'Agotado',
        noProductsFound: 'No se encontraron productos',
        adjustFilters: 'Intenta ajustar los filtros de búsqueda',
        cart: 'Ver Carrito',
        filters: 'Filtros',
        priceRange: 'Rango de Precio',
        allPrices: 'Todos los precios',
        lessThan5k: 'Menos de $5.000',
        between5k15k: '$5.000 - $15.000',
        moreThan15k: 'Más de $15.000',
        availability: 'Disponibilidad',
        all: 'Todos',
        inStock: 'En stock',
        sortBy: 'Ordenar por',
        nameAZ: 'Nombre A-Z',
        priceLowHigh: 'Precio: menor a mayor',
        priceHighLow: 'Precio: mayor a menor',
        bestRated: 'Mejor valorados',
        brand: 'Marca',
        searchByBrand: 'Buscar por marca...',
        clearFilters: 'Limpiar Filtros',
        apply: 'Aplicar'
      },
      
      // Automations Screen
      automations: {
        title: 'Mis Automatizaciones',
        subtitle: 'Gestiona tus entregas automáticas',
        active: 'Activas',
        paused: 'pausadas',
        next: 'Próxima',
        monthly: 'Mensual',
        estimated: 'estimado',
        createNew: 'Crear Nueva Automatización',
        noSubscriptions: 'No tienes automatizaciones activas',
        noSubscriptionsDesc: 'Crea tu primera automatización para automatizar tus compras esenciales',
        createFirst: 'Crear Primera Automatización',
        products: 'productos',
        weekly: 'semanal',
        biweekly: 'quincenal',
        custom: 'personalizada',
        nextDelivery: 'Próxima Entrega',
        schedule: 'Horario',
        address: 'Dirección',
        service: 'Servicio',
        activeStatus: 'Activa',
        pausedStatus: 'Pausada',
        tracking: 'Seguimiento',
        edit: 'Editar',
        pause: 'Pausar',
        resume: 'Reanudar',
        delete: 'Eliminar'
      },
      
      // Profile Screen
      profile: {
        title: 'Mi Perfil Cósmico',
        subtitle: 'Moldea tu esencia en el flujo universal',
        memberSince: 'Miembro desde {{date}}',
        totalSavings: 'Ahorro Total',
        activePlans: 'Flujos Activos',
        personalInfo: 'Información Personal',
        subscriptionPlan: 'Nivel del Núcleo Constructor',
        deliveryAddresses: 'Direcciones de Entrega',
        create: 'Crear',
        paymentMethods: 'Métodos de Pago',
        accountSettings: 'Configuración de Cuenta',
        advancedSettings: 'Configuración Avanzada',
        deliveryServices: 'Servicios de Entrega',
        preferences: 'Preferencias',
        pushNotifications: 'Notificaciones Push',
        pushNotificationsDesc: 'Recibe actualizaciones de entrega y ofertas',
        autoRenewal: 'Renovación Automática',
        autoRenewalDesc: 'Renueva automáticamente las suscripciones',
        ecoPriority: 'Prioridad Ecológica',
        ecoPriorityDesc: 'Priorizar productos sustentables',
        support: 'Soporte',
        helpCenter: 'Centro de Ayuda',
        contactSupport: 'Contactar Soporte',
        logout: 'Cerrar Sesión',
        appVersion: 'EssentialFlow v1.0.0',
        appDescription: 'Automatización premium de productos esenciales del hogar'
      },
      
      // Legal Section
      legal: {
        title: 'Legal',
        termsOfService: 'Términos y Condiciones',
        privacyPolicy: 'Política de Privacidad',
        termsContent: `Términos de Servicio de EssentialFlow

Última actualización: 27 de junio de 2025

Bienvenido a EssentialFlow. Al utilizar nuestra aplicación web (el "Servicio"), aceptas estos Términos de Servicio ("Términos"). Si no estás de acuerdo con estos Términos, por favor no utilices el Servicio.

1. Aceptación de los Términos

Al registrarte o utilizar EssentialFlow, confirmas que has leído, entendido y aceptado estos Términos y nuestra Política de Privacidad. Este documento constituye un contrato legalmente vinculante entre tú ("Usuario" o "tú") y EssentialFlow ("nosotros", "nuestro" o "la Empresa").

2. Descripción del Servicio

EssentialFlow es una plataforma que permite a los usuarios configurar "Automatizaciones" para la compra y entrega recurrente de productos esenciales. Puedes seleccionar productos, establecer frecuencias de entrega (por ejemplo, semanal o mensual) y gestionar tus suscripciones directamente en nuestra aplicación web.

3. Cuentas de Usuario

Registro: Para acceder al Servicio, debes crear una cuenta con información precisa y actualizada, incluyendo un correo electrónico válido. Eres responsable de proteger tu contraseña y de toda actividad realizada desde tu cuenta.

Edad mínima: Debes tener al menos 18 años o la mayoría de edad en tu jurisdicción para usar el Servicio.

Suspensión o terminación: Nos reservamos el derecho de suspender o eliminar tu cuenta si incumples estos Términos o si detectamos actividades fraudulentas o ilegales.

4. Automatizaciones y Pagos

Automatizaciones: Al crear una Automatización, autorizas a EssentialFlow a realizar cobros recurrentes en el método de pago que elijas, según la frecuencia establecida.

Suscripción Premium: Ofrecemos un plan premium por $5.000 CLP mensuales, que incluye automatizaciones ilimitadas y envíos gratuitos (sujetos a disponibilidad).

Comisión por Automatización: Cada orden generada por una Automatización incurre en una comisión de $300 CLP.

Procesamiento de pagos: Los pagos se procesan a través de MercadoPago. Al usar el Servicio, aceptas los términos de MercadoPago.

Cancelación: Puedes cancelar una Automatización en cualquier momento desde la aplicación. La cancelación será efectiva al finalizar el ciclo de facturación actual.

5. Propiedad Intelectual

Derechos de EssentialFlow: El Servicio, incluyendo su diseño, código, marcas y contenido, es propiedad exclusiva de EssentialFlow y está protegido por leyes de propiedad intelectual.

Licencia limitada: Te otorgamos una licencia no exclusiva, revocable y limitada para usar el Servicio únicamente con fines personales y no comerciales, siempre que cumplas con estos Términos.

6. Datos y Privacidad

Recopilación: Recolectamos datos personales y de uso para operar y mejorar el Servicio, como se detalla en nuestra Política de Privacidad.

Datos anónimos: Podemos anonimizar y agregar datos para análisis y fines comerciales, en cumplimiento con la Ley 19.628 de Chile sobre Protección de la Vida Privada.

Consentimiento: Al usar el Servicio, aceptas la recopilación, uso y compartición de tus datos conforme a estos Términos y nuestra Política de Privacidad.

7. Limitación de Responsabilidad

Sin garantías: El Servicio se ofrece "tal cual" y "según disponibilidad". No garantizamos que sea ininterrumpido, seguro o libre de errores.

Límite de responsabilidad: En la medida permitida por la ley, EssentialFlow no será responsable por daños indirectos, incidentales, especiales o consecuentes derivados del uso o la imposibilidad de usar el Servicio.

8. Modificaciones a los Términos

Podemos actualizar estos Términos en cualquier momento. Te notificaremos sobre cambios importantes por correo electrónico o dentro de la aplicación. Si continúas usando el Servicio tras estas modificaciones, aceptas los nuevos Términos.

9. Ley Aplicable y Jurisdicción

Estos Términos se rigen por las leyes de Chile. Cualquier disputa relacionada con el Servicio o estos Términos será resuelta exclusivamente en los tribunales de Santiago, Chile.

10. Contacto

Para preguntas o dudas sobre estos Términos, escríbenos a soporte@essentialflow.com.`,
        privacyContent: `Política de Privacidad de EssentialFlow

Última actualización: 27 de junio de 2025

En EssentialFlow ("nosotros", "nuestro" o "la Empresa"), nos comprometemos a proteger tu privacidad. Esta Política de Privacidad describe cómo recopilamos, usamos, almacenamos y compartimos tu información personal cuando utilizas nuestro Servicio (la aplicación web y móvil EssentialFlow). Al usar el Servicio, aceptas los términos de esta Política.

1. Información que Recopilamos

Recolectamos los siguientes tipos de datos:

Datos proporcionados por ti:

Nombre completo, correo electrónico y contraseña al registrarte.

Direcciones de entrega (incluyendo ciudad, calle y notas de entrega).

Preferencias de automatización (productos, frecuencias y servicios de entrega).

Datos generados por el uso:

Historial de compras y automatizaciones.

Datos de geolocalización (si nos das permiso).

Interacciones con la aplicación (clics, tiempos de uso).

Datos técnicos:

Dirección IP, tipo de dispositivo, sistema operativo y datos de navegación.

2. Cómo Usamos tu Información

Utilizamos tu información para:

Proporcionar, operar y mejorar el Servicio (crear y gestionar automatizaciones).

Procesar pagos y suscripciones a través de MercadoPago.

Personalizar tu experiencia (mostrar productos y precios según tu ubicación).

Enviar notificaciones sobre entregas, cambios o problemas de stock.

Cumplir con obligaciones legales y proteger nuestros derechos.

3. Uso de Datos Anónimos

Podemos anonimizar y agregar tus datos (por ejemplo, patrones de compra) para análisis estadístico y fines comerciales.

Estos datos anónimos no te identifican personalmente y se utilizan de acuerdo con la Ley 19.628 de Chile.

No vendemos ni compartimos datos personales identificables con terceros.

4. Compartición de Información

Compartimos tu información en los siguientes casos:

Proveedores de servicios: Con MercadoPago para procesar pagos y servicios de entrega (PedidosYa, Uber Eats, Chilexpress) para cumplir con tus automatizaciones.

Autoridades legales: Si estamos obligados por ley o para proteger nuestros derechos.

No compartimos datos con anunciantes ni socios comerciales más allá de lo necesario para operar el Servicio.

5. Seguridad de los Datos

Almacenamos tu información en servidores seguros gestionados por Supabase.

Implementamos medidas técnicas y organizativas para proteger tus datos contra accesos no autorizados, pérdida o alteración.

Sin embargo, ninguna transmisión por internet es completamente segura, por lo que no podemos garantizar una protección absoluta.

6. Tus Derechos

De acuerdo con la Ley 19.628, tienes los siguientes derechos:

Acceso: Solicitar una copia de tus datos personales.

Rectificación: Corregir datos inexactos o incompletos.

Eliminación: Solicitar la eliminación de tus datos (sujeto a obligaciones legales).

Para ejercer estos derechos, contáctanos en soporte@essentialflow.com.

7. Retención de Datos

Conservamos tus datos mientras seas usuario del Servicio. Tras la eliminación de tu cuenta, mantendremos datos anónimos por un máximo de 12 meses para análisis, salvo que la ley exija un período mayor.

8. Cookies y Tecnologías Similares

Usamos cookies para mejorar tu experiencia y analizar el uso del Servicio. Puedes gestionar tus preferencias de cookies desde la configuración de tu navegador.

9. Cambios a esta Política

Podemos actualizar esta Política de Privacidad periódicamente. Te notificaremos por correo electrónico o dentro de la aplicación sobre cambios significativos. La versión más reciente estará siempre disponible en el Servicio.

10. Contacto

Si tienes preguntas sobre esta Política, contáctanos en:

Correo: soporte@essentialflow.com

Dirección: EssentialFlow, Pureo rural km 8560, Chiloé Chile`
      },
      
      // Common
      common: {
        save: 'Guardar',
        cancel: 'Cancelar',
        close: 'Cerrar',
        edit: 'Editar',
        delete: 'Eliminar',
        add: 'Agregar',
        remove: 'Eliminar',
        confirm: 'Confirmar',
        back: 'Volver',
        next: 'Siguiente',
        previous: 'Anterior',
        done: 'Listo',
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        warning: 'Advertencia',
        info: 'Información',
        yes: 'Sí',
        no: 'No',
        ok: 'OK',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        select: 'Seleccionar',
        selected: 'Seleccionado',
        available: 'Disponible',
        unavailable: 'No disponible',
        price: 'Precio',
        quantity: 'Cantidad',
        total: 'Total',
        subtotal: 'Subtotal',
        discount: 'Descuento',
        shipping: 'Envío',
        tax: 'Impuesto',
        free: 'Gratis',
        premium: 'Premium',
        basic: 'Básico',
        advanced: 'Avanzado',
        popular: 'Popular',
        recommended: 'Recomendado',
        new: 'Nuevo',
        sale: 'Oferta',
        featured: 'Destacado',
        trending: 'Tendencia'
      },
      
      // Address Manager
      addressManager: {
        title: 'Direcciones de Entrega',
        subtitle: 'Administra tus ubicaciones de entrega',
        addNew: 'Agregar Nueva Dirección de Entrega',
        editAddress: 'Editar Dirección de Entrega',
        newAddress: 'Nueva Dirección de Entrega',
        addressType: 'Tipo de Dirección de Entrega',
        home: 'Casa',
        work: 'Trabajo',
        leisure: 'Ocio',
        other: 'Otro',
        customName: 'Nombre Personalizado',
        customNamePlaceholder: 'Ej: Casa de mis padres',
        address: 'Dirección de Entrega',
        addressPlaceholder: 'Ej: Av. Las Condes 12345, Las Condes',
        city: 'Ciudad',
        cityPlaceholder: 'Ej: Santiago',
        deliveryNotes: 'Notas de Entrega',
        deliveryNotesPlaceholder: 'Ej: Portón azul, timbre 2B, dejar con el conserje',
        setAsDefault: 'Establecer como dirección principal',
        setAsDefaultDesc: 'La dirección principal aparecerá primero en la lista',
        savedAddresses: 'Direcciones de Entrega Guardadas',
        defaultFirst: 'La dirección principal aparece primero',
        noAddresses: 'No hay direcciones de entrega guardadas',
        noAddressesDesc: 'Agrega tu primera dirección de entrega para comenzar a recibir entregas',
        makeDefault: 'Hacer Principal',
        required: 'obligatorio'
      },
      
      // Payment Plans
      paymentPlans: {
        title: 'Niveles del Núcleo Constructor EssFlow',
        subtitle: 'Elige el nivel que expanda tu consciencia en el arte de la automatización',
        selectPlan: 'Selecciona tu Nivel de Elevación',
        selectPlanDesc: 'Desliza desde el núcleo básico hacia la expansión premium. Todos los precios incluyen el flujo universal (IVA).',
        mostPopular: 'MOST POPULAR',
        perMonth: 'por mes',
        before: 'Antes:',
        netValue: 'Valor neto:',
        iva: 'IVA:',
        characteristics: 'Poderes Cósmicos:',
        subscriptions: 'Flujos de Automatización:',
        unlimited: 'Infinitos',
        upTo: 'Hasta',
        freeDeliveryIncluded: 'Viajes estelares gratuitos incluidos',
        savesPerMonth: 'Maximiza {{amount}} unidades de tiempo al mes',
        margin: 'Margen Existencial:',
        planSelected: 'Nivel Elevado',
        selectPlanButton: 'Elevar Nivel',
        paymentMethods: 'Portales de Intercambio',
        paymentMethodsDesc: 'Selecciona el portal para canalizar tu flujo mensual',
        addPaymentMethod: 'Abrir Nuevo Portal',
        securePayment: 'Flujo Seguro y Garantías Eternas',
        securePaymentDesc: 'Todos los flujos están protegidos con encriptación cuántica. Puedes disolver tu conexión en cualquier momento sin ecos residuales.',
        ssl256: 'Encriptación Cuántica 256-bit',
        pciCompliance: 'Armonía PCI DSS',
        noPenaltyCancellation: 'Disolución sin ecos',
        satisfactionGuarantee: 'Garantía de Armonía 30 ciclos',
        costTransparency: 'Transparencia Cósmica',
        costTransparencyDesc: 'En EssFlow creemos en la revelación total de nuestra matriz existencial.',
        howPricingWorks: '🌌 ¿Cómo fluyen nuestras estructuras?',
        operationalCosts: '• Cada nivel integra flujos operativos (APIs, viajes, procesamiento)',
        marginsImprovement: '• Nuestros márgenes expanden continuamente la consciencia del servicio',
        realSavings: '• Las maximizaciones mostradas son portales reales comparados con adquisiciones individuales',
        taxIncluded: '• Todos los flujos incluyen IVA (19%) según el orden chileno',
        confirmAndProceed: 'Confirmar y Transcender al Intercambio'
      },
      
      // Subscription Builder
      builder: {
        title: 'Núcleo Constructor',
        selectProducts: '1. Selecciona Productos',
        selectProductsDesc: 'Toca cualquier producto para agregarlo o quitarlo',
        deliveryFrequency: '2. Frecuencia de Entrega',
        scheduleDelivery: '3. Programar Entrega',
        deliveryAddress: '4. Dirección de Entrega',
        deliveryService: '5. Servicio de Entrega',
        manage: 'Gestionar',
        quantity: 'Cantidad:',
        weekly: 'Semanal',
        biweekly: 'Quincenal',
        monthly: 'Mensual',
        custom: 'Personalizada',
        everyDays: 'Cada {{days}} días',
        daysBetweenDeliveries: 'Días entre entregas',
        firstDelivery: 'Primera Entrega',
        change: 'Cambiar',
        deliverySchedule: 'Horario de entrega',
        morning: 'Mañana',
        midday: 'Mediodía',
        afternoon: 'Tarde',
        evening: 'Noche',
        main: 'Principal',
        selectDate: 'Seleccionar Fecha',
        selectedDate: 'Fecha seleccionada:',
        product: 'producto',
        products: 'productos',
        // Confirmation modal
        confirmCreationTitle: 'Confirmar Creación de Automatización',
        automationCost: 'Costo por usar la app: ${{cost}}',
        chargeExplanation: 'Este cobro se efectuará cuando la automatización se inicie por primera vez.',
        confirmButton: 'Confirmar Creación',
        cancelButton: 'Cancelar',
        // Natural Frequencies
        naturalFrequencies: 'Frecuencias Naturales',
        naturalFrequenciesDesc: 'Triggers inteligentes que desafían la percepción humana del tiempo',
        stockAlert: 'Alerta de Stock',
        stockAlertDesc: 'Detecta cuando los productos esenciales están por agotarse',
        priceDrop: 'Caída de Precios',
        priceDropDesc: 'Activa compras automáticas cuando los precios bajan',
        weatherEvent: 'Eventos Climáticos',
        weatherEventDesc: 'Adapta entregas según condiciones meteorológicas',
        consumptionPattern: 'Patrones de Consumo',
        consumptionPatternDesc: 'Detecta aceleraciones en tu esencia vital',
        healthTrigger: 'Triggers de Salud',
        healthTriggerDesc: 'Sincroniza con tu bienestar regenerativo',
        socialEvent: 'Eventos Sociales',
        socialEventDesc: 'Anticipa necesidades para encuentros trascendentales',
        premiumUpsell: 'Desbloquea irrupciones inteligentes por $4.990/mes',
        // Modes
        exploratoryMode: 'Modo Exploratorio',
        personalizedMode: 'Modo Personalizado',
        addMoreEssentials: 'Agregar Más Esenciales',
        // Advanced Options
        advancedOptions: 'Opciones Avanzadas',
        notifications: 'Notificaciones',
        notificationsDesc: 'Recibe alertas sobre el estado de tu flujo regenerativo',
        budgetLimit: 'Límite de Presupuesto',
        budgetLimitDesc: 'Define un tope para mantener la armonía financiera',
        autoPause: 'Pausa Automática',
        autoPauseDesc: 'Pausa automáticamente cuando detecte patrones inusuales',
        existentialMode: 'Modo Trascendental',
        existentialModeDesc: 'Activa el modo que desafía la percepción humana del tiempo',
        // Summary
        regenerativeFlow: 'Flujo Regenerativo',
        createRegenerativeFlow: 'Crear Flujo Regenerativo',
        summaryTitle: 'Resumen de tu Flujo Regenerativo',
        selectedProducts: 'Productos Seleccionados',
        estimatedSavings: 'Ahorro Estimado',
        nextDelivery: 'Próxima Entrega',
        // Search
        searchPlaceholder: 'Busca esenciales para tu flujo regenerativo...',
        // Categories
        cafeRegenerative: 'Café Regenerativo',
        hygieneSustainable: 'Higiene Sostenible',
        essentialFoods: 'Alimentos Esenciales',
        consciousCleaning: 'Limpieza Consciente',
        transcendentalWellness: 'Bienestar Trascendental',
        // Tooltips
        transcendEternal: 'Esta automatización libera tu tiempo para lo eterno, rompiendo ciclos consumistas',
        chooseEssential: 'Elige lo esencial para trascender lo efímero',
        defineRhythm: 'Define el ritmo de tu flujo regenerativo',
        firstDeliveryTranscendental: 'Define cuándo recibirás tu primera entrega trascendental',
        chooseService: 'Elige el servicio que trascienda la burocracia tradicional',
        // Premium Features
        premiumFeatures: 'Características Premium',
        unlimitedAutomations: 'Automatizaciones Ilimitadas',
        intelligentTriggers: 'Triggers Inteligentes',
        transcendentalAnalytics: 'Analytics Trascendentales',
        premiumPrice: '$4.990/mes',
        // Existential Messages
        transcendPredictable: 'Trasciende lo predecible —suscríbete ahora',
        freedomRegenerative: 'Libertad regenerativa del ciclo consumista',
        breakConsumerChains: 'Rompe las cadenas del consumismo tradicional',
        timeForEternal: 'Libera tu tiempo para lo eterno',
        essentialForTranscend: 'Elige lo esencial para trascender lo efímero'
      },
      
      // Product Search Modal
      productSearch: {
        title: 'Buscar Producto',
        searchPlaceholder: 'Buscar productos, marcas, tiendas...',
        all: 'Todos',
        food: 'Alimentos',
        drinks: 'Bebidas',
        cleaning: 'Limpieza',
        care: 'Cuidado',
        paper: 'Papel',
        others: 'Otros',
        productsFound: '{{count}} productos encontrados',
        outOfStock: 'Agotado',
        local: 'Local',
        eco: 'Eco',
        premium: 'Premium',
        noProductsFound: 'No se encontraron productos',
        noProductsFoundDesc: 'Intenta ajustar los filtros o términos de búsqueda'
      },
      
      // Not Found
      notFound: {
        title: '¡Ups!',
        message: 'Esta pantalla no existe.',
        goHome: '¡Ir a la pantalla de inicio!'
      }
    }
  },
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        catalog: 'Catalog',
        automations: 'Automations',
        profile: 'Profile'
      },
      
      // Home Screen
      home: {
        title: 'Essential\nFlow',
        subtitle: 'Revolutionize your home with intelligent automation.\nConnect with any store, catalog or platform to create an unlimited shopping ecosystem.',
        cta: 'Start your Subscription',
        subscriptionSummary: 'Subscription Summary',
        subscriptionSummarySubtitle: 'Tap each card to see more details',
        activePlans: 'Active Plans',
        nextDelivery: 'Next Delivery',
        timeSaved: 'Time Saved',
        monthly: 'monthly',
        inDays: 'in {{count}} days',
        featuredProducts: 'Featured Products',
        seeStores: 'See Stores',
        subscriptionPlans: 'Subscription Plans',
        quickActions: 'Quick Actions',
        exploreCatalog: 'Explore Catalog',
        exploreCatalogDesc: 'Products from supermarkets and local stores',
        createSubscription: 'Create Subscription',
        createSubscriptionDesc: 'Automate your essential purchases',
        manageAddresses: 'Manage Addresses',
        manageAddressesDesc: 'Home, work and more locations',
        paymentMethods: 'Payment Methods',
        paymentMethodsDesc: 'WebPay, Mercado Pago and more',
        // New plan translations
        esencialFlow: 'Essential Flow',
        superEsencialFlow: 'Super Essential Flow',
        yourCurrentPlan: 'Your Current Plan',
        upgradeToSuper: 'Upgrade to Super',
        freeAutomations: 'free automations',
        unlimitedAutomations: 'Unlimited automations',
        freeShipping: 'Free shipping',
        costPerAutomation: 'Each additional automation costs $300'
      },
      
      // Products Screen
      products: {
        title: 'Catalog',
        subtitle: 'Stores available for delivery',
        storeInfo: 'Store information',
        exploreCategories: 'Explore all categories',
        searchPlaceholder: 'Search products...',
        closed: 'Closed',
        enterStore: 'Enter Store',
        storeClosed: 'Store Closed',
        categoriesAvailable: 'Available Categories:',
        categories: 'Categories',
        allProducts: 'All Products',
        outOfStock: 'Out of Stock',
        noProductsFound: 'No products found',
        adjustFilters: 'Try adjusting search filters',
        cart: 'View Cart',
        filters: 'Filters',
        priceRange: 'Price Range',
        allPrices: 'All prices',
        lessThan5k: 'Less than $5,000',
        between5k15k: '$5,000 - $15,000',
        moreThan15k: 'More than $15,000',
        availability: 'Availability',
        all: 'All',
        inStock: 'In stock',
        sortBy: 'Sort by',
        nameAZ: 'Name A-Z',
        priceLowHigh: 'Price: low to high',
        priceHighLow: 'Price: high to low',
        bestRated: 'Best rated',
        brand: 'Brand',
        searchByBrand: 'Search by brand...',
        clearFilters: 'Clear Filters',
        apply: 'Apply'
      },
      
      // Automations Screen
      automations: {
        title: 'My Automations',
        subtitle: 'Manage your automatic deliveries',
        active: 'Active',
        paused: 'paused',
        next: 'Next',
        monthly: 'Monthly',
        estimated: 'estimated',
        createNew: 'Create New Automation',
        noSubscriptions: 'You have no active automations',
        noSubscriptionsDesc: 'Create your first automation to automate your essential purchases',
        createFirst: 'Create First Automation',
        products: 'products',
        weekly: 'weekly',
        biweekly: 'biweekly',
        custom: 'custom',
        nextDelivery: 'Next Delivery',
        schedule: 'Schedule',
        address: 'Address',
        service: 'Service',
        activeStatus: 'Active',
        pausedStatus: 'Paused',
        tracking: 'Tracking',
        edit: 'Edit',
        pause: 'Pause',
        resume: 'Resume',
        delete: 'Delete'
      },
      
      // Profile Screen
      profile: {
        title: 'My Profile',
        subtitle: 'Manage your account and preferences',
        memberSince: 'Member since {{date}}',
        totalSavings: 'Total Savings',
        activePlans: 'Active Plans',
        personalInfo: 'Personal Information',
        subscriptionPlan: 'Subscription Plan',
        deliveryAddresses: 'Delivery Addresses',
        create: 'Create',
        paymentMethods: 'Payment Methods',
        accountSettings: 'Account Settings',
        advancedSettings: 'Advanced Settings',
        deliveryServices: 'Delivery Services',
        preferences: 'Preferences',
        pushNotifications: 'Push Notifications',
        pushNotificationsDesc: 'Receive delivery updates and offers',
        autoRenewal: 'Auto Renewal',
        autoRenewalDesc: 'Automatically renew subscriptions',
        ecoPriority: 'Eco Priority',
        ecoPriorityDesc: 'Prioritize sustainable products',
        support: 'Support',
        helpCenter: 'Help Center',
        contactSupport: 'Contact Support',
        logout: 'Sign Out',
        appVersion: 'EssentialFlow v1.0.0',
        appDescription: 'Premium automation for essential home products'
      },
      
      // Legal Section
      legal: {
        title: 'Legal',
        termsOfService: 'Terms and Conditions',
        privacyPolicy: 'Privacy Policy',
        termsContent: `EssentialFlow Terms of Service

Last updated: June 27, 2025

Welcome to EssentialFlow. By using our web application (the "Service"), you accept these Terms of Service ("Terms"). If you do not agree with these Terms, please do not use the Service.

1. Acceptance of Terms

By registering or using EssentialFlow, you confirm that you have read, understood and accepted these Terms and our Privacy Policy. This document constitutes a legally binding contract between you ("User" or "you") and EssentialFlow ("we", "our" or "the Company").

2. Service Description

EssentialFlow is a platform that allows users to configure "Automations" for the purchase and recurring delivery of essential products. You can select products, set delivery frequencies (e.g., weekly or monthly) and manage your subscriptions directly in our web application.

3. User Accounts

Registration: To access the Service, you must create an account with accurate and updated information, including a valid email address. You are responsible for protecting your password and all activity performed from your account.

Minimum age: You must be at least 18 years old or the age of majority in your jurisdiction to use the Service.

Suspension or termination: We reserve the right to suspend or delete your account if you violate these Terms or if we detect fraudulent or illegal activities.

4. Automations and Payments

Automations: By creating an Automation, you authorize EssentialFlow to make recurring charges to the payment method you choose, according to the established frequency.

Premium subscription: We offer a premium plan for $5,000 CLP monthly, which includes unlimited automations and free shipping (subject to availability).

Automation commission: Each order generated by an Automation incurs a commission of $300 CLP.

Payment processing: Payments are processed through MercadoPago. By using the Service, you accept MercadoPago's terms.

Cancellation: You can cancel an Automation at any time from the application. The cancellation will be effective at the end of the current billing cycle.

5. Intellectual Property

EssentialFlow rights: The Service, including its design, code, trademarks and content, is the exclusive property of EssentialFlow and is protected by intellectual property laws.

Limited license: We grant you a non-exclusive, revocable and limited license to use the Service solely for personal and non-commercial purposes, provided you comply with these Terms.

6. Data and Privacy

Collection: We collect personal and usage data to operate and improve the Service, as detailed in our Privacy Policy.

Anonymous data: We may anonymize and aggregate data for analysis and commercial purposes, in compliance with Chile's Law 19.628 on Protection of Private Life.

Consent: By using the Service, you accept the collection, use and sharing of your data in accordance with these Terms and our Privacy Policy.

7. Limitation of Liability

No warranties: The Service is offered "as is" and "as available". We do not guarantee that it will be uninterrupted, secure or error-free.

Liability limit: To the extent permitted by law, EssentialFlow will not be liable for indirect, incidental, special or consequential damages arising from the use or inability to use the Service.

8. Modifications to Terms

We may update these Terms at any time. We will notify you of important changes by email or within the application. If you continue using the Service after these modifications, you accept the new Terms.

9. Applicable Law and Jurisdiction

These Terms are governed by the laws of Chile. Any dispute related to the Service or these Terms will be resolved exclusively in the courts of Santiago, Chile.

10. Contact

For questions or concerns about these Terms, write to us at soporte@essentialflow.com.`,
        privacyContent: `EssentialFlow Privacy Policy

Last updated: June 27, 2025

At EssentialFlow ("we", "our" or "the Company"), we are committed to protecting your privacy. This Privacy Policy describes how we collect, use, store and share your personal information when you use our Service (the EssentialFlow web and mobile application). By using the Service, you accept the terms of this Policy.

1. Information We Collect

We collect the following types of data:

Data provided by you:

Full name, email and password when registering.

Delivery addresses (including city, street and delivery notes).

Automation preferences (products, frequencies and delivery services).

Data generated by use:

Purchase and automation history.

Geolocation data (if you give us permission).

Interactions with the application (clicks, usage times).

Technical data:

IP address, device type, operating system and browsing data.

2. How We Use Your Information

We use your information to:

Provide, operate and improve the Service (create and manage automations).

Process payments and subscriptions through MercadoPago.

Personalize your experience (show products and prices according to your location).

Send notifications about deliveries, changes or stock problems.

Comply with legal obligations and protect our rights.

3. Use of Anonymous Data

We may anonymize and aggregate your data (e.g., purchase patterns) for statistical analysis and commercial purposes.

This anonymous data does not personally identify you and is used in accordance with Chile's Law 19.628.

We do not sell or share personally identifiable data with third parties.

4. Information Sharing

We share your information in the following cases:

Service providers: With MercadoPago to process payments and delivery services (PedidosYa, Uber Eats, Chilexpress) to fulfill your automations.

Legal authorities: If we are required by law or to protect our rights.

We do not share data with advertisers or business partners beyond what is necessary to operate the Service.

5. Data Security

We store your information on secure servers managed by Supabase.

We implement technical and organizational measures to protect your data against unauthorized access, loss or alteration.

However, no internet transmission is completely secure, so we cannot guarantee absolute protection.

6. Your Rights

In accordance with Law 19.628, you have the following rights:

Access: Request a copy of your personal data.

Rectification: Correct inaccurate or incomplete data.

Deletion: Request deletion of your data (subject to legal obligations).

To exercise these rights, contact us at soporte@essentialflow.com.

7. Data Retention

We retain your data while you are a user of the Service. After deleting your account, we will maintain anonymous data for a maximum of 12 months for analysis, unless the law requires a longer period.

8. Cookies and Similar Technologies

We use cookies to improve your experience and analyze the use of the Service. You can manage your cookie preferences from your browser settings.

9. Changes to this Policy

We may update this Privacy Policy periodically. We will notify you by email or within the application about significant changes. The most recent version will always be available in the Service.

10. Contact

If you have questions about this Policy, contact us at:

Email: soporte@essentialflow.com

Address: EssentialFlow, Pureo rural km 8560, Chiloé Chile`
      },
      
      // Common
      common: {
        save: 'Save',
        cancel: 'Cancel',
        close: 'Close',
        edit: 'Edit',
        delete: 'Delete',
        add: 'Add',
        remove: 'Remove',
        confirm: 'Confirm',
        back: 'Back',
        next: 'Next',
        previous: 'Previous',
        done: 'Done',
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        warning: 'Warning',
        info: 'Information',
        yes: 'Yes',
        no: 'No',
        ok: 'OK',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        select: 'Select',
        selected: 'Selected',
        available: 'Available',
        unavailable: 'Unavailable',
        price: 'Price',
        quantity: 'Quantity',
        total: 'Total',
        subtotal: 'Subtotal',
        discount: 'Discount',
        shipping: 'Shipping',
        tax: 'Tax',
        free: 'Free',
        premium: 'Premium',
        basic: 'Basic',
        advanced: 'Advanced',
        popular: 'Popular',
        recommended: 'Recommended',
        new: 'New',
        sale: 'Sale',
        featured: 'Featured',
        trending: 'Trending'
      },
      
      // Address Manager
      addressManager: {
        title: 'Delivery Addresses',
        subtitle: 'Manage your delivery locations',
        addNew: 'Add New Delivery Address',
        editAddress: 'Edit Delivery Address',
        newAddress: 'New Delivery Address',
        addressType: 'Delivery Address Type',
        home: 'Home',
        work: 'Work',
        leisure: 'Leisure',
        other: 'Other',
        customName: 'Custom Name',
        customNamePlaceholder: 'e.g., Parents\' house',
        address: 'Delivery Address',
        addressPlaceholder: 'e.g., 123 Main St, Downtown',
        city: 'City',
        cityPlaceholder: 'e.g., Santiago',
        deliveryNotes: 'Delivery Notes',
        deliveryNotesPlaceholder: 'e.g., Blue gate, buzzer 2B, leave with concierge',
        setAsDefault: 'Set as default address',
        setAsDefaultDesc: 'Default address will appear first in the list',
        savedAddresses: 'Saved Delivery Addresses',
        defaultFirst: 'Default address appears first',
        noAddresses: 'No saved delivery addresses',
        noAddressesDesc: 'Add your first delivery address to start receiving deliveries',
        makeDefault: 'Make Default',
        required: 'required'
      },
      
      // Payment Plans
      paymentPlans: {
        title: 'EssentialFlow Subscription Plans',
        subtitle: 'Choose the plan that best fits your automation needs',
        selectPlan: 'Select your Plan',
        selectPlanDesc: 'Carousel from left (basic) to right (premium). All prices include VAT.',
        mostPopular: 'MOST POPULAR',
        perMonth: 'per month',
        before: 'Before:',
        netValue: 'Net value:',
        iva: 'VAT:',
        characteristics: 'Features:',
        subscriptions: 'Subscriptions:',
        unlimited: 'Unlimited',
        upTo: 'Up to',
        freeDeliveryIncluded: 'Free delivery included',
        savesPerMonth: 'Save {{amount}} per month',
        margin: 'Margin:',
        planSelected: 'Plan Selected',
        selectPlanButton: 'Select Plan',
        paymentMethods: 'Payment Methods',
        paymentMethodsDesc: 'Select how you want to pay for your monthly subscription',
        addPaymentMethod: 'Add Payment Method',
        securePayment: 'Secure Payment & Guarantees',
        securePaymentDesc: 'All payments are protected with bank-level encryption. You can cancel your subscription at any time without penalties.',
        ssl256: 'SSL 256-bit encryption',
        pciCompliance: 'PCI DSS compliance',
        noPenaltyCancellation: 'No penalty cancellation',
        satisfactionGuarantee: '30-day satisfaction guarantee',
        costTransparency: 'Cost Transparency',
        costTransparencyDesc: 'At EssentialFlow we believe in total transparency of our business model.',
        howPricingWorks: '💡 How does our pricing work?',
        operationalCosts: '• Each plan includes operational costs (APIs, delivery, processing)',
        marginsImprovement: '• Our margins allow us to continuously improve the service',
        realSavings: '• Savings shown are real compared to individual purchases',
        taxIncluded: '• All prices include VAT (19%) according to Chilean regulations',
        confirmAndProceed: 'Confirm and Proceed to Payment'
      },
      
      // Subscription Builder
      builder: {
        title: 'Automation Builder',
        selectProducts: '1. Select Products',
        selectProductsDesc: 'Tap any product to add or remove it',
        deliveryFrequency: '2. Delivery Frequency',
        scheduleDelivery: '3. Schedule Delivery',
        deliveryAddress: '4. Delivery Address',
        deliveryService: '5. Delivery Service',
        manage: 'Manage',
        quantity: 'Quantity:',
        weekly: 'Weekly',
        biweekly: 'Biweekly',
        monthly: 'Monthly',
        custom: 'Custom',
        everyDays: 'Every {{days}} days',
        daysBetweenDeliveries: 'Days between deliveries',
        firstDelivery: 'First Delivery',
        change: 'Change',
        deliverySchedule: 'Delivery schedule',
        morning: 'Morning',
        midday: 'Midday',
        afternoon: 'Afternoon',
        evening: 'Evening',
        main: 'Main',
        selectDate: 'Select Date',
        selectedDate: 'Selected date:',
        product: 'product',
        products: 'products',
        // Confirmation modal
        confirmCreationTitle: 'Confirm Automation Creation',
        automationCost: 'App usage cost: ${{cost}}',
        chargeExplanation: 'This charge will be applied when the automation starts for the first time.',
        confirmButton: 'Confirm Creation',
        cancelButton: 'Cancel'
      },
      
      // Product Search Modal
      productSearch: {
        title: 'Search Product',
        searchPlaceholder: 'Search products, brands, stores...',
        all: 'All',
        food: 'Food',
        drinks: 'Drinks',
        cleaning: 'Cleaning',
        care: 'Care',
        paper: 'Paper',
        others: 'Others',
        productsFound: '{{count}} products found',
        outOfStock: 'Out of Stock',
        local: 'Local',
        eco: 'Eco',
        premium: 'Premium',
        noProductsFound: 'No products found',
        noProductsFoundDesc: 'Try adjusting filters or search terms'
      },
      
      // Not Found
      notFound: {
        title: 'Oops!',
        message: 'This screen doesn\'t exist.',
        goHome: 'Go to home screen!'
      }
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'es', // idioma por defecto
    fallbackLng: 'es',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;