import { backendApi } from "./backend-api";

export const adminApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getAllUsers: builder.query({
      query: ({ page = 1, limit = 10, q = "", status, role } = {}) => ({
        url: "/users",
        method: "GET",
        params: {
          page,
          limit,
          q,
          status: status === "all" ? undefined : status,
          role: role === "all" ? undefined : role,
        },
      }),
      providesTags: (result) => {
        const users = result?.dt?.users || [];
        return [
          ...users.map(({ _id }) => ({ type: "User", id: _id })),
          { type: "User", id: "LIST" },
        ];
      }
    }),
    getUserById: builder.query({
      query: (userId) => ({
        url: `/users/${userId}`,
        method: "GET",
      }),
      providesTags: (result, error, userId) => [{ type: "User", id: userId }]
    }),
    updateUserById: builder.mutation({
      query: ({ userId, usersPayload }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        data: usersPayload,
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
      ]
    }),
    toggleBanUser: builder.mutation({
      query: ({ userId, is_banned, banned_reason }) => ({
        url: `/users/${userId}`,
        method: "PUT",
        data: { is_banned, banned_reason },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
      ]
    })
  }),
  overrideExisting: false,
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useToggleBanUserMutation,
} = adminApi;
