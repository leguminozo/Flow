import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground } from 'react-native';
import { CreditCard, Check, Plus, Shield, X, Package, Star, Crown, Zap, Users, Gift } from 'lucide-react-native';
import { Plan } from '@/types';
import { mockPlans } from '@/data/mockData';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';
import { useTranslation } from 'react-i18next';
import * as Linking from 'expo-linking';

interface PaymentPlansProps {
  onPlanSelect: (plan: Plan) => void;
  selectedPlan?: Plan;
  onClose?: () => void;
}

export default function PaymentPlans({ onPlanSelect, selectedPlan, onClose }: PaymentPlansProps) {
  const [paymentMethods] = useState([
    { id: 1, type: 'WebPay', icon: '💳', description: 'Tarjetas chilenas' },
    { id: 2, type: 'Mercado Pago', icon: '💰', description: 'Transferencia y tarjetas' },
    { id: 3, type: 'Stripe', icon: '🌐', description: 'Tarjetas internacionales' }
  ]);

  const { t } = useTranslation();

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'basico': return <Package size={24} color="#D4AF37" strokeWidth={2} />;
      case 'premium': return <Star size={24} color="#D4AF37" strokeWidth={2} />;
      case 'elite': return <Crown size={24} color="#D4AF37" strokeWidth={2} />;
      default: return <Package size={24} color="#D4AF37" strokeWidth={2} />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'basico': return '#10B981';
      case 'premium': return '#D4AF37';
      case 'elite': return '#8B5CF6';
      default: return '#D4AF37';
    }
  };

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString('es-CL');
  };

  return (
    <View style={styles.container}>
      {/* Hero Section for Existential Upgrade */}
      <LinearGradient
        colors={['#000022', '#000044', '#000022']}
        style={styles.heroSection}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>Eleva tu Consciencia</Text>
          <Text style={styles.heroSubtitle}>
            Accede al núcleo constructor: Maximiza tu tiempo en el universo, transformando complejidad en simplicidad monumental. Como una sombra empoderada, toma el control de automatizaciones centralizadas para cualquier realidad en Chile y más allá.
          </Text>
        </View>
        <ImageBackground
          source={require('../assets/images/cosmic_background.jpg')}
          style={styles.heroImage}
          resizeMode="cover"
        >
          <Image
            source={require('../assets/images/human_shadow.png')}
            style={styles.shadowHuman}
            resizeMode="contain"
          />
          <View style={styles.heroImageOverlay} />
        </ImageBackground>
      </LinearGradient>
      <View style={styles.header}>
        <Text style={styles.title}>{t('paymentPlans.title')}</Text>
        {onClose && (
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#CCCCCC" strokeWidth={2} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.subtitle}>{t('paymentPlans.subtitle')}</Text>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Plans Carousel Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Selecciona tu Plan</Text>
          <Text style={styles.sectionDescription}>
            Carrusel de izquierda (básico) a derecha (premium). Todos los precios incluyen IVA.
          </Text>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.plansCarousel}
            contentContainerStyle={styles.plansCarouselContent}
          >
            {mockPlans.map((plan, index) => {
              const planColor = getPlanColor(plan.id);
              const isSelected = selectedPlan?.id === plan.id;
              
              return (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    isSelected && styles.planCardSelected,
                    plan.isPopular && styles.planCardPopular,
                    { borderColor: planColor }
                  ]}
                  onPress={() => onPlanSelect(plan)}
                >
                  {/* Popular Badge */}
                  {plan.isPopular && (
                    <View style={[styles.popularBadge, { backgroundColor: planColor }]}>
                      <Star size={12} color="#000000" strokeWidth={2} />
                      <Text style={styles.popularText}>MÁS POPULAR</Text>
                    </View>
                  )}
                  
                  {/* Plan Header */}
                  <View style={styles.planHeader}>
                    <View style={styles.planIconContainer}>
                      {getPlanIcon(plan.id)}
                    </View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    
                    {/* Price Section */}
                    <View style={styles.priceSection}>
                      <Text style={[styles.planPrice, { color: planColor }]}>
                        ${formatCurrency(plan.price)}
                      </Text>
                      <Text style={styles.planPeriod}>por mes</Text>
                      
                      {plan.originalPrice && (
                        <Text style={styles.originalPrice}>
                          Antes: ${formatCurrency(plan.originalPrice)}
                        </Text>
                      )}
                      
                      {/* Tax Breakdown */}
                      {plan.netPrice && plan.iva && (
                        <View style={styles.taxBreakdown}>
                          <Text style={styles.taxText}>
                            Valor neto: ${formatCurrency(plan.netPrice)}
                          </Text>
                          <Text style={styles.taxText}>
                            IVA: ${formatCurrency(plan.iva)}
                          </Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Plan Description */}
                  <Text style={styles.planDescription}>{plan.description}</Text>

                  {/* Features List */}
                  <View style={styles.planFeatures}>
                    <Text style={styles.featuresTitle}>Características:</Text>
                    {plan.features.map((feature, featureIndex) => (
                      <View key={featureIndex} style={styles.featureRow}>
                        <Check size={14} color={planColor} strokeWidth={2} />
                        <Text style={styles.featureText}>{feature}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Plan Metrics */}
                  <View style={styles.planMetrics}>
                    <View style={styles.metricRow}>
                      <Users size={16} color="#CCCCCC" strokeWidth={2} />
                      <Text style={styles.metricText}>
                        {plan.targetAudience}
                      </Text>
                    </View>
                    
                    {plan.savings && (
                      <View style={styles.metricRow}>
                        <Gift size={16} color={planColor} strokeWidth={2} />
                        <Text style={[styles.metricText, { color: planColor }]}>
                          Ahorras ${formatCurrency(plan.savings)} al mes
                        </Text>
                      </View>
                    )}
                    
                    {plan.margin && (
                      <View style={styles.metricRow}>
                        <Zap size={16} color="#666666" strokeWidth={2} />
                        <Text style={styles.metricText}>
                          Margen: {plan.marginPercentage}% (${formatCurrency(plan.margin)})
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Plan Limits */}
                  <View style={styles.planLimits}>
                    <Text style={styles.limitText}>
                      📦 Flujos de Automatización: {plan.maxAutomations === -1 
                        ? 'Ilimitados' 
                        : `Hasta ${plan.maxAutomations}`
                      }
                    </Text>
                    {plan.freeDelivery && (
                      <Text style={styles.limitText}>🚚 Entrega gratuita incluida</Text>
                    )}
                  </View>

                  {/* Selection Indicator */}
                  {isSelected && (
                    <View style={[styles.selectedIndicator, { backgroundColor: planColor }]}>
                      <Check size={20} color="#000000" strokeWidth={2} />
                    </View>
                  )}

                  {/* Select Button */}
                  <TouchableOpacity 
                    style={[
                      styles.selectPlanButton,
                      isSelected && { backgroundColor: planColor },
                      !isSelected && { borderColor: planColor }
                    ]}
                    onPress={() => onPlanSelect(plan)}
                  >
                    <Text style={[
                      styles.selectPlanText,
                      isSelected && styles.selectPlanTextSelected
                    ]}>
                      {isSelected ? 'Plan Seleccionado' : 'Seleccionar Plan'}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Payment Methods Section */}
        {selectedPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Métodos de Pago</Text>
            <Text style={styles.sectionSubtitle}>
              Selecciona cómo deseas pagar tu suscripción mensual
            </Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity key={method.id} style={styles.paymentMethodCard}>
                <Text style={styles.paymentIcon}>{method.icon}</Text>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentName}>{method.type}</Text>
                  <Text style={styles.paymentDescription}>{method.description}</Text>
                </View>
                <View style={styles.paymentStatus}>
                  <Text style={styles.statusText}>Disponible</Text>
                </View>
              </TouchableOpacity>
            ))}

            <TouchableOpacity style={styles.addPaymentButton}>
              <Plus size={20} color="#D4AF37" strokeWidth={2} />
              <Text style={styles.addPaymentText}>Agregar Método de Pago</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Security Section */}
        <View style={styles.section}>
          <View style={styles.securityHeader}>
            <Shield size={24} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.securityTitle}>Pago Seguro y Garantías</Text>
          </View>
          <Text style={styles.securityDescription}>
            Todos los pagos están protegidos con encriptación de nivel bancario. 
            Puedes cancelar tu suscripción en cualquier momento sin penalidades.
          </Text>
          
          <View style={styles.securityFeatures}>
            <View style={styles.securityFeature}>
              <Check size={16} color="#10B981" strokeWidth={2} />
              <Text style={styles.securityFeatureText}>Encriptación SSL 256-bit</Text>
            </View>
            <View style={styles.securityFeature}>
              <Check size={16} color="#10B981" strokeWidth={2} />
              <Text style={styles.securityFeatureText}>Cumplimiento PCI DSS</Text>
            </View>
            <View style={styles.securityFeature}>
              <Check size={16} color="#10B981" strokeWidth={2} />
              <Text style={styles.securityFeatureText}>Cancelación sin penalidades</Text>
            </View>
            <View style={styles.securityFeature}>
              <Check size={16} color="#10B981" strokeWidth={2} />
              <Text style={styles.securityFeatureText}>Garantía de satisfacción 30 días</Text>
            </View>
          </View>
        </View>

        {/* Business Model Transparency */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transparencia de Costos</Text>
          <Text style={styles.sectionDescription}>
            En EssentialFlow creemos en la transparencia total de nuestro modelo de negocio.
          </Text>
          
          <View style={styles.transparencyCard}>
            <Text style={styles.transparencyTitle}>💡 ¿Cómo funcionan nuestros precios?</Text>
            <Text style={styles.transparencyText}>
              • Cada plan incluye costos operativos (APIs, entrega, procesamiento)
            </Text>
            <Text style={styles.transparencyText}>
              • Nuestros márgenes nos permiten mejorar continuamente el servicio
            </Text>
            <Text style={styles.transparencyText}>
              • Los ahorros mostrados son reales comparado con compras individuales
            </Text>
            <Text style={styles.transparencyText}>
              • Todos los precios incluyen IVA (19%) según normativa chilena
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      {selectedPlan && (
        <View style={styles.confirmContainer}>
          <View style={styles.confirmCard}>
            <View style={styles.confirmHeader}>
              <Text style={styles.confirmTitle}>Plan {selectedPlan.name}</Text>
              <Text style={[styles.confirmPrice, { color: getPlanColor(selectedPlan.id) }]}>
                ${formatCurrency(selectedPlan.price)}/mes
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.confirmButton, { backgroundColor: getPlanColor(selectedPlan.id) }]}
              onPress={async () => {
                const url = 'https://www.mercadopago.cl/subscriptions/checkout?preapproval_plan_id=2c93808497f5faa70197fc1f9cde0294';
                const supported = await Linking.canOpenURL(url);
                if (supported) {
                  await Linking.openURL(url);
                } else {
                  console.error("Don't know how to open this URL: " + url);
                }
              }}
            >
              <CreditCard size={20} color="#000000" strokeWidth={2} />
              <Text style={styles.confirmButtonText}>Confirmar y Proceder al Pago</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  heroSection: {
    height: 300,
    position: 'relative',
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  heroContent: {
    flex: 1,
    justifyContent: 'center',
    zIndex: 2,
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    lineHeight: 24,
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
  shadowHuman: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 200,
    height: 300,
    opacity: 0.5,
    tintColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  closeButton: {
    backgroundColor: '#1a1a1a',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  subtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    paddingHorizontal: 24,
    marginBottom: 24,
    lineHeight: 20,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 16,
  },
  plansCarousel: {
    marginHorizontal: -24,
    paddingLeft: 24,
  },
  plansCarouselContent: {
    paddingRight: 24,
  },
  planCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    marginRight: 20,
    width: 320,
    borderWidth: 2,
    borderColor: '#333333',
    position: 'relative',
  },
  planCardSelected: {
    backgroundColor: '#1a1a1a',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  planCardPopular: {
    transform: [{ scale: 1.05 }],
  },
  popularBadge: {
    position: 'absolute',
    top: -10,
    left: 24,
    right: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  popularText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#000000',
  },
  planHeader: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 12,
  },
  planIconContainer: {
    backgroundColor: '#333333',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  planName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceSection: {
    alignItems: 'center',
  },
  planPrice: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  planPeriod: {
    fontSize: 16,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'line-through',
    marginBottom: 8,
  },
  taxBreakdown: {
    backgroundColor: '#333333',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  taxText: {
    fontSize: 11,
    color: '#CCCCCC',
  },
  planDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  planFeatures: {
    marginBottom: 20,
  },
  featuresTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
    lineHeight: 20,
  },
  planMetrics: {
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
  },
  planLimits: {
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingTop: 16,
    marginBottom: 20,
  },
  limitText: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 6,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectPlanButton: {
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  selectPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  selectPlanTextSelected: {
    color: '#000000',
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  paymentStatus: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  addPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    marginTop: 8,
  },
  addPaymentText: {
    fontSize: 16,
    color: '#D4AF37',
    marginLeft: 8,
    fontWeight: '500',
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  securityDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 16,
  },
  securityFeatures: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  securityFeatureText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
  },
  transparencyCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  transparencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  transparencyText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
    lineHeight: 20,
  },
  confirmContainer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  confirmCard: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  confirmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  confirmTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  confirmPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
});