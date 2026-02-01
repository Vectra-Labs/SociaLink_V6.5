import { z } from "zod";

export const updateWorkerProfileSchema = z.object({
    first_name: z.string().trim().min(1).optional().or(z.literal('')),
    last_name: z.string().trim().min(1).optional().or(z.literal('')),
    phone: z.string().trim().optional().or(z.literal('')),
    address: z.string().trim().optional().or(z.literal('')),
    city_id: z.preprocess(
        (val) => val === '' || val === null || val === undefined ? undefined : Number(val),
        z.number().int().positive().optional()
    ),
    bio: z.string().trim().max(500).optional().or(z.literal('')),
    profile_pic_url: z.string().url().optional().or(z.literal('')),
}).passthrough();

export const addWorkerSpecialitiesSchema = z.object({
    speciality_ids: z
        .array(
            z.number().int().positive("Speciality ID must be a positive integer")
        )
        .min(1, "At least one speciality must be selected"),
});
