import { backendApi } from './backend-api';

export const adminApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: () => ({
        url: '/users',
        method: 'GET',
      }),
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
    }),
    updateUserById: builder.mutation({
      query: ({ userId, usersPayload }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: usersPayload,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
} = adminApi;
