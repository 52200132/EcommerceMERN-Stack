import { configureStore } from '@reduxjs/toolkit'

import productReducer from './features/product-slice'
import modalReducer from './features/modal-slice'
import componentReducer from './features/component-action-slice'

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
