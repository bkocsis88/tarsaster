const nodemailer = require('nodemailer');
const { google } = require('googleapis');

// Google Cloud Console-ban létrehozott OAuth2 adatok
const CLIENT_ID = '906180165075-dj1b8bpo1hvvj4mrpd5rcms8hbefqer2.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04jdiXUWb71LUCgYIARAAGAQSNwF-L9IrK7wdcJfdW_DysxsfSKQrWaNBO66qVVp6duzZq0nTtyn1BRLrrI_EshSrky0o8EhP58M';

// OAuth2 kliens inicializálása
const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
);

oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

// Jelszó visszaállítás e-mail küldése
async function sendPasswordResetEmail(userEmail, resetToken) {
    try {
        // OAuth2 access token lekérése
        const accessToken = await oAuth2Client.getAccessToken();

        // Nodemailer transporter létrehozása
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                type: 'OAuth2',
                user: 'ist.m.tunde@gmail.com',
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
                accessToken: accessToken.token,
            },
        });

        // Visszaállítási link (példa)
        const resetLink = `http://localhost/reset-password?token=${resetToken}`;

        // E-mail tartalom
        const mailOptions = {
            from: 'Jelszó visszaállítás <tarsaster2025@gmail.com>',
            to: userEmail,
            subject: 'Jelszó visszaállítás',
            html: `
        <h3>Jelszó visszaállítás</h3>
        <p>A jelszó visszaállításához kattints az alábbi linkre:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>A link 1 óráig érvényes.</p>
      `,
        };

        // E-mail küldése
        const result = await transporter.sendMail(mailOptions);
        console.log('Email elküldve:', result);
        return result;
    } catch (error) {
        console.error('Hiba történt az e-mail küldése közben:', error);
        throw error;
    }
}

module.exports = sendPasswordResetEmail;
