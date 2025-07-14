import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Image, FlatList, Alert, Animated, Dimensions } from 'react-native';
import { Plus, Minus, Calendar, Package, Clock, MapPin, Truck, ChevronDown, X, ChevronLeft, ChevronRight, Search, Zap, Sparkles, Crown, Info, CreditCard, Check } from 'lucide-react-native';
import { Product, Address, DeliveryService } from '@/types';
import { mockAddresses, mockDeliveryServices } from '@/data/mockData';
import { CurrencyService } from '@/services/currencyService';
import PremiumProductCard from './PremiumProductCard';
import AddressManager from './AddressManager';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';
import { PanGestureHandler, GestureHandlerStateChangeEvent, PanGestureHandlerEventPayload, State } from 'react-native-gesture-handler';

interface SubscriptionBuilderProps {
  mode: 'exploratory' | 'personalized'; // Modo contextual disruptivo
  products: Product[];
  onSubscriptionCreate: (subscription: any) => void;
  onClose: () => void;
  initialSelectedProducts?: {[key: number]: { quantity: number }};
  initialProducts?: Product[]; // Para pre-cargar desde catálogo
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isAvailable: boolean;
}

interface NaturalFrequency {
  id: string;
  name: string;
  description: string;
  isPremium: boolean;
  enabled: boolean;
}

interface PaymentMethod {
  id: number;
  type: 'credit' | 'debit' | 'webpay' | 'mercadopago';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  isDefault: boolean;
  last4: string;
}

interface NewCard {
  type: 'credit' | 'debit' | 'webpay' | 'mercadopago';
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  holderName: string;
  isDefault: boolean;
}

