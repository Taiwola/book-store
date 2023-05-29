const jwt = require('jsonwebtoken');

// Move it into the token.js, having a separate file for this is redundant

function refreshToken(id) {
    const refreshToken = jwt.sign({ id },  process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
    return refreshToken
}

module.exports = { refreshToken };