const jwt = require('jsonwebtoken');

function createToken(id) {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    return token
}

function createTimeToken(id, time) {
    const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: time });
    return token
}

module.exports = { createToken, createTimeToken };