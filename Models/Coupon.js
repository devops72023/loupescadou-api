import mongoose from "mongoose";
const { model, models } = mongoose;

const couponSchema = new mongoose.Schema({
    label: {
        type: String,
        maxLength: 50,
        required: true
    },
    code: {
        type: String,
        default: Date.now()  
    },
    discount: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true
});

const Coupon =  models.Coupon || model('Coupon', couponSchema);
export default Coupon;