import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, Alert } from 'react-native';
import { Calendar, Clock, Package, CreditCard as Edit, Pause, Play, Trash2, Plus, MapPin } from 'lucide-react-native';
import { mockDeliveryServices } from '@/data/mockData';
import SubscriptionEditor from '@/components/SubscriptionEditor';
import SubscriptionBuilder from '@/components/SubscriptionBuilder';
import { Subscription, SubscriptionProduct, Product } from '@/types/index';
import { useTranslation } from 'react-i18next';

const mockProducts: Product[] = [
  { id: 1, name: 'Café Nescafé Gold', description: 'Café instantáneo premium', price: 7990, image: '', category: 'Alimentos', origin: 'Supermercado', store: 'Jumbo', inStock: true, tags: [] },
  { id: 2, name: 'Miel Artesanal', description: 'Miel pura de abejas', price: 6990, image: '', category: 'Alimentos', origin: 'Local', store: 'Apiario del Sur', inStock: true, tags: [] },
  { id: 3, name: 'Detergente Ariel', description: 'Detergente para ropa', price: 12990, image: '', category: 'Limpieza', origin: 'Supermercado', store: 'Unimarc', inStock: true, tags: [] },
  { id: 4, name: 'Papel Higiénico Elite', description: 'Papel higiénico suave', price: 5990, image: '', category: 'Papel', origin: 'Supermercado', store: 'Lider', inStock: true, tags: [] },
  { id: 5, name: 'Café Etíope', description: 'Café gourmet etíope', price: 14990, image: '', category: 'Alimentos', origin: 'Especializado', store: 'Tostadores Artesanales', inStock: true, tags: [] },
  { id: 6, name: 'Jabón de Lavanda', description: 'Jabón natural de lavanda', price: 4990, image: '', category: 'Cuidado Personal', origin: 'Local', store: 'Jabones Naturales', inStock: true, tags: [] }
];

export default SubscriptionsScreen;

