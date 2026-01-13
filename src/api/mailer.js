const nodemailer = require('nodemailer');

// Közös SMTP transporter
const transporter = nodemailer.createTransport({
    service: process.env.MAIL_SERVICE,
    auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS // Gmail App Password
    }
});

module.exports = transporter;
