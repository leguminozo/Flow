import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Modal, Alert } from 'react-native';
import { Search, Plus, ShoppingCart, ArrowLeft, Filter, Star, Clock, MapPin, ChevronRight } from 'lucide-react-native';
import { getAllProducts, getAllStores } from '@/data/mockData';
import { syncProductsWithSupabase } from '@/data/shopifyData';
import { Store, StoreCategory, Product } from '@/types';
import { AppProduct } from '@/types/shopify';
import SubscriptionBuilder from '@/components/SubscriptionBuilder';
import { getStoreLogo, getStoreByHandle } from '@/lib/supabase';
import EnhancedStoreCard from '@/components/EnhancedStoreCard';
import ShopifyProductCard from '@/components/ShopifyProductCard';
import PremiumProductCard from '@/components/PremiumProductCard';
import ShopifyIntegrationStatus from '@/components/ShopifyIntegrationStatus';
import { CurrencyService } from '@/services/currencyService';
import { searchShopifyProducts } from '@/data/shopifyData';

type ViewMode = 'stores' | 'store-detail' | 'store-catalog' | 'category-products';

interface FilterOptions {
  priceRange: 'all' | 'low' | 'medium' | 'high';
  availability: 'all' | 'inStock' | 'outOfStock';
  brand: string;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'rating';
}

