import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, ArrowRight, Zap, Package, Calendar, MapPin, CreditCard, Clock, ChevronDown, ChevronUp } from 'lucide-react-native';
import { mockProducts } from '@/data/mockData';
import { getShopifyStoreStats } from '@/data/shopifyData';
import ShopifyIntegrationStatus from '@/components/ShopifyIntegrationStatus';
import SubscriptionBuilder from '@/components/SubscriptionBuilder';
import PaymentPlans from '@/components/PaymentPlans';
import AddressManager from '@/components/AddressManager';
import { mockAddresses } from '@/data/mockData';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/LanguageToggle';
import { CurrencyService } from '@/services/currencyService';
import { getStoreByHandle } from '@/lib/supabase';

export default function HomeScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const isMounted = useRef(true);
  const [showSubscriptionBuilder, setShowSubscriptionBuilder] = useState(false);
  const [showPaymentPlans, setShowPaymentPlans] = useState(false);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  const [addresses, setAddresses] = useState(mockAddresses);
  const [shopifyStats, setShopifyStats] = useState<any>(null);
  const [storeData, setStoreData] = useState<any>(null);
  
  const featuredProducts = mockProducts.slice(0, 4);
  const allProducts = mockProducts;
  
  // Función para calcular el tiempo ahorrado mensual
  const calculateTimeSaved = () => {
    const activeSubscriptions = 3; // Número de suscripciones activas
    
    // Tiempo promedio por actividad de compra (en minutos)
    const timePerActivity = {
      planning: 15,        // Planificar qué comprar
      traveling: 25,       // Ir al supermercado/tienda
      shopping: 30,        // Buscar y seleccionar productos
      waiting: 10,         // Hacer fila y pagar
      returning: 25        // Regresar a casa
    };
    
    // Tiempo total por compra individual (en minutos)
    const totalTimePerShopping = Object.values(timePerActivity).reduce((sum, time) => sum + time, 0);
    
    // Considerando que cada suscripción reemplaza aproximadamente 2 compras mensuales
    const shoppingTripsReplaced = activeSubscriptions * 2;
    
    // Tiempo total ahorrado en minutos
    const totalMinutesSaved = totalTimePerShopping * shoppingTripsReplaced;
    
    // Convertir a horas y minutos
    const hoursSaved = Math.floor(totalMinutesSaved / 60);
    const minutesSaved = totalMinutesSaved % 60;
    
    return {
      totalMinutes: totalMinutesSaved,
      hours: hoursSaved,
      minutes: minutesSaved,
      formattedTime: hoursSaved > 0 ? `${hoursSaved}h ${minutesSaved}m` : `${minutesSaved}m`
    };
  };

  const subscriptionStats = {
    activeSubscriptions: 3,
    nextDelivery: '15 Mar',
    timeSaved: calculateTimeSaved(),
    shopifyProducts: allProducts.filter(p => p.store === 'Obrera y Zángano').length
  };

  // Cargar estadísticas de Shopify
  useEffect(() => {
    loadShopifyStats();
    loadStoreData();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadStoreData = async () => {
    try {
      const data = await getStoreByHandle('obrerayzangano');
      if (data && isMounted.current) {
        setStoreData(data);
        console.log('✅ Datos de tienda cargados:', data.name);
      } else if (isMounted.current) {
        Alert.alert('Error', 'No se pudo cargar los datos de la tienda. Por favor, verifica tu conexión a internet y reinicia la app.');
      }
    } catch (error) {
      console.error('Error loading store data:', error);
      if (isMounted.current) {
        Alert.alert('Error de Conexión', 'Hubo un problema al conectar con el servidor. Intenta de nuevo más tarde.');
      }
    }
  };

  const loadShopifyStats = async () => {
    try {
      const stats = await getShopifyStoreStats();
      if (isMounted.current) {
        setShopifyStats(stats);
      }
    } catch (error) {
      console.error('Error loading Shopify stats:', error);
    }
  };

  // Datos detallados para cada tarjeta del resumen
  const subscriptionDetails = {
    active: {
      title: t('home.activePlans'),
      value: subscriptionStats.activeSubscriptions,
      details: [
        { name: 'Café Nescafé Gold + Miel Artesanal', frequency: 'Mensual', nextDelivery: '5 Mar', status: 'activa' },
        { name: 'Kit de Limpieza Completo', frequency: 'Quincenal', nextDelivery: '15 Mar', status: 'activa' },
        { name: 'Productos Especializados', frequency: 'Personalizada (45 días)', nextDelivery: '20 Mar', status: 'pausada' }
      ],
      icon: Package,
      color: '#D4AF37'
    },
    delivery: {
      title: t('home.nextDelivery'),
      value: subscriptionStats.nextDelivery,
      details: [
        { product: 'Café Nescafé Gold (2x)', store: 'Jumbo', time: '9:00-12:00', address: 'Casa' },
        { product: 'Miel Artesanal (1x)', store: 'Apiario del Sur', time: '9:00-12:00', address: 'Casa' }
      ],
      icon: Calendar,
      color: '#D4AF37',
      subtitle: t('home.inDays', { count: 2 })
    },
    timeSaved: {
      title: t('home.timeSaved'),
      value: subscriptionStats.timeSaved.formattedTime,
      details: [
        { activity: 'Planificación de compras', time: '15m', description: 'Decidir qué comprar, hacer listas' },
        { activity: 'Traslados (ida y vuelta)', time: '50m', description: 'Tiempo de viaje a tiendas' },
        { activity: 'Búsqueda de productos', time: '30m', description: 'Encontrar productos en tiendas' },
        { activity: 'Esperas y filas', time: '10m', description: 'Tiempo en cajas y pagos' }
      ],
      icon: Clock,
      color: '#D4AF37',
      subtitle: t('home.monthly'),
      totalSavings: `${subscriptionStats.timeSaved.totalMinutes} minutos ahorrados por mes`
    }
  };

  const toggleCard = (cardKey: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const handleCreateSubscription = () => {
    setShowSubscriptionBuilder(true);
  };

  const handleSubscriptionCreated = (newSubscriptionData: any) => {
    // Here you would typically save the subscription to your state management
    // For now, we'll just close the builder and show a success message
    setShowSubscriptionBuilder(false);
    
    // You could add a success toast or navigation to subscriptions tab here
    console.log('Nueva suscripción creada:', newSubscriptionData);
  };

  const handleExploreCatalog = () => {
    // Navigate to products tab (catalog)
    router.push('/(tabs)/products');
  };

  const handleManageAddresses = () => {
    setShowAddressManager(true);
  };

  const handlePaymentMethods = () => {
    router.push('/wallet');
  };

  const handleUpgradePlan = () => {
    setShowPaymentPlans(true);
  };

  const handleAddressesChange = (newAddresses: any) => {
    setAddresses(newAddresses);
  };

  const renderExpandableCard = (cardKey: string, cardData: any) => {
    const isExpanded = expandedCards[cardKey];
    const IconComponent = cardData.icon;

    return (
      <TouchableOpacity 
        key={cardKey}
        style={[styles.statCard, isExpanded && styles.statCardExpanded]}
        onPress={() => toggleCard(cardKey)}
        activeOpacity={0.8}
      >
        <View style={styles.statCardHeader}>
          <View style={styles.statCardMain}>
            {cardKey === 'timeSaved' ? (
              <View style={styles.timeSavedHeader}>
                <IconComponent size={16} color={cardData.color} strokeWidth={2} />
                <Text style={styles.statNumber}>{cardData.value}</Text>
              </View>
            ) : (
              <Text style={styles.statNumber}>{cardData.value}</Text>
            )}
            <Text style={styles.statLabel}>{cardData.title}</Text>
            {cardData.subtitle && (
              <Text style={styles.statSubtext}>{cardData.subtitle}</Text>
            )}
          </View>
          
          <View style={styles.expandIcon}>
            {isExpanded ? (
              <ChevronUp size={16} color="#666666" strokeWidth={2} />
            ) : (
              <ChevronDown size={16} color="#666666" strokeWidth={2} />
            )}
          </View>
        </View>

        {isExpanded && (
          <View style={styles.statCardDetails}>
            <View style={styles.detailsDivider} />
            
            {cardKey === 'active' && (
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>Suscripciones:</Text>
                {cardData.details.map((sub: any, index: number) => (
                  <View key={index} style={styles.subscriptionDetailItem}>
                    <View style={styles.subscriptionDetailHeader}>
                      <Text style={styles.subscriptionDetailName}>{sub.name}</Text>
                      <View style={[
                        styles.subscriptionStatus,
                        { backgroundColor: sub.status === 'activa' ? '#10B981' : '#F59E0B' }
                      ]}>
                        <Text style={styles.subscriptionStatusText}>
                          {sub.status === 'activa' ? 'Activa' : 'Pausada'}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.subscriptionDetailInfo}>
                      {sub.frequency} • Próxima: {sub.nextDelivery}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {cardKey === 'delivery' && (
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>Productos a entregar:</Text>
                {cardData.details.map((item: any, index: number) => (
                  <View key={index} style={styles.deliveryDetailItem}>
                    <View style={styles.deliveryDetailHeader}>
                      <Text style={styles.deliveryDetailProduct}>{item.product}</Text>
                      <Text style={styles.deliveryDetailStore}>{item.store}</Text>
                    </View>
                    <Text style={styles.deliveryDetailInfo}>
                      📍 {item.address} • 🕐 {item.time}
                    </Text>
                  </View>
                ))}
                <View style={styles.deliveryNote}>
                  <Text style={styles.deliveryNoteText}>
                    💡 Recibirás una notificación 1 hora antes de la entrega
                  </Text>
                </View>
              </View>
            )}

            {cardKey === 'timeSaved' && (
              <View style={styles.detailsContent}>
                <Text style={styles.detailsTitle}>Desglose del tiempo ahorrado:</Text>
                {cardData.details.map((activity: any, index: number) => (
                  <View key={index} style={styles.timeDetailItem}>
                    <View style={styles.timeDetailHeader}>
                      <Text style={styles.timeDetailActivity}>{activity.activity}</Text>
                      <Text style={styles.timeDetailTime}>{activity.time}</Text>
                    </View>
                    <Text style={styles.timeDetailDescription}>{activity.description}</Text>
                  </View>
                ))}
                <View style={styles.timeSummary}>
                  <Text style={styles.timeSummaryText}>
                    ⚡ {cardData.totalSavings}
                  </Text>
                  <Text style={styles.timeSummarySubtext}>
                    Equivale a ~105 minutos por cada compra automatizada
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Section */}
      <LinearGradient
        colors={['#000022', '#000044', '#000022']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          {/* Language Toggle */}
          <View style={styles.languageToggleContainer}>
            <LanguageToggle />
          </View>
          
          <Text style={styles.heroTitle}>EssencialFlow</Text>
          <Text style={styles.heroSubtitle}>
            {t('home.subtitle')}
          </Text>
          <TouchableOpacity style={styles.ctaButton} onPress={handleCreateSubscription}>
            <Zap size={20} color="#000000" strokeWidth={2} />
            <Text style={styles.ctaButtonText}>{t('home.cta')}</Text>
            <ArrowRight size={20} color="#000000" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        <View style={styles.heroImageContainer}>
          <Image
            source={require('../../assets/images/cosmic_nebula.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.heroImageOverlay} />
        </View>
      </LinearGradient>

      {/* Shopify Integration Status */}
      <ShopifyIntegrationStatus onRefresh={loadShopifyStats} />

      {/* Subscription Overview */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>{t('home.subscriptionSummary')}</Text>
        <Text style={styles.sectionSubtitle}>{t('home.subscriptionSummarySubtitle')}</Text>
        
        <View style={styles.statsGrid}>
          {renderExpandableCard('active', subscriptionDetails.active)}
          {renderExpandableCard('delivery', subscriptionDetails.delivery)}
          {renderExpandableCard('timeSaved', subscriptionDetails.timeSaved)}
        </View>
      </View>

      {/* Featured Products Carousel */}
      <View style={styles.featuredSection}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>{t('home.featuredProducts')}</Text>
            {shopifyStats && (
              <View style={styles.liveIndicator}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>
                  {shopifyStats.totalProducts} productos en vivo
                </Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.seeAllButton} onPress={handleExploreCatalog}>
            <Text style={styles.seeAllText}>{t('home.seeStores')}</Text>
            <ArrowRight size={16} color="#D4AF37" strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.productsScrollView}
          contentContainerStyle={styles.productsScrollContent}
        >
          {featuredProducts.map((product) => (
            <TouchableOpacity key={product.id} style={styles.productCard}>
              <View style={styles.productImageContainer}>
                <Image source={{ uri: product.image }} style={styles.productImage} />
                <View style={styles.originBadge}>
                  <Text style={styles.originText}>{product.origin}</Text>
                </View>
                <View style={styles.storeBadge}>
                  <Text style={styles.storeText}>{product.store}</Text>
                </View>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={styles.productDescription} numberOfLines={2}>
                  {product.description.length > 80 ? product.description.substring(0, 80) + '...' : product.description}
                </Text>
                <View style={styles.productFooter}>
                  <Text style={styles.productPrice}>{CurrencyService.formatProductPrice(product.price)}</Text>
                  <TouchableOpacity style={styles.addButton}>
                    <Plus size={16} color="#000000" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Subscription Plans */}
      <View style={styles.plansSection}>
        <Text style={styles.sectionTitle}>Niveles de EssencialFlow </Text>
        <Text style={styles.plansSubtitle}>Nuestros Planes</Text>
        
        <View style={styles.plansContainer}>
          {/* Esencial Flow - Free Plan */}
          <View style={styles.freePlanCard}>
            <View style={styles.freePlanHeader}>
              <Text style={styles.freePlanName}>EssencialFlow Básico</Text>
              <Text style={styles.freePlanPrice}>Gratis</Text>
              <Text style={styles.freePlanSubtitle}>Hasta 12 automatizaciones gratis</Text>
            </View>
            
            <View style={styles.freePlanFeatures}>
              <Text style={styles.freePlanFeature}>• Nuestro plan gratuito </Text>
              <Text style={styles.freePlanFeature}>• Viajes estándar (costo adicional)</Text>
            </View>
            
            <TouchableOpacity style={styles.currentPlanButton}>
              <Text style={styles.currentPlanButtonText}>Tu Nivel Actual</Text>
            </TouchableOpacity>
          </View>

          {/* Súper Esencial Flow - Premium Plan */}
          <View style={styles.premiumPlanCard}>
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>⭐ MÁS EFICIENTE</Text>
            </View>
            
            <View style={styles.premiumPlanHeader}>
              <Text style={styles.premiumPlanName}>Súper EssencialFlow </Text>
              <Text style={styles.premiumPlanPrice}>{CurrencyService.formatCLPSimple(9990)}</Text>
              <Text style={styles.premiumPlanPeriod}>al mes</Text>
            </View>
            
            <View style={styles.premiumPlanFeatures}>
              <Text style={styles.premiumPlanFeature}>• Automatizaciones infinitas</Text>
              <Text style={styles.premiumPlanFeature}>• Viajes gratis</Text>
            </View>
            
            <TouchableOpacity style={styles.upgradePlanButton} onPress={handleUpgradePlan}>
              <Text style={styles.upgradePlanButtonText}>Mejorar a Súper EssencialFlow</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Cost per automation note */}
        <View style={styles.costNote}>
          <Text style={styles.costNoteText}>
            💡 En el núcleo base, cada flujo adicional cuesta {CurrencyService.formatCLPSimple(300)}
          </Text>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsSection}>
        <Text style={styles.sectionTitle}>{t('home.quickActions')}</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity style={styles.actionCard} onPress={handleExploreCatalog}>
            <Package size={24} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.actionTitle}>{t('home.exploreCatalog')}</Text>
            <Text style={styles.actionDescription}>{t('home.exploreCatalogDesc')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleCreateSubscription}>
            <Calendar size={24} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.actionTitle}>{t('Constructor de Automatizaciones')}</Text>
            <Text style={styles.actionDescription}>{t('Crea tus propias automatizaciones')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handleManageAddresses}>
            <MapPin size={24} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.actionTitle}>{t('home.manageAddresses')}</Text>
            <Text style={styles.actionDescription}>{t('home.manageAddressesDesc')}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionCard} onPress={handlePaymentMethods}>
            <CreditCard size={24} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.actionTitle}>{t('home.paymentMethods')}</Text>
            <Text style={styles.actionDescription}>{t('home.paymentMethodsDesc')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Subscription Builder Modal */}
      <Modal
        visible={showSubscriptionBuilder}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SubscriptionBuilder
          products={mockProducts}
          onSubscriptionCreate={handleSubscriptionCreated}
          onClose={() => setShowSubscriptionBuilder(false)}
        />
      </Modal>

      {/* Payment Plans Modal */}
      <Modal
        visible={showPaymentPlans}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PaymentPlans
          onPlanSelect={(plan) => {
            console.log('Plan seleccionado:', plan);
            setShowPaymentPlans(false);
          }}
          onClose={() => setShowPaymentPlans(false)}
        />
      </Modal>

      {/* Address Manager Modal */}
      <Modal
        visible={showAddressManager}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <AddressManager
          addresses={addresses}
          onAddressesChange={handleAddressesChange}
          onClose={() => setShowAddressManager(false)}
        />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginRight: 12,
  },
  heroSection: {
    height: 450,
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: 80,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: -60,
    right: 0,
    zIndex: 3,
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 52,
    fontWeight: 'bold',
    color: '#FFFFFF',
    lineHeight: 56,
    marginBottom: 16,
    letterSpacing: -1,
    textShadowColor: 'rgba(0, 191, 255, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  heroSubtitle: {
    fontSize: 18,
    color: '#B8B8B8',
    lineHeight: 26,
    marginBottom: 40,
    fontWeight: '400',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 16,
    alignSelf: 'flex-start',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ctaButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000000',
    marginHorizontal: 10,
    letterSpacing: -0.3,
  },
  heroImageContainer: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    opacity: 0.7,
  },
  heroImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  statsSection: {
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#808080',
    marginBottom: 24,
    fontWeight: '500',
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  statCardExpanded: {
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.4,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardMain: {
    flex: 1,
  },
  timeSavedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
    marginLeft: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'left',
  },
  statSubtext: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'left',
    marginTop: 2,
  },
  expandIcon: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
  },
  statCardDetails: {
    marginTop: 16,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginBottom: 16,
  },
  detailsContent: {
    gap: 12,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  // Subscription Details Styles
  subscriptionDetailItem: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  subscriptionDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  subscriptionDetailName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  subscriptionStatus: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  subscriptionStatusText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subscriptionDetailInfo: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  // Delivery Details Styles
  deliveryDetailItem: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  deliveryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  deliveryDetailProduct: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  deliveryDetailStore: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
  deliveryDetailInfo: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  deliveryNote: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 8,
  },
  deliveryNoteText: {
    fontSize: 12,
    color: '#D4AF37',
    textAlign: 'center',
  },
  // Time Details Styles
  timeDetailItem: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timeDetailActivity: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  timeDetailTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  timeDetailDescription: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  timeSummary: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 8,
    alignItems: 'center',
  },
  timeSummaryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  timeSummarySubtext: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  featuredSection: {
    paddingVertical: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flex: 1,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '500',
  },
  seeAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 16,
    color: '#D4AF37',
    marginRight: 4,
  },
  productsScrollView: {
    paddingLeft: 24,
  },
  productsScrollContent: {
    paddingRight: 24,
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginRight: 16,
    width: 280,
    borderWidth: 1,
    borderColor: '#333333',
  },
  productImageContainer: {
    position: 'relative',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  originBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 6,
  },
  originText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  storeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  storeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  productInfo: {
    padding: 20,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plansSection: {
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  plansSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 24,
  },
  plansContainer: {
    gap: 20,
  },
  // Free Plan Styles
  freePlanCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  freePlanHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  freePlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  freePlanPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  freePlanSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  freePlanFeatures: {
    marginBottom: 20,
  },
  freePlanFeature: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    lineHeight: 20,
  },
  currentPlanButton: {
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  currentPlanButtonText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  // Premium Plan Styles
  premiumPlanCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    borderColor: '#D4AF37',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 24,
    right: 24,
    backgroundColor: '#D4AF37',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  popularText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  premiumPlanHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  premiumPlanName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  premiumPlanPrice: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  premiumPlanPeriod: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  premiumPlanFeatures: {
    marginBottom: 20,
  },
  premiumPlanFeature: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    lineHeight: 20,
  },
  upgradePlanButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  upgradePlanButtonText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
  costNote: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  costNoteText: {
    fontSize: 14,
    color: '#D4AF37',
    textAlign: 'center',
    lineHeight: 20,
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    width: '48%',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 12,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
});