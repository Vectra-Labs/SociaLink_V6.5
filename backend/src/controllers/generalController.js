import { prisma } from "../config/db.js";

export const getCities = async (req, res) => {
    try {
        const cities = await prisma.city.findMany({
            orderBy: { name: 'asc' },
            select: {
                city_id: true,
                name: true,
                region: {
                    select: { name: true }
                }
            }
        });

        res.status(200).json({
            data: cities,
        });
    } catch (error) {
        console.error("GET CITIES ERROR:", error);
        res.status(500).json({
            message: "Failed to fetch cities",
        });
    }
};
