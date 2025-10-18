import { configureStore } from '@reduxjs/toolkit'

import productReducer from './features/product-slice'
import modalReducer from './features/modal-slice'
import componentReducer from './features/component-action-slice'

export const store = configureStore({
  reducer: {
    product: productReducer,
    modal: modalReducer,
    component: componentReducer,
  },
})
