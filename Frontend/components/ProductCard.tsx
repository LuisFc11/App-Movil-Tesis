import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface ProductCardProps {
  product: any;  // Cambiado a 'any' para flexibilidad sin qhatu_marca
  onPress?: () => void; // Opcional para manejar clics
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <Text style={styles.name}>{product.nombre}</Text>
      <Text style={styles.price}>${product.precio?.toFixed(2) || '0.00'}</Text>
      {product.descripcion && <Text style={styles.description}>{product.descripcion}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FCD34D', // Alineado con products.tsx
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12, // Espaciado entre cards
  },
  name: {
    fontSize: 20,
    fontFamily: 'Inter-Bold',
    color: '#DC2626',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontFamily: 'Inter-Medium',
    color: '#374151',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#4B5563',
  },
});

export default ProductCard;