import { configureStore } from '@reduxjs/toolkit'

import { productReducer, modalReducer, componentReducer, authReducer, productDetailsReducer } from '#features'

// Import the API slice
import { productApi, addressesApi, authApi, ratingApi } from '#services'

export const store = configureStore({
  reducer: {
    product: productReducer,
    modal: modalReducer,
    component: componentReducer,
    auth: authReducer,
    productDetails: productDetailsReducer,
    [productApi.reducerPath]: productApi.reducer,
    [addressesApi.reducerPath]: addressesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
    [ratingApi.reducerPath]: ratingApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(
      productApi.middleware,
      addressesApi.middleware,
      authApi.middleware,
      ratingApi.middleware
    );
  }
})
