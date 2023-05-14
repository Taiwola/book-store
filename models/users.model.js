const mongoose = require('mongoose');



const userSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, reuqired: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['customer', 'ADMIN'],
        default: 'customer'
    },
    refreshToken: [{ type: String }],
    resetPasswordToken: { type: String }
});


const User = mongoose.model('User', userSchema);


module.exports = User;