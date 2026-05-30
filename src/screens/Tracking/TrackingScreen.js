import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { useDispatch, useSelector } from 'react-redux';
import { setCurrentTrip, addTripToHistory, clearTrip } from '../../redux/slices/tripSlice';
import { saveTripToHistory } from '../../services/firebase';

const TrackingScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const origin = useSelector((state) => state.trip.origin);
  const destination = useSelector((state) => state.trip.destination);
  const selectedVehicle = useSelector((state) => state.trip.selectedVehicle);
  const fareEstimate = useSelector((state) => state.trip.fareEstimate);
  const travelTime = useSelector((state) => state.trip.travelTime);
  const auth = useSelector((state) => state.auth);

  const mapRef = useRef(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [driverLocation, setDriverLocation] = useState({
    latitude: origin?.latitude + 0.005 || 0,
    longitude: origin?.longitude + 0.005 || 0,
  });
  const [tripStatus, setTripStatus] = useState('searching');
  const [secondsLeft, setSecondsLeft] = useState(5);

  // Animación pulso conductor
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  // Simular conductor acercándose
  useEffect(() => {
    if (tripStatus !== 'searching') return;
    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTripStatus('arriving');
          return 0;
        }
        return prev - 1;
      });
      setDriverLocation((prev) => ({
        latitude: prev.latitude - 0.0008,
        longitude: prev.longitude - 0.0008,
      }));
    }, 1000);
    return () => clearInterval(interval);
  }, [tripStatus]);

  useEffect(() => {
    if (tripStatus === 'arriving') {
      setTimeout(() => setTripStatus('ontrip'), 3000);
    }
  }, [tripStatus]);

  const handleFinishTrip = async () => {
    try {
      const tripData = {
        origin,
        destination,
        vehicle: selectedVehicle,
        fare: fareEstimate,
        duration: travelTime,
        date: new Date().toISOString(),
      };
      await saveTripToHistory(auth.user.uid, tripData);
      dispatch(addTripToHistory(tripData));
      dispatch(setCurrentTrip(null));
      navigation.navigate('Payment');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const getStatusText = () => {
    switch (tripStatus) {
      case 'searching':
        return `Buscando conductor... (${secondsLeft}s)`;
      case 'arriving':
        return '¡Conductor encontrado! Llegando...';
      case 'ontrip':
        return 'En camino a tu destino 🚗';
      default:
        return '';
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={
          origin
            ? {
                latitude: origin.latitude,
                longitude: origin.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }
            : undefined
        }>
        {origin && (
          <Marker
            coordinate={{ latitude: origin.latitude, longitude: origin.longitude }}
            title="Tu ubicación"
            pinColor="blue"
          />
        )}
        {destination && (
          <Marker
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title="Destino"
            pinColor="red"
          />
        )}
        {/* Marcador animado del conductor */}
        <Marker coordinate={driverLocation} title="Tu conductor">
          <Animated.View
            style={[styles.driverMarker, { transform: [{ scale: pulseAnim }] }]}>
            <Text style={styles.driverEmoji}>🚗</Text>
          </Animated.View>
        </Marker>
      </MapView>

      {/* Panel estado */}
      <View style={styles.panel}>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{getStatusText()}</Text>
        </View>

        <View style={styles.tripInfo}>
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Destino</Text>
            <Text style={styles.tripInfoValue} numberOfLines={1}>
              {destination?.address?.slice(0, 35)}...
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Tarifa estimada</Text>
            <Text style={styles.tripInfoValue}>
              ${fareEstimate?.toLocaleString()}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.tripInfoRow}>
            <Text style={styles.tripInfoLabel}>Tiempo estimado</Text>
            <Text style={styles.tripInfoValue}>{travelTime}</Text>
          </View>
        </View>

        {tripStatus === 'ontrip' && (
          <TouchableOpacity
            style={styles.finishButton}
            onPress={handleFinishTrip}>
            <Text style={styles.finishButtonText}>Finalizar viaje</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  map: { flex: 1 },
  driverMarker: {
    backgroundColor: '#000000',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  driverEmoji: { fontSize: 20 },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderTopWidth: 1,
    borderColor: '#1A1A1A',
  },
  statusBadge: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statusText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  tripInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tripInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tripInfoLabel: { color: '#666666', fontSize: 13 },
  tripInfoValue: { color: '#FFFFFF', fontSize: 13, fontWeight: '500', maxWidth: '60%' },
  divider: { height: 1, backgroundColor: '#333333' },
  finishButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  finishButtonText: { color: '#000000', fontSize: 16, fontWeight: 'bold' },
});

export default TrackingScreen;