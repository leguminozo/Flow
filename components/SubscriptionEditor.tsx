import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, TextInput } from 'react-native';
import { Calendar, Clock, MapPin, Truck, Package, Save, X, ChevronLeft, ChevronRight, CreditCard as Edit3, Search, Plus, Minus, Trash2, Settings } from 'lucide-react-native';
import { Subscription, SubscriptionProduct, Product, Address } from '@/types/index';
import { mockDeliveryServices, mockProducts, getCurrentAddresses, updateGlobalAddresses } from '@/data/mockData';
import AddressManager from './AddressManager';
import ProductSearchModal from './ProductSearchModal';

interface SubscriptionEditorProps {
  subscription: Subscription;
  onSave: (updatedSubscription: Subscription) => void;
  onClose: () => void;
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isAvailable: boolean;
}

export default function SubscriptionEditor({ subscription, onSave, onClose }: SubscriptionEditorProps) {
  const [addresses, setAddresses] = useState<Address[]>(getCurrentAddresses());
  const [selectedAddress, setSelectedAddress] = useState<Address>(
    addresses.find(addr => addr.id === subscription.addressId) || addresses[0]
  );
  const [frequency, setFrequency] = useState(subscription.frequency);
  const [deliveryTime, setDeliveryTime] = useState(subscription.deliveryTime);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(subscription.nextDelivery));
  const [products, setProducts] = useState<SubscriptionProduct[]>(subscription.products);
  
  // Modal states
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const [editingProductIndex, setEditingProductIndex] = useState<number | null>(null);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Sync addresses when component mounts or when addresses change globally
  useEffect(() => {
    const currentAddresses = getCurrentAddresses();
    setAddresses(currentAddresses);
    
    // Update selected address if it still exists
    const updatedSelectedAddress = currentAddresses.find(addr => addr.id === selectedAddress.id);
    if (updatedSelectedAddress) {
      setSelectedAddress(updatedSelectedAddress);
    } else if (currentAddresses.length > 0) {
      setSelectedAddress(currentAddresses[0]);
    }
  }, []);

  const frequencies = [
    { value: 'semanal', label: 'Semanal', days: 7, description: 'Cada 7 días' },
    { value: 'quincenal', label: 'Quincenal', days: 14, description: 'Cada 14 días' },
    { value: 'mensual', label: 'Mensual', days: 30, description: 'Cada 30 días' },
    { value: 'personalizada', label: 'Personalizada', days: 0, description: 'Intervalo personalizado' }
  ];

  const timeSlots = [
    { value: '9:00-12:00', label: 'Mañana', icon: '🌅' },
    { value: '12:00-15:00', label: 'Mediodía', icon: '☀️' },
    { value: '15:00-18:00', label: 'Tarde', icon: '🌤️' },
    { value: '18:00-21:00', label: 'Noche', icon: '🌙' }
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
    }
  };

  const handlePreviousMonth = () => {
    const newMonth = new Date(currentCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() - 1);
    setCurrentCalendarMonth(newMonth);
  };

  const handleNextMonth = () => {
    const newMonth = new Date(currentCalendarMonth);
    newMonth.setMonth(newMonth.getMonth() + 1);
    setCurrentCalendarMonth(newMonth);
  };

  const handleFrequencyChange = (newFrequency: 'semanal' | 'quincenal' | 'mensual' | 'personalizada') => {
    setFrequency(newFrequency);
    // No custom frequency for now, as it's not in the Subscription type
  };

  const handleConfirmCustomFrequency = () => {
    Alert.alert('Frecuencia Personalizada', `Frecuencia establecida: cada ${customFrequency} días`);
  };

  const handleProductQuantityChange = (index: number, change: number) => {
    setProducts(prev => prev.map((product, i) => 
      i === index 
        ? { ...product, quantity: Math.max(1, product.quantity + change) }
        : product
    ));
  };

  const handleRemoveProduct = (index: number) => {
    if (products.length > 1) {
      Alert.alert(
        'Eliminar Producto',
        `¿Estás seguro de que deseas eliminar "${products[index].product.name}" de la suscripción?`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Eliminar',
            style: 'destructive',
            onPress: () => {
              setProducts(prev => prev.filter((_, i) => i !== index));
            }
          }
        ]
      );
    } else {
      Alert.alert('Error', 'Debe mantener al menos un producto en la suscripción');
    }
  };

  const handleEditProduct = (index: number) => {
    setEditingProductIndex(index);
    setShowProductSearch(true);
  };

  const handleProductSelect = (product: Product) => {
    if (editingProductIndex !== null) {
      // Replace existing product
      setProducts(prev => prev.map((p, i) => 
        i === editingProductIndex 
          ? { productId: product.id, product, quantity: p.quantity }
          : p
      ));
      setEditingProductIndex(null);
    } else {
      // Add new product
      const newProduct: SubscriptionProduct = {
        productId: product.id,
        product,
        quantity: 1,
      };
      setProducts(prev => [...prev, newProduct]);
    }
  };

  const getTotalPrice = () => {
    return products.reduce((total, product) => total + (product.product.price * product.quantity), 0);
  };

  const getSubscriptionSummary = () => {
    const totalProducts = products.reduce((sum, p) => sum + p.quantity, 0);
    const frequencyText = frequency === 'personalizada' ? `cada ${customFrequency} días` : frequency;
    const nextDeliveryText = selectedDate.toLocaleDateString('es-CL', { 
      day: 'numeric', 
      month: 'short' 
    });
    
    return `${totalProducts} productos • ${frequencyText} • próxima: ${nextDeliveryText}`;
  };

  const handleSave = () => {
    const updatedSubscription: Subscription = {
      ...subscription,
      products,
      frequency,
      deliveryDay: subscription.deliveryDay, // o permitir editar
      deliveryTime,
      nextDelivery: selectedDate.toISOString().split('T')[0],
      totalPrice: products.reduce((total, p) => total + (p.product.price * p.quantity), 0),
      status: subscription.status,
      addressId: selectedAddress.id
    };

    // Automation data for external app
    const automationData = {
      subscriptionId: subscription.id,
      nextDeliveryDate: selectedDate.toISOString(),
      frequency: frequency === 'personalizada' ? customFrequency : frequencies.find(f => f.value === frequency)?.days,
      deliveryAddress: selectedAddress,
      deliveryService: selectedDeliveryService.id,
      products: products,
      automationTriggers: {
        purchaseAutomation: true,
        deliveryScheduling: true,
        inventoryCheck: true,
        paymentProcessing: true
      }
    };

    console.log('🚀 Enviando datos de automatización:', automationData);
    
    Alert.alert(
      'Suscripción Actualizada',
      `✅ Cambios guardados exitosamente\n\n📦 Resumen: ${getSubscriptionSummary()}\n💰 Total: $${getTotalPrice().toLocaleString('es-CL')}\n\n🤖 Automatización activada para ${selectedDeliveryService.name}`,
      [{ text: 'Entendido', onPress: () => onSave(updatedSubscription) }]
    );
  };

  const handleAddressesChange = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    
    // Update global addresses
    updateGlobalAddresses(newAddresses);
    
    const updatedAddress = newAddresses.find(addr => addr.id === selectedAddress.id);
    if (updatedAddress) {
      setSelectedAddress(updatedAddress);
    } else if (newAddresses.length > 0) {
      setSelectedAddress(newAddresses[0]);
    }

    // Show sync confirmation
    Alert.alert(
      '🔄 Direcciones Sincronizadas',
      `Las direcciones han sido actualizadas en toda la aplicación.\n\n📍 Total: ${newAddresses.length} direcciones\n🏠 Principal: ${newAddresses.find(addr => addr.isDefault)?.name || 'Ninguna'}`,
      [{ text: 'Perfecto' }]
    );
  };

  const calendarDays = generateCalendarDays(currentCalendarMonth);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#CCCCCC" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.title}>Editar Suscripción</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Save size={20} color="#000000" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Products Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Productos de la Suscripción</Text>
            <TouchableOpacity 
              style={styles.addProductButton}
              onPress={() => {
                setEditingProductIndex(null);
                setShowProductSearch(true);
              }}
            >
              <Plus size={16} color="#D4AF37" strokeWidth={2} />
            </TouchableOpacity>
          </View>
          
          {products.map((product, index) => (
            <View key={product.id} style={styles.productCard}>
              <View style={styles.productHeader}>
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{product.product.name}</Text>
                  <Text style={styles.productStore}>{product.product.store}</Text>
                  <Text style={styles.productPrice}>${product.product.price.toLocaleString('es-CL')} c/u</Text>
                </View>
                
                <View style={styles.productActions}>
                  <TouchableOpacity 
                    style={styles.editProductButton}
                    onPress={() => handleEditProduct(index)}
                  >
                    <Edit3 size={16} color="#D4AF37" strokeWidth={2} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.searchProductButton}
                    onPress={() => handleEditProduct(index)}
                  >
                    <Search size={16} color="#D4AF37" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
              </View>
              
              <View style={styles.productControls}>
                <View style={styles.quantityControls}>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleProductQuantityChange(index, -1)}
                  >
                    <Minus size={16} color="#D4AF37" strokeWidth={2} />
                  </TouchableOpacity>
                  <Text style={styles.quantityText}>{product.quantity}</Text>
                  <TouchableOpacity 
                    style={styles.quantityButton}
                    onPress={() => handleProductQuantityChange(index, 1)}
                  >
                    <Plus size={16} color="#D4AF37" strokeWidth={2} />
                  </TouchableOpacity>
                </View>
                
                <Text style={styles.productSubtotal}>
                  ${(product.product.price * product.quantity).toLocaleString('es-CL')}
                </Text>
                
                {products.length > 1 && (
                  <TouchableOpacity 
                    style={styles.removeProductButton}
                    onPress={() => handleRemoveProduct(index)}
                  >
                    <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
          
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>Total de la Suscripción:</Text>
            <Text style={styles.totalAmount}>${getTotalPrice().toLocaleString('es-CL')}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Dirección de Entrega</Text>
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={() => setShowAddressManager(true)}
            >
              <Text style={styles.manageButtonText}>Gestionar</Text>
            </TouchableOpacity>
          </View>
          
          {addresses.map((address) => (
            <TouchableOpacity
              key={address.id}
              style={[
                styles.addressCard,
                selectedAddress.id === address.id && styles.addressCardSelected
              ]}
              onPress={() => setSelectedAddress(address)}
            >
              <MapPin size={20} color="#D4AF37" strokeWidth={2} />
              <View style={styles.addressInfo}>
                <View style={styles.addressNameRow}>
                  <Text style={styles.addressName}>{address.name}</Text>
                  {address.isDefault && (
                    <View style={styles.defaultBadge}>
                      <Text style={styles.defaultText}>Principal</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.addressText}>{address.address}</Text>
                <Text style={styles.addressCity}>{address.city}</Text>
                {address.notes && (
                  <Text style={styles.addressNotes}>📝 {address.notes}</Text>
                )}
              </View>
              {selectedAddress.id === address.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}

          {/* Address Sync Status */}
          <View style={styles.syncStatusCard}>
            <View style={styles.syncStatusHeader}>
              <Text style={styles.syncStatusIcon}>🔄</Text>
              <Text style={styles.syncStatusTitle}>Sincronización Activa</Text>
            </View>
            <Text style={styles.syncStatusDescription}>
              Los cambios en direcciones se reflejan automáticamente en toda la app
            </Text>
          </View>
        </View>

        {/* Delivery Frequency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frecuencia de Entrega</Text>
          <View style={styles.frequencyGrid}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.frequencyCard,
                  frequency === freq.value && styles.frequencyCardSelected
                ]}
                onPress={() => handleFrequencyChange(freq.value as any)}
              >
                <Text style={[
                  styles.frequencyLabel,
                  frequency === freq.value && styles.frequencyLabelSelected
                ]}>
                  {freq.label}
                </Text>
                <Text style={[
                  styles.frequencyDescription,
                  frequency === freq.value && styles.frequencyDescriptionSelected
                ]}>
                  {freq.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Frequency UI removed as per new_code */}
        </View>

        {/* Delivery Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Programación de Próxima Entrega</Text>
          
          <TouchableOpacity 
            style={styles.calendarTrigger}
            onPress={() => setShowCalendar(true)}
          >
            <Calendar size={20} color="#D4AF37" strokeWidth={2} />
            <View style={styles.calendarInfo}>
              <Text style={styles.calendarLabel}>Próxima Entrega</Text>
              <Text style={styles.calendarDate}>
                {selectedDate.toLocaleDateString('es-CL', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
            <Text style={styles.calendarAction}>Cambiar</Text>
          </TouchableOpacity>

          <Text style={styles.subSectionTitle}>Horario de Entrega</Text>
          <View style={styles.timeSlots}>
            {timeSlots.map((slot) => (
              <TouchableOpacity
                key={slot.value}
                style={[
                  styles.timeSlot,
                  deliveryTime === slot.value && styles.timeSlotSelected
                ]}
                onPress={() => setDeliveryTime(slot.value)}
              >
                <Text style={styles.timeSlotIcon}>{slot.icon}</Text>
                <View style={styles.timeSlotInfo}>
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

        {/* Delivery Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Servicio de Entrega</Text>
          {mockDeliveryServices.map((service) => (
            <TouchableOpacity
              key={service.id}
              style={[
                styles.serviceCard,
                selectedDeliveryService.id === service.id && styles.serviceCardSelected
              ]}
              onPress={() => setSelectedDeliveryService(service)}
            >
              <Text style={styles.serviceIcon}>{service.icon}</Text>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <Text style={styles.serviceTime}>{service.estimatedTime}</Text>
              </View>
              <Text style={styles.serviceCost}>
                ${service.estimatedCost.toLocaleString('es-CL')}
              </Text>
              {selectedDeliveryService.id === service.id && (
                <View style={styles.selectedIndicator}>
                  <Text style={styles.selectedText}>✓</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Automation Summary */}
        <View style={styles.section}>
          <View style={styles.automationHeader}>
            <Settings size={24} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Resumen de Automatización</Text>
          </View>
          <View style={styles.automationCard}>
            <Text style={styles.automationTitle}>{getSubscriptionSummary()}</Text>
            <View style={styles.automationList}>
              <Text style={styles.automationItem}>✅ Compra automática programada</Text>
              <Text style={styles.automationItem}>✅ Coordinación con {selectedDeliveryService.name}</Text>
              <Text style={styles.automationItem}>✅ Verificación de inventario</Text>
              <Text style={styles.automationItem}>✅ Procesamiento de pago</Text>
              <Text style={styles.automationItem}>✅ Notificaciones de seguimiento</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Product Search Modal */}
      <ProductSearchModal
        visible={showProductSearch}
        onClose={() => {
          setShowProductSearch(false);
          setEditingProductIndex(null);
        }}
        onProductSelect={handleProductSelect}
        excludeProductIds={products.map(p => mockProducts.find(mp => mp.name === p.product.name)?.id || 0)}
      />

      {/* Calendar Modal */}
      <Modal
        visible={showCalendar}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.calendarModal}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => setShowCalendar(false)}>
              <X size={24} color="#CCCCCC" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>Seleccionar Fecha</Text>
            <TouchableOpacity 
              style={styles.calendarSaveButton}
              onPress={() => setShowCalendar(false)}
            >
              <Text style={styles.calendarSaveText}>Listo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.calendarNavigation}>
            <TouchableOpacity style={styles.navButton} onPress={handlePreviousMonth}>
              <ChevronLeft size={20} color="#D4AF37" strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.monthYear}>
              {monthNames[currentCalendarMonth.getMonth()]} {currentCalendarMonth.getFullYear()}
            </Text>
            <TouchableOpacity style={styles.navButton} onPress={handleNextMonth}>
              <ChevronRight size={20} color="#D4AF37" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          <View style={styles.calendarGrid}>
            <View style={styles.weekDays}>
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>
            
            <View style={styles.daysGrid}>
              {calendarDays.map((day, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dayButton,
                    !day.isCurrentMonth && styles.dayButtonInactive,
                    day.isToday && styles.dayButtonToday,
                    day.isSelected && styles.dayButtonSelected,
                    !day.isAvailable && styles.dayButtonDisabled
                  ]}
                  onPress={() => handleDateSelect(day.date)}
                  disabled={!day.isAvailable}
                >
                  <Text style={[
                    styles.dayText,
                    !day.isCurrentMonth && styles.dayTextInactive,
                    day.isToday && styles.dayTextToday,
                    day.isSelected && styles.dayTextSelected,
                    !day.isAvailable && styles.dayTextDisabled
                  ]}>
                    {day.day}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.calendarFooter}>
            <Text style={styles.selectedDateDisplay}>
              Fecha seleccionada: {selectedDate.toLocaleDateString('es-CL', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          </View>
        </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    marginTop: 20,
  },
  addProductButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  productCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
  productStore: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  productActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editProductButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  searchProductButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  productControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    backgroundColor: '#333333',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  productSubtotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  removeProductButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  totalCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  manageButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  manageButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
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
  selectedIndicator: {
    backgroundColor: '#D4AF37',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000000',
  },
  syncStatusCard: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 8,
  },
  syncStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  syncStatusIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  syncStatusTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  syncStatusDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  frequencyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  frequencyCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    width: '48%',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
  },
  frequencyCardSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  frequencyLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  frequencyLabelSelected: {
    color: '#000000',
  },
  frequencyDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  frequencyDescriptionSelected: {
    color: '#000000',
    opacity: 0.8,
  },
  customFrequencyContainer: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  customFrequencyLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: '600',
  },
  customFrequencyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
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
  confirmFrequencyButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmFrequencyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  calendarTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 8,
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
    marginRight: 12,
  },
  automationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  automationCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  automationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  automationList: {
    marginBottom: 0,
  },
  automationItem: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 6,
    lineHeight: 20,
  },
  calendarModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  calendarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarSaveButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  calendarSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  calendarNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  navButton: {
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  calendarGrid: {
    paddingHorizontal: 24,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#666666',
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayButton: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderRadius: 8,
  },
  dayButtonInactive: {
    opacity: 0.3,
  },
  dayButtonToday: {
    backgroundColor: '#333333',
  },
  dayButtonSelected: {
    backgroundColor: '#D4AF37',
  },
  dayButtonDisabled: {
    opacity: 0.2,
  },
  dayText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dayTextInactive: {
    color: '#666666',
  },
  dayTextToday: {
    color: '#D4AF37',
    fontWeight: 'bold',
  },
  dayTextSelected: {
    color: '#000000',
    fontWeight: 'bold',
  },
  dayTextDisabled: {
    color: '#333333',
  },
  calendarFooter: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    marginTop: 20,
  },
  selectedDateDisplay: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    fontWeight: '500',
  },
});