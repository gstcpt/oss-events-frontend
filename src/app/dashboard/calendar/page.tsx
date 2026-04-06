"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Event } from "@/types/events";
import { Item } from "@/types/items";
import { getAllEvents, deleteEvent, updateComplexEvent, getAvailableItems } from "@/lib/api/events";
import Calendar from "@/components/ui/calendar";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, Clock, MapPin, DollarSign, Edit, Trash2, X, Check, AlertCircle, LayoutList, Grip, Plus, ExternalLink } from "lucide-react";
import moment from "moment";
import Textarea from "@/components/ui/textarea";
import Link from "next/link";
import { useTranslations } from "next-intl";


const eventCategories = ["Wedding", "Marriage", "Party", "Work", "Opening", "Fun"];

export default function Items() {
    const t = useTranslations('Dashboard.events');
    const { user } = useAuth();
    const router = useRouter();
    const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list');
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Edit State
    const [availableItems, setAvailableItems] = useState<Item[]>([]);
    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [editStatus, setEditStatus] = useState<number>(1);
    const [editStartDate, setEditStartDate] = useState<string>("");
    const [editEndDate, setEditEndDate] = useState<string>("");
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editGuests, setEditGuests] = useState<number>(0);
    const [editDescription, setEditDescription] = useState("");
    const [editEventLines, setEditEventLines] = useState<Array<{
        id?: number;
        itemId: number;
        item?: Item;
        itemStartDate: string;
        itemEndDate: string;
        priceHt: number;
        tvaValue: number;
        discount: number;
    }>>([]);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                if (user?.role === "Client") {
                    const eventsData = await getAllEvents();
                    setEvents(eventsData);
                }
            } catch (error) { toast.error("Failed to fetch events."); }
        };
        if (user) { fetchEvents(); }
    }, [user]);

    // Fetches removed from here, moved to handleEdit for contextual data loading

    const handleEventClick = (clickInfo: any) => {
        setSelectedEvent(clickInfo.event.extendedProps);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    const handleEdit = async () => {
        if (selectedEvent) {
            setEditStatus(selectedEvent.status);
            setEditStartDate(selectedEvent.start_date ? selectedEvent.start_date.slice(0, 16) : "");
            setEditEndDate(selectedEvent.end_date ? selectedEvent.end_date.slice(0, 16) : "");
            setEditTitle(selectedEvent.title || "");
            setEditCategory(selectedEvent.category || "");
            setEditGuests(selectedEvent.guests || 0);
            setEditDescription(selectedEvent.description || "");
            if (selectedEvent.event_lines) {
                setEditEventLines(selectedEvent.event_lines.map(line => ({
                    id: line.id,
                    itemId: Number(line.item_id),
                    item: line.items,
                    itemStartDate: line.start_date ? line.start_date.slice(0, 16) : "",
                    itemEndDate: line.end_date ? line.end_date.slice(0, 16) : "",
                    priceHt: Number(line.price_ht),
                    tvaValue: Number(line.tva_value),
                    discount: Number(line.discount)
                })));
            }

            // Fetch available items for this event provider
            if (selectedEvent.company_id) {
                setIsLoadingItems(true);
                try {
                    const items = await getAvailableItems(Number(selectedEvent.company_id));
                    setAvailableItems(items);
                } catch (error) { toast.error("Failed to fetch items."); }
                setIsLoadingItems(false);
            }

            setIsModalOpen(false);
            setIsEditModalOpen(true);
        }
    };

    const handleSaveEdit = async () => {
        if (!selectedEvent || !user) return;
        // Validation logic
        if (!editStartDate || !editEndDate) { toast.error("Please fill in dates"); return; }
        if (new Date(editStartDate) >= new Date(editEndDate)) { toast.error("End date must be after start date"); return; }

        setIsSaving(true);
        try {
            await updateComplexEvent(
                selectedEvent.id,
                Number(selectedEvent.company_id),
                Number(selectedEvent.client_id),
                editStartDate,
                editEndDate,
                editTitle,
                editCategory,
                editGuests,
                editDescription,
                editEventLines.map(line => ({
                    id: line.id,
                    itemId: line.itemId,
                    itemStartDate: line.itemStartDate,
                    itemEndDate: line.itemEndDate,
                    priceHt: line.priceHt,
                    tvaValue: line.tvaValue,
                    discount: line.discount
                }))
            );
            toast.success("Event updated!");
            const eventsData = await getAllEvents();
            setEvents(eventsData);
            const updated = eventsData.find(e => e.id === selectedEvent.id);
            if (updated) setSelectedEvent(updated);
            setIsEditModalOpen(false);
            setIsModalOpen(true);
            setIsModalOpen(true);
        } catch (error: any) {
            toast.error(error instanceof Error ? error.message : "Update failed.");
        } finally { setIsSaving(false); }
    };

    const handleDelete = async () => {
        if (!selectedEvent) return;
        setIsDeleting(true);
        try {
            await deleteEvent(selectedEvent.id);
            toast.success("Event deleted");
            setEvents(events.filter(e => e.id !== selectedEvent.id));
            setIsDeleteModalOpen(false);
            setSelectedEvent(null);
        } catch (error) { toast.error("Delete failed"); } finally { setIsDeleting(false); }
    };

    const canModifyEvent = (event: Event | null): boolean => {
        if (!event || !user) return false;
        return Number(event.client_id) === Number(user.id);
    };

    let selectedEventDerivedStatus = t('pending');
    let selectedEventBadgeStyles = "bg-slate-100 text-slate-600 border-slate-200";
    if (selectedEvent && selectedEvent.event_lines && selectedEvent.event_lines.length > 0) {
        const statuses = selectedEvent.event_lines.map(line => (line as any).item_occupation?.[0]?.status || 0);
        const allConfirmed = statuses.every(s => Number(s) === 1);
        const allPending = statuses.every(s => Number(s) === 0);
        if (allConfirmed) {
            selectedEventDerivedStatus = t('confirmed');
            selectedEventBadgeStyles = "bg-green-100 text-green-700 border-green-200";
        } else if (!allPending) {
            selectedEventDerivedStatus = t('inProgress');
            selectedEventBadgeStyles = "bg-amber-100 text-amber-700 border-amber-200";
        }
    }

    return (
        <div className="container mx-auto p-4 md:p-8 space-y-8 animate-fade-in-up">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
                    <p className="text-slate-500">{t('subtitle')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                        <Button
                            variant={viewMode === 'calendar' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('calendar')}
                            title="Calendar View"
                        >
                            <CalendarIcon className="w-4 h-4" />
                        </Button>
                        <Button
                            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setViewMode('list')}
                            title="List View"
                        >
                            <LayoutList className="w-4 h-4" />
                        </Button>
                    </div>
                    <Button onClick={() => router.push('/createEvent')} className="bg-primary hover:bg-primary text-white shadow-lg shadow-orange-100">
                        <Plus className="w-4 h-4 mr-2" /> {t('addNewEvent')}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3">
                    {viewMode === 'list' ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {events.map((event) => {
                                const total = event.event_lines?.reduce((sum, line) => sum + Number(line.price_ttc), 0) || 0;

                                // Derived Status Logic
                                let derivedStatus = t('pending');
                                let badgeStyles = "bg-slate-100 text-slate-600 shrink-0 border-slate-200";

                                if (event.event_lines && event.event_lines.length > 0) {
                                    const statuses = event.event_lines.map(line => (line as any).item_occupation?.[0]?.status || 0);
                                    const allConfirmed = statuses.every(s => Number(s) === 1);
                                    const allPending = statuses.every(s => Number(s) === 0);

                                    if (allConfirmed) {
                                        derivedStatus = t('confirmed');
                                        badgeStyles = "bg-green-100 text-green-700 hover:bg-green-200 shrink-0 border-green-200";
                                    } else if (allPending) {
                                        derivedStatus = t('pending');
                                        badgeStyles = "bg-slate-100 text-slate-600 hover:bg-slate-200 shrink-0 border-slate-200";
                                    } else {
                                        derivedStatus = t('inProgress');
                                        badgeStyles = "bg-amber-100 text-amber-700 hover:bg-amber-200 shrink-0 border-amber-200";
                                    }
                                }
                                return (
                                    <Card key={event.id} onClick={() => handleEventClick({ event: { extendedProps: event } })} className="cursor-pointer hover:shadow-lg transition-all border-slate-100 group">
                                        <CardHeader className="pb-3">
                                            <div className="flex justify-between items-start">
                                                <div className="pr-2">
                                                    <Badge variant="outline" className="mb-2  tracking-wider text-[10px]">{event.category || 'Event'}</Badge>
                                                    <CardTitle className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-1">{event.title || `Event #${event.id}`}</CardTitle>
                                                </div>
                                                <Badge className={badgeStyles}>
                                                    {derivedStatus}
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="space-y-3 text-sm text-slate-600">
                                                <div className="flex items-center gap-2"><CalendarIcon className="w-4 h-4 text-slate-400 shrink-0" /> <span className="truncate">{moment(event.start_date).format('MMM D, YYYY')} - {moment(event.end_date).format('MMM D, YYYY')}</span></div>
                                                <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400 shrink-0" /> <span className="font-semibold text-slate-900">{total.toLocaleString()} TND</span></div>
                                                {event.description && <p className="line-clamp-2 text-xs text-slate-500 mt-2 h-8">{event.description}</p>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                            {events.length === 0 && <div className="col-span-full text-center py-12 text-slate-500 bg-white rounded-xl border border-slate-100">{t('noEventsFound')}</div>}
                        </div>
                    ) : (
                        <Card className="border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
                            <div className="p-6 bg-white min-h-[600px]">
                                {/* Calendar Component Wrapper */}
                                <style jsx global>{`
                                    .fc-toolbar-title { font-size: 1.25rem !important; font-weight: 700 !important; color: #1e293b; }
                                    .fc-button-primary { background-color: #f8fafc !important; color: #475569 !important; border-color: #e2e8f0 !important; }
                                    .fc-button-primary:hover { background-color: #f1f5f9 !important; border-color: #cbd5e1 !important; color: #334155 !important; }
                                    .fc-button-active { background-color: #ea580c !important; color: white !important; border-color: #ea580c !important; }
                                    .fc-daygrid-day-number { color: #64748b; font-weight: 500; }
                                    .fc-col-header-cell-cushion { color: #64748b; font-weight: 600; text-transform: ; font-size: 0.75rem; letter-spacing: 0.05em; padding-top: 1rem; padding-bottom: 1rem; }
                                    .fc-event { border-radius: 6px; border: none; padding: 2px 4px; font-size: 0.85rem; font-weight: 500; cursor: pointer; transition: transform 0.2s; }
                                    .fc-event:hover { transform: scale(1.02); }
                                `}</style>
                                <Calendar events={events} onEventClick={handleEventClick} />
                            </div>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card className="border-slate-100 shadow-lg bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <LayoutList className="w-5 h-5 text-primary" /> {t('summary')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-center">
                                    <div className="text-2xl font-bold text-slate-800">{events.length}</div>
                                    <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-1">{t('total')}</div>
                                </div>
                                <div className="p-3 bg-green-50 rounded-lg border border-green-100 text-center">
                                    <div className="text-2xl font-bold text-green-700">
                                        {events.filter(e => {
                                            if (!e.event_lines || e.event_lines.length === 0) return false;
                                            return e.event_lines.every(line => (line as any).item_occupation?.[0]?.status === 1);
                                        }).length}
                                    </div>
                                    <div className="text-[10px] uppercase text-green-600 font-bold tracking-wider mt-1">{t('confirmed')}</div>
                                </div>
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-100 text-center">
                                    <div className="text-2xl font-bold text-amber-700">
                                        {events.filter(e => {
                                            if (!e.event_lines || e.event_lines.length === 0) return false;
                                            const statuses = e.event_lines.map(line => (line as any).item_occupation?.[0]?.status || 0);
                                            return !statuses.every(s => Number(s) === 1) && !statuses.every(s => Number(s) === 0);
                                        }).length}
                                    </div>
                                    <div className="text-[9px] uppercase text-amber-600 font-bold tracking-wider mt-1 leading-none">{t('inProgress')}</div>
                                </div>
                                <div className="p-3 bg-slate-100/50 rounded-lg border border-slate-200 text-center">
                                    <div className="text-2xl font-bold text-slate-700">
                                        {events.filter(e => {
                                            if (!e.event_lines || e.event_lines.length === 0) return true;
                                            return e.event_lines.every(line => (line as any).item_occupation?.[0]?.status === 0);
                                        }).length}
                                    </div>
                                    <div className="text-[10px] uppercase text-slate-500 font-bold tracking-wider mt-1">{t('pending')}</div>
                                </div>
                            </div>
                            <div className="p-4 bg-primary/5 rounded-xl border border-orange-100">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-orange-900">{t('estimatedSpend')}</span>
                                    <DollarSign className="w-4 h-4 text-orange-400" />
                                </div>
                                <div className="text-2xl font-bold text-orange-700">
                                    {events.reduce((acc, event) => acc + (event.event_lines?.reduce((sum, line) => sum + Number(line.price_ttc), 0) || 0), 0).toLocaleString()} <span className="text-sm font-medium">TND</span>
                                </div>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
                                <div className="text-sm font-medium text-blue-900">{t('nextEvent')}</div>
                                {events.filter(e => new Date(e.start_date) >= new Date()).length > 0 ? (
                                    <div className="text-xs font-bold text-blue-700 bg-white px-2 py-1 rounded-full shadow-sm">
                                        {moment(events.filter(e => new Date(e.start_date) >= new Date()).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())[0].start_date).fromNow()}
                                    </div>
                                ) : (
                                    <span className="text-xs text-blue-400">{t('nonePlanned')}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-linear-to-br from-slate-900 to-slate-800 border-0 shadow-xl block">
                        <CardContent className="p-6">
                            <h3 className="font-bold text-white text-lg mb-2">{t('helpTitle')}</h3>
                            <p className="text-slate-300 text-white text-sm mb-4">{t('helpSubtitle')}</p>
                            <Link href="/contact" className="bg-white text-blue-800 font-bold px-4 py-2 rounded-md w-full">{t('contactSupport')}</Link>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* View Modal */}
            <Modal isOpen={isModalOpen} onClose={closeModal} title={t('eventDetails')} widthClass="max-w-6xl">
                {selectedEvent && (
                    <div className="px-6 py-6 space-y-6">
                        {/* Header: Title, Status, Actions */}
                        <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{selectedEvent.title || `Event #${selectedEvent.id}`}</h2>
                                <div className="flex items-center gap-3 mt-2">
                                    <Badge variant="outline" className={selectedEventBadgeStyles}>
                                        {selectedEventDerivedStatus}
                                    </Badge>
                                    <span className="text-sm text-slate-500 font-medium">{selectedEvent.category || 'General'}</span>
                                    {selectedEvent.guests && <span className="text-sm text-slate-500 px-2 border-l border-slate-200">{selectedEvent.guests} {t('guests')}</span>}
                                </div>
                            </div>
                            {canModifyEvent(selectedEvent) && (
                                <div className="flex gap-2 shrink-0">
                                    <Button size="sm" variant="outline" onClick={handleEdit} className="editBtn">
                                        <Edit className="w-4 h-4 mr-2" /> {t('editEvent')}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => { setIsModalOpen(false); setIsDeleteModalOpen(true); }} className="delBtn">
                                        <Trash2 className="w-4 h-4 mr-2" /> {t('deleteEvent')}
                                    </Button>
                                </div>
                            )}
                        </div>

                        {/* Date/Time Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-blue-500"><CalendarIcon className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400  tracking-wider mb-1">{t('startDate')}</p>
                                    <p className="font-bold text-slate-800">{moment(selectedEvent.start_date).format('MMMM Do, YYYY')}</p>
                                    <p className="text-sm text-slate-500">{moment(selectedEvent.start_date).format('h:mm A')}</p>
                                </div>
                            </div>
                            <div className="bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-4">
                                <div className="p-3 bg-white rounded-lg shadow-sm text-primary/50"><Clock className="w-5 h-5" /></div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400  tracking-wider mb-1">{t('endDate')}</p>
                                    <p className="font-bold text-slate-800">{moment(selectedEvent.end_date).format('MMMM Do, YYYY')}</p>
                                    <p className="text-sm text-slate-500">{moment(selectedEvent.end_date).format('h:mm A')}</p>
                                </div>
                            </div>
                        </div>

                        {selectedEvent.description && (
                            <div className="bg-slate-50/50 rounded-xl border border-slate-100">
                                <h3 className="font-bold text-slate-900 mb-2 text-sm  tracking-wider flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 text-slate-400" /> {t('description')}
                                </h3>
                                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{selectedEvent.description}</p>
                            </div>
                        )}

                        {/* Services List */}
                        {selectedEvent.event_lines && selectedEvent.event_lines.length > 0 && (
                            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-900 text-sm  tracking-wider">{t('bookedServices')}</h3>
                                    <Badge variant="secondary" className="bg-slate-200 text-slate-700 hover:bg-slate-300">{t('itemsCount', { count: selectedEvent.event_lines.length })}</Badge>
                                </div>
                                <div className="max-h-80 overflow-y-auto custom-scrollbar bg-white divide-y divide-slate-100">
                                    {selectedEvent.event_lines.map((line) => {
                                        const itemStatus = (line as any).item_occupation?.[0]?.status || 0;
                                        return (
                                            <div key={line.id} className="flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                                <div className="flex items-center gap-4">
                                                    <a href={`/items/${line.item_id}`} target="_blank" className="w-12 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden relative border border-slate-100 block hover:opacity-80 transition-opacity">
                                                        {line.items?.image || line.items?.cover ? (
                                                            <img src={line.items.image || line.items.cover} alt={line.title} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-indigo-600 bg-indigo-50 font-bold text-xs">#{line.item_id}</div>
                                                        )}
                                                    </a>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <a href={`/items/${line.item_id}`} target="_blank" className="font-bold text-slate-900 text-sm group-hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-2 block cursor-pointer">
                                                                {line.items?.title || line.title || `Service Item #${line.item_id}`}
                                                            </a>
                                                            {itemStatus === 1 ? (
                                                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 text-[9px] py-0 h-4">{t('confirmed')}</Badge>
                                                            ) : itemStatus === 2 ? (
                                                                <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200 text-[9px] py-0 h-4">{t('delete')}</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-slate-500 text-[9px] py-0 h-4 bg-white border-slate-200">{t('pending')}</Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                            <CalendarIcon className="w-3 h-3" />
                                                            {moment(line.start_date).format('MMM D, h:mm A')} - {moment(line.end_date).format('MMM D, h:mm A')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-slate-900">{Number(line.price_ttc).toLocaleString()} TND</p>
                                                    {Number(line.discount) > 0 && <span className="text-xs text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">-{line.discount}% OFF</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                                    <span className="font-medium text-slate-600">{t('totalEstimate')}</span>
                                    <span className="font-bold text-2xl text-slate-900">
                                        {selectedEvent.event_lines.reduce((s, l) => s + Number(l.price_ttc), 0).toLocaleString()} TND
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                )
                }
            </Modal>

            {/* Edit and Delete Modals kept with basic structure but ensure they work */}
            {
                selectedEvent && (
                    <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setIsModalOpen(true); }} title={t('editEvent')} widthClass="max-w-7xl h-[85vh]">
                        <div className="flex flex-col h-full">

                            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-0 min-h-0 bg-slate-50/50 rounded-xl overflow-hidden border border-slate-200">
                                {/* Left Column: Form & Existing Services */}
                                <div className="lg:col-span-2 overflow-y-auto custom-scrollbar bg-white md:p-8">
                                    <div className="grid grid-cols-2 gap-4 mb-8">
                                        <div className="col-span-2">
                                            <Label className="mb-2 block text-xs font-bold  text-slate-500 tracking-wider">{t('eventTitle')}</Label>
                                            <Input className="font-semibold text-lg" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} placeholder={t('eventTitle')} />
                                        </div>
                                        <div>
                                            <Label className="mb-2 block text-xs font-bold  text-slate-500 tracking-wider">{t('category')}</Label>
                                            <Select value={editCategory} onValueChange={setEditCategory}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t('category')} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {eventCategories.map((c) => (
                                                        <SelectItem key={c} value={c}>{c}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label className="mb-2 block text-xs font-bold  text-slate-500 tracking-wider">{t('guests')}</Label>
                                            <Input type="number" min={1} value={editGuests || ''} onChange={(e) => setEditGuests(Number(e.target.value))} />
                                        </div>
                                        <div>
                                            <Label className="mb-2 block text-xs font-bold  text-slate-500 tracking-wider">{t('startDate')}</Label>
                                            <Input type="datetime-local" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} />
                                        </div>
                                        <div>
                                            <Label className="mb-2 block text-xs font-bold  text-slate-500 tracking-wider">{t('endDate')}</Label>
                                            <Input type="datetime-local" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <Label className="mb-2 block text-xs font-bold  text-slate-500 tracking-wider">{t('description')}</Label>
                                            <Textarea
                                                value={editDescription}
                                                onChange={(e: any) => setEditDescription(e.target.value)}
                                                placeholder={t('description')}
                                                className="min-h-[100px]"
                                            />
                                        </div>
                                    </div>

                                    {/* Lines Editor */}
                                    {editEventLines.length > 0 && (
                                        <div className="space-y-6 pt-6 border-t border-slate-100">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-bold text-slate-900  tracking-wider">{t('bookedServices')}</h3>
                                                <Badge variant="secondary">{t('itemsCount', { count: editEventLines.length })}</Badge>
                                            </div>
                                            <div className="space-y-3">
                                                {editEventLines.map((line, idx) => (
                                                    <div key={idx} className="flex flex-col sm:flex-row gap-4 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group">
                                                        {/* Image */}
                                                        <a href={`/items/${line.itemId}`} target="_blank" className="w-full sm:w-20 h-20 rounded-lg bg-slate-100 shrink-0 overflow-hidden relative block hover:opacity-80 transition-opacity border border-slate-100">
                                                            {line.item?.image || line.item?.cover ? (
                                                                <img src={line.item.image || line.item.cover} alt={line.item.title || 'Item'} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                                                                    <LayoutList className="w-8 h-8 opacity-20" />
                                                                </div>
                                                            )}
                                                        </a>

                                                        {/* Content */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div>
                                                                    <a href={`/items/${line.itemId}`} target="_blank" className="font-bold text-slate-900 line-clamp-1 text-sm hover:text-primary transition-colors hover:underline decoration-primary/30 underline-offset-2 block cursor-pointer">
                                                                        {line.item?.title || `Item #${line.itemId}`}
                                                                    </a>
                                                                    {Number(line.priceHt) > 0 ? (
                                                                        <p className="text-xs text-primary font-bold">{Number(line.priceHt).toLocaleString()} TND</p>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700 mt-1">
                                                                            {t('helpTitle')}
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={() => { const l = [...editEventLines]; l.splice(idx, 1); setEditEventLines(l); }}
                                                                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 -mt-2 -mr-2"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </Button>
                                                            </div>

                                                            <div className="grid grid-cols-2 gap-3">
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px]  text-slate-400 font-bold">{t('startDate')}</Label>
                                                                    <Input
                                                                        type="datetime-local"
                                                                        className="h-7 text-xs px-2"
                                                                        value={line.itemStartDate}
                                                                        onChange={e => { const l = [...editEventLines]; l[idx].itemStartDate = e.target.value; setEditEventLines(l); }}
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <Label className="text-[10px]  text-slate-400 font-bold">{t('endDate')}</Label>
                                                                    <Input
                                                                        type="datetime-local"
                                                                        className="h-7 text-xs px-2"
                                                                        value={line.itemEndDate}
                                                                        onChange={e => { const l = [...editEventLines]; l[idx].itemEndDate = e.target.value; setEditEventLines(l); }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Add Services */}
                                <div className="lg:col-span-1 border-l border-slate-200 bg-slate-50 flex flex-col min-h-0">
                                    <div className="border-b border-slate-200 bg-white sticky top-0 z-10">
                                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <div className="p-1.5 bg-primary/10 rounded-md text-primary"><Plus className="w-4 h-4" /></div>
                                            {t('addItem')}
                                        </h3>
                                    </div>
                                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3">
                                        {isLoadingItems ? (
                                            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-2"></div>
                                                <p className="text-xs">{t('loading')}</p>
                                            </div>
                                        ) : availableItems.filter(item => !editEventLines.some(line => line.itemId === item.id)).length === 0 ? (
                                            <div className="text-center py-12 px-6">
                                                <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400"><LayoutList className="w-8 h-8" /></div>
                                                <p className="text-sm font-medium text-slate-900">No new items found</p>
                                                <p className="text-xs text-slate-500 mt-1">All available services for this provider have been added.</p>
                                            </div>
                                        ) : (
                                            availableItems.filter(item => !editEventLines.some(line => line.itemId === item.id)).map(item => (
                                                <div key={item.id} className="group bg-white rounded-xl p-3 border border-slate-200 shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                                                    <div className="flex gap-3">
                                                        <div className="w-16 h-16 bg-slate-100 rounded-lg shrink-0 overflow-hidden relative border border-slate-100 p-0.5">
                                                            {item.image || item.cover ? (
                                                                <img
                                                                    src={item.image || item.cover}
                                                                    alt={item.title}
                                                                    className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform duration-500"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-md"><LayoutList className="w-6 h-6 text-slate-300" /></div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-slate-800 text-sm line-clamp-1 mb-1" title={item.title}>{item.title}</h4>
                                                            <div className="mb-2">
                                                                {item.price && Number(item.price) > 0 ? (
                                                                    <p className="text-xs font-bold text-primary">{Number(item.price).toLocaleString()} TND</p>
                                                                ) : (
                                                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                                                                        {t('helpTitle')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="flex gap-2">
                                                                <Button
                                                                    size="sm"
                                                                    onClick={() => setEditEventLines([...editEventLines, {
                                                                        itemId: Number(item.id),
                                                                        item: item,
                                                                        itemStartDate: editStartDate || new Date().toISOString(),
                                                                        itemEndDate: editEndDate || new Date().toISOString(),
                                                                        priceHt: Number(item.price) || 0,
                                                                        tvaValue: 0,
                                                                        discount: 0
                                                                    }])}
                                                                    className="flex-1 h-7 text-xs bg-slate-900 text-white hover:bg-primary shadow-none"
                                                                >
                                                                    {t('addItem')}
                                                                </Button>
                                                                <Link href={`/items/${item.id}`} target="_blank" className="px-2 flex items-center justify-center rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400 hover:text-blue-500 transition-colors">
                                                                    <ExternalLink className="w-3 h-3" />
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                                <Button disabled={isSaving} onClick={handleSaveEdit} className="updateBtn">{isSaving ? t('loading') : t('save')}</Button>
                                <Button className="closeBtn" onClick={() => { setIsEditModalOpen(false); setIsModalOpen(true); }}>{t('close')}</Button>
                            </div>
                        </div >
                    </Modal >
                )
            }

            {
                selectedEvent && (
                    <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setIsModalOpen(true); }} title={t('confirmDelete')}>
                        <div className="text-center space-y-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600"><AlertCircle /></div>
                            <h3 className="font-bold text-lg text-slate-900">{t('confirmDeleteMessage')}</h3>
                            <p className="text-slate-500 text-sm">{t('deleteWarning')}</p>
                            <div className="flex justify-center gap-2 mt-4">
                                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="deleteBtn">{isDeleting ? t('loading') : t('deleteEvent')}</Button>
                                <Button className="closeBtn" onClick={() => { setIsDeleteModalOpen(false); setIsModalOpen(true); }}>{t('close')}</Button>
                            </div>
                        </div>
                    </Modal>
                )
            }
        </div >
    );
}