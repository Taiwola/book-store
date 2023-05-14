const nodemailer = require("nodemailer");

// Set up the Nodemailer transporter
let transporter = nodemailer.createTransport({
    service: "gmail",
    secure: true,
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENTID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

const verifyTransPorter = async () => await transporter.verify();

const sendMail = async (mailOptions) => await transporter.sendMail(mailOptions);

module.exports = { verifyTransPorter, sendMail };