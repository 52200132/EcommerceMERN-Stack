import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axios-config'

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 300, // Giữ cache 5 phút
  refetchOnFocus: false,  // Không refetch khi đổi tab
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
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
      serializeQueryArgs: ({ endpointName, queryArgs }) => {
        return `${endpointName}-${queryArgs}`;
      },
    }),
    createProduct: build.mutation({
      query: (newProduct) => ({
        url: 'products',
        method: 'POST',
        data: newProduct,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: build.mutation({
      query: ({ _id, ...updatedProduct }) => ({
        url: `products/${_id}`,
        method: 'PUT',
        data: updatedProduct,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: 'Product', id: _id },
        // { type: 'Product', id: 'LIST' }
      ],
    }),
    deleteProduct: build.mutation({
      query: (_id) => ({
        url: `products/${_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, _id) => [
        { type: 'Product', id: _id },
        { type: 'Product', id: 'LIST' }
      ],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductByIdQuery,
  useLazyGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = productApi

