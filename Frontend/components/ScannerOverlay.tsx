import React from 'react';
import { View, Text, StyleSheet, Dimensions, Animated, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');
const SCAN_AREA_SIZE = Math.min(width * 0.75, 300);
const ANIMATION_DURATION = 2500;

interface ScannerOverlayProps {
  flashEnabled: boolean;
  toggleFlash: () => void;
}

const ScannerOverlay: React.FC<ScannerOverlayProps> = ({ flashEnabled, toggleFlash }) => {
  const scanLineAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    const animateScanLine = () => {
      scanLineAnim.setValue(0);
      Animated.loop(
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: ANIMATION_DURATION,
          useNativeDriver: true,
        })
      ).start();
    };
    animateScanLine();
  }, [scanLineAnim]);

  const scanLineStyle = {
    transform: [
      {
        translateY: scanLineAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, SCAN_AREA_SIZE - 10],
        }),
      },
    ],
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.topOverlay}>
        <Text style={styles.scanText}>Escanear Código de Barras</Text>
      </View>
      <View style={styles.middleRow}>
        <View style={styles.sideOverlay} />
        <View style={styles.scanArea}>
          <View style={styles.scanFrame}>
            <Animated.View style={[styles.scanLine, scanLineStyle]} />
          </View>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>
        <View style={styles.sideOverlay} />
      </View>
      <View style={styles.bottomOverlay}>
        <View style={styles.controlsContainer}>
          <View style={styles.instructionContainer}>
            <Text style={styles.instructionText}>
              Apunta la cámara al código de barras
            </Text>
            <Text style={styles.instructionSubtext}>
              Asegúrate de que el código esté dentro del marco
            </Text>
          </View>
          <TouchableOpacity
            style={styles.flashlightButton}
            onPress={toggleFlash}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={flashEnabled ? 'flashlight' : 'flashlight-off'}
              size={28}
              color="#FFD700"
            />
            <Text style={styles.buttonText}>
              {flashEnabled ? 'Apagar Linterna' : 'Encender Linterna'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 20,
  },
  middleRow: {
    flexDirection: 'row',
    height: SCAN_AREA_SIZE,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  scanArea: {
    width: SCAN_AREA_SIZE,
    height: SCAN_AREA_SIZE,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanFrame: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderWidth: 3,
    borderColor: '#FFD700',
    borderRadius: 12,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#FFD700',
    opacity: 0.8,
    borderRadius: 2,
  },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: '#FFD700',
    borderWidth: 5,
    borderRadius: 6,
  },
  topLeft: {
    top: -2,
    left: -2,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: -2,
    right: -2,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
  },
  bottomOverlay: {
    height: 215,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  controlsContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: width * 0.9,
  },
  instructionContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.97)',
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    maxWidth: width * 0.9,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 12,
  },
  instructionText: {
    color: '#1F2937',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  instructionSubtext: {
    color: '#4B5563',
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    textAlign: 'center',
    lineHeight: 20,
  },
  flashlightButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
    width: '100%',
    maxWidth: 300,
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFD700',
    fontSize: 16,
    fontFamily: 'Inter-Medium',
    marginLeft: 8,
  },
});

export default ScannerOverlay;