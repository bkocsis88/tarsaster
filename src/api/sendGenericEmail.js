const transporter = require('./mailer');

/**
 * Általános email küldő
 * @param {string} to - címzett email
 * @param {string} subject - email tárgy
 * @param {string} html - email HTML tartalom
 */
async function sendGenericEmail(to, subject, html) {
    const mailOptions = {
        from: 'TársasApp <tarsaster2025@gmail.com>',
        to,
        subject,
        html
    };

    return transporter.sendMail(mailOptions);
}

module.exports = sendGenericEmail;
