import { Tabs } from 'expo-router';
import { MessageCircle, Scan, Package, Plus } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar'; // Para configurar la barra de navegación en Android
import { useEffect } from 'react';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 360; // Para dispositivos pequeños

export default function TabLayout() {
  const insets = useSafeAreaInsets(); // Detecta el espacio de la barra de navegación del sistema

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#ffffff00'); // Hace la barra de navegación transparente en Android
      NavigationBar.setPositionAsync('absolute'); // Posiciona la barra de forma absoluta
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC2626', // Rojo para el ícono activo
        tabBarInactiveTintColor: '#9CA3AF', // Gris para inactivo
        tabBarStyle: {
          backgroundColor: '#FFFFFF', // Fondo blanco para la barra
          borderTopWidth: 1, // Borde fino y elegante arriba
          borderTopColor: '#FCD34D', // Amarillo para combinar
          paddingTop: 8, // Espacio superior interno más compacto
          paddingBottom: Math.max(insets.bottom, 20) + (isSmallScreen ? 8 : 12), // Ajuste mejorado
          minHeight: isSmallScreen ? 70 : 90, // Altura mínima flexible
        },
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 11 : 13,
          fontFamily: 'Inter-SemiBold',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: isSmallScreen ? 0 : 2, // Ajuste para pantallas pequeñas
        },
      }}
      safeAreaInsets={{
        top: 0,
        bottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) : insets.bottom,
        left: 0,
        right: 0,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chat',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={isSmallScreen ? size * 0.85 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scanner"
        options={{
          title: 'Escáner',
          tabBarIcon: ({ size, color }) => (
            <Scan size={isSmallScreen ? size * 0.85 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Productos',
          tabBarIcon: ({ size, color }) => (
            <Package size={isSmallScreen ? size * 0.85 : size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="addProduct"
        options={{
          title: 'Subir Producto',
          tabBarIcon: ({ size, color }) => (
            <Plus size={isSmallScreen ? size * 0.85 : size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}