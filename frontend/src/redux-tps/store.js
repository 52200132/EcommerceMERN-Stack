import { configureStore } from '@reduxjs/toolkit'

import {
  productReducer, modalReducer, componentReducer, authReducer, productDetailsReducer,
  userProfileReducer
} from '#features'

// Import the API slice
import { addressesApi, authApi, ratingApi, backendApi } from '#services'

export const store = configureStore({
  reducer: {
    product: productReducer,
    modal: modalReducer,
    component: componentReducer,
    auth: authReducer,
    userProfile: userProfileReducer,
    productDetails: productDetailsReducer,
    [backendApi.reducerPath]: backendApi.reducer,
    [addressesApi.reducerPath]: addressesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [ratingApi.reducerPath]: ratingApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(
      backendApi.middleware,
      addressesApi.middleware,
      authApi.middleware,
      ratingApi.middleware
    );
  }
})
