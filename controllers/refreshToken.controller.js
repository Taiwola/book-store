const jwt = require('jsonwebtoken');
const User = require('../models/users.model');

const handleRefreshToken = async (req, res) => {
    const refreshToken = req.cookies?.jwt;
    if (!refreshToken) return res.status(400).json({ 'message': 'no cookies and no jwt' });
    console.log("refresh token:", refreshToken);

    try {
        const decoded = await new Promise((resolve, reject) => {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
                if (err) reject(err);
                else resolve(decoded);
            });
        });

        const foundUser = await User.findOne({ refreshToken });

        if (!foundUser) return res.status(401).json({ 'message': 'unauthorized, user not found' });
        console.log(foundUser._id.toString());

        console.log(decoded);
        console.log(decoded.id)

        if (decoded.id !== foundUser._id.toString()) {
            return res.status(403).json({ 'message': 'unauthorized user' });
        }

        // const roles = Object.values(foundUser.role);

        const accessToken = jwt.sign(
            {
                'id': foundUser._id
            },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ accessToken });
        console.log("accesstoken:", accessToken);
    } catch (error) {
        console.error(error);
        res.status(500).json({ 'message': 'internal server error' });
    }
};





module.exports = { handleRefreshToken };