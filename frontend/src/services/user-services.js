import { setCartList } from "#features/user-profile-slice";
import { backendApi } from "./backend-api";

export const userApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    /** auth endpoints */
    login: builder.mutation({
      query: (payload) => ({
        url: "/auth/login",
        method: "POST",
        data: payload,
      }),
      transformResponse: (data) => {
        sessionStorage.setItem("user", JSON.stringify(data));
        return data;
      },
      providesTags: ["Auth"],
    }),

    /** profile endpoints */
    getProfile: builder.query({
      query: () => ({
        url: "/users/profile",
        method: "GET",
      }),
      providesTags: ["User"],
    }),
    updateProfile: builder.mutation({
      query: (profilePayload) => ({
        url: "/users/profile",
        method: "PUT",
        data: profilePayload,
      }),
      invalidatesTags: ["User"],
    }),
    updatePassword: builder.mutation({
      query: (passwordPayload) => ({
        url: "/users/profile/password",
        method: "PUT",
        data: passwordPayload,
      }),
    }),
    /** addresses endpoints */
    getAddresses: builder.query({
      query: () => ({
        url: "/users/addresses",
        method: "GET",
      }),
      providesTags: (r) => {
        const addresses = r?.dt || [];
        return [
          ...addresses.map(({ _id }) => ({ type: "UserAddresses", id: _id })),
          { type: "UserAddresses", id: "LIST" },
        ];
      },
    }),
    addAddress: builder.mutation({
      query: (addressPayload) => ({
        url: "/users/addresses",
        method: "POST",
        data: addressPayload,
      }),
      invalidatesTags: ["UserAddresses"],
    }),
    updateAddress: builder.mutation({
      query: ({ address_id, ...addressPayload }) => ({
        url: `/users/addresses/${address_id}`,
        method: "PUT",
        data: addressPayload,
      }),
      invalidatesTags: (r, e, { address_id }) => [
        { type: "UserAddresses", id: address_id },
        { type: "UserAddresses", id: "LIST" },
      ],
    }),
    deleteAddress: builder.mutation({
      query: (address_id) => ({
        url: `/users/addresses/${address_id}`,
        method: "DELETE",
      }),
      invalidatesTags: (r, e, address_id) => [
        { type: "UserAddresses", id: address_id },
        { type: "UserAddresses", id: "LIST" },
      ],
    }),
    /** carts endpoints */
    getCart: builder.query({
      query: () => ({
        url: "/users/cart",
        method: "GET",
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCartList(data?.dt?.carts || []));
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      },
      // providesTags: ["Cart"],
    }),
    addToCart: builder.mutation({
      query: (payload) => ({
        url: "/users/cart",
        method: "POST",
        data: payload,
      }),
      onQueryStarted: async (arg, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCartList(data?.dt?.carts || []));
        } catch (error) {
          console.error("Error fetching cart data:", error);
        }
      },
      // invalidatesTags: ["Cart"],
    }),
    updateCartItem: builder.mutation({
      query: ({ product_id, sku, ...payload }) => ({
        url: `/users/cart/${product_id}`,
        method: "PUT",
        params: { sku },
        data: payload,
      }),
      // invalidatesTags: ["Cart"],
    }),
    deleteCartItem: builder.mutation({
      query: ({ product_id, sku }) => ({
        url: `/users/cart/${product_id}`,
        method: "DELETE",
        params: { sku },
      }),
      // invalidatesTags: ["Cart"],
    }),
    /** orders endpoints */
    createOrder: builder.mutation({
      query: (orderPayload) => ({
        url: "/orders",
        method: "POST",
        data: orderPayload,
      }),
      invalidatesTags: ["Cart", "Orders"],
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: "/orders/myorders",
        method: "GET",
      }),
      providesTags: ["Orders"],
    }),
    getOrderById: builder.query({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: (r, e, orderId) => [{ type: "OrderDetail", id: orderId }],
    }),
    getOrderStatusHistory: builder.query({
      query: (orderId) => ({
        url: `/orders/${orderId}/history_status`,
        method: "GET",
      }),
      providesTags: (r, e, orderId) => [{ type: "OrderDetail", id: orderId }],
    }),
    cancelMyOrder: builder.mutation({
      query: ({ orderId }) => ({
        url: `/orders/${orderId}/cancel`,
        method: "PUT",
        data: { order_status: "cancelled" },
      }),
      invalidatesTags: (r, e, { orderId }) => [
        "Orders",
        "Points",
        { type: "OrderDetail", id: orderId },
      ],
    }),
    applyDiscountCode: builder.mutation({
      query: (payload) => ({
        url: "/discount-codes/use",
        method: "POST",
        data: payload,
      }),
    }),
    getProductsInfoForOrder: builder.mutation({
      query: (itemsPayload) => ({
        url: "/products/info_for_order/bulk",
        method: "POST",
        data: { items: itemsPayload },
      }),
    }),
    /** points endpoints */
    getPointsOverview: builder.query({
      query: () => ({
        url: "/users/me/general-of-points",
        method: "GET",
      }),
      providesTags: ["Points"],
    }),
    getPointsHistory: builder.query({
      query: () => ({
        url: "/users/me/points-history",
        method: "GET",
      }),
      providesTags: ["Points"],
    }),
    /** points endpoints */
  }),
  overrideExisting: false,
});

export const {
  // auth

  // profile 
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUpdatePasswordMutation,
  // addresses
  useGetAddressesQuery,
  useLazyGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  // carts
  useGetCartQuery,
  useLazyGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useDeleteCartItemMutation,
  // orders
  useCreateOrderMutation,
  useGetMyOrdersQuery,
  useGetOrderByIdQuery,
  useGetOrderStatusHistoryQuery,
  useCancelMyOrderMutation,
  // discount & info
  useApplyDiscountCodeMutation,
  useGetProductsInfoForOrderMutation,
  // points
  useGetPointsOverviewQuery,
  useGetPointsHistoryQuery,
} = userApi;
