import { backendApi } from "./backend-api";

export const productApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductFilter: builder.query({
      keepUnusedDataFor: 30 * 60, // 30 minutes
      query: (params) => ({
        url: "/products/filter",
        method: "GET",
        params: params,
      }),
      // providesTags: [{ type: "Product", id: "FILTER" }],
    }),
    getProductById: builder.query({
      query: (id) => ({ url: `products/${id}`, method: 'GET' }),
      providesTags: (result, error, id) => [{ type: 'Product', id }],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetProductFilterQuery,
  useGetProductByIdQuery,
} = productApi;
