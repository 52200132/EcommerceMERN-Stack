import mongoose from "mongoose";

const { Schema, model } = mongoose;

// Subschema / InventoryLog Schema
const inventoryLogSchema = new Schema({
    wh_id: { type: Schema.Types.ObjectId, ref: "Warehouse", required: true },
    location: { type: String, required: true },
    variant_id: { type: Schema.Types.ObjectId, ref: "Variant", required: true },
    change_type: { type: String, enum: ["import", "export", "adjust"], required: true },
    quantity_change: { type: Number, required: true },
    quantity_after: { type: Number, required: true, min: 0 },
    note: { type: String },
    created_by: { type: Schema.Types.ObjectId, ref: "User", required: true },
    created_at: { type: Date, default: Date.now }
});

// Export model
const InventoryLog = mongoose.models.InventoryLog || model("InventoryLog", inventoryLogSchema);
export default InventoryLog;