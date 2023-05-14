const nodemailer = require('nodemailer');

const sendMail = async (req, res) => {
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            type: 'OAuth2',
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD,
            clientId: process.env.OAUTH_CLIENTID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
        }
    });

    let mailOptions = {
        from: 'seunolanitori@gmail.com',
        to: 'seunolanitori@hotmail.com',
        subject: 'Nodemailer Project',
        text: 'Hi from your nodemailer project'
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error " + err);
            res.sendstatus(400)
        } else {
            console.log("Email sent successfully");
            res.status(200).json({'success': true, 'message': 'Email sent successfully', data: data})
        }
    });
};

module.exports = { sendMail };
