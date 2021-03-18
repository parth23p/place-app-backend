const mongoose = require('mongoose');
const user = require('./user');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    // location: {
    //     lat: { type: Number, required: true },
    //     lng: { type: Number, required: true }
    // },
    address: { type: String, required: true },
    image: { type: String, required: true },

    creator: { type: mongoose.Types.ObjectId, requied: true, ref: 'User' }
});
module.exports = mongoose.model('Place', placeSchema);
// collection doesn't have first character upper case and always in plural form
// so in modal 'Place' but in collection it is 'places'