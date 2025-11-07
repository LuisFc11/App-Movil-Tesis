import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  Pressable,
  Modal,
  Dimensions,
  Platform,
  Image,
  ScrollView,
  Animated
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');
const BASE_URL = 'https://ad8e9432352d.ngrok-free.app';

interface Product {
  id: string;
  codeqr: string;
  nombre: string;
  precio: number;
  stock: number;
  category: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  descripcion?: string;
}

export default function Scanner() {
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing] = useState<CameraType>('back');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);
  const [scanning, setScanning] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    console.log('Componente Scanner montado');
    if (isFocused) {
      setScanning(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [isFocused]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#FFFBEB', '#FFF3E0']}
          style={styles.permissionGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statusBarSpacer} />
          <View style={styles.permissionContent}>
            <View style={styles.permissionIconContainer}>
              <LinearGradient
                colors={['#FFC107', '#FF9800']}
                style={styles.permissionIconGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="camera-outline" size={40} color="#FFFFFF" />
              </LinearGradient>
            </View>
            <Text style={styles.permissionTitle}>Permisos de Cámara</Text>
            <Text style={styles.permissionText}>
              Necesitamos acceso a tu cámara para escanear códigos QR de productos
            </Text>
            <Pressable 
              style={({ pressed }) => [
                styles.permissionButton,
                pressed && styles.permissionButtonPressed
              ]} 
              onPress={requestPermission}
            >
              <LinearGradient
                colors={['#FFC107', '#FF9800']}
                style={styles.permissionButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="camera" size={20} color="#FFFFFF" />
                <Text style={styles.permissionButtonText}>Conceder Permisos</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    console.log('Código QR escaneado:', data);
    if (!scanning) return;

    setScanning(false);
    try {
      console.log('Consultando producto con codeqr:', data);
      const response = await axios.get(`${BASE_URL}/products/codeqr/${data}`);
      console.log('Respuesta del backend:', response.data);
      
      if (response.data) {
        setScannedProduct(response.data);
        setShowProductModal(true);
      } else {
        Alert.alert(
          'Producto no encontrado',
          `No se encontró un producto con el código: ${data}`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setTimeout(() => setScanning(true), 1000);
            }
          }]
        );
      }
    } catch (error) {
      console.error('Error al consultar el producto:', error);
      Alert.alert(
        'Error',
        'No se pudo encontrar el producto. Verifica el código escaneado.',
        [{ 
          text: 'OK', 
          onPress: () => {
            setTimeout(() => setScanning(true), 1000);
          }
        }]
      );
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setScannedProduct(null);
    setTimeout(() => setScanning(true), 500);
  };

  const ScannerOverlay = () => (
    <View style={styles.overlayContainer}>
      {/* Header del escáner */}
      <LinearGradient
        colors={['rgba(0,0,0,0.8)', 'transparent']}
        style={styles.overlayHeader}
      >
        <View style={styles.scannerHeader}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.scannerTitle}>Escáner QR</Text>
            <Text style={styles.scannerSubtitle}>Enfoca el código QR del producto</Text>
          </View>
          <Pressable 
            style={({ pressed }) => [
              styles.flashButton,
              pressed && styles.flashButtonPressed
            ]}
            onPress={toggleFlash}
          >
            <LinearGradient
              colors={flashEnabled ? ['#FFC107', '#FF9800'] : ['#666666', '#888888']}
              style={styles.flashButtonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Ionicons 
                name={flashEnabled ? "flash" : "flash-off"} 
                size={22} 
                color="#FFFFFF" 
              />
            </LinearGradient>
          </Pressable>
        </View>
      </LinearGradient>

      {/* Marco del escáner */}
      <View style={styles.scannerFrame}>
        <View style={styles.cornerTopLeft} />
        <View style={styles.cornerTopRight} />
        <View style={styles.cornerBottomLeft} />
        <View style={styles.cornerBottomRight} />
        
        <View style={styles.scanningLine} />
      </View>

      {/* Instrucciones */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.8)']}
        style={styles.overlayFooter}
      >
        <Text style={styles.instructionText}>
          Coloca el código QR dentro del marco para escanear
        </Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Ionicons name="scan-outline" size={16} color="#FFC107" />
            <Text style={styles.statText}>Escaneo automático</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="time-outline" size={16} color="#FFC107" />
            <Text style={styles.statText}>Instantáneo</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#FFFFFF', '#FFFBEB']}
        style={styles.headerGradient}
      >
        <View style={styles.statusBarSpacer} />
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerSubtitle}>Qhatu Marca App</Text>
            <Text style={styles.headerTitle}>Escáner de Productos</Text>
          </View>
          <View style={styles.headerIcons}>
            <Pressable style={styles.headerIconContainer}>
              <Ionicons name="help-circle-outline" size={22} color="#5D4037" />
            </Pressable>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.cameraContainer}>
        {isFocused && (
          <Animated.View style={[styles.cameraWrapper, { opacity: fadeAnim }]}>
            <CameraView
              style={styles.camera}
              facing={facing}
              onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
              enableTorch={flashEnabled}
            >
              <ScannerOverlay />
            </CameraView>
          </Animated.View>
        )}
      </View>

      {/* Modal de Producto Escaneado */}
      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeProductModal}
      >
        {scannedProduct && (
          <View style={styles.productModalContainer}>
            <LinearGradient
              colors={['#FFFBEB', '#FFF3E0']}
              style={styles.productModalGradient}
            >
              {/* Header del modal */}
              <View style={styles.productModalHeader}>
                <Pressable 
                  style={styles.modalCloseButton}
                  onPress={closeProductModal}
                >
                  <Ionicons name="close" size={24} color="#5D4037" />
                </Pressable>
                <Text style={styles.productModalTitle}>Producto Escaneado</Text>
                <View style={styles.modalCloseButton} />
              </View>

              <ScrollView 
                style={styles.productModalScroll}
                showsVerticalScrollIndicator={false}
              >
                {/* Imagen del producto */}
                <View style={styles.modalImageContainer}>
                  {scannedProduct.imageUrl ? (
                    <Image
                      source={{ uri: scannedProduct.imageUrl }}
                      style={styles.modalProductImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.modalPlaceholderContainer}>
                      <Ionicons name="cube-outline" size={60} color="#E0E0E0" />
                      <Text style={styles.modalPlaceholderText}>Imagen no disponible</Text>
                    </View>
                  )}
                  <View style={styles.scanBadge}>
                    <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
                    <Text style={styles.scanBadgeText}>Escaneado</Text>
                  </View>
                </View>

                {/* Información del producto */}
                <View style={styles.productInfoContainer}>
                  <View style={styles.productHeader}>
                    <View style={styles.productInfo}>
                      <Text style={styles.modalProductCode}>{scannedProduct.codeqr}</Text>
                      <Text style={styles.modalProductName}>{scannedProduct.nombre}</Text>
                    </View>
                    <View style={styles.priceTag}>
                      <Text style={styles.modalProductPrice}>S/. {scannedProduct.precio.toFixed(2)}</Text>
                    </View>
                  </View>

                  {/* Descripción */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Descripción</Text>
                    <Text style={styles.modalProductDescription}>
                      {scannedProduct.descripcion || 'No hay descripción disponible para este producto.'}
                    </Text>
                  </View>

                  {/* Especificaciones */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Especificaciones</Text>
                    <View style={styles.specsGrid}>
                      <View style={styles.specItem}>
                        <Ionicons name="barcode-outline" size={20} color="#FFC107" />
                        <View style={styles.specTextContainer}>
                          <Text style={styles.specLabel}>Código QR</Text>
                          <Text style={styles.specValue}>{scannedProduct.codeqr}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.specItem}>
                        <Ionicons name="pricetag-outline" size={20} color="#4CAF50" />
                        <View style={styles.specTextContainer}>
                          <Text style={styles.specLabel}>Precio</Text>
                          <Text style={styles.specValue}>S/. {scannedProduct.precio.toFixed(2)}</Text>
                        </View>
                      </View>
                      
                      <View style={styles.specItem}>
                        <Ionicons name="cube-outline" size={20} color="#2196F3" />
                        <View style={styles.specTextContainer}>
                          <Text style={styles.specLabel}>Stock</Text>
                          <Text style={[
                            styles.specValue, 
                            scannedProduct.stock > 0 ? styles.stockAvailable : styles.stockUnavailable
                          ]}>
                            {scannedProduct.stock > 0 ? 'En stock' : 'Agotado'}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.specItem}>
                        <Ionicons name="layers-outline" size={20} color="#9C27B0" />
                        <View style={styles.specTextContainer}>
                          <Text style={styles.specLabel}>Categoría</Text>
                          <Text style={styles.specValue}>{scannedProduct.category || 'General'}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Información adicional */}
                  <View style={styles.infoSection}>
                    <Text style={styles.sectionTitle}>Información Adicional</Text>
                    <View style={styles.additionalInfo}>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Fecha de escaneo:</Text>
                        <Text style={styles.infoValue}>
                          {new Date().toLocaleDateString('es-ES')}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Hora:</Text>
                        <Text style={styles.infoValue}>
                          {new Date().toLocaleTimeString('es-ES')}
                        </Text>
                      </View>
                      <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Estado:</Text>
                        <Text style={[styles.infoValue, styles.statusSuccess]}>
                          Escaneo exitoso
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </ScrollView>

              {/* Footer del modal */}
              <View style={styles.productModalFooter}>
                <Pressable 
                  style={({ pressed }) => [
                    styles.scanAgainButton,
                    pressed && styles.scanAgainButtonPressed
                  ]}
                  onPress={closeProductModal}
                >
                  <LinearGradient
                    colors={['#FFC107', '#FF9800']}
                    style={styles.scanAgainGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  >
                    <Ionicons name="scan-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.scanAgainText}>Escanear Otro Producto</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  statusBarSpacer: {
    height: Platform.OS === 'ios' ? 44 : 30,
    backgroundColor: 'transparent',
  },
  headerGradient: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#5D4037',
    letterSpacing: 0.5,
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 12,
    marginLeft: 8,
  },
  permissionGradient: {
    flex: 1,
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIconContainer: {
    marginBottom: 24,
  },
  permissionIconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#5D4037',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#5D4037',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    fontWeight: '500',
  },
  permissionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  permissionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  permissionButtonPressed: {
    transform: [{ scale: 0.95 }],
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraWrapper: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlayContainer: {
    flex: 1,
  },
  overlayHeader: {
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  scannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
  },
  scannerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  scannerSubtitle: {
    fontSize: 14,
    color: '#FFC107',
    fontWeight: '500',
  },
  flashButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  flashButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flashButtonPressed: {
    transform: [{ scale: 0.9 }],
  },
  scannerFrame: {
    width: width * 0.7,
    height: width * 0.7,
    alignSelf: 'center',
    marginTop: height * 0.1,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 20,
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: -2,
    left: -2,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFC107',
    borderTopLeftRadius: 20,
  },
  cornerTopRight: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFC107',
    borderTopRightRadius: 20,
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#FFC107',
    borderBottomLeftRadius: 20,
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#FFC107',
    borderBottomRightRadius: 20,
  },
  scanningLine: {
    position: 'absolute',
    top: '50%',
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#FFC107',
    shadowColor: '#FFC107',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  overlayFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 60,
    paddingHorizontal: 20,
  },
  instructionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#FFC107',
    marginLeft: 4,
    fontWeight: '500',
  },
  // Estilos para el modal de producto
  productModalContainer: {
    flex: 1,
  },
  productModalGradient: {
    flex: 1,
  },
  productModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  modalCloseButton: {
    padding: 8,
    borderRadius: 8,
  },
  productModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4037',
  },
  productModalScroll: {
    flex: 1,
  },
  modalImageContainer: {
    width: '100%',
    height: 250,
    backgroundColor: '#FAFAFA',
    position: 'relative',
  },
  modalProductImage: {
    width: '100%',
    height: '100%',
  },
  modalPlaceholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  modalPlaceholderText: {
    fontSize: 14,
    color: '#BDBDBD',
    marginTop: 8,
    fontWeight: '500',
  },
  scanBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  scanBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  productInfoContainer: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  productInfo: {
    flex: 1,
    marginRight: 12,
  },
  modalProductCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FF9800',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  modalProductName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#37474F',
    lineHeight: 28,
  },
  priceTag: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
  },
  modalProductPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  infoSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#5D4037',
    marginBottom: 12,
  },
  modalProductDescription: {
    fontSize: 16,
    color: '#546E7A',
    lineHeight: 22,
  },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  specTextContainer: {
    marginLeft: 12,
  },
  specLabel: {
    fontSize: 12,
    color: '#78909C',
    fontWeight: '500',
    marginBottom: 2,
  },
  specValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
  },
  stockAvailable: {
    color: '#4CAF50',
  },
  stockUnavailable: {
    color: '#F44336',
  },
  additionalInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#78909C',
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#37474F',
  },
  statusSuccess: {
    color: '#4CAF50',
  },
  productModalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#FFE0B2',
    backgroundColor: '#FFFFFF',
  },
  scanAgainButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scanAgainGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  scanAgainButtonPressed: {
    transform: [{ scale: 0.98 }],
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
});