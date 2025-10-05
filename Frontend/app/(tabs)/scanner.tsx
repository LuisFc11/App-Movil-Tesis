import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  Alert, 
  TouchableOpacity,
  Modal,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { X, Flashlight } from 'lucide-react-native';
import ScannerOverlay from '@/components/ScannerOverlay';
import axios from 'axios';
import { useIsFocused } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 360;

const BASE_URL = 'https://63affdf4629d.ngrok-free.app'; // URL de ngrok, actualiza si cambia

// Interfaz para el producto (ajustada según tus datos)
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

  useEffect(() => {
    console.log('Componente Scanner montado');
    if (isFocused) {
      setScanning(true);
    }
  }, [isFocused]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.permissionContainer}>
        <View style={styles.statusBarSpacer} />
        <View style={styles.permissionContent}>
          <View style={styles.permissionIconContainer}>
            <Text style={styles.permissionIcon}>📷</Text>
          </View>
          <Text style={styles.permissionTitle}>Permisos de Cámara</Text>
          <Text style={styles.permissionText}>
            Necesitamos acceso a tu cámara para escanear códigos de productos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Conceder Permisos</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    console.log('Código de barras escaneado:', data);
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
          `No se encontró un producto con el codeqr: ${data}`,
          [{ text: 'OK', onPress: () => setScanning(true) }]
        );
      }
    } catch (error) {
      console.error('Error al consultar el producto:', error);
      Alert.alert(
        'Error',
        'Ocurrió un error al buscar el producto. Verifica el código escaneado o la conexión.',
        [{ text: 'OK', onPress: () => setScanning(true) }]
      );
    }
  };

  const toggleFlash = () => {
    setFlashEnabled(!flashEnabled);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setScannedProduct(null);
    setScanning(true);
  };

  // Componente ProductCard integrado directamente
  const ProductCard = ({ product }: { product: Product }) => {
    const description = product.descripcion || 'No hay descripción disponible para este producto.';
    return (
      <View style={styles.card}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="contain"
            onError={(e) => console.log('Error cargando imagen:', e.nativeEvent.error)}
          />
        ) : (
          <View style={styles.placeholderContainer}>
            <Text>No hay imagen disponible</Text>
          </View>
        )}
        <Text style={styles.productName}>{product.nombre}</Text>
        <Text style={styles.productPrice}>Precio: ${product.precio.toFixed(2)}</Text>
        <Text style={styles.productDescription}>{description}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.statusBarSpacer} />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Text style={styles.headerIcon}>🔍</Text>
          </View>
          <Text style={styles.headerTitle}>Escáner de Productos</Text>
        </View>
      </View>

      <View style={styles.cameraContainer}>
        {isFocused && (
          <CameraView
            style={styles.camera}
            facing={facing}
            onBarcodeScanned={scanning ? handleBarCodeScanned : undefined}
            enableTorch={flashEnabled}
          >
            <ScannerOverlay flashEnabled={flashEnabled} toggleFlash={toggleFlash} />
          </CameraView>
        )}
      </View>

      <Modal
        visible={showProductModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeProductModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.statusBarSpacer} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Producto Escaneado</Text>
            <TouchableOpacity onPress={closeProductModal}>
              <X size={26} color="#DC2626" />
            </TouchableOpacity>
          </View>
          
          {scannedProduct && (
            <View style={styles.modalContent}>
              <ProductCard product={scannedProduct} />
              <TouchableOpacity style={styles.scanAgainButton} onPress={closeProductModal}>
                <Text style={styles.scanAgainText}>Escanear Otro Producto</Text>
              </TouchableOpacity>
            </View>
          )}
        </SafeAreaView>
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
    height: Platform.OS === 'ios' ? 20 : 30,
    backgroundColor: '#FFFFFF',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 3,
    borderColor: '#FFD700',
  },
  permissionIcon: {
    fontSize: 36,
  },
  permissionTitle: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 17,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 40,
    maxWidth: width * 0.8,
  },
  permissionButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 40,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: isSmallScreen ? 16 : 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 2,
    borderColor: '#FFD700',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIconContainer: {
    backgroundColor: '#FEF3C7',
    padding: 8,
    borderRadius: 12,
    marginRight: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFBEB',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 3,
    borderBottomColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  scanAgainButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 18,
    borderRadius: 16,
    marginTop: 24,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanAgainText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontFamily: 'Inter-Bold',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    alignItems: 'center',
  },
  productImage: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholderContainer: {
    width: 200,
    height: 200,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    marginBottom: 16,
  },
  productName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
    marginBottom: 8,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#16A34A',
    marginBottom: 12,
  },
  productDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
  },
});