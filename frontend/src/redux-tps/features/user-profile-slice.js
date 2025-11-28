import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user_profile: {},
  user_profile_draft: {},
  address_list: [],
  cart_list: []
};

export const userProfileSlice = createSlice({
  name: 'userProfile',
  initialState,
  reducers: {
    setUserProfile: (state, action) => {
      state.user_profile = { ...action.payload };
    },
    setUserProfileDraft: (state, action) => {
      state.user_profile_draft = { ...action.payload };
    },
    updateUserProfileDraft: (state, action) => {
      Object.assign(state.user_profile_draft, action.payload);
    },
    clearUserProfileDraft: (state) => {
      state.user_profile_draft = {};
    },

    setAddressList: (state, action) => {
      state.address_list = action.payload;
    },
    updateAddressList: (state, action) => {
      const updatedAddress = action.payload;
      const index = state.address_list.findIndex(addr => addr._id === updatedAddress._id);
      console.log(index)
      if (index !== -1) {
        state.address_list[index] = { ...state.address_list[index], ...updatedAddress };
      }
    },
    addAddressList: (state, action) => {
      state.address_list.push(action.payload);
    },
    deleteAddressFromList: (state, action) => {
      state.address_list = state.address_list.filter(addr => addr._id !== action.payload);
    },

    setCartList: (state, action) => {
      state.cart_list = action.payload;
    },
    updateCartList: (state, action) => {
      const updatedCartItem = action.payload;
      const index = state.cart_list.findIndex(item => item.product_id === updatedCartItem.product_id && item.variant.sku === updatedCartItem.variant.sku);
      if (index !== -1) {
        state.cart_list[index] = { ...state.cart_list[index], ...updatedCartItem };
      }
    },
    addCartList: (state, action) => {
      state.cart_list.push(action.payload);
    },
    deleteCartFromList: (state, action) => {
      state.cart_list = state.cart_list.filter(item => !(item.product_id === action.payload.product_id && item.variant.sku === action.payload.variant.sku));
    }
  }
});

export const {
  setUserProfile,

  setUserProfileDraft,
  updateUserProfileDraft,
  clearUserProfileDraft,

  setAddressList,
  updateAddressList,
  addAddressList,
  deleteAddressFromList,

  setCartList,
  updateCartList,
  addCartList,
  deleteCartFromList
} = userProfileSlice.actions;
export default userProfileSlice.reducer;