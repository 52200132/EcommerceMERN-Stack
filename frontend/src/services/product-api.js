import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axios-config'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 300, // Giữ cache 5 phút
  refetchOnFocus: false,  // Không refetch khi đổi tab
  refetchOnReconnect: true,
  tagTypes: ['Product'],
  endpoints: (build) => ({
    getProducts: build.query({
      query: ({ page = 1, pageSize = 10 } = {}) => ({
        url: `products?page=${page}&pageSize=${pageSize}`,
        method: 'GET'
      }),
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        const { page = 1, pageSize = 10 } = queryArgs || {};
        return `${endpointName}-page${page}-size${pageSize}`;
      },
      providesTags: (result) => {
        const products = result?.dt?.products;
        // console.log(result, products);
        return products
          ? [...products.map(({ _id }) => ({ type: 'Product', id: _id })), { type: 'Product', id: 'LIST' }]
          : [{ type: 'Product', id: 'LIST' }]
      },
    }),
    getProductById: build.query({
      query: (id) => ({ url: `products/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
    createProduct: build.mutation({
      query: (newProduct) => ({
        url: 'products',
        method: 'POST',
        data: newProduct,
      }),
      invalidatesTags: ['Product'],
    }),
    test: build.mutation({
      query: () => ({ url: '/products/test', method: 'GET' }),
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
} = productApi

