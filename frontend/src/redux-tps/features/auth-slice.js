import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user: {
    _id: '',
    username: '',
    email: '',
    isManager: false,
    token: '',
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      Object.assign(state.user, action.payload);
      sessionStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = initialState.user;
      sessionStorage.removeItem('user');
    }
  },
})

export const { setCredentials } = authSlice.actions
export default authSlice.reducer
