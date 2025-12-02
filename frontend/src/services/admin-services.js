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
    }),

    /** Manage orders endpoints */
    getOrders: builder.query({
      query: ({ page = 1, limit = 20, q = "", status, start, end, date } = {}) => ({
        url: "/orders",
        method: "GET",
        params: {
          page,
          limit,
          q: q || undefined,
          status: status && status !== "all" ? status : undefined,
          start: start || undefined,
          end: end || undefined,
          date: date || undefined,
        },
      }),
      providesTags: (result) => {
        const orders = result?.dt?.orders || [];
        return [
          ...orders.map(({ _id }) => ({ type: "Orders", id: _id })),
          { type: "Orders", id: "LIST" },
        ];
      }
    }),
    getOrdersOverview: builder.query({
      query: ({ start, end, days } = {}) => ({
        url: "/orders/overview",
        method: "GET",
        params: {
          start: start || undefined,
          end: end || undefined,
          days: days || undefined,
        },
      }),
      providesTags: [{ type: "Orders", id: "OVERVIEW" }]
    }),
    getOrderDetail: builder.query({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "GET",
      }),
      providesTags: (result, error, orderId) => [
        { type: "OrderDetail", id: orderId },
        { type: "Orders", id: orderId },
      ]
    }),
    updateOrderStatusAdmin: builder.mutation({
      query: ({ orderId, order_status }) => ({
        url: `/orders/${orderId}/status`,
        method: "PUT",
        data: { order_status },
      }),
      invalidatesTags: (result, error, { orderId }) => [
        { type: "Orders", id: orderId },
        { type: "Orders", id: "LIST" },
        { type: "OrderDetail", id: orderId },
        { type: "Orders", id: "OVERVIEW" },
      ]
    }),

    /** Manage products endpoints */
    getProductsAdmin: builder.query({
      query: ({ page = 1, limit = 10, q = "", categoryId } = {}) => ({
        url: "/products",
        method: "GET",
        params: {
          page,
          pageSize: limit,
          keyword: q || undefined,
          category_id: categoryId || undefined,
        },
      }),
      providesTags: (result) => {
        const products = result?.dt?.products || [];
        return [
          ...products.map(({ _id }) => ({ type: "Product", id: _id })),
          { type: "Product", id: "LIST" },
        ];
      }
    }),
    getProductByIdAdmin: builder.query({
      query: (productId) => ({
        url: `/products/${productId}`,
        method: "GET",
      }),
      providesTags: (result, error, productId) => [{ type: "Product", id: productId }]
    }),
    createProductAdmin: builder.mutation({
      query: (payload) => ({
        url: "/products",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [{ type: "Product", id: "LIST" }, { type: "Category", id: "LIST" }]
    }),
    updateProductAdmin: builder.mutation({
      query: ({ _id, ...payload }) => ({
        url: `/products/${_id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: (result, error, { _id }) => [
        { type: "Product", id: _id },
        { type: "Product", id: "LIST" },
        { type: "Category", id: "LIST" },
      ]
    }),
    deleteProductAdmin: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Product", id },
        { type: "Product", id: "LIST" },
        { type: "Category", id: "LIST" },
      ]
    }),
    createVariantAdmin: builder.mutation({
      query: ({ productId, payload }) => ({
        url: `/products/${productId}/variant`,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Product", id: productId },
        { type: "Variant", id: "LIST" },
      ]
    }),
    updateVariantAdmin: builder.mutation({
      query: ({ productId, sku, payload }) => ({
        url: `/products/${productId}/variant`,
        method: "PUT",
        params: { sku },
        data: payload,
      }),
      invalidatesTags: (result, error, { productId, sku }) => [
        { type: "Product", id: productId },
        { type: "Variant", id: sku },
        { type: "Variant", id: "LIST" },
      ]
    }),
    deleteVariantAdmin: builder.mutation({
      query: ({ productId, sku }) => ({
        url: `/products/${productId}/variant`,
        method: "DELETE",
        params: { sku },
      }),
      invalidatesTags: (result, error, { productId, sku }) => [
        { type: "Product", id: productId },
        { type: "Variant", id: sku },
        { type: "Variant", id: "LIST" },
      ]
    }),
    getWarehousesByProduct: builder.query({
      query: (productId) => ({
        url: `/products/${productId}/warehouses`,
        method: "GET",
      }),
      providesTags: (result, error, productId) => {
        const warehouses = result?.dt || [];
        return [
          ...warehouses.map((wh) => ({ type: "Warehouse", id: wh?._id })),
          { type: "Warehouse", id: `LIST-${productId}` },
          { type: "Product", id: productId },
        ];
      }
    }),
    createWarehouseAdmin: builder.mutation({
      query: ({ productId, payload }) => ({
        url: `/products/${productId}/warehouses`,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: "Warehouse", id: `LIST-${productId}` },
        { type: "Product", id: productId },
      ]
    }),
    updateWarehouseAdmin: builder.mutation({
      query: ({ productId, warehouseId, payload }) => ({
        url: `/products/${productId}/warehouses/${warehouseId}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: (result, error, { productId, warehouseId }) => [
        { type: "Warehouse", id: warehouseId },
        { type: "Warehouse", id: `LIST-${productId}` },
        { type: "Product", id: productId },
      ]
    }),
    deleteWarehouseAdmin: builder.mutation({
      query: ({ productId, warehouseId }) => ({
        url: `/products/${productId}/warehouses/${warehouseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, { productId, warehouseId }) => [
        { type: "Warehouse", id: warehouseId },
        { type: "Warehouse", id: `LIST-${productId}` },
        { type: "Product", id: productId },
      ]
    }),
    createWarehouseVariantAdmin: builder.mutation({
      query: ({ productId, warehouseId, payload }) => ({
        url: `/products/${productId}/warehouses/${warehouseId}/variant`,
        method: "POST",
        data: payload,
      }),
      invalidatesTags: (result, error, { productId, warehouseId, payload }) => [
        { type: "Warehouse", id: warehouseId },
        { type: "Warehouse", id: `LIST-${productId}` },
        { type: "Product", id: productId },
        { type: "Variant", id: payload?.sku },
      ]
    }),
    updateWarehouseVariantAdmin: builder.mutation({
      query: ({ productId, warehouseId, sku, payload }) => ({
        url: `/products/${productId}/warehouses/${warehouseId}/variant`,
        method: "PUT",
        params: { sku },
        data: payload,
      }),
      invalidatesTags: (result, error, { productId, warehouseId, sku }) => [
        { type: "Warehouse", id: warehouseId },
        { type: "Warehouse", id: `LIST-${productId}` },
        { type: "Product", id: productId },
        { type: "Variant", id: sku },
      ]
    }),
    deleteWarehouseVariantAdmin: builder.mutation({
      query: ({ productId, warehouseId, sku }) => ({
        url: `/products/${productId}/warehouses/${warehouseId}/variant`,
        method: "DELETE",
        params: { sku },
      }),
      invalidatesTags: (result, error, { productId, warehouseId, sku }) => [
        { type: "Warehouse", id: warehouseId },
        { type: "Warehouse", id: `LIST-${productId}` },
        { type: "Product", id: productId },
        { type: "Variant", id: sku },
      ]
    }),

    /** Categories */
    getCategoriesAdmin: builder.query({
      query: ({ includeProductStats = false } = {}) => ({
        url: "/categories",
        method: "GET",
        params: includeProductStats ? { includeProductStats: true } : undefined,
      }),
      providesTags: (result) => {
        const categories = result?.dt || [];
        return [
          ...categories.map(({ _id }) => ({ type: "Category", id: _id })),
          { type: "Category", id: "LIST" },
        ];
      }
    }),
    createCategoryAdmin: builder.mutation({
      query: (payload) => ({
        url: "/categories",
        method: "POST",
        data: payload,
      }),
      invalidatesTags: [{ type: "Category", id: "LIST" }]
    }),
    updateCategoryAdmin: builder.mutation({
      query: ({ id, payload }) => ({
        url: `/categories/${id}`,
        method: "PUT",
        data: payload,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ]
    }),
    deleteCategoryAdmin: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, id) => [
        { type: "Category", id },
        { type: "Category", id: "LIST" },
      ]
    }),

    /** Dashboard endpoints */
    getDashboardGeneral: builder.query({
      query: () => ({
        url: "/dashboard/general",
        method: "GET",
      }),
      providesTags: [{ type: "Dashboard", id: "GENERAL" }]
    }),
    getDashboardAdvanced: builder.query({
      query: ({ annual, quarterly, monthly, weekly, start, end } = {}) => ({
        url: "/dashboard/advanced",
        method: "GET",
        params: {
          annual: annual || undefined,
          quarterly: quarterly || undefined,
          monthly: monthly || undefined,
          weekly: weekly || undefined,
          start: start || undefined,
          end: end || undefined,
        },
      }),
      providesTags: [{ type: "Dashboard", id: "ADVANCED" }]
    }),

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

  // manage orders
  useGetOrdersQuery,
  useGetOrdersOverviewQuery,
  useGetOrderDetailQuery,
  useUpdateOrderStatusAdminMutation,

  // manage products
  // # manage products
  useGetProductsAdminQuery,
  useGetProductByIdAdminQuery,
  useLazyGetProductByIdAdminQuery,
  useCreateProductAdminMutation,
  useUpdateProductAdminMutation,
  useDeleteProductAdminMutation,
  // # manage variants
  useCreateVariantAdminMutation,
  useUpdateVariantAdminMutation,
  useDeleteVariantAdminMutation,
  // # manage warehouses
  useGetWarehousesByProductQuery,
  useCreateWarehouseAdminMutation,
  useUpdateWarehouseAdminMutation,
  useDeleteWarehouseAdminMutation,
  useCreateWarehouseVariantAdminMutation,
  useUpdateWarehouseVariantAdminMutation,
  useDeleteWarehouseVariantAdminMutation,
  // # manage categories
  useGetCategoriesAdminQuery,
  useCreateCategoryAdminMutation,
  useUpdateCategoryAdminMutation,
  useDeleteCategoryAdminMutation,

  // dashboard endpoints
  useGetDashboardGeneralQuery,
  useGetDashboardAdvancedQuery,
  useLazyGetDashboardAdvancedQuery,
} = adminApi;
