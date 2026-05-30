import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { clearTrip } from '../../redux/slices/tripSlice';

const PAYMENT_METHODS = [
  { id: 'card', label: 'Tarjeta de crédito', emoji: '💳' },
  { id: 'stripe', label: 'Stripe', emoji: '⚡' },
  { id: 'mercadopago', label: 'Mercado Pago', emoji: '💙' },
  { id: 'cash', label: 'Efectivo', emoji: '💵' },
];

const PaymentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const fareEstimate = useSelector((state) => state.trip.fareEstimate);
  const destination = useSelector((state) => state.trip.destination);
  const selectedVehicle = useSelector((state) => state.trip.selectedVehicle);

  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    if (!selectedMethod) {
      Alert.alert('Error', 'Selecciona un método de pago');
      return;
    }
    try {
      setLoading(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      dispatch(clearTrip());
      Alert.alert(
        '¡Pago exitoso!',
        `Tu viaje ha sido pagado por $${fareEstimate?.toLocaleString()}`,
        [{ text: 'Aceptar', onPress: () => navigation.navigate('HomeScreen') }],
      );
    } catch (error) {
      Alert.alert('Error', 'No se pudo procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pago del viaje</Text>

      {/* Resumen */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>Destino</Text>
        <Text style={styles.summaryValue} numberOfLines={2}>
          {destination?.address}
        </Text>
        <View style={styles.divider} />
        <Text style={styles.summaryLabel}>Vehículo</Text>
        <Text style={styles.summaryValue}>{selectedVehicle}</Text>
        <View style={styles.divider} />
        <Text style={styles.summaryLabel}>Total a pagar</Text>
        <Text style={styles.fareText}>
          ${fareEstimate?.toLocaleString()} COP
        </Text>
      </View>

      {/* Métodos de pago */}
      <Text style={styles.sectionTitle}>Método de pago</Text>
      {PAYMENT_METHODS.map((method) => (
        <TouchableOpacity
          key={method.id}
          style={[
            styles.methodCard,
            selectedMethod === method.id && styles.methodCardActive,
          ]}
          onPress={() => setSelectedMethod(method.id)}>
          <Text style={styles.methodEmoji}>{method.emoji}</Text>
          <Text style={styles.methodLabel}>{method.label}</Text>
          {selectedMethod === method.id && (
            <Text style={styles.checkmark}>✓</Text>
          )}
        </TouchableOpacity>
      ))}

      {/* Botón pagar */}
      <TouchableOpacity
        style={styles.payButton}
        onPress={handlePayment}
        disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#000000" />
        ) : (
          <Text style={styles.payButtonText}>
            Pagar ${fareEstimate?.toLocaleString()} COP
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24 },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  summaryLabel: { color: '#666666', fontSize: 12, marginBottom: 4 },
  summaryValue: { color: '#FFFFFF', fontSize: 15, marginBottom: 12 },
  fareText: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
  divider: { height: 1, backgroundColor: '#333333', marginVertical: 12 },
  sectionTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  methodCardActive: { borderColor: '#FFFFFF' },
  methodEmoji: { fontSize: 24, marginRight: 12 },
  methodLabel: { flex: 1, color: '#FFFFFF', fontSize: 15 },
  checkmark: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  payButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  payButtonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});

export default PaymentScreen;