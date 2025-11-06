import mongoose from "mongoose";

const { Schema, model } = mongoose;

//  Address Schema 
const addressSchema = new Schema({
  receiver: { type: String, required: true },
  phone: { type: String, required: true, match: /^[0-9]{10}$/ },
  country: { type: String, required: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  postalCode: { type: String, required: true },
  isDefault: { type: Boolean, required: true, default: false }, // thêm default hợp lý
}, { _id: true });

//  Variant Schema 
const variantSchema = new Schema({
  sku: { type: String, required: true },
  attributes: [{
    attribute: { type: String, required: true },
    value: { type: String, required: true },
  }],
  price: { type: Number, required: true, min: 0 },
}, { _id: false });

//  Cart Schema 
const cartSchema = new Schema({
  product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
  variant: { type: variantSchema, required: true },
  quantity: { type: Number, required: true, min: 1 },
}, { _id: false });

//  Linked Account Schema 
const linkedAccountSchema = new Schema({
  provider: { type: String, required: true },
  provider_id: { type: String, required: true },
  linked_at: { type: Date, default: Date.now, required: true },
  last_login: { type: Date, default: Date.now, required: true },
}, { _id: false });

//  User Schema 
const userSchema = new Schema({
  username: { type: String, 
    required: true, 
    trim: true, 
    minlength: [2, 'Username must be at least 2 characters'] 
  },
  email: { 
    type: String, 
    required: true, 
    match: [/^.+@.+\..+$/, 'Please fill a valid email address'], 
    unique: true
  },
  password: { 
    type: String, 
    required: true, 
    minlength: [8, 'Password must be at least 8 characters'] 
  },
  isManager: { type: Boolean, default: false },
  Addresses: [addressSchema],
  Carts: [cartSchema],
  Linked_accounts: [linkedAccountSchema],
}, { timestamps: true });

//  Export 
const User = mongoose.models.User || model("User", userSchema);
export default User;