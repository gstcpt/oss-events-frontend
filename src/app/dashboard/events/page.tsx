"use client";
import React, { useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { Event, EventStatistics } from "@/types/events";
import { Company } from "@/types/companies";
import { User } from "@/types/users";
import { Item } from "@/types/items";
import { getAllEvents, deleteEvent, getEventStatistics, createComplexEvent, updateComplexEvent, getCompanies, getAvailableItems } from "@/lib/api/events";
import { getCompanyUsers } from "@/lib/api/user";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";
import { CalendarIcon, Plus, LayoutList, Search, DollarSign, Users as UsersIcon, Clock, CheckCircle2, AlertCircle, Trash2, ExternalLink, Image as ImageIcon, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Textarea from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTranslations } from "next-intl";

const eventCategories = ["Wedding", "Birthday", "Corporate", "Party", "Other"];

export default function Events() {
    const t = useTranslations('Dashboard.events');
    const { user } = useAuth();

    // Data State
    const [events, setEvents] = useState<Event[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [companyUsers, setCompanyUsers] = useState<User[]>([]);
    const [availableItems, setAvailableItems] = useState<Item[]>([]);

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState<Partial<Event> | null>(null);
    const [selectedClient, setSelectedClient] = useState<any>(null);
    const [eventStats, setEventStats] = useState<EventStatistics | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Form State
    const [editCompanyId, setEditCompanyId] = useState<number | null>(null);
    const [editClientId, setEditClientId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editCategory, setEditCategory] = useState("");
    const [editGuests, setEditGuests] = useState<number>(0);
    const [editDescription, setEditDescription] = useState("");
    const [editStartDate, setEditStartDate] = useState<string>("");
    const [editEndDate, setEditEndDate] = useState<string>("");

    // Provider Permission Checks
    const isEventOwner = !currentEvent?.id || Number(currentEvent?.client_id) === Number(user?.id);
    const isReadonlyProvider = Number(user?.role_id) === 3 && !isEventOwner;

    // Item Ownership Helper
    const isItemOwnedByMe = (item: any) => {
        if (!user) { return false; }
        const pId = item.providerId || item.provider_id;
        if (user.role === "Root") { return true; }
        else if (user.role === "Admin") { return true; }
        else if (user.role === "Provider" && pId && Number(pId) === Number(user.id)) { return true; }
        else { return false; }
    };

    // Item Addition State
    const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
    const [itemStartDate, setItemStartDate] = useState<string>("");
    const [itemEndDate, setItemEndDate] = useState<string>("");

    const [selectedItems, setSelectedItems] = useState<
        Array<{
            id?: number;
            itemId: number;
            itemName: string;
            itemImage?: string;
            itemCover?: string;
            providerId?: number;
            companyId?: number;
            itemStartDate: string;
            itemEndDate: string;
            priceHt: number;
            tvaValue: number;
            discount: number;
            status?: number;
            hasInvalidDates?: boolean;
        }>
    >([]);

    // Initial Fetch
    useEffect(() => {
        if (!user) return;
        const fetchEvents = async () => {
            try {
                const data = await getAllEvents();
                setEvents(data);
                if (user?.role_id === 1) {
                    const comps = await getCompanies();
                    setCompanies(comps);
                }
            } catch (error) { toast.error(t('errorLoading')); }
        };
        fetchEvents();
    }, [user]);

    // Handle Open Create/Edit Modal
    const handleOpenModal = (event: Partial<Event> | null = null) => {
        setCurrentEvent(event);
        if (event && event.id) {
            // Edit Mode - Populate Form
            setEditCompanyId(event.company_id || null);
            setEditClientId(event.client_id || null);
            setEditTitle(event.title || "");
            setEditCategory(event.category || "");
            setEditGuests(event.guests || 0);
            setEditDescription(event.description || "");

            setEditStartDate(event.start_date ? new Date(event.start_date).toISOString().slice(0, 16) : "");
            setEditEndDate(event.end_date ? new Date(event.end_date).toISOString().slice(0, 16) : "");
        } else {
            // Create Mode - Reset Form
            resetForm();
            if (user?.company_id) setEditCompanyId(user.company_id);
        }
        setIsModalOpen(true);
    };

    const resetForm = () => {
        setEditCompanyId(null);
        setEditClientId(null);
        setEditTitle("");
        setEditCategory("");
        setEditGuests(0);
        setEditDescription("");
        setEditStartDate("");
        setEditEndDate("");
        setSelectedItems([]);
        setSelectedItemId(null);
        setItemStartDate("");
        setItemEndDate("");
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentEvent(null);
        resetForm();
    };

    // Load Dependencies when Modal Opens or Company Changes
    useEffect(() => {
        const loadDependencies = async () => {
            if (!isModalOpen) return;

            const targetCompanyId = editCompanyId || user?.company_id;

            if (targetCompanyId) {
                try {
                    try {
                        const usersData = await getCompanyUsers(targetCompanyId);
                        setCompanyUsers(usersData); // Load all users for the company
                    } catch (e) { toast.error(t('errorLoadingUsers') || "Failed to load users."); }

                    const items = await getAvailableItems(targetCompanyId);
                    setAvailableItems(items);

                    // If Editing, match existing items to available items
                    if (currentEvent?.id && currentEvent.event_lines && selectedItems.length === 0) {
                        const mapped = currentEvent.event_lines.map((line: any) => {
                            const it = items.find(i => i.id === line.item_id) || line.items;
                            return {
                                id: line.id,
                                itemId: line.item_id,
                                itemName: it?.title || t('unknownItem'),
                                itemImage: it?.image || it?.item_media?.[0]?.url,
                                itemCover: it?.cover || line.items?.cover,
                                providerId: it?.provider_id || line.items?.provider_id,
                                companyId: it?.company_id || line.items?.company_id,
                                itemStartDate: line.start_date ? new Date(line.start_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                                itemEndDate: line.end_date ? new Date(line.end_date).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
                                priceHt: Number(line.price_ht),
                                tvaValue: Number(line.tva_value),
                                discount: Number(line.discount),
                                status: line.item_occupation && line.item_occupation[0] ? line.item_occupation[0].status : 0
                            };
                        });
                        setSelectedItems(mapped);
                    }

                } catch (e) { toast.error(t('errorLoading') || "Failed to load dependencies."); }
            }
        };
        loadDependencies();
    }, [isModalOpen, editCompanyId, user, currentEvent]);

    const handleDeleteEvent = async () => {
        if (!currentEvent?.id) return;
        try {
            await deleteEvent(currentEvent.id);
            setEvents(await getAllEvents());
            setIsDeleteModalOpen(false);
            setCurrentEvent(null);
            toast.success(t('eventDeleted'));
        } catch (error) {
            toast.error(t('errorSaving') + ": " + (error as Error).message);
        }
    };

    const handleSave = async () => {
        if (!editClientId || !editStartDate || !editEndDate || !editTitle || selectedItems.length === 0) {
            toast.error(t('fillRequiredFields') || "Please fill all required fields");
            return;
        }

        const targetCompanyId = editCompanyId || user?.company_id;
        if (!targetCompanyId) {
            toast.error(t('toastErrorCompanyRequired'));
            return;
        }

        try {
            if (currentEvent?.id) {
                await updateComplexEvent(
                    currentEvent.id,
                    targetCompanyId,
                    editClientId,
                    editStartDate,
                    editEndDate,
                    editTitle,
                    editCategory,
                    Number(editGuests),
                    editDescription,
                    selectedItems.map(i => ({
                        id: i.id,
                        itemId: i.itemId,
                        itemStartDate: i.itemStartDate,
                        itemEndDate: i.itemEndDate,
                        priceHt: i.priceHt,
                        tvaValue: i.tvaValue,
                        discount: i.discount,
                        status: i.status
                    }))
                );
                toast.success(t('toastEventUpdated'));
            } else {
                await createComplexEvent(
                    targetCompanyId,
                    editClientId,
                    editStartDate,
                    editEndDate,
                    editTitle,
                    editCategory,
                    Number(editGuests),
                    editDescription,
                    selectedItems.map(i => ({
                        itemId: i.itemId,
                        itemStartDate: i.itemStartDate,
                        itemEndDate: i.itemEndDate,
                        priceHt: i.priceHt,
                        tvaValue: i.tvaValue,
                        discount: i.discount
                    }))
                );
                toast.success(t('toastEventCreated'));
            }
            const data = await getAllEvents();
            setEvents(data);
            handleCloseModal();
        } catch (error) { toast.error(t('toastErrorOperation', { error: (error as Error).message })); }
    };

    const addSelectedItem = () => {
        if (!selectedItemId) return;
        const item = availableItems.find(i => i.id === selectedItemId);
        if (!item) return;

        const start = itemStartDate || editStartDate;
        const end = itemEndDate || editEndDate;

        if (!start || !end) {
            toast.error(t('toastErrorDatesRequired'));
            return;
        }

        setSelectedItems([...selectedItems, {
            itemId: item.id,
            itemName: item.title,
            itemImage: item.image,
            itemCover: item.cover,
            providerId: (item as any).provider_id || (item as any).providerId,
            companyId: (item as any).company_id || (item as any).companyId,
            itemStartDate: start,
            itemEndDate: end,
            priceHt: item.price || 0,
            tvaValue: 0,
            discount: 0,
            status: 0
        }]);
        setSelectedItemId(null);
        setItemStartDate("");
        setItemEndDate("");
    };

    const removeSelectedItem = (idx: number) => {
        const l = [...selectedItems];
        l.splice(idx, 1);
        setSelectedItems(l);
    };

    const updateSelectedItemDate = (idx: number, field: 'itemStartDate' | 'itemEndDate' | 'priceHt' | 'tvaValue' | 'discount' | 'status', value: any) => {
        const l = [...selectedItems];
        l[idx] = { ...l[idx], [field]: value };
        setSelectedItems(l);
    };

    // --- Stats & Helpers ---
    const getStatusBadge = (status: number) => {
        return status === 1
            ? <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none"><CheckCircle2 className="w-3 h-3 mr-1" /> Active</Badge>
            : <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-200 border-none"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>;
    };

    const isValidImageSrc = (src: string | null | undefined) => {
        if (!src) return false;
        return src.startsWith('/') || src.startsWith('http');
    };

    const filteredEvents = events.filter(e =>
        e.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.description?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (e.client?.firstname?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (e.client?.lastname?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
    const isRootUser = Number(user?.role_id) === 1;
    // Columns for DataTable
    const columns = [
        {
            header: "Event", accessor: "title", cell: (row: Event) => (
                <div className="flex flex-col">
                    <span className="font-mediun text-slate-900">{row.title || `Event #${row.id}`}</span>
                    <span className="text-xs text-slate-500">{row.category}</span>
                </div>
            )
        },
        {
            header: "Client/User", accessor: "client", cell: (row: Event) => row.client ? (
                <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors" onClick={() => { setSelectedClient(row.client); setIsClientModalOpen(true); }}>
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-mediun text-slate-600">
                        {row.client.firstname?.[0]}{row.client.lastname?.[0]}
                    </div>
                    <div>
                        <p className="text-sm font-medium">{row.client.firstname} {row.client.lastname}</p>
                        <p className="text-xs text-slate-400">{row.client.email}</p>
                    </div>
                </div>
            ) : <span className="text-slate-400 italic">No Client</span>
        },
        {
            header: "Schedule", accessor: "start_date", cell: (row: Event) => (
                <div className="text-sm text-slate-600">
                    <p>{row.start_date ? new Date(row.start_date).toLocaleDateString() : 'N/A'}</p>
                    <p className="text-xs text-slate-400">{row.end_date ? new Date(row.end_date).toLocaleDateString() : 'N/A'}</p>
                </div>
            )
        },
        {
            header: "Value", accessor: "id", cell: (row: Event) => {
                const total = row.event_lines?.reduce((acc, line) => acc + Number(line.price_ttc), 0) || 0;
                return <span className="font-mediun text-slate-900">{total.toLocaleString()} TND</span>;
            }
        },

        ...(isRootUser ? [{
            header: "Company",
            accessor: "companies",
            cell: (l: any) => <span className="">{l.companies?.title || "System Core"}</span>
        }] : []),
        { header: "Status", accessor: "status", cell: (row: Event) => getStatusBadge(row.status || 0) }
    ];

    return (
        <div className="space-y-8 animate-fade-in-up">
            {/* Header Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <CardContent className="p-5 flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[11px] font-mediun text-slate-400 uppercase tracking-widest">Total Events</p>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{events.length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-blue-500">
                            <CalendarIcon className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50/50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <CardContent className="p-5 flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[11px] font-mediun text-slate-400 uppercase tracking-widest">Confirmed</p>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{events.filter(e => e.status === 1).length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-green-500">
                            <CheckCircle2 className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50/50 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <CardContent className="p-5 flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[11px] font-mediun text-slate-400 uppercase tracking-widest">Pending</p>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">{events.filter(e => e.status !== 1).length}</h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-amber-500">
                            <Clock className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-slate-100 shadow-sm hover:shadow-md transition-all bg-white relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>
                    <CardContent className="p-5 flex items-center justify-between relative z-10">
                        <div className="space-y-1">
                            <p className="text-[11px] font-mediun text-slate-400 uppercase tracking-widest">Total Revenue</p>
                            <h3 className="text-3xl font-bold text-slate-800 tracking-tight flex items-end gap-1">
                                {events.reduce((acc, e) => acc + (e.event_lines?.reduce((s, l) => s + Number(l.price_ttc), 0) || 0), 0).toLocaleString()}
                                <span className="text-sm font-medium text-slate-500 pb-1">TND</span>
                            </h3>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex items-center justify-center text-primary">
                            <DollarSign className="w-5 h-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Data Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="space-y-8">
                    <div className="card">
                        <div className="px-6 py-4 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">Events Management</h2>
                            <Button onClick={() => handleOpenModal(null)} className="addNewBtn"><i className="fa fa-plus mr-2"></i>Add Event</Button>
                        </div>
                        <div className="p-6">
                            <DataTable
                                columns={columns}
                                data={filteredEvents}
                                onCustomAction={(row: Event) => {
                                    setCurrentEvent(row);
                                    setIsStatsModalOpen(true);
                                    getEventStatistics(row.id).then(s => setEventStats(s as EventStatistics));
                                }}
                                customActionLabel="Statistics"
                                iconCustomAction="fa fa-chart-line"
                                onEdit={handleOpenModal}
                                onDelete={(e) => { setCurrentEvent(e); setIsDeleteModalOpen(true); }}
                                showEdit={true}
                                showDelete={true}
                                defaultSort={{ key: "id", direction: "descending" }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {isModalOpen && (
                <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={currentEvent?.id ? "Edit Event" : "Create New Event"} widthClass="max-w-7xl">
                    <div className="">
                        <div className="h-[75vh] overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

                                {/* Left: Form Fields */}
                                <div className="lg:col-span-2 space-y-6">
                                    {/* Section 1: Basic Info */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-100 space-y-6 shadow-sm">
                                        <h4 className="font-mediun text-slate-800 flex items-center gap-2 text-sm  tracking-wider">
                                            <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs shadow-sm">1</div>
                                            Event Details
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <Label className="text-xs font-mediun text-slate-500  mb-1 block">Event Title</Label>
                                                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="e.g. Summer Wedding 2026" className="font-semibold text-slate-800 bg-white" disabled={isReadonlyProvider} />
                                            </div>
                                            <div>
                                                <Label className="text-xs font-mediun text-slate-500  mb-1 block">Category</Label>
                                                <select
                                                    className="w-full flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:opacity-50"
                                                    value={editCategory}
                                                    onChange={e => setEditCategory(e.target.value)}
                                                    disabled={isReadonlyProvider}
                                                >
                                                    <option value="">Select Category</option>
                                                    {eventCategories.map(c => <option key={c} value={c}>{c}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <Label className="text-xs font-mediun text-slate-500  mb-1 block">Guests</Label>
                                                <Input type="number" value={editGuests} className="font-semibold text-slate-800 bg-white" onChange={e => setEditGuests(Number(e.target.value))} disabled={isReadonlyProvider} />
                                            </div>
                                            <div className="col-span-2">
                                                <Label className="text-xs font-mediun text-slate-500  mb-1 block">Description</Label>
                                                <Textarea value={editDescription} onChange={(e: any) => setEditDescription(e.target.value)} placeholder="Additional details..." className="h-20 font-semibold text-slate-800 bg-white" disabled={isReadonlyProvider} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Section 2: Items */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-100 space-y-6 shadow-sm">
                                        <h4 className="font-mediun text-slate-800 flex items-center gap-2 text-sm  tracking-wider">
                                            <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs shadow-sm">2</div>
                                            Services & Items ({selectedItems.length})
                                        </h4>

                                        {/* Add Item Form */}
                                        {!isReadonlyProvider && (
                                            <div className="flex gap-2 items-end bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                                                <div className="flex-1">
                                                    <Label className="text-xs mb-1 block">Select Service to Add</Label>
                                                    <select
                                                        className="w-full h-9 rounded-md border border-slate-200 text-sm px-2"
                                                        value={selectedItemId || ""}
                                                        onChange={e => setSelectedItemId(Number(e.target.value))}
                                                    >
                                                        <option value="">-- Choose Item --</option>
                                                        {availableItems.map(i => <option key={i.id} value={i.id}>{i.title} ({Number(i.price).toFixed(0)} TND)</option>)}
                                                    </select>
                                                </div>
                                                <Button size="sm" onClick={addSelectedItem} disabled={!selectedItemId} className="h-9 shadow-sm bg-slate-800 text-white">
                                                    <Plus className="w-4 h-4 mr-1" /> Add
                                                </Button>
                                            </div>
                                        )}

                                        {/* Items List */}
                                        <div className="space-y-3">
                                            {selectedItems.map((item, idx) => (
                                                <div key={idx} className="flex flex-col sm:flex-row items-center gap-4 p-3 bg-white rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow group relative">
                                                    {/* Image */}
                                                    <div className="w-16 h-16 rounded-md bg-slate-100 shrink-0 overflow-hidden border border-slate-100 relative">
                                                        {(item.itemImage || item.itemCover) ? (
                                                            <img src={item.itemImage || item.itemCover} alt={item.itemName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-300"><ImageIcon className="w-6 h-6" /></div>
                                                        )}
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-5 w-full">
                                                        <div className="lg:col-span-8">
                                                            <div className="flex justify-between items-center w-full">
                                                                <Link href={`/items/${item.itemId}`} target="_blank" className="font-mediun text-slate-800 hover:text-primary hover:underline line-clamp-1 flex items-center gap-1">
                                                                    {item.itemName} <ExternalLink className="w-3 h-3 opacity-50" />
                                                                </Link>

                                                                <div className="flex items-center gap-4">
                                                                    {(!isReadonlyProvider || isItemOwnedByMe(item)) && (
                                                                        <div className="flex items-center gap-2">
                                                                            <button
                                                                                title="Confirm Item"
                                                                                onClick={() => updateSelectedItemDate(idx, 'status', 1)}
                                                                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${item.status === 1 ? 'bg-green-500 text-white shadow-md scale-105' : 'bg-green-50 text-green-600 hover:bg-green-100'} border border-green-200 opacity-90 hover:opacity-100`}
                                                                            >
                                                                                <CheckCircle2 className="w-5 h-5" />
                                                                            </button>
                                                                            <button
                                                                                title="Ignore Item"
                                                                                onClick={() => updateSelectedItemDate(idx, 'status', 2)}
                                                                                className={`flex items-center justify-center w-8 h-8 rounded-full transition-all ${item.status === 2 ? 'bg-red-500 text-white shadow-md scale-105' : 'bg-red-50 text-red-600 hover:bg-red-100'} border border-red-200 opacity-90 hover:opacity-100`}
                                                                            >
                                                                                <X className="w-5 h-5" />
                                                                            </button>
                                                                        </div>
                                                                    )}

                                                                    <div className="text-[12px] font-mediun px-3 py-1.5 rounded-lg bg-slate-100 border border-slate-200 shadow-inner flex items-center whitespace-nowrap min-w-[150px] justify-center">
                                                                        <span className="text-slate-500 mr-2 uppercase tracking-wide text-[10px]">Status actual:</span>
                                                                        {item.status === 1 ? (
                                                                            <span className="text-green-600 tracking-wide">Confirmed</span>
                                                                        ) : item.status === 2 ? (
                                                                            <span className="text-red-500 tracking-wide">Ignored</span>
                                                                        ) : (
                                                                            <span className="text-amber-500 tracking-wide">Pending</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {(!isReadonlyProvider || isItemOwnedByMe(item)) ? (
                                                                <div className="mt-3 bg-slate-50 border border-slate-100/60 p-3 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] flex flex-col gap-3">
                                                                    <div className="grid grid-cols-3 gap-3">
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-mediun text-slate-500 tracking-wider">PRICE HT</label>
                                                                            <div className="relative">
                                                                                <Input type="number" value={item.priceHt} onChange={e => updateSelectedItemDate(idx, 'priceHt', Number(e.target.value))} className="h-8 pl-2 pr-8 text-[11px] font-mediun border-slate-200 bg-white shadow-sm rounded-lg" />
                                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mediun text-slate-400">TND</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-mediun text-slate-500 tracking-wider">TVA</label>
                                                                            <div className="relative">
                                                                                <Input type="number" value={item.tvaValue} onChange={e => updateSelectedItemDate(idx, 'tvaValue', Number(e.target.value))} className="h-8 pl-2 pr-6 text-[11px] font-mediun border-slate-200 bg-white shadow-sm rounded-lg" />
                                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-mediun text-slate-400">%</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <label className="text-[10px] font-mediun text-slate-500 tracking-wider">DISCOUNT</label>
                                                                            <div className="relative">
                                                                                <Input type="number" value={item.discount} onChange={e => updateSelectedItemDate(idx, 'discount', Number(e.target.value))} className="h-8 pl-2 pr-8 text-[11px] font-mediun border-slate-200 text-red-600 bg-white shadow-sm rounded-lg" />
                                                                                <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-mediun text-red-300">TND</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-primary text-white h-9 rounded-lg flex items-center justify-between px-3 shadow-sm cursor-default">
                                                                        <span className="text-[10px] font-mediun tracking-wider opacity-80 uppercase">Final Total TTC</span>
                                                                        <span className="font-bold text-sm">{((item.priceHt * (1 + item.tvaValue / 100)) - item.discount).toFixed(2)} TND</span>
                                                                    </div>
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs font-semibold text-primary mt-1">{Number(item.priceHt).toLocaleString()} TND (TTC: {((item.priceHt * (1 + item.tvaValue / 100)) - item.discount).toFixed(2)})</div>
                                                            )}
                                                        </div>
                                                        <div className="lg:col-span-4 flex flex-col justify-center gap-3 bg-slate-50 border border-slate-100/60 p-3.5 rounded-xl shadow-[inset_0_2px_4px_rgba(0,0,0,0.01)] h-full col-span-1 lg:mt-0 mt-3">
                                                            <div>
                                                                <label className="text-[10px] font-mediun text-slate-500 tracking-wider mb-1.5 block uppercase">Start Timeline</label>
                                                                <Input type="datetime-local" value={item.itemStartDate} onChange={e => updateSelectedItemDate(idx, 'itemStartDate', e.target.value)} className="h-9 px-3 text-[11px] font-mediun bg-white border border-slate-200 shadow-sm rounded-lg w-full" disabled={isReadonlyProvider} />
                                                            </div>
                                                            <div>
                                                                <label className="text-[10px] font-mediun text-slate-500 tracking-wider mb-1.5 block uppercase">End Timeline</label>
                                                                <Input type="datetime-local" value={item.itemEndDate} onChange={e => updateSelectedItemDate(idx, 'itemEndDate', e.target.value)} className="h-9 px-3 text-[11px] font-mediun bg-white border border-slate-200 shadow-sm rounded-lg text-slate-700 w-full" disabled={isReadonlyProvider} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Actions / Confirmation */}
                                                    <div className="absolute top-2 right-2 sm:static flex flex-col items-end gap-2">
                                                        {!isReadonlyProvider && (
                                                            <Button size="icon" variant="ghost" onClick={() => removeSelectedItem(idx)} className="text-red-400 hover:text-red-600 hover:bg-red-50">
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {selectedItems.length === 0 && <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 italic text-sm">No items added to this event yet.</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Logistics */}
                                <div className="space-y-6">
                                    {/* Context */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-100 space-y-6 shadow-sm p-4">
                                        <h4 className="font-mediun text-slate-800 flex items-center gap-2 text-sm  tracking-wider">
                                            <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs shadow-sm">3</div>
                                            Client & User Context
                                        </h4>

                                        {user?.role_id === 1 && (
                                            <div>
                                                <Label className="text-xs font-mediun text-slate-500  mb-1 block">Provider Co.</Label>
                                                <select
                                                    className="w-full h-9 rounded-md border border-slate-200 text-sm px-2"
                                                    value={editCompanyId || ""}
                                                    onChange={e => setEditCompanyId(Number(e.target.value))}
                                                >
                                                    <option value="">Select Company</option>
                                                    {companies.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                                </select>
                                            </div>
                                        )}

                                        <div>
                                            <Label className="text-xs font-mediun text-slate-500  mb-1 block">Assigned User / Client</Label>
                                            <select
                                                className="w-full h-9 rounded-md border border-slate-200 text-sm px-2 disabled:opacity-50"
                                                value={editClientId || ""}
                                                onChange={e => setEditClientId(Number(e.target.value))}
                                                disabled={(!editCompanyId && Number(user?.role_id) === 1) || isReadonlyProvider}
                                            >
                                                <option value="">Select User</option>
                                                {companyUsers.map(c => (
                                                    <option key={c.id} value={c.id}>
                                                        {c.firstname} {c.lastname} ({c.email})
                                                    </option>
                                                ))}
                                            </select>
                                            <p className="text-[10px] text-slate-400 mt-1">Select any user associated with the company.</p>
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="bg-slate-50 rounded-xl border border-slate-100 space-y-6 shadow-sm p-4">
                                        <h4 className="font-mediun text-slate-800 flex items-center gap-2 text-sm  tracking-wider">
                                            <div className="w-6 h-6 rounded-full bg-white border flex items-center justify-center text-xs shadow-sm">4</div>
                                            Schedule
                                        </h4>
                                        <div>
                                            <Label className="text-xs font-mediun text-slate-500  mb-1 block">Start Date</Label>
                                            <Input type="datetime-local" value={editStartDate} onChange={e => setEditStartDate(e.target.value)} className="bg-white" disabled={isReadonlyProvider} />
                                        </div>
                                        <div>
                                            <Label className="text-xs font-mediun text-slate-500  mb-1 block">End Date</Label>
                                            <Input type="datetime-local" value={editEndDate} onChange={e => setEditEndDate(e.target.value)} className="bg-white" disabled={isReadonlyProvider} />
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                            <Button onClick={handleSave} className={currentEvent?.id ? "updateBtn" : "addNewBtn"}>{currentEvent?.id ? "Update Event" : "Create Event"}</Button>
                            <Button className="closeBtn" onClick={handleCloseModal}>Close</Button>
                        </div>
                    </div>
                </Modal >
            )
            }

            {
                isStatsModalOpen && eventStats && (
                    <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title={`Statistics: ${currentEvent?.title || 'Event'}`} widthClass="max-w-7xl">
                        <div className="md:p-8 space-y-8 bg-slate-50/50">
                            {/* Key Metrics Dashboard */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-4">
                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute -right-6 -to w-24 h-24 bg-blue-50 rounded-full group-hover:scale-125 transition-transform duration-500 ease-out z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <i className="fa-solid fa-boxes-stacked text-sm"></i>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Items</p>
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-800">{eventStats.items_used}</h3>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute -right-6 -to w-24 h-24 bg-emerald-50 rounded-full group-hover:scale-125 transition-transform duration-500 ease-out z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                                                <i className="fa-solid fa-star text-sm"></i>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unique Srv.</p>
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-800">{eventStats.unique_items_used}</h3>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute -right-6 -to w-24 h-24 bg-indigo-50 rounded-full group-hover:scale-125 transition-transform duration-500 ease-out z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                                <i className="fa-solid fa-tags text-sm"></i>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cost</p>
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-800 flex items-baseline gap-1">
                                            {Number(eventStats.total_price).toLocaleString()}
                                            <span className="text-sm font-medium text-slate-400">TND</span>
                                        </h3>
                                    </div>
                                </div>

                                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                    <div className="absolute -right-6 -to w-24 h-24 bg-orange-50 rounded-full group-hover:scale-125 transition-transform duration-500 ease-out z-0"></div>
                                    <div className="relative z-10">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                                                <i className="fa-solid fa-clock text-sm"></i>
                                            </div>
                                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Duration</p>
                                        </div>
                                        <h3 className="text-3xl font-bold text-slate-800 flex items-baseline gap-1">
                                            {eventStats.event_duration_days}
                                            <span className="text-sm font-medium text-slate-400">Days</span>
                                        </h3>
                                    </div>
                                </div>
                            </div>

                            {/* Detailed Items Breakdown */}
                            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                                <div className="px-6 py-5 border-b border-slate-100 bg-white flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-slate-800">Services Breakdown</h4>
                                        <p className="text-sm text-slate-500 mt-1">Detailed view of all services used in this event</p>
                                    </div>
                                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                        <i className="fa-solid fa-list-ul"></i>
                                    </div>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse min-w-[600px]">
                                        <thead>
                                            <tr className="bg-slate-50/80 border-b border-slate-100">
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12 text-center">#</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Service Details</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Frequency</th>
                                                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Total Value</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-50">
                                            {eventStats.items_with_details.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-slate-50/50 transition-colors group">
                                                    <td className="px-6 py-4 text-sm font-medium text-slate-400 text-center">
                                                        {(i + 1).toString().padStart(2, '0')}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm group-hover:shadow transition-shadow shrink-0">
                                                                {(item.item.image || item.item.cover) ? (
                                                                    <img src={item.item.image || item.item.cover} alt={item.item.title} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                                        <i className="fa-regular fa-image"></i>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div>
                                                                <h5 className="font-bold text-slate-800 text-sm">{item.item.title}</h5>
                                                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[250px]">{item.item.description || 'No description available'}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                                            {item.occupation_count}×
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <div className="flex flex-col items-end">
                                                            <span className="font-bold text-slate-800 text-sm">
                                                                {Number(item.final_price).toLocaleString()} <span className="text-slate-400 font-medium text-xs">TND</span>
                                                            </span>
                                                            <span className="text-[10px] text-slate-400 font-medium">
                                                                {(Number(item.final_price) / Math.max(1, item.occupation_count)).toLocaleString()} TND / unit
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )
            }

            {/* Delete Modal */}
            {
                isDeleteModalOpen && currentEvent && (
                    <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                        <p className="text-gray-700">Are you sure you want to delete this event <strong>{currentEvent?.title}</strong>?</p>
                        <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                            <Button className="deleteBtn" onClick={handleDeleteEvent}>Delete</Button>
                            <Button className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>Close</Button>
                        </div>
                    </Modal>
                )
            }

            {/* Client Modal */}
            {
                isClientModalOpen && selectedClient && (
                    <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Client Details">
                        <div className="space-y-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-mediun text-slate-400">
                                    {selectedClient.firstname?.[0]}{selectedClient.lastname?.[0]}
                                </div>
                                <div>
                                    <h3 className="font-mediun text-lg">{selectedClient.firstname} {selectedClient.lastname}</h3>
                                    <p className="text-slate-500 text-sm">{selectedClient.email}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-sm border-t pt-4">
                                <div className="flex justify-between"><span className="text-slate-500">Phone</span> <span className="font-medium">{selectedClient.phone || "N/A"}</span></div>
                                <div className="flex justify-between"><span className="text-slate-500">Member Since</span> <span className="font-medium">{new Date(selectedClient.created_at).toLocaleDateString()}</span></div>
                            </div>
                            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                                <Button className="closeBtn" onClick={() => setIsClientModalOpen(false)}>Close</Button>
                            </div>
                        </div>
                    </Modal>
                )
            }
        </div >
    );
}