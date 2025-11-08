import { createSlice } from '@reduxjs/toolkit'

export const authInitialState = {
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
  initialState: authInitialState,
  reducers: {
    setCredentials: (state, action) => {
      Object.assign(state.user, action.payload);
      sessionStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = authInitialState.user;
      sessionStorage.removeItem('user');
    }
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
