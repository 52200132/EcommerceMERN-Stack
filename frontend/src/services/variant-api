import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axios-config'

export const variantApi = createApi({
  reducerPath: 'variantApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 300, // Giữ cache 5 phút
  refetchOnFocus: false,  // Không refetch khi đổi tab
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
  tagTypes: ['Variant'],
  endpoints: (build) => ({
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
} = variantApi

