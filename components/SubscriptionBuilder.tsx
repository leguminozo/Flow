import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Modal, Image } from 'react-native';
import { Plus, Minus, Calendar, Package, Clock, MapPin, Truck, ChevronDown, X, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { Product, Address, DeliveryService } from '@/types';
import { mockAddresses, mockDeliveryServices } from '@/data/mockData';
import { CurrencyService } from '@/services/currencyService';
import PremiumProductCard from './PremiumProductCard';
import AddressManager from './AddressManager';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

interface SubscriptionBuilderProps {
  products: Product[];
  onSubscriptionCreate: (subscription: any) => void;
  onClose: () => void;
  initialSelectedProducts?: {[key: number]: { quantity: number }};
}

interface CalendarDay {
  date: Date;
  day: number;
  isCurrentMonth: boolean;
  isSelected: boolean;
  isToday: boolean;
  isAvailable: boolean;
}

export default function SubscriptionBuilder({ products, onSubscriptionCreate, onClose, initialSelectedProducts }: SubscriptionBuilderProps) {
  const [selectedProducts, setSelectedProducts] = useState<{[key: number]: { quantity: number }}>(initialSelectedProducts || {});
  const [frequency, setFrequency] = useState<'semanal' | 'quincenal' | 'mensual' | 'personalizada'>('mensual');
  const [deliveryTime, setDeliveryTime] = useState('9:00-12:00');
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [selectedAddress, setSelectedAddress] = useState<Address>(mockAddresses[0]);
  const [selectedDeliveryService, setSelectedDeliveryService] = useState<DeliveryService>(mockDeliveryServices[0]);
  const [customFrequency, setCustomFrequency] = useState(30);
  const [showAddressManager, setShowAddressManager] = useState(false);
  
  // Calendar states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Next week
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentCalendarMonth, setCurrentCalendarMonth] = useState(new Date());

  // Añadir estados nuevos
  const [advancedOptions, setAdvancedOptions] = useState({ notifications: true, budgetLimit: 0, autoPause: false });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [estimatedSavings, setEstimatedSavings] = useState(0);

  // Update selectedProducts when initialSelectedProducts changes
  useEffect(() => {
    if (initialSelectedProducts && Object.keys(initialSelectedProducts).length > 0) {
      setSelectedProducts(initialSelectedProducts);
    }
  }, [initialSelectedProducts]);

  // Función para calcular ahorros estimados
  useEffect(() => {
    const total = getTotalCost();
    const savings = total * 0.15; // 15% ahorro estimado por suscripción
    setEstimatedSavings(savings);
  }, [selectedProducts]);

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

  const toggleProduct = (productId: number) => {
    setSelectedProducts(prev => {
      const current = prev[productId];
      if (current) {
        // Remove product if already selected
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      } else {
        // Add product with quantity 1
        return {
          ...prev,
          [productId]: { quantity: 1 }
        };
      }
    });
  };

  const updateQuantity = (productId: number, change: number) => {
    setSelectedProducts(prev => {
      const current = prev[productId] || { quantity: 0 };
      const newQuantity = Math.max(1, current.quantity + change);
      
      return {
        ...prev,
        [productId]: { quantity: newQuantity }
      };
    });
  };

  const getTotalCost = () => {
    return Object.entries(selectedProducts).reduce((total, [productId, selection]) => {
      const product = products.find(p => p.id === parseInt(productId));
      return total + (product ? product.price * selection.quantity : 0);
    }, 0);
  };

  const getSelectedProductsCount = () => {
    return Object.keys(selectedProducts).length;
  };

  const getTotalItems = () => {
    return Object.values(selectedProducts).reduce((total, selection) => total + selection.quantity, 0);
  };

  const handleCreateSubscription = () => {
    const subscription = {
      products: selectedProducts,
      frequency,
      selectedDate,
      deliveryTime,
      address: selectedAddress,
      deliveryService: selectedDeliveryService,
      totalCost: getTotalCost(),
      customFrequency: frequency === 'personalizada' ? customFrequency : null
    };
    
    onSubscriptionCreate(subscription);
  };

  const handleAddressesChange = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    // Si la dirección seleccionada fue eliminada, seleccionar la primera disponible
    if (!newAddresses.find(addr => addr.id === selectedAddress.id) && newAddresses.length > 0) {
      setSelectedAddress(newAddresses[0]);
    }
  };

  const calendarDays = generateCalendarDays(currentCalendarMonth);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Constructor de{' '}Automatización</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <X size={24} color="#CCCCCC" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Product Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Selecciona Productos</Text>
          <Text style={styles.sectionSubtitle}>
            Toca cualquier producto para agregarlo o quitarlo. Los productos de Obrera y Zángano están sincronizados en tiempo real.
          </Text>
          
          {(() => {
            const isPreselectedMode = !!initialSelectedProducts && Object.keys(initialSelectedProducts).length > 0;
            if (isPreselectedMode) {
              const preselectedId = Object.keys(selectedProducts)[0];
              const preselected = products.find(p => p.id === parseInt(preselectedId));
              if (!preselected) return null;
              const selection = selectedProducts[parseInt(preselectedId)];
              return (
                <View style={{alignItems: 'center', marginBottom: 20}}>
                  <Image source={{uri: preselected.image}} style={{width: 200, height: 200, borderRadius: 10}} />
                  <Text style={{fontSize: 24, color: '#fff', marginVertical: 10}}>{preselected.name}</Text>
                  <View style={styles.quantityControl}>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(parseInt(preselectedId), -1)}
                    >
                      <Minus size={16} color="#D4AF37" strokeWidth={2} />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{selection.quantity}</Text>
                    <TouchableOpacity 
                      style={styles.quantityButton}
                      onPress={() => updateQuantity(parseInt(preselectedId), 1)}
                    >
                      <Plus size={16} color="#D4AF37" strokeWidth={2} />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.subtotalText}>
                    {CurrencyService.formatCLPSimple(preselected.price * selection.quantity)}
                  </Text>
                </View>
              );
            } else {
              return products.slice(0, 12).map((product, idx) => {
                const selection = selectedProducts[product.id];
                const isSelected = selection && selection.quantity > 0;
                return (
                  <Animatable.View key={product.id} animation="fadeInUp" delay={idx * 40} duration={400} useNativeDriver>
                    <PremiumProductCard
                      product={product}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        toggleProduct(product.id);
                      }}
                      variant="compact"
                      showShopifyBadge={product.store === 'Obrera y Zángano'}
                    />

                    {isSelected && (
                      <View style={styles.quantitySection}>
                        <Text style={styles.quantityLabel}>Cantidad:</Text>
                        <View style={styles.quantityControl}>
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, -1);
                            }}
                          >
                            <Minus size={16} color="#D4AF37" strokeWidth={2} />
                          </TouchableOpacity>
                          <Text style={styles.quantityText}>{selection.quantity}</Text>
                          <TouchableOpacity 
                            style={styles.quantityButton}
                            onPress={(e) => {
                              e.stopPropagation();
                              updateQuantity(product.id, 1);
                            }}
                          >
                            <Plus size={16} color="#D4AF37" strokeWidth={2} />
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.subtotalText}>
                          {CurrencyService.formatCLPSimple(product.price * selection.quantity)}
                        </Text>
                      </View>
                    )}
                  </Animatable.View>
                );
              });
            }
          })()}
        </View>

        {/* Frequency Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Frecuencia de Entrega</Text>
          <View style={styles.frequencyGrid}>
            {frequencies.map((freq) => (
              <TouchableOpacity
                key={freq.value}
                style={[
                  styles.frequencyCard,
                  frequency === freq.value && styles.frequencyCardSelected
                ]}
                onPress={() => setFrequency(freq.value as any)}
              >
                <Text style={[
                  styles.frequencyText,
                  frequency === freq.value && styles.frequencyTextSelected
                ]}>
                  {freq.label}
                </Text>
                {freq.value === 'personalizada' && frequency === 'personalizada' && (
                  <Text style={[
                    styles.frequencyDays,
                    frequency === freq.value && styles.frequencyDaysSelected
                  ]}>
                    Cada {customFrequency} días
                  </Text>
                )}
                {freq.days > 0 && (
                  <Text style={[
                    styles.frequencyDays,
                    frequency === freq.value && styles.frequencyDaysSelected
                  ]}>
                    Cada {freq.days} días
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {frequency === 'personalizada' && (
            <View style={styles.customFrequencyContainer}>
              <Text style={styles.inputLabel}>Días entre entregas</Text>
              <View style={styles.customFrequencyControls}>
                <TouchableOpacity 
                  style={styles.frequencyButton}
                  onPress={() => setCustomFrequency(Math.max(1, customFrequency - 1))}
                >
                  <Minus size={20} color="#D4AF37" strokeWidth={2} />
                </TouchableOpacity>
                <Text style={styles.customFrequencyValue}>{customFrequency} días</Text>
                <TouchableOpacity 
                  style={styles.frequencyButton}
                  onPress={() => setCustomFrequency(customFrequency + 1)}
                >
                  <Plus size={20} color="#D4AF37" strokeWidth={2} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Delivery Schedule with Calendar */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Programar Entrega</Text>
          
          {/* Calendar Trigger */}
          <TouchableOpacity 
            style={styles.calendarTrigger}
            onPress={() => setShowCalendar(true)}
          >
            <Calendar size={20} color="#D4AF37" strokeWidth={2} />
            <View style={styles.calendarInfo}>
              <Text style={styles.calendarLabel}>Primera Entrega</Text>
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

          {/* Time Slots with Emojis */}
          <View style={styles.scheduleRow}>
            <View style={styles.scheduleItem}>
              <Text style={styles.inputLabel}>Horario de entrega</Text>
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
          </View>
        </View>

        {/* Address Selection */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>4. Dirección de Entrega</Text>
            <TouchableOpacity 
              style={styles.manageAddressButton}
              onPress={() => setShowAddressManager(true)}
            >
              <Text style={styles.manageAddressText}>Gestionar</Text>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Delivery Service */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Servicio de Entrega</Text>
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
            </TouchableOpacity>
          ))}
        </View>

        {/* Advanced Options */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.advancedHeader} onPress={() => setShowAdvanced(!showAdvanced)}>
            <Text style={styles.sectionTitle}>Opciones Avanzadas</Text>
            <ChevronDown size={20} color="#CCCCCC" strokeWidth={2} style={{ transform: [{ rotate: showAdvanced ? '180deg' : '0deg' }] }} />
          </TouchableOpacity>
          {showAdvanced && (
            <Animatable.View animation="fadeInDown" duration={300} style={styles.advancedContent}>
              <View style={styles.advancedItem}>
                <Text style={styles.inputLabel}>Notificaciones</Text>
                <TouchableOpacity 
                  style={[styles.toggleButton, advancedOptions.notifications ? styles.toggleButtonActive : styles.toggleButtonInactive]}
                  onPress={() => setAdvancedOptions(prev => ({ ...prev, notifications: !prev.notifications }))}
                >
                  <Text style={[styles.toggleText, advancedOptions.notifications ? styles.toggleTextActive : styles.toggleTextInactive]}>
                    {advancedOptions.notifications ? 'Activadas' : 'Desactivadas'}
                  </Text>
                </TouchableOpacity>
              </View>
              <View style={styles.advancedItem}>
                <Text style={styles.inputLabel}>Límite de Presupuesto Mensual</Text>
                <TextInput
                  style={styles.budgetInput}
                  keyboardType="number-pad"
                  value={advancedOptions.budgetLimit.toString()}
                  onChangeText={(text) => setAdvancedOptions(prev => ({ ...prev, budgetLimit: parseInt(text) || 0 }))}
                  placeholder="0"
                  placeholderTextColor="#666666"
                />
              </View>
              <View style={styles.advancedItem}>
                <Text style={styles.inputLabel}>Pausa Automática si no hay stock</Text>
                <TouchableOpacity 
                  style={[styles.toggleButton, advancedOptions.autoPause ? styles.toggleButtonActive : styles.toggleButtonInactive]}
                  onPress={() => setAdvancedOptions(prev => ({ ...prev, autoPause: !prev.autoPause }))}
                >
                  <Text style={[styles.toggleText, advancedOptions.autoPause ? styles.toggleTextActive : styles.toggleTextInactive]}>
                    {advancedOptions.autoPause ? 'Sí' : 'No'}
                  </Text>
                </TouchableOpacity>
              </View>
            </Animatable.View>
          )}
        </View>

        {/* Bottom spacing for floating summary */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Simplified Floating Summary */}
      {getSelectedProductsCount() > 0 && (
        <View style={styles.floatingSummary}>
          <TouchableOpacity 
            style={styles.summaryContent}
            onPress={() => {
              if (getSelectedProductsCount() === 0) return;
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              handleCreateSubscription();
            }}
            activeOpacity={0.9}
          >
            <View style={styles.summaryLeft}>
              <Text style={styles.summaryTitle}>
                {getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'}
              </Text>
              <Text style={styles.summarySubtitle}>
                {frequency}
              </Text>
            </View>
            
            <View style={styles.summaryRight}>
              <Text style={styles.summaryPrice}>
                {CurrencyService.formatCLPSimple(getTotalCost())}
              </Text>
              <View style={styles.createButtonIcon}>
                <Package size={16} color="#000000" strokeWidth={2} />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      )}

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
    paddingBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
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
    fontSize: 12,
    color: '#999999',
  },
  frequencyDaysSelected: {
    color: '#000000',
    opacity: 0.8,
  },
  customFrequencyContainer: {
    marginTop: 16,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
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
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 2,
  },
  summarySubtitle: {
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
  advancedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  advancedContent: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  advancedItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#228B22', // Verde elegante borde
  },
  toggleButtonActive: {
    backgroundColor: '#228B22', // Verde forest old money
  },
  toggleButtonInactive: {
    backgroundColor: '#333333',
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  toggleTextInactive: {
    color: '#CCCCCC',
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
});