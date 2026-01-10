const nodemailer = require('nodemailer');

// Közös SMTP transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'tarsaster2025@gmail.com',
        pass: 'tdocmzmvflbshtop' // Gmail App Password
    }
});

module.exports = transporter;
