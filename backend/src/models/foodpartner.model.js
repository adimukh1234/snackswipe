const mongoose = require('mongoose');

const FoodPartnerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    address: {
        type: String,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    cuisineType: {
        type: String,
    },
    password : {
        type: String,
        required: true,
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('FoodPartner', FoodPartnerSchema);