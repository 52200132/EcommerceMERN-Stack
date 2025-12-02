import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  product: {
    num_reviews: 0,
    rating: 0,
    primary_image_url: '',
    _id: null,
    product_name: '',
    brand_id: null,
    hashtag: 'laptop',
    quantity_sold: 0,
    price_min: 0,
    price_max: 0,
    short_description: '',
    detail_description: '',
    Images: [],
    Variants: [],
    Warehouses: [],
    is_active: true,
    created_at: null,
    updated_at: null,
    imgs_slider: []
  },
  ratings: {},
  comments: {}
};

export const productDetailsSlice = createSlice({
  name: 'productDetails',
  initialState,
  reducers: {
    setProduct: (state, action) => {
      Object.assign(state.product, action.payload);
      state.product.primary_image_url = action.payload.Images.find(img => img.is_primary)?.url || '';
    },
    setRatings: (state, action) => {
      Object.assign(state.ratings, action.payload);
    },
    clearProductDetails: (state) => {
      Object.assign(state, initialState);
    }
  }
});

export const {
  setProduct, setRatings, clearProductDetails
} = productDetailsSlice.actions;
export default productDetailsSlice.reducer;