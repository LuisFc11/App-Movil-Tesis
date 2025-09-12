import { Tabs } from 'expo-router';
import { MessageCircle, Scan, Package } from 'lucide-react-native';
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
      NavigationBar.setPositionAsync('absolute'); // Posiciona la barra de forma absoluta para que el contenido se extienda detrás
    }
  }, []);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#DC2626',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#ffffffff',
          borderTopWidth: 1, // Borde fino y elegante arriba
          borderTopColor: '#FCD34D',
          paddingTop: 8, // Espacio superior interno más compacto
          paddingBottom: Math.max(insets.bottom, 20) + (isSmallScreen ? 8 : 12), // Ajuste mejorado: mínimo 20px + insets para más espacio
          minHeight: isSmallScreen ? 70 : 90, // Altura mínima flexible para adaptarse el boton de navegacion abajo el 90 cambia 
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
      safeAreaInsets={{ // Aplica insets explícitamente para evitar superposiciones
        top: 0,
        bottom: Platform.OS === 'android' ? Math.max(insets.bottom, 20) : insets.bottom, // Más espacio en Android para tu caso
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
    </Tabs>
  );
}