import { configureStore } from '@reduxjs/toolkit'

import { productReducer, modalReducer, componentReducer } from 'redux-tps/features'

// Import the API slice
import { productApi } from 'services/product-api'

export const store = configureStore({
  reducer: {
    product: productReducer,
    modal: modalReducer,
    component: componentReducer,
    [productApi.reducerPath]: productApi.reducer,
  },
  middleware: (getDefaultMiddleware) => {
    return getDefaultMiddleware().concat(productApi.middleware);
  }
})
