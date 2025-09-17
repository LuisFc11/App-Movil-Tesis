import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import { Product } from '@/types'; // Asegúrate de que 'types.ts' esté disponible

const BASE_URL = 'https://9b3de9a9ebf8.ngrok-free.app'; // URL de ngrok, actualiza si cambia

const AddProduct: React.FC = () => {
  const [product, setProduct] = useState<Product>({
    codeqr: '',
    nombre: '',
    descripcion: '',
    precio: 0,
  });
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (name: keyof Product, value: string) => {
    setProduct((prev) => ({
      ...prev,
      [name]: name === 'precio' ? (isNaN(parseFloat(value)) ? 0 : parseFloat(value)) : value,
    }));
    if (error) setError('');
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    if (!product.codeqr.trim()) {
      setError('El código QR es requerido.');
      Toast.show({ type: 'error', text1: 'Error', text2: 'El código QR es requerido.' });
      setLoading(false);
      return;
    }
    if (!product.nombre.trim()) {
      setError('El nombre del producto es requerido.');
      Toast.show({ type: 'error', text1: 'Error', text2: 'El nombre del producto es requerido.' });
      setLoading(false);
      return;
    }
    if (!product.descripcion.trim()) {
      setError('La descripción es requerida.');
      Toast.show({ type: 'error', text1: 'Error', text2: 'La descripción es requerida.' });
      setLoading(false);
      return;
    }
    if (product.precio <= 0) {
      setError('El precio debe ser mayor a 0.');
      Toast.show({ type: 'error', text1: 'Error', text2: 'El precio debe ser mayor a 0.' });
      setLoading(false);
      return;
    }

    try {
      console.log('Enviando datos al backend:', JSON.stringify(product, null, 2));
      const response = await axios.post(`${BASE_URL}/products`, product, {
        timeout: 30000,
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('Respuesta del servidor:', response.data);
      setSuccess('Producto agregado correctamente.');
      setProduct({ codeqr: '', nombre: '', descripcion: '', precio: 0 });
      Toast.show({
        type: 'success',
        text1: '¡Éxito!',
        text2: 'Producto agregado correctamente a la base de datos.',
      });
    } catch (err: any) {
      console.error('Error completo:', err);
      let errorMessage = 'Error desconocido';
      if (err.response) {
        errorMessage = `Error del servidor: ${err.response.status} - ${err.response.data?.message || err.response.statusText}`;
      } else if (err.request) {
        errorMessage = 'No se pudo conectar al servidor. Verifica la URL o la conexión.';
      } else {
        errorMessage = err.message || 'Error al procesar la solicitud.';
      }
      setError(errorMessage);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Agregar Nuevo Producto</Text>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>📦</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.error}>{error}</Text>
        </View>
      ) : null}

      {success ? (
        <View style={styles.successContainer}>
          <Text style={styles.success}>{success}</Text>
        </View>
      ) : null}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Código QR *"
          value={product.codeqr}
          onChangeText={(text) => handleChange('codeqr', text)}
          placeholderTextColor="#9CA3AF"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre del producto *"
          value={product.nombre}
          onChangeText={(text) => handleChange('nombre', text)}
          placeholderTextColor="#9CA3AF"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción *"
          value={product.descripcion}
          onChangeText={(text) => handleChange('descripcion', text)}
          multiline
          numberOfLines={4}
          placeholderTextColor="#9CA3AF"
          textAlignVertical="top"
          editable={!loading}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Precio (ej: 19.99) *"
          value={product.precio.toString()}
          onChangeText={(text) => handleChange('precio', text)}
          keyboardType="decimal-pad"
          placeholderTextColor="#9CA3AF"
          editable={!loading}
        />
      </View>

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={[styles.buttonText, loading && styles.buttonTextDisabled]}>
          {loading ? 'Agregando...' : 'Agregar Producto'}
        </Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#FDFAF4',
    borderRadius: 16,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
    color: '#92400E',
    textShadowColor: 'rgba(245, 158, 11, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  iconContainer: {
    backgroundColor: '#FFF7ED',
    borderRadius: 20,
    padding: 8,
    borderWidth: 1,
    borderColor: '#FCD34D',
  },
  icon: {
    fontSize: 24,
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  error: {
    color: '#DC2626',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  successContainer: {
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  success: {
    color: '#166534',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#FCD34D',
    fontSize: 16,
    color: '#1F2937',
    shadowColor: '#FCD34D',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#F59E0B', // Amarillo para el botón
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D97706',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: '#D1D5DB',
    borderColor: '#9CA3AF',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonTextDisabled: {
    color: '#9CA3AF',
  },
});

export default AddProduct;