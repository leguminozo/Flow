import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Plus, Star, Package } from 'lucide-react-native';
import { AppProduct } from '@/types/shopify';
import { CurrencyService } from '@/services/currencyService';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

interface ShopifyProductCardProps {
  product: AppProduct;
  onPress: () => void;
  onAddToCart?: () => void;
  showShopifyBadge?: boolean;
}

export default function ShopifyProductCard({ 
  product, 
  onPress, 
  onAddToCart, 
  showShopifyBadge = true 
}: ShopifyProductCardProps) {
  const getDiscountPercentage = () => {
    if (product.shopifyData.compareAtPrice && product.shopifyData.compareAtPrice > product.price) {
      return CurrencyService.calculateDiscountPercentage(
        product.shopifyData.compareAtPrice,
        product.price
      );
    }
    return null;
  };

  const discountPercentage = getDiscountPercentage();

  return (
    <Animatable.View animation="fadeInUp" duration={500} useNativeDriver>
      <TouchableOpacity style={styles.container} onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }} activeOpacity={0.8}>
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.image} />
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {showShopifyBadge && (
              <View style={styles.shopifyBadge}>
                <Text style={styles.shopifyBadgeText}>🛒</Text>
              </View>
            )}
            
            {!product.inStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Agotado</Text>
              </View>
            )}
            
            {discountPercentage && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{discountPercentage}%</Text>
              </View>
            )}
          </View>

          {/* Origin Badge */}
          <View style={styles.originBadge}>
            <Text style={styles.originText}>Artesanal</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
            
            <View style={styles.priceContainer}>
              {product.shopifyData.compareAtPrice && product.shopifyData.compareAtPrice > product.price && (
                <Text style={styles.originalPrice}>
                  {CurrencyService.formatCLPSimple(product.shopifyData.compareAtPrice)}
                </Text>
              )}
              <Text style={styles.price}>{CurrencyService.formatCLPSimple(product.price)}</Text>
            </View>
          </View>

          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>

          <View style={styles.metadata}>
            <View style={styles.brandContainer}>
              <Text style={styles.brand}>{product.brand}</Text>
              {product.size && <Text style={styles.size}> • {product.size}</Text>}
            </View>
            
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 2).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.stockInfo}>
              <Package size={12} color={product.inStock ? "#10B981" : "#EF4444"} strokeWidth={2} />
              <Text style={[styles.stockText, { color: product.inStock ? "#10B981" : "#EF4444" }]}>
                {product.inStock ? 'Disponible' : 'Agotado'}
              </Text>
            </View>

            {product.inStock && onAddToCart && (
              <TouchableOpacity 
                style={styles.addButton}
                onPress={(e) => {
                  e.stopPropagation();
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAddToCart();
                }}
              >
                <Plus size={16} color="#000000" strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>

          {/* Shopify Data Info (for debugging) */}
          {__DEV__ && (
            <View style={styles.debugInfo}>
              <Text style={styles.debugText}>SKU: {product.shopifyData.sku}</Text>
              <Text style={styles.debugText}>Handle: {product.shopifyData.handle}</Text>
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
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  imageContainer: {
    position: 'relative',
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  badgesContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    gap: 8,
  },
  shopifyBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  shopifyBadgeText: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  outOfStockBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  discountBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  originBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  originText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#666666',
    textDecorationLine: 'line-through',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  description: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  metadata: {
    marginBottom: 12,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  brand: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  size: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  tag: {
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugInfo: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
  },
  debugText: {
    fontSize: 10,
    color: '#666666',
    fontFamily: 'monospace',
  },
});