export default function CatalogScreen() {
  const isMounted = useRef(true);
  const [viewMode, setViewMode] = useState<ViewMode>('stores');
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [stores, setStores] = useState<Store[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<StoreCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<{[key: number]: number}>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showSubscriptionBuilder, setShowSubscriptionBuilder] = useState(false);
  const [initialProductsForBuilder, setInitialProductsForBuilder] = useState<{[key: number]: { quantity: number }}>({});
  const [filters, setFilters] = useState<FilterOptions>({
    priceRange: 'all',
    availability: 'all',
    brand: '',
    sortBy: 'name'
  });
  const [supabaseStoreData, setSupabaseStoreData] = useState<any>(null);

  // Cargar datos al montar el componente
  useEffect(() => {
    loadData();
    loadSupabaseStoreData();
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  const loadData = async () => {
    if (isMounted.current) {
      setLoading(true);
    }
    try {
      console.log('🔄 Loading stores and products...');
      const [storesData, productsData] = await Promise.all([
        getAllStores(),
        getAllProducts()
      ]);
      
      if (isMounted.current) {
        setStores(storesData);
        setAllProducts(productsData);
      }
      console.log(`✅ Loaded ${storesData.length} stores and ${productsData.length} products`);
      
      // Sincronizar con Supabase después de cargar
      await syncProductsWithSupabase();
    } catch (error) {
      console.error('❌ Error loading data:', error);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  const loadSupabaseStoreData = async () => {
    try {
      const storeData = await getStoreByHandle('obrerayzangano');
      if (storeData && isMounted.current) {
        setSupabaseStoreData(storeData);
        console.log('✅ Datos de tienda cargados desde Supabase:', storeData);
      } else if (isMounted.current) {
        Alert.alert('Error', 'No se pudo cargar los datos de la tienda desde Supabase. Usando datos locales como fallback.');
        // Fallback to mock data
        setSupabaseStoreData({
          name: 'Obrera y Zángano',
          logo_url: 'https://cdn.shopify.com/s/files/1/0123/4567/files/logo.png',
          description: 'Productos artesanales y naturales de calidad premium'
        });
      }
    } catch (error) {
      console.error('Error loading store data from Supabase:', error);
      if (isMounted.current) {
        Alert.alert('Error de Conexión', 'Hubo un problema al conectar con Supabase. Intenta de nuevo más tarde.');
      }
    }
  };

  const addToCart = (productId: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const handleProductSelectForBuilder = (product: Product) => {
    setInitialProductsForBuilder({ [product.id]: { quantity: 1 } });
    setShowSubscriptionBuilder(true);
  };

  const handleSubscriptionCreated = (data: any) => {
    console.log('Subscription created:', data);
    setShowSubscriptionBuilder(false);
    setInitialProductsForBuilder({});
  };

  const getCartTotal = () => {
    const storeProducts = allProducts; // Cambiado para usar allProducts directamente ya que getProductsByStore no existe
    return Object.entries(cart).reduce((total, [productId, quantity]) => {
      const product = storeProducts.find(p => p.id === parseInt(productId));
      return total + (product ? product.price * quantity : 0);
    }, 0);
  };

  const getCartItemsCount = () => {
    return Object.values(cart).reduce((total, quantity) => total + quantity, 0);
  };

  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
    setViewMode('store-detail');
  };

  const handleEnterStore = () => {
    if (selectedStore) {
      setViewMode('store-catalog');
    }
  };

  const handleCategorySelect = (category: StoreCategory) => {
    setSelectedCategory(category);
    setViewMode('category-products');
  };

  const handleBackToStores = () => {
    setViewMode('stores');
    setSelectedStore(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleBackToStoreDetail = () => {
    setViewMode('store-detail');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const handleBackToStoreCatalog = () => {
    setViewMode('store-catalog');
    setSelectedCategory(null);
    setSearchQuery('');
  };

  const applyFilters = (products: Product[]): Product[] => {
    let filtered = [...products];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price range filter
    if (filters.priceRange !== 'all') {
      filtered = filtered.filter(product => {
        switch (filters.priceRange) {
          case 'low': return product.price < 5000;
          case 'medium': return product.price >= 5000 && product.price < 15000;
          case 'high': return product.price >= 15000;
          default: return true;
        }
      });
    }

    // Availability filter
    if (filters.availability !== 'all') {
      filtered = filtered.filter(product => 
        filters.availability === 'inStock' ? product.inStock : !product.inStock
      );
    }

    // Brand filter
    if (filters.brand.trim()) {
      filtered = filtered.filter(product => 
        product.brand?.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case 'name': return a.name.localeCompare(b.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        case 'rating': return 4.5 - 4.0; // Mock rating sort
        default: return 0;
      }
    });

    return filtered;
  };

  const getCurrentProducts = (): Product[] => {
    if (!selectedStore) return [];
    
    // Si es la tienda de Shopify, usar productos de Shopify
    if (selectedStore.id === 'obrerayzangano' || selectedStore.handle === 'obrerayzangano') {
      if (viewMode === 'category-products' && selectedCategory) {
        // Filtrar productos de Shopify por categoría
        return allProducts.filter(product => 
          product.store === 'Obrera y Zángano' && 
          (selectedCategory.id === 'todos' || product.category === selectedCategory.name)
        );
      }
      
      if (viewMode === 'store-catalog') {
        return allProducts.filter(product => product.store === 'Obrera y Zángano');
      }
    }
    
    if (viewMode === 'category-products' && selectedCategory) {
      return allProducts.filter(product => 
        product.store === selectedStore.name && 
        (selectedCategory.id === 'todos' || product.category === selectedCategory.name)
      );
    }
    
    if (viewMode === 'store-catalog') {
      return allProducts.filter(product => product.store === selectedStore.name);
    }
    
    return [];
  };

  // Función para buscar productos (incluyendo Shopify)
  const searchProducts = async (query: string): Promise<Product[]> => {
    if (!query.trim()) return [];
    
    try {
      // Buscar en productos locales
      const localResults = allProducts.filter(product => 
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
      );
      
      // Si hay tienda de Shopify, buscar también ahí
      const shopifyStore = stores.find(store => store.id === 'obrerayzangano');
      if (shopifyStore) {
        try {
          const shopifyResults = await searchShopifyProducts(query);
          const convertedResults: Product[] = shopifyResults.map((shopifyProduct: AppProduct) => ({
            id: parseInt(shopifyProduct.id.replace(/\D/g, '')) || Math.floor(Math.random() * 1000000),
            name: shopifyProduct.name,
            description: shopifyProduct.description,
            price: shopifyProduct.price,
            image: shopifyProduct.image,
            category: shopifyProduct.category as Product['category'],
            origin: 'Local' as Product['origin'],
            store: shopifyProduct.store,
            inStock: shopifyProduct.inStock,
            tags: shopifyProduct.tags,
            brand: shopifyProduct.brand,
            size: shopifyProduct.size,
          }));
          
          // Combinar resultados evitando duplicados
          const combinedResults = [...localResults];
          convertedResults.forEach(shopifyProduct => {
            if (!combinedResults.find(p => p.name === shopifyProduct.name)) {
              combinedResults.push(shopifyProduct);
            }
          });
          
          return combinedResults;
        } catch (error) {
          console.error('Error searching Shopify products:', error);
        }
      }
      
      return localResults;
    } catch (error) {
      console.error('Error searching products:', error);
      return [];
    }
  };

  const renderStoresView = () => (
    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
      {/* Shopify Integration Status */}
      <ShopifyIntegrationStatus onRefresh={loadData} />
      
      {loading && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Cargando tiendas...</Text>
        </View>
      )}
      <View style={styles.storesGrid}>
        {stores.map((store) => (
          <EnhancedStoreCard
            key={store.id}
            store={{
              ...store,
              // Usar logo desde Supabase si está disponible para Obrera y Zángano
              logo: store.id === 'obrerayzangano' && supabaseStoreData?.logo_url ? supabaseStoreData.logo_url : store.logo,
              name: store.id === 'obrerayzangano' && supabaseStoreData?.name ? supabaseStoreData.name : store.name,
              description: store.id === 'obrerayzangano' && supabaseStoreData?.description ? supabaseStoreData.description : store.description
            }}
            onPress={() => handleStoreSelect(store)}
            isShopifyStore={store.id === 'obrerayzangano' || store.handle === 'obrerayzangano'}
            productCount={allProducts.filter(p => p.store === store.name).length}
            averagePrice={
              allProducts.filter(p => p.store === store.name).length > 0
                ? allProducts.filter(p => p.store === store.name).reduce((sum, p) => sum + p.price, 0) / 
                  allProducts.filter(p => p.store === store.name).length
                : 0
            }
          />
        ))}
      </View>
    </ScrollView>
  );

  const renderStoreDetailView = () => {
    if (!selectedStore) return null;

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.storeDetailCard}>
          <View style={styles.storeDetailHeader}>
            <Image source={{ uri: selectedStore.logo }} style={styles.storeDetailImage} />
            <View style={styles.storeDetailInfo}>
              <Text style={styles.storeDetailName}>{selectedStore.name}</Text>
              <Text style={styles.storeDetailDescription}>{selectedStore.description}</Text>
              
              <View style={styles.storeDetailMetrics}>
                <View style={styles.detailMetric}>
                  <Star size={16} color="#D4AF37" strokeWidth={2} />
                  <Text style={styles.detailMetricText}>{selectedStore.rating} estrellas</Text>
                </View>
                <View style={styles.detailMetric}>
                  <Clock size={16} color="#666666" strokeWidth={2} />
                  <Text style={styles.detailMetricText}>{selectedStore.deliveryTime}</Text>
                </View>
                <View style={styles.detailMetric}>
                  <MapPin size={16} color="#666666" strokeWidth={2} />
                  <Text style={styles.detailMetricText}>Mín: ${selectedStore.minimumOrder.toLocaleString('es-CL')}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.storeDetailSpecialties}>
            <Text style={styles.specialtiesTitle}>Especialidades:</Text>
            <View style={styles.specialtiesList}>
              {selectedStore.specialties.map((specialty, index) => (
                <View key={index} style={styles.specialtyDetailTag}>
                  <Text style={styles.specialtyDetailText}>{specialty}</Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity 
            style={[styles.enterStoreButton, !selectedStore.isActive && styles.enterStoreButtonDisabled]}
            onPress={handleEnterStore}
            disabled={!selectedStore.isActive}
          >
            <Text style={[styles.enterStoreText, !selectedStore.isActive && styles.enterStoreTextDisabled]}>
              {selectedStore.isActive ? 'Entrar a la Tienda' : 'Tienda Cerrada'}
            </Text>
            {selectedStore.isActive && (
              <ChevronRight size={20} color="#000000" strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.categoriesPreview}>
          <Text style={styles.categoriesTitle}>Categorías Disponibles:</Text>
          <View style={styles.categoriesGrid}>
            {selectedStore.categories.map((category) => (
              <View key={category.id} style={styles.categoryPreviewCard}>
                <Text style={styles.categoryPreviewIcon}>{category.icon}</Text>
                <Text style={styles.categoryPreviewName}>{category.name}</Text>
                <Text style={styles.categoryPreviewCount}>{category.productCount} productos</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderStoreCatalogView = () => {
    if (!selectedStore) return null;

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Categories */}
        <View style={styles.categoriesSection}>
          <Text style={styles.sectionTitle}>Categorías</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesScroll}
            contentContainerStyle={styles.categoriesScrollContent}
          >
            {selectedStore.categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => handleCategorySelect(category)}
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>
                <Text style={styles.categoryName}>{category.name}</Text>
                <Text style={styles.categoryCount}>{category.productCount}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* All Products */}
        <View style={styles.allProductsSection}>
          <Text style={styles.sectionTitle}>Todos los Productos</Text>
          {renderProductsList(applyFilters(getCurrentProducts()))}
        </View>
      </ScrollView>
    );
  };

  const renderCategoryProductsView = () => {
    if (!selectedStore || !selectedCategory) return null;

    const products = applyFilters(getCurrentProducts());

    return (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.categoryHeader}>
          <Text style={styles.categoryHeaderIcon}>{selectedCategory.icon}</Text>
          <View style={styles.categoryHeaderInfo}>
            <Text style={styles.categoryHeaderName}>{selectedCategory.name}</Text>
            <Text style={styles.categoryHeaderDescription}>{selectedCategory.description}</Text>
            <Text style={styles.categoryHeaderCount}>{products.length} productos disponibles</Text>
          </View>
        </View>

        {renderProductsList(products)}
      </ScrollView>
    );
  };

  const renderProductsList = (products: Product[]) => (
    <View style={styles.productsList}>
      {products.map((product) => (
        <View key={product.id} style={[
          styles.productCard,
          product.store === 'Obrera y Zángano' && styles.shopifyProductCard
        ]}>
          <PremiumProductCard
            key={product.id}
            product={product}
            onPress={() => handleProductSelectForBuilder(product)}
            showShopifyBadge={product.store === 'Obrera y Zángano'}
            variant={product.store === 'Obrera y Zángano' ? 'featured' : 'default'}
          />
        </View>
      ))}

      {products.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No se encontraron productos</Text>
          <Text style={styles.emptySubtext}>Intenta ajustar los filtros de búsqueda</Text>
        </View>
      )}
    </View>
  );

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.filtersModal}>
        <View style={styles.filtersHeader}>
          <Text style={styles.filtersTitle}>Filtros</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.filtersClose}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.filtersContent}>
          {/* Price Range */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Rango de Precio</Text>
            {[
              { value: 'all', label: 'Todos los precios' },
              { value: 'low', label: 'Menos de $5.000' },
              { value: 'medium', label: '$5.000 - $15.000' },
              { value: 'high', label: 'Más de $15.000' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.filterOption, filters.priceRange === option.value && styles.filterOptionSelected]}
                onPress={() => setFilters({...filters, priceRange: option.value as any})}
              >
                <Text style={[styles.filterOptionText, filters.priceRange === option.value && styles.filterOptionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Availability */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Disponibilidad</Text>
            {[
              { value: 'all', label: 'Todos' },
              { value: 'inStock', label: 'En stock' },
              { value: 'outOfStock', label: 'Agotado' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.filterOption, filters.availability === option.value && styles.filterOptionSelected]}
                onPress={() => setFilters({...filters, availability: option.value as any})}
              >
                <Text style={[styles.filterOptionText, filters.availability === option.value && styles.filterOptionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Sort By */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Ordenar por</Text>
            {[
              { value: 'name', label: 'Nombre A-Z' },
              { value: 'price-asc', label: 'Precio: menor a mayor' },
              { value: 'price-desc', label: 'Precio: mayor a menor' },
              { value: 'rating', label: 'Mejor valorados' }
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[styles.filterOption, filters.sortBy === option.value && styles.filterOptionSelected]}
                onPress={() => setFilters({...filters, sortBy: option.value as any})}
              >
                <Text style={[styles.filterOptionText, filters.sortBy === option.value && styles.filterOptionTextSelected]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Brand Filter */}
          <View style={styles.filterGroup}>
            <Text style={styles.filterGroupTitle}>Marca</Text>
            <TextInput
              style={styles.brandInput}
              placeholder="Buscar por marca..."
              placeholderTextColor="#666666"
              value={filters.brand}
              onChangeText={(text) => setFilters({...filters, brand: text})}
            />
          </View>
        </ScrollView>

        <View style={styles.filtersActions}>
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={() => setFilters({
              priceRange: 'all',
              availability: 'all',
              brand: '',
              sortBy: 'name'
            })}
          >
            <Text style={styles.clearFiltersText}>Limpiar Filtros</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.applyFiltersButton}
            onPress={() => setShowFilters(false)}
          >
            <Text style={styles.applyFiltersText}>Aplicar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const getHeaderTitle = () => {
    switch (viewMode) {
      case 'stores': return 'Catálogo';
      case 'store-detail': return selectedStore?.name || 'Tienda';
      case 'store-catalog': return `${selectedStore?.name} - Catálogo`;
      case 'category-products': return `${selectedStore?.name} - ${selectedCategory?.name}`;
      default: return 'Catálogo';
    }
  };

  const getHeaderSubtitle = () => {
    switch (viewMode) {
      case 'stores': return 'Tiendas disponibles para entrega';
      case 'store-detail': return 'Información de la tienda';
      case 'store-catalog': return 'Explora todas las categorías';
      case 'category-products': return selectedCategory?.description || '';
      default: return '';
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {viewMode !== 'stores' && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (viewMode === 'category-products') handleBackToStoreCatalog();
                else if (viewMode === 'store-catalog') handleBackToStoreDetail();
                else if (viewMode === 'store-detail') handleBackToStores();
              }}
            >
              <ArrowLeft size={24} color="#D4AF37" strokeWidth={2} />
            </TouchableOpacity>
          )}
          <View style={styles.headerTitles}>
            <Text style={styles.title}>{getHeaderTitle()}</Text>
            <Text style={styles.subtitle}>{getHeaderSubtitle()}</Text>
          </View>
        </View>

        {/* Search and Filters - Only show in catalog views */}
        {(viewMode === 'store-catalog' || viewMode === 'category-products') && (
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <Search size={20} color="#666666" strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar productos..."
                placeholderTextColor="#666666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity 
              style={styles.filterButton}
              onPress={() => setShowFilters(true)}
            >
              <Filter size={20} color="#D4AF37" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      {viewMode === 'stores' && renderStoresView()}
      {viewMode === 'store-detail' && renderStoreDetailView()}
      {viewMode === 'store-catalog' && renderStoreCatalogView()}
      {viewMode === 'category-products' && renderCategoryProductsView()}

      {/* Cart Summary */}
      {getCartItemsCount() > 0 && (
        <View style={styles.cartSummary}>
          <View style={styles.cartInfo}>
            <ShoppingCart size={20} color="#D4AF37" strokeWidth={2} />
            <Text style={styles.cartText}>
              {getCartItemsCount()} productos - {CurrencyService.formatCLPSimple(Math.round(getCartTotal()))}
            </Text>
          </View>
          <TouchableOpacity style={styles.cartButton}>
            <Text style={styles.cartButtonText}>Ver Carrito</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Filters Modal */}
      {renderFiltersModal()}

      {/* Subscription Builder Modal */}
      <Modal
        visible={showSubscriptionBuilder}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SubscriptionBuilder
          mode={Object.keys(initialProductsForBuilder).length > 0 ? 'personalized' : 'exploratory'}
          products={allProducts}
          initialProducts={Object.keys(initialProductsForBuilder).length > 0 ? 
            allProducts.filter(p => initialProductsForBuilder[p.id]) : []}
          onSubscriptionCreate={handleSubscriptionCreated}
          onClose={() => setShowSubscriptionBuilder(false)}
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
    paddingTop: 70,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a2a',
    backgroundColor: '#000000',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#2a2a2a',
    padding: 12,
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerTitles: {
    flex: 1,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#B8B8B8',
    fontWeight: '500',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#404040',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 17,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  filterButton: {
    backgroundColor: '#2a2a2a',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  content: {
    flex: 1,
  },
  // Stores View Styles
  storesGrid: {
    padding: 20,
    gap: 20,
  },
  storeCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
  },
  storeCardClosed: {
    opacity: 0.6,
  },
  storeImageContainer: {
    position: 'relative',
    height: 120,
  },
  storeImage: {
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
  storeTypeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  storeTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#000000',
  },
  storeInfo: {
    padding: 20,
  },
  storeName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  storeDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  storeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  metricText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 4,
  },
  storeSpecialties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
  // Store Detail View Styles
  storeDetailCard: {
    backgroundColor: '#1a1a1a',
    margin: 24,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  storeDetailHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  storeDetailImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  storeDetailInfo: {
    flex: 1,
  },
  storeDetailName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  storeDetailDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 12,
  },
  storeDetailMetrics: {
    gap: 8,
  },
  detailMetric: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailMetricText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 6,
  },
  storeDetailSpecialties: {
    marginBottom: 20,
  },
  specialtiesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  specialtiesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  specialtyDetailTag: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  specialtyDetailText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  enterStoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 12,
  },
  enterStoreButtonDisabled: {
    backgroundColor: '#333333',
  },
  enterStoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  enterStoreTextDisabled: {
    color: '#666666',
  },
  categoriesPreview: {
    margin: 24,
    marginTop: 0,
  },
  categoriesTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryPreviewCard: {
    backgroundColor: '#1a1a1a',
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryPreviewIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryPreviewName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryPreviewCount: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  // Store Catalog View Styles
  categoriesSection: {
    padding: 24,
    paddingBottom: 0,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  categoriesScroll: {
    marginHorizontal: -24,
    paddingLeft: 24,
  },
  categoriesScrollContent: {
    paddingRight: 24,
  },
  categoryCard: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 12,
    minWidth: 100,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  allProductsSection: {
    padding: 24,
  },
  // Category Products View Styles
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#1a1a1a',
    margin: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  categoryHeaderIcon: {
    fontSize: 48,
    marginRight: 16,
  },
  categoryHeaderInfo: {
    flex: 1,
  },
  categoryHeaderName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  categoryHeaderDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 8,
  },
  categoryHeaderCount: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
  },
  // Products List Styles
  productsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  productCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  shopifyProductCard: {
    backgroundColor: '#1a1a1a',
    borderColor: '#333333',
    borderWidth: 1,
    borderRadius: 12,
    padding: 8,
  },
  productCardDisabled: {
    opacity: 0.6,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  outOfStockOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
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
  productBrand: {
    fontSize: 12,
    color: '#D4AF37',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
    marginBottom: 8,
  },
  productTags: {
    flexDirection: 'row',
    gap: 4,
  },
  productTag: {
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
  },
  productTagText: {
    fontSize: 10,
    color: '#CCCCCC',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  addButtonDisabled: {
    backgroundColor: '#333333',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    margin: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  loadingText: {
    fontSize: 18,
    color: '#D4AF37',
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  // Cart Summary Styles
  cartSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  cartInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  cartText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 8,
    fontWeight: '500',
  },
  cartButton: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  cartButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  // Filters Modal Styles
  filtersModal: {
    flex: 1,
    backgroundColor: '#000000',
  },
  filtersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  filtersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  filtersClose: {
    fontSize: 24,
    color: '#CCCCCC',
    padding: 8,
  },
  filtersContent: {
    flex: 1,
    paddingHorizontal: 24,
  },
  filterGroup: {
    marginBottom: 32,
  },
  filterGroupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  filterOption: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  filterOptionSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  filterOptionTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  brandInput: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#333333',
  },
  filtersActions: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    gap: 12,
  },
  clearFiltersButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555555',
  },
  clearFiltersText: {
    fontSize: 16,
    color: '#CCCCCC',
    fontWeight: '500',
  },
  applyFiltersButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  applyFiltersText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '600',
  },
});