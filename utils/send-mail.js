const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.APP_EMAIL,
        pass: process.env.APP_EMAIL_PASSWORD,
    },
});

const sendMail = async (mailDetails, callback) => {
    const info = transporter.sendMail(mailDetails, (error, res) => {
        callback(error, res);
    });
};

module.exports = sendMail;

