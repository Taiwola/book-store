const jwt = require('jsonwebtoken');

function refreshToken(id) {
    const refreshToken = jwt.sign({ id },  process.env.REFRESH_TOKEN_SECRET, { expiresIn: "1d" });
    return refreshToken
}

module.exports = { refreshToken };