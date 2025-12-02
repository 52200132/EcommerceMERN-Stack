import { backendApi } from "./backend-api";

export const commentApi = backendApi.injectEndpoints({
  endpoints: (builder) => ({
    createComment: builder.mutation({
      query: ({ productId, content, parentCommentId, displayName, guestId }) => ({
        url: `comments/product/${productId}`,
        method: "POST",
        data: { content, parent_comment_id: parentCommentId, user_displayed_name: displayName, guest_id: guestId },
      }),
    }),
    getCommentsByProduct: builder.query({
      query: ({ productId, userId, guestId, page, limit }) => ({
        url: `comments/product/${productId}`,
        method: "GET",
        params: { user_id: userId, guest_id: guestId, page, limit },
      }),
    }),
    updateComment: builder.mutation({
      query: ({ commentId, content, guestId }) => ({
        url: `comments/${commentId}`,
        method: "PUT",
        data: { content, guest_id: guestId },
      }),
    }),
    deleteComment: builder.mutation({
      query: ({ commentId, guestId }) => ({
        url: `comments/${commentId}`,
        method: "DELETE",
        data: { guest_id: guestId },
      }),
    }),
  }), overrideExisting: false,
});

export const {
  useGetCommentsByProductQuery,
  useCreateCommentMutation,
  useUpdateCommentMutation,
  useDeleteCommentMutation,
} = commentApi;
