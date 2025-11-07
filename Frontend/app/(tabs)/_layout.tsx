import { Tabs } from 'expo-router';
import { MessageCircle, Scan, Package } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Dimensions, Platform, Animated, View, StyleSheet } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect, useRef, useState } from 'react';

const { width } = Dimensions.get('window');
const isSmallScreen = width < 360;

// Definir el tipo para las claves de los tabs
type TabKey = 'index' | 'scanner' | 'products';

// Definir los estilos fuera del componente
const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingHorizontal: 8,
  },
  backgroundEffect: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFF3E0',
  },
  activeLine: {
    position: 'absolute',
    bottom: -8,
    width: 24,
    height: 3,
    borderRadius: 1.5,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 2,
  },
});

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<TabKey>('index');
  
  // Animaciones para cada ícono con tipos específicos
  const scaleAnims = useRef<Record<TabKey, Animated.Value>>({
    index: new Animated.Value(1),
    scanner: new Animated.Value(1),
    products: new Animated.Value(1)
  }).current;

  const backgroundAnims = useRef<Record<TabKey, Animated.Value>>({
    index: new Animated.Value(0),
    scanner: new Animated.Value(0),
    products: new Animated.Value(0)
  }).current;

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync('#FFFFFF');
      NavigationBar.setBorderColorAsync('#E5E7EB');
    }
  }, []);

  const handleTabPress = (tabName: TabKey) => {
    setActiveTab(tabName);
    
    // Animaciones para el tab presionado
    const tabKeys: TabKey[] = ['index', 'scanner', 'products'];
    
    tabKeys.forEach((key: TabKey) => {
      if (key === tabName) {
        // Animación de press
        Animated.sequence([
          Animated.timing(scaleAnims[key], {
            toValue: 0.9,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.spring(scaleAnims[key], {
            toValue: 1,
            friction: 3,
            tension: 40,
            useNativeDriver: true,
          })
        ]).start();

        // Animación de fondo
        Animated.timing(backgroundAnims[key], {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        // Reset otros tabs
        Animated.timing(backgroundAnims[key], {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }).start();
      }
    });
  };

  interface AnimatedTabIconProps {
    tabName: TabKey;
    icon: React.ComponentType<any>;
    isActive: boolean;
    size: number;
    color: string;
  }

  const AnimatedTabIcon = ({ tabName, icon: Icon, isActive, size, color }: AnimatedTabIconProps) => {
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      if (isActive) {
        // Animación de pulso sutil para el tab activo
        Animated.loop(
          Animated.sequence([
            Animated.timing(pulseAnim, {
              toValue: 1.05,
              duration: 1500,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: true,
            }),
          ])
        ).start();
      } else {
        pulseAnim.setValue(1);
      }
    }, [isActive]);

    return (
      <View style={styles.iconContainer}>
        {/* Fondo animado para el tab activo */}
        <Animated.View 
          style={[
            styles.backgroundEffect,
            {
              opacity: backgroundAnims[tabName],
              transform: [{
                scale: backgroundAnims[tabName].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.8, 1]
                })
              }]
            }
          ]} 
        />
        
        <Animated.View 
          style={{ 
            transform: [
              { scale: scaleAnims[tabName] },
              { scale: pulseAnim }
            ],
          }}
        >
          <Icon size={isSmallScreen ? size * 0.85 : size} color={color} />
        </Animated.View>
        
        {/* Línea indicadora activa */}
        <Animated.View 
          style={[
            styles.activeLine,
            {
              opacity: backgroundAnims[tabName],
              backgroundColor: color,
              transform: [{
                scaleX: backgroundAnims[tabName]
              }]
            }
          ]} 
        />
      </View>
    );
  };

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#FF6B35',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
          paddingTop: 12,
          paddingBottom: Platform.OS === 'ios' 
            ? Math.max(insets.bottom, 8) + (isSmallScreen ? 8 : 12)
            : (isSmallScreen ? 8 : 12),
          height: Platform.OS === 'ios' 
            ? Math.max(insets.bottom + (isSmallScreen ? 70 : 85), 85)
            : (isSmallScreen ? 70 : 85),
          minHeight: isSmallScreen ? 70 : 85,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.08,
          shadowRadius: 8,
          elevation: 6,
        },
        tabBarLabelStyle: {
          fontSize: isSmallScreen ? 11 : 12,
          fontWeight: '600',
          marginTop: 6,
          fontFamily: 'Inter-SemiBold',
          letterSpacing: 0.3,
        },
        tabBarIconStyle: {
          marginBottom: 0,
        },
      }}
      safeAreaInsets={{
        top: 0,
        bottom: Platform.OS === 'ios' ? insets.bottom : 0,
        left: 0,
        right: 0,
      }}
    >
      <Tabs.Screen
        name="index"
        listeners={{
          tabPress: () => handleTabPress('index'),
        }}
        options={{
          title: 'Asistente',
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon 
              tabName="index"
              icon={MessageCircle}
              isActive={focused}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="scanner"
        listeners={{
          tabPress: () => handleTabPress('scanner'),
        }}
        options={{
          title: 'Escáner',
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon 
              tabName="scanner"
              icon={Scan}
              isActive={focused}
              size={size}
              color={color}
            />
          ),
        }}
      />
      
      <Tabs.Screen
        name="products"
        listeners={{
          tabPress: () => handleTabPress('products'),
        }}
        options={{
          title: 'Productos',
          tabBarIcon: ({ size, color, focused }) => (
            <AnimatedTabIcon 
              tabName="products"
              icon={Package}
              isActive={focused}
              size={size}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}