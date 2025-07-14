import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CreditCard, Plus, Edit3, Trash2, Check, Crown, Star, Zap, ArrowRight, Shield, Lock, MapPin, User, Mail } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { MERCADOPAGO_SUPER_ESSENTIAL_FLOW_URL } from '@/services/mercadopagoService';
import * as WebBrowser from 'expo-web-browser';

interface PaymentMethod {
  id: number;
  type: 'credit' | 'debit' | 'webpay' | 'mercadopago';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  isDefault: boolean;
  last4: string;
  brand?: string;
}

interface Subscription {
  id: string;
  name: string;
  price: number;
  status: 'active' | 'cancelled' | 'pending';
  nextBilling: string;
  features: string[];
}

// Definir la paleta OLD_MONEY_COLORS al inicio del archivo (después de imports)
const OLD_MONEY_COLORS = {
  background: '#000000',
  card: '#18181a',
  primary: '#556052', // Verde oliva oscuro
  secondary: '#E5DCC3', // Beige claro
  gold: '#BFA14A', // Oro viejo
  text: '#FFFFFF',
  textSecondary: '#B8B8B8',
  border: '#2a2a2a',
  accent: '#FF6B35', // Naranja vibrante para íconos
  success: '#10B981', // Verde para éxito
  warning: '#F59E0B', // Amarillo para advertencias
  error: '#EF4444', // Rojo para errores
};