function SubscriptionsScreen() {
  const { t } = useTranslation();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([
    {
      id: 1,
      products: [
        { productId: 1, quantity: 2, product: mockProducts[0] },
        { productId: 2, quantity: 1, product: mockProducts[1] }
      ],
      frequency: 'mensual',
      deliveryDay: 5,
      deliveryTime: '9:00-12:00',
      nextDelivery: '2024-03-05',
      totalPrice: 22980,
      status: 'activa',
      addressId: 1
    },
    {
      id: 2,
      products: [
        { productId: 3, quantity: 1, product: mockProducts[2] },
        { productId: 4, quantity: 2, product: mockProducts[3] }
      ],
      frequency: 'quincenal',
      deliveryDay: 15,
      deliveryTime: '14:00-17:00',
      nextDelivery: '2024-03-15',
      totalPrice: 24970,
      status: 'activa',
      addressId: 1
    },
    {
      id: 3,
      products: [
        { productId: 5, quantity: 1, product: mockProducts[4] },
        { productId: 6, quantity: 2, product: mockProducts[5] }
      ],
      frequency: 'personalizada',
      deliveryDay: 20,
      deliveryTime: '16:00-19:00',
      nextDelivery: '2024-03-20',
      totalPrice: 28970,
      status: 'pausada',
      addressId: 2
    }
  ]);

  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [showBuilder, setShowBuilder] = useState(false);

  const toggleSubscription = (id: number) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, status: sub.status === 'activa' ? 'pausada' : 'activa' }
          : sub
      )
    );
  };

  const handleCreateSubscription = () => {
    setShowBuilder(true);
  };

  const handleEditSubscription = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setShowEditor(true);
  };

  const handleSaveSubscription = (updatedSubscription: Subscription) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === updatedSubscription.id ? updatedSubscription : sub
      )
    );
    setShowEditor(false);
    setEditingSubscription(null);
  };

  const handleDeleteSubscription = (subscription: Subscription) => {
    const nextDeliveryDate = new Date(subscription.nextDelivery).toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const totalSavings = subscription.totalPrice * 12; // Ahorro anual estimado

    Alert.alert(
      '⚠️ Eliminar Automatización',
      `¿Estás seguro de que deseas eliminar permanentemente la automatización "${subscription.products[0].product.name}"?\n\n🚫 CONSECUENCIAS IMPORTANTES:\n\n• Se cancelarán TODOS los cobros futuros automáticamente\n• No se realizarán más entregas de estos productos\n• La próxima entrega programada para el ${nextDeliveryDate} será CANCELADA\n• Perderás el ahorro estimado de $${totalSavings.toLocaleString('es-CL')} anuales\n• Esta acción NO se puede deshacer\n\n💳 CONFIRMACIÓN DE CANCELACIÓN DE COBROS:\nDespués de eliminar, ya NO se te cobrará más por esta automatización. Todos los pagos automáticos quedarán cancelados inmediatamente.\n\n¿Deseas continuar con la eliminación?`,
      [
        {
          text: 'Cancelar',
          style: 'cancel'
        },
        {
          text: 'SÍ, Eliminar Definitivamente',
          style: 'destructive',
          onPress: () => {
            // Remove subscription from the list
            setSubscriptions(prev => prev.filter(sub => sub.id !== subscription.id));
            
            // Show detailed confirmation of deletion with billing cancellation
            Alert.alert(
              '✅ Automatización Eliminada Exitosamente',
              `La automatización "${subscription.products[0].product.name}" ha sido eliminada completamente del sistema.\n\n🔒 CONFIRMACIÓN DE CANCELACIÓN:\n\n• ✅ Todos los cobros automáticos han sido CANCELADOS\n• ✅ No recibirás más entregas de esta automatización\n• ✅ La entrega del ${nextDeliveryDate} ha sido cancelada\n• ✅ No se procesarán más pagos relacionados\n\n💡 INFORMACIÓN ADICIONAL:\n• Puedes crear una nueva automatización cuando desees\n• Tus otras automatizaciones activas no se ven afectadas\n• El historial de entregas anteriores se mantiene en tu cuenta\n\n¡Gracias por usar EssentialFlow!`,
              [
                { 
                  text: 'Entendido',
                  onPress: () => {
                    // Optional: You could add analytics tracking here
                    console.log(`Automatización ${subscription.id} eliminada exitosamente`);
                  }
                }
              ]
            );
          }
        }
      ],
      { 
        cancelable: false // Make alert non-dismissible by tapping outside
      }
    );
  };

  const handleSubscriptionCreated = (newSubscriptionData: any) => {
    const newProducts: SubscriptionProduct[] = Object.entries(newSubscriptionData.products).map(
      ([productId, selection]: [string, any]) => {
        const product = mockProducts.find((p) => p.id === parseInt(productId));
        return {
          productId: parseInt(productId),
          quantity: selection.quantity,
          product: product as Product
        };
      }
    );
    const newSubscription: Subscription = {
      id: Date.now(),
      products: newProducts,
      frequency: newSubscriptionData.frequency,
      deliveryDay: newSubscriptionData.deliveryDay,
      deliveryTime: newSubscriptionData.deliveryTime,
      nextDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      totalPrice: newSubscriptionData.totalCost,
      status: 'activa',
      addressId: 1 // O el id correspondiente
    };
    setSubscriptions((prev) => [...prev, newSubscription]);
    setShowBuilder(false);
    Alert.alert(
      '🎉 Automatización Creada Exitosamente',
      `Tu nueva automatización ha sido activada.\n\n📦 DETALLES:\n• Frecuencia: ${newSubscription.frequency}\n• Próxima entrega: ${new Date(newSubscription.nextDelivery).toLocaleDateString('es-CL')}\n• Total: $${newSubscription.totalPrice.toLocaleString('es-CL')}\n\n✅ Los cobros automáticos están activos y las entregas comenzarán según la programación.`,
      [{ text: 'Perfecto' }]
    );
  };

  const totalMonthlyCost = subscriptions
    .filter(sub => sub.status === 'activa')
    .reduce((total, sub) => {
      const multiplier = sub.frequency === 'quincenal' ? 2 : 
                        sub.frequency === 'semanal' ? 4 : 1;
      return total + (sub.totalPrice * multiplier);
    }, 0);

  const getDeliveryServiceInfo = (serviceId: string) => {
    return mockDeliveryServices.find(service => service.id === serviceId);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('automations.title')}</Text>
        <Text style={styles.headerSubtitle}>{t('automations.subtitle')}</Text>
      </View>

      {/* Overview Cards */}
      <View style={styles.overviewSection}>
        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Package size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.overviewTitle}>{t('automations.active')}</Text>
          </View>
          <Text style={styles.overviewValue}>
            {subscriptions.filter(sub => sub.status === 'activa').length}
          </Text>
          <Text style={styles.overviewSubtext}>
            {subscriptions.filter(sub => sub.status !== 'activa').length} {t('automations.paused')}
          </Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Calendar size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.overviewTitle}>{t('automations.next')}</Text>
          </View>
          <Text style={styles.overviewValue}>5 Mar</Text>
          <Text style={styles.overviewSubtext}>en 2 días</Text>
        </View>

        <View style={styles.overviewCard}>
          <View style={styles.overviewHeader}>
            <Clock size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.overviewTitle}>{t('automations.monthly')}</Text>
          </View>
          <Text style={styles.overviewValue}>${Math.round(totalMonthlyCost).toLocaleString('es-CL')}</Text>
          <Text style={styles.overviewSubtext}>{t('automations.estimated')}</Text>
        </View>
      </View>

      {/* Add New Subscription */}
      <TouchableOpacity style={styles.addSubscriptionButton} onPress={handleCreateSubscription}>
        <Plus size={20} color="#000000" strokeWidth={2} />
        <Text style={styles.addSubscriptionText}>{t('automations.createNew')}</Text>
      </TouchableOpacity>

      {/* Subscriptions List */}
      <ScrollView 
        style={styles.subscriptionsList}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.subscriptionsContent}
      >
        {subscriptions.length === 0 ? (
          <View style={styles.emptyState}>
            <Package size={64} color="#666666" strokeWidth={1} />
            <Text style={styles.emptyStateTitle}>{t('automations.noSubscriptions')}</Text>
            <Text style={styles.emptyStateDescription}>
              {t('automations.noSubscriptionsDesc')}
            </Text>
            <TouchableOpacity style={styles.emptyStateButton} onPress={handleCreateSubscription}>
              <Plus size={20} color="#000000" strokeWidth={2} />
              <Text style={styles.emptyStateButtonText}>{t('automations.createFirst')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          subscriptions.map((subscription) => {
            // Nombre: primer producto o resumen
            const name = subscription.products.length === 1
              ? subscription.products[0].product.name
              : `${subscription.products[0].product.name} +${subscription.products.length - 1}`;
            // Estado
            const isActive = subscription.status === 'activa';
            return (
              <View key={subscription.id} style={styles.subscriptionCard}>
                <View style={styles.subscriptionHeader}>
                  <View style={styles.subscriptionInfo}>
                    <Text style={styles.subscriptionName}>{name}</Text>
                    <Text style={styles.subscriptionMeta}>
                      {subscription.products.length} {t('automations.products')} • {subscription.frequency}
                    </Text>
                  </View>
                  <Switch
                    value={isActive}
                    onValueChange={() => toggleSubscription(subscription.id)}
                    trackColor={{ false: '#333333', true: '#D4AF37' }}
                    thumbColor={isActive ? '#000000' : '#666666'}
                  />
                </View>
                {/* Products List */}
                <View style={styles.productsList}>
                  {subscription.products.map((product, index) => (
                    <View key={index} style={styles.productItem}>
                      <Text style={styles.productItemName}>
                        {product.quantity}x {product.product.name}
                      </Text>
                      <Text style={styles.productItemStore}>{product.product.store}</Text>
                    </View>
                  ))}
                </View>
                <View style={styles.subscriptionDetails}>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Calendar size={16} color="#D4AF37" strokeWidth={2} />
                      <Text style={styles.detailLabel}>{t('automations.nextDelivery')}</Text>
                      <Text style={styles.detailValue}>
                        {new Date(subscription.nextDelivery).toLocaleDateString('es-CL', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </Text>
                    </View>
                    <Text style={styles.priceText}>${subscription.totalPrice.toLocaleString('es-CL')}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <Clock size={16} color="#D4AF37" strokeWidth={2} />
                      <Text style={styles.detailLabel}>{t('automations.schedule')}</Text>
                      <Text style={styles.detailValue}>{subscription.deliveryTime}</Text>
                    </View>
                  </View>
                  <View style={styles.detailRow}>
                    <View style={styles.detailItem}>
                      <MapPin size={16} color="#D4AF37" strokeWidth={2} />
                      <Text style={styles.detailLabel}>{t('automations.address')}</Text>
                      <Text style={styles.detailValue}>ID {subscription.addressId}</Text>
                    </View>
                  </View>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusIndicator,
                    { backgroundColor: isActive ? '#10B981' : '#F59E0B' }
                  ]} />
                  <Text style={styles.statusText}>
                    {isActive ? t('automations.activeStatus') : t('automations.pausedStatus')}
                  </Text>
                  <TouchableOpacity style={styles.trackingButton}>
                    <Text style={styles.trackingButtonText}>{t('automations.tracking')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.subscriptionActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleEditSubscription(subscription)}
                  >
                    <Edit size={16} color="#D4AF37" strokeWidth={2} />
                    <Text style={styles.actionButtonText}>{t('automations.edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => toggleSubscription(subscription.id)}
                  >
                    {isActive ? (
                      <Pause size={16} color="#F59E0B" strokeWidth={2} />
                    ) : (
                      <Play size={16} color="#10B981" strokeWidth={2} />
                    )}
                    <Text style={styles.actionButtonText}>
                      {isActive ? t('automations.pause') : t('automations.resume')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleDeleteSubscription(subscription)}
                  >
                    <Trash2 size={16} color="#EF4444" strokeWidth={2} />
                    <Text style={[styles.actionButtonText, { color: '#EF4444' }]}>{t('automations.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Subscription Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        {editingSubscription && (
          <SubscriptionEditor
            subscription={editingSubscription}
            onSave={handleSaveSubscription}
            onClose={() => {
              setShowEditor(false);
              setEditingSubscription(null);
            }}
          />
        )}
      </Modal>

      {/* Subscription Builder Modal */}
      <Modal
        visible={showBuilder}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SubscriptionBuilder
          mode="exploratory"
          products={mockProducts}
          onSubscriptionCreate={handleSubscriptionCreated}
          onClose={() => setShowBuilder(false)}
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
  overviewSection: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  overviewCard: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#333333',
  },
  overviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  overviewTitle: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 8,
    fontWeight: '500',
  },
  overviewValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  overviewSubtext: {
    fontSize: 11,
    color: '#666666',
  },
  addSubscriptionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    marginHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  addSubscriptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  subscriptionsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  subscriptionsContent: {
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  emptyStateButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  subscriptionCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  subscriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  subscriptionMeta: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  productsList: {
    marginBottom: 16,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#333333',
  },
  productItem: {
    marginBottom: 8,
  },
  productItemName: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  productItemStore: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  subscriptionDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginLeft: 8,
    marginRight: 8,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  deliveryCost: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
    flex: 1,
  },
  trackingButton: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  trackingButtonText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
  subscriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#D4AF37',
    marginLeft: 4,
    fontWeight: '500',
  },
});