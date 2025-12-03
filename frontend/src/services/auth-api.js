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

    resetPasswordRequest: build.mutation({
      query: (payload) => ({
        url: '/auth/reset-password',
        method: 'POST',
        data: payload,
      }),
    }),

    confirmResetPassword: build.mutation({
      query: (payload) => ({
        url: '/auth/reset-password/confirm',
        method: 'POST',
        data: payload,
      }),
    }),
  })
})

export const {
  useLazyLinkGoogleAccountQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useLoginGoogleUserMutation,
  useResetPasswordRequestMutation,
  useConfirmResetPasswordMutation
} = authApi 
