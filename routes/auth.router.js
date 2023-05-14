const express = require("express");
const router = express.Router();



// import middleware
const { authentication } = require("../middlewares/authetication");

// import controllers
const { handleRegistration, handleLogin, changePassword, handleLogout, forgotPassWord, updateUser, resetPassword, handleRefreshToken } = require("../controllers/auth.controller");

// get request for logout function
router.get('/logout', authentication, handleLogout);

// post req for registration
router.post('/register', handleRegistration);

// post request for refresh token
router.post('/refresh', handleRefreshToken);
// post request for forgot password reset
router.post('/forgot-password', forgotPassWord);

// post req for Login
router.post('/login', handleLogin);

// patch route for forgotten password
router.patch('/change-password', authentication, changePassword);
// patch request to update the username or email
router.patch('/update-user', authentication, updateUser);
// PATCH REQUEST TO RESET PASSWORD
router.patch('/reset-password', authentication,resetPassword);


module.exports = router;



