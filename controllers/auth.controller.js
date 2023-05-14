const Users = require('../models/users.model');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const validator = require('validator');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');


const { createToken, createTimeToken } = require('../libs/token');
const { refreshToken } = require('../libs/refreshToken');
const { sendConfirmationEmail, sendResetTokenMail, passwordResetConfirmedMail } = require("../libs/mailers");



const handleRegistration = async (req, res) => {
  const username = req.body.username.toLowerCase();
  const email = req.body.email.toLowerCase();
  const password = req.body.password;
  const admin = req.body.role;


  if (!username || !email || !password) {
    return res.status(422).json({ success: false, message: "Incomplete payload" })
  }

  // Check if email already exist, if true, send back a response with a 409 status code
  const user = await Users.findOne({ "$or": [{ email }, { username }] })
  if (user) {
    return res.status(409).json({ success: false, message: "conflict request" })
  }

  // do whatever check you want with password
  validator.validatePassword = function (password) {
    const exp = /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d).*$/;
    if (password.match(exp)) {
      return true;
    } else {
      return res.status(403).json({ success: false, message: "Password must something something" });
    }
  }


  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = new Users({
    username: username,
    email: email,
    password: hashedPassword,
    role: admin ?? 'customer'
  });

  try {
    await newUser.save();
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }

  const { error, errorMessage } = await sendConfirmationEmail({ email, username });

  if (error) {
    console.log(errorMessage);

    //If email is an important, you want to delete the user here
  }

  res.status(201).json({ success: true, data: { username, email }, message: "success" });




};

const handleLogin = async (req, res) => {
  const username = req.body.username.toLowerCase();
  const password = req.body.password

  //if no username or password, throw errrr
  if (!username || !password) {
    return res.status(422).json({ success: false, message: "Incomplete payload" })
  }

  const user = await Users.findOne({ username });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isPasswordMatch = await bcrypt.compare(password, user.password);

  //if there is no match, throw an error
  if (!isPasswordMatch) {
    return res.status(403).json({ success: false, message: "Incorrect password" });
  }

  //create an access token for the user
  const accessToken = createToken(user._id);
  const refreshNewToken = refreshToken(user._id);

  user.refreshToken = [...user.refreshToken, refreshNewToken];

  await user.save();


  res.cookie('jwt', refreshNewToken, { httpOnly: true, sameSite: 'none', maxAge: 24 * 60 * 60 * 1000 });



  // send back your response
  res.status(200).json({ success: true, message: username + " has sucessfully logged in", accessToken });
};

const forgotPassWord = async (req, res) => {
  // Get the email from the request
  const email = req.body.email;

  // Check if the email is in the database
  const user = await Users.findOne({ email });
  if (!user) {
    return res.status(400).json({ success: false, message: "User not found" });
  }

  let username = user.username;

  const token = createTimeToken(user._id, '1h');

  // Send an email to the user with the password reset link
  const resetUrl = `http://${req.headers.host}/reset/${token}`;

  const { error, errorMessage } = sendResetTokenMail(resetUrl, email, username)

  
  if (error) {
    console.log(errorMessage);

    //If email is an important, you want to delete the user here
  }

  res.status(200).json({ success: true, message: "Password reset email sent", data: username });
};

const changePassword = async (req, res) => {
  const oldPassword = req.body.oldPassword;
  const newPassword = req.body.newPassword;

  // user is gotten from the authentication
  const user = req.user;

  const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isPasswordMatch) {
    return res.status(403).json({ success: false, message: "Incorrect old password" });
  }

  const hash = await bcrypt.hash(newPassword, saltRounds);

  const newUserPassword = await Users.findByIdAndUpdate({
    _id: user._id,
  }, {
    $set: { password: hash }
  }, { new: true });

  if (!user) return res.status(404).json({ message: 'User not found' });
  res.status(200).json({ success: true, message: "password updated successfully" })
};

const handleLogout = async (req, res) => {
  const user = req.user
  const refreshToken = req.cookies?.jwt;
  if (!refreshToken) return res.status(204).json({ 'success': true, 'message': 'no content' });

  // check if the token exist, the foundToken returns a boolean
  const foundToken = user.refreshToken.some((token) => token === refreshToken);
  // if false
  if (!foundToken) {
    res.clearCookie('jwt', { httpOnly: true })
    return res.status(204).json({ "success": true, 'message': 'no content' });
  }

  // if true, filter the array
  const savedTokens = user.refreshToken.filter((token) => token !== refreshToken);

  // replace the old array in DB with savedTokens
  user.refreshToken = savedTokens;
  
  await user.save();

  // clear cookies
  res.clearCookie('jwt', { httpOnly: true, sameSite: 'none' });

  res.status(200).json({ 'message': `${user.username} has logged out` });
  //
  // // is refresh token in db
  // const foundUser = await Users.findOne({ refreshToken: refreshToken });


  // // if there is no refresh token, clear the cookies
  // if (!foundUser) {
  //   res.clearCookie('jwt', { httpOnly: true })
  //   return res.status(204).json({ "success": true, 'message': 'no content' });
  // }

  // if there is a refresh token
  // const userFound = await Users.findOne(user._id);
  // if (!userFound) return res.status(400).json({ 'success': false, 'message': 'user not found' });

  // userFound.refreshToken = ' '
}

const updateUser = async (req, res) => {
  const user = req.user;
  const username = req.body.username;
  const email = req.body.email;

  const filter = { _id: user._id };
  const update = { username, email };

  let foundUser;
  try {
    foundUser = await Users.findOneAndUpdate(filter, update, { new: true });
    if (!foundUser) return res.status(404).json({ 'success': false, 'message': 'user not found' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error updating user" });
  };

  res.status(200).json({ success: true, message: "user updated", data: foundUser });


}

const resetPassword = async (req, res) => {
  const user = req.user;
  const {email, username} = user

  const password = req.body.password;

  if (!password) return res.status(422).json({ success: false, message: "Incomplete payload" });

  const hashPwd = await bcrypt.hash(password, saltRounds);

  user.password = hashPwd;

  const {error, errorMessage} = await passwordResetConfirmedMail(email, username);
  
  
  if (error) {
    console.log(errorMessage);
    

    //If email is an important, you want to delete the user here
  }

  res.status(200).json({ 'success': true, 'message': 'password succesfully reset', data: username });

}


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

      const foundUser = await Users.findOne({ refreshToken });

      if (!foundUser) return res.status(401).json({ 'message': 'unauthorized, user not found' });
      console.log(foundUser._id.toString());


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

      console.log("accesstoken:", accessToken);
    } catch (error) {
      console.error(error);
      res.status(500).json({ 'message': 'internal server error' });
    }
    
   res.status(200).json({ accessToken });
};


module.exports = { handleRegistration, handleLogin, changePassword, handleLogout, forgotPassWord, updateUser, resetPassword, handleRefreshToken };
