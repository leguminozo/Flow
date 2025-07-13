import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Star, Clock, MapPin, Package, ChevronRight } from 'lucide-react-native';
import { Store } from '@/types';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

interface ShopifyStoreCardProps {
  store: Store;
  onPress: () => void;
  isShopifyStore?: boolean;
}

export default function ShopifyStoreCard({ store, onPress, isShopifyStore = false }: ShopifyStoreCardProps) {
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
        <View style={styles.imageContainer}>
          <Image source={{ uri: store.logo }} style={styles.image} />
          
          {!store.isActive && (
            <View style={styles.closedOverlay}>
              <Text style={styles.closedText}>Cerrado</Text>
            </View>
          )}
          
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{store.type}</Text>
          </View>
          
          {isShopifyStore && (
            <View style={styles.shopifyBadge}>
              <Text style={styles.shopifyBadgeText}>🛒 Shopify</Text>
            </View>
          )}
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name}>{store.name}</Text>
            {isShopifyStore && (
              <View style={styles.liveBadge}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveText}>En vivo</Text>
              </View>
            )}
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {store.description}
          </Text>

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

          <View style={styles.specialties}>
            {store.specialties.slice(0, 3).map((specialty, index) => (
              <View key={index} style={styles.specialtyTag}>
                <Text style={styles.specialtyText}>{specialty}</Text>
              </View>
            ))}
          </View>

          <View style={styles.footer}>
            <View style={styles.categoriesInfo}>
              <Package size={14} color="#D4AF37" strokeWidth={2} />
              <Text style={styles.categoriesText}>
                {store.categories.length} categorías
              </Text>
            </View>
            
            <View style={styles.enterButton}>
              <Text style={styles.enterText}>
                {store.isActive ? 'Entrar' : 'Cerrado'}
              </Text>
              {store.isActive && (
                <ChevronRight size={16} color="#D4AF37" strokeWidth={2} />
              )}
            </View>
          </View>

          {isShopifyStore && (
            <View style={styles.shopifyInfo}>
              <Text style={styles.shopifyInfoText}>
                🔄 Productos actualizados en tiempo real desde Shopify
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
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  shopifyContainer: {
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  typeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  shopifyBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shopifyBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  liveIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: 4,
  },
  liveText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  metrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 16,
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metricText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  specialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  specialtyTag: {
    backgroundColor: '#333333',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  specialtyText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoriesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoriesText: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '500',
  },
  enterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enterText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  shopifyInfo: {
    marginTop: 12,
    padding: 8,
    backgroundColor: '#333333',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  shopifyInfoText: {
    fontSize: 11,
    color: '#CCCCCC',
    lineHeight: 16,
  },
});