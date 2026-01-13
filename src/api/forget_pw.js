const transporter = require('./mailer');

// Jelszó visszaállítás e-mail küldése
async function sendPasswordResetEmail(req, userEmail, resetToken) {
    try {
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const resetLink = `${baseUrl}/reset-password?token=${resetToken}`;

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
