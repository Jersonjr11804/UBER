import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { useDispatch, useSelector } from 'react-redux';
import {
  setDestination,
  setSelectedVehicle,
  setFareEstimate,
  setTravelInfo,
} from '../../redux/slices/tripSlice';
import { getDirections, getDistanceMatrix } from '../../services/googleMapsService';

const GOOGLE_API_KEY = 'AIzaSyCasvHzCtcJfiDtzDwaEuY8ay-KvCqiiyY';

const VEHICLE_TYPES = [
  {
    id: 'economy',
    label: 'Económico',
    emoji: '🚗',
    pricePerKm: 1200,
    description: 'Viajes cómodos al mejor precio',
  },
  {
    id: 'xl',
    label: 'XL',
    emoji: '🚙',
    pricePerKm: 1800,
    description: 'Más espacio para grupos',
  },
  {
    id: 'premium',
    label: 'Premium',
    emoji: '🚘',
    pricePerKm: 2800,
    description: 'Vehículos de lujo',
  },
];

const TripRequestScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const origin = useSelector((state) => state.trip.origin);
  const destination = useSelector((state) => state.trip.destination);
  const selectedVehicle = useSelector((state) => state.trip.selectedVehicle);
  const fareEstimate = useSelector((state) => state.trip.fareEstimate);
  const travelTime = useSelector((state) => state.trip.travelTime);

  const mapRef = useRef(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [loadingRoute, setLoadingRoute] = useState(false);

  const handleSelectDestination = async (data, details) => {
    const { lat, lng } = details.geometry.location;
    const dest = {
      latitude: lat,
      longitude: lng,
      address: data.description,
    };
    dispatch(setDestination(dest));
    await fetchRoute(dest);
  };

  const fetchRoute = async (dest) => {
    if (!origin) return;
    try {
      setLoadingRoute(true);

      const directions = await getDirections(origin, dest);
        console.log('DIRECTIONS RESPONSE:', JSON.stringify(directions?.status));
        console.log('ROUTES:', directions?.routes?.length);
      if (directions?.routes?.[0]?.overview_polyline?.points) {
        const points = decodePolyline(
          directions.routes[0].overview_polyline.points,
        );
        setRouteCoords(points);

        const leg = directions.routes[0].legs[0];
        dispatch(
          setTravelInfo({
            time: leg.duration.text,
            distance: leg.distance.text,
          }),
        );

        const distanceKm =
          directions.routes[0].legs[0].distance.value / 1000;

        if (selectedVehicle) {
          const vehicle = VEHICLE_TYPES.find(
            (v) => v.id === selectedVehicle,
          );
          if (vehicle) {
            dispatch(
              setFareEstimate(
                Math.round(distanceKm * vehicle.pricePerKm),
              ),
            );
          }
        }

        mapRef.current?.fitToCoordinates(points, {
          edgePadding: { top: 80, right: 40, bottom: 300, left: 40 },
          animated: true,
        });
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo calcular la ruta');
    } finally {
      setLoadingRoute(false);
    }
  };

  const handleSelectVehicle = (vehicleId) => {
    dispatch(setSelectedVehicle(vehicleId));
    if (destination) {
      const vehicle = VEHICLE_TYPES.find((v) => v.id === vehicleId);
      const distanceText = travelTime;
      if (vehicle && routeCoords.length > 0) {
        const distanceKm = calculateRouteDistance(routeCoords);
        dispatch(
          setFareEstimate(Math.round(distanceKm * vehicle.pricePerKm)),
        );
      }
    }
  };

  const calculateRouteDistance = (coords) => {
    let total = 0;
    for (let i = 0; i < coords.length - 1; i++) {
      const R = 6371;
      const dLat =
        ((coords[i + 1].latitude - coords[i].latitude) * Math.PI) / 180;
      const dLon =
        ((coords[i + 1].longitude - coords[i].longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((coords[i].latitude * Math.PI) / 180) *
          Math.cos((coords[i + 1].latitude * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      total += R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
    return total;
  };

  const decodePolyline = (encoded) => {
    let index = 0;
    const result = [];
    let lat = 0;
    let lng = 0;
    while (index < encoded.length) {
      let shift = 0;
      let result_val = 0;
      let b;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result_val |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lat += result_val & 1 ? ~(result_val >> 1) : result_val >> 1;
      shift = 0;
      result_val = 0;
      do {
        b = encoded.charCodeAt(index++) - 63;
        result_val |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);
      lng += result_val & 1 ? ~(result_val >> 1) : result_val >> 1;
      result.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
    }
    return result;
  };

  const handleConfirmTrip = () => {
    if (!destination) {
      Alert.alert('Error', 'Selecciona un destino');
      return;
    }
    if (!selectedVehicle) {
      Alert.alert('Error', 'Selecciona un tipo de vehículo');
      return;
    }
    navigation.navigate('Tracking');
  };

  return (
    <View style={styles.container}>
      {/* Mapa */}
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
            coordinate={{
              latitude: origin.latitude,
              longitude: origin.longitude,
            }}
            title="Origen"
            pinColor="blue"
          />
        )}
        {destination && (
          <Marker
            coordinate={{
              latitude: destination.latitude,
              longitude: destination.longitude,
            }}
            title="Destino"
            pinColor="red"
          />
        )}
        {routeCoords.length > 0 && (
          <Polyline
            coordinates={routeCoords}
            strokeColor="#FFFFFF"
            strokeWidth={4}
          />
        )}
      </MapView>

      {/* Panel inferior */}
      <View style={styles.panel}>
        <ScrollView
          keyboardShouldPersistTaps="always"  
            showsVerticalScrollIndicator={false}>

          {/* Buscador destino */}
          <Text style={styles.sectionTitle}>¿A dónde vas?</Text>
          <GooglePlacesAutocomplete
            placeholder="Buscar destino..."
            onPress={handleSelectDestination}
            fetchDetails
            query={{
              key: AIzaSyBwJaSydfRPbP23Ad3CdEHSTuinXNUC8mo,
              language: 'es',
            }}
            styles={{
              container: { marginBottom: 16 },
              textInput: styles.searchInput,
              listView: styles.searchList,
              row: styles.searchRow,
              description: styles.searchDescription,
            }}
          />

          {/* Info de ruta */}
          {loadingRoute && (
            <ActivityIndicator
              color="#FFFFFF"
              style={{ marginBottom: 16 }}
            />
          )}

          {travelTime && !loadingRoute && (
            <View style={styles.routeInfo}>
              <Text style={styles.routeInfoText}>⏱ {travelTime}</Text>
              <Text style={styles.routeInfoText}>
                📍 {destination?.address?.slice(0, 30)}...
              </Text>
            </View>
          )}

          {/* Selección de vehículo */}
          {destination && (
            <>
              <Text style={styles.sectionTitle}>Tipo de vehículo</Text>
              {VEHICLE_TYPES.map((vehicle) => (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[
                    styles.vehicleCard,
                    selectedVehicle === vehicle.id &&
                      styles.vehicleCardActive,
                  ]}
                  onPress={() => handleSelectVehicle(vehicle.id)}>
                  <Text style={styles.vehicleEmoji}>{vehicle.emoji}</Text>
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleLabel}>{vehicle.label}</Text>
                    <Text style={styles.vehicleDesc}>
                      {vehicle.description}
                    </Text>
                  </View>
                  {fareEstimate && selectedVehicle === vehicle.id && (
                    <Text style={styles.vehiclePrice}>
                      ${fareEstimate.toLocaleString()}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </>
          )}

          {/* Botón confirmar */}
          {selectedVehicle && destination && (
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={handleConfirmTrip}>
              <Text style={styles.confirmButtonText}>
                Confirmar viaje
                {fareEstimate
                  ? ` · $${fareEstimate.toLocaleString()}`
                  : ''}
              </Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  map: {
    flex: 1,
  },
  panel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#000000',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '55%',
    borderTopWidth: 1,
    borderColor: '#1A1A1A',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  searchInput: {
    backgroundColor: '#1A1A1A',
    color: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchRow: {
    backgroundColor: '#1A1A1A',
    padding: 12,
  },
  searchDescription: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  routeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  routeInfoText: {
    color: '#CCCCCC',
    fontSize: 13,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  vehicleCardActive: {
    borderColor: '#FFFFFF',
    backgroundColor: '#1A1A1A',
  },
  vehicleEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleLabel: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  vehicleDesc: {
    color: '#666666',
    fontSize: 12,
    marginTop: 2,
  },
  vehiclePrice: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },
  confirmButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  confirmButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TripRequestScreen;