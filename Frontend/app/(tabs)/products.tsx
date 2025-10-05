// BLOCK: Importaciones
import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, Pressable, Image, ActivityIndicator, RefreshControl, Dimensions, Platform } from 'react-native';
import axios from 'axios';
import { Product } from '@/types';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// BLOCK: Constantes globales
const { width } = Dimensions.get('window');
const BASE_URL = 'https://63affdf4629d.ngrok-free.app';

// BLOCK: Componente principal
export default function Products() {
  // BLOCK: Estado
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  // BLOCK: Efectos
  useEffect(() => {
    fetchProducts();
  }, []);

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

  const onRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const renderProductItem = ({ item, index }: { item: Product; index: number }) => (
    <Pressable
      style={({ pressed }) => [
        styles.productItem,
        pressed && { transform: [{ scale: 0.98 }] },
        { marginLeft: index % 2 !== 0 ? 12 : 0 },
      ]}
      onPress={() => console.log(`Producto seleccionado: ${item.nombre}`)}
    >
      <LinearGradient
        colors={['#FFFFFF', '#fffef7ff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {item.imageUrl ? (
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
              onError={(e) => console.log('Error cargando imagen:', e.nativeEvent.error)}
            />
            <LinearGradient
              colors={['transparent', 'rgba(255, 193, 7, 0.3)']}
              style={styles.imageOverlay}
            />
          </View>
        ) : (
          <View style={[styles.imageContainer, styles.placeholderContainer]}>
            <Ionicons name="image-outline" size={40} color="#F5F5F5" />
          </View>
        )}
        
        <View style={styles.productDetails}>
          <Text style={styles.productCode}>{item.codeqr}</Text>
          <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
          <Text style={styles.productDescription} numberOfLines={2}>
            {item.descripcion}
          </Text>
          
          <View style={styles.priceContainer}>
            <Text style={styles.productPrice}>${item.precio.toFixed(2)}</Text>
            <Pressable style={styles.addButton}>
              <Ionicons name="add-circle" size={24} color="#4CAF50" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );

  // BLOCK: Renderizado condicional
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFC107" />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={60} color="#FFC107" />
          <Text style={styles.error}>{error}</Text>
          <Pressable style={styles.retryButton} onPress={fetchProducts}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // BLOCK: Renderizado principal
  return (
    <SafeAreaView style={styles.container}>
      {/* BLOCK: Header */}
      <View style={styles.statusBarSpacer} />
      <LinearGradient
        colors={['#ffffffff', '#ffffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Catálogo de Productos</Text>
        <View style={styles.headerIcons}>
          <Pressable style={styles.headerIconContainer}>
            <Ionicons name="search" size={24} color="#212121" />
          </Pressable>
          <Pressable style={styles.headerIconContainer}>
            <Ionicons name="filter" size={24} color="#212121" />
          </Pressable>
        </View>
      </LinearGradient>
      
      {/* BLOCK: Lista de productos */}
      <FlatList
        data={products}
        renderItem={renderProductItem}
        keyExtractor={(item) => item.codeqr}
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
            <Ionicons name="cube-outline" size={80} color="#F5F5F5" />
            <Text style={styles.emptyText}>No hay productos disponibles</Text>
            <Text style={styles.emptySubtext}>Intenta más tarde o agrega nuevos productos</Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

// BLOCK: Estilos
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFBEB', // Beige claro
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 20 : 30, // Espacio para la barra de estado
    backgroundColor: '#FFFBEB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 20,
    backgroundColor: 'transparent', // Gradiente lo cubre
    borderBottomWidth: 2,
    borderBottomColor: '#FFC107',
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#212121',
    textTransform: 'uppercase',
    letterSpacing: 1,
    flex: 1,
    textAlign: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  headerIconContainer: {
    backgroundColor: '#FFF3E0',
    padding: 8,
    borderRadius: 10,
    marginLeft: 10,
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  productItem: {
    width: (width - 40) / 2,
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#FFC107',
    elevation: 4,
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  gradient: {
    padding: 0,
  },
  imageContainer: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '40%',
  },
  placeholderContainer: {
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    padding: 12,
  },
  productCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFC107',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 6,
  },
  productDescription: {
    fontSize: 13,
    color: '#757575',
    lineHeight: 18,
    marginBottom: 12,
    height: 36,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#4CAF50',
  },
  addButton: {
    padding: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
  },
  loadingText: {
    fontSize: 16,
    color: '#212121',
    textAlign: 'center',
    marginTop: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#FFFBEB',
  },
  error: {
    fontSize: 16,
    color: '#212121',
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#FFC107',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFFBEB',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    textAlign: 'center',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
});