import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  origin: null,
  destination: null,
  selectedVehicle: null,
  fareEstimate: null,
  travelTime: null,
  travelDistance: null,
  currentTrip: null,
  tripHistory: [],
};

const tripSlice = createSlice({
  name: 'trip',
  initialState,
  reducers: {
    setOrigin: (state, action) => {
      state.origin = action.payload;
    },
    setDestination: (state, action) => {
      state.destination = action.payload;
    },
    setSelectedVehicle: (state, action) => {
      state.selectedVehicle = action.payload;
    },
    setFareEstimate: (state, action) => {
      state.fareEstimate = action.payload;
    },
    setTravelInfo: (state, action) => {
      state.travelTime = action.payload.time;
      state.travelDistance = action.payload.distance;
    },
    setCurrentTrip: (state, action) => {
      state.currentTrip = action.payload;
    },
    addTripToHistory: (state, action) => {
      state.tripHistory.unshift(action.payload);
    },
    clearTrip: (state) => {
      state.origin = null;
      state.destination = null;
      state.selectedVehicle = null;
      state.fareEstimate = null;
      state.travelTime = null;
      state.travelDistance = null;
      state.currentTrip = null;
    },
  },
});

export const {
  setOrigin,
  setDestination,
  setSelectedVehicle,
  setFareEstimate,
  setTravelInfo,
  setCurrentTrip,
  addTripToHistory,
  clearTrip,
} = tripSlice.actions;

export default tripSlice.reducer;