export default function SubscriptionBuilder({ 
  mode, 
  products, 
  onSubscriptionCreate, 
  onClose, 
  initialSelectedProducts,
  initialProducts = []
}: SubscriptionBuilderProps) {
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [frequency, setFrequency] = useState<'semanal' | 'quincenal' | 'mensual' | 'personalizada'>('mensual');
  const [deliveryTime, setDeliveryTime] = useState('9:00-12:00');
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [selectedAddress, setSelectedAddress] = useState<Address>(mockAddresses[0]);
  const [selectedDeliveryService, setSelectedDeliveryService] = useState<DeliveryService>(mockDeliveryServices[0]);
  const [customFrequency, setCustomFrequency] = useState(30);
  const [previewFrequency, setPreviewFrequency] = useState(customFrequency);
  const [showAddressManager, setShowAddressManager] = useState(false);
  
  // Estados para el Núcleo Constructor
  const [searchQuery, setSearchQuery] = useState('');
  const [currentMode, setCurrentMode] = useState(mode);
  const [preloadedProducts, setPreloadedProducts] = useState<Product[]>(initialProducts);
  const [isPremiumUser, setIsPremiumUser] = useState(false); // Para upsell
  const [showPremiumUpsell, setShowPremiumUpsell] = useState(false);
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Estados avanzados para trascendencia
  const [advancedOptions, setAdvancedOptions] = useState({ 
    notifications: true, 
    budgetLimit: 0, 
    autoPause: false,
    existentialMode: false // Modo trascendental
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedSavings, setEstimatedSavings] = useState(0);
  
  // Frecuencias Naturales disruptivas
  const [naturalFrequencies, setNaturalFrequencies] = useState<NaturalFrequency[]>([
    {
      id: 'stockAlert',
      name: 'Alerta de Stock',
      description: 'Detecta cuando los productos esenciales están por agotarse',
      isPremium: true,
      enabled: false
    },
    {
      id: 'priceDrop',
      name: 'Caída de Precios',
      description: 'Activa compras automáticas cuando los precios bajan',
      isPremium: true,
      enabled: false
    },
    {
      id: 'weatherEvent',
      name: 'Eventos Climáticos',
      description: 'Adapta entregas según condiciones meteorológicas',
      isPremium: true,
      enabled: false
    },
    {
      id: 'consumptionPattern',
      name: 'Patrones de Consumo',
      description: 'Detecta aceleraciones en tu esencia vital',
      isPremium: true,
      enabled: false
    },
    {
      id: 'healthTrigger',
      name: 'Triggers de Salud',
      description: 'Sincroniza con tu bienestar regenerativo',
      isPremium: true,
      enabled: false
    },
    {
      id: 'socialEvent',
      name: 'Eventos Sociales',
      description: 'Anticipa necesidades para encuentros trascendentales',
      isPremium: true,
      enabled: false
    }
  ]);
  const [showNaturalFrequencies, setShowNaturalFrequencies] = useState(false);
  const [showCustomFrequencyWheel, setShowCustomFrequencyWheel] = useState(false);

  // Categorías para modo exploratorio
  const productCategories = [
    { id: 'cafe', name: 'Café Regenerativo', icon: '☕' },
    { id: 'higiene', name: 'Higiene Sostenible', icon: '🧴' },
    { id: 'alimentos', name: 'Alimentos Esenciales', icon: '🥗' },
    { id: 'limpieza', name: 'Limpieza Consciente', icon: '🧽' },
    { id: 'bienestar', name: 'Bienestar Trascendental', icon: '🧘' }
  ];

  // Estados para Billetera
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { 
      id: 1, 
      type: 'credit', 
      cardNumber: '4532 1234 5678 9012',
      expiryDate: '12/26',
      holderName: 'María González',
      isDefault: true,
      last4: '9012'
    },
    { 
      id: 2, 
      type: 'webpay', 
      cardNumber: '5678 9012 3456 7890',
      expiryDate: '08/25',
      holderName: 'María González',
      isDefault: false,
      last4: '7890'
    },
    { 
      id: 3, 
      type: 'mercadopago', 
      cardNumber: '1234 5678 9012 3456',
      expiryDate: '03/27',
      holderName: 'María González',
      isDefault: false,
      last4: '3456'
    }
  ]);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(paymentMethods.find(m => m.isDefault)?.id || null);
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [newCard, setNewCard] = useState<NewCard>({ 
    type: 'credit', 
    cardNumber: '', 
    expiryDate: '', 
    cvv: '', 
    holderName: '', 
    isDefault: false 
  });

  // Update selectedProducts when initialSelectedProducts changes
  useEffect(() => {
    if (initialSelectedProducts && Object.keys(initialSelectedProducts).length > 0) {
      const firstId = Object.keys(initialSelectedProducts)[0];
      setSelectedProductId(parseInt(firstId));
    }
  }, [initialSelectedProducts]);

  // Inicializar productos pre-cargados
  useEffect(() => {
    if (initialProducts.length > 0) {
      setSelectedProductId(initialProducts[0].id);
    }
  }, [initialProducts]);

  // Función para calcular ahorros estimados
  useEffect(() => {
    const total = getTotalCost();
    const savings = total * 0.15; // 15% ahorro estimado por suscripción
    setEstimatedSavings(savings);
  }, [selectedProductId]);

  // Función para filtrar productos por búsqueda
  const filterProductsByQuery = (products: Product[], query: string): Product[] => {
    if (!query.trim()) return products;
    
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Función para cambiar a modo exploratorio
  const setModeToExploratory = () => {
    setCurrentMode('exploratory');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  // Función para manejar triggers premium
  const handlePremiumTrigger = (triggerId: string) => {
    if (!isPremiumUser) {
      setShowPremiumUpsell(true);
      return;
    }
    
    setNaturalFrequencies(prev => 
      prev.map(freq => 
        freq.id === triggerId 
          ? { ...freq, enabled: !freq.enabled }
          : freq
      )
    );
  };

  // Función para mostrar upsell premium
  const showPremiumUpsellModal = () => {
    Alert.alert(
      '🌟 Trasciende lo Predecible',
      'Desbloquea Frecuencias Naturales y triggers inteligentes para romper ciclos consumistas.\n\n✨ BENEFICIOS PREMIUM:\n• Frecuencias Naturales\n• Triggers Inteligentes\n• Modo Infinito\n• Analytics Trascendentales\n\n💎 Solo $4.990/mes',
      [
        { text: 'Más Tarde', style: 'cancel' },
        { 
          text: 'Suscribirse Ahora', 
          onPress: () => {
            setIsPremiumUser(true);
            setShowPremiumUpsell(false);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        }
      ]
    );
  };

  const frequencies = [
    { value: 'semanal', label: 'Semanal', days: 7 },
    { value: 'quincenal', label: 'Quincenal', days: 14 },
    { value: 'mensual', label: 'Mensual', days: 30 },
    { value: 'personalizada', label: 'Personalizada', days: 0 }
  ];

  const timeSlots = [
    { value: '9:00-12:00', label: 'Mañana', icon: '🌅' },
    { value: '12:00-15:00', label: 'Mediodía', icon: '☀️' },
    { value: '15:00-18:00', label: 'Tarde', icon: '🌤️' },
    { value: '18:00-21:00', label: 'Noche', icon: '🌙' }
  ];

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const generateCalendarDays = (month: Date): CalendarDay[] => {
    const year = month.getFullYear();
    const monthIndex = month.getMonth();
    const firstDay = new Date(year, monthIndex, 1);
    const lastDay = new Date(year, monthIndex + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const isCurrentMonth = currentDate.getMonth() === monthIndex;
      const isToday = currentDate.toDateString() === today.toDateString();
      const isSelected = currentDate.toDateString() === selectedDate.toDateString();
      const isAvailable = currentDate >= today;
      
      days.push({
        date: new Date(currentDate),
        day: currentDate.getDate(),
        isCurrentMonth,
        isSelected,
        isToday,
        isAvailable
      });
    }
    
    return days;
  };

  const handleDateSelect = (date: Date) => {
    if (date >= new Date()) {
      setSelectedDate(date);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentCalendarMonth(newMonth);
    Haptics.selectionAsync();
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentCalendarMonth(newMonth);
    Haptics.selectionAsync();
  };

  const toggleProduct = (productId: number) => {
    setSelectedProductId(prev => prev === productId ? null : productId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const getTotalCost = () => {
    if (!selectedProductId) return 0;
    const product = products.find(p => p.id === selectedProductId);
    return product ? product.price : 0;
  };

  const getSelectedProductsCount = () => {
    return selectedProductId ? 1 : 0;
  };

  const handleCreateSubscription = async () => {
    if (!selectedProductId) return; // Prevent creation without product
    
    // Si se selecciona Rappi, usar la integración automática
    if (selectedDeliveryService.id === 'rappi') {
      try {
        // Preparar datos para la Edge Function
        const orderData = {
          user_id: 'user-123', // Reemplazar con ID real del usuario
          subscription_id: `flow-${Date.now()}`,
          products: [
            {
              product_id: selectedProductId.toString(),
              quantity: 1,
              name: products.find(p => p.id === selectedProductId)?.name || '',
              price: products.find(p => p.id === selectedProductId)?.price || 0
            }
          ],
          delivery_address: selectedAddress.address,
          delivery_time: deliveryTime
        };

        // Llamar a la Edge Function de Rappi
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(
          process.env.EXPO_PUBLIC_SUPABASE_URL || '',
          process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || ''
        );

        const { data, error } = await supabase.functions.invoke('create-rappi-order', {
          body: orderData
        });

        if (error) {
          console.error('Error al crear orden con Rappi:', error);
          Alert.alert(
            '⚠️ Error en Integración',
            'No se pudo procesar la orden con Rappi. Intenta con otro servicio de entrega.',
            [{ text: 'Entendido' }]
          );
          return;
        }

        // Mostrar confirmación de éxito
        Alert.alert(
          '🎉 Orden Procesada con Rappi',
          `Tu orden ha sido creada exitosamente.\n\n📦 Detalles:\n• Orden ID: ${data.order_id}\n• Tiempo estimado: ${data.estimated_delivery}\n• Total: $${data.total_value?.toLocaleString('es-CL')}\n\n✅ La integración ética está funcionando perfectamente.`,
          [
            {
              text: 'Perfecto',
              onPress: () => {
                // Crear suscripción normal también
                const subscription = {
                  products: { [selectedProductId]: { quantity: 1 } },
                  frequency,
                  selectedDate,
                  deliveryTime,
                  address: selectedAddress,
                  deliveryService: selectedDeliveryService,
                  totalCost: getTotalCost(),
                  customFrequency: frequency === 'personalizada' ? customFrequency : null,
                  naturalFrequencies: naturalFrequencies.filter(f => f.enabled),
                  mode: currentMode,
                  isPremium: isPremiumUser,
                  rappiOrderId: data.order_id
                };
                
                onSubscriptionCreate(subscription);
              }
            }
          ]
        );
      } catch (error) {
        console.error('Error crítico con Rappi:', error);
        Alert.alert(
          '💥 Error Crítico',
          'Se produjo un error inesperado con la integración Rappi. Intenta con otro servicio de entrega.',
          [{ text: 'Entendido' }]
        );
      }
    } else {
      // Proceso normal para otros servicios de entrega
      const subscription = {
        products: { [selectedProductId]: { quantity: 1 } },
        frequency,
        selectedDate,
        deliveryTime,
        address: selectedAddress,
        deliveryService: selectedDeliveryService,
        totalCost: getTotalCost(),
        customFrequency: frequency === 'personalizada' ? customFrequency : null,
        naturalFrequencies: naturalFrequencies.filter(f => f.enabled),
        mode: currentMode,
        isPremium: isPremiumUser
      };
      
      onSubscriptionCreate(subscription);
    }
  };

  const handleAddressesChange = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    // Si la dirección seleccionada fue eliminada, seleccionar la primera disponible
    if (!newAddresses.find(addr => addr.id === selectedAddress.id) && newAddresses.length > 0) {
      setSelectedAddress(newAddresses[0]);
    }
  };

  const calendarDays = generateCalendarDays(currentCalendarMonth);

  // Renderizado de la Sección 1: Productos (Evolucionada)
  const renderProductSection = () => {
    if (selectedProductId) {
      const product = products.find(p => p.id === selectedProductId);
      if (!product) return null;
      return (
        <Animatable.View 
          animation="bounceIn" 
          duration={800}
          style={[styles.selectedProductCard, { borderColor: '#D4AF37', borderWidth: 2, backgroundColor: 'rgba(212, 175, 55, 0.1)' }]}
        >
          <TouchableOpacity onPress={() => toggleProduct(product.id)} style={{ flex: 1 }}>
            <Image 
              source={{ uri: product.image || 'https://via.placeholder.com/60' }} 
              style={styles.selectedProductImage} 
            />
            <View style={styles.selectedProductInfo}>
              <Text style={styles.selectedProductName}>{product.name}</Text>
              <Text style={styles.selectedProductDesc}>{product.description}</Text>
              <Text style={styles.selectedProductPrice}>${product.price.toLocaleString('es-CL')}</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>
      );
    } else {
      const filteredProducts = filterProductsByQuery(products, searchQuery);
      return (
        <Animatable.View animation="fadeIn" style={styles.exploratorySection}>
          <View style={styles.searchContainer}>
            <Search size={20} color="#666666" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Busca productos para automatizar..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#666666"
            />
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
          >
            {productCategories.map(category => (
              <TouchableOpacity key={category.id} style={styles.categoryChip}>
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <ScrollView
            style={styles.productsList}
            showsVerticalScrollIndicator={false}
          >
            {filteredProducts.map((item) => (
              <PremiumProductCard
                key={item.id.toString()}
                product={item}
                onPress={() => toggleProduct(item.id)}
                selected={selectedProductId === item.id}
                variant="compact"
              />
            ))}
          </ScrollView>
        </Animatable.View>
      );
    }
  };

  const [calendarTranslateY] = useState(new Animated.Value(0));
  const calendarRef = useRef(null);

  useEffect(() => {
    if (showCalendar) {
      calendarTranslateY.setValue(0);
    }
  }, [showCalendar]);

  const onGestureEvent = Animated.event(
    [{ nativeEvent: { translationY: calendarTranslateY } }],
    { useNativeDriver: true }
  );

  const onHandlerStateChange = (event: GestureHandlerStateChangeEvent) => {
    const { nativeEvent } = event;
    if (nativeEvent.state === State.END) {
      if ((nativeEvent as any).translationY > 50) {
        Animated.timing(calendarTranslateY, {
          toValue: Dimensions.get('window').height,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setShowCalendar(false));
      } else {
        Animated.spring(calendarTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }).start();
      }
    }
  };

  const getPaymentTypeIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit': return '💳';
      case 'debit': return '🏧';
      case 'webpay': return '🇨🇱';
      case 'mercadopago': return '💰';
      default: return '💳';
    }
  };

  const getPaymentTypeName = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit': return 'Tarjeta de Crédito';
      case 'debit': return 'Tarjeta de Débito';
      case 'webpay': return 'WebPay';
      case 'mercadopago': return 'Mercado Pago';
      default: return 'Tarjeta';
    }
  };

  const handleSavePayment = () => {
    if (!newCard.cardNumber.trim() || !newCard.expiryDate.trim() || 
        !newCard.cvv.trim() || !newCard.holderName.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const newPayment: PaymentMethod = {
      id: Date.now(),
      type: newCard.type,
      cardNumber: newCard.cardNumber,
      expiryDate: newCard.expiryDate,
      holderName: newCard.holderName,
      isDefault: newCard.isDefault,
      last4: newCard.cardNumber.slice(-4)
    };

    if (newCard.isDefault) {
      setPaymentMethods(prev => prev.map(pm => ({ ...pm, isDefault: false })));
    }
    setPaymentMethods(prev => [...prev, newPayment]);
    setSelectedPaymentId(newPayment.id);
    setShowAddCardModal(false);
    setNewCard({ type: 'credit', cardNumber: '', expiryDate: '', cvv: '', holderName: '', isDefault: false });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Éxito', 'Método de pago agregado');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Constructor de Automatizaciones</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#CCCCCC" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Sección 1: Selecciona un producto (Evolucionada) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecciona un producto</Text>
          <Text style={styles.sectionSubtitle}>
            {currentMode === 'personalized' 
              ? 'Elige lo esencial para trascender lo efímero'
              : 'Elige el esencial que trascenderá lo efímero. Toca cualquier producto para agregarlo o quitarlo.'
            }
          </Text>
          {renderProductSection()}
        </View>

        {/* Sección 2: Frecuencia de Entrega (Mejorada) */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Ritmo de tu Esencia</Text>
          <Text style={styles.sectionSubtitle}>
            Personaliza la frecuencia de tus entregas para un flujo perfecto
          </Text>
          
          <View style={styles.frequencyContainer}>
            {frequencies.map((freq) => (
              <Animatable.View
                key={freq.value}
                animation={frequency === freq.value ? "pulse" : undefined}
                duration={300}
              >
                <TouchableOpacity
                  style={[
                    styles.frequencyOption,
                    frequency === freq.value && styles.frequencyOptionSelected
                  ]}
                  onPress={() => {
                    setFrequency(freq.value as any);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  }}
                  accessibilityLabel={`Frecuencia ${freq.label}`}
                >
                  <Text style={[
                    styles.frequencyLabel,
                    frequency === freq.value && styles.frequencyLabelSelected
                  ]}>
                    {freq.label}
                  </Text>
                  <Text style={[
                    styles.frequencyDays,
                    frequency === freq.value && styles.frequencyDaysSelected
                  ]}>
                    {freq.days > 0 ? `Cada ${freq.days} días` : 'Define tu ritmo'}
                  </Text>
                </TouchableOpacity>
              </Animatable.View>
            ))}
          </View>

          {/* Frecuencias Naturales Premium - Solo para usuarios premium */}
          {isPremiumUser && (
            <>
              <TouchableOpacity 
                style={styles.naturalFrequenciesButton}
                onPress={() => setShowNaturalFrequencies(!showNaturalFrequencies)}
              >
                <Sparkles size={20} color="#D4AF37" strokeWidth={2} />
                <Text style={styles.naturalFrequenciesText}>🌟 Frecuencias Naturales Inteligentes</Text>
                <View style={styles.premiumBadge}>
                  <Crown size={12} color="#D4AF37" strokeWidth={2} />
                  <Text style={styles.premiumBadgeText}>PREMIUM</Text>
                </View>
              </TouchableOpacity>

              {showNaturalFrequencies && (
                <Animatable.View animation="slideInDown" style={styles.naturalFrequenciesContainer}>
                  <View style={styles.naturalFrequenciesHeader}>
                    <Text style={styles.naturalFrequenciesMainTitle}>🚀 Triggers Inteligentes</Text>
                    <Text style={styles.naturalFrequenciesMainSubtitle}>
                      Desbloquea automatizaciones que se activan por eventos naturales
                    </Text>
                  </View>
                  
                  {naturalFrequencies.map((freq) => (
                    <TouchableOpacity
                      key={freq.id}
                      style={[
                        styles.naturalFrequencyOption,
                        freq.enabled && styles.naturalFrequencyOptionActive
                      ]}
                      onPress={() => handlePremiumTrigger(freq.id)}
                    >
                      <View style={styles.naturalFrequencyHeader}>
                        <Text style={styles.naturalFrequencyName}>{freq.name}</Text>
                        <Crown size={14} color="#D4AF37" strokeWidth={2} />
                      </View>
                      <Text style={styles.naturalFrequencyDesc}>{freq.description}</Text>
                      <View style={[
                        styles.naturalFrequencyToggle,
                        freq.enabled && styles.naturalFrequencyToggleActive
                      ]}>
                        <View style={[
                          styles.toggleThumb,
                          freq.enabled && styles.toggleThumbActive
                        ]} />
                      </View>
                    </TouchableOpacity>
                  ))}
                </Animatable.View>
              )}
            </>
          )}



          {frequency === 'personalizada' && (
            <Animatable.View animation="fadeIn" style={styles.customFrequencyInputContainer}>
              <Text style={styles.customFrequencyLabel}>Días entre entregas:</Text>
              <TouchableOpacity 
                style={styles.customFrequencySelector}
                onPress={() => setShowCustomFrequencyWheel(true)}
              >
                <Text style={styles.customFrequencyDisplay}>{customFrequency} día{customFrequency !== 1 ? 's' : ''}</Text>
                <ChevronRight size={16} color="#666666" strokeWidth={2} />
              </TouchableOpacity>
            </Animatable.View>
          )}
        </View>

        {/* Sección 3: Programar Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Programar Entrega</Text>
          <Text style={styles.sectionSubtitle}>
            Define cuándo recibirás tu primera entrega trascendental
          </Text>
          
          <TouchableOpacity 
            style={styles.dateSelector}
            onPress={() => setShowCalendar(true)}
          >
            <Calendar size={20} color="#D4AF37" strokeWidth={2} />
            <View style={styles.dateInfo}>
              <Text style={styles.dateLabel}>Primera Entrega</Text>
              <Text style={styles.dateValue}>
                {selectedDate.toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </Text>
            </View>
            <ChevronRight size={20} color="#666666" strokeWidth={2} />
          </TouchableOpacity>

          <Text style={styles.timeLabel}>Horario de entrega:</Text>
          <View style={styles.timeSlotsContainer}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.value}
                style={[
                  styles.timeSlot,
                  deliveryTime === slot.value && styles.timeSlotSelected
                ]}
                onPress={() => setDeliveryTime(slot.value)}
              >
                <View style={styles.timeSlotContent}>
                  <Text style={styles.timeSlotIcon}>{slot.icon}</Text>
                  <Text style={[
                    styles.timeSlotLabel,
                    deliveryTime === slot.value && styles.timeSlotLabelSelected
                  ]}>
                    {slot.label}
                  </Text>
                  <Text style={[
                    styles.timeSlotTime,
                    deliveryTime === slot.value && styles.timeSlotTimeSelected
                  ]}>
                    {slot.value}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sección 4: Dirección de Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Dirección de Entrega</Text>
          <Text style={styles.sectionSubtitle}>
            Define dónde recibirás tu flujo regenerativo
          </Text>
          
          <TouchableOpacity 
            style={styles.addressSelector}
            onPress={() => setShowAddressManager(true)}
          >
            <View style={styles.addressIconContainer}>
              <MapPin size={20} color="#10B981" strokeWidth={2} />
            </View>
            <View style={styles.addressInfo}>
              <Text style={styles.addressLabel}>Dirección Principal</Text>
              <Text style={styles.addressValue}>{selectedAddress.address}</Text>
              <Text style={styles.addressCity}>{selectedAddress.city}</Text>
            </View>
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={() => setShowAddressManager(true)}
            >
              <Text style={styles.manageButtonText}>Gestionar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </View>

        {/* Sección 5: Servicio de Entrega */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Servicio de Entrega</Text>
          <Text style={styles.sectionSubtitle}>
            Elige el servicio que trascienda la burocracia tradicional
          </Text>
          
          <View style={styles.deliveryServicesContainer}>
            {mockDeliveryServices.map((service, index) => {
              const serviceColors = ['#3B82F6', '#8B5CF6', '#EF4444', '#10B981'];
              const serviceColor = serviceColors[index % serviceColors.length];
              const isSelected = selectedDeliveryService.id === service.id;
              
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.deliveryServiceOption,
                    isSelected && { backgroundColor: serviceColor, borderColor: serviceColor }
                  ]}
                  onPress={() => setSelectedDeliveryService(service)}
                >
                  <View style={[styles.deliveryServiceIcon, { backgroundColor: isSelected ? '#FFFFFF' : serviceColor }]}>
                    <Truck size={16} color={isSelected ? serviceColor : '#FFFFFF'} strokeWidth={2} />
                  </View>
                  <View style={styles.deliveryServiceInfo}>
                    <Text style={[
                      styles.deliveryServiceName,
                      isSelected && styles.deliveryServiceNameSelected
                    ]}>
                      {service.name}
                    </Text>
                    <Text style={[
                      styles.deliveryServiceDesc,
                      isSelected && styles.deliveryServiceDescSelected
                    ]}>
                      {service.estimatedTime}
                    </Text>
                  </View>
                  <Text style={[
                    styles.deliveryServicePrice,
                    isSelected && styles.deliveryServicePriceSelected
                  ]}>
                    ${service.estimatedCost}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Sección 6: Método de Pago */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. Método de Pago</Text>
          <Text style={styles.sectionSubtitle}>Selecciona o agrega un método de pago para tu automatización</Text>
          {paymentMethods.map(method => (
            <TouchableOpacity
              key={method.id}
              style={[styles.paymentCard, selectedPaymentId === method.id && styles.paymentCardSelected]}
              onPress={() => {
                setSelectedPaymentId(method.id);
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }}
            >
              <View style={styles.paymentCardHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentIcon}>{getPaymentTypeIcon(method.type)}</Text>
                  <View style={styles.paymentDetails}>
                    <Text style={[styles.paymentType, selectedPaymentId === method.id && styles.paymentTypeSelected]}>
                      {getPaymentTypeName(method.type)} •••• {method.last4}
                    </Text>
                    <Text style={[styles.paymentHolder, selectedPaymentId === method.id && styles.paymentHolderSelected]}>{method.holderName}</Text>
                    <Text style={[styles.paymentExpiry, selectedPaymentId === method.id && styles.paymentExpirySelected]}>Vence: {method.expiryDate}</Text>
                    {method.isDefault && (
                      <Text style={[styles.paymentDefault, selectedPaymentId === method.id && styles.paymentDefaultSelected]}>Método principal</Text>
                    )}
                  </View>
                </View>
                <View style={styles.paymentSelector}>
                  <View style={[
                    styles.paymentSelectorCircle,
                    selectedPaymentId === method.id && styles.paymentSelectorCircleSelected
                  ]}>
                    {selectedPaymentId === method.id && (
                      <View style={styles.paymentSelectorDot} />
                    )}
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.addPaymentButton} onPress={() => setShowAddCardModal(true)}>
            <Plus size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.addPaymentText}>Agregar Nueva Tarjeta</Text>
          </TouchableOpacity>
        </View>

        {/* Opciones Avanzadas */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.advancedToggle}
            onPress={() => setShowAdvanced(!showAdvanced)}
          >
            <Text style={styles.advancedToggleText}>Opciones Avanzadas</Text>
            <ChevronDown 
              size={20} 
              color="#666666" 
              strokeWidth={2}
              style={showAdvanced ? { transform: [{ rotate: '180deg' }] } : {}}
            />
          </TouchableOpacity>

          {showAdvanced && (
            <Animatable.View animation="slideInDown" style={styles.advancedOptions}>
              <TouchableOpacity
                style={[styles.advancedOption, advancedOptions.notifications && styles.advancedOptionActive]}
                onPress={() => {
                  setAdvancedOptions(prev => ({ ...prev, notifications: !prev.notifications }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.advancedOptionHeader}>
                  <Text style={styles.advancedOptionTitle}>Notificaciones</Text>
                  <Text style={styles.advancedOptionDesc}>
                    Recibe alertas sobre el estado de tu flujo regenerativo
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  advancedOptions.notifications && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    advancedOptions.notifications && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.advancedOption, advancedOptions.autoPause && styles.advancedOptionActive]}
                onPress={() => {
                  setAdvancedOptions(prev => ({ ...prev, autoPause: !prev.autoPause }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.advancedOptionHeader}>
                  <Text style={styles.advancedOptionTitle}>Pausa Automática</Text>
                  <Text style={styles.advancedOptionDesc}>
                    Pausa automáticamente cuando detecte patrones inusuales
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  advancedOptions.autoPause && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    advancedOptions.autoPause && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.advancedOption, advancedOptions.existentialMode && styles.advancedOptionActive]}
                onPress={() => {
                  setAdvancedOptions(prev => ({ ...prev, existentialMode: !prev.existentialMode }));
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.advancedOptionHeader}>
                  <Text style={styles.advancedOptionTitle}>Modo Trascendental</Text>
                  <Text style={styles.advancedOptionDesc}>
                    Activa el modo que desafía la percepción humana del tiempo
                  </Text>
                </View>
                <View style={[
                  styles.toggleSwitch,
                  advancedOptions.existentialMode && styles.toggleSwitchActive
                ]}>
                  <View style={[
                    styles.toggleThumb,
                    advancedOptions.existentialMode && styles.toggleThumbActive
                  ]} />
                </View>
              </TouchableOpacity>
              <View style={styles.advancedOption}>
                <View style={styles.advancedOptionHeader}>
                  <Text style={styles.advancedOptionTitle}>Límite de Presupuesto</Text>
                  <Text style={styles.advancedOptionDesc}>
                    Define un tope para mantener la armonía financiera
                  </Text>
                </View>
                <TextInput
                  style={styles.budgetInput}
                  placeholder="$0"
                  keyboardType="numeric"
                  value={advancedOptions.budgetLimit.toString()}
                  onChangeText={(text) => setAdvancedOptions(prev => ({ 
                    ...prev, 
                    budgetLimit: parseInt(text) || 0 
                  }))}
                />
              </View>
            </Animatable.View>
          )}
        </View>

        {/* Resumen y Confirmación */}
        <View style={styles.summarySection}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>Resumen de tu Automatización</Text>
            <Text style={styles.summarySubtitle}>
              {getSelectedProductsCount()} producto{getSelectedProductsCount() !== 1 ? 's' : ''} • {frequency} • ${getTotalCost().toLocaleString('es-CL')}
            </Text>
          </View>
          
          <View style={styles.summaryDetails}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Productos Seleccionados:</Text>
              <Text style={styles.summaryValue}>{getSelectedProductsCount()} producto{getSelectedProductsCount() !== 1 ? 's' : ''}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Ahorro de Tiempo:</Text>
              <Text style={styles.summaryValue}>{getSelectedProductsCount() * 2} horas/mes</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Costo de Productos:</Text>
              <Text style={styles.summaryValue}>${getTotalCost().toLocaleString('es-CL')}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Costo de Envío:</Text>
              <Text style={styles.summaryValue}>${selectedDeliveryService.estimatedCost}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Próxima Entrega:</Text>
              <Text style={styles.summaryValue}>
                {selectedDate.toLocaleDateString('es-CL', { 
                  day: 'numeric', 
                  month: 'short' 
                })}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Dirección:</Text>
              <Text style={styles.summaryValue}>{selectedAddress.city}</Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Método de Pago:</Text>
              <Text style={styles.summaryValue}>
                {selectedPaymentId ? paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'credit' ? 'Tarjeta de Crédito' : 
                 paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'debit' ? 'Tarjeta de Débito' :
                 paymentMethods.find(p => p.id === selectedPaymentId)?.type === 'webpay' ? 'WebPay' : 'Mercado Pago' : 'No seleccionado'}
              </Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateSubscription}
          >
            <Zap size={20} color="#000000" strokeWidth={2} />
            <Text style={styles.createButtonText}>Crear Automatización</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modales */}
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

      <Modal
        visible={showCalendar}
        animationType="none"
        transparent={true}
        onRequestClose={() => setShowCalendar(false)}
      >
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <Animated.View 
            ref={calendarRef}
            style={[
              styles.calendarContainer,
              {
                transform: [{ translateY: calendarTranslateY }]
              }
            ]}
          >
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={styles.calendarCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <Text style={styles.calendarTitle}>Seleccionar Fecha</Text>
              <TouchableOpacity onPress={() => setShowCalendar(false)}>
                <Text style={styles.calendarDoneText}>Listo</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarMonthHeader}>
              <TouchableOpacity onPress={handlePreviousMonth}>
                <ChevronLeft size={20} color="#D4AF37" strokeWidth={2} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthTitle}>
                {monthNames[currentCalendarMonth.getMonth()]} {currentCalendarMonth.getFullYear()}
              </Text>
              <TouchableOpacity onPress={handleNextMonth}>
                <ChevronRight size={20} color="#D4AF37" strokeWidth={2} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarWeekDays}>
              {['D', 'L', 'M', 'X', 'J', 'V', 'S'].map(day => (
                <Text key={day} style={styles.calendarWeekDay}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.calendarDaysGrid}>
              {calendarDays.map((day, index) => (
                <Animatable.View 
                  key={index}
                  animation={day.isSelected ? 'pulse' : undefined}
                  style={[
                    styles.calendarDayContainer,
                    day.isSelected && styles.calendarDaySelectedContainer
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.calendarDay,
                      !day.isCurrentMonth && styles.calendarDayOtherMonth,
                      day.isToday && styles.calendarDayToday,
                      day.isSelected && styles.calendarDaySelected,
                      !day.isAvailable && styles.calendarDayUnavailable
                    ]}
                    onPress={() => handleDateSelect(day.date)}
                    disabled={!day.isAvailable}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      !day.isCurrentMonth && styles.calendarDayTextOtherMonth,
                      day.isToday && styles.calendarDayTextToday,
                      day.isSelected && styles.calendarDayTextSelected,
                      !day.isAvailable && styles.calendarDayTextUnavailable
                    ]}>
                      {day.day}
                    </Text>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </Animated.View>
        </PanGestureHandler>
      </Modal>

      {/* Modal de Rueda para Frecuencia Personalizada */}
      <Modal
        visible={showCustomFrequencyWheel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCustomFrequencyWheel(false)}
      >
        <TouchableOpacity 
          style={styles.bottomSheetOverlay}
          activeOpacity={1}
          onPress={() => setShowCustomFrequencyWheel(false)}
        >
          <Animatable.View 
            animation="slideInUp" 
            style={styles.bottomSheetContainer}
          >
            <View style={styles.bottomSheetHandle} />
            <Text style={styles.bottomSheetTitle}>Define tu Ritmo</Text>
            <View style={styles.pickerContainer}>
              <ScrollView 
                style={styles.pickerScrollView}
                showsVerticalScrollIndicator={false}
                snapToInterval={40}
                decelerationRate="fast"
                contentContainerStyle={styles.pickerContent}
                onMomentumScrollEnd={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.y / 40);
                  const day = index; // Assuming 0 to 365
                  setPreviewFrequency(day);
                  setCustomFrequency(day);
                  Haptics.selectionAsync();
                }}
                onScroll={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.y / 40);
                  const day = index;
                  setPreviewFrequency(day);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                {Array.from({ length: 366 }, (_, i) => i).map(day => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.pickerItem,
                      customFrequency === day && styles.pickerItemSelected
                    ]}
                    onPress={() => {
                      setCustomFrequency(day);
                      setPreviewFrequency(day);
                      Haptics.selectionAsync();
                    }}
                  >
                    <Text style={[
                      styles.pickerItemText,
                      customFrequency === day && styles.pickerItemTextSelected
                    ]}>
                      {day} día{day !== 1 ? 's' : ''}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
            <Text style={styles.previewText}>
              Próxima entrega en {previewFrequency} día{previewFrequency !== 1 ? 's' : ''}
            </Text>
            <TouchableOpacity 
              style={styles.bottomSheetConfirmButton}
              onPress={() => setShowCustomFrequencyWheel(false)}
            >
              <Text style={styles.bottomSheetConfirmText}>Confirmar Ritmo</Text>
            </TouchableOpacity>
          </Animatable.View>
        </TouchableOpacity>
      </Modal>

      {/* Modal para Agregar Tarjeta */}
      <Modal visible={showAddCardModal} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Método de Pago</Text>
            <TouchableOpacity onPress={() => setShowAddCardModal(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Tarjeta *</Text>
              <View style={styles.paymentTypeSelector}>
                {[
                  { value: 'credit', label: 'Crédito', icon: '💳' },
                  { value: 'debit', label: 'Débito', icon: '🏧' },
                  { value: 'webpay', label: 'WebPay', icon: '🇨🇱' },
                  { value: 'mercadopago', label: 'Mercado Pago', icon: '💰' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.paymentTypeButton,
                      newCard.type === type.value && styles.paymentTypeButtonActive
                    ]}
                    onPress={() => setNewCard({...newCard, type: type.value as PaymentMethod['type']})}
                  >
                    <Text style={styles.paymentTypeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.paymentTypeText,
                      newCard.type === type.value && styles.paymentTypeTextActive
                    ]}>
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Número de Tarjeta *</Text>
              <TextInput
                style={styles.formInput}
                value={newCard.cardNumber}
                onChangeText={(text) => setNewCard({...newCard, cardNumber: text})}
                placeholder="1234 5678 9012 3456"
                placeholderTextColor="#666666"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Fecha de Vencimiento *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCard.expiryDate}
                  onChangeText={(text) => setNewCard({...newCard, expiryDate: text})}
                  placeholder="MM/AA"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>CVV *</Text>
                <TextInput
                  style={styles.formInput}
                  value={newCard.cvv}
                  onChangeText={(text) => setNewCard({...newCard, cvv: text})}
                  placeholder="123"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre del Titular *</Text>
              <TextInput
                style={styles.formInput}
                value={newCard.holderName}
                onChangeText={(text) => setNewCard({...newCard, holderName: text})}
                placeholder="Nombre como aparece en la tarjeta"
                placeholderTextColor="#666666"
              />
            </View>
            <TouchableOpacity 
              style={styles.defaultToggle}
              onPress={() => setNewCard({...newCard, isDefault: !newCard.isDefault})}
            >
              <View style={[
                styles.checkbox,
                newCard.isDefault && styles.checkboxSelected
              ]}>
                {newCard.isDefault && (
                  <Check size={16} color="#000000" strokeWidth={2} />
                )}
              </View>
              <Text style={styles.defaultToggleText}>Establecer como método principal</Text>
            </TouchableOpacity>
          </ScrollView>
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowAddCardModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={handleSavePayment}
            >
              <Text style={styles.modalSaveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    position: 'relative',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    flex: 1,
    paddingHorizontal: 40, // Space for close button
  },
  closeButton: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    position: 'absolute',
    right: 24,
    top: 70, // Adjusted for paddingTop
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#999999',
    lineHeight: 22,
    marginBottom: 16,
  },
  manageAddressButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageAddressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333333',
  },
  productCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#1a1a1a',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 2,
  },
  productStore: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  productSelection: {
    marginLeft: 12,
  },
  selectedIndicator: {
    backgroundColor: '#D4AF37',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  unselectedIndicator: {
    backgroundColor: '#333333',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  quantitySection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  quantityLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#333333',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  subtotalText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frequencyCard: {
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#555555',
    alignItems: 'center',
  },
  frequencyCardSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  frequencyText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
    marginBottom: 4,
  },
  frequencyTextSelected: {
    color: '#000000',
  },
  frequencyDays: {
    fontSize: 14,
    color: '#999999',
    fontWeight: '500',
  },
  frequencyDaysSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },

  inputLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '500',
  },
  customFrequencyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frequencyButton: {
    backgroundColor: '#333333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  customFrequencyValue: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginHorizontal: 24,
    minWidth: 100,
    textAlign: 'center',
  },
  scheduleRow: {
    marginBottom: 20,
  },
  scheduleItem: {
    flex: 1,
  },
  calendarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  calendarInfo: {
    marginLeft: 12,
    flex: 1,
  },
  calendarLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  calendarDate: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  calendarAction: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  timeSlots: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  timeSlot: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 12,
    width: '48%',
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  timeSlotSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  timeSlotIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  timeSlotInfo: {
    flex: 1,
  },
  timeSlotLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 2,
  },
  timeSlotLabelSelected: {
    color: '#000000',
  },
  timeSlotTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  timeSlotTimeSelected: {
    color: '#000000',
    opacity: 0.8,
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  addressCardSelected: {
    borderColor: '#D4AF37',
  },
  addressInfo: {
    marginLeft: 12,
    flex: 1,
  },
  addressNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  addressName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  defaultText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  addressText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  addressCity: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  addressNotes: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  serviceCardSelected: {
    borderColor: '#D4AF37',
  },
  serviceIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  serviceTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  serviceCost: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  bottomSpacing: {
    height: 120, // Space for floating summary
  },
  floatingSummary: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
  },
  summaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
  },
  summaryLeft: {
    flex: 1,
  },
  floatingSummaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  floatingSummarySubtitle: {
    fontSize: 12,
    color: '#000000',
    opacity: 0.8,
  },
  summaryRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 12,
  },
  createButtonIcon: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: 8,
    borderRadius: 8,
  },
  // Calendar Modal Styles
  calendarModal: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    width: Dimensions.get('window').width * 0.95,
    height: Dimensions.get('window').height * 0.87,
    padding: 20,
    alignItems: 'center',
    alignSelf: 'center',
    position: 'absolute',
    top: '15%',
    left: '2.5%',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarGrid: {
    width: '100%',
  },
  calendarDayHeader: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 8,
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  calendarDayOtherMonth: {
    opacity: 0.3,
  },
  calendarDayToday: {
    backgroundColor: '#333333',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 8,
  },
  calendarDaySelected: {
    backgroundColor: '#D4AF37',
  },
  calendarDayUnavailable: {
    opacity: 0.2,
  },
  calendarDayText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  calendarDayTextOtherMonth: {
    color: '#666666',
  },
  calendarDayTextToday: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  calendarDayTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  calendarDayTextUnavailable: {
    color: '#333333',
  },
  calendarCloseButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 20,
  },
  calendarCloseText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  // Advanced Options Styles
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  advancedToggleText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  advancedOptions: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  advancedOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  advancedOptionHeader: {
    flex: 1,
    marginRight: 10,
  },
  advancedOptionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  advancedOptionDesc: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666666',
  },
  toggleSwitchActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
  },
  toggleThumbActive: {
    transform: [{ translateX: 22 }], // Move thumb to the right
  },
  budgetInput: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    color: '#FFFFFF',
    fontSize: 16,
    width: 120,
    textAlign: 'right',
  },
  // Personalized Product Section Styles
  personalizedSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  personalizedHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  personalizedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  personalizedSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  personalizedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  personalizedProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  personalizedProductInfo: {
    flex: 1,
  },
  personalizedProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  personalizedProductDesc: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  personalizedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  personalizedQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 4,
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
  },
  addMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginLeft: 8,
  },
  // Exploratory Section Styles
  exploratorySection: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryName: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  productsList: {
    maxHeight: 300,
  },
  // Frequency Selection Styles
  frequencyContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.2)',
  },
  frequencyOption: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2a2a2a',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    marginBottom: 8,
    transform: [{ scale: 1 }],
  },
  frequencyOptionSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
    transform: [{ scale: 1.05 }],
  },
  frequencyLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  frequencyLabelSelected: {
    color: '#000000',
  },

  // Natural Frequencies Styles
  naturalFrequenciesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  naturalFrequenciesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#D4AF37',
    marginLeft: 8,
    flex: 1,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 2,
  },
  naturalFrequenciesContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  naturalFrequencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 8,
  },
  naturalFrequencyHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  naturalFrequencyName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginRight: 8,
  },
  naturalFrequencyDesc: {
    fontSize: 12,
    color: '#666666',
    fontStyle: 'italic',
    marginTop: 2,
  },
  naturalFrequencyToggle: {
    width: 40,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666666',
  },
  naturalFrequencyToggleActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  premiumUpsellButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  premiumUpsellText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
    textAlign: 'center',
  },
  // Summary Section Styles
  summarySection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  summarySubtitle: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  summaryDetails: {
    marginBottom: 20,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginLeft: 8,
  },
  // Delivery Services Styles
  deliveryServicesContainer: {
    gap: 8,
  },
  deliveryServiceOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  deliveryServiceSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  deliveryServiceIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deliveryServiceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  deliveryServiceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  deliveryServiceDesc: {
    fontSize: 12,
    color: '#666666',
  },
  deliveryServicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  deliveryServiceNameSelected: {
    color: '#000000',
  },
  deliveryServiceDescSelected: {
    color: '#000000',
    opacity: 0.8,
  },
  deliveryServicePriceSelected: {
    color: '#000000',
  },
  // Custom Frequency Styles
  customFrequencyInputContainer: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  customFrequencyLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  customFrequencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  customFrequencyButton: {
    width: 40,
    height: 40,
    backgroundColor: '#333333',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Date Selector Styles
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dateInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dateLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  dateValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  // Time Slots Styles
  timeLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeSlotContent: {
    alignItems: 'center',
  },
  // Address Selector Styles
  addressSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  addressIconContainer: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  addressLabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  addressValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  manageButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  // Selected Products Section Styles
  selectedProductsSection: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedProductsHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedProductsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  selectedProductsSubtitle: {
    fontSize: 14,
    color: '#666666',
    fontStyle: 'italic',
  },
  selectedProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  selectedProductImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  selectedProductInfo: {
    flex: 1,
  },
  selectedProductName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  selectedProductDesc: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  selectedProductPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  removeProductButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  // Natural Frequencies Enhanced Styles
  naturalFrequenciesHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  naturalFrequenciesMainTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  naturalFrequenciesMainSubtitle: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  naturalFrequencyOptionActive: {
    backgroundColor: '#2a2a2a',
    borderColor: '#D4AF37',
  },
  // Wheel Calendar Styles
  wheelCalendarModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  wheelCalendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  wheelCalendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  wheelCalendarContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  wheelContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 200,
  },
  wheelColumn: {
    flex: 1,
    alignItems: 'center',
  },
  wheelLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 16,
    fontWeight: '600',
  },
  wheelScrollView: {
    height: 150,
  },
  wheelItem: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  wheelItemSelected: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
  },
  wheelItemText: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  wheelItemTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  wheelCalendarConfirmButton: {
    backgroundColor: '#D4AF37',
    marginHorizontal: 24,
    marginBottom: 40,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  wheelCalendarConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  // Real Calendar Styles
  calendarCancelText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  calendarDoneText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  calendarContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  calendarMonthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  calendarMonthTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarWeekDays: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  calendarWeekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  calendarDaysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  // Custom Frequency Styles
  customFrequencySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#333333',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  customFrequencyDisplay: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Wheel Modal Styles
  wheelModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  wheelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  wheelCancelText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  wheelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  wheelDoneText: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  wheelContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  wheelScrollContent: {
    paddingVertical: 100,
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheetContainer: {
    backgroundColor: '#1a1a1a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    paddingBottom: 40,
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#666666',
    borderRadius: 2,
    marginBottom: 16,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 24,
    textShadowColor: 'rgba(212, 175, 55, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  pickerContainer: {
    height: 200,
    width: '100%',
    overflow: 'hidden',
  },
  pickerScrollView: {
    flex: 1,
  },
  pickerContent: {
    paddingVertical: 80,
    alignItems: 'center',
  },
  pickerItem: {
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  pickerItemSelected: {
    backgroundColor: '#333333',
  },
  pickerItemText: {
    fontSize: 24,
    color: '#666666',
    fontWeight: '500',
  },
  pickerItemTextSelected: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  bottomSheetConfirmButton: {
    backgroundColor: '#D4AF37',
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bottomSheetConfirmText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  // Enhanced Calendar Styles
  calendarScrollView: {
    flex: 1,
  },
  calendarDayContainer: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  calendarDaySelectedContainer: {
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    borderRadius: 8,
  },
  previewText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginTop: 16,
    textAlign: 'center',
  },
  advancedOptionActive: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  // Estilos para Billetera
  paymentCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentCardSelected: {
    borderColor: '#D4AF37',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  paymentCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentDetails: {
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentTypeSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  paymentHolder: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  paymentHolderSelected: {
    color: '#000000',
  },
  paymentExpiry: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  paymentExpirySelected: {
    color: '#000000',
  },
  paymentDefault: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  paymentDefaultSelected: {
    color: '#000000',
  },
  paymentSelector: {
    marginLeft: 12,
  },
  paymentSelectorCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#555555',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSelectorCircleSelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#D4AF37',
  },
  paymentSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderStyle: 'dashed',
  },
  addPaymentText: {
    marginLeft: 8,
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    padding: 24,
    justifyContent: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#2a2a2a',
    color: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    minWidth: '45%',
  },
  paymentTypeButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  paymentTypeIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  paymentTypeText: {
    fontSize: 12,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  paymentTypeTextActive: {
    color: '#000000',
    fontWeight: 'bold',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666666',
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  defaultToggleText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: 'bold',
  },
});