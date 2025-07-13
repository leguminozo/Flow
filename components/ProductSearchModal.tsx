import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Modal } from 'react-native';
import { Search, X, Plus, Check } from 'lucide-react-native';
import { mockProducts } from '@/data/mockData';
import { Product } from '@/types';
import * as Animatable from 'react-native-animatable';
import * as Haptics from 'expo-haptics';

interface ProductSearchModalProps {
  visible: boolean;
  onClose: () => void;
  onProductSelect: (product: Product) => void;
  excludeProductIds?: number[];
}

export default function ProductSearchModal({ visible, onClose, onProductSelect, excludeProductIds = [] }: ProductSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const categories = [
    { id: 'Todos', label: 'Todos', icon: '🛒' },
    { id: 'Alimentos', label: 'Alimentos', icon: '🥗' },
    { id: 'Bebidas', label: 'Bebidas', icon: '☕' },
    { id: 'Limpieza', label: 'Limpieza', icon: '🧽' },
    { id: 'Cuidado Personal', label: 'Cuidado', icon: '🧴' },
    { id: 'Papel', label: 'Papel', icon: '🧻' },
    { id: 'Otros', label: 'Otros', icon: '📦' }
  ];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.store.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    const notExcluded = !excludeProductIds.includes(product.id);
    return matchesSearch && matchesCategory && notExcluded;
  });

  const handleProductSelect = (product: Product) => {
    onProductSelect(product);
    setSearchQuery('');
    setSelectedCategory('Todos');
    onClose();
  };

  const getProductBadges = (product: Product) => {
    const badges = [];
    
    if (product.origin === 'Local') {
      badges.push({ text: 'Local', color: '#10B981' });
    }
    
    if (product.tags.includes('Orgánica') || product.tags.includes('Natural')) {
      badges.push({ text: 'Eco', color: '#059669' });
    }
    
    if (product.tags.includes('Premium') || product.tags.includes('Artesanal')) {
      badges.push({ text: 'Premium', color: '#D4AF37' });
    }
    
    return badges;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <X size={24} color="#CCCCCC" strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.title}>Buscar Producto</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666666" strokeWidth={2} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos, marcas, tiendas..."
              placeholderTextColor="#666666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearch}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Categories */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesContainer}
          contentContainerStyle={styles.categoriesContent}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Text style={styles.categoryIcon}>{category.icon}</Text>
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsCount}>
            {filteredProducts.length} productos encontrados
          </Text>
        </View>

        {/* Products List */}
        <ScrollView style={styles.productsList} showsVerticalScrollIndicator={false}>
          {filteredProducts.map((product, idx) => {
            const badges = getProductBadges(product);
            return (
              <Animatable.View key={product.id} animation="fadeInUp" delay={idx * 40} duration={400} useNativeDriver>
                <TouchableOpacity
                  style={styles.productCard}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    handleProductSelect(product);
                  }}
                >
                  <View style={styles.productImageContainer}>
                    <Image source={{ uri: product.image }} style={styles.productImage} />
                    {!product.inStock && (
                      <View style={styles.outOfStockOverlay}>
                        <Text style={styles.outOfStockText}>Agotado</Text>
                      </View>
                    )}
                    <View style={styles.originBadge}>
                      <Text style={styles.originText}>{product.origin}</Text>
                    </View>
                  </View>
                  <View style={styles.productInfo}>
                    <View style={styles.productHeader}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        ${product.price.toLocaleString('es-CL')}
                      </Text>
                    </View>
                    <Text style={styles.productDescription} numberOfLines={2}>
                      {product.description}
                    </Text>
                    <View style={styles.productMeta}>
                      <Text style={styles.productStore}>{product.store}</Text>
                      <View style={styles.productBadges}>
                        {badges.slice(0, 2).map((badge, index) => (
                          <View key={index} style={[styles.productBadge, { backgroundColor: badge.color }]}> 
                            <Text style={styles.productBadgeText}>{badge.text}</Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  </View>
                  <View style={styles.selectButton}>
                    <Plus size={20} color="#D4AF37" strokeWidth={2} />
                  </View>
                </TouchableOpacity>
              </Animatable.View>
            );
          })}

          {filteredProducts.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🔍</Text>
              <Text style={styles.emptyStateTitle}>No se encontraron productos</Text>
              <Text style={styles.emptyStateDescription}>
                Intenta ajustar los filtros o términos de búsqueda
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
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
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  searchContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  clearSearch: {
    fontSize: 16,
    color: '#666666',
    paddingHorizontal: 8,
  },
  categoriesContainer: {
    paddingLeft: 24,
    marginBottom: 16,
  },
  categoriesContent: {
    paddingRight: 24,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryChipActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#000000',
  },
  resultsHeader: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  resultsCount: {
    fontSize: 14,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  productsList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
    padding: 16,
    alignItems: 'center',
  },
  productImageContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  originBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
  },
  originText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#000000',
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  productDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productStore: {
    fontSize: 12,
    color: '#666666',
  },
  productBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  productBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  productBadgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  selectButton: {
    backgroundColor: '#333333',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptyStateDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
});