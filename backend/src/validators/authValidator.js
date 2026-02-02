import { z } from 'zod';

export const registerWorkerSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères").regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule").regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    first_name: z.string().min(2, "Le prénom est trop court"),
    last_name: z.string().min(2, "Le nom est trop court"),
    phone: z.string().min(10, "Numéro de téléphone invalide").optional(),
    city_id: z.any().optional(), // Accept string or number, parsed in controller
    address: z.string().optional(),
    cnie: z.string().optional(),
    birth_place: z.string().optional(),
    region: z.string().optional(),
    linkedin_url: z.string().optional().or(z.literal(''))
});

export const registerEstablishmentSchema = z.object({
    email: z.string().email("Format d'email invalide"),
    password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    name: z.string().min(2, "Le nom de l'établissement est requis"),
    contact_first_name: z.string().min(2, "Le prénom du contact est requis"),
    contact_last_name: z.string().min(2, "Le nom du contact est requis"),
    phone: z.string().min(10, "Numéro de téléphone invalide"),
    ice_number: z.string().min(1, "Le numéro ICE est requis")
});

export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string()
});

export const resetPasswordSchema = z.object({
    token: z.string(),
    newPassword: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères")
});

export const validate = (schema) => (req, res, next) => {
    try {
        schema.parse(req.body);
        next();
    } catch (error) {
        return res.status(400).json({
            status: 'fail',
            message: error.errors[0]?.message || 'Validation error',
            errors: error.errors
        });
    }
};
