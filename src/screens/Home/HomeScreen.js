import React, { useState } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import MapViewDirections from 'react-native-maps-directions';

export default function HomeScreen() {
  
  const GOOGLE_MAPS_APIKEY = 'AIzaSyBwJaSydfRPbP23Ad3CdEHSTuinXNUC8mo'; 

  // Coordenadas iniciales por defecto (Centro de Medellín)
  const [origen, setOrigen] = useState({
  latitude: 6.2818,  
  longitude: -75.5855,
  });
  const [destino, setDestino] = useState(null);
  const [tarifa, setTarifa] = useState(0);

  return (
    <View style={styles.container}>
      
      {/* 1. EL MAPA */}
      <MapView
        style={styles.map}
        showsUserLocation={true}    // Muestra el punto azul donde estás
        followsUserLocation={true}  // Sigue tu movimiento en el mapa
        initialRegion={{
          latitude: 6.2818,    
          longitude: -75.5855,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {/* Marcador del punto de partida */}
        <Marker coordinate={origen} title="Origen" />

        {/* Si ya elegiste destino, pinta el marcador rojo y calcula la ruta */}
        {destino && (
          <>
            <Marker coordinate={destino} title="Destino" pinColor="red" />
            
            <MapViewDirections
              origin={origen}
              destination={destino}
              apikey={GOOGLE_MAPS_APIKEY}
              strokeWidth={4}
              strokeColor="black" // Ruta negra típica de Uber
              onReady={(result) => {
                // VARIABLES DE COBRO SIMULADO EN MEDELLÍN
                const tarifaBase = 4300; // Mínima en la ciudad
                const valorPorKm = 1300;
                const valorPorMinuto = 250;
                
                const costoViaje = tarifaBase + (result.distance * valorPorKm) + (result.duration * valorPorMinuto);
                setTarifa(Math.round(costoViaje));
              }}
            />
          </>
        )}
      </MapView>

      {/* 2. BUSCADOR AUTOCOMPLETABLE (Posicionado encima del mapa) */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="¿A dónde vas en Medellín?"
          fetchDetails={true}
          onPress={(data, details = null) => {
            if (details) {
              setDestino({
                latitude: details.geometry.location.lat,
                longitude: details.geometry.location.lng,
              });
            }
          }}
          query={{
            key: GOOGLE_MAPS_APIKEY,
            language: 'es',
            components: 'country:co',       // Solo busca en Colombia
            location: '6.2442,-75.5812',    // Geolocalizado en Medellín
            radius: '12000',                // 12 kilómetros a la redonda
            strictbounds: true,             // Ignora todo lo que esté fuera de Medellín
          }}
          styles={{
            textInput: styles.textInput,
            listView: styles.listView,
          }}
        />
      </View>

      {/* 3. MENÚ INFERIOR CON LA TARIFA (Aparece solo cuando hay ruta) */}
      {tarifa > 0 && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceText}>Precio Estimado: ${tarifa.toLocaleString('es-CO')} COP</Text>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  searchContainer: {
    position: 'absolute',
    top: 50, // Lo baja de la barra de estado del celular
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5, // Sombra en Android
    zIndex: 1,    // Asegura que quede por encima del mapa
  },
  textInput: { height: 48, color: '#000', fontSize: 16 },
  listView: { backgroundColor: 'white', borderRadius: 8 },
  priceContainer: {
    position: 'absolute',
    bottom: 30,
    backgroundColor: 'black',
    padding: 20,
    borderRadius: 12,
    alignSelf: 'center',
    width: '90%',
  // Sombra para el botón inferior
    elevation: 4,
  },
  priceText: { color: 'white', fontSize: 18, fontWeight: 'bold', textAlign: 'center' },
});