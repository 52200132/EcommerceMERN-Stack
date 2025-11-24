import { createApi } from '@reduxjs/toolkit/query/react';
import { axiosBaseQuery } from './axios-config';

export const ratingApi = createApi({
  reducerPath: 'ratingApi',
  baseQuery: axiosBaseQuery(),
  keepUnusedDataFor: 300,
  tagTypes: ['Rating'],
  endpoints: build => ({
    getRatingsByProduct: build.query({
      query: ({ productId, userId, page, limit } = {}) => ({
        url: `ratings/product/${productId}`,
        method: 'GET',
        params: {
          page,
          limit,
          user_id: userId,
        },
      }),
      providesTags: (result, error, { productId }) => [
        { type: 'Rating', id: productId },
      ],
      transformResponse: response => ({
        rating_of_me: response?.dt?.rating_of_me || null,
        ratings: response?.dt?.ratings || response?.dt || [],
        rating_counts: response?.dt?.rating_counts || {},
      }),
    }),
    createRating: build.mutation({
      query: ({ productId, rating, comment }) => ({
        url: `ratings/product/${productId}`,
        method: 'POST',
        data: { rating, comment },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Rating', id: productId },
      ],
    }),
    updateRating: build.mutation({
      query: ({ ratingId, productId, rating, comment }) => ({
        url: `ratings/${ratingId}`,
        method: 'PUT',
        data: { rating, comment },
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Rating', id: productId },
      ],
    }),
    deleteRating: build.mutation({
      query: ({ ratingId, productId }) => ({
        url: `ratings/${ratingId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Rating', id: productId },
      ],
    }),
  }),
});

export const {
  useGetRatingsByProductQuery,
  useLazyGetRatingsByProductQuery,
  useCreateRatingMutation,
  useUpdateRatingMutation,
  useDeleteRatingMutation,
} = ratingApi;
