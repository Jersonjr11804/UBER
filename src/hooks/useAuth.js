import { useSelector, useDispatch } from 'react-redux';
import { loginStart, loginSuccess, loginFailure, logout } from '../redux/slices/authSlice';
import { loginUser, logoutUser, registerUser } from '../services/firebase';

const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  const handleLogin = async (email, password) => {
    dispatch(loginStart());
    try {
      const user = await loginUser(email, password);
      dispatch(loginSuccess({ uid: user.uid, email: user.email }));
    } catch (error) {
      dispatch(loginFailure(error.message));
      throw error;
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    dispatch(logout());
  };

  return { auth, handleLogin, handleLogout };
};

export default useAuth;