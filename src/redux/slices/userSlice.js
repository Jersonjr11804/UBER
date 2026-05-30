import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  fullName: '',
  phone: '',
  gender: '',
  email: '',
  photo: null,
  language: 'es',
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
    updateLanguage: (state, action) => {
      state.language = action.payload;
    },
    clearUserProfile: () => initialState,
  },
});

export const { setUserProfile, updateLanguage, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;