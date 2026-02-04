import { createNotification } from "../services/notificationService.js";
import { prisma } from "../config/db.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/generateToken.js";
import { sendVerificationEmail, sendPasswordResetEmail } from "../utils/emailService.js";
import crypto from 'crypto';

/**
 * Génère un code OTP (One Time Password) à 6 chiffres.
 * @returns {string} Code OTP généré
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

//----------------------------- Inscription Travailleur -----------------------------//
/**
 * Inscrit un nouveau travailleur (Worker).
 * Crée un utilisateur et son profil associé.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const registerWorker = async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, address, city_id, region, cnie, birth_place, linkedin_url } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (!existingUser.isEmailVerified) {
        // User exists but not verified (maybe stuck). 
        // Strategy: Resend OTP logic could be triggered here or inform user to verify.
        // For security, let's treat as "User already exists" but maybe hint at verification?
        // Simpler: Just block.
      }
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateOTP();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    //  Transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "WORKER",
          verificationCode,
          verificationCodeExpiresAt,
          isEmailVerified: false,
        },
      });

      await tx.workerProfile.create({
        data: {
          user_id: newUser.user_id,
          first_name,
          last_name,
          phone,
          address: address || null,
          city_id: city_id ? parseInt(city_id) : null,
          // Note: Les champs région, cnie, birth_place, linkedin_url peuvent être ajoutés ici si le schéma le supporte.
          // Pour l'instant, nous nous limitons aux champs confirmés dans le schéma Prisma actuel.
          cnie: cnie || null,
          birth_place: birth_place || null,
        },
      });
    });

    // Send Email
    await sendVerificationEmail(email, verificationCode);

    // Response: No Token yet!
    res.status(201).json({
      status: "success",
      message: "Inscription réussie. Veuillez vérifier votre email.",
      requiresVerification: true,
      email: email
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed", error: error.message });
  }
};

//----------------------------- Inscription Établissement -----------------------------//
/**
 * Inscrit un nouvel établissement.
 * Notifie les administrateurs pour validation.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const registerEstablishment = async (req, res) => {
  try {
    const { email, password, name, contact_first_name, contact_last_name, phone, ice_number } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "Un compte avec cet email existe déjà" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateOTP();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          role: "ESTABLISHMENT",
          verificationCode,
          verificationCodeExpiresAt,
          isEmailVerified: false,
        },
      });

      await tx.establishmentProfile.create({
        data: {
          user_id: newUser.user_id,
          name,
          contact_first_name,
          contact_last_name,
          phone,
          ice_number,
          verification_status: "PENDING",
        },
      });
    });

    // Notify Admins
    try {
      const admins = await prisma.user.findMany({
        where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
        select: { user_id: true }
      });

      if (admins.length > 0) {
        await Promise.all(admins.map(admin => createNotification({
          userId: admin.user_id,
          type: 'INFO',
          message: `Nouvel établissement inscrit: ${name}`,
          link: '/admin/verification/establishments' 
        })));
      }
    } catch (notifError) {
      console.error("NOTIFICATION ERROR:", notifError);
    }

    await sendVerificationEmail(email, verificationCode);

    res.status(201).json({
      status: "success",
      message: "Inscription réussie. Veuillez vérifier votre email.",
      requiresVerification: true,
      email: email
    });

  } catch (error) {
    console.error("REGISTER ESTABLISHMENT ERROR:", error);
    res.status(500).json({ message: "Erreur lors de l'inscription de l'établissement" });
  }
};

//----------------------------- Connexion (Login) -----------------------------//
/**
 * Connecte un utilisateur existant.
 * Vérifie l'email, le mot de passe et le statut de vérification.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        workerProfile: {
          select: {
            first_name: true,
            last_name: true,
            profile_pic_url: true,
            verification_status: true
          }
        },
        establishmentProfile: {
          select: {
            name: true,
            logo_url: true,
            verification_status: true
          }
        }
      }
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // Check Verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: "Email non vérifié. Veuillez valider votre compte.",
        requiresVerification: true,
        email: user.email
      });
    }

    const token = generateToken(user, res);

    // Build response data with profile info
    const userData = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    // Add profile-specific fields
    if (user.role === 'WORKER' && user.workerProfile) {
      userData.first_name = user.workerProfile.first_name;
      userData.last_name = user.workerProfile.last_name;
      userData.profile_image = user.workerProfile.profile_pic_url;
      userData.verification_status = user.workerProfile.verification_status;
    }
    if (user.role === 'ESTABLISHMENT' && user.establishmentProfile) {
      userData.name = user.establishmentProfile.name;
      userData.logo = user.establishmentProfile.logo_url;
      userData.verification_status = user.establishmentProfile.verification_status;
    }

    res.status(200).json({
      status: "success",
      data: userData,
      token,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

//----------------------------- Vérification Email -----------------------------//
/**
 * Vérifie l'adresse email d'un utilisateur via le code OTP.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ message: "Compte déjà vérifié" });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ message: "Code invalide" });
    }

    if (new Date() > user.verificationCodeExpiresAt) {
      return res.status(400).json({ message: "Code expiré" });
    }

    // Activate User
    const updatedUser = await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        isEmailVerified: true,
        verificationCode: null,
        verificationCodeExpiresAt: null
      }
    });

    // Auto-login after verification? Yes, usually.
    const token = generateToken(updatedUser, res);

    res.status(200).json({
      status: "success",
      message: "Email vérifié avec succès !",
      token,
      data: {
        user_id: updatedUser.user_id,
        email: updatedUser.email,
        role: updatedUser.role,
        status: updatedUser.status
      }
    });

  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Verification failed" });
  }
};

//----------------------------- Renvoyer OTP -----------------------------//
/**
 * Renvoie un nouveau code OTP de vérification.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const resendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (user.isEmailVerified) return res.status(400).json({ message: "Compte déjà vérifié" });

    const verificationCode = generateOTP();
    const verificationCodeExpiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: { verificationCode, verificationCodeExpiresAt }
    });

    await sendVerificationEmail(email, verificationCode);

    res.status(200).json({ message: "Nouveau code envoyé" });

  } catch (error) {
    console.error("RESEND OTP ERROR:", error);
    res.status(500).json({ message: "Failed to resend code" });
  }
};


//----------------------------- Mot de Passe Oublié -----------------------------//
/**
 * Initie la procédure de réinitialisation de mot de passe.
 * Envoie un lien par email.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Security: Don't reveal user existence
      return res.status(200).json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetPasswordTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiresAt
      }
    });

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ message: "Si un compte existe avec cet email, un lien de réinitialisation a été envoyé." });

  } catch (error) {
    console.error("FORGOT PASS ERROR:", error);
    res.status(500).json({ message: "Request failed" });
  }
};

//----------------------------- Réinitialiser Mot de Passe -----------------------------//
/**
 * Réinitialise le mot de passe avec le token fourni.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by token and check expiry
    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordTokenExpiresAt: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: "Lien invalide ou expiré" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user
    await prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null
      }
    });

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès ! Vous pouvez maintenant vous connecter." });

  } catch (error) {
    console.error("RESET PASS ERROR:", error);
    res.status(500).json({ message: "Reset failed" });
  }
};

//----------------------------- Changer Mot de Passe (Authentifié) -----------------------------//
/**
 * Permet à un utilisateur connecté de changer son mot de passe.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.user_id;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Veuillez fournir le mot de passe actuel et le nouveau mot de passe." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { user_id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Mot de passe actuel incorrect." });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword }
    });

    res.status(200).json({
      status: "success",
      message: "Mot de passe modifié avec succès !"
    });

  } catch (error) {
    console.error("CHANGE PASS ERROR:", error);
    res.status(500).json({ message: "Erreur lors du changement de mot de passe." });
  }
};


//----------------------------- Déconnexion (Logout) -----------------------------//
/**
 * Déconnecte l'utilisateur en effaçant le cookie JWT.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const logout = async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

//----------------------------- Récupérer Utilisateur Courant (Me) -----------------------------//
/**
 * Récupère les informations de l'utilisateur actuellement connecté.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getMe = async (req, res) => {
  try {
    const userId = req.user.user_id;
    const role = req.user.role;

    // Fetch full user data with profile based on role
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        email: true,
        role: true,
        status: true,
        // isEmailVerified: true, 
        workerProfile: role === 'WORKER' ? {
          select: {
            first_name: true,
            last_name: true,
            title: true,
            profile_pic_url: true,
            verification_status: true
          }
        } : false,
        establishmentProfile: role === 'ESTABLISHMENT' ? {
          select: {
            name: true,
            logo_url: true,
            verification_status: true,
            contact_first_name: true,
            contact_last_name: true
          }
        } : false
      }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Flatten data structure (similar to login response)
    const userData = {
      user_id: user.user_id,
      email: user.email,
      role: user.role,
      status: user.status,
    };

    if (user.role === 'WORKER' && user.workerProfile) {
      userData.first_name = user.workerProfile.first_name;
      userData.last_name = user.workerProfile.last_name;
      userData.profile_image = user.workerProfile.profile_pic_url;
      userData.title = user.workerProfile.title;
      userData.verification_status = user.workerProfile.verification_status;
    }

    if (user.role === 'ESTABLISHMENT' && user.establishmentProfile) {
      userData.name = user.establishmentProfile.name;
      userData.logo = user.establishmentProfile.logo_url;
      userData.contact_first_name = user.establishmentProfile.contact_first_name;
      userData.contact_last_name = user.establishmentProfile.contact_last_name;
      userData.verification_status = user.establishmentProfile.verification_status;
    }

    res.status(200).json({
      status: "success",
      data: userData,
    });
  } catch (error) {
    console.error("GET ME ERROR:", error);
    res.status(500).json({
      message: "Failed to fetch user data",
    });
  }
};

//----------------------------- Supprimer Compte -----------------------------//
/**
 * Supprime le compte de l'utilisateur connecté et toutes ses données associées.
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const user = await prisma.user.findUnique({ where: { user_id: userId } });

    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    await prisma.$transaction(async (tx) => {
      // Manual cleanup for non-cascading relations
      await tx.payment.deleteMany({ where: { user_id: userId } });
      
      await tx.dispute.deleteMany({ 
        where: { 
          OR: [
            { reporter_id: userId },
            { target_id: userId }
          ] 
        } 
      });

      await tx.adminMessage.deleteMany({
        where: {
            OR: [
                { sender_id: userId },
                { receiver_id: userId }
            ]
        }
      });
      
      // Delete the user (cascades to profile, messages, logs, etc.)
      await tx.user.delete({
        where: { user_id: userId }
      });
    });

    res.status(200).json({
      status: "success",
      message: "Compte supprimé avec succès"
    });

  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    res.status(500).json({ message: "Erreur lors de la suppression du compte", error: error.message });
  }
};
