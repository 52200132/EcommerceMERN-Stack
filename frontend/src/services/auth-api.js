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

    linkGoogleAccount: build.query({
      query: ({ origin, feRedirectUri = '' }) => ({
        url: `/auth/google-link-account?origin=${origin}&feRedirectUri=${feRedirectUri}`,
        method: 'GET',
      }),
    }),

    loginUser: build.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        data: credentials,
      }),
    }),

    loginGoogleUser: build.mutation({
      query: () => ({
        url: `/auth/google-login?origin=${window.location.origin}`,
        method: 'GET',
      }),
    }),
  })
})

export const {
  useLazyLinkGoogleAccountQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoginGoogleUserMutation
} = authApi 

