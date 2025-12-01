import { createSlice } from '@reduxjs/toolkit'
import { max, min } from 'lodash';

export const productInits = {
  attribute: {
    attribute: "",
    value: "",
    type: "",
    is_show_in_table: false,
    group_attribute: "",
  },
  get variant() {
    return {
      sku: "",
      price: "",
      cost_price: 0,
      stock: 0,
      // Images: [{ url: "tps-default.jpg", is_primary: true }],
      Images: [],
      // Attributes: [this.attribute], // lúc này this trỏ đúng vào inits
      Attributes: [],
      html_text_attributes: "",
      is_active: true,
    };
  },
};

export const initialState = {
  product_name: '',
  brand_id: '',
  category_id: '',
  hashtag: '',
  quantity_sold: 0,
  price_min: 0,
  price_max: 0,
  short_description: '',
  detail_description: '',
  // Images: [{ url: 'tps-default.jpg', is_primary: true }],
  Images: [],
  Warehouses: [],
  Variants: [{
    sku: '',
    price: '',
    cost_price: 0,
    stock: 0,
    // Images: [{ url: 'tps-default.jpg', is_primary: true }],
    Images: [],
    html_text_attributes: '',
    // Attributes: [productInits.attribute, productInits.attribute], // technology or appearance
    Attributes: [],
  }],
  is_active: true,
  created_at: '',
  updated_at: '',
}

// REDUCERS
const attributeReducers = {
  setAttributes: (state, action) => {
    const { variantIndex, attributes } = action.payload;
    if (state.Variants[variantIndex]) {
      state.Variants[variantIndex].Attributes = attributes;
      state.Variants[variantIndex].html_text_attributes = generateAttributesHtml(attributes);
    }
  },
  deleteAttributes: (state, action) => {
    const { variantIndex } = action.payload;
    if (state.Variants[variantIndex]) {
      state.Variants[variantIndex].Attributes = [];
      state.Variants[variantIndex].html_text_attributes = '';
    }
  }
}
const variantReducers = {
  setImagesVariant: (state, action) => {
    const { variantIndex, images } = action.payload;
    if (state.Variants[variantIndex]) {
      state.Variants[variantIndex].Images = images;
      // console.log('== change variant images')
    }
  },
  addVariant: (state) => {
    state.Variants.push(productInits.variant);
  },
  deleteVariant: (state, action) => {
    const { variantIndex } = action.payload
    if (variantIndex <= state.Variants.length - 1) {
      state.Variants.splice(variantIndex, 1)
    }
  },
  updateVariantDraft: (state, action) => {
    const { variantIndex, object } = action.payload
    if (state.Variants[variantIndex]) {
      Object.assign(state.Variants[variantIndex], object)
    }
  }
}

const productSlice = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setImages: (state, action) => {
      const { images } = action.payload
      // console.log('>>> check payload: ', action.payload)
      state.Images = images;
    },
    setValues: (state, action) => {
      const object = action.payload
      if (object) {
        Object.assign(state, object)
      }
    },
    updateProduct: (state, action) => {
      Object.assign(state, action.payload)
    },
    clearProductState: (state) => {
      Object.assign(state, initialState)
    },
    ...variantReducers,
    ...attributeReducers,
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => action.type.startsWith('product/') &&
          action.type.includes('Variant') && !action.type.includes('Images'),
        (state) => {
          triggerSetPriceMaxPriceMin(state);
        }
      );
  },
})

const generateAttributesHtml = (attrArr = [{}]) => {
  const trData = attrArr.map((arr) => {
    const { attribute, value, is_show_in_table } = arr;
    if (!is_show_in_table) return '';
    return `
          <tr>
            <td>${attribute}</td>
            <td>${value}</td>
          </tr>
          `
  }).join('')
  if (!trData) return ''
  return `
    <table class="tps-technical-table-content">
    <tbody>
      ${trData}
    </tbody>
    </table>
  `
}

const triggerSetPriceMaxPriceMin = (state) => {
  const prices = state.Variants.map(variant => +variant.price);
  state.price_min = min(prices) || 0;
  state.price_max = max(prices) || 0;
}

export const {
  // product actions
  setImages, setValues, updateProduct, clearProductState,
  // variant actions
  setImagesVariant, addVariant, deleteVariant, updateVariantDraft,
  // attribute actions
  setAttributes, deleteAttributes,
} = productSlice.actions
export default productSlice.reducer
