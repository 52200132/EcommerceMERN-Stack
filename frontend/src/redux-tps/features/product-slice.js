import { createSlice } from '@reduxjs/toolkit'
// import { current } from '@reduxjs/toolkit';

const inits = {
  attribute: { attribute: '', value: '', type: '', is_show_in_table: false, group_attribute: '' },
}

const initialState = {
  product_name: '',
  brand_id: '',
  hashtag: '',
  quantity_sold: 0,
  price_min: 0,
  price_max: 0,
  short_description: '',
  detail_description: '',
  Images: [{ url: '', is_primary: false }],
  Variants: [{
    sku: '',
    price: 0,
    stock: 0,
    Images: [{ url: '', is_primary: false }],
    html_text_attributes: '',
    Attributes: [inits.attribute] // technology or appearance
  }],
  is_active: false,
  created_at: '',
  updated_at: '',
}

// REDUCERS
const attributeReducers = {
  addAttribute: (state, action) => {
    const { variantIndex } = action.payload
    const attributeArr = state.Variants[variantIndex]?.Attributes
    if (attributeArr) {
      attributeArr.push(inits.attribute)
    }
  },
  deleteAttribute: (state, action) => {
    const { variantIndex, attributeIndex } = action.payload
    const variant = state.Variants[variantIndex]
    const attrArr = variant.Attributes
    const attrArrValue = attrArr[attributeIndex];
    if (attrArrValue) {
      attrArr.splice(attributeIndex, 1)
      variant.html_text_attributes = generateAttributesHtml(attrArr);
    }
  },
  changeAttributeValue: (state, action) => {
    const { value, attributeIndex, key, variantIndex } = action.payload
    const variant = state.Variants[variantIndex]
    const attrArr = variant.Attributes
    const attrArrValue = attrArr[attributeIndex];

    if (attrArrValue) {
      attrArrValue[key] = value;
      variant.html_text_attributes = generateAttributesHtml(attrArr);
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
    state.Variants.push({
      sku: '',
      price: 0,
      stock: 0,
      Images: [{ url: '', is_primary: false }],
      Attributes: [inits.attribute],
      html_text_attributes: '',
    });
    // console.log(current(state.Variants));
  },
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

    deleteVariant: (state, action) => {
      const { variantIndex } = action.payload
      if (variantIndex <= state.Variants.length - 1) {
        state.Variants.splice(variantIndex, 1)
      }
    },
    ...variantReducers,
    ...attributeReducers,
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
  
  return `
    <table class="tps-table-technical-content">
    <tbody>
      ${trData}
    </tbody>
    </table>
  `
}

export const {
  setImages, setImagesVariant, addVariant, deleteVariant,
  // attribute actions
  addAttribute, deleteAttribute, changeAttributeValue,
} = productSlice.actions
export default productSlice.reducer
