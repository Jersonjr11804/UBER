import { useSelector, useDispatch } from 'react-redux';
import {
  setOrigin,
  setDestination,
  setSelectedVehicle,
  setFareEstimate,
  clearTrip,
} from '../redux/slices/tripSlice';

const useTrip = () => {
  const dispatch = useDispatch();
  const trip = useSelector((state) => state.trip);

  return {
    trip,
    setOrigin: (data) => dispatch(setOrigin(data)),
    setDestination: (data) => dispatch(setDestination(data)),
    setSelectedVehicle: (id) => dispatch(setSelectedVehicle(id)),
    setFareEstimate: (fare) => dispatch(setFareEstimate(fare)),
    clearTrip: () => dispatch(clearTrip()),
  };
};

export default useTrip;