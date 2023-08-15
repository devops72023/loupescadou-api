import mongoose from 'mongoose';
const { model, models } = mongoose;

const settingSchema = new mongoose.Schema({
    maincolor: {
        type: String,
        default: '#000C6E'
    },
    secondarycolor: {
        type: String,
        default: '#4F9CC9'
    },
    textcolor: {
        type: String,
        default: '#f1f6f8'
    },
    favicon : {
        type: String,
        default: 'favicon.png'
    },
    logo : {
        type: String,
        default: 'logo.png',
        required: true
    },
    phone : {
        type: String,
    },
    email : {
        type: String,
    },
    adresse : {
        type: String,
    },
    latitude : {
        type: Number,
        default: 30.39661031502661
    },
    longitude : {
        type: Number,
        default: -8.09944562500000,
    },
    
}, {
    timestamps: true
});


const Setting =  models.Setting || model('Setting', settingSchema);
export default Setting;