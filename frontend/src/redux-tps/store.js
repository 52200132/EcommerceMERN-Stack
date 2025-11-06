import { configureStore } from '@reduxjs/toolkit'

import { productReducer, modalReducer, componentReducer, authReducer } from '#features'

// Import the API slice
import { productApi, addressesApi, authApi } from '#services'

export const store = configureStore({
  reducer: {
    product: productReducer,
    modal: modalReducer,
    component: componentReducer,
    auth: authReducer,
    [productApi.reducerPath]: productApi.reducer,
    [addressesApi.reducerPath]: addressesApi.reducer,
    [authApi.reducerPath]: authApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(productApi.middleware, addressesApi.middleware, authApi.middleware);
  }
})
