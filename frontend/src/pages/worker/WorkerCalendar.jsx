import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import api from '../../api/client';
import {
    ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
    Clock, X, Check, AlertTriangle, Loader2, Trash2,
    Copy, Clipboard, Home
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

// Jours de la semaine
const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
const MONTHS = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

// Couleurs par type d'événement - Blue Palette compliant
const EVENT_STYLES = {
    AVAILABLE: 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200',
    BUSY: 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200',
    BLOCKED: 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100',
    HOLIDAY: 'bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100'
};

const EVENT_LABELS = {
    AVAILABLE: 'Disponible',
    BUSY: 'Occupé',
    BLOCKED: 'Indisponible'
};

export default function WorkerCalendar() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState([]);
    const [holidays, setHolidays] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [newEvent, setNewEvent] = useState({
        type: 'AVAILABLE',
        start_date: '',
        end_date: '',
        title: '',
        is_all_day: true
    });
    const [saving, setSaving] = useState(false);

    // Multi-selection state
    const [selectedDates, setSelectedDates] = useState([]);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStart, setSelectionStart] = useState(null);

    // Clipboard state
    const [clipboard, setClipboard] = useState(null);

    // Context menu
    const [contextMenu, setContextMenu] = useState({ show: false, x: 0, y: 0, date: null });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    useEffect(() => {
        fetchCalendarData();
    }, [year, month]);

    // Close context menu on click outside
    useEffect(() => {
        const handleClick = () => setContextMenu({ show: false, x: 0, y: 0, date: null });
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/worker/calendar?year=${year}&month=${month + 1}`);
            setEvents(response.data.data?.events || []);
            setHolidays(response.data.data?.holidays || []);
        } catch (err) {
            console.error('Erreur chargement calendrier:', err);
        } finally {
            setLoading(false);
        }
    };

    // Navigation
    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        clearSelection();
    };

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        clearSelection();
    };

    const goToToday = () => {
        setCurrentDate(new Date());
        clearSelection();
    };

    // Clear all selections
    const clearSelection = () => {
        setSelectedDates([]);
        setIsSelecting(false);
        setSelectionStart(null);
    };

    // Génération des jours du mois
    const generateCalendarDays = () => {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startOffset = (firstDay.getDay() + 6) % 7;
        const days = [];

        for (let i = startOffset - 1; i >= 0; i--) {
            const date = new Date(year, month, -i);
            days.push({ date, isCurrentMonth: false });
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            const date = new Date(year, month, i);
            days.push({ date, isCurrentMonth: true });
        }

        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            const date = new Date(year, month + 1, i);
            days.push({ date, isCurrentMonth: false });
        }

        return days;
    };

    const getEventsForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return events.filter(e => {
            const start = new Date(e.start_date).toISOString().split('T')[0];
            const end = new Date(e.end_date).toISOString().split('T')[0];
            return dateStr >= start && dateStr <= end;
        });
    };

    const getHolidayForDate = (date) => {
        const dateStr = date.toISOString().split('T')[0];
        return holidays.find(h => h.date === dateStr);
    };

    const isToday = (date) => {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    };

    const isDateSelected = (date) => {
        return selectedDates.some(d => d.toDateString() === date.toDateString());
    };

    // Handle mouse down for selection start
    const handleMouseDown = (date, e) => {
        if (e.button !== 0) return; // Only left click
        const isPast = date < new Date().setHours(0, 0, 0, 0);
        if (isPast) return;

        e.preventDefault();
        setIsSelecting(true);
        setSelectionStart(date);

        if (e.shiftKey && selectedDates.length > 0) {
            // Extend selection with Shift
            const lastSelected = selectedDates[selectedDates.length - 1];
            const range = getDateRange(lastSelected, date);
            setSelectedDates(range.filter(d => d >= new Date().setHours(0, 0, 0, 0)));
        } else if (e.ctrlKey || e.metaKey) {
            // Toggle single date with Ctrl/Cmd
            if (isDateSelected(date)) {
                setSelectedDates(selectedDates.filter(d => d.toDateString() !== date.toDateString()));
            } else {
                setSelectedDates([...selectedDates, date]);
            }
        } else {
            setSelectedDates([date]);
        }
    };

    // Handle mouse enter during selection
    const handleMouseEnter = (date) => {
        if (!isSelecting || !selectionStart) return;
        const isPast = date < new Date().setHours(0, 0, 0, 0);
        if (isPast) return;

        const range = getDateRange(selectionStart, date);
        setSelectedDates(range.filter(d => d >= new Date().setHours(0, 0, 0, 0)));
    };

    // Handle mouse up to end selection
    const handleMouseUp = () => {
        setIsSelecting(false);
    };

    useEffect(() => {
        document.addEventListener('mouseup', handleMouseUp);
        return () => document.removeEventListener('mouseup', handleMouseUp);
    }, []);

    // Get date range between two dates
    const getDateRange = (start, end) => {
        const dates = [];
        const startDate = new Date(Math.min(start, end));
        const endDate = new Date(Math.max(start, end));

        const current = new Date(startDate);
        while (current <= endDate) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    // Context menu handler
    const handleContextMenu = (date, e) => {
        e.preventDefault();
        const isPast = date < new Date().setHours(0, 0, 0, 0);
        if (isPast) return;

        setContextMenu({
            show: true,
            x: e.clientX,
            y: e.clientY,
            date
        });
    };

    // Open modal for adding event to selected dates
    const openAddModal = (date = null) => {
        const targetDates = date ? [date] : selectedDates;
        if (targetDates.length === 0) return;

        const startDate = new Date(Math.min(...targetDates));
        const endDate = new Date(Math.max(...targetDates));

        setSelectedDate(startDate);
        setNewEvent({
            type: 'AVAILABLE',
            start_date: startDate.toISOString().split('T')[0],
            end_date: endDate.toISOString().split('T')[0],
            title: '',
            is_all_day: true
        });
        setShowModal(true);
    };

    // Create event
    const handleCreateEvent = async () => {
        try {
            setSaving(true);
            await api.post('/worker/calendar', {
                ...newEvent,
                start_date: newEvent.start_date + 'T00:00:00',
                end_date: newEvent.end_date + 'T23:59:59'
            });
            setShowModal(false);
            clearSelection();
            fetchCalendarData();
        } catch (err) {
            console.error('Erreur création événement:', err);
        } finally {
            setSaving(false);
        }
    };

    // Delete event
    const handleDeleteEvent = async (eventId, e) => {
        if (e) e.stopPropagation();
        if (!confirm('Supprimer cet événement ?')) return;
        try {
            await api.delete(`/worker/calendar/${eventId}`);
            fetchCalendarData();
        } catch (err) {
            console.error('Erreur suppression:', err);
        }
    };

    // Delete all events for selected dates
    const handleDeleteSelectedEvents = async () => {
        if (selectedDates.length === 0) return;
        if (!confirm(`Supprimer tous les événements des ${selectedDates.length} jour(s) sélectionné(s) ?`)) return;

        try {
            const eventsToDelete = [];
            selectedDates.forEach(date => {
                const dateEvents = getEventsForDate(date);
                dateEvents.forEach(e => {
                    if (!eventsToDelete.includes(e.event_id)) {
                        eventsToDelete.push(e.event_id);
                    }
                });
            });

            await Promise.all(eventsToDelete.map(id => api.delete(`/worker/calendar/${id}`)));
            clearSelection();
            fetchCalendarData();
        } catch (err) {
            console.error('Erreur suppression multiple:', err);
        }
    };

    // Copy events from selected dates
    const handleCopyEvents = () => {
        if (selectedDates.length === 0) return;

        const eventsToCopy = [];
        selectedDates.forEach(date => {
            const dateEvents = getEventsForDate(date);
            dateEvents.forEach(e => {
                if (!eventsToCopy.find(x => x.event_id === e.event_id)) {
                    eventsToCopy.push({
                        type: e.type,
                        title: e.title
                    });
                }
            });
        });

        if (eventsToCopy.length === 0) {
            // Copy the date range configuration
            setClipboard({
                type: 'dateRange',
                count: selectedDates.length
            });
        } else {
            setClipboard({
                type: 'events',
                events: eventsToCopy
            });
        }
    };

    // Paste events to selected dates
    const handlePasteEvents = async () => {
        if (!clipboard || selectedDates.length === 0) return;

        try {
            setSaving(true);
            const startDate = new Date(Math.min(...selectedDates));
            const endDate = new Date(Math.max(...selectedDates));

            if (clipboard.type === 'events') {
                for (const event of clipboard.events) {
                    await api.post('/worker/calendar', {
                        type: event.type,
                        title: event.title,
                        start_date: startDate.toISOString(),
                        end_date: endDate.toISOString(),
                        is_all_day: true
                    });
                }
            }

            clearSelection();
            fetchCalendarData();
        } catch (err) {
            console.error('Erreur collage:', err);
        } finally {
            setSaving(false);
        }
    };

    // Quick set availability for selection
    const handleQuickSet = async (type) => {
        if (selectedDates.length === 0) return;

        try {
            setSaving(true);
            const startDate = new Date(Math.min(...selectedDates));
            const endDate = new Date(Math.max(...selectedDates));

            await api.post('/worker/calendar', {
                type,
                start_date: startDate.toISOString(),
                end_date: endDate.toISOString(),
                is_all_day: true
            });

            clearSelection();
            fetchCalendarData();
        } catch (err) {
            console.error('Erreur:', err);
        } finally {
            setSaving(false);
        }
    };

    const calendarDays = generateCalendarDays();

    return (
        <div className="max-w-6xl mx-auto select-none space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Calendrier</h1>
                    <p className="text-slate-500">Gérez vos disponibilités et rendez-vous</p>
                </div>
                <Link to="/worker/dashboard">
                    <Button variant="secondary" icon={Home}>Retour</Button>
                </Link>
            </div>

            {/* Toolbar */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        {/* Navigation */}
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={prevMonth} icon={ChevronLeft} />
                            <h2 className="text-xl font-bold text-slate-900 min-w-[180px] text-center">
                                {MONTHS[month]} {year}
                            </h2>
                            <Button variant="ghost" size="sm" onClick={nextMonth} icon={ChevronRight} />
                            <Button variant="secondary" size="sm" onClick={goToToday} className="text-blue-600">Aujourd'hui</Button>
                        </div>

                        {/* Actions for selection */}
                        {selectedDates.length > 0 && (
                            <div className="flex items-center gap-2 bg-blue-50/50 px-3 py-2 rounded-xl border border-blue-100 animate-in fade-in duration-300">
                                <span className="text-sm text-blue-700 font-bold px-2">
                                    {selectedDates.length} jour{selectedDates.length > 1 ? 's' : ''}
                                </span>
                                <div className="h-5 w-px bg-blue-200 mx-1" />

                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100" onClick={() => openAddModal()} title="Ajouter">
                                    <Plus className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-500 hover:bg-red-50" onClick={handleDeleteSelectedEvents} title="Supprimer">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-100" onClick={handleCopyEvents} title="Copier">
                                    <Copy className="w-4 h-4" />
                                </Button>
                                {clipboard && (
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-100" onClick={handlePasteEvents} title="Coller">
                                        <Clipboard className="w-4 h-4" />
                                    </Button>
                                )}

                                <div className="h-5 w-px bg-blue-200 mx-1" />

                                <div className="flex gap-1">
                                    <button onClick={() => handleQuickSet('AVAILABLE')} className="w-6 h-6 rounded-full bg-indigo-500 text-white flex items-center justify-center hover:scale-110 transition-transform" title="Dispo">
                                        <Check className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleQuickSet('BUSY')} className="w-6 h-6 rounded-full bg-slate-500 text-white flex items-center justify-center hover:scale-110 transition-transform" title="Occupé">
                                        <Clock className="w-3.5 h-3.5" />
                                    </button>
                                    <button onClick={() => handleQuickSet('BLOCKED')} className="w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform" title="Bloqué">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-slate-600 ml-1" onClick={clearSelection}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>
                        )}

                        {/* Legend */}
                        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Disponible
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Occupé
                            </span>
                            <span className="flex items-center gap-1.5">
                                <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> Indisponible
                            </span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Calendar Grid */}
            <Card className="overflow-hidden border-slate-200 shadow-sm">
                {/* Days header */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50/50">
                    {DAYS.map(day => (
                        <div key={day} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days grid */}
                {loading ? (
                    <div className="p-24 text-center">
                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-3" />
                        <p className="text-slate-500 font-medium">Chargement du planning...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-7 bg-slate-100 gap-px border-b border-slate-200">
                        {calendarDays.map((day, index) => {
                            const dateEvents = getEventsForDate(day.date);
                            const holiday = getHolidayForDate(day.date);
                            const isPast = day.date < new Date().setHours(0, 0, 0, 0);
                            const isSelected = isDateSelected(day.date);
                            const today = isToday(day.date);

                            return (
                                <div
                                    key={index}
                                    className={`min-h-[90px] bg-white p-2 relative group transition-all duration-200
                                        ${!day.isCurrentMonth ? 'bg-slate-50/30 text-slate-400' : ''}
                                        ${today ? 'bg-blue-50/30' : ''}
                                        ${isSelected ? '!bg-blue-50 ring-2 ring-inset ring-blue-500 z-10' : ''}
                                        ${!isPast && day.isCurrentMonth ? 'hover:bg-slate-50 cursor-pointer' : ''}
                                    `}
                                    onMouseDown={(e) => day.isCurrentMonth && handleMouseDown(day.date, e)}
                                    onMouseEnter={() => day.isCurrentMonth && handleMouseEnter(day.date)}
                                    onContextMenu={(e) => day.isCurrentMonth && handleContextMenu(day.date, e)}
                                    onDoubleClick={() => !isPast && day.isCurrentMonth && openAddModal(day.date)}
                                >
                                    {/* Day Header */}
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${today ? 'bg-blue-600 text-white shadow-md' : 'text-slate-700'
                                            }`}>
                                            {day.date.getDate()}
                                        </span>
                                        {holiday && (
                                            <span className="text-[10px] bg-sky-100 text-sky-700 px-1.5 py-0.5 rounded font-medium truncate max-w-[80px]" title={holiday.name}>
                                                Férié
                                            </span>
                                        )}
                                    </div>

                                    {/* Events List */}
                                    <div className="space-y-1 relative z-10">
                                        {dateEvents.slice(0, 3).map((event, i) => (
                                            <div
                                                key={i}
                                                className={`text-[10px] px-1.5 py-0.5 rounded border font-medium truncate flex items-center justify-between group/event transition-all ${EVENT_STYLES[event.type]}`}
                                                title={`${EVENT_LABELS[event.type]}${event.title ? ': ' + event.title : ''}`}
                                            >
                                                <span className="truncate">{event.title || EVENT_LABELS[event.type]}</span>
                                                <button
                                                    onClick={(e) => handleDeleteEvent(event.event_id, e)}
                                                    className="ml-1 opacity-0 group-hover/event:opacity-100 hover:bg-black/10 rounded p-0.5 transition-opacity"
                                                >
                                                    <X className="w-2.5 h-2.5" />
                                                </button>
                                            </div>
                                        ))}
                                        {dateEvents.length > 3 && (
                                            <div className="text-[10px] text-slate-400 font-medium pl-1">
                                                +{dateEvents.length - 3} autres
                                            </div>
                                        )}
                                    </div>

                                    {/* Add Button Hint - Now Clickable */}
                                    {!isPast && day.isCurrentMonth && (
                                        <div
                                            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 z-0 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openAddModal(day.date);
                                            }}
                                        >
                                            <div className="bg-blue-600/90 text-white rounded-full p-2 shadow-lg transform scale-90 hover:scale-100 transition-all hover:bg-blue-700">
                                                <Plus className="w-5 h-5" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>

            {/* Context Menu */}
            {contextMenu.show && (
                <div
                    className="fixed z-50 bg-white rounded-xl shadow-2xl border border-slate-100 py-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-200"
                    style={{ left: contextMenu.x, top: contextMenu.y }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50 mb-1">
                        Actions
                    </div>
                    <button
                        onClick={() => { openAddModal(contextMenu.date); setContextMenu({ show: false, x: 0, y: 0, date: null }); }}
                        className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-medium"
                    >
                        <Plus className="w-4 h-4 text-blue-500" /> Ajouter un événement
                    </button>
                    {getEventsForDate(contextMenu.date).length > 0 && (
                        <button
                            onClick={() => handleCopyEvents()}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-medium"
                        >
                            <Copy className="w-4 h-4 text-indigo-500" /> Copier les événements
                        </button>
                    )}
                    {clipboard && (
                        <button
                            onClick={() => { handlePasteEvents(); setContextMenu({ show: false, x: 0, y: 0, date: null }); }}
                            className="w-full px-4 py-2.5 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-medium"
                        >
                            <Clipboard className="w-4 h-4 text-indigo-600" /> Coller
                        </button>
                    )}

                    <div className="h-px bg-slate-100 my-1" />
                    <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Statut Rapide
                    </div>

                    <button
                        onClick={() => { handleQuickSet('AVAILABLE'); setContextMenu({ show: false, x: 0, y: 0, date: null }); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-indigo-50 flex items-center gap-3 text-indigo-700 font-medium group"
                    >
                        <span className="w-2 h-2 rounded-full bg-indigo-500 group-hover:scale-125 transition-transform" /> Disponible
                    </button>
                    <button
                        onClick={() => { handleQuickSet('BUSY'); setContextMenu({ show: false, x: 0, y: 0, date: null }); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-3 text-slate-700 font-medium group"
                    >
                        <span className="w-2 h-2 rounded-full bg-slate-500 group-hover:scale-125 transition-transform" /> Occupé
                    </button>
                    <button
                        onClick={() => { handleQuickSet('BLOCKED'); setContextMenu({ show: false, x: 0, y: 0, date: null }); }}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-700 font-medium group"
                    >
                        <span className="w-2 h-2 rounded-full bg-red-500 group-hover:scale-125 transition-transform" /> Indisponible
                    </button>
                </div>
            )}

            {/* Create Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <Card className="w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 pb-4">
                            <CardTitle>Ajouter un événement</CardTitle>
                            <Button variant="ghost" size="sm" onClick={() => setShowModal(false)} icon={X} />
                        </CardHeader>

                        <CardContent className="p-6 space-y-5">
                            {/* Type */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">Type d'événement</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {Object.entries(EVENT_LABELS).map(([type, label]) => (
                                        <button
                                            key={type}
                                            onClick={() => setNewEvent({ ...newEvent, type })}
                                            className={`py-2 px-3 rounded-lg text-sm font-bold transition-all border-2 ${newEvent.type === type
                                                ? type === 'AVAILABLE' ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                                                    : type === 'BUSY' ? 'border-slate-500 bg-slate-50 text-slate-700'
                                                        : 'border-red-500 bg-red-50 text-red-700'
                                                : 'border-transparent bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Warning if existing events */}
                            {selectedDate && getEventsForDate(selectedDate).length > 0 && (
                                <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm">
                                        <p className="font-bold text-amber-800">
                                            Attention
                                        </p>
                                        <p className="text-amber-700 mt-0.5">
                                            {getEventsForDate(selectedDate).length} événement(s) seront remplacés par ce nouveau statut.
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Title */}
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">
                                    Titre <span className="text-slate-400 font-normal">(optionnel)</span>
                                </label>
                                <input
                                    type="text"
                                    value={newEvent.title}
                                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                    placeholder="Ex: Rendez-vous médical..."
                                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                />
                            </div>

                            {/* Dates */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date début</label>
                                    <input
                                        type="date"
                                        value={newEvent.start_date}
                                        onChange={(e) => setNewEvent({ ...newEvent, start_date: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Date fin</label>
                                    <input
                                        type="date"
                                        value={newEvent.end_date}
                                        onChange={(e) => setNewEvent({ ...newEvent, end_date: e.target.value })}
                                        className="w-full px-4 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4 border-t border-slate-100">
                                <Button
                                    variant="secondary"
                                    className="flex-1"
                                    onClick={() => setShowModal(false)}
                                >
                                    Annuler
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={handleCreateEvent}
                                    disabled={saving}
                                    isLoading={saving}
                                    icon={Check}
                                >
                                    Ajouter
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
