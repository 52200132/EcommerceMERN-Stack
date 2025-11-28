import { backendApi } from "./backend-api";

export const adminApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    /** Manage users endpoints */
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
    }),

    /** Manage discount codes endpoints */
    getDiscountCodes: builder.query({
      query: ({ includeOrders = false, page = 1, limit = 10, q = "" } = {}) => ({
        url: "/discount-codes",
        method: "GET",
        params: {
          includeOrders: includeOrders || undefined,
          page,
          limit,
          q: q || undefined,
        },
      }),
      providesTags: (result) => {
        const codes = result?.dt?.codes || [];
        return [
          ...codes.map(({ _id }) => ({ type: "DiscountCode", id: _id })),
          { type: "DiscountCode", id: "LIST" },
        ];
      }
    }),
    createDiscountCode: builder.mutation({
      query: (payload) => ({
        url: "/discount-codes",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [{ type: "DiscountCode", id: "LIST" }]
    }),
    updateDiscountCode: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/discount-codes/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "DiscountCode", id },
        { type: "DiscountCode", id: "LIST" },
      ]
    }),
    deleteDiscountCode: builder.mutation({
      query: (id) => ({
        url: `/discount-codes/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "DiscountCode", id },
        { type: "DiscountCode", id: "LIST" },
      ]
    }),
    getOrdersByDiscountCode: builder.query({
      query: ({ code, page = 1, limit = 10, q = "" }) => ({
        url: `/discount-codes/${code}/orders`,
        method: "GET",
        params: { page, limit, q: q || undefined },
      }),
      providesTags: (result, error, { code }) => [{ type: "DiscountCode", id: code }]
    })

  }),
  overrideExisting: false,
});

export const {
  // manage users
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserByIdMutation,
  useToggleBanUserMutation,

  // manage discount codes
  useGetDiscountCodesQuery,
  useCreateDiscountCodeMutation,
  useUpdateDiscountCodeMutation,
  useDeleteDiscountCodeMutation,
  useLazyGetOrdersByDiscountCodeQuery,

} = adminApi;
