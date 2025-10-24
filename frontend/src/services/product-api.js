import { createApi } from '@reduxjs/toolkit/query/react'
import axiosBaseQuery from './axiosBaseQuery'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Product'],
  endpoints: (build) => ({
    getProducts: build.query({
      query: () => ({ url: '/products/all', method: 'GET' }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Product', id })), { type: 'Product', id: 'LIST' }, ]
          : [{ type: 'Product', id: 'LIST' }],
    }),
    getProductById: build.query({
      query: (id) => ({ url: `/products/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    addProduct: build.mutation({
      query: (newProduct) => ({
        url: '/products',
        method: 'POST',
        data: newProduct,
      }),
      invalidatesTags: ['Product'],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useAddProductMutation,
} = productApi

