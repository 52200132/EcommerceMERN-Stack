import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axios-config'

export const addressesApi = createApi({
  reducerPath: 'addressesApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 300, // Giữ cache 5 phút
  refetchOnFocus: false,  // Không refetch khi đổi tab
  refetchOnReconnect: true,
  refetchOnMountOrArgChange: false,
  endpoints: (build) => ({
    getProvinces: build.query({
      query: () => ({ url: '/addresses/provinces', method: 'GET' }),
    }),
    getDistricts: build.query({
      query: (provinceCode) => ({
        url: `/addresses/provinces/${provinceCode}/districts`,
        method: 'GET',
      }),
    }),
    getWards: build.query({
      query: (districtCode) => ({
        url: `/addresses/districts/${districtCode}/wards`,
        method: 'GET',
      }),
    }),
  }),
})

export const {
  useGetProvincesQuery,
  useGetDistrictsQuery,
  useGetWardsQuery,
} = addressesApi

