import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput, Alert } from 'react-native';
import { User, Settings, CreditCard, Truck, Bell, Shield, CircleHelp as HelpCircle, LogOut, ChevronRight, MapPin, Plus, CreditCard as Edit3, Trash2, Check, ChevronDown, ChevronUp, Crown, Star, Zap, FileText, Lock } from 'lucide-react-native';
import { mockAddresses, mockPlans } from '@/data/mockData';
import { Address } from '@/types';
import AddressManager from '@/components/AddressManager';
import PaymentPlans from '@/components/PaymentPlans';
import { useTranslation } from 'react-i18next';

interface PaymentMethod {
  id: number;
  type: 'credit' | 'debit' | 'webpay' | 'mercadopago';
  cardNumber: string;
  expiryDate: string;
  holderName: string;
  isDefault: boolean;
  last4: string;
}

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  rut: string;
  birthDate: string;
  memberSince: string;
  totalSavings: number;
  activeSubscriptions: number;
  currentPlan: string;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<Address[]>(mockAddresses);
  const [showAddressManager, setShowAddressManager] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [showPlanSelector, setShowPlanSelector] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [expandedCards, setExpandedCards] = useState<{[key: string]: boolean}>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<number | null>(1);
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    firstName: 'María',
    lastName: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+56 9 1234 5678',
    rut: '12.345.678-9',
    birthDate: '15/03/1990',
    memberSince: 'Enero 2024',
    totalSavings: 24500,
    activeSubscriptions: 3,
    currentPlan: 'Súper Esencial Flow'
  });

  const [profileForm, setProfileForm] = useState({
    firstName: userProfile.firstName,
    lastName: userProfile.lastName,
    email: userProfile.email,
    phone: userProfile.phone,
    rut: userProfile.rut,
    birthDate: userProfile.birthDate,
  });

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

  const [paymentForm, setPaymentForm] = useState({
    type: 'credit' as PaymentMethod['type'],
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    holderName: '',
    isDefault: false
  });

  const currentPlan = mockPlans.find(plan => plan.name === userProfile.currentPlan) || mockPlans[1];

  const preferences = {
    notifications: true,
    autoRenew: true,
    ecoMode: true
  };

  const toggleCard = (cardKey: string) => {
    setExpandedCards(prev => ({
      ...prev,
      [cardKey]: !prev[cardKey]
    }));
  };

  const handleAddressesChange = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
  };

  const getDefaultAddress = () => {
    return addresses.find(addr => addr.isDefault) || addresses[0];
  };

  const handleSaveProfile = () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim() || !profileForm.email.trim()) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }

    setUserProfile({
      ...userProfile,
      ...profileForm
    });
    setShowProfileForm(false);
    Alert.alert('Éxito', 'Perfil actualizado correctamente');
  };

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
            
            // Reset selection if deleted payment was selected
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

  const handlePlanChange = (newPlan: any) => {
    const planName = newPlan.name.replace('Plan ', '');
    
    Alert.alert(
      '🔄 Cambiar Plan de Suscripción',
      `¿Deseas cambiar de "${currentPlan.name}" a "${newPlan.name}"?\n\n💰 CAMBIO DE PRECIO:\n• Plan actual: ${currentPlan.isFree ? 'Gratis' : `$${currentPlan.price.toLocaleString('es-CL')}/mes`}\n• Nuevo plan: ${newPlan.isFree ? 'Gratis' : `$${newPlan.price.toLocaleString('es-CL')}/mes`}\n\n✨ NUEVOS BENEFICIOS:\n${newPlan.features.slice(0, 3).map((f: string) => `• ${f}`).join('\n')}\n\n🔄 El cambio será efectivo inmediatamente y se reflejará en tu próxima facturación.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar Cambio',
          onPress: () => {
            setUserProfile(prev => ({ ...prev, currentPlan: newPlan.name }));
            setShowPlanSelector(false);
            
            Alert.alert(
              '✅ Plan Actualizado Exitosamente',
              `Tu plan ha sido cambiado a "${newPlan.name}".\n\n🎉 CONFIRMACIÓN:\n• Nuevo precio: ${newPlan.isFree ? 'Gratis' : `$${newPlan.price.toLocaleString('es-CL')}/mes`}\n• Beneficios activos: ${newPlan.features.length}\n• Automatizaciones permitidas: ${newPlan.maxAutomations === -1 ? 'Ilimitadas' : newPlan.maxAutomations}\n\n📧 Recibirás un email de confirmación con todos los detalles del cambio.`,
              [{ text: 'Perfecto' }]
            );
          }
        }
      ]
    );
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

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'esencial-flow': return <Zap size={20} color="#D4AF37" strokeWidth={2} />;
      case 'super-esencial-flow': return <Crown size={20} color="#D4AF37" strokeWidth={2} />;
      default: return <Zap size={20} color="#D4AF37" strokeWidth={2} />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('profile.subtitle')}</Text>
      </View>

      {/* User Info Card */}
      <View style={styles.userCard}>
        <View style={styles.avatarContainer}>
          <User size={40} color="#D4AF37" strokeWidth={2} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{userProfile.firstName} {userProfile.lastName}</Text>
          <Text style={styles.userEmail}>{userProfile.email}</Text>
          <Text style={styles.userPhone}>{userProfile.phone}</Text>
          <Text style={styles.memberSince}>{t('profile.memberSince', { date: userProfile.memberSince })}</Text>
          <View style={styles.planBadge}>
            <Text style={styles.planText}>Plan {userProfile.currentPlan}</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.editProfileButton}
          onPress={() => setShowProfileForm(true)}
        >
          <Edit3 size={20} color="#D4AF37" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsSection}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>${userProfile.totalSavings.toLocaleString('es-CL')}</Text>
          <Text style={styles.statLabel}>{t('profile.totalSavings')}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userProfile.activeSubscriptions}</Text>
          <Text style={styles.statLabel}>{t('profile.activePlans')}</Text>
        </View>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.personalInfo')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>RUT:</Text>
            <Text style={styles.infoValue}>{userProfile.rut}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Fecha de Nacimiento:</Text>
            <Text style={styles.infoValue}>{userProfile.birthDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teléfono:</Text>
            <Text style={styles.infoValue}>{userProfile.phone}</Text>
          </View>
        </View>
      </View>

      {/* Subscription Plan Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.subscriptionPlan')}</Text>
        
        <TouchableOpacity 
          style={[styles.planCard, expandedCards.plan && styles.planCardExpanded]}
          onPress={() => toggleCard('plan')}
          activeOpacity={0.8}
        >
          <View style={styles.planCardHeader}>
            <View style={styles.planCardMain}>
              <View style={styles.planCardTitleRow}>
                {getPlanIcon(currentPlan.id)}
                <Text style={styles.planCardTitle}>{currentPlan.name}</Text>
                {currentPlan.isPopular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>POPULAR</Text>
                  </View>
                )}
              </View>
              <Text style={styles.planCardPrice}>
                {currentPlan.isFree ? 'Gratis' : `$${currentPlan.price.toLocaleString('es-CL')}/mes`}
              </Text>
              {currentPlan.maxAutomations && (
                <Text style={styles.planCardSubtitle}>
                  {currentPlan.maxAutomations === -1 
                    ? 'Automatizaciones ilimitadas' 
                    : `Hasta ${currentPlan.maxAutomations} automatizaciones`
                  }
                </Text>
              )}
              <Text style={styles.planCardDescription}>{currentPlan.description}</Text>
            </View>
            
            <View style={styles.expandIcon}>
              {expandedCards.plan ? (
                <ChevronUp size={16} color="#666666" strokeWidth={2} />
              ) : (
                <ChevronDown size={16} color="#666666" strokeWidth={2} />
              )}
            </View>
          </View>

          {expandedCards.plan && (
            <View style={styles.planCardDetails}>
              <View style={styles.detailsDivider} />
              
              <View style={styles.planDetailsContent}>
                <Text style={styles.planDetailsTitle}>Beneficios incluidos:</Text>
                {currentPlan.features.map((feature, index) => (
                  <View key={index} style={styles.planFeatureRow}>
                    <Check size={16} color="#10B981" strokeWidth={2} />
                    <Text style={styles.planFeatureText}>{feature}</Text>
                  </View>
                ))}
                
                <View style={styles.planLimits}>
                  <Text style={styles.planLimitText}>
                    📦 Automatizaciones: {currentPlan.maxAutomations === -1 ? 'Ilimitadas' : `Hasta ${currentPlan.maxAutomations}`}
                  </Text>
                  {currentPlan.freeDelivery && (
                    <Text style={styles.planLimitText}>🚚 Entrega gratuita incluida</Text>
                  )}
                  {currentPlan.costPerAutomation && (
                    <Text style={styles.planCostText}>
                      💰 Costo por automatización adicional: $${currentPlan.costPerAutomation.toLocaleString('es-CL')}
                    </Text>
                  )}
                  {currentPlan.savings && (
                    <Text style={styles.planSavingsText}>
                      💰 Ahorras $${currentPlan.savings.toLocaleString('es-CL')} al mes
                    </Text>
                  )}
                </View>
                
                <TouchableOpacity 
                  style={styles.changePlanButton}
                  onPress={() => setShowPlanSelector(true)}
                >
                  <Zap size={16} color="#000000" strokeWidth={2} />
                  <Text style={styles.changePlanButtonText}>Cambiar Plan</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Addresses Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('profile.deliveryAddresses')}</Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setShowAddressManager(true)}
          >
            <Text style={styles.createButtonText}>{t('profile.create')}</Text>
          </TouchableOpacity>
        </View>
        
        {getDefaultAddress() && (
          <View style={styles.addressPreview}>
            <MapPin size={20} color="#D4AF37" strokeWidth={2} />
            <View style={styles.addressPreviewInfo}>
              <Text style={styles.addressPreviewName}>
                {getDefaultAddress()?.name} (Principal)
              </Text>
              <Text style={styles.addressPreviewText}>
                {getDefaultAddress()?.address}
              </Text>
              <Text style={styles.addressPreviewCity}>
                {getDefaultAddress()?.city}
              </Text>
            </View>
            <ChevronRight size={16} color="#666666" strokeWidth={2} />
          </View>
        )}

        <View style={styles.addressSummary}>
          <Text style={styles.addressSummaryText}>
            {addresses.length} {addresses.length === 1 ? 'dirección guardada' : 'direcciones guardadas'}
          </Text>
          <TouchableOpacity onPress={() => setShowAddressManager(true)}>
            <Text style={styles.viewAllText}>Ver todas</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Methods Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{t('profile.paymentMethods')}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowPaymentForm(true)}
          >
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

      {/* Account Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Settings size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.menuItemText}>{t('profile.advancedSettings')}</Text>
          </View>
          <ChevronRight size={20} color="#666666" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Truck size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.menuItemText}>{t('profile.deliveryServices')}</Text>
          </View>
          <ChevronRight size={20} color="#666666" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.preferences')}</Text>
        
        <View style={styles.preferenceItem}>
          <View style={styles.menuItemLeft}>
            <Bell size={20} color="#D4AF37" strokeWidth={2} />
            <View>
              <Text style={styles.menuItemText}>{t('profile.pushNotifications')}</Text>
              <Text style={styles.menuItemSubtext}>{t('profile.pushNotificationsDesc')}</Text>
            </View>
          </View>
          <Switch
            value={preferences.notifications}
            trackColor={{ false: '#333333', true: '#D4AF37' }}
            thumbColor={preferences.notifications ? '#000000' : '#666666'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.menuItemLeft}>
            <Shield size={20} color="#D4AF37" strokeWidth={2} />
            <View>
              <Text style={styles.menuItemText}>{t('profile.autoRenewal')}</Text>
              <Text style={styles.menuItemSubtext}>{t('profile.autoRenewalDesc')}</Text>
            </View>
          </View>
          <Switch
            value={preferences.autoRenew}
            trackColor={{ false: '#333333', true: '#D4AF37' }}
            thumbColor={preferences.autoRenew ? '#000000' : '#666666'}
          />
        </View>

        <View style={styles.preferenceItem}>
          <View style={styles.menuItemLeft}>
            <View style={styles.ecoIcon}>
              <Text style={styles.ecoEmoji}>🌱</Text>
            </View>
            <View>
              <Text style={styles.menuItemText}>{t('profile.ecoPriority')}</Text>
              <Text style={styles.menuItemSubtext}>{t('profile.ecoPriorityDesc')}</Text>
            </View>
          </View>
          <Switch
            value={preferences.ecoMode}
            trackColor={{ false: '#333333', true: '#D4AF37' }}
            thumbColor={preferences.ecoMode ? '#000000' : '#666666'}
          />
        </View>
      </View>

      {/* Legal Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('legal.title')}</Text>
        
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowTermsModal(true)}
        >
          <View style={styles.menuItemLeft}>
            <FileText size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.menuItemText}>{t('legal.termsOfService')}</Text>
          </View>
          <ChevronRight size={20} color="#666666" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => setShowPrivacyModal(true)}
        >
          <View style={styles.menuItemLeft}>
            <Lock size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.menuItemText}>{t('legal.privacyPolicy')}</Text>
          </View>
          <ChevronRight size={20} color="#666666" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('profile.support')}</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <HelpCircle size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.menuItemText}>{t('profile.helpCenter')}</Text>
          </View>
          <ChevronRight size={20} color="#666666" strokeWidth={2} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Text style={styles.contactEmoji}>💬</Text>
            <Text style={styles.menuItemText}>{t('profile.contactSupport')}</Text>
          </View>
          <ChevronRight size={20} color="#666666" strokeWidth={2} />
        </TouchableOpacity>
      </View>

      {/* Logout */}
      <TouchableOpacity style={styles.logoutButton}>
        <LogOut size={20} color="#EF4444" strokeWidth={2} />
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>{t('profile.appVersion')}</Text>
        <Text style={styles.appDescription}>
          {t('profile.appDescription')}
        </Text>
      </View>

      {/* Profile Form Modal */}
      <Modal
        visible={showProfileForm}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Editar Perfil</Text>
            <TouchableOpacity onPress={() => setShowProfileForm(false)}>
              <Text style={styles.modalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalContent}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Nombre *</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.firstName}
                onChangeText={(text) => setProfileForm({...profileForm, firstName: text})}
                placeholder="Ingresa tu nombre"
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Apellido *</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.lastName}
                onChangeText={(text) => setProfileForm({...profileForm, lastName: text})}
                placeholder="Ingresa tu apellido"
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Email *</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.email}
                onChangeText={(text) => setProfileForm({...profileForm, email: text})}
                placeholder="tu@email.com"
                placeholderTextColor="#666666"
                keyboardType="email-address"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Teléfono</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.phone}
                onChangeText={(text) => setProfileForm({...profileForm, phone: text})}
                placeholder="+56 9 1234 5678"
                placeholderTextColor="#666666"
                keyboardType="phone-pad"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>RUT</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.rut}
                onChangeText={(text) => setProfileForm({...profileForm, rut: text})}
                placeholder="12.345.678-9"
                placeholderTextColor="#666666"
              />
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Fecha de Nacimiento</Text>
              <TextInput
                style={styles.formInput}
                value={profileForm.birthDate}
                onChangeText={(text) => setProfileForm({...profileForm, birthDate: text})}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#666666"
              />
            </View>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowProfileForm(false)}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={handleSaveProfile}
            >
              <Text style={styles.modalSaveText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Payment Form Modal */}
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
                style={styles.formInput}
                value={paymentForm.cardNumber}
                onChangeText={(text) => setPaymentForm({...paymentForm, cardNumber: text})}
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
                  value={paymentForm.expiryDate}
                  onChangeText={(text) => setPaymentForm({...paymentForm, expiryDate: text})}
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
                  value={paymentForm.cvv}
                  onChangeText={(text) => setPaymentForm({...paymentForm, cvv: text})}
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
                value={paymentForm.holderName}
                onChangeText={(text) => setPaymentForm({...paymentForm, holderName: text})}
                placeholder="Nombre como aparece en la tarjeta"
                placeholderTextColor="#666666"
              />
            </View>
            
            <TouchableOpacity 
              style={styles.defaultToggle}
              onPress={() => setPaymentForm({...paymentForm, isDefault: !paymentForm.isDefault})}
            >
              <View style={[
                styles.checkbox,
                paymentForm.isDefault && styles.checkboxSelected
              ]}>
                {paymentForm.isDefault && (
                  <Check size={16} color="#000000" strokeWidth={2} />
                )}
              </View>
              <Text style={styles.defaultToggleText}>Establecer como método principal</Text>
            </TouchableOpacity>
          </ScrollView>
          
          <View style={styles.modalActions}>
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={resetPaymentForm}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modalSaveButton}
              onPress={handleSavePayment}
            >
              <Text style={styles.modalSaveText}>
                {editingPayment ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Plan Selector Modal */}
      <Modal
        visible={showPlanSelector}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <PaymentPlans
          onPlanSelect={(plan) => {
            const subscriptionPlan = mockPlans.find(sp => sp.name.includes(plan.name));
            if (subscriptionPlan) {
              handlePlanChange(subscriptionPlan);
            }
          }}
          selectedPlan={undefined}
          onClose={() => setShowPlanSelector(false)}
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

      {/* Terms of Service Modal */}
      <Modal
        visible={showTermsModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.legalModalContainer}>
          <View style={styles.legalModalHeader}>
            <Text style={styles.legalModalTitle}>{t('legal.termsOfService')}</Text>
            <TouchableOpacity 
              style={styles.legalModalCloseButton}
              onPress={() => setShowTermsModal(false)}
            >
              <Text style={styles.legalModalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legalModalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.legalModalText}>{t('legal.termsContent')}</Text>
          </ScrollView>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={showPrivacyModal}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <View style={styles.legalModalContainer}>
          <View style={styles.legalModalHeader}>
            <Text style={styles.legalModalTitle}>{t('legal.privacyPolicy')}</Text>
            <TouchableOpacity 
              style={styles.legalModalCloseButton}
              onPress={() => setShowPrivacyModal(false)}
            >
              <Text style={styles.legalModalClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.legalModalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.legalModalText}>{t('legal.privacyContent')}</Text>
          </ScrollView>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  userCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  memberSince: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 8,
  },
  planBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  planText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  editProfileButton: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  infoCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Plan Card Styles
  planCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  planCardExpanded: {
    borderColor: '#D4AF37',
  },
  planCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planCardMain: {
    flex: 1,
  },
  planCardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
  planCardPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
  },
  planCardSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  planCardDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  expandIcon: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
  },
  planCardDetails: {
    marginTop: 16,
  },
  detailsDivider: {
    height: 1,
    backgroundColor: '#333333',
    marginBottom: 16,
  },
  planDetailsContent: {
    gap: 12,
  },
  planDetailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  planFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  planFeatureText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
  },
  planLimits: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  planLimitText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 4,
  },
  planCostText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
    marginBottom: 4,
  },
  planSavingsText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  changePlanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  changePlanButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  createButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  addressPreview: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressPreviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  addressPreviewName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  addressPreviewText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  addressPreviewCity: {
    fontSize: 12,
    color: '#666666',
  },
  addressSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  addressSummaryText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  viewAllText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  // Payment Card Styles
  paymentCard: {
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentCardSelected: {
    borderColor: '#D4AF37',
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
  paymentHolder: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  paymentExpiry: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  paymentDefault: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
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
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentSelectorCircleSelected: {
    borderColor: '#D4AF37',
  },
  paymentSelectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  paymentCardDetails: {
    marginTop: 16,
  },
  paymentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
  },
  paymentActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  paymentActionText: {
    fontSize: 14,
    color: '#D4AF37',
    marginLeft: 4,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: '#333333',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
    fontWeight: '500',
  },
  menuItemSubtext: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    marginBottom: 1,
    borderWidth: 1,
    borderColor: '#333333',
  },
  ecoIcon: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ecoEmoji: {
    fontSize: 16,
  },
  contactEmoji: {
    fontSize: 16,
    width: 20,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1a1a1a',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#333333',
  },
  logoutText: {
    fontSize: 16,
    color: '#EF4444',
    marginLeft: 8,
    fontWeight: '600',
  },
  appInfo: {
    paddingHorizontal: 24,
    paddingBottom: 100,
    alignItems: 'center',
  },
  appVersion: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  appDescription: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalClose: {
    fontSize: 24,
    color: '#CCCCCC',
    padding: 8,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  formRow: {
    flexDirection: 'row',
  },
  formLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    fontWeight: '500',
  },
  formInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentTypeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  paymentTypeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#555555',
    minWidth: 100,
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
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  paymentTypeTextActive: {
    color: '#000000',
  },
  defaultToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#555555',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  defaultToggleText: {
    fontSize: 16,
    color: '#CCCCCC',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  modalCancelText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
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
    fontWeight: '600',
  },
  // Legal Modal Styles
  legalModalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  legalModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  legalModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  legalModalCloseButton: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  legalModalClose: {
    fontSize: 20,
    color: '#CCCCCC',
  },
  legalModalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  legalModalText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 22,
    textAlign: 'justify',
  },
});