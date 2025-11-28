import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axios-config'

export const backendApi = createApi({
  reducerPath: 'backend-api',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 300, // Gi? cache 5 ph?t
  refetchOnFocus: false,  // Kh?ng refetch khi ??i tab
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
  tagTypes: ['User', 'UserAddresses', 'Cart', 'Orders', 'DiscountCode', 'OrderDetail'],
  endpoints: () => ({}),
})
