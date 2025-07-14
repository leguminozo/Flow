import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, MapPin, Package, ChevronRight, Zap, Truck } from 'lucide-react-native';
import { Store } from '@/types';
import { CurrencyService } from '@/services/currencyService';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

interface EnhancedStoreCardProps {
  store: Store;
  onPress: () => void;
  isShopifyStore?: boolean;
  productCount?: number;
  averagePrice?: number;
}

export default function EnhancedStoreCard({ 
  store, 
  onPress, 
  isShopifyStore = false,
  productCount = 0,
  averagePrice = 0
}: EnhancedStoreCardProps) {
  return (
    <Animatable.View animation="fadeInUp" duration={500} useNativeDriver>
      <TouchableOpacity 
        style={[styles.container, isShopifyStore && styles.shopifyContainer]} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.8}
      >
        {/* Header con imagen y badges */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: store.logo }} style={styles.image} />
          
          {/* Overlay gradient para mejor legibilidad */}
          <View style={styles.imageOverlay} />
          
          {/* Status badges */}
          <View style={styles.topBadges}>
            <View style={[styles.statusBadge, store.isActive ? styles.openBadge : styles.closedBadge]}>
              <View style={[styles.statusDot, { backgroundColor: store.isActive ? '#10B981' : '#EF4444' }]} />
              <Text style={styles.statusText}>{store.isActive ? 'Abierto' : 'Cerrado'}</Text>
            </View>
            
            {isShopifyStore && (
              <View style={styles.shopifyBadge}>
                <Zap size={12} color="#000000" strokeWidth={2} />
                <Text style={styles.shopifyBadgeText}>En vivo</Text>
              </View>
            )}
          </View>

          {/* Store type badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{store.type}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Store name and rating */}
          <View style={styles.header}>
            <Text style={styles.name}>{store.name}</Text>
            {isShopifyStore && (
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>En vivo</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <Text style={styles.description} numberOfLines={2}>
            {store.description}
          </Text>

          {/* Metrics grid */}
          <View style={styles.metrics}>
            <View style={styles.metric}>
              <Star size={14} color="#D4AF37" strokeWidth={2} />
              <Text style={styles.metricText}>{store.rating}</Text>
            </View>
            <View style={styles.metric}>
              <Clock size={14} color="#666666" strokeWidth={2} />
              <Text style={styles.metricText}>{store.deliveryTime}</Text>
            </View>
            <View style={styles.metric}>
              <MapPin size={14} color="#666666" strokeWidth={2} />
              <Text style={styles.metricText}>
                Mín: ${store.minimumOrder.toLocaleString('es-CL')}
              </Text>
            </View>
          </View>

          {/* Average price if available */}
          {averagePrice > 0 && (
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Precio promedio:</Text>
              <Text style={styles.priceValue}>
                {CurrencyService.formatCLPReadable(Math.round(averagePrice))}
              </Text>
            </View>
          )}

          {/* Specialties */}
          <View style={styles.specialties}>
            {store.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
            {store.specialties.length > 3 && (
              <View style={styles.moreSpecialties}>
                <Text style={styles.moreSpecialtiesText}>+{store.specialties.length - 3}</Text>
              </View>
            )}
          </View>

          {/* Footer with action */}
          <View style={styles.footer}>
            <View style={styles.categoriesInfo}>
              <Text style={styles.categoriesText}>
                {store.categories.length} categorías disponibles
              </Text>
            </View>
            <View style={[styles.enterButton, !store.isActive && styles.enterButtonDisabled]}>
              <Text style={[styles.enterText, !store.isActive && styles.enterTextDisabled]}>
                {store.isActive ? 'Explorar' : 'Cerrado'}
              </Text>
              {store.isActive && (
                <ChevronRight size={16} color="#000000" strokeWidth={2} />
              )}
            </View>
          </View>

          {/* Shopify integration info */}
          {isShopifyStore && (
            <View style={styles.shopifyInfo}>
              <Truck size={12} color="#D4AF37" strokeWidth={2} />
              <Text style={styles.shopifyInfoText}>
                Productos sincronizados en tiempo real
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  shopifyContainer: {
    borderColor: '#D4AF37',
    borderWidth: 2,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topBadges: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  openBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
  },
  closedBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shopifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  shopifyBadgeText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '700',
  },
  typeBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  typeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rating: {
    fontSize: 15,
    color: '#D4AF37',
    fontWeight: '700',
  },
  description: {
    fontSize: 15,
    color: '#B8B8B8',
    lineHeight: 22,
    marginBottom: 20,
    fontWeight: '400',
  },
  metrics: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  metric: {
    alignItems: 'center',
    flex: 1,
  },
  metricLabel: {
    fontSize: 11,
    color: '#808080',
    marginTop: 4,
    marginBottom: 3,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  priceInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#404040',
  },
  priceLabel: {
    fontSize: 13,
    color: '#B8B8B8',
    fontWeight: '500',
  },
  priceValue: {
    fontSize: 15,
    color: '#D4AF37',
    fontWeight: '700',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  specialtyTag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#404040',
  },
  specialtyText: {
    fontSize: 11,
    color: '#B8B8B8',
    fontWeight: '500',
  },
  moreSpecialties: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  moreSpecialtiesText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  categoriesInfo: {
    flex: 1,
  },
  categoriesText: {
    fontSize: 13,
    color: '#808080',
    fontWeight: '500',
  },
  enterButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  enterButtonDisabled: {
    backgroundColor: '#333333',
  },
  enterText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 14,
  },
  enterTextDisabled: {
    color: '#666666',
  },
  shopifyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    gap: 8,
  },
  shopifyInfoText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
  },
  liveText: {
    fontSize: 11,
    color: '#000000',
    fontWeight: '700',
  },
  metricText: {
    fontSize: 13,
    color: '#B8B8B8',
    fontWeight: '500',
  },
});