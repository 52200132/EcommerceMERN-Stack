import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  user_profile: {},
  user_profile_draft: {},
  address_list: []
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
  deleteAddressFromList
} = userProfileSlice.actions;
export default userProfileSlice.reducer;