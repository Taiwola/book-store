const mongoose = require('mongoose');

const customerSchema = mongoose.Schema({
    customer: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true},
    book: {type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true},
    bookmark: {type: Boolean, default: false},
    purchased: {type: Boolean, default: false},
    salesCount: { type: Number, default: 0 }
});


const Customer = mongoose.model('Customer', customerSchema);

module.exports = Customer;