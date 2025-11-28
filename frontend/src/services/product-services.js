import { backendApi } from "./backend-api";

export const adminApi = backendApi.injectEndpoints({
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

  }),
  overrideExisting: false,
});

export const {
  useGetProductFilterQuery,
} = adminApi;
