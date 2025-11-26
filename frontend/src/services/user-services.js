import { backendApi } from './backend-api';

export const userApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query({
      query: () => ({
        url: '/users/profile',
        method: 'GET',
      }),
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (profilePayload) => ({
        url: '/users/profile',
        method: 'PUT',
        data: profilePayload,
      }),
      invalidatesTags: ['User'],
    }),
    updatePassword: builder.mutation({
      query: (passwordPayload) => ({
        url: '/users/profile/password',
        method: 'PUT',
        data: passwordPayload,
      }),
      // invalidatesTags: ['User'],
    }),
    getAddresses: builder.query({
      query: () => ({
        url: '/users/addresses',
        method: 'GET',
      }),
      providesTags: (r, e, arg) => {
        const addresses = r?.dt || [];
        return [
          ...addresses.map(({ _id }) => ({ type: 'UserAddresses', id: _id })),
          { type: 'UserAddresses', id: 'LIST' },
        ];
      },
    }),
    addAddress: builder.mutation({
      query: (addressPayload) => ({
        url: '/users/addresses',
        method: 'POST',
        data: addressPayload,
      }),
      invalidatesTags: ['UserAddresses'],
    }),
    updateAddress: builder.mutation({
      query: ({ address_id, ...addressPayload }) => ({
        url: `/users/addresses/${address_id}`,
        method: 'PUT',
        data: addressPayload,
      }),
      invalidatesTags: (r, e, { address_id }) => [
        { type: 'UserAddresses', id: address_id },
        { type: 'UserAddresses', id: 'LIST' }
      ],
    }),
    deleteAddress: builder.mutation({
      query: (address_id) => ({
        url: `/users/addresses/${address_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (r, e, address_id) => [
        { type: 'UserAddresses', id: address_id },
        { type: 'UserAddresses', id: 'LIST' }
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  useGetAddressesQuery,
  useLazyGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
} = userApi;
