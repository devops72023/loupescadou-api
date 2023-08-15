import mongoose from 'mongoose';
const { model, models } = mongoose;
const {ObjectId} = mongoose.Schema;

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: true,
    },
    description: {
        type: String,
        required: true,
        maxlength: 2000
    },
    price: {
        type: Number,
        trim: true,
        required: true,
        maxlength: 32
    },
    category: {
        type: ObjectId,
        ref: 'Category',
        required: true
    },
    quantity: {
        type: Number
    },
    sold: {
        type: Number,
        default: 0
    },
    photo: {
        type: String,
        default: ''
    },
}, {
    timestamps: true
});


// module.exports = mongoose.model('Product', productSchema);
const Product = models.Product || model('Product', productSchema);

export default Product;