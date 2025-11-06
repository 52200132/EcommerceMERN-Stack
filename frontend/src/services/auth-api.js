import { createApi } from '@reduxjs/toolkit/query/react'
import { axiosBaseQuery } from './axios-config'

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: axiosBaseQuery(),
  endpoints: (build) => ({
    registerUser: build.mutation({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        data: userData,
      }),
    }),

    loginUser: build.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
    }),
  })
})

export const {
  useRegisterUserMutation,
  useLoginUserMutation,
} = authApi 

