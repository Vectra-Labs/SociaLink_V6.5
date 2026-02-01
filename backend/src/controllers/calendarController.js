import { prisma } from "../config/db.js";

// Jours fériés marocains (dates fixes + estimation fêtes religieuses)
const MOROCCAN_HOLIDAYS = {
    2025: [
        { date: '2025-01-01', name: "Jour de l'An", type: 'national' },
        { date: '2025-01-11', name: "Manifeste de l'Indépendance", type: 'national' },
        { date: '2025-03-30', name: "Aïd al-Fitr (estimé)", type: 'religious' },
        { date: '2025-03-31', name: "Aïd al-Fitr (2ème jour)", type: 'religious' },
        { date: '2025-05-01', name: "Fête du Travail", type: 'national' },
        { date: '2025-06-06', name: "Aïd al-Adha (estimé)", type: 'religious' },
        { date: '2025-06-07', name: "Aïd al-Adha (2ème jour)", type: 'religious' },
        { date: '2025-06-27', name: "Nouvel An Hégirien (estimé)", type: 'religious' },
        { date: '2025-07-30', name: "Fête du Trône", type: 'national' },
        { date: '2025-08-14', name: "Journée Oued Eddahab", type: 'national' },
        { date: '2025-08-20', name: "Révolution du Roi et du Peuple", type: 'national' },
        { date: '2025-08-21', name: "Fête de la Jeunesse", type: 'national' },
        { date: '2025-09-05', name: "Mawlid (Anniversaire du Prophète)", type: 'religious' },
        { date: '2025-11-06', name: "Anniversaire de la Marche Verte", type: 'national' },
        { date: '2025-11-18', name: "Fête de l'Indépendance", type: 'national' },
    ],
    2026: [
        { date: '2026-01-01', name: "Jour de l'An", type: 'national' },
        { date: '2026-01-11', name: "Manifeste de l'Indépendance", type: 'national' },
        { date: '2026-03-20', name: "Aïd al-Fitr (estimé)", type: 'religious' },
        { date: '2026-03-21', name: "Aïd al-Fitr (2ème jour)", type: 'religious' },
        { date: '2026-05-01', name: "Fête du Travail", type: 'national' },
        { date: '2026-05-27', name: "Aïd al-Adha (estimé)", type: 'religious' },
        { date: '2026-05-28', name: "Aïd al-Adha (2ème jour)", type: 'religious' },
        { date: '2026-06-17', name: "Nouvel An Hégirien (estimé)", type: 'religious' },
        { date: '2026-07-30', name: "Fête du Trône", type: 'national' },
        { date: '2026-08-14', name: "Journée Oued Eddahab", type: 'national' },
        { date: '2026-08-20', name: "Révolution du Roi et du Peuple", type: 'national' },
        { date: '2026-08-21', name: "Fête de la Jeunesse", type: 'national' },
        { date: '2026-08-25', name: "Mawlid (Anniversaire du Prophète)", type: 'religious' },
        { date: '2026-11-06', name: "Anniversaire de la Marche Verte", type: 'national' },
        { date: '2026-11-18', name: "Fête de l'Indépendance", type: 'national' },
    ]
};

// GET /api/worker/calendar - Liste des événements du calendrier
export const getCalendarEvents = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const { month, year } = req.query;

        // Parse dates
        const targetYear = parseInt(year) || new Date().getFullYear();
        const targetMonth = parseInt(month) || new Date().getMonth() + 1;

        const startDate = new Date(targetYear, targetMonth - 1, 1);
        const endDate = new Date(targetYear, targetMonth, 0, 23, 59, 59);

        // Calculate visible grid range (approx 6 weeks view)
        // Start: -7 days to cover previous month days in the grid
        // End: +14 days to cover next month days in the grid
        const queryStart = new Date(startDate);
        queryStart.setDate(startDate.getDate() - 7);

        const queryEnd = new Date(endDate);
        queryEnd.setDate(endDate.getDate() + 14);

        // Fetch events from DB using Overlap Logic
        // Event must start before the view ends AND end after the view starts
        const events = await prisma.calendarEvent.findMany({
            where: {
                worker_id: workerId,
                AND: [
                    { start_date: { lte: queryEnd } },
                    { end_date: { gte: queryStart } }
                ]
            },
            orderBy: { start_date: 'asc' }
        });

        // Get holidays for this year
        const holidays = MOROCCAN_HOLIDAYS[targetYear] || [];

        res.json({
            status: 'success',
            data: {
                events,
                holidays,
                month: targetMonth,
                year: targetYear
            }
        });
    } catch (error) {
        console.error('GET CALENDAR ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération du calendrier' });
    }
};

