import { createSlice } from '@reduxjs/toolkit'

export const authInitialState = {
  user: {
    _id: '',
    username: '',
    email: '',
    isManager: false,
    token: '',
    image: '',
    gender: '',
    isLoggedIn: false,
    resetPasswordFirstTime: false, // cho biết người dùng đã đặt lại mật khẩu lần đầu chưa 
  }
}

const authSlice = createSlice({
  name: 'auth',
  initialState: authInitialState,
  reducers: {
    updateCredentials: (state, action) => {
      Object.assign(state.user, action.payload);
      state.user.isLoggedIn = true;
      sessionStorage.setItem('user', JSON.stringify(state.user));
    },
    logout: (state) => {
      state.user = authInitialState.user;
      sessionStorage.removeItem('user');
    }
  },
})

export const { updateCredentials, logout } = authSlice.actions
export default authSlice.reducer
