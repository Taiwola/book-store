const { error } = require("console");
let { verifyTransPorter, sendMail } = require("../utils/mailing");
const fs = require("fs");
const handlebars = require("handlebars");
const path = require("path");

async function sendConfirmationEmail({ email, username }) {
    let verify;
    try {
        verify = await verifyTransPorter();
    } catch (error) {
        console.log(error);
        return { error: true, errorMessage: error.message };
    }

    if (!verify) return { error: true, errorMessage: "" };

    const mailOptions = {
        from: {
            name: "Book Store",
            address: process.env.MAIL_USERNAME,
        },
        to: email,
        subject: "Nodemailer Project",
        text: ` welcome ${username} to our node project, glad to have you on board`
    };

    try {
        await sendMail(mailOptions);
        return { error: false, errorMessage: "" };
    } catch (error) {
        return { error: true, errorMessage: error.message };
    }
};

async function sendResetTokenMail(resetUrl, email, username) {
    let verify;
    try {
        verify = await verifyTransPorter();
    } catch (error) {
        console.log(error);
        return { error: true, errorMessage: error.message }
    }
    const mailOptions = {
        from: {
            name: "Book store",
            address: process.env.MAIL_USERNAME
        },
        to: email,
        subject: 'Password Reset Request',
        text: `Hi ${username},\n\nYou recently requested to reset your password for your account. Please click on the following link ${resetUrl} to reset your password. This link will expire in 1 hour.\n\nIf you did not request a password reset, please ignore this email and your password will remain unchanged.\n`

    }

    try {
        await sendMail(mailOptions);
        return { error: false, errorMessage: error.message }
    } catch (error) {
        return { error: true, errorMessage: error.message }
    }
}

async function passwordResetConfirmedMail(email, username) {
    let verify;
    try {
        verify = await verifyTransPorter();
    } catch (error) {
        console.log(error);
        return { error: true, errorMessage: error.message };
    }

    if (!verify) return { error: true, errorMessage: " " };

    let mailOptions = {
        from: {
            name: "Book store",
            address: process.env.MAIL_USERNAME
        },
        to: email,
        subject: 'Password Reset',
        text: `Hi ${username},\n\nYour password has been reset. You can now log into your account.\n\nIf you did not request a password reset and got this mail, please contact us at our direct line to issue a complaint .\n`
    };

    try {
        await sendMail(mailOptions);
        console.log("Email sent successfully");
        return { error: false, errorMessage: ""}
    } catch (error) {
        console.log("Error ", error);
       return {error: true, errorMessage: error.message}
    }
}

module.exports = { sendConfirmationEmail, sendResetTokenMail, passwordResetConfirmedMail }