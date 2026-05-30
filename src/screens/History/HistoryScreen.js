import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { useSelector } from 'react-redux';
import { getTripHistory } from '../../services/firebase';

const HistoryScreen = () => {
  const auth = useSelector((state) => state.auth);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await getTripHistory(auth.user.uid);
        setTrips(history);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const formatDate = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderItem = ({ item }) => (
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripVehicle}>
          {item.vehicle === 'economy' ? '🚗' : item.vehicle === 'xl' ? '🚙' : '🚘'}
          {'  '}
          {item.vehicle === 'economy'
            ? 'Económico'
            : item.vehicle === 'xl'
            ? 'XL'
            : 'Premium'}
        </Text>
        <Text style={styles.tripFare}>${item.fare?.toLocaleString()} COP</Text>
      </View>
      <View style={styles.divider} />
      <Text style={styles.tripLabel}>Destino</Text>
      <Text style={styles.tripValue} numberOfLines={2}>
        {item.destination?.address}
      </Text>
      <Text style={styles.tripLabel}>Duración</Text>
      <Text style={styles.tripValue}>{item.duration}</Text>
      <Text style={styles.tripDate}>{formatDate(item.date)}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Historial de viajes</Text>
      {trips.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🚗</Text>
          <Text style={styles.emptyText}>Aún no tienes viajes</Text>
          <Text style={styles.emptySubtext}>
            Tus viajes aparecerán aquí después de completarlos
          </Text>
        </View>
      ) : (
        <FlatList
          data={trips}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000', padding: 24, paddingTop: 48 },
  loadingContainer: { flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 24 },
  tripCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tripHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  tripVehicle: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
  tripFare: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  divider: { height: 1, backgroundColor: '#333333', marginBottom: 12 },
  tripLabel: { color: '#666666', fontSize: 12, marginBottom: 2 },
  tripValue: { color: '#FFFFFF', fontSize: 14, marginBottom: 10 },
  tripDate: { color: '#444444', fontSize: 12, marginTop: 4, textAlign: 'right' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  emptyEmoji: { fontSize: 48 },
  emptyText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  emptySubtext: { color: '#666666', fontSize: 14, textAlign: 'center' },
});

export default HistoryScreen;