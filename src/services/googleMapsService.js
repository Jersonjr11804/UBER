const GOOGLE_API_KEY = 'AIzaSyBwJaSydfRPbP23Ad3CdEHSTuinXNUC8mo';

export const getDirections = async (origin, destination) => {
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.latitude},${origin.longitude}&destination=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}&language=es`;
  const response = await fetch(url);
  return await response.json();
};

export const getDistanceMatrix = async (origin, destination) => {
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${GOOGLE_API_KEY}&language=es`;
  const response = await fetch(url);
  return await response.json();
};