export default function WalletScreen() {
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { 
      id: 1, 
      type: 'credit', 
      cardNumber: '4532 1234 5678 9012',
      expiryDate: '12/26',
      holderName: 'María González',
      isDefault: true,
      last4: '9012',
      brand: 'Visa'
    },
    { 
      id: 2, 
      type: 'webpay', 
      cardNumber: '5678 9012 3456 7890',
      expiryDate: '08/25',
      holderName: 'María González',
      isDefault: false,
      last4: '7890',
      brand: 'Mastercard'
    }
  ]);

  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: '1',
      name: 'Súper Esencial Flow',
      price: 29990,
      status: 'active',
      nextBilling: '2024-03-15',
      features: ['Entrega automática', 'Soporte premium', 'Analytics avanzados']
    }
  ]);

  const [showAddPayment, setShowAddPayment] = useState(false);
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [paymentForm, setPaymentForm] = useState({
    type: 'credit' as PaymentMethod['type'],
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    isDefault: false
  });

  const handleAddPaymentMethod = () => {
    setShowAddPayment(true);
    setEditingPayment(null);
    setPaymentForm({
      type: 'credit',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      holderName: '',
      isDefault: false
    });
  };

  const handleEditPaymentMethod = (payment: PaymentMethod) => {
    setEditingPayment(payment);
    setPaymentForm({
      type: payment.type,
      cardNumber: payment.cardNumber,
      expiryDate: payment.expiryDate,
      cvv: '',
      holderName: payment.holderName,
      isDefault: payment.isDefault
    });
    setShowEditPayment(true);
  };

  const handleSavePaymentMethod = () => {
    if (!paymentForm.cardNumber.trim() || !paymentForm.expiryDate.trim() || 
        !paymentForm.cvv.trim() || !paymentForm.holderName.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    const newPayment: PaymentMethod = {
      id: editingPayment ? editingPayment.id : Date.now(),
      type: paymentForm.type,
      cardNumber: paymentForm.cardNumber,
      expiryDate: paymentForm.expiryDate,
      holderName: paymentForm.holderName,
      isDefault: paymentForm.isDefault,
      last4: paymentForm.cardNumber.slice(-4),
      brand: paymentForm.type === 'credit' ? 'Visa' : 'Mastercard'
    };

    if (editingPayment) {
      setPaymentMethods(prev => 
        prev.map(pm => pm.id === editingPayment.id ? newPayment : 
          paymentForm.isDefault ? { ...pm, isDefault: false } : pm
        )
      );
    } else {
      if (paymentForm.isDefault) {
        setPaymentMethods(prev => prev.map(pm => ({ ...pm, isDefault: false })));
      }
      setPaymentMethods(prev => [...prev, newPayment]);
    }

    setShowAddPayment(false);
    setShowEditPayment(false);
    setEditingPayment(null);
    Alert.alert('Éxito', editingPayment ? 'Método de pago actualizado' : 'Método de pago agregado');
  };

  const handleDeletePaymentMethod = (paymentId: number) => {
    const payment = paymentMethods.find(pm => pm.id === paymentId);
    
    Alert.alert(
      'Eliminar Método de Pago',
      `¿Estás seguro de que deseas eliminar la tarjeta terminada en ${payment?.last4}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            let updatedPayments = paymentMethods.filter(pm => pm.id !== paymentId);
            
            if (payment?.isDefault && updatedPayments.length > 0) {
              updatedPayments[0].isDefault = true;
            }
            
            setPaymentMethods(updatedPayments);
          }
        }
      ]
    );
  };

  const handleUpgradeSubscription = async () => {
    try {
      await WebBrowser.openBrowserAsync(MERCADOPAGO_SUPER_ESSENTIAL_FLOW_URL);
      Alert.alert('✅ Suscripción Actualizada', 'Tu suscripción ha sido actualizada exitosamente');
    } catch (error) {
      console.error('Error opening browser:', error);
      Alert.alert('Error', 'No se pudo abrir la página de pago');
    }
  };

  const getPaymentTypeIcon = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit': return <CreditCard size={20} color={OLD_MONEY_COLORS.accent} />;
      case 'debit': return <CreditCard size={20} color={OLD_MONEY_COLORS.success} />;
      case 'webpay': return <Shield size={20} color={OLD_MONEY_COLORS.warning} />;
      case 'mercadopago': return <Star size={20} color={OLD_MONEY_COLORS.gold} />;
      default: return <CreditCard size={20} color={OLD_MONEY_COLORS.textSecondary} />;
    }
  };

  const getPaymentTypeName = (type: PaymentMethod['type']) => {
    switch (type) {
      case 'credit': return 'Tarjeta de Crédito';
      case 'debit': return 'Tarjeta de Débito';
      case 'webpay': return 'WebPay';
      case 'mercadopago': return 'MercadoPago';
      default: return 'Otro';
    }
  };

  const getSubscriptionStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active': return OLD_MONEY_COLORS.success;
      case 'cancelled': return OLD_MONEY_COLORS.error;
      case 'pending': return OLD_MONEY_COLORS.warning;
      default: return OLD_MONEY_COLORS.textSecondary;
    }
  };

  const handleEditFieldChange = (field: keyof typeof paymentForm, value: any) => {
    setPaymentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCloseEdit = () => {
    setShowEditPayment(false);
    setEditingPayment(null);
  };

  const handleConfirmCloseEdit = () => {
    setShowEditPayment(false);
    setEditingPayment(null);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Wallet</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus métodos de pago y suscripciones</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <View style={styles.userAvatar}>
            <User size={24} color={OLD_MONEY_COLORS.gold} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>María González</Text>
            <Text style={styles.userEmail}>maria.gonzalez@email.com</Text>
          </View>
        </View>

        {/* Payment Methods Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <CreditCard size={24} color={OLD_MONEY_COLORS.gold} />
            </View>
            <Text style={styles.sectionTitle}>Métodos de Pago</Text>
            <TouchableOpacity onPress={handleAddPaymentMethod} style={styles.addButton}>
              <Plus size={20} color={OLD_MONEY_COLORS.gold} />
            </TouchableOpacity>
          </View>

          {paymentMethods.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentInfo}>
                {getPaymentTypeIcon(payment.type)}
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentType}>{getPaymentTypeName(payment.type)}</Text>
                  <Text style={styles.paymentNumber}>•••• •••• •••• {payment.last4}</Text>
                  <Text style={styles.paymentHolder}>{payment.holderName}</Text>
                </View>
                {payment.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Check size={12} color={OLD_MONEY_COLORS.background} />
                    <Text style={styles.defaultText}>Predeterminada</Text>
                  </View>
                )}
              </View>
              <View style={styles.paymentActions}>
                <TouchableOpacity 
                  onPress={() => handleEditPaymentMethod(payment)}
                  style={styles.actionButton}
                >
                  <Edit3 size={16} color={OLD_MONEY_COLORS.gold} />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeletePaymentMethod(payment.id)}
                  style={[styles.actionButton, styles.deleteButton]}
                >
                  <Trash2 size={16} color={OLD_MONEY_COLORS.error} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Subscriptions Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Crown size={24} color={OLD_MONEY_COLORS.gold} />
            </View>
            <Text style={styles.sectionTitle}>Suscripciones</Text>
          </View>

          {subscriptions.map((subscription) => (
            <View key={subscription.id} style={styles.subscriptionCard}>
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.subscriptionName}>{subscription.name}</Text>
                  <Text style={styles.subscriptionPrice}>
                    ${subscription.price.toLocaleString('es-CL')}/mes
                  </Text>
                </View>
                <View style={[
                  styles.statusBadge,
                  { backgroundColor: getSubscriptionStatusColor(subscription.status) }
                ]}>
                  <Text style={styles.statusText}>
                    {subscription.status === 'active' ? 'Activa' : 
                     subscription.status === 'cancelled' ? 'Cancelada' : 'Pendiente'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.subscriptionFeatures}>
                {subscription.features.map((feature, index) => (
                  <View key={index} style={styles.featureItem}>
                    <Zap size={12} color={OLD_MONEY_COLORS.gold} />
                    <Text style={styles.featureText}>{feature}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.subscriptionFooter}>
                <Text style={styles.nextBilling}>
                  Próximo cobro: {new Date(subscription.nextBilling).toLocaleDateString('es-CL')}
                </Text>
                <TouchableOpacity style={styles.upgradeButton} onPress={handleUpgradeSubscription}>
                  <Text style={styles.upgradeButtonText}>Actualizar Plan</Text>
                  <ArrowRight size={16} color="#000000" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.iconCircle}>
              <Shield size={24} color={OLD_MONEY_COLORS.gold} />
            </View>
            <Text style={styles.sectionTitle}>Seguridad</Text>
          </View>
          
          <View style={styles.securityCard}>
            <View style={styles.securityItem}>
              <View style={styles.iconCircle}>
                <Lock size={20} color={OLD_MONEY_COLORS.success} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Datos Encriptados</Text>
                <Text style={styles.securityDescription}>
                  Todos tus datos de pago están protegidos con encriptación de nivel bancario
                </Text>
              </View>
            </View>
            
            <View style={styles.securityItem}>
              <View style={styles.iconCircle}>
                <Shield size={20} color={OLD_MONEY_COLORS.warning} />
              </View>
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Cumplimiento PCI DSS</Text>
                <Text style={styles.securityDescription}>
                  Cumplimos con los estándares más altos de seguridad para pagos
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Add Payment Method Modal */}
      <Modal
        visible={showAddPayment}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Agregar Método de Pago</Text>
            <TouchableOpacity onPress={() => setShowAddPayment(false)}>
              <Text style={styles.modalClose}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.modalContent}>
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              value={paymentForm.cardNumber}
              onChangeText={(text) => setPaymentForm({...paymentForm, cardNumber: text})}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                value={paymentForm.expiryDate}
                onChangeText={(text) => setPaymentForm({...paymentForm, expiryDate: text})}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                value={paymentForm.cvv}
                onChangeText={(text) => setPaymentForm({...paymentForm, cvv: text})}
                keyboardType="numeric"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre del titular"
              value={paymentForm.holderName}
              onChangeText={(text) => setPaymentForm({...paymentForm, holderName: text})}
            />
            
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePaymentMethod}>
              <Text style={styles.saveButtonText}>Guardar Método de Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Payment Method Modal */}
      <Modal
        visible={showEditPayment}
        animationType="slide"
        presentationStyle="pageSheet"
        transparent
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Método de Pago</Text>
            <TouchableOpacity onPress={handleCloseEdit}>
              <Text style={styles.modalClose}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            {/* Selector de tipo de tarjeta */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Tipo de Tarjeta *</Text>
              <View style={styles.paymentTypeSelector}>
                {[
                  { value: 'credit', label: 'Crédito', icon: <CreditCard size={16} color={OLD_MONEY_COLORS.accent} /> },
                  { value: 'debit', label: 'Débito', icon: <CreditCard size={16} color={OLD_MONEY_COLORS.success} /> },
                  { value: 'webpay', label: 'WebPay', icon: <Shield size={16} color={OLD_MONEY_COLORS.warning} /> },
                  { value: 'mercadopago', label: 'Mercado Pago', icon: <Star size={16} color={OLD_MONEY_COLORS.gold} /> }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.value}
                    style={[styles.paymentTypeButton, paymentForm.type === type.value && styles.paymentTypeButtonActive]}
                    onPress={() => handleEditFieldChange('type', type.value)}
                  >
                    {type.icon}
                    <Text style={[styles.paymentTypeText, paymentForm.type === type.value && styles.paymentTypeTextActive]}>{type.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {/* Campos de tarjeta */}
            <TextInput
              style={styles.input}
              placeholder="Número de tarjeta"
              value={paymentForm.cardNumber}
              onChangeText={text => handleEditFieldChange('cardNumber', text)}
              keyboardType="numeric"
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="MM/YY"
                value={paymentForm.expiryDate}
                onChangeText={text => handleEditFieldChange('expiryDate', text)}
              />
              <TextInput
                style={[styles.input, styles.halfInput]}
                placeholder="CVV"
                value={paymentForm.cvv}
                onChangeText={text => handleEditFieldChange('cvv', text)}
                keyboardType="numeric"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Nombre del titular"
              value={paymentForm.holderName}
              onChangeText={text => handleEditFieldChange('holderName', text)}
            />
            {/* Checkbox principal */}
            <TouchableOpacity
              style={styles.defaultToggle}
              onPress={() => handleEditFieldChange('isDefault', !paymentForm.isDefault)}
            >
              <View style={[styles.checkbox, paymentForm.isDefault && styles.checkboxSelected]}>
                {paymentForm.isDefault && <Check size={16} color={OLD_MONEY_COLORS.background} />}
              </View>
              <Text style={styles.defaultToggleText}>Establecer como principal</Text>
            </TouchableOpacity>
            {/* Botón Guardar */}
            <TouchableOpacity style={styles.saveButton} onPress={handleSavePaymentMethod}>
              <Text style={styles.saveButtonText}>Actualizar Método de Pago</Text>
            </TouchableOpacity>
            {/* Botón Eliminar */}
            <TouchableOpacity style={styles.deleteButtonFull} onPress={() => editingPayment?.id && handleDeletePaymentMethod(editingPayment.id)}>
              <Trash2 size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.deleteButtonText}>Eliminar Método de Pago</Text>
            </TouchableOpacity>
          </View>
          {/* Alerta de cambios no guardados */}
          <Modal visible={false} transparent animationType="fade">
            <View style={styles.alertOverlay}>
              <View style={styles.alertBox}>
                <Text style={styles.alertTitle}>¿Descartar cambios?</Text>
                <Text style={styles.alertMessage}>Si sales ahora, perderás los cambios no guardados.</Text>
                <View style={styles.alertActions}>
                  <TouchableOpacity style={styles.alertButton} onPress={handleConfirmCloseEdit}>
                    <Text style={styles.alertButtonText}>Descartar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.alertButton} onPress={() => {}}>
                    <Text style={styles.alertButtonText}>Seguir editando</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: OLD_MONEY_COLORS.background,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: OLD_MONEY_COLORS.text,
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: OLD_MONEY_COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  userCard: {
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: OLD_MONEY_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: OLD_MONEY_COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: OLD_MONEY_COLORS.text,
    marginLeft: 12,
    flex: 1,
  },
  addButton: {
    padding: 8,
  },
  paymentCard: {
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  paymentType: {
    fontSize: 16,
    fontWeight: '600',
    color: OLD_MONEY_COLORS.text,
  },
  paymentNumber: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
    marginTop: 2,
  },
  paymentHolder: {
    fontSize: 12,
    color: OLD_MONEY_COLORS.textSecondary,
    marginTop: 2,
  },
  defaultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OLD_MONEY_COLORS.gold,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    color: OLD_MONEY_COLORS.background,
    marginLeft: 4,
    fontWeight: '600',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: OLD_MONEY_COLORS.error,
    borderRadius: 8,
  },
  subscriptionCard: {
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: OLD_MONEY_COLORS.text,
  },
  subscriptionPrice: {
    fontSize: 16,
    color: OLD_MONEY_COLORS.gold,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    color: OLD_MONEY_COLORS.text,
    fontWeight: '600',
  },
  subscriptionFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
    marginLeft: 8,
  },
  subscriptionFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  nextBilling: {
    fontSize: 12,
    color: OLD_MONEY_COLORS.textSecondary,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: OLD_MONEY_COLORS.gold,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  upgradeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  securityCard: {
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  securityInfo: {
    marginLeft: 12,
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: OLD_MONEY_COLORS.text,
    marginBottom: 4,
  },
  securityDescription: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: OLD_MONEY_COLORS.background,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: OLD_MONEY_COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: OLD_MONEY_COLORS.text,
  },
  modalClose: {
    fontSize: 16,
    color: OLD_MONEY_COLORS.gold,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  input: {
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: OLD_MONEY_COLORS.text,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  saveButton: {
    backgroundColor: OLD_MONEY_COLORS.gold,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: OLD_MONEY_COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  formGroup: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
    marginBottom: 8,
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
    overflow: 'hidden',
  },
  paymentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 0, // No border radius for full width buttons
    borderRightWidth: 1,
    borderColor: OLD_MONEY_COLORS.border,
  },
  paymentTypeButtonActive: {
    backgroundColor: OLD_MONEY_COLORS.gold,
    borderColor: OLD_MONEY_COLORS.gold,
  },
  paymentTypeText: {
    fontSize: 16,
    color: OLD_MONEY_COLORS.textSecondary,
    marginLeft: 12,
  },
  paymentTypeTextActive: {
    color: OLD_MONEY_COLORS.text,
    fontWeight: '600',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  defaultToggleText: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
    marginLeft: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: OLD_MONEY_COLORS.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OLD_MONEY_COLORS.card,
  },
  checkboxSelected: {
    backgroundColor: OLD_MONEY_COLORS.gold,
    borderColor: OLD_MONEY_COLORS.gold,
  },
  deleteButtonFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: OLD_MONEY_COLORS.error,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 10,
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  alertOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  alertBox: {
    backgroundColor: OLD_MONEY_COLORS.card,
    borderRadius: 12,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: OLD_MONEY_COLORS.text,
    marginBottom: 10,
  },
  alertMessage: {
    fontSize: 14,
    color: OLD_MONEY_COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
  },
  alertActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  alertButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: OLD_MONEY_COLORS.gold,
  },
}); 