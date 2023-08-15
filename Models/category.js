import mongoose from 'mongoose';
const { model, models } = mongoose;

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        trim: true,
        required: true,
        maxlength: 32
    },
    description : {
        type: String,
        trim: true,
        required: true,
    },
    title : {
        type: String,
        trim: true,
        required: true,
        maxLength : 120
    },
    image : {
        type : String
    }
}, {
    timestamps: true
});

const Category =  models.Category || model('Category', categorySchema);
export default Category;