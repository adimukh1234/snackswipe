const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    video: {
        type: String,
    },
    foodpartner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FoodPartner',
        required: true,
    }
}, 

)

foodModel = mongoose.model('Food', foodSchema);

module.exports = foodModel;