// POST /api/worker/calendar - Créer un événement
export const createCalendarEvent = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const { title, description, start_date, end_date, type, is_all_day } = req.body;

        if (!start_date || !end_date) {
            return res.status(400).json({ message: 'Les dates de début et fin sont requises' });
        }

        const startDateObj = new Date(start_date);
        const endDateObj = new Date(end_date);

        // Vérifier et supprimer les événements conflictuels
        // Un conflit existe si les plages de dates se chevauchent
        const conflictingEvents = await prisma.calendarEvent.findMany({
            where: {
                worker_id: workerId,
                OR: [
                    // Cas 1: Le nouvel événement commence pendant un événement existant
                    {
                        start_date: { lte: startDateObj },
                        end_date: { gte: startDateObj }
                    },
                    // Cas 2: Le nouvel événement finit pendant un événement existant
                    {
                        start_date: { lte: endDateObj },
                        end_date: { gte: endDateObj }
                    },
                    // Cas 3: Le nouvel événement englobe un événement existant
                    {
                        start_date: { gte: startDateObj },
                        end_date: { lte: endDateObj }
                    }
                ]
            }
        });

        // Supprimer les événements conflictuels
        if (conflictingEvents.length > 0) {
            await prisma.calendarEvent.deleteMany({
                where: {
                    event_id: { in: conflictingEvents.map(e => e.event_id) }
                }
            });
        }

        const event = await prisma.calendarEvent.create({
            data: {
                worker_id: workerId,
                title: title || null,
                description: description || null,
                start_date: startDateObj,
                end_date: endDateObj,
                type: type || 'AVAILABLE',
                is_all_day: is_all_day || false
            }
        });

        res.status(201).json({
            status: 'success',
            data: event,
            message: conflictingEvents.length > 0
                ? `Événement créé (${conflictingEvents.length} événement(s) conflictuel(s) remplacé(s))`
                : 'Événement créé avec succès',
            replacedCount: conflictingEvents.length
        });
    } catch (error) {
        console.error('CREATE CALENDAR EVENT ERROR:', error);
        res.status(500).json({ message: "Erreur lors de la création de l'événement" });
    }
};

// PUT /api/worker/calendar/:id - Modifier un événement
export const updateCalendarEvent = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const eventId = parseInt(req.params.id);
        const { title, description, start_date, end_date, type, is_all_day } = req.body;

        // Check ownership
        const existing = await prisma.calendarEvent.findUnique({
            where: { event_id: eventId }
        });

        if (!existing || existing.worker_id !== workerId) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        const event = await prisma.calendarEvent.update({
            where: { event_id: eventId },
            data: {
                title: title !== undefined ? title : existing.title,
                description: description !== undefined ? description : existing.description,
                start_date: start_date ? new Date(start_date) : existing.start_date,
                end_date: end_date ? new Date(end_date) : existing.end_date,
                type: type || existing.type,
                is_all_day: is_all_day !== undefined ? is_all_day : existing.is_all_day
            }
        });

        res.json({
            status: 'success',
            data: event,
            message: 'Événement modifié avec succès'
        });
    } catch (error) {
        console.error('UPDATE CALENDAR EVENT ERROR:', error);
        res.status(500).json({ message: "Erreur lors de la modification de l'événement" });
    }
};

// DELETE /api/worker/calendar/:id - Supprimer un événement
export const deleteCalendarEvent = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const eventId = parseInt(req.params.id);

        // Check ownership
        const existing = await prisma.calendarEvent.findUnique({
            where: { event_id: eventId }
        });

        if (!existing || existing.worker_id !== workerId) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        await prisma.calendarEvent.delete({
            where: { event_id: eventId }
        });

        res.json({
            status: 'success',
            message: 'Événement supprimé avec succès'
        });
    } catch (error) {
        console.error('DELETE CALENDAR EVENT ERROR:', error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'événement" });
    }
};

// GET /api/worker/calendar/holidays/:year - Jours fériés marocains
export const getHolidays = async (req, res) => {
    try {
        const year = parseInt(req.params.year) || new Date().getFullYear();
        const holidays = MOROCCAN_HOLIDAYS[year] || MOROCCAN_HOLIDAYS[2025];

        res.json({
            status: 'success',
            data: holidays,
            year
        });
    } catch (error) {
        console.error('GET HOLIDAYS ERROR:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des jours fériés' });
    }
};

// POST /api/worker/calendar/toggle-availability
export const toggleAvailability = async (req, res) => {
    try {
        const workerId = req.user.user_id;
        const now = new Date();

        // 1. Check if currently available (has future AVAILABLE event)
        const availableEvents = await prisma.calendarEvent.findMany({
            where: {
                worker_id: workerId,
                type: 'AVAILABLE',
                end_date: { gte: now }
            }
        });

        const isAvailable = availableEvents.length > 0;

        if (isAvailable) {
            // Logic: Set to UNAVAILABLE -> Delete all future/current availability slots
            await prisma.calendarEvent.deleteMany({
                where: {
                    worker_id: workerId,
                    type: 'AVAILABLE',
                    end_date: { gte: now }
                }
            });

            return res.json({
                status: 'success',
                data: { isAvailable: false },
                message: 'Statut mis à jour : INDISPONIBLE'
            });

        } else {
            // Logic: Set to AVAILABLE -> Create a 30-day slot
            const thirtyDaysLater = new Date();
            thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

            await prisma.calendarEvent.create({
                data: {
                    worker_id: workerId,
                    title: "Disponibilité immédiate",
                    start_date: now,
                    end_date: thirtyDaysLater,
                    type: 'AVAILABLE',
                    is_all_day: true
                }
            });

            return res.json({
                status: 'success',
                data: { isAvailable: true },
                message: 'Statut mis à jour : DISPONIBLE (30 jours)'
            });
        }

    } catch (error) {
        console.error('TOGGLE AVAILABILITY ERROR:', error);
        res.status(500).json({ message: "Erreur lors du changement de statut" });
    }
};
