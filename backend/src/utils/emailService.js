import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp-relay.brevo.com',
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

export const sendVerificationEmail = async (to, code) => {
    // If credentials are missing, log to console instead of crashing
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('========================================================');
        console.log(`⚠️ SMTP Credentials Missing. Mocking Email Send.`);
        console.log(`📧 To: ${to}`);
        console.log(`🔑 Verification Code: ${code}`);
        console.log('========================================================');
        return true;
    }

    const mailOptions = {
        from: `"SociaLink Security" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Votre code de vérification SociaLink',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #2563eb;">Vérification de votre compte</h2>
                <p>Merci de vous être inscrit sur SociaLink.</p>
                <p>Voici votre code de vérification à 6 chiffres :</p>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0;">
                    <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px; color: #1e293b;">${code}</span>
                </div>
                <p>Ce code expirera dans 15 minutes.</p>
                <p style="font-size: 12px; color: #64748b;">Si vous n'avez pas demandé ce code, veuillez ignorer cet email.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Message sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
};

export const sendPasswordResetEmail = async (to, token) => {
    // Mock if no credentials
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('========================================================');
        console.log(`⚠️ SMTP Credentials Missing. Mocking Password Reset Email.`);
        console.log(`📧 To: ${to}`);
        console.log(`🔗 Link: http://localhost:5173/reset-password/${token}`);
        console.log('========================================================');
        return true;
    }

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    const mailOptions = {
        from: `"SociaLink Security" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Réinitialisation de votre mot de passe SociaLink',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #2563eb;">Mot de passe oublié ?</h2>
                <p>Vous avez demandé la réinitialisation de votre mot de passe.</p>
                <p>Cliquez sur le lien ci-dessous pour en créer un nouveau :</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${resetLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser mon mot de passe</a>
                </div>
                <p>Ce lien expirera dans 1 heure.</p>
                <p style="font-size: 12px; color: #64748b;">Si vous n'avez pas demandé cette action, veuillez ignorer cet email.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Reset email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending reset email:", error);
        return false;
    }
};

//----------------------------- Application Notification Emails -----------------------------//

/**
 * Notify establishment when a worker applies to their mission
 */
export const sendApplicationReceivedEmail = async (to, workerName, missionTitle) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('========================================================');
        console.log(`📧 [MOCK] Application Notification`);
        console.log(`To: ${to}`);
        console.log(`Worker: ${workerName} applied to "${missionTitle}"`);
        console.log('========================================================');
        return true;
    }

    const mailOptions = {
        from: `"SociaLink Recrutement" <${process.env.SMTP_USER}>`,
        to,
        subject: `Nouvelle candidature reçue - ${missionTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: #059669;">🎉 Nouvelle candidature !</h2>
                <p>Bonne nouvelle ! Un professionnel a postulé à votre mission.</p>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Mission :</strong> ${missionTitle}</p>
                    <p style="margin: 10px 0 0;"><strong>Candidat :</strong> ${workerName}</p>
                </div>
                <p>Connectez-vous à votre espace recruteur pour consulter ce profil et répondre à cette candidature.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/establishment/applications" 
                       style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       Voir la candidature
                    </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">Cet email a été envoyé automatiquement par SociaLink.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Application notification sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending application notification:", error);
        return false;
    }
};

/**
 * Notify worker when their application status changes (accepted/rejected)
 */
export const sendApplicationStatusEmail = async (to, status, missionTitle, establishmentName) => {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('========================================================');
        console.log(`📧 [MOCK] Application Status Update`);
        console.log(`To: ${to}`);
        console.log(`Status: ${status} for "${missionTitle}" at ${establishmentName}`);
        console.log('========================================================');
        return true;
    }

    const isAccepted = status === 'ACCEPTED';
    const statusText = isAccepted ? 'Félicitations ! 🎉' : 'Mise à jour de candidature';
    const statusMessage = isAccepted
        ? `Votre candidature pour "${missionTitle}" chez ${establishmentName} a été acceptée !`
        : `Malheureusement, votre candidature pour "${missionTitle}" chez ${establishmentName} n'a pas été retenue.`;
    const ctaText = isAccepted ? 'Voir les détails' : 'Trouver d\'autres missions';
    const ctaUrl = isAccepted ? '/worker/applications' : '/worker/missions';

    const mailOptions = {
        from: `"SociaLink Carrière" <${process.env.SMTP_USER}>`,
        to,
        subject: isAccepted
            ? `🎉 Candidature acceptée - ${missionTitle}`
            : `Réponse à votre candidature - ${missionTitle}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; background-color: #f9f9f9; border-radius: 10px;">
                <h2 style="color: ${isAccepted ? '#059669' : '#64748b'};">${statusText}</h2>
                <p>${statusMessage}</p>
                <div style="background-color: #ffffff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Mission :</strong> ${missionTitle}</p>
                    <p style="margin: 10px 0 0;"><strong>Établissement :</strong> ${establishmentName}</p>
                    <p style="margin: 10px 0 0;"><strong>Statut :</strong> 
                        <span style="color: ${isAccepted ? '#059669' : '#dc2626'}; font-weight: bold;">
                            ${isAccepted ? 'Acceptée ✓' : 'Non retenue'}
                        </span>
                    </p>
                </div>
                ${isAccepted
                ? '<p>Connectez-vous à votre espace pour voir les détails de la mission et contacter l\'établissement.</p>'
                : '<p>Ne vous découragez pas ! De nombreuses missions vous attendent sur SociaLink.</p>'
            }
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}${ctaUrl}" 
                       style="background-color: ${isAccepted ? '#059669' : '#2563eb'}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                       ${ctaText}
                    </a>
                </div>
                <p style="font-size: 12px; color: #64748b;">Cet email a été envoyé automatiquement par SociaLink.</p>
            </div>
        `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`Application status email sent: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error("Error sending application status email:", error);
        return false;
    }
};

