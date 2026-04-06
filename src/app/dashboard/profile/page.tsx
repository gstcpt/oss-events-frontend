"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect, useState, useRef } from "react";
import { getMyProfile, updateMyProfile } from "@/lib/api/user";
import { getProviderByUserId, createProvider, updateProvider, updateOpeningHours, updateExceptions } from "@/lib/api/providers";
import { uploadUserAvatar, uploadProviderLogo } from "@/lib/api/upload";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Shield, Mail, Phone, LogIn, CheckCircle, XCircle, Building, UserPlus, Edit, Eye, EyeOff, File, Camera, MapPin, Clock, Calendar as CalendarIcon, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import Textarea from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { getAllCountries, getGovernrateByCountryId, getMunicipalityByGovernrateId } from "@/lib/api/locations";
import { getAllCategories, getMainCategories } from "@/lib/api/categories";
import { Country, Governorate, Municipality } from "@/types/locations";
import { Category } from "@/types/categories";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LeafletMapPicker from "@/components/ui/LeafletMapPicker";
import { useTranslations } from "next-intl";

const TabButton = ({ tabName, label, icon, activeTab, setActiveTab }: {
    tabName: string;
    label: string;
    icon: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
}) => (<Button onClick={() => setActiveTab(tabName)} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium w-full text-left transition-colors ${activeTab === tabName ? "normalBtn" : "closeBtn"}`}>{icon} <span>{label}</span></Button>);
const ProfileDetail = ({ icon, label, value, name, isEditing, handleInputChange, disabled = false, type = "text" }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    name: string;
    isEditing: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    disabled?: boolean;
    type?: string;
}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
        <div className="flex items-center text-sm font-semibold text-gray-600">{icon} <span className="ml-2">{label}</span></div>
        <div className="md:col-span-2">{isEditing ? (type === "textarea" ? (<Textarea name={name} value={value} onChange={handleInputChange} className="w-full" disabled={disabled} />) : (<Input type={type} name={name} value={value} onChange={handleInputChange} className="w-full" disabled={disabled} />)) : (<span className="text-gray-800">{value}</span>)}</div>
    </div>
);
const ProfileSelect = ({ icon, label, value, onValueChange, isEditing, disabled = false, options, placeholder, name }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    onValueChange: (name: string, value: string) => void;
    isEditing: boolean;
    disabled?: boolean;
    options: { id: any; name: string }[];
    placeholder: string;
    name: string;
}) => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
        <div className="flex items-center text-sm font-semibold text-gray-600">{icon} <span className="ml-2">{label}</span></div>
        <div className="md:col-span-2">
            {isEditing ? (
                <Select onValueChange={(val) => onValueChange(name, val)} value={String(value || '')} disabled={disabled}>
                    <SelectTrigger className="w-full"><SelectValue placeholder={placeholder} /></SelectTrigger>
                    <SelectContent>{options.map((option) => (<SelectItem key={option.id} value={String(option.id)}>{option.name}</SelectItem>))}</SelectContent>
                </Select>
            ) : (<span className="text-gray-800">{options.find(o => String(o.id) === String(value))?.name || 'N/A'}</span>)}
        </div>
    </div>
);
const Profile = () => {
    const t = useTranslations('Dashboard.profile');
    const { user, setUser } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<any>(null);
    const [providerData, setProviderData] = useState<any>({ country_id: "", governorate_id: "", municipality_id: "", map_coordinates: null });
    const [activeTab, setActiveTab] = useState("personal");
    const [passwordData, setPasswordData] = useState({ newPassword: "", confirmPassword: "" });
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const avatarFileRef = useRef<HTMLInputElement>(null);
    const logoFileRef = useRef<HTMLInputElement>(null);
    const [countries, setCountries] = useState<Country[]>([]);
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);

    // Schedule State
    const [openingHours, setOpeningHours] = useState<any[]>([]);
    const [exceptions, setExceptions] = useState<any[]>([]);
    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    useEffect(() => {
        if (user) {
            getMyProfile(user.id).then((profile) => {
                setFormData(profile);
                if (profile.roles.title === "Provider") {
                    getProviderByUserId(profile.id, user).then((providerInfo) => {
                        if (providerInfo) {
                            const formattedProviderInfo = {
                                ...providerInfo,
                                country_id: providerInfo.country_id || "",
                                governorate_id: providerInfo.governorate_id || "",
                                municipality_id: providerInfo.municipality_id || "",
                                map_coordinates: providerInfo.map_location ?
                                    (() => {
                                        try {
                                            const coords = providerInfo.map_location.split(',').map(Number);
                                            return coords.length === 2 ? { lat: coords[0], lng: coords[1] } : null;
                                        } catch { return null; }
                                    })() : null,
                                payment_en_especes: providerInfo.payment_en_especes === 1 || providerInfo.payment_en_especes === '1',
                                payment_virement: providerInfo.payment_virement === 1 || providerInfo.payment_virement === '1',
                                payment_par_cheque: providerInfo.payment_par_cheque === 1 || providerInfo.payment_par_cheque === '1'
                            };
                            setProviderData(formattedProviderInfo);

                            // Process Opening Hours
                            const processedHours = Array.from({ length: 7 }, (_, i) => {
                                const existing = providerInfo.provider_opening_hour?.find((h: any) => h.dayOfWeek === i);
                                return existing ? {
                                    ...existing,
                                    startTime: new Date(existing.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
                                    endTime: new Date(existing.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
                                } : {
                                    dayOfWeek: i,
                                    startTime: "09:00",
                                    endTime: "17:00",
                                    isActive: false
                                };
                            });
                            setOpeningHours(processedHours);

                            // Process Exceptions
                            const processedExceptions = (providerInfo.provider_opening_exception || []).map((ex: any) => ({
                                ...ex,
                                date: new Date(ex.date).toISOString().split('T')[0],
                                startTime: ex.startTime ? new Date(ex.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : "",
                                endTime: ex.endTime ? new Date(ex.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ""
                            }));
                            setExceptions(processedExceptions);

                        } else { setIsEditing(true); }
                    }).catch(() => {
                        toast.error("Failed to fetch provider info. Please complete your profile.");
                        setIsEditing(true);
                    });
                }
            }).catch(() => { toast.error("Failed to fetch profile. Please try again."); });
        }
    }, [user]);
    useEffect(() => {
        getAllCountries().then(setCountries).catch(() => toast.error("Failed to fetch countries."));
        getMainCategories().then(setCategories).catch(() => toast.error("Failed to fetch categories."));
    }, []);
    useEffect(() => { if (providerData?.country_id) { getGovernrateByCountryId(providerData.country_id).then(setGovernorates).catch(() => toast.error("Failed to fetch governorates.")); } else { setGovernorates([]); } }, [providerData?.country_id]);
    useEffect(() => { if (providerData?.governorate_id) { getMunicipalityByGovernrateId(providerData.governorate_id).then(setMunicipalities).catch(() => toast.error("Failed to fetch municipalities.")); } else { setMunicipalities([]); } }, [providerData?.governorate_id]);
    if (!user || !formData) { return (<div className="flex items-center justify-center h-screen"><div className="text-lg font-semibold">Loading...</div></div>); }
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    const handleProviderInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setProviderData({ ...providerData, [name]: value });
    };
    const handleProviderSelectChange = (name: string, value: string) => {
        const updates: any = { [name]: value };
        if (name === 'country_id') {
            updates.governorate_id = "";
            updates.municipality_id = "";
            setGovernorates([]);
            setMunicipalities([]);
        }
        if (name === 'governorate_id') {
            updates.municipality_id = "";
            setMunicipalities([]);
        }
        setProviderData((prev: any) => ({ ...prev, ...updates }));
    };
    const handleMapLocationSelect = (location: { lat: number; lng: number }) => { setProviderData((prev: any) => ({ ...prev, map_coordinates: location, map_location: `${location.lat},${location.lng}` })); };
    const handleCheckboxChange = (name: string, checked: boolean) => { setProviderData({ ...providerData, [name]: checked }); };
    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            toast.error("Only image files are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }
        try {
            const avatarFormData = new FormData();
            avatarFormData.append('avatar', file);
            const response = await uploadUserAvatar(avatarFormData, user);
            if (formData) {
                const updatedFormData = { ...formData, avatar: response.url };
                setFormData(updatedFormData);
                setUser(updatedFormData);
            }
            toast.success("Avatar updated successfully!");
        } catch (error) { toast.error("Failed to upload avatar"); }
    };
    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !e.target.files[0]) return;
        const file = e.target.files[0];
        if (!file.type.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            toast.error("Only image files are allowed");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            toast.error("File size must be less than 5MB");
            return;
        }
        try {
            const formData = new FormData();
            formData.append('logo', file);
            const response = await uploadProviderLogo(formData, user);
            const updatedProviderData = { ...providerData, logo: response.url };
            setProviderData(updatedProviderData);
            toast.success("Logo updated successfully!");
        } catch (error) { toast.error("Failed to upload logo"); }
    };
    const triggerAvatarUpload = () => { avatarFileRef.current?.click(); };
    const triggerLogoUpload = () => { logoFileRef.current?.click(); };
    const handleProfileUpdate = async () => {
        if (!formData) return;
        try {
            const personalFields = ['firstname', 'midname', 'lastname', 'username', 'email', 'phone'];
            const personalData: any = {};
            personalFields.forEach(field => { if (formData[field] !== undefined) { personalData[field] = formData[field]; } });
            if (formData.avatar && formData.avatar.startsWith('/images/users/')) { personalData.avatar = formData.avatar; }
            const updatedUser = await updateMyProfile(user, personalData);
            setUser(updatedUser);
            setFormData(updatedUser);
            setIsEditing(false);
            toast.success("Personal details updated successfully!");
        } catch (error) { toast.error("Failed to update personal details. Please try again."); }
    };
    const handleProviderUpdate = async () => {
        if (!formData) return;
        try {
            const basePayload: any = {
                user_id: formData.id,
                ste_title: providerData.ste_title || '',
                category_id: providerData.category_id ? parseInt(providerData.category_id, 10) : null,
                tarification: providerData.tarification || '',
                logo: providerData.logo || '/images/default.jpg',
                type_provider: providerData.type_provider || 1,
                experience: providerData.experience || '',
                foudation_date: providerData.foudation_date || null,
                email: providerData.email || formData.email,
                phone_number: providerData.phone_number || formData.phone,
                whatsapp: providerData.whatsapp || '',
                fix_phone: providerData.fix_phone || '',
                fax: providerData.fax || '',
                street: providerData.street || '',
                department: providerData.department || '',
                map_location: providerData.map_location || '',
                website: providerData.website || '',
                facebook: providerData.facebook || '',
                instagram: providerData.instagram || '',
                tiktok: providerData.tiktok || '',
                youtube: providerData.youtube || '',
                about: providerData.about || '',
                policy: providerData.policy || '',
                payment_en_especes: providerData.payment_en_especes ? 1 : 0,
                payment_virement: providerData.payment_virement ? 1 : 0,
                payment_par_cheque: providerData.payment_par_cheque ? 1 : 0,
                country_id: providerData.country_id ? parseInt(providerData.country_id, 10) : null,
                governorate_id: providerData.governorate_id ? parseInt(providerData.governorate_id, 10) : null,
                municipality_id: providerData.municipality_id ? parseInt(providerData.municipality_id, 10) : null
            };
            if (!providerData?.id) {
                await createProvider(basePayload, user);
                toast.success("Provider information created successfully!");
            } else {
                await updateProvider(providerData.id, basePayload, user);
                toast.success("Provider information updated successfully!");
            }
            setIsEditing(false);
            if (user) {
                getMyProfile(user.id).then((profile) => {
                    setFormData(profile);
                    if (profile.roles?.title === "Provider") {
                        getProviderByUserId(profile.id, user).then((providerInfo) => {
                            if (providerInfo) {
                                const formattedProviderInfo = {
                                    ...providerInfo,
                                    country_id: providerInfo.country_id || "",
                                    governorate_id: providerInfo.governorate_id || "",
                                    municipality_id: providerInfo.municipality_id || "",
                                    map_coordinates: providerInfo.map_location ?
                                        (() => {
                                            try {
                                                const coords = providerInfo.map_location.split(',').map(Number);
                                                return coords.length === 2 ? { lat: coords[0], lng: coords[1] } : null;
                                            } catch { return null; }
                                        })() : null,
                                    payment_en_especes: providerInfo.payment_en_especes === 1 || providerInfo.payment_en_especes === '1',
                                    payment_virement: providerInfo.payment_virement === 1 || providerInfo.payment_virement === '1',
                                    payment_par_cheque: providerInfo.payment_par_cheque === 1 || providerInfo.payment_par_cheque === '1'
                                };
                                setProviderData(formattedProviderInfo);
                            }
                        });
                    }
                });
            }
        } catch (error: any) { toast.error(`Failed to save provider information: ${error.message || 'Please try again.'}`); }
    };
    const handleScheduleSave = async () => {
        if (!providerData?.id) return;
        try {
            // Prepare Hours
            const hoursPayload = openingHours.map(h => {
                const now = new Date();
                const startParts = h.startTime.split(':');
                const endParts = h.endTime.split(':');
                const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(startParts[0]), parseInt(startParts[1]));
                const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), parseInt(endParts[0]), parseInt(endParts[1]));
                return {
                    dayOfWeek: h.dayOfWeek,
                    startTime: startDate.toISOString(),
                    endTime: endDate.toISOString(),
                    isActive: h.isActive
                };
            });

            // Prepare Exceptions
            const exceptionsPayload = exceptions.map(e => {
                const date = new Date(e.date);
                let startDate = null;
                let endDate = null;
                if (e.startTime) {
                    const startParts = e.startTime.split(':');
                    startDate = new Date(date);
                    startDate.setHours(parseInt(startParts[0]), parseInt(startParts[1]));
                }
                if (e.endTime) {
                    const endParts = e.endTime.split(':');
                    endDate = new Date(date);
                    endDate.setHours(parseInt(endParts[0]), parseInt(endParts[1]));
                }

                return {
                    date: date.toISOString(),
                    startTime: startDate ? startDate.toISOString() : null,
                    endTime: endDate ? endDate.toISOString() : null,
                    isClosed: e.isClosed,
                    note: e.note
                };
            });

            await updateOpeningHours(providerData.id, hoursPayload);
            await updateExceptions(providerData.id, exceptionsPayload);
            toast.success("Schedule updated successfully!");
        } catch (error: any) {
            toast.error("Failed to update schedule: " + error.message);
        }
    };

    const handleSave = async () => { if (activeTab === 'personal') { await handleProfileUpdate(); } else if (activeTab === 'provider' && isProvider) { await handleProviderUpdate(); } else if (activeTab === 'security') { await handlePasswordSave(); } else if (activeTab === 'schedule' && isProvider) { await handleScheduleSave(); } };

    // Schedule Handlers
    const handleHourChange = (index: number, field: string, value: any) => {
        const newHours = [...openingHours];
        newHours[index][field] = value;
        setOpeningHours(newHours);
    };

    const addException = () => {
        setExceptions([...exceptions, { date: new Date().toISOString().split('T')[0], startTime: "", endTime: "", isClosed: true, note: "" }]);
    };

    const removeException = (index: number) => {
        const newExceptions = [...exceptions];
        newExceptions.splice(index, 1);
        setExceptions(newExceptions);
    };

    const handleExceptionChange = (index: number, field: string, value: any) => {
        const newExceptions = [...exceptions];
        newExceptions[index][field] = value;
        setExceptions(newExceptions);
    };

    const handlePasswordSave = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }
        if (passwordData.newPassword.length < 8) {
            toast.error("Password must be at least 8 characters long.");
            return;
        }
        try {
            await updateMyProfile(user, { password: passwordData.newPassword });
            setPasswordData({ newPassword: "", confirmPassword: "" });
            toast.success("Password updated successfully!");
        } catch (error) { toast.error("Failed to update password. Please try again."); }
    };
    const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData({ ...passwordData, [name]: value });
    };
    const isRoot = formData.roles?.title === 'Root';
    const isProvider = formData.roles?.title === 'Provider';
    return (
        <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Profile Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your personal and security settings.</p>
                </header>
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <aside className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center">
                            <div className="relative">
                                <Avatar className="w-28 h-28 mb-4 border-4 border-gray-800">
                                    <AvatarImage src={formData.avatar || "/avatar.png"} />
                                    <AvatarFallback className="font-bold text-4xl text-gray-800">{formData.firstname?.[0]}{formData.lastname?.[0]}</AvatarFallback>
                                </Avatar>
                                <Button type="button" onClick={triggerAvatarUpload} className="absolute bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-8 h-8 p-0"><Camera size={16} /></Button>
                                <input ref={avatarFileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                            </div>
                            <h2 className="text-xl font-bold text-gray-800">{formData.firstname} {formData.lastname}</h2>
                            <p className="text-gray-500 text-sm">{formData.email}</p>
                        </div>
                        <div className="bg-white rounded-xl shadow-md p-4 mt-6 space-y-2 items-center text-center">
                            <p className={`text-sm font-semibold mt-2 ${formData.status == 1 ? "text-green-600" : "text-red-600"}`}>Status: {formData.status == 1 ? 'Active' : 'Inactive'}</p>
                            <p className="text-gray-600 text-sm font-semibold mt-2">Role: {formData.roles?.title}</p>
                        </div>
                        <nav className="bg-white rounded-xl shadow-md p-4 mt-6 space-y-2">
                            <TabButton tabName="personal" label="Personal Details" icon={<User size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
                            {isProvider && <TabButton tabName="provider" label="Provider Details" icon={<Building size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />}
                            {isProvider && <TabButton tabName="schedule" label="Schedule" icon={<Clock size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />}
                            <TabButton tabName="security" label="Security" icon={<Shield size={20} />} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </nav>
                    </aside>
                    <main className="lg:col-span-3">
                        <div className="bg-white rounded-xl shadow-md">
                            {activeTab === "personal" && (
                                <div className="p-6 sm:p-8">
                                    <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-gray-800">Personal Information</h3>{!isEditing && (<Button className="updateBtn" onClick={() => setIsEditing(true)}><i className="fas fa-edit mr-2"></i>Update</Button>)}</div>
                                    <div className="space-y-4">
                                        <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="First Name" name="firstname" value={formData.firstname || ""} isEditing={isEditing} handleInputChange={handleInputChange} />
                                        <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Middle Name" name="midname" value={formData.midname || ""} isEditing={isEditing} handleInputChange={handleInputChange} />
                                        <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Last Name" name="lastname" value={formData.lastname || ""} isEditing={isEditing} handleInputChange={handleInputChange} />
                                        <ProfileDetail icon={<UserPlus size={18} className="text-gray-500" />} label="Username" name="username" value={formData.username || ""} isEditing={isEditing} handleInputChange={handleInputChange} />
                                        <ProfileDetail icon={<Mail size={18} className="text-gray-500" />} label="Email" name="email" value={formData.email} isEditing={isEditing} handleInputChange={handleInputChange} />
                                        <ProfileDetail icon={<Phone size={18} className="text-gray-500" />} label="Phone Number" name="phone" value={formData.phone || ""} isEditing={isEditing} handleInputChange={handleInputChange} />
                                        <ProfileDetail icon={<Building size={18} className="text-gray-500" />} label="Company" name="company" value={formData.companies_user?.title || "N/A"} isEditing={isEditing} handleInputChange={handleInputChange} disabled={!isRoot} />
                                        <ProfileDetail icon={<Shield size={18} className="text-gray-500" />} label="Role" name="role" value={formData.roles?.title || "N/A"} isEditing={isEditing} handleInputChange={handleInputChange} disabled={!isRoot} />
                                    </div>
                                    {isEditing && (
                                        <div className="mt-8 flex justify-end gap-4">
                                            <Button className="updateBtn" onClick={handleSave}>Update</Button>
                                            <Button className="closeBtn" variant="outline" onClick={() => { setIsEditing(false); if (user) { getMyProfile(user.id).then(setFormData); } }}>Close</Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "provider" && isProvider && (
                                <div className="p-6 sm:p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Provider Information</h3>
                                        {!isEditing && (<Button className="updateBtn" onClick={() => setIsEditing(true)}><i className="fas fa-edit mr-2"></i>Update</Button>)}
                                    </div>
                                    <div className="space-y-6">
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">Logo</h4>
                                            <div className="flex items-center gap-4">
                                                <div className="relative">
                                                    <img src={providerData.logo || "/images/default.jpg"} alt="Provider Logo" className="w-24 h-24 object-cover rounded-lg border" />
                                                    {isEditing && (<Button type="button" onClick={triggerLogoUpload} className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white rounded-full w-6 h-6 p-0"><Camera size={12} /></Button>)}
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-600">Upload your company logo</p>
                                                    <p className="text-xs text-gray-500">Max size: 5MB</p>
                                                </div>
                                                <input ref={logoFileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">General</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Society Title" name="ste_title" value={providerData?.ste_title || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                {isEditing ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                        <div className="flex items-center text-sm font-semibold text-gray-600"><Shield size={18} className="text-gray-500" /><span className="ml-2">Category</span></div>
                                                        <div className="md:col-span-2">
                                                            <Select value={String(providerData.category_id || '')} onValueChange={(value) => handleProviderSelectChange("category_id", value)} disabled={providerData.category_id ? true : false}>
                                                                <SelectTrigger id="category"><SelectValue placeholder="Select a category" /></SelectTrigger>
                                                                <SelectContent>{categories.map((category) => (<SelectItem key={category.id} value={`${category.id}`}>{category.title}</SelectItem>))}</SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                        <div className="flex items-center text-sm font-semibold text-gray-600"><Shield size={18} className="text-gray-500" /><span className="ml-2">Category</span></div>
                                                        <div className="md:col-span-2"><span className="text-gray-800">{categories.find(c => String(c.id) === String(providerData.category_id))?.title || 'Not set'}</span></div>
                                                    </div>
                                                )}
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Tarification" name="tarification" value={providerData?.tarification || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Experience" name="experience" value={providerData?.experience || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Foundation Date" name="foudation_date" value={providerData?.foudation_date ? new Date(providerData.foudation_date).toISOString().split('T')[0] : ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} type="date" />
                                                {isEditing ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                        <div className="flex items-center text-sm font-semibold text-gray-600"><File size={18} className="text-gray-500" /><span className="ml-2">Account Type</span></div>
                                                        <div className="md:col-span-2">
                                                            <Select value={String(providerData?.type_provider || '')} onValueChange={(value) => handleProviderSelectChange("type_provider", value)}>
                                                                <SelectTrigger id="type_provider"><SelectValue placeholder="Select a account type" /></SelectTrigger>
                                                                <SelectContent><SelectItem value="1">Individual</SelectItem><SelectItem value="2">Company</SelectItem></SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                                                        <div className="flex items-center text-sm font-semibold text-gray-600"><File size={18} className="text-gray-500" /><span className="ml-2">Account Type</span></div>
                                                        <div className="md:col-span-2"><span className="text-gray-800">{providerData?.type_provider ? (providerData?.type_provider === 1 ? 'Individual' : 'Company') : 'Not set'}</span></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">Contact</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <ProfileDetail icon={<Mail size={18} className="text-gray-500" />} label="Email" name="email" value={providerData?.email || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<Phone size={18} className="text-gray-500" />} label="Phone Number" name="phone_number" value={providerData?.phone_number || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<Phone size={18} className="text-gray-500" />} label="WhatsApp" name="whatsapp" value={providerData?.whatsapp || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<Phone size={18} className="text-gray-500" />} label="Fix Phone" name="fix_phone" value={providerData?.fix_phone || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<Phone size={18} className="text-gray-500" />} label="Fax" name="fax" value={providerData?.fax || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">Address</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2 relative z-0"><LeafletMapPicker onPick={handleMapLocationSelect} initial={providerData.map_coordinates || undefined} /></div>
                                                {providerData?.map_location && !isEditing && (
                                                    <div className="md:col-span-2">
                                                        <div className="flex items-center text-sm font-semibold text-gray-600 mb-2">
                                                            <MapPin size={18} className="text-gray-500" /><span className="ml-2 mr-2">Selected Location</span><span className="text-gray-800">Lat: {providerData.map_coordinates?.lat?.toFixed(6)}, Lng: {providerData.map_coordinates?.lng?.toFixed(6)}</span>
                                                        </div>
                                                    </div>
                                                )}
                                                <ProfileSelect icon={<Building size={18} className="text-gray-500" />} label="Country" name="country_id" value={providerData?.country_id} onValueChange={handleProviderSelectChange} isEditing={isEditing} options={countries} placeholder="Select a country" />
                                                <ProfileSelect icon={<Building size={18} className="text-gray-500" />} label="Governorate" name="governorate_id" value={providerData?.governorate_id} onValueChange={handleProviderSelectChange} isEditing={isEditing} options={governorates} placeholder="Select a governorate" disabled={!providerData?.country_id || governorates.length === 0} />
                                                <ProfileSelect icon={<Building size={18} className="text-gray-500" />} label="Municipality" name="municipality_id" value={providerData?.municipality_id} onValueChange={handleProviderSelectChange} isEditing={isEditing} options={municipalities} placeholder="Select a municipality" disabled={!providerData?.governorate_id || municipalities.length === 0} />
                                                <ProfileDetail icon={<Building size={18} className="text-gray-500" />} label="Street" name="street" value={providerData?.street || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<Building size={18} className="text-gray-500" />} label="Department" name="department" value={providerData?.department || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">Social Media</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Website" name="website" value={providerData?.website || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Facebook" name="facebook" value={providerData?.facebook || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Instagram" name="instagram" value={providerData?.instagram || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="TikTok" name="tiktok" value={providerData?.tiktok || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Youtube" name="youtube" value={providerData?.youtube || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} />
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">Details</h4>
                                            <div className="space-y-4">
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="About" name="about" value={providerData?.about || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} type="textarea" />
                                                <ProfileDetail icon={<User size={18} className="text-gray-500" />} label="Policy" name="policy" value={providerData?.policy || ""} isEditing={isEditing} handleInputChange={handleProviderInputChange} type="textarea" />
                                            </div>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <h4 className="font-semibold text-gray-700 mb-4">Payment Methods</h4>
                                            <div className="flex flex-col md:flex-row md:space-x-4">
                                                <div className="flex items-center space-x-2 col">
                                                    <Checkbox id="payment_en_especes" checked={providerData?.payment_en_especes || false} onCheckedChange={(checked) => handleCheckboxChange("payment_en_especes", !!checked)} disabled={!isEditing} />
                                                    <label htmlFor="payment_en_especes" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment in cash</label>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-2 col">
                                                    <Checkbox id="payment_virement" checked={providerData?.payment_virement || false} onCheckedChange={(checked) => handleCheckboxChange("payment_virement", !!checked)} disabled={!isEditing} />
                                                    <label htmlFor="payment_virement" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment by transfer</label>
                                                </div>
                                                <div className="flex items-center space-x-2 mt-2 col">
                                                    <Checkbox id="payment_par_cheque" checked={providerData?.payment_par_cheque || false} onCheckedChange={(checked) => handleCheckboxChange("payment_par_cheque", !!checked)} disabled={!isEditing} />
                                                    <label htmlFor="payment_par_cheque" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Payment by check</label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {isEditing && (
                                        <div className="mt-8 flex justify-end gap-4">
                                            <Button className="updateBtn" onClick={handleSave}>Update</Button>
                                            <Button className="closeBtn" variant="outline" onClick={() => {
                                                setIsEditing(false);
                                                if (user) {
                                                    getMyProfile(user.id).then((profile) => {
                                                        setFormData(profile);
                                                        if (profile.roles.title === "Provider") {
                                                            getProviderByUserId(profile.id, user).then((providerInfo) => {
                                                                if (providerInfo) {
                                                                    const formattedProviderInfo = {
                                                                        ...providerInfo,
                                                                        country_id: providerInfo.country_id || "",
                                                                        governorate_id: providerInfo.governorate_id || "",
                                                                        municipality_id: providerInfo.municipality_id || "",
                                                                        map_coordinates: providerInfo.map_location ?
                                                                            (() => {
                                                                                try {
                                                                                    const coords = providerInfo.map_location.split(',').map(Number);
                                                                                    return coords.length === 2 ? { lat: coords[0], lng: coords[1] } : null;
                                                                                } catch { return null; }
                                                                            })() : null,
                                                                        payment_en_especes: providerInfo.payment_en_especes === 1 || providerInfo.payment_en_especes === '1',
                                                                        payment_virement: providerInfo.payment_virement === 1 || providerInfo.payment_virement === '1',
                                                                        payment_par_cheque: providerInfo.payment_par_cheque === 1 || providerInfo.payment_par_cheque === '1'
                                                                    };
                                                                    setProviderData(formattedProviderInfo);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }
                                            }}
                                            >
                                                Close
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                            {activeTab === "schedule" && isProvider && (
                                <div className="p-6 sm:p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h3 className="text-xl font-bold text-gray-800">Opening Hours & Exceptions</h3>
                                        <Button className="updateBtn" onClick={handleScheduleSave}>Save Schedule</Button>
                                    </div>

                                    <div className="space-y-8">
                                        {/* Weekly Hours */}
                                        <div className="border rounded-lg p-4">
                                            <h4 className="font-semibold text-gray-700 mb-4 flex items-center"><Clock size={16} className="mr-2" /> Weekly Schedule</h4>
                                            <div className="space-y-2">
                                                {openingHours.map((hour, index) => (
                                                    <div key={index} className="grid grid-cols-12 gap-2 items-center border-b pb-2 last:border-0">
                                                        <div className="col-span-3 sm:col-span-2">
                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`day-${index}`}
                                                                    checked={hour.isActive}
                                                                    onCheckedChange={(checked) => handleHourChange(index, 'isActive', checked)}
                                                                />
                                                                <label htmlFor={`day-${index}`} className="text-sm font-medium">{daysOfWeek[hour.dayOfWeek]}</label>
                                                            </div>
                                                        </div>
                                                        <div className="col-span-9 sm:col-span-10 flex gap-2 items-center">
                                                            {hour.isActive ? (
                                                                <>
                                                                    <Input type="time" value={hour.startTime} onChange={(e) => handleHourChange(index, 'startTime', e.target.value)} className="w-30 h-8 text-sm" />
                                                                    <span>-</span>
                                                                    <Input type="time" value={hour.endTime} onChange={(e) => handleHourChange(index, 'endTime', e.target.value)} className="w-30 h-8 text-sm" />
                                                                </>
                                                            ) : (
                                                                <span className="text-sm text-gray-400 italic">Closed</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Exceptions */}
                                        <div className="border rounded-lg p-4">
                                            <div className="flex justify-between items-center mb-4">
                                                <h4 className="font-semibold text-gray-700 flex items-center"><CalendarIcon size={16} className="mr-2" /> Exceptions & Holidays</h4>
                                                <Button size="sm" variant="outline" onClick={addException} className="flex items-center gap-1"><Plus size={14} /> Add Exception</Button>
                                            </div>

                                            <div className="space-y-3">
                                                {exceptions.length === 0 && <p className="text-sm text-gray-500 italic">No exceptions added.</p>}
                                                {exceptions.map((ex, index) => (
                                                    <div key={index} className="bg-gray-50 p-3 rounded-md border relative">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="absolute top-1 right-1 h-6 w-6 text-red-500 hover:bg-red-50 hover:text-red-700"
                                                            onClick={() => removeException(index)}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                            <div>
                                                                <label className="text-xs font-semibold text-gray-600 block mb-1">Date</label>
                                                                <Input
                                                                    type="date"
                                                                    value={ex.date}
                                                                    onChange={(e) => handleExceptionChange(index, 'date', e.target.value)}
                                                                    className="h-8 text-sm bg-white"
                                                                />
                                                            </div>
                                                            <div className="flex items-center space-x-2 pt-6">
                                                                <Checkbox
                                                                    id={`closed-${index}`}
                                                                    checked={ex.isClosed}
                                                                    onCheckedChange={(checked) => handleExceptionChange(index, 'isClosed', checked)}
                                                                />
                                                                <label htmlFor={`closed-${index}`} className="text-sm font-medium">Closed all day</label>
                                                            </div>

                                                            {!ex.isClosed && (
                                                                <div className="md:col-span-2 flex gap-2 items-center">
                                                                    <div className="flex-1">
                                                                        <label className="text-xs font-semibold text-gray-600 block mb-1">Start Time</label>
                                                                        <Input
                                                                            type="time"
                                                                            value={ex.startTime}
                                                                            onChange={(e) => handleExceptionChange(index, 'startTime', e.target.value)}
                                                                            className="h-8 text-sm bg-white"
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1">
                                                                        <label className="text-xs font-semibold text-gray-600 block mb-1">End Time</label>
                                                                        <Input
                                                                            type="time"
                                                                            value={ex.endTime}
                                                                            onChange={(e) => handleExceptionChange(index, 'endTime', e.target.value)}
                                                                            className="h-8 text-sm bg-white"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            )}

                                                            <div className="md:col-span-2">
                                                                <label className="text-xs font-semibold text-gray-600 block mb-1">Note (Optional)</label>
                                                                <Input
                                                                    type="text"
                                                                    value={ex.note || ""}
                                                                    onChange={(e) => handleExceptionChange(index, 'note', e.target.value)}
                                                                    placeholder="e.g. National Holiday"
                                                                    className="h-8 text-sm bg-white"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {activeTab === "security" && (
                                <div className="p-6 sm:p-8">
                                    <h3 className="text-xl font-bold text-gray-800 mb-6">Security Settings</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">Account Status</h4>
                                            <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center">
                                                        {formData.email_verified ? (<CheckCircle size={18} className="text-green-500" />) : (<XCircle size={18} className="text-red-500" />)}
                                                        <span className="ml-2 text-sm text-gray-600">Email Verified</span>
                                                    </div>
                                                    <span className={`font-semibold text-sm ${formData.email_verified ? "text-green-600" : "text-red-600"}`}>{formData.email_verified ? "Verified" : "Not Verified"}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-gray-700 mb-3">Change Password</h4>
                                            <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                                                <div className="grid grid-cols-1 gap-2">
                                                    <label htmlFor="newPassword" className="text-sm font-medium text-gray-600">New Password</label>
                                                    <div className="relative">
                                                        <Input id="newPassword" type={showNewPassword ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handlePasswordInputChange} placeholder="Enter new password" className="pr-10" />
                                                        <Button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 closeBtn">{showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}</Button>
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-1 gap-2">
                                                    <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-600">Confirm New Password</label>
                                                    <div className="relative">
                                                        <Input id="confirmPassword" type={showConfirmPassword ? "text" : "password"} name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordInputChange} placeholder="Confirm new password" className="pr-10" />
                                                        <Button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 closeBtn">{showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}</Button>
                                                    </div>
                                                </div>
                                                <div className="flex justify-end"><Button className="updateBtn" onClick={handlePasswordSave} size="sm">Update</Button></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
};
export default Profile;