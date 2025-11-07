// BLOCK: Importaciones
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Pressable, Image, ActivityIndicator, RefreshControl, Dimensions, Platform, Animated, TextInput, Modal, ScrollView } from 'react-native';
import axios from 'axios';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// BLOCK: Constantes globales
const { width } = Dimensions.get('window');
const BASE_URL = 'https://ad8e9432352d.ngrok-free.app';

// BLOCK: Tipos para categorías y ordenamiento
type SortOption = 'name' | 'price-low' | 'price-high' | 'newest';

// BLOCK: Interface Product corregida con los campos de tu BD
interface Product {
  _id: string;
  codeqr: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imageUrl: string;
  stock: number;
  category: string; // Campo corregido según tu BD
  updatedAt: string;
  __v: number;
}

// BLOCK: Componente principal
export default function Products() {
  // BLOCK: Estado
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('name');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showCategoriesDropdown, setShowCategoriesDropdown] = useState(false);

  // BLOCK: Categorías predefinidas basadas en tu BD
  const [categories] = useState<{id: string, name: string, icon: string}[]>([
    { id: 'all', name: 'Todos los Productos', icon: 'grid' },
    { id: 'dulce', name: 'Dulces y Snacks', icon: 'ice-cream' },
    { id: 'agua', name: 'Bebidas', icon: 'beer' },
    { id: 'comida', name: 'Comida', icon: 'fast-food' },
   // { id: 'limpieza', name: 'Limpieza', icon: 'home' },
   // { id: 'personal', name: 'Cuidado Personal', icon: 'body' },
   // { id: 'lacteos', name: 'Lácteos', icon: 'water' },
  //  { id: 'panaderia', name: 'Panadería', icon: 'bread' },
    //{ id: 'congelados', name: 'Congelados', icon: 'snow' }
  ]);

  // BLOCK: Efectos
  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      filterAndSortProducts();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }
  }, [products, searchQuery, sortOption, selectedCategory]);

  // BLOCK: Funciones
  const fetchProducts = async () => {
    try {
      console.log('Consultando lista de productos...');
      const response = await axios.get(`${BASE_URL}/products`);
      console.log('Productos encontrados:', response.data);
      setProducts(response.data);
      setError('');
    } catch (err: any) {
      console.error('Error al cargar productos:', err);
      setError('No se pudieron cargar los productos. Verifica la conexión.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterAndSortProducts = () => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.codeqr.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filtrar por categoría
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => {
        if (product.category) {
          return product.category.toLowerCase() === selectedCategory.toLowerCase();
        }
        return false;
      });
    }

    // Ordenar
    switch (sortOption) {
      case 'name':
        filtered.sort((a, b) => a.nombre.localeCompare(b.nombre));
        break;
      case 'price-low':
        filtered.sort((a, b) => a.precio - b.precio);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.precio - a.precio);
        break;
      case 'newest':
        filtered.sort((a, b) => b.codeqr.localeCompare(a.codeqr));
        break;
    }

    setFilteredProducts(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const handleProductPress = (product: Product) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  // Función para obtener el nombre de la categoría del producto - CORREGIDA
  const getProductCategoryName = (product: Product) => {
    if (!product.category) return 'General';
    
    const category = categories.find(cat => 
      cat.id.toLowerCase() === product.category?.toLowerCase()
    );
    return category ? category.name : product.category;
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{
          translateY: fadeAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [30, 0]
          })
        }]
      }}
    >
      <Pressable
        style={({ pressed }) => [
          styles.productItem,
          pressed && styles.productItemPressed,
          { marginLeft: index % 2 !== 0 ? 8 : 0 },
        ]}
        onPress={() => handleProductPress(item)}
      >
        <LinearGradient
          colors={['#FFFFFF', '#FFF9F0']}
          style={styles.gradient}
        >
          {item.imageUrl ? (
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
            </View>
          ) : (
            <View style={[styles.imageContainer, styles.placeholderContainer]}>
              <Ionicons name="cube-outline" size={28} color="#E0E0E0" />
            </View>
          )}
          
          <View style={styles.productDetails}>
            <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.descripcion}
            </Text>
            
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>
                {getProductCategoryName(item)}
              </Text>
            </View>
            
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>S/. {item.precio.toFixed(2)}</Text>
              <View style={styles.productCodeContainer}>
                <Text style={styles.productCode}>{item.codeqr}</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  // BLOCK: Renderizado condicional
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FF9800" />
          <Text style={styles.error}>{error}</Text>
          <Pressable 
            style={styles.retryButton}
            onPress={fetchProducts}
          >
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // BLOCK: Renderizado principal
  return (
    <SafeAreaView style={styles.container}>
      {/* BLOCK: Header Bien Acomodado */}
      <LinearGradient
        colors={['#FFFFFF', '#FFFBEB']}
        style={styles.headerGradient}
      >
        <View style={styles.statusBarSpacer} />
        
        {/* Título y contador */}
        <View style={styles.headerTop}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Qhatu Marca App</Text>
            <Text style={styles.headerTitle}>Catálogo de Productos</Text>
          </View>
          <Text style={styles.productCount}>{filteredProducts.length} productos</Text>
        </View>

        {/* Barra de búsqueda */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInnerContainer}>
            <Ionicons name="search" size={20} color="#9E9E9E" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar productos..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9E9E9E"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
                <Ionicons name="close-circle" size={20} color="#9E9E9E" />
              </Pressable>
            )}
          </View>
        </View>

        {/* Fila de filtros compacta */}
        <View style={styles.filtersContainer}>
          {/* Selector de categorías desplegable profesional */}
          <View style={styles.categoryDropdownWrapper}>
            <Pressable 
              style={({ pressed }) => [
                styles.categorySelector,
                pressed && styles.categorySelectorPressed
              ]}
              onPress={() => setShowCategoriesDropdown(!showCategoriesDropdown)}
            >
              <Ionicons name="filter" size={18} color="#5D4037" />
              <Text style={styles.categorySelectorText}>
                {selectedCategory === 'all' 
                  ? 'Todas las categorías' 
                  : categories.find(cat => cat.id === selectedCategory)?.name
                }
              </Text>
              <Ionicons 
                name={showCategoriesDropdown ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#5D4037" 
              />
            </Pressable>

            {/* Dropdown de categorías - POSICIONADO CORRECTAMENTE */}
            {showCategoriesDropdown && (
              <View style={styles.dropdownOverlay}>
                <View style={styles.dropdown}>
                  <ScrollView 
                    style={styles.dropdownScroll} 
                    showsVerticalScrollIndicator={false}
                    nestedScrollEnabled={true}
                  >
                    {categories.map((category) => (
                      <Pressable
                        key={category.id}
                        style={({ pressed }) => [
                          styles.dropdownItem,
                          selectedCategory === category.id && styles.dropdownItemSelected,
                          pressed && styles.dropdownItemPressed,
                        ]}
                        onPress={() => {
                          setSelectedCategory(category.id);
                          setShowCategoriesDropdown(false);
                        }}
                      >
                        <Ionicons 
                          name={category.icon as any} 
                          size={18} 
                          color={selectedCategory === category.id ? '#FFFFFF' : '#FF9800'} 
                        />
                        <Text style={[
                          styles.dropdownItemText,
                          selectedCategory === category.id && styles.dropdownItemTextSelected
                        ]}>
                          {category.name}
                        </Text>
                        {selectedCategory === category.id && (
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        )}
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>
              </View>
            )}
          </View>

          {/* Botón de ordenamiento */}
          <Pressable 
            style={({ pressed }) => [
              styles.sortButton,
              pressed && styles.sortButtonPressed
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <Ionicons name="swap-vertical" size={18} color="#5D4037" />
          </Pressable>
        </View>
      </LinearGradient>
      
      {/* BLOCK: Lista de productos */}
      <FlatList
        style={{ zIndex: 0 }}  // Agrega esto
        data={filteredProducts}
        renderItem={renderProductItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        numColumns={2}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#FFC107']}
            tintColor={'#FFC107'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="search-outline" size={50} color="#FFD54F" />
            <Text style={styles.emptyTitle}>No se encontraron productos</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? `No hay resultados para "${searchQuery}"` : 'Intenta cambiar los filtros'}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* BLOCK: Modal de ordenamiento */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowSortModal(false)}>
          <View style={styles.sortModal}>
            <Text style={styles.sortModalTitle}>Ordenar por</Text>
            {(['name', 'price-low', 'price-high', 'newest'] as SortOption[]).map(option => (
              <Pressable
                key={option}
                style={styles.sortOption}
                onPress={() => {
                  setSortOption(option);
                  setShowSortModal(false);
                }}
              >
                <Ionicons 
                  name={sortOption === option ? "radio-button-on" : "radio-button-off"} 
                  size={20} 
                  color={sortOption === option ? "#FF9800" : "#9E9E9E"} 
                />
                <Text style={[
                  styles.sortOptionText,
                  sortOption === option && styles.sortOptionTextSelected
                ]}>
                  {option === 'name' && 'Nombre (A-Z)'}
                  {option === 'price-low' && 'Precio (Menor a Mayor)'}
                  {option === 'price-high' && 'Precio (Mayor a Menor)'}
                  {option === 'newest' && 'Más Recientes'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>

      {/* BLOCK: Modal de detalles del producto */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        {selectedProduct && (
          <View style={styles.modalContainer}>
            <LinearGradient
              colors={['#FFFBEB', '#FFF3E0']}
              style={styles.modalHeader}
            >
              <Pressable 
                style={styles.modalCloseButton}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons name="chevron-down" size={24} color="#5D4037" />
              </Pressable>
              <Text style={styles.modalTitle}>Detalles del Producto</Text>
              <View style={{ width: 24 }} />
            </LinearGradient>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedProduct.imageUrl ? (
                <Image
                  source={{ uri: selectedProduct.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.modalPlaceholder}>
                  <Ionicons name="cube-outline" size={60} color="#E0E0E0" />
                  <Text style={styles.modalPlaceholderText}>Imagen no disponible</Text>
                </View>
              )}

              <View style={styles.modalDetails}>
                <Text style={styles.modalProductName}>{selectedProduct.nombre}</Text>
                <Text style={styles.modalProductDescription}>
                  {selectedProduct.descripcion}
                </Text>

                <View style={styles.specsGrid}>
                  <View style={styles.specItem}>
                    <Ionicons name="pricetag-outline" size={20} color="#FF9800" />
                    <Text style={styles.specLabel}>Precio</Text>
                    <Text style={styles.specValue}>S/. {selectedProduct.precio.toFixed(2)}</Text>
                  </View>
                  
                  <View style={styles.specItem}>
                    <Ionicons name="barcode-outline" size={20} color="#FF9800" />
                    <Text style={styles.specLabel}>Código</Text>
                    <Text style={styles.specValue}>{selectedProduct.codeqr}</Text>
                  </View>
                  
                  <View style={styles.specItem}>
                    <Ionicons name="grid-outline" size={20} color="#FF9800" />
                    <Text style={styles.specLabel}>Categoría</Text>
                    <Text style={styles.specValue}>
                      {getProductCategoryName(selectedProduct)}
                    </Text>
                  </View>
                  
                  <View style={styles.specItem}>
                    <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" />
                    <Text style={styles.specLabel}>Estado</Text>
                    <Text style={[styles.specValue, { color: '#4CAF50' }]}>
                      {selectedProduct.stock > 0 ? 'En Stock' : 'Sin Stock'}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

// BLOCK: Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 44 : 30,
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    paddingBottom: 16,
    zIndex: 10,  // Agrega esto para que el header (y su dropdown absolute) quede encima del FlatList
    overflow: 'visible',  // Asegura que el contenido absolute no se corte (aunque es default, a veces ayuda en Android)
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5D4037',
    marginBottom: 0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  productCount: {
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '500',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#5D4037',
    padding: 0,
  },
  clearSearchButton: {
    padding: 2,
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    gap: 12,
    position: 'relative',
    zIndex: 1000,
  },
  categoryDropdownWrapper: {
    flex: 1,
    position: 'relative',
    zIndex: 1001,
  },
  categorySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  categorySelectorPressed: {
    backgroundColor: '#FFE0B2',
  },
  categorySelectorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
    marginLeft: 8,
    marginRight: 8,
  },
  dropdownOverlay: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1002,
    marginTop: 4,
  },
  dropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 200,
    zIndex: 1003,
  },
  dropdownScroll: {
    maxHeight: 200,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemSelected: {
    backgroundColor: '#FF9800',
  },
  dropdownItemPressed: {
    backgroundColor: '#FFF3E0',
  },
  dropdownItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: '#5D4037',
    marginLeft: 12,
  },
  dropdownItemTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortButton: {
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFE0B2',
    marginTop: 0,
  },
  sortButtonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: '#FFE0B2',
  },
  listContent: {
    padding: 12,
    paddingBottom: 20,
  },
  productItem: {
    width: (width - 32) / 2,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  productItemPressed: {
    transform: [{ scale: 0.98 }],
  },
  gradient: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    height: 120,
    backgroundColor: '#FAFAFA',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  productDetails: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#37474F',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 11,
    color: '#78909C',
    lineHeight: 14,
    marginBottom: 8,
    height: 28,
  },
  categoryBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoryBadgeText: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FF9800',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#4CAF50',
  },
  productCodeContainer: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productCode: {
    fontSize: 8,
    fontWeight: '600',
    color: '#FF9800',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 14,
    color: '#5D4037',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#FFFFFF',
  },
  error: {
    fontSize: 14,
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 12,
    color: '#78909C',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sortModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  sortModalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 16,
    textAlign: 'center',
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  sortOptionText: {
    fontSize: 14,
    color: '#5D4037',
    marginLeft: 12,
    flex: 1,
  },
  sortOptionTextSelected: {
    color: '#FF9800',
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#5D4037',
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 200,
  },
  modalPlaceholder: {
    width: '100%',
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  modalPlaceholderText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginTop: 8,
  },
  modalDetails: {
    padding: 20,
  },
  modalProductName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 8,
  },
  modalProductDescription: {
    fontSize: 14,
    color: '#78909C',
    lineHeight: 20,
    marginBottom: 20,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  specItem: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '500',
    marginTop: 8,
    marginBottom: 4,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#5D4037',
  },
});