import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const discountCodeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      match: [/^[A-Za-z0-9]{5}$/, 'Ma giam gia phai gom 5 ky tu chu hoac so'],
    },
    valueType: {
      type: String,
      enum: ['fixed', 'percent'],
      default: 'fixed',
    },
    value: {
      type: Number,
      required: true,
      min: [0, 'Gia tri giam khong duoc am'],
    },
    maxUsage: {
      type: Number,
      default: 10,
      min: [0, 'So lan su dung toi da khong duoc am'],
      max: [10, 'So lan su dung toi da khong duoc vuot qua 10 theo yeu cau'],
    },
    usedCount: { type: Number, default: 0, min: 0 },
    minOrderValue: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

discountCodeSchema.methods.canUse = function (orderAmount = 0) {
  return (
    this.isActive &&
    this.usedCount < this.maxUsage &&
    orderAmount >= this.minOrderValue
  );
};

discountCodeSchema.methods.calculateDiscount = function (orderAmount = 0) {
  if (!this.canUse(orderAmount)) return 0;
  if (this.valueType === 'percent') {
    return Math.floor((orderAmount * this.value) / 100);
  }
  return Math.min(this.value, orderAmount);
};

export default mongoose.models.DiscountCode || model('DiscountCode', discountCodeSchema);
