import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, Alert, Switch } from 'react-native';
import { Trash2, Plus, Edit3 } from 'lucide-react-native';

type PaymentMethod = {
  id: number;
  type: 'credit' | 'debit' | 'webpay' | 'mercadopago';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  isDefault: boolean;
  last4: string;
};

export default function WalletScreen() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(1);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, type: 'credit', cardNumber: '4532 1234 5678 9012', expiryDate: '12/26', holderName: 'María González', isDefault: true, last4: '9012' },
    { id: 2, type: 'webpay', cardNumber: '5678 9012 3456 7890', expiryDate: '08/25', holderName: 'María González', isDefault: false, last4: '7890' },
    { id: 3, type: 'mercadopago', cardNumber: '1234 5678 9012 3456', expiryDate: '03/27', holderName: 'María González', isDefault: false, last4: '3456' }
  ]);
  const [paymentForm, setPaymentForm] = useState({
    type: 'credit' as PaymentMethod['type'],
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    isDefault: false
  });

  const handleSavePayment = () => {
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
      last4: paymentForm.cardNumber.slice(-4)
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

    resetPaymentForm();
    Alert.alert('Éxito', editingPayment ? 'Método de pago actualizado' : 'Método de pago agregado');
  };

  const resetPaymentForm = () => {
    setPaymentForm({
      type: 'credit',
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      holderName: '',
      isDefault: false
    });
    setEditingPayment(null);
    setShowPaymentForm(false);
  };

  const handleEditPayment = (payment: PaymentMethod) => {
    setPaymentForm({
      type: payment.type,
      cardNumber: payment.cardNumber,
      expiryDate: payment.expiryDate,
      cvv: '',
      holderName: payment.holderName,
      isDefault: payment.isDefault
    });
    setEditingPayment(payment);
    setShowPaymentForm(true);
  };

  const handleDeletePayment = (paymentId: number) => {
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
            
            if (selectedPaymentMethod === paymentId) {
              setSelectedPaymentMethod(updatedPayments.length > 0 ? updatedPayments[0].id : null);
            }
          }
        }
      ]
    );
  };

  const handleSetDefaultPayment = (paymentId: number) => {
    setPaymentMethods(prev => 
      prev.map(pm => ({ ...pm, isDefault: pm.id === paymentId }))
    );
  };

  const handleSelectPaymentMethod = (paymentId: number) => {
    setSelectedPaymentMethod(selectedPaymentMethod === paymentId ? null : paymentId);
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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Billetera</Text>
        <Text style={styles.headerSubtitle}>Gestiona tus métodos de pago</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Métodos de Pago</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setShowPaymentForm(true)}>
            <Plus size={16} color="#D4AF37" strokeWidth={2} />
          </TouchableOpacity>
        </View>
        {paymentMethods.map((method) => (
          <TouchableOpacity
            key={method.id}
            style={[
              styles.paymentCard,
              selectedPaymentMethod === method.id && styles.paymentCardSelected
            ]}
            onPress={() => handleSelectPaymentMethod(method.id)}
            activeOpacity={0.8}
          >
            <View style={styles.paymentCardHeader}>
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentIcon}>{getPaymentTypeIcon(method.type)}</Text>
                <View style={styles.paymentDetails}>
                  <Text style={styles.paymentType}>
                    {getPaymentTypeName(method.type)} •••• {method.last4}
                  </Text>
                  <Text style={styles.paymentHolder}>{method.holderName}</Text>
                  <Text style={styles.paymentExpiry}>Vence: {method.expiryDate}</Text>
                  {method.isDefault && (
                    <Text style={styles.paymentDefault}>Método principal</Text>
                  )}
                </View>
              </View>
              <View style={styles.paymentSelector}>
                <View style={[
                  styles.paymentSelectorCircle,
                  selectedPaymentMethod === method.id && styles.paymentSelectorCircleSelected
                ]}>
                  {selectedPaymentMethod === method.id && (
                    <View style={styles.paymentSelectorDot} />
                  )}
                </View>
              </View>
            </View>
            {selectedPaymentMethod === method.id && (
              <View style={styles.paymentCardDetails}>
                <View style={styles.detailsDivider} />
                <View style={styles.paymentActions}>
                  {!method.isDefault && (
                    <TouchableOpacity 
                      style={styles.paymentActionButton}
                      onPress={() => handleSetDefaultPayment(method.id)}
                    >
                      <Text style={styles.paymentActionText}>Hacer Principal</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity 
                    style={styles.paymentActionButton}
                    onPress={() => handleEditPayment(method)}
                  >
                    <Edit3 size={14} color="#D4AF37" strokeWidth={2} />
                    <Text style={styles.paymentActionText}>Editar</Text>
                  </TouchableOpacity>
                  {paymentMethods.length > 1 && (
                    <TouchableOpacity 
                      style={styles.paymentActionButton}
                      onPress={() => handleDeletePayment(method.id)}
                    >
                      <Trash2 size={14} color="#EF4444" strokeWidth={2} />
                      <Text style={[styles.paymentActionText, { color: '#EF4444' }]}>Eliminar</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Modal
        visible={showPaymentForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {editingPayment ? 'Editar Método de Pago' : 'Agregar Método de Pago'}
            </Text>
            <TouchableOpacity onPress={resetPaymentForm}>
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
                      paymentForm.type === type.value && styles.paymentTypeButtonActive
                    ]}
                    onPress={() => setPaymentForm({...paymentForm, type: type.value as PaymentMethod['type']})}
                  >
                    <Text style={styles.paymentTypeIcon}>{type.icon}</Text>
                    <Text style={[
                      styles.paymentTypeText,
                      paymentForm.type === type.value && styles.paymentTypeTextActive
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
                style={styles.input}
                value={paymentForm.cardNumber}
                onChangeText={text => setPaymentForm({...paymentForm, cardNumber: text})}
                placeholder="1234 5678 9012 3456"
                keyboardType="numeric"
                maxLength={19}
              />
            </View>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>Fecha de Expiración *</Text>
                <TextInput
                  style={styles.input}
                  value={paymentForm.expiryDate}
                  onChangeText={text => setPaymentForm({...paymentForm, expiryDate: text})}
                  placeholder="MM/AA"
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.formLabel}>CVV *</Text>
                <TextInput
                  style={styles.input}
                  value={paymentForm.cvv}
                  onChangeText={text => setPaymentForm({...paymentForm, cvv: text})}
                  placeholder="123"
                  keyboardType="numeric"
                  maxLength={4}
                  secureTextEntry
                />
              </View>
            </View>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre del Titular *</Text>
              <TextInput
                style={styles.input}
                value={paymentForm.holderName}
                onChangeText={text => setPaymentForm({...paymentForm, holderName: text})}
                placeholder="Nombre como aparece en la tarjeta"
              />
            </View>
            <View style={styles.switchContainer}>
              <Switch
                value={paymentForm.isDefault}
                onValueChange={value => setPaymentForm({...paymentForm, isDefault: value})}
                trackColor={{ false: '#E5E7EB', true: '#D4AF37' }}
                thumbColor={paymentForm.isDefault ? '#ffffff' : '#ffffff'}
              />
              <Text style={styles.switchLabel}>Establecer como método principal</Text>
            </View>
            <TouchableOpacity 
              style={styles.saveButton}
              onPress={handleSavePayment}
            >
              <Text style={styles.saveButtonText}>Guardar Método de Pago</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 20 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#D4AF37' },
  headerSubtitle: { fontSize: 16, color: '#9CA3AF' },
  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#D4AF37' },
  addButton: { padding: 8, backgroundColor: '#1F2937', borderRadius: 8 },
  paymentCard: { backgroundColor: '#1F2937', borderRadius: 12, padding: 16, marginBottom: 12 },
  paymentCardSelected: { borderColor: '#D4AF37', borderWidth: 1 },
  paymentCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  paymentInfo: { flexDirection: 'row', alignItems: 'center' },
  paymentIcon: { fontSize: 24, marginRight: 12 },
  paymentDetails: { flex: 1 },
  paymentType: { fontSize: 16, fontWeight: '600', color: '#ffffff' },
  paymentHolder: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },
  paymentExpiry: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },
  paymentDefault: { fontSize: 12, color: '#D4AF37', marginTop: 4 },
  paymentSelector: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#D4AF37', justifyContent: 'center', alignItems: 'center' },
  paymentSelectorCircle: { width: 12, height: 12, borderRadius: 6, backgroundColor: 'transparent' },
  paymentSelectorCircleSelected: { backgroundColor: '#D4AF37' },
  paymentSelectorDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#000000' },
  paymentCardDetails: { marginTop: 12 },
  detailsDivider: { height: 1, backgroundColor: '#374151', marginBottom: 12 },
  paymentActions: { flexDirection: 'row', justifyContent: 'space-around' },
  paymentActionButton: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, backgroundColor: '#374151' },
  paymentActionText: { color: '#ffffff', marginLeft: 8 },
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#D4AF37' },
  modalClose: { fontSize: 24, color: '#9CA3AF' },
  modalContent: { padding: 20 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, color: '#9CA3AF', marginBottom: 8 },
  input: { backgroundColor: '#1F2937', borderRadius: 8, padding: 12, color: '#ffffff', fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  switchContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  switchLabel: { marginLeft: 12, color: '#ffffff', fontSize: 16 },
  saveButton: { backgroundColor: '#D4AF37', borderRadius: 8, padding: 16, alignItems: 'center' },
  saveButtonText: { color: '#000000', fontSize: 16, fontWeight: '600' },
  paymentTypeSelector: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  paymentTypeButton: { width: '48%', padding: 12, borderRadius: 8, backgroundColor: '#1F2937', alignItems: 'center', marginBottom: 8 },
  paymentTypeButtonActive: { backgroundColor: '#D4AF37' },
  paymentTypeIcon: { fontSize: 24, marginBottom: 4 },
  paymentTypeText: { color: '#ffffff', fontSize: 14 },
  paymentTypeTextActive: { color: '#000000' }
}); 