import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Plus, Star, Package, Zap, Heart, ShoppingCart } from 'lucide-react-native';
import { Product } from '@/types';
import { CurrencyService } from '@/services/currencyService';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

interface PremiumProductCardProps {
  product: Product;
  onPress: () => void;
  onAddToCart?: () => void;
  onAddToFavorites?: () => void;
  isFavorite?: boolean;
  showShopifyBadge?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export default function PremiumProductCard({ 
  product, 
  onPress, 
  onAddToCart,
  onAddToFavorites,
  isFavorite = false,
  showShopifyBadge = false,
  variant = 'default'
}: PremiumProductCardProps) {
  const isShopifyProduct = product.store === 'Obrera y Zángano';
  const isCompact = variant === 'compact';
  const isFeatured = variant === 'featured';

  const getOriginBadgeColor = () => {
    switch (product.origin) {
      case 'Local': return '#10B981';
      case 'Especializado': return '#D4AF37';
      case 'Supermercado': return '#3B82F6';
      default: return '#6B7280';
    }
  };

  const getOriginBadgeText = () => {
    switch (product.origin) {
      case 'Local': return '🌱 Local';
      case 'Especializado': return '✨ Premium';
      case 'Supermercado': return '🏪 Super';
      default: return product.origin;
    }
  };

  return (
    <Animatable.View animation="fadeInUp" duration={500} useNativeDriver>
      <TouchableOpacity 
        style={[
          styles.container,
          isCompact && styles.compactContainer,
          isFeatured && styles.featuredContainer,
          !product.inStock && styles.outOfStockContainer
        ]} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onPress();
        }}
        activeOpacity={0.8}
      >
        {/* Image Container */}
        <View style={[styles.imageContainer, isCompact && styles.compactImageContainer]}>
          <Image source={{ uri: product.image }} style={styles.image} />
          
          {/* Gradient Overlay */}
          <View style={styles.imageGradient} />
          
          {/* Top Badges */}
          <View style={styles.topBadges}>
            {!product.inStock && (
              <View style={styles.outOfStockBadge}>
                <Text style={styles.outOfStockText}>Agotado</Text>
              </View>
            )}
            
            {isShopifyProduct && showShopifyBadge && (
              <View style={styles.shopifyBadge}>
                <Zap size={10} color="#000000" strokeWidth={2} />
                <Text style={styles.shopifyBadgeText}>Live</Text>
              </View>
            )}
          </View>

          {/* Origin Badge */}
          <View style={[styles.originBadge, { backgroundColor: getOriginBadgeColor() }]}>
            <Text style={styles.originText}>{getOriginBadgeText()}</Text>
          </View>

          {/* Favorite Button */}
          {onAddToFavorites && !isCompact && (
            <TouchableOpacity 
              style={styles.favoriteButton}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onAddToFavorites();
              }}
            >
              <Heart 
                size={16} 
                color={isFavorite ? "#EF4444" : "#FFFFFF"} 
                strokeWidth={2}
                fill={isFavorite ? "#EF4444" : "transparent"}
              />
            </TouchableOpacity>
          )}

          {/* Stock Indicator */}
          <View style={[styles.stockIndicator, { backgroundColor: product.inStock ? '#10B981' : '#EF4444' }]} />
        </View>

        {/* Content */}
        <View style={[styles.content, isCompact && styles.compactContent]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.name, isCompact && styles.compactName]} numberOfLines={isCompact ? 1 : 2}>
              {product.name}
            </Text>
            
            {!isCompact && (
              <View style={styles.storeInfo}>
                <Text style={styles.storeName}>{product.store}</Text>
                {product.brand && (
                  <Text style={styles.brandName}>• {product.brand}</Text>
                )}
              </View>
            )}
          </View>

          {/* Description */}
          {!isCompact && (
            <Text style={styles.description} numberOfLines={2}>
              {product.description}
            </Text>
          )}

          {/* Tags */}
          {!isCompact && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
              {product.tags.length > 3 && (
                <Text style={styles.moreTags}>+{product.tags.length - 3}</Text>
              )}
            </View>
          )}

          {/* Price and Actions */}
          <View style={styles.footer}>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, isFeatured && styles.featuredPrice]}>
                {CurrencyService.formatProductPrice(product.price)}
              </Text>
              {product.size && (
                <Text style={styles.size}>{product.size}</Text>
              )}
            </View>

            <View style={styles.actions}>
              {onAddToCart && product.inStock && (
                <TouchableOpacity 
                  style={[styles.addButton, isFeatured && styles.featuredAddButton]}
                  onPress={(e) => {
                    e.stopPropagation();
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onAddToCart();
                  }}
                >
                  {isCompact ? (
                    <Plus size={16} color="#000000" strokeWidth={2} />
                  ) : (
                    <>
                      <ShoppingCart size={16} color="#000000" strokeWidth={2} />
                      <Text style={styles.addButtonText}>Agregar</Text>
                    </>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Quality Indicators */}
          {!isCompact && (
            <View style={styles.qualityIndicators}>
              {product.tags.includes('Orgánica') && (
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityText}>🌱 Orgánico</Text>
                </View>
              )}
              {product.tags.includes('Artesanal') && (
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityText}>👐 Artesanal</Text>
                </View>
              )}
              {product.tags.includes('Premium') && (
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityText}>⭐ Premium</Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Featured Glow Effect */}
        {isFeatured && (
          <View style={styles.featuredGlow} />
        )}
      </TouchableOpacity>
    </Animatable.View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1a1a1a',
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 10,
  },
  compactContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    borderRadius: 20,
  },
  featuredContainer: {
    borderColor: '#D4AF37',
    borderWidth: 2,
    shadowColor: '#D4AF37',
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  outOfStockContainer: {
    opacity: 0.6,
  },
  imageContainer: {
    position: 'relative',
    height: 160,  // Reduced from 240 for smaller icons
  },
  compactImageContainer: {
    width: 110,
    height: 110,
    borderRadius: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '60%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  topBadges: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    gap: 8,
  },
  outOfStockBadge: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  outOfStockText: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  shopifyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 3,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  shopifyBadgeText: {
    fontSize: 10,
    color: '#000000',
    fontWeight: '700',
  },
  originBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  originText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
    borderRadius: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  stockIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 10,
    height: 10,
    borderRadius: 5,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  content: {
    padding: 24,
  },
  compactContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  header: {
    marginBottom: 12,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  compactName: {
    fontSize: 16,
    marginBottom: 4,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  storeName: {
    fontSize: 13,
    color: '#D4AF37',
    fontWeight: '700',
  },
  brandName: {
    fontSize: 13,
    color: '#B8B8B8',
    marginLeft: 4,
    fontWeight: '500',
  },
  description: {
    fontSize: 15,
    color: '#B8B8B8',
    lineHeight: 22,
    marginBottom: 16,
    fontWeight: '400',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 20,
  },
  tag: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#404040',
  },
  tagText: {
    fontSize: 11,
    color: '#B8B8B8',
    fontWeight: '500',
  },
  moreTags: {
    fontSize: 11,
    color: '#808080',
    alignSelf: 'center',
    fontWeight: '500',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  featuredPrice: {
    fontSize: 26,
  },
  size: {
    fontSize: 13,
    color: '#808080',
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  featuredAddButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  addButtonText: {
    fontSize: 15,
    color: '#000000',
    fontWeight: '700',
  },
  qualityIndicators: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 16,
  },
  qualityBadge: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  qualityText: {
    fontSize: 11,
    color: '#D4AF37',
    fontWeight: '700',
  },
  featuredGlow: {
    position: 'absolute',
    top: -3,
    left: -3,
    right: -3,
    bottom: -3,
    borderRadius: 27,
    backgroundColor: '#D4AF37',
    opacity: 0.2,
    zIndex: -1,
  },
});