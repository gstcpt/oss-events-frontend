"use client";
import { useAuth } from "@/context/AuthContext";
import { JSX, useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import { getAllCompanies, getCompanyById } from "@/lib/api/companies";
import { Item, ItemMedia } from "@/types/items";
import { getAllItems, createItem, updateItem, deleteItem, deleteItemMedia, getInteractionStats, getItemMediaByItemId, createItemMedia, getItem } from "@/lib/api/items";
import { getProvidersByCompany } from "@/lib/api/user";
import { getAllCategories, getCategoriesByCompany, getCategoryById } from "@/lib/api/categories";
import { Form, formLines, formLineOptions } from "@/types/forms";
import { getForm, getForms } from "@/lib/api/forms";
import { Tag, TagOptions } from "@/types/tags";
import { getComments, deleteComment, patchComment } from "@/lib/api/comments";
import { getProviderByUserId } from "@/lib/api/providers";
import DataTable from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import DisplayIcon from "@/components/ui/DisplayIcon";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Textarea from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import dynamic from "next/dynamic";
const LeafletMapPicker = dynamic(() => import("@/components/ui/LeafletMapPicker"), { ssr: false, loading: () => <div className="h-64 bg-slate-100 animate-pulse rounded-lg" /> });
import { Camera, File, FileText, Star, Text, Eye, Share2, ThumbsUp, ThumbsDown, MessageCircle, Trash2, Clock, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";

interface WizardFormLine extends formLines {
    tag_options?: formLineOptions[];
    unit?: string;
    tag?: Tag;
}

export default function Items() {
    const t = useTranslations('Dashboard.items');
    const { user } = useAuth();
    const [items, setItems] = useState<Item[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [isEditing, setIsEditing] = useState(false);
    const [newItemData, setNewItemData] = useState<any>({
        title: "",
        description: "",
        price_ht: 0.001,
        company_id: null,
        provider_id: null,
        category_id: null,
        form_id: null,
        code: "",
        hero_image: null,
        cover_image: null,
        gallery_images: [],
        document_files: [],
        video_files: [],
        form_values: {},
        status: 0, // Default to Under Verification
    });
    const [companies, setCompanies] = useState<any[]>([]);
    const [userCompany, setUserCompany] = useState<any>(null);
    const [providers, setProviders] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const formatCategoriesForSelect = (categories: any[]) => {
        const categoryMap = new Map(categories.map((c) => [c.id, { ...c, children: [] }]));
        const rootCategories: any[] = [];
        categories.forEach((c) => {
            if (c.head_category_id) {
                const parent = categoryMap.get(c.head_category_id);
                if (parent) { parent.children.push(categoryMap.get(c.id)); }
            } else { rootCategories.push(categoryMap.get(c.id)); }
        });
        const renderOptions = (cats: any[], depth = 0) => {
            let options: { label: string; value: string }[] = [];
            for (const category of cats) {
                if (category) {
                    options.push({ label: `${"--".repeat(depth)} ${category.title}`, value: category.id.toString() });
                    if (category.children && category.children.length > 0) { options = options.concat(renderOptions(category.children, depth + 1)); }
                }
            }
            return options;
        };
        return renderOptions(rootCategories);
    };
    const [forms, setForms] = useState<any[]>([]);
    const [formLines, setFormLines] = useState<WizardFormLine[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

    const [currentItem, setCurrentItem] = useState<Partial<Item> | null>(null);
    const [interactionStats, setInteractionStats] = useState<any>(null);
    const [itemComments, setItemComments] = useState<any[]>([]);
    const [itemMedia, setItemMedia] = useState<ItemMedia[]>([]);
    const [isCommentDeleteModalOpen, setIsCommentDeleteModalOpen] = useState(false);
    const [commentAction, setCommentAction] = useState<{ id: number; type: 'soft' | 'hard' | 'restore' } | null>(null);
    const [providerInfo, setProviderInfo] = useState<any>(null);
    const [loading, setLoading] = useState<boolean>(false);
    useEffect(() => {
        if (user?.role === "Provider") { return; }
        const fetchProviderInfo = async () => {
            if (newItemData.provider_id) {
                try {
                    const info = await getProviderByUserId(Number(newItemData.provider_id), user);
                    setProviderInfo(info);
                } catch (error) { setProviderInfo(null); }
            } else { setProviderInfo(null); }
        };
        fetchProviderInfo();
    }, [newItemData.provider_id, user]);
    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const itemsData = await getAllItems();
                setItems(itemsData);
                if (user?.role === "Root") {
                    const [formsData, companiesData] = await Promise.all([getForms(), getAllCompanies()]);
                    setForms(formsData);
                    setCompanies(companiesData);
                } else if (user?.company_id) {
                    const companyData = await getCompanyById(user.company_id);
                    setUserCompany(companyData);
                    if (user?.role === "Admin") {
                        const [formsData, providersData, categoriesData] = await Promise.all([getForms(), getProvidersByCompany(user.company_id), getCategoriesByCompany(user.company_id)]);
                        setForms(formsData);
                        setProviders(providersData);
                        setCategories(categoriesData);
                        setNewItemData((prev: any) => ({ ...prev, company_id: user.company_id }));
                    }
                    else if (user?.role === "Provider") {
                        try {
                            const providerInfo = await getProviderByUserId(user.id, user);
                            console.log(providerInfo);
                            if (providerInfo && providerInfo.category_id) {
                                const categoryData = await getCategoryById(providerInfo.category_id);
                                const allForms = await getForms();
                                const categoryForms = allForms.filter((form: any) => String(form.category_id) === String(providerInfo.category_id));
                                setCategories([categoryData]);
                                setForms(categoryForms);
                                if (categoryForms.length === 0) {
                                    toast.warning("No forms found for your category. Please contact admin.");
                                }
                                setNewItemData((prev: any) => ({ ...prev, company_id: user.company_id, category_id: providerInfo.category_id, provider_id: user.id, }));
                                setProviderInfo(providerInfo);
                                if (categoryForms.length === 1) { setNewItemData((prev: any) => ({ ...prev, form_id: categoryForms[0].id })); }
                            } else {
                                toast.error("Provider has no category assigned. Please contact admin.");
                            }
                        } catch (error) { toast.error(t('toastErrorProviderData')); }
                    }
                    else {
                        const [providersData, categoriesData] = await Promise.all([getProvidersByCompany(user.company_id), getCategoriesByCompany(user.company_id)]);
                        setProviders(providersData);
                        setCategories(categoriesData);
                        if (user?.role === "Admin") { setNewItemData((prev: any) => ({ ...prev, company_id: user.company_id })); }
                    }
                }
            } catch (error) { toast.error(t('toastErrorInitialData')); }
        };
        if (user) { fetchInitialData(); }
    }, [user]);
    useEffect(() => {
        if (newItemData.company_id) {
            const fetchCompanyData = async () => {
                try {
                    const [providersData, categoriesData] = await Promise.all([getProvidersByCompany(newItemData.company_id), getCategoriesByCompany(newItemData.company_id)]);
                    setProviders(providersData);
                    setCategories(categoriesData);
                    setNewItemData((prev: any) => ({ ...prev, category_id: isEditing ? prev.category_id : null, provider_id: isEditing ? prev.provider_id : null, form_id: isEditing ? prev.form_id : null }));
                } catch (error) { toast.error(t('toastErrorCompanyData')); }
            };
            fetchCompanyData();
        }
    }, [newItemData.company_id]);
    function buildTagOptionsMap(forms: any[]): Record<string, TagOptions> {
        const map: Record<string, TagOptions> = {};
        for (const form of forms) {
            if (form.form_lines) {
                for (const line of form.form_lines) {
                    if (line.form_line_options) {
                        for (const opt of line.form_line_options) {
                            if (opt.tagOptions && opt.tagOptions.id) { map[String(opt.tagOptions.id)] = opt.tagOptions; }
                            else if (opt.tag_option_id && opt.option_value) { map[String(opt.tag_option_id)] = { id: Number(opt.tag_option_id), tag_id: Number(line.tag_id), option_value: opt.option_value, }; }
                        }
                    }
                }
            }
        }
        return map;
    }
    useEffect(() => {
        async function fetchAndPatchFormLines() {
            if (newItemData.form_id) {
                try {
                    const form = await getForm(newItemData.form_id);
                    const patchedLines = (form.form_lines || []).map((line: any) => {
                        const formLineOptions = line.form_line_options || [];
                        const tagInfo = line.tags || (line.tag_id ? { id: line.tag_id, icon: line.icon } : undefined);
                        return { ...line, tag_options: formLineOptions, tag: tagInfo };
                    });
                    setFormLines(patchedLines);
                } catch (error) {
                    if (newItemData.category_id) {
                        const categoryIdStr = String(newItemData.category_id);
                        const categoryForms = forms.filter((form: any) => String(form.category_id) === categoryIdStr);
                        if (categoryForms.length > 0) {
                            const form = await getForm(categoryForms[0].id);
                            const patchedLines = (form.form_lines || []).map((line: any) => {
                                const formLineOptions = line.form_line_options || [];
                                const tagInfo = line.tags || (line.tag_id ? { id: line.tag_id, icon: line.icon } : undefined);
                                return { ...line, tag_options: formLineOptions, tag: tagInfo };
                            });
                            setFormLines(patchedLines);
                            setNewItemData((prev: any) => ({ ...prev, form_id: categoryForms[0].id }));
                        } else { setFormLines([]); }
                    } else { setFormLines([]); }
                }
            } else if (newItemData.category_id) {
                // If form_id is null but category_id is present, try to load lines for the first form of that category
                try {
                    const categoryIdStr = String(newItemData.category_id);
                    const categoryForms = forms.filter((form: any) => String(form.category_id) === categoryIdStr);
                    if (categoryForms.length > 0) {
                        const formToLoad = categoryForms[0];
                        const form = await getForm(formToLoad.id);
                        const patchedLines = (form.form_lines || []).map((line: any) => {
                            const formLineOptions = line.form_line_options || [];
                            const tagInfo = line.tags || (line.tag_id ? { id: line.tag_id, icon: line.icon } : undefined);
                            return { ...line, tag_options: formLineOptions, tag: tagInfo };
                        });
                        setFormLines(patchedLines);
                        // Automatically set the form_id if not already set
                        if (!newItemData.form_id) {
                            setNewItemData((prev: any) => ({ ...prev, form_id: formToLoad.id }));
                        }
                    } else {
                        setFormLines([]);
                    }
                } catch (error) {
                    setFormLines([]);
                }
            } else { setFormLines([]); }
        }
        fetchAndPatchFormLines();
    }, [newItemData.form_id, newItemData.category_id, forms]);
    useEffect(() => { }, [newItemData.category_id, newItemData.provider_id, newItemData.form_id, isEditing]);
    useEffect(() => { }, [forms, newItemData.category_id]);
    useEffect(() => {
        if (newItemData.category_id && forms.length > 0) {
            const categoryIdStr = String(newItemData.category_id);
            const categoryForms = forms.filter((form: any) => String(form.category_id) === categoryIdStr);
            if (categoryForms.length === 1 && !newItemData.form_id) { setNewItemData((prev: any) => ({ ...prev, form_id: categoryForms[0].id })); }
            else if (newItemData.form_id && categoryForms.length > 0) {
                const currentForm = forms.find((f: any) => f.id === newItemData.form_id);
                if (currentForm && String(currentForm.category_id) !== categoryIdStr) { if (categoryForms.length === 1) { setNewItemData((prev: any) => ({ ...prev, form_id: categoryForms[0].id })); } }
            }
        }
    }, [newItemData.category_id, forms, newItemData.form_id, isEditing]);
    const handleOpenModal = async (item: Partial<Item> | null = null) => {
        setRequiredFields([]); // Clear required fields
        if (item && item.id) {
            try {
                const fullItem = await getItem(Number(item.id));
                const itemAny = fullItem as any;
                const categoryId = itemAny.item_category && itemAny.item_category.length > 0 ? itemAny.item_category[0].category_id : itemAny.category_id || null;
                const providerName = itemAny.users ? `${itemAny.users.firstname || ''} ${itemAny.users.lastname || ''}`.trim() : '';
                setNewItemData((prev: any) => ({
                    ...prev,
                    title: fullItem.title || "",
                    description: itemAny.description || "",
                    price_ht: itemAny.price || 0,
                    company_id: itemAny.company_id || null,
                    provider_id: itemAny.provider_id || null,
                    category_id: categoryId,
                    form_id: itemAny.form_id || null,
                    code: itemAny.code || "",
                    hero_image: itemAny.image || null,
                    cover_image: itemAny.cover || null,
                    gallery_images: [],
                    document_files: [],
                    video_files: [],
                    form_values: itemAny.form_values || {},
                    status: itemAny.status || 0,
                    _provider_name: providerName
                }));
                setCurrentItem(fullItem);
                setIsEditing(true);
                const loadItemData = async () => {
                    try {
                        if (item.company_id) {
                            const [providersData, categoriesData] = await Promise.all([getProvidersByCompany(item.company_id), getCategoriesByCompany(item.company_id)]);
                            const formsData: any[] = await getForms();
                            setProviders(providersData);
                            setCategories(categoriesData);
                            setForms(formsData);
                        }
                        if (itemAny.provider_id) {
                            try {
                                const info = await getProviderByUserId(Number(itemAny.provider_id), user);
                                setProviderInfo(info);
                            } catch (error) { setProviderInfo(null); }
                        }
                        if (itemAny.form_item && itemAny.form_item.length > 0) {
                            const formId = itemAny.form_item[0].form_id;
                            setNewItemData((prev: any) => ({ ...prev, form_id: formId }));
                            const form = await getForm(formId);
                            const patchedLines = (form.form_lines || []).map((line: any) => {
                                const formLineOptions = line.form_line_options || [];
                                const tagInfo = line.tags || (line.tag_id ? { id: line.tag_id, icon: line.icon } : undefined);
                                return { ...line, tag_options: formLineOptions, tag: tagInfo };
                            });
                            setFormLines(patchedLines);
                            if (itemAny.form_values) { setNewItemData((prev: any) => ({ ...prev, form_values: itemAny.form_values })); }
                        } else if (itemAny.form_values) {
                            if (itemAny.form_id) {
                                setNewItemData((prev: any) => ({ ...prev, form_id: itemAny.form_id }));
                                const form = await getForm(itemAny.form_id);
                                const patchedLines = (form.form_lines || []).map((line: any) => {
                                    const formLineOptions = line.form_line_options || [];
                                    const tagInfo = line.tags || (line.tag_id ? { id: line.tag_id, icon: line.icon } : undefined);
                                    return { ...line, tag_options: formLineOptions, tag: tagInfo };
                                });
                                setFormLines(patchedLines);
                                setNewItemData((prev: any) => ({ ...prev, form_values: itemAny.form_values }));
                            }
                            else if (itemAny.item_sections && itemAny.item_sections.length > 0) {
                                const firstSection = itemAny.item_sections[0];
                                if (firstSection.form_linesId) {
                                    const formLineId = firstSection.form_linesId;
                                    setNewItemData((prev: any) => ({ ...prev, form_id: firstSection.form_linesId }));
                                }
                            }
                            if (itemAny.item_sections && itemAny.item_sections.length > 0) {
                                const extractedFormValues: Record<string, any> = {};
                                for (const section of itemAny.item_sections) {
                                    if (!section.form_linesId) continue;
                                    const formLineIdStr = section.form_linesId.toString();
                                    const type = section.formLines?.type;
                                    const sectionOptions = section.item_section_options || [];
                                    const selectedOptions = sectionOptions.filter((opt: any) => opt.selected === true);
                                    if (type === 'range') {
                                        const cfg = sectionOptions[0]?.option_value;
                                        if (typeof cfg === 'string' && cfg.includes('min:') && cfg.includes('max:')) {
                                            const parts = cfg.split(',').map(p => p.split(':'));
                                            const map = Object.fromEntries(parts.filter(p => p.length === 2));
                                            const min = map.min;
                                            const max = map.max;
                                            if (min !== undefined) extractedFormValues[`${formLineIdStr}_min`] = min;
                                            if (max !== undefined) extractedFormValues[`${formLineIdStr}_max`] = max;
                                        }
                                    } else if (type === 'checkbox') {
                                        extractedFormValues[formLineIdStr] = selectedOptions.map((opt: any) => opt.option_value);
                                    } else if (type === 'select' || type === 'radio' || type === 'flag') {
                                        const val = selectedOptions[0]?.option_value ?? '';
                                        extractedFormValues[formLineIdStr] = val;
                                    } else {
                                        if (selectedOptions.length > 0) {
                                            extractedFormValues[formLineIdStr] = selectedOptions[0].option_value;
                                        } else if (sectionOptions.length > 0) {
                                            extractedFormValues[formLineIdStr] = sectionOptions[0].option_value;
                                        }
                                    }
                                }
                                setNewItemData((prev: any) => ({ ...prev, form_values: { ...prev.form_values, ...extractedFormValues } }));
                            }
                        }
                        if (itemAny.item_media && itemAny.item_media.length > 0) {
                            const heroImage = itemAny.item_media.find((media: any) => media.media_type === 'image/hero');
                            const coverImage = itemAny.item_media.find((media: any) => media.media_type === 'image/cover');
                            const galleryImages = itemAny.item_media.filter((media: any) => media.media_type === 'image/gallery');
                            const documentFiles = itemAny.item_media.filter((media: any) => media.media_type?.startsWith('application/'));
                            const videoFiles = itemAny.item_media.filter((media: any) => media.media_type?.startsWith('video/'));
                            setNewItemData((prev: any) => ({
                                ...prev,
                                hero_image: heroImage ? heroImage.file : null,
                                cover_image: coverImage ? coverImage.file : null,
                                gallery_images: galleryImages.map((img: any) => img.file),
                                document_files: documentFiles.map((doc: any) => doc.file),
                                video_files: videoFiles.map((vid: any) => vid.file)
                            }));
                        }
                    } catch (error) { toast.error(t('toastErrorLoadItemData')); }
                };
                loadItemData();
                setIsWizardOpen(true);
            } catch (error) {
                toast.error(t('toastErrorLoadItemData'));
                setIsEditing(false);
                setCurrentItem(null);
                setIsWizardOpen(false);
            }
        } else {
            setIsEditing(false);
            setCurrentItem(null);
            setIsWizardOpen(true);
        }
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setCurrentItem(null);
    };
    const handleOpenDeleteModal = (item: Item) => {
        setCurrentItem(item);
        setIsDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setCurrentItem(null);
    };
    const handleOpenStatsModal = async (item: Item) => {
        setCurrentItem(item);
        setIsStatsModalOpen(true);
        setLoading(true);
        try {
            const [stats, commentsData, media] = await Promise.all([
                getInteractionStats(item.id),
                getComments('ITEM', item.id),
                getItemMediaByItemId(item.id)
            ]);
            setInteractionStats(stats);
            setItemComments(commentsData.data || []);
            setItemMedia(media || []);
        } catch (error) {
            toast.error(t('toastErrorFetchDetails'));
            setInteractionStats(null);
            setItemComments([]);
            setItemMedia([]);
        } finally {
            setLoading(false);
        }
    };
    const handleCloseStatsModal = () => {
        setIsStatsModalOpen(false);
        setCurrentItem(null);
        setInteractionStats(null);
        setItemComments([]);
    };

    /** Admin/Root: soft-delete — backend sets is_deleted=true via PATCH */
    const handleSoftDeleteItemComment = (commentId: number) => {
        setCommentAction({ id: commentId, type: 'soft' });
        setIsCommentDeleteModalOpen(true);
    };

    /** Root: hard-delete — backend permanently removes row via DELETE */
    const handleHardDeleteItemComment = (commentId: number) => {
        setCommentAction({ id: commentId, type: 'hard' });
        setIsCommentDeleteModalOpen(true);
    };

    /** Root: restore — backend sets is_deleted=false via PATCH */
    const handleRestoreItemComment = (commentId: number) => {
        setCommentAction({ id: commentId, type: 'restore' });
        setIsCommentDeleteModalOpen(true);
    };

    const confirmCommentAction = async () => {
        if (!commentAction) return;
        try {
            if (commentAction.type === 'hard') {
                await deleteComment(commentAction.id);
            } else if (commentAction.type === 'soft') {
                await patchComment(commentAction.id, { isDeleted: true });
            } else if (commentAction.type === 'restore') {
                await patchComment(commentAction.id, { isDeleted: false });
            }

            if (currentItem?.id) {
                const commentsData = await getComments("ITEM", currentItem.id);
                setItemComments(commentsData.data || []);
                if (commentAction.type === 'hard') {
                    const stats = await getInteractionStats(currentItem.id);
                    setInteractionStats(stats);
                }
            }

            const messages = {
                hard: "Comment permanently deleted",
                soft: "Comment deleted successfully",
                restore: "Comment restored successfully"
            };
            toast.success(messages[commentAction.type]);
            setIsCommentDeleteModalOpen(false);
            setCommentAction(null);
        } catch (error) {
            toast.error(t('toastErrorCommentAction'));
        }
    };



    const handleDelete = async () => {
        if (!currentItem || !currentItem.id) return;
        try {
            await deleteItem(currentItem.id);
            const data = await getAllItems();
            setItems(data);
            handleCloseDeleteModal();
            toast.success(t('toastItemDeleted'));
        } catch (error) { toast.error(t('toastErrorDeleteItem')); }
    };
    const isRootUser = Number(user?.role_id) === 1;
    const columns = [
        { header: "ID", accessor: "id" },
        { header: "Title", accessor: "title" },
        {
            header: "Image", accessor: "image",
            cell: (row: any) => (
                <div className="w-12 h-12 relative"><Image src={row.image ? (row.image.startsWith('/') ? row.image : `/${row.image}`) : '/images/default.jpg'} alt={row.title} fill sizes="48px" className="object-cover rounded-md" /></div>
            ),
        },
        { header: "Description", accessor: "description", cell: (row: any) => <span className="truncate max-w-xs block">{row.description}</span> },
        { header: "Price", accessor: "price", cell: (row: any) => <span>{Number(row.price).toFixed(3)}</span> },
        {
            header: "Status", accessor: "status",
            cell: (row: any) => {
                const statusText = row.status === 0 ? "Under Verification" : row.status === 1 ? "Active" : "Declined";
                const statusClass = row.status === 0 ? "bg-yellow-100 text-yellow-800" : row.status === 1 ? "bg-green-100 text-green-600" : "bg-red-100 text-red-800";
                return (<span className={`px-2 py-1 rounded text-xs ${statusClass}`}>{statusText}</span>);
            },
        },
        ...(isRootUser ? [{
            header: "Company",
            accessor: "companies",
            cell: (l: any) => <span className="">{l.companies?.title || "System Core"}</span>
        }] : []),
        { header: "Created At", accessor: "created_at", cell: (row: any) => (row.created_at ? formatDate(row.created_at) : "N/A") },
        { header: "Updated At", accessor: "updated_at", cell: (row: any) => (row.updated_at ? formatDate(row.updated_at) : "N/A") },
    ];
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) { return "Invalid Date"; }
            return date.toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
        } catch (error) { return "Invalid Date"; }
    };
    const handleOpenWizard = async () => {
        setCurrentStep(1);
        setIsEditing(false);
        setProviderInfo(null);
        setRequiredFields([]); // Clear required fields
        if (user?.role === "Provider" && user?.id) {
            try {
                const providerInfo = await getProviderByUserId(user.id, user);
                if (providerInfo) {
                    const allForms = await getForms();
                    const categoryForms = allForms.filter((form: any) => form.category_id === providerInfo.category_id);
                    setNewItemData({
                        title: "",
                        code: "",
                        description: "",
                        price_ht: "",
                        company_id: user.company_id,
                        provider_id: user.id,
                        category_id: providerInfo.category_id,
                        form_id: categoryForms.length === 1 ? categoryForms[0].id : null,
                        hero_image: null,
                        cover_image: null,
                        gallery_images: [],
                        document_files: [],
                        video_files: [],
                        form_values: {},
                        status: 0, // Provider always gets Under Verification
                    });
                    setProviderInfo(providerInfo);
                }
            } catch (error) {
                toast.error(t('toastErrorProviderDefaults'));
                setNewItemData({
                    title: "",
                    code: "",
                    description: "",
                    price_ht: "",
                    company_id: user?.company_id,
                    provider_id: null,
                    category_id: null,
                    form_id: null,
                    hero_image: null,
                    cover_image: null,
                    gallery_images: [],
                    document_files: [],
                    video_files: [],
                    form_values: {},
                    status: 0,
                });
            }
        } else {
            setNewItemData({
                title: "",
                code: "",
                description: "",
                price_ht: "",
                company_id: user?.role === "Root" ? null : user?.company_id,
                provider_id: null,
                category_id: null,
                form_id: null,
                hero_image: null,
                cover_image: null,
                gallery_images: [],
                document_files: [],
                video_files: [],
                form_values: {},
                status: 0, // Default to Under Verification
            });
        }
        setIsWizardOpen(true);
    };
    const handleCloseWizard = () => {
        setIsWizardOpen(false);
        setIsEditing(false);
        setCurrentStep(1);
        setNewItemData({
            title: "",
            description: "",
            price_ht: 0.001,
            company_id: null,
            provider_id: null,
            category_id: null,
            form_id: null,
            code: "",
            hero_image: null,
            cover_image: null,
            gallery_images: [],
            document_files: [],
            video_files: [],
            form_values: {},
            status: 0,
        });
        setFormLines([]);
        setProviderInfo(null);
        setRequiredFields([]);
        setStep1RequiredFields([]); // Clear step 1 required fields
    };
    const [requiredFields, setRequiredFields] = useState<number[]>([]);
    const [step1RequiredFields, setStep1RequiredFields] = useState<string[]>([]);

    const handleNextStep = () => {
        setRequiredFields([]);
        setStep1RequiredFields([]);
        if (currentStep === 1) {
            // Track which required fields are missing
            const missingFields: string[] = [];
            if (!newItemData.title) missingFields.push("Title");
            if (!newItemData.provider_id) missingFields.push("Provider");
            if (!newItemData.category_id) missingFields.push("Category");
            // Only require form_id if there are multiple forms for the category
            if (newItemData.category_id && forms.filter((form: any) => form.category_id === newItemData.category_id).length > 1 && !newItemData.form_id) {
                missingFields.push("Form");
            }

            if (missingFields.length > 0) {
                toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
                // Set required fields to show red borders and inline errors
                const requiredFieldIds: string[] = [];
                if (!newItemData.title) requiredFieldIds.push("title");
                if (!newItemData.provider_id) requiredFieldIds.push("provider_id");
                if (!newItemData.category_id) requiredFieldIds.push("category_id");
                if (newItemData.category_id && forms.filter((form: any) => form.category_id === newItemData.category_id).length > 1 && !newItemData.form_id) {
                    requiredFieldIds.push("form_id");
                }
                setStep1RequiredFields(requiredFieldIds);
                return;
            }
        } else if (currentStep === 2) {
            // Check for missing required images
            const missingImages: string[] = [];
            if (!newItemData.hero_image) missingImages.push("Hero Image");
            if (!newItemData.cover_image) missingImages.push("Cover Image");

            if (missingImages.length > 0) {
                toast.error(`Please upload the following required images: ${missingImages.join(", ")}`);
                // For image validation, we'll use a separate state if needed
                return;
            }
        } else if (currentStep === 3) {
            const missingFields: string[] = [];
            const requiredFieldsList: number[] = [];
            formLines.forEach((line) => {
                if (line.required) {
                    if (line.type === "range") {
                        // For range fields, check if either min or max is filled
                        const minValue = newItemData.form_values[`${line.id}_min`];
                        const maxValue = newItemData.form_values[`${line.id}_max`];
                        if ((!minValue || minValue === "") && (!maxValue || maxValue === "")) {
                            missingFields.push(line.label);
                            requiredFieldsList.push(line.id);
                        }
                    } else {
                        // For other field types
                        const value = newItemData.form_values[String(line.id)];
                        if (value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
                            missingFields.push(line.label);
                            requiredFieldsList.push(line.id);
                        }
                    }
                }
            });
            if (missingFields.length > 0) {
                toast.error(`Please fill in the following required fields: ${missingFields.join(", ")}`);
                setRequiredFields(requiredFieldsList);
                return;
            }
            setRequiredFields([]);
        }
        setCurrentStep((prev: number) => prev + 1);
    };
    const handlePreviousStep = () => {
        setStep1RequiredFields([]); // Clear step 1 required fields when going back
        setCurrentStep((prev: number) => prev - 1);
    };
    const handleWizardSave = async () => {
        setRequiredFields([]); // Clear required fields
        const itemPayload: any = {
            title: newItemData.title,
            description: newItemData.description,
            price: newItemData.price_ht && Number(newItemData.price_ht) > 0 ? Number(newItemData.price_ht) : 0.001,
            company_id: newItemData.company_id ? Number(newItemData.company_id) : undefined,
            provider_id: newItemData.provider_id ? Number(newItemData.provider_id) : undefined,
        };

        // Only include status if user is Root or Admin, or if creating new item
        if (user?.role === 'Root' || user?.role === 'Admin' || !isEditing) {
            itemPayload.status = newItemData.status ? Number(newItemData.status) : 0;
        }

        if (newItemData.hero_image && typeof newItemData.hero_image === 'string') {
            itemPayload.image = newItemData.hero_image;
        }
        if (newItemData.cover_image && typeof newItemData.cover_image === 'string') {
            itemPayload.cover = newItemData.cover_image;
        }

        if (isEditing && currentItem && currentItem.id) { itemPayload.id = currentItem.id; }
        if (newItemData.category_id) { itemPayload.item_category = [{ category_id: Number(newItemData.category_id) }]; }
        if (newItemData.form_id) {
            itemPayload.form_item = [{ form_id: Number(newItemData.form_id) }];
            const processedFormValues: Record<string, any> = {};
            for (const [key, value] of Object.entries(newItemData.form_values)) {
                if (key.endsWith('_min') || key.endsWith('_max')) {
                    const baseKey = key.replace(/_(min|max)$/, '');
                    if (!processedFormValues[baseKey]) { processedFormValues[baseKey] = {}; }
                    if (key.endsWith('_min')) {
                        if (typeof processedFormValues[baseKey] === 'object' && processedFormValues[baseKey] !== null && !Array.isArray(processedFormValues[baseKey])) { processedFormValues[baseKey].min = value; }
                        else { processedFormValues[baseKey] = { min: value }; }
                    } else if (key.endsWith('_max')) {
                        if (typeof processedFormValues[baseKey] === 'object' && processedFormValues[baseKey] !== null && !Array.isArray(processedFormValues[baseKey])) { processedFormValues[baseKey].max = value; }
                        else { processedFormValues[baseKey] = { max: value }; }
                    }
                } else { processedFormValues[key] = value; }
            }
            for (const [key, value] of Object.entries(processedFormValues)) {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    if (value.min !== undefined && value.max !== undefined) { continue; } else if (value.min !== undefined) { processedFormValues[key] = value.min; } else if (value.max !== undefined) { processedFormValues[key] = value.max; }
                }
            }
            for (const [key, value] of Object.entries(processedFormValues)) { if (typeof value === 'string' && !isNaN(Number(value)) && !key.includes('_min') && !key.includes('_max')) { processedFormValues[key] = Number(value); } }
            itemPayload.form_values = processedFormValues;
        }
        try {
            let item: any;
            if (isEditing && currentItem && currentItem.id) {
                const { id, ...updatePayload } = itemPayload;
                const updateResult = await updateItem(currentItem.id, updatePayload);
                toast.success(t('toastItemUpdated'));
                item = updateResult.item || updateResult;
            }
            else {
                const createResult = await createItem(itemPayload);
                toast.success(t('toastItemSaved'));
                item = createResult.item;
            }
            const uploadAndLinkMedia = async (file: File | string, type: string) => {
                if (typeof file === 'string') {
                    return file;
                }
                const formData = new FormData();
                formData.append("file", file);
                try {
                    const token = localStorage.getItem("token");
                    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload/file`, { method: "POST", body: formData, headers: { Authorization: `Bearer ${token}` } });
                    if (!res.ok) {
                        const errorText = await res.text();
                        throw new Error(`Upload failed: ${res.status} - ${errorText}`);
                    }
                    const data = await res.json();
                    const itemMediaData: any = { file: data.url, media_type: type, item_id: item.id };
                    if (newItemData.company_id) { itemMediaData.company_id = Number(newItemData.company_id); }
                    try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/items/${item.id}/media`, {
                            method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` }, body: JSON.stringify(itemMediaData)
                        });
                        if (!res.ok) {
                            const errorText = await res.text();
                            throw new Error(`Media creation failed: ${res.status} - ${errorText}`);
                        }
                        const mediaResult = await res.json();
                    } catch (mediaError: any) { toast.error(`Failed to save media: ${mediaError.message}`); }
                    return data.url;
                } catch (uploadError) {
                    toast.error(`Failed to upload ${type}: ${(file as File).name || 'image'}`);
                    return null;
                }
            };
            let heroImageUrl: string | null = null;
            if (newItemData.hero_image) {
                heroImageUrl = await uploadAndLinkMedia(newItemData.hero_image, "image/hero");
                if (heroImageUrl) {
                    try {
                        await updateItem(item.id, { image: heroImageUrl });
                    } catch (updateError) {
                        toast.error(t('toastErrorUpdateImage'));
                    }
                }
            }
            let coverImageUrl: string | null = null;
            if (newItemData.cover_image) {
                coverImageUrl = await uploadAndLinkMedia(newItemData.cover_image, "image/cover");
                if (coverImageUrl) {
                    try {
                        await updateItem(item.id, { cover: coverImageUrl });
                    } catch (updateError) {
                        toast.error(t('toastErrorUpdateCoverImage'));
                    }
                }
            }
            for (const file of newItemData.gallery_images) { await uploadAndLinkMedia(file, "image/gallery"); }
            for (const file of newItemData.document_files) { await uploadAndLinkMedia(file, "application/document"); }
            for (const file of newItemData.video_files) { await uploadAndLinkMedia(file, "video/mp4"); }
            if (isEditing && currentItem && currentItem.id) {
                try {
                    const currentMedia = await getItemMediaByItemId(currentItem.id);
                    for (const media of currentMedia) {
                        try {
                            const isUploadedFile = [heroImageUrl, coverImageUrl, ...newItemData.gallery_images, ...newItemData.document_files, ...newItemData.video_files].some(
                                uploadedFile =>
                                    (typeof uploadedFile === 'string' && uploadedFile && media.file.includes(uploadedFile)) || (uploadedFile && typeof uploadedFile === 'object' && 'name' in uploadedFile && media.file.includes((uploadedFile as any).name))
                            );
                            if (!media.file.includes('/images/media/items/default') && !isUploadedFile) {
                                await deleteItemMedia(media.id);
                            }
                        } catch (deleteError) {
                            toast.warning(`Failed to delete media ID ${media.id}:`);
                        }
                    }
                } catch (mediaError) {
                    toast.warning("Failed to fetch existing media for deletion:");
                }
            }
            toast.success(isEditing ? "Service and media updated successfully!" : "Service and all media created successfully!");
            const data = await getAllItems();
            setItems(data);
            handleCloseWizard();
        } catch (error: any) {
            toast.error(isEditing ? `Failed to update Service: ${error.message}` : `Failed to create Service: ${error.message}`);
        }
    };
    const handleWizardChange = async (field: string, value: any) => {
        // Clear validation error for this field if it exists
        if (step1RequiredFields.includes(field)) {
            setStep1RequiredFields(prev => prev.filter(f => f !== field));
        }

        if (field === "form_id") {
            if (!value || value === "" || value === 0 || value === "0") {
                setNewItemData((prev: any) => ({ ...prev, form_id: null }));
                setFormLines([]);
                return;
            }
            setNewItemData((prev: any) => ({ ...prev, form_id: Number(value) }));
            return;
        }
        if (field === "company_id") {
            setNewItemData((prev: any) => ({ ...prev, company_id: Number(value), category_id: null, provider_id: null, form_id: null }));
            return;
        }
        if (field === "category_id") {
            setNewItemData((prev: any) => ({ ...prev, category_id: Number(value), provider_id: null, form_id: null }));
            return;
        }
        if (field === "provider_id") {
            setNewItemData((prev: any) => ({ ...prev, provider_id: Number(value), form_id: null }));
            try {
                const providerInfo = await getProviderByUserId(Number(value), user);
                if (providerInfo && providerInfo.category_id) { setNewItemData((prev: any) => ({ ...prev, category_id: providerInfo.category_id })); }
            } catch (error) { toast.error(t('toastErrorFetchProvider')); }
            return;
        }
        setNewItemData((prev: any) => ({ ...prev, [field]: value }));
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
        const { files } = e.target;
        if (files) {
            // Clear validation error for this field if it exists
            if (fieldName === "hero_image" && step1RequiredFields.includes("hero_image")) {
                setStep1RequiredFields(prev => prev.filter(f => f !== "hero_image"));
            }
            if (fieldName === "cover_image" && step1RequiredFields.includes("cover_image")) {
                setStep1RequiredFields(prev => prev.filter(f => f !== "cover_image"));
            }

            if (fieldName === "gallery_images" || fieldName === "document_files" || fieldName === "video_files") {
                setNewItemData((prev: any) => {
                    const currentFiles = prev[fieldName] || [];
                    const newFiles = Array.from(files);
                    const validFiles = newFiles.filter(file => file && typeof file === 'object' && file.size !== undefined && file.name !== undefined);
                    return { ...prev, [fieldName]: [...currentFiles, ...validFiles] };
                });
            }
            else { setNewItemData((prev: any) => ({ ...prev, [fieldName]: files[0] })); }
        }
    };
    const handleRemoveFile = (fieldName: string, indexToRemove?: number) => {
        setNewItemData((prev: any) => {
            if (indexToRemove !== undefined) {
                const currentFiles = prev[fieldName] || [];
                return { ...prev, [fieldName]: currentFiles.filter((_: any, index: number) => index !== indexToRemove) };
            } else { return { ...prev, [fieldName]: null }; }
        });
    };
    const handleFormValueChange = (fieldName: string, value: any, isMultiOption: boolean = false) => {
        setNewItemData((prev: any) => {
            const newFormValues = { ...prev.form_values };
            if (isMultiOption) {
                const currentOptions = newFormValues[fieldName] || [];
                if (currentOptions.includes(value)) { newFormValues[fieldName] = currentOptions.filter((option: any) => option !== value); }
                else { newFormValues[fieldName] = [...currentOptions, value]; }
            } else { newFormValues[fieldName] = value; }
            return { ...prev, form_values: newFormValues };
        });
    };
    const getSortedFormRows = (lines: WizardFormLine[]) => {
        if (!lines || lines.length === 0) return [];
        const groupedByV = lines.reduce((acc, line) => {
            const v = line.positionv ?? 0;
            if (!acc[v]) { acc[v] = []; }
            acc[v].push(line);
            return acc;
        }, {} as Record<number, WizardFormLine[]>);
        return Object.keys(groupedByV).map(Number).sort((a, b) => a - b).map((v) => {
            const row = groupedByV[v];
            row.sort((a, b) => (a.positionh ?? 0) - (b.positionh ?? 0));
            return row;
        });
    };
    return (
        <div className="space-y-8">
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Services Management</h2>
                    <Button onClick={handleOpenWizard} aria-label="Add New Service" className="addNewBtn"><i className="fa fa-plus mr-2"></i>Add New Service</Button>
                </div>
                <div className="p-6">
                    <DataTable
                        columns={columns}
                        data={items}
                        onEdit={handleOpenModal}
                        onDelete={handleOpenDeleteModal}
                        onCustomAction={handleOpenStatsModal}
                        customActionLabel="Details"
                        iconCustomAction="fa fa-info-circle"
                        showEdit={true}
                        showDelete={true}
                        defaultSort={{ key: 'id', direction: 'descending' }}
                    />
                </div>
            </div>
            {isWizardOpen && (
                <Modal isOpen={isWizardOpen} onClose={handleCloseWizard} title={`${isEditing ? 'Edit' : 'Add New'} Service - Step ${currentStep} of 4`} widthClass="max-w-7xl">
                    <div className="">
                        <div className="overflow-y-auto max-h-[70vh]">
                            {currentStep === 1 && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="md:col-span-2 space-y-6">
                                        {user?.role === 'Root' || user?.role === 'Admin' ? (
                                            <>
                                                <Label>Status<span className="text-red-500">*</span></Label>
                                                <Select onValueChange={(value) => handleWizardChange("status", Number(value))} value={String(newItemData.status || 0)} required>
                                                    <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">Under Verification</SelectItem>
                                                        <SelectItem value="1">Active</SelectItem>
                                                        <SelectItem value="2">Declined</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </>
                                        ) : null}
                                        <Label>Title<span className="text-red-500">*</span></Label>
                                        <Input
                                            placeholder="Service Title"
                                            value={newItemData.title}
                                            onChange={(e) => handleWizardChange("title", e.target.value)}
                                            required
                                            className={step1RequiredFields.includes("title") ? "border-red-500 focus:ring-red-500" : ""}
                                        />
                                        {step1RequiredFields.includes("title") && (<span className="text-red-500 text-sm mt-1 block">Fill this required field</span>)}
                                        <Label>Description</Label>
                                        <Textarea
                                            placeholder="Service Description"
                                            value={newItemData.description}
                                            onChange={(e) => handleWizardChange("description", e.target.value)}
                                        />
                                        <Label>Price</Label>
                                        <Input
                                            type="number"
                                            placeholder="Price"
                                            value={newItemData.price_ht || ""}
                                            onChange={(e) => handleWizardChange("price_ht", e.target.value)}
                                        />
                                        {user?.role === "Provider" || user?.role === "Admin" ? null : (
                                            <>
                                                <Label>Company<span className="text-red-500">*</span></Label>
                                                <Select onValueChange={(value) => handleWizardChange("company_id", Number(value))} value={newItemData.company_id?.toString() || ""} required>
                                                    <SelectTrigger className={step1RequiredFields.includes("company_id") ? "border-red-500 focus:ring-red-500" : ""}>
                                                        <SelectValue placeholder="Select Company" />
                                                    </SelectTrigger>
                                                    <SelectContent>{companies.map((company) => (<SelectItem key={company.id} value={company.id.toString()}>{company.title}</SelectItem>))}</SelectContent>
                                                </Select>
                                                {step1RequiredFields.includes("company_id") && (<span className="text-red-500 text-sm mt-1 block">Fill this required field</span>)}
                                            </>
                                        )}
                                        {user?.role === "Provider" ? null : (
                                            <>
                                                <Label>Category<span className="text-red-500">*</span></Label>
                                                <Select required disabled={!newItemData.company_id}
                                                    onValueChange={(value) => handleWizardChange("category_id", Number(value))}
                                                    value={newItemData.category_id ? newItemData.category_id.toString() : ""}
                                                    key={`category-select-${newItemData.category_id || 'empty'}-${isEditing ? 'edit' : 'new'}`}
                                                >
                                                    <SelectTrigger className={step1RequiredFields.includes("category_id") ? "border-red-500 focus:ring-red-500" : ""}>
                                                        <SelectValue placeholder="Select Category" />
                                                    </SelectTrigger>
                                                    <SelectContent>{formatCategoriesForSelect(categories).map((category) => (<SelectItem key={category.value} value={category.value}>{category.label}</SelectItem>))}</SelectContent>
                                                </Select>
                                                {step1RequiredFields.includes("category_id") && (<span className="text-red-500 text-sm mt-1 block">Fill this required field</span>)}
                                            </>
                                        )}
                                        {user?.role === "Provider" ? null : (
                                            <>
                                                <Label>Provider<span className="text-red-500">*</span></Label>
                                                <Select required disabled={!newItemData.company_id}
                                                    onValueChange={(value) => handleWizardChange("provider_id", Number(value))}
                                                    value={newItemData.provider_id ? newItemData.provider_id.toString() : ""}
                                                    key={`provider-select-${newItemData.provider_id || 'empty'}-${isEditing ? 'edit' : 'new'}`}
                                                >
                                                    <SelectTrigger className={step1RequiredFields.includes("provider_id") ? "border-red-500 focus:ring-red-500" : ""}>
                                                        <SelectValue placeholder="Select Provider" />
                                                    </SelectTrigger>
                                                    <SelectContent>{providers.map((provider) => (<SelectItem key={provider.id} value={provider.id.toString()}>{`${provider.firstname || ''} ${provider.lastname || ''}`.trim() || provider.username}</SelectItem>))}</SelectContent>
                                                </Select>
                                                {step1RequiredFields.includes("provider_id") && (<span className="text-red-500 text-sm mt-1 block">Fill this required field</span>)}
                                            </>
                                        )}
                                    </div>
                                    <div className="md:col-span-1 space-y-6">
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="info" size={20} />About</h3>
                                            {providerInfo ? (<div className="text-sm">{providerInfo.about || <span className="text-gray-500 italic">No information provided</span>}</div>) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="award" size={20} />Experience & Foundation</h3>
                                            {providerInfo ? (
                                                <div className="space-y-2">
                                                    <div><div className="text-sm text-gray-500">Experience: {providerInfo.experience || "N/A"}</div></div>
                                                    <div><div className="text-sm text-gray-500">Foundation Date: {providerInfo.foudation_date ? new Date(providerInfo.foudation_date).toLocaleDateString() : "N/A"}</div></div>
                                                </div>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="map-pin" size={20} />Location</h3>
                                            {providerInfo ? (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <div><div className="text-sm text-gray-500">Country: {providerInfo.country || "N/A"}</div></div>
                                                        <div><div className="text-sm text-gray-500">City: {providerInfo.city || "N/A"}</div></div>
                                                        <div><div className="text-sm text-gray-500">Postal Code: {providerInfo.postal_code || "N/A"}</div></div>
                                                        <div><div className="text-sm text-gray-500">Department: {providerInfo.department || "N/A"}</div></div>
                                                    </div>
                                                    <div><div className="text-sm text-gray-500">Street: {providerInfo.street || "N/A"}</div></div>
                                                    <div className="pt-2">
                                                        <div className="text-sm text-gray-500 mb-2">Map Location</div>
                                                        <div className="rounded overflow-hidden border border-gray-300 h-48">
                                                            <LeafletMapPicker
                                                                initial={(() => {
                                                                    if (providerInfo.map_location) {
                                                                        const [lat, lng] = providerInfo.map_location.split(',').map(Number);
                                                                        return { lat: lat || 34.0, lng: lng || 9.0 };
                                                                    }
                                                                    return { lat: 34.0, lng: 9.0 };
                                                                })()}
                                                                onPick={(pos) => { toast.success(t('toastMapLocationSelected')); }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="contact" size={20} />Contact Information</h3>
                                            {providerInfo ? (
                                                <div className="space-y-2">
                                                    <div><div className="text-sm text-gray-500">Business Name: {providerInfo.ste_title || "N/A"}</div></div>
                                                    <div><div className="text-sm text-gray-500">Email: {providerInfo.email || "N/A"}</div></div>
                                                    <div><div className="text-sm text-gray-500">Phone: {providerInfo.phone_number || "N/A"}</div></div>
                                                    <div><div className="text-sm text-gray-500">WhatsApp: {providerInfo.whatsapp || "N/A"}</div></div>
                                                    <div className="pt-2">
                                                        <div className="text-sm text-gray-500 mb-2">Social Media</div>
                                                        <div className="flex gap-3 flex-wrap">
                                                            {providerInfo.facebook && (
                                                                <a href={providerInfo.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors duration-200">
                                                                    <DisplayIcon iconName="facebook" size={18} />
                                                                </a>
                                                            )}
                                                            {providerInfo.instagram && (
                                                                <a href={providerInfo.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-linear-to-r from-purple-500 to-pink-500 rounded-full text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200">
                                                                    <DisplayIcon iconName="instagram" size={18} />
                                                                </a>
                                                            )}
                                                            {providerInfo.tiktok && (
                                                                <a href={providerInfo.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-black rounded-full text-white hover:bg-gray-800 transition-colors duration-200">
                                                                    <DisplayIcon iconName="music-2" size={18} />
                                                                </a>
                                                            )}
                                                            {providerInfo.youtube && (
                                                                <a href={providerInfo.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-200" >
                                                                    <DisplayIcon iconName="youtube" size={18} />
                                                                </a>
                                                            )}
                                                            {!(providerInfo.facebook || providerInfo.instagram || providerInfo.tiktok || providerInfo.youtube) && <span className="text-gray-500 text-xs py-2">No social media links</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="shield-check" size={20} />Policy</h3>
                                            {providerInfo
                                                ? (<div className="text-sm">{providerInfo.policy || <span className="text-gray-500 italic">No policy information provided</span>}</div>)
                                                : (<div className="text-gray-500 italic">Select a provider to view information</div>)
                                            }
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="dollar-sign" size={20} />Tarification</h3>
                                            {providerInfo ? (<div className="text-sm">{providerInfo.tarification || (<span className="text-gray-500 italic">No tarification information provided</span>)}</div>) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><DisplayIcon iconName="credit-card" size={20} />Payment Methods</h3>
                                            {providerInfo ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {providerInfo.payment_en_especes == 1 && (<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">Cash</span>)}
                                                    {providerInfo.payment_virement == 1 && (<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">Transfer</span>)}
                                                    {providerInfo.payment_par_cheque == 1 && (<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">Check</span>)}
                                                    {providerInfo.payment_en_especes != 1 && providerInfo.payment_virement !== 1 && providerInfo.payment_par_cheque !== 1 && (<span className="text-gray-500 italic">No payment methods specified</span>)}
                                                </div>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg">
                                            <h3 className="font-semibold text-lg mb-3 text-gray-800 flex items-center gap-2"><Clock size={20} />Opening Hours</h3>
                                            {providerInfo ? (
                                                providerInfo.provider_opening_hour && providerInfo.provider_opening_hour.length > 0 ? (
                                                    <div className="space-y-1 text-sm text-gray-600">
                                                        {(() => {
                                                            const today = new Date();
                                                            const currentDay = today.getDay();
                                                            const todayDateStr = today.toISOString().split('T')[0];
                                                            const exception = providerInfo.provider_opening_exception?.find((ex: any) => ex.date.startsWith(todayDateStr));

                                                            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
                                                            // Sort starting from Monday (1) to Sunday (0)
                                                            const sortedHours = [...providerInfo.provider_opening_hour].sort((a: any, b: any) => {
                                                                const dayA = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
                                                                const dayB = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
                                                                return dayA - dayB;
                                                            });

                                                            return sortedHours.map((hour: any) => {
                                                                const isToday = hour.dayOfWeek === currentDay;
                                                                const dayName = days[hour.dayOfWeek];

                                                                let content = null;
                                                                let isClosed = !hour.isActive;
                                                                let startTime = hour.startTime;
                                                                let endTime = hour.endTime;
                                                                let note = "";

                                                                if (isToday && exception) {
                                                                    if (exception.isClosed) {
                                                                        isClosed = true;
                                                                        note = exception.note ? `(${exception.note})` : "(Holiday)";
                                                                    } else {
                                                                        isClosed = false;
                                                                        startTime = exception.startTime;
                                                                        endTime = exception.endTime;
                                                                        note = exception.note ? `(${exception.note})` : "";
                                                                    }
                                                                }

                                                                if (isClosed) {
                                                                    content = <span className="text-red-500 italic">Closed {note}</span>;
                                                                } else {
                                                                    const formatTime = (dateStr: string) => {
                                                                        if (!dateStr) return "";
                                                                        const date = new Date(dateStr);
                                                                        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
                                                                    };
                                                                    content = <span>{formatTime(startTime)} - {formatTime(endTime)} {note}</span>;
                                                                }

                                                                return (
                                                                    <div key={hour.dayOfWeek} className={`flex justify-between items-center ${isToday ? "font-bold text-gray-900 bg-white p-1 rounded shadow-xs" : ""}`}>
                                                                        <span className={isToday ? "text-primary" : ""}>{dayName}</span>
                                                                        {content}
                                                                    </div>
                                                                );
                                                            });
                                                        })()}
                                                    </div>
                                                ) : (
                                                    <div className="text-gray-500 italic">No opening hours specified.</div>
                                                )
                                            ) : (
                                                <div className="text-gray-500 italic">Select a provider to view information</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                            {currentStep === 2 && (
                                <div>
                                    <h3 className="font-bold text-lg mb-6">Step 2: Media Management</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                                        <div>
                                            <label className="label font-semibold">Hero Image<span className="text-red-500">*</span></label>
                                            {!newItemData.hero_image ? (
                                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                        </svg>
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                            <label htmlFor="hero_image" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                                                                <span>Upload a file</span>
                                                                <Input id="hero_image" type="file" className="sr-only" onChange={(e) => handleFileChange(e, "hero_image")} required />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2 relative">
                                                    <Image
                                                        src={typeof newItemData.hero_image === 'string' ? newItemData.hero_image : (newItemData.hero_image && typeof newItemData.hero_image === 'object' && 'name' in newItemData.hero_image ? URL.createObjectURL(newItemData.hero_image as any) : '/images/default.jpg')}
                                                        alt="Hero Preview"
                                                        className="w-full h-auto rounded-lg shadow-md"
                                                        width={800}
                                                        height={600}
                                                    />
                                                    <Button onClick={() => handleRemoveFile("hero_image")} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 leading-none w-8 h-8">&times;</Button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label font-semibold">Cover Image<span className="text-red-500">*</span></label>
                                            {!newItemData.cover_image ? (
                                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                        </svg>
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                            <label htmlFor="cover_image" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                                                                <span>Upload a file</span>
                                                                <Input id="cover_image" type="file" className="sr-only" onChange={(e) => handleFileChange(e, "cover_image")} required />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="mt-2 relative">
                                                    <Image
                                                        src={typeof newItemData.cover_image === 'string' ? newItemData.cover_image : (newItemData.cover_image && typeof newItemData.cover_image === 'object' && 'name' in newItemData.cover_image ? URL.createObjectURL(newItemData.cover_image as any) : '/images/default.jpg')}
                                                        alt="Cover Preview"
                                                        className="w-full h-auto rounded-lg shadow-md"
                                                        width={800}
                                                        height={400}
                                                    />
                                                    <Button onClick={() => handleRemoveFile("cover_image")} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 leading-none w-8 h-8">&times;</Button>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label font-semibold">Document</label>
                                            {(!newItemData.document_files || newItemData.document_files.length === 0) && (
                                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                        </svg>
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                            <label htmlFor="document_file" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                                                                <span>Upload file</span>
                                                                <Input id="document_file" type="file" className="sr-only" onChange={(e) => handleFileChange(e, "document_files")} disabled={newItemData.document_files.length >= 1} />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs leading-5 text-gray-600">PDF, DOC, etc. up to 10MB</p>
                                                    </div>
                                                </div>
                                            )}
                                            {newItemData.document_files && newItemData.document_files.length > 0 && (
                                                <ul className="mt-4 space-y-2">
                                                    <li className="flex items-center justify-between bg-gray-100 p-2 rounded-md">
                                                        {((): JSX.Element => {
                                                            const file = newItemData.document_files[0];
                                                            if (!file) return <a href="#" className="link link-primary truncate">No file</a>;

                                                            if (typeof file === 'string') {
                                                                return (
                                                                    <a
                                                                        href={file}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="link link-primary truncate"
                                                                    >
                                                                        {file.split('/').pop() || 'Document'}
                                                                    </a>
                                                                );
                                                            }

                                                            if (file && typeof file === 'object' && 'name' in file) {
                                                                return (
                                                                    <a
                                                                        href={URL.createObjectURL(file as any)}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="link link-primary truncate"
                                                                    >
                                                                        {(file as any).name}
                                                                    </a>
                                                                );
                                                            }

                                                            return <a href="#" className="link link-primary truncate">Invalid file</a>;
                                                        })()}
                                                        <Button onClick={() => handleRemoveFile("document_files", 0)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 leading-none w-8 h-8">&times;</Button>
                                                    </li>
                                                </ul>
                                            )}
                                        </div>
                                        <div>
                                            <label className="label font-semibold">Video</label>
                                            {(!newItemData.video_files || newItemData.video_files.length === 0) && (
                                                <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                                    <div className="text-center">
                                                        <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                        </svg>
                                                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                            <label htmlFor="video_file" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                                                                <span>Upload file</span>
                                                                <Input id="video_file" type="file" accept="video/*" className="sr-only" onChange={(e) => handleFileChange(e, "video_files")} disabled={newItemData.video_files.length >= 1} />
                                                            </label>
                                                            <p className="pl-1">or drag and drop</p>
                                                        </div>
                                                        <p className="text-xs leading-5 text-gray-600">MP4, MOV, etc. up to 50MB</p>
                                                    </div>
                                                </div>
                                            )}
                                            {newItemData.video_files && newItemData.video_files.length > 0 && (
                                                <div className="mt-4">
                                                    <div className="relative">
                                                        {((): JSX.Element => {
                                                            const videoFile = newItemData.video_files[0];
                                                            if (!videoFile) return <video src="" controls className="w-full rounded-lg shadow-md" />;

                                                            if (typeof videoFile === 'string') {
                                                                return <video src={videoFile} controls className="w-full rounded-lg shadow-md" />;
                                                            }

                                                            if (videoFile && typeof videoFile === 'object' && 'name' in videoFile) {
                                                                return <video src={URL.createObjectURL(videoFile as any)} controls className="w-full rounded-lg shadow-md" />;
                                                            }

                                                            return <video src="" controls className="w-full rounded-lg shadow-md" />;
                                                        })()}
                                                        <Button onClick={() => handleRemoveFile("video_files", 0)} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 leading-none w-8 h-8">&times;</Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mb-8">
                                        <label className="label font-semibold">Gallery</label>
                                        <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                                            <div className="text-center">
                                                <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                                                </svg>
                                                <div className="mt-4 flex text-sm leading-6 text-gray-600">
                                                    <label htmlFor="gallery_images" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 hover:text-indigo-500">
                                                        <span>Upload files</span>
                                                        <Input id="gallery_images" type="file" multiple className="sr-only" onChange={(e) => handleFileChange(e, "gallery_images")} />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                            </div>
                                        </div>
                                        {newItemData.gallery_images && newItemData.gallery_images.length > 0 && (
                                            <div className="mt-4 grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-1">
                                                {newItemData.gallery_images.map((file: File | string, index: number) => (
                                                    <div key={index} className="relative">
                                                        <Image
                                                            src={typeof file === 'string' ? file : (file && typeof file === 'object' && 'name' in file ? URL.createObjectURL(file as any) : '/images/default.jpg')}
                                                            alt={`Preview ${index + 1}`}
                                                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                                                            width={100}
                                                            height={100}
                                                        />
                                                        <Button onClick={() => handleRemoveFile("gallery_images", index)} className="absolute top-1 left-1 bg-red-600 text-white rounded-full p-1 leading-none w-8 h-8">&times;</Button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                            {currentStep === 3 && (
                                <div className="space-y-6">
                                    {!newItemData.category_id ? (
                                        <>
                                            <Label>Select Form</Label>
                                            <div className="p-3 bg-yellow-50 rounded-md text-yellow-700">
                                                <i className="fa fa-exclamation-triangle mr-2"></i>
                                                Please select a category in Step 1 to view available forms
                                            </div>
                                        </>
                                    ) : (() => {
                                        const categoryIdStr = String(newItemData.category_id);
                                        const categoryForms = forms.filter((form: any) => String(form.category_id) === categoryIdStr);
                                        if (categoryForms.length === 0) {
                                            return (
                                                <div className="p-3 bg-yellow-50 rounded-md text-yellow-700">
                                                    <i className="fa fa-exclamation-triangle mr-2"></i>
                                                    No forms configured for this category ({categoryIdStr}). Please contact admin.
                                                </div>
                                            );
                                        }
                                        return categoryForms.length > 1 ? (
                                            <Select
                                                onValueChange={(value) => handleWizardChange("form_id", value)}
                                                value={newItemData.form_id ? newItemData.form_id.toString() : ""}
                                                required
                                                key={`form-select-${newItemData.form_id || 'empty'}-${isEditing ? 'edit' : 'new'}`}
                                            >
                                                <SelectTrigger><SelectValue placeholder="Select Form" /></SelectTrigger>
                                                <SelectContent>{categoryForms.map((form) => (<SelectItem key={form.id} value={form.id.toString()}>{form.title}</SelectItem>))}</SelectContent>
                                            </Select>
                                        ) : (
                                            <div className="p-3 bg-blue-50 rounded-md text-blue-700 text-sm">
                                                <i className="fa fa-info-circle mr-2"></i>
                                                Using form: {categoryForms[0]?.title || "default"}
                                            </div>
                                        );
                                    })()}
                                    {(() => {
                                        const groupedByPositionV: Record<number, any[]> = {};
                                        formLines.forEach((line) => {
                                            const posV = line.positionv || 0;
                                            if (!groupedByPositionV[posV]) { groupedByPositionV[posV] = []; }
                                            groupedByPositionV[posV].push(line);
                                        });
                                        const sortedPositions = Object.keys(groupedByPositionV).map(Number).sort((a, b) => a - b);
                                        return sortedPositions.map((posV) => {
                                            const lines = groupedByPositionV[posV];
                                            const sortedLines = lines.sort((a, b) => (a.positionh || 0) - (b.positionh || 0));
                                            return (
                                                <div key={posV} className="bg-gray-50 rounded-lg">
                                                    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${sortedLines.length}, 1fr)` }}>
                                                        {sortedLines.map((line) => (
                                                            <div key={line.id} className="p-3 bg-white rounded-lg shadow-sm">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    {line.tag?.icon && (<span className="text-lg text-primary"><DisplayIcon iconName={line.tag.icon} size={16} /></span>)}
                                                                    <Label htmlFor={line.label} className="font-medium text-gray-700">{line.label} {line.required && <span className="text-red-500">*</span>}</Label>
                                                                </div>
                                                                {line.type === "text" && (
                                                                    <Input
                                                                        id={line.label}
                                                                        name={line.label}
                                                                        value={newItemData.form_values[String(line.id)] || ""}
                                                                        onChange={(e) => handleFormValueChange(String(line.id), e.target.value)}
                                                                        placeholder={`Enter ${line.label}`}
                                                                        className={`w-full ${requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || newItemData.form_values[String(line.id)] === "") ? "border-red-500 focus:ring-red-500" : ""}`}
                                                                        required={line.required}
                                                                    />
                                                                )}
                                                                {line.type === "textarea" && (
                                                                    <Textarea
                                                                        id={line.label}
                                                                        name={line.label}
                                                                        value={newItemData.form_values[String(line.id)] || ""}
                                                                        onChange={(e) => handleFormValueChange(String(line.id), e.target.value)}
                                                                        placeholder={`Enter ${line.label}`}
                                                                        className={`w-full ${requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || newItemData.form_values[String(line.id)] === "") ? "border-red-500 focus:ring-red-500" : ""}`}
                                                                        required={line.required}
                                                                    />
                                                                )}
                                                                {line.type === "number" && (
                                                                    <Input
                                                                        id={line.label}
                                                                        name={line.label}
                                                                        type="number"
                                                                        value={newItemData.form_values[String(line.id)] || ""}
                                                                        onChange={(e) => handleFormValueChange(String(line.id), e.target.value)}
                                                                        placeholder={`Enter ${line.label}`}
                                                                        className={`w-full ${requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || newItemData.form_values[String(line.id)] === "") ? "border-red-500 focus:ring-red-500" : ""}`}
                                                                        required={line.required}
                                                                    />
                                                                )}
                                                                {line.type === "select" && (
                                                                    <Select name={line.label} value={String(newItemData.form_values[String(line.id)] ?? "")} onValueChange={(value) => handleFormValueChange(String(line.id), value)} required={line.required}>
                                                                        <SelectTrigger className={requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || newItemData.form_values[String(line.id)] === "") ? "border-red-500 focus:ring-red-500" : ""}>
                                                                            <div className="flex items-center gap-2">
                                                                                <SelectValue placeholder={`Select ${line.label}`} />
                                                                            </div>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {line.tag_options && line.tag_options.map((option: any) => (<SelectItem key={option.id} value={option.option_value ?? option.tagOptions?.option_value ?? ""}>{option.option_value ?? option.tagOptions?.option_value}</SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                                {line.type === "checkbox" && (
                                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                                        {line.tag_options &&
                                                                            line.tag_options.map((option: any) => {
                                                                                const optionValue = option.option_value ?? option.tagOptions?.option_value ?? "";
                                                                                const checked = (Array.isArray(newItemData.form_values[String(line.id)]) ? newItemData.form_values[String(line.id)] : []).includes(optionValue);
                                                                                return (
                                                                                    <div key={option.id} className={`flex items-center space-x-2 p-2 bg-white rounded border ${requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || (Array.isArray(newItemData.form_values[String(line.id)]) && newItemData.form_values[String(line.id)].length === 0)) ? "border-red-500" : ""}`}>
                                                                                        <Checkbox id={`${line.id}-${option.id}`} checked={checked} onCheckedChange={() => handleFormValueChange(String(line.id), optionValue, true)} />
                                                                                        <Label htmlFor={`${line.id}-${option.id}`} className="text-sm">{optionValue}</Label>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                    </div>
                                                                )}
                                                                {line.type === "radio" && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {line.tag_options &&
                                                                            line.tag_options.map((option: any) => (
                                                                                <label key={option.id} className={`flex items-center gap-2 p-2 bg-white rounded border cursor-pointer hover:bg-gray-50 ${requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || newItemData.form_values[String(line.id)] === "") ? "border-red-500" : ""}`}>
                                                                                    <Input
                                                                                        type="radio"
                                                                                        name={String(line.id)}
                                                                                        value={option.option_value ?? option.tagOptions?.option_value ?? ""}
                                                                                        checked={newItemData.form_values[String(line.id)] === (option.option_value ?? option.tagOptions?.option_value ?? "")}
                                                                                        onChange={() => handleFormValueChange(String(line.id), option.option_value ?? option.tagOptions?.option_value ?? "")}
                                                                                        className="h-4 w-4 text-blue-600"
                                                                                        required={line.required}
                                                                                    />
                                                                                    <span className="text-sm">{option.option_value ?? option.tagOptions?.option_value ?? ""}</span>
                                                                                </label>
                                                                            ))}
                                                                    </div>
                                                                )}
                                                                {line.type === "range" && line.tag_options && line.tag_options.length > 0 && (() => {
                                                                    const option = line.tag_options[0];
                                                                    const optionValue = option?.option_value ?? option?.tagOptions?.option_value;
                                                                    if (!optionValue) return null;
                                                                    const params = Object.fromEntries(optionValue.split(",").map((pair: string) => pair.split(":") as [string, string]));
                                                                    const min = params.min;
                                                                    const max = params.max;
                                                                    const step = params.step;
                                                                    const type = params.type || "number";
                                                                    const unit = params.unit;
                                                                    if (type) {
                                                                        return (
                                                                            <div className="space-y-2">
                                                                                <div className="flex gap-2 items-center">
                                                                                    <Input type={type} min={min} max={max} step={step} value={newItemData.form_values[`${line.id}_min`] || min}
                                                                                        onChange={(e) => handleFormValueChange(`${line.id}_min`, e.target.value)} placeholder="Min"
                                                                                        className={`w-1/2 ${requiredFields.includes(line.id) && (!newItemData.form_values[`${line.id}_min`] || newItemData.form_values[`${line.id}_min`] === "") && (!newItemData.form_values[`${line.id}_max`] || newItemData.form_values[`${line.id}_max`] === "") ? "border-red-500 focus:ring-red-500" : ""}`}
                                                                                        required={line.required}
                                                                                    />
                                                                                    <span className="text-gray-500">to</span>
                                                                                    <Input type={type} min={min} max={max} step={step} value={newItemData.form_values[`${line.id}_max`] || max}
                                                                                        onChange={(e) => handleFormValueChange(`${line.id}_max`, e.target.value)} placeholder="Max"
                                                                                        className={`w-1/2 ${requiredFields.includes(line.id) && (!newItemData.form_values[`${line.id}_min`] || newItemData.form_values[`${line.id}_min`] === "") && (!newItemData.form_values[`${line.id}_max`] || newItemData.form_values[`${line.id}_max`] === "") ? "border-red-500 focus:ring-red-500" : ""}`}
                                                                                        required={line.required}
                                                                                    />
                                                                                </div>
                                                                                {unit && <div className="text-xs text-gray-500">Unit: {unit}</div>}
                                                                            </div>
                                                                        );
                                                                    }
                                                                })()}
                                                                {line.type === "flag" && (
                                                                    <Select name={line.label} value={String(newItemData.form_values[String(line.id)] ?? "")} onValueChange={(value) => handleFormValueChange(String(line.id), value)} required={line.required}>
                                                                        <SelectTrigger className={requiredFields.includes(line.id) && (!newItemData.form_values[String(line.id)] || newItemData.form_values[String(line.id)] === "") ? "border-red-500 focus:ring-red-500" : ""}>
                                                                            <div className="flex items-center gap-2">
                                                                                {line.tag?.icon && (<span className="text-base"><DisplayIcon iconName={line.tag.icon} size={16} /></span>)}
                                                                                <SelectValue placeholder={`Select ${line.label}`} />
                                                                            </div>
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {line.tag_options && line.tag_options.map((option: any) => (<SelectItem key={option.id} value={option.option_value ?? option.tagOptions?.option_value ?? ""}>{option.option_value ?? option.tagOptions?.option_value ?? ""}</SelectItem>))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })()}
                                </div>
                            )}
                            {currentStep === 4 && (
                                <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="col-span-2 space-y-6">
                                        {newItemData.cover_image && (
                                            <div className="relative h-56 w-full rounded-lg overflow-hidden mb-4">
                                                <Image src={newItemData.cover_image && typeof newItemData.cover_image === 'string' ? newItemData.cover_image : (newItemData.cover_image && typeof newItemData.cover_image === 'object' && 'name' in newItemData.cover_image ? URL.createObjectURL(newItemData.cover_image as any) : '/images/default.jpg')} alt="Cover" className="w-full h-full object-cover" width={1200} height={600} />
                                                {newItemData.hero_image && (
                                                    <div className="absolute left-8 bottom-1.25 w-24 h-24 rounded-full border-2 border-white shadow-lg overflow-hidden bg-white flex items-center justify-center">
                                                        <Image src={newItemData.hero_image && typeof newItemData.hero_image === 'string' ? newItemData.hero_image : (newItemData.hero_image && typeof newItemData.hero_image === 'object' && 'name' in newItemData.hero_image ? URL.createObjectURL(newItemData.hero_image as any) : '/images/default.jpg')} alt="Hero" className="w-24 h-24 object-cover rounded-full" width={100} height={100} />
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-green-600 text-xl">
                                                <i className="fa fa-leaf mr-2" />
                                                {(() => {
                                                    const category = categories.find((c) => String(c?.id) === String(newItemData.category_id));
                                                    return category ? category.title : "No category";
                                                })()}
                                            </span>
                                        </div>
                                        <h2 className="text-3xl font-bold mb-2">{newItemData.title || <span className="text-gray-400">No title</span>}</h2>
                                        <div className="flex flex-wrap gap-4 items-center text-gray-600 mb-4">
                                            <span className="flex items-center gap-1">
                                                <i className="fa fa-star text-yellow-400" />
                                                {(() => {
                                                    const stars = Math.floor(Math.random() * 2) + 4;
                                                    return <span className="font-semibold">{stars}.0</span>;
                                                })()}
                                                <span className="ml-1">({Math.floor(Math.random() * 30) + 10} reviews)</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fa fa-users text-blue-500" />
                                                <span>{Math.floor(Math.random() * 1000) + 100} guests</span>
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <i className="fa fa-map-marker-alt text-red-500" />
                                                {(() => {
                                                    const provider = providers.find((p) => String(p?.id) === String(newItemData.provider_id));
                                                    return provider
                                                        ? `${provider.firstname || ''} ${provider.lastname || ''}`.trim() || provider.username
                                                        : newItemData._provider_name || "No provider";
                                                })()}
                                            </span>
                                        </div>
                                        <div className="mb-2">
                                            <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                                                <Text className="text-primary mr-2" />
                                                <span className="text-slate-700">
                                                    About This{""}
                                                    {(() => {
                                                        const category = categories.find((c) => String(c?.id) === String(newItemData.category_id));
                                                        return category ? category.title : "";
                                                    })()}
                                                </span>
                                            </h3>
                                            <div className="text-gray-700">{newItemData.description || <span className="text-gray-400">No description</span>}</div>
                                        </div>
                                        {newItemData.form_id && formLines.length > 0 && (
                                            <div className="mb-6">
                                                <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                                                    <FileText className="text-primary mr-2" />
                                                    <span className="text-slate-700">Features & Specifications</span>
                                                </h3>
                                                <div className="space-y-6">
                                                    {(() => {
                                                        const groupedByPositionV: Record<number, any[]> = {};
                                                        formLines.forEach((line) => {
                                                            const posV = line.positionv || 0;
                                                            if (!groupedByPositionV[posV]) { groupedByPositionV[posV] = []; }
                                                            groupedByPositionV[posV].push(line);
                                                        });
                                                        const sortedPositions = Object.keys(groupedByPositionV).map(Number).sort((a, b) => a - b);
                                                        return sortedPositions.map((posV) => {
                                                            const lines = groupedByPositionV[posV];
                                                            const sortedLines = lines.sort((a, b) => (a.positionh || 0) - (b.positionh || 0));
                                                            return (
                                                                <div key={posV} className="bg-gray-50 rounded-lg">
                                                                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${sortedLines.length}, 1fr)` }}>
                                                                        {sortedLines.map((line) => (
                                                                            <div key={line.id} className="p-3 bg-white rounded-lg shadow-sm">
                                                                                <div className="flex items-center gap-2 mb-2">
                                                                                    {line.tag?.icon && (<span className="text-lg text-primary"><DisplayIcon iconName={line.tag.icon} size={16} /></span>)}
                                                                                    <span className="font-medium text-gray-700">{line.label}</span>
                                                                                </div>
                                                                                {line.type === "range" ? (
                                                                                    (() => {
                                                                                        const option = line.tag_options?.[0];
                                                                                        const optionValue = option?.option_value ?? option?.tagOptions?.option_value;
                                                                                        if (!optionValue) return null;
                                                                                        const params = Object.fromEntries(optionValue.split(",").map((pair: string) => pair.split(":") as [string, string]));
                                                                                        const unit = params.unit;
                                                                                        return (
                                                                                            <div className="space-y-1">
                                                                                                <div className="flex items-center gap-2 text-gray-800">
                                                                                                    <span className="font-medium text-gray-700">{newItemData.form_values[`${line.id}_min`] || "-"}</span>
                                                                                                    <span className="text-sm">to</span>
                                                                                                    <span className="font-medium text-gray-700">{newItemData.form_values[`${line.id}_max`] || "-"}</span>
                                                                                                    {unit && (<span className="text-sm">{unit}</span>)}
                                                                                                </div>
                                                                                            </div>
                                                                                        );
                                                                                    })()
                                                                                ) : (
                                                                                    <div className="space-y-1">
                                                                                        {line.tag_options &&
                                                                                            line.tag_options.length > 0 &&
                                                                                            line.type === "checkbox" ? (
                                                                                            <div className="space-y-3">
                                                                                                {line.tag_options.filter((option: any) => {
                                                                                                    return Array.isArray(newItemData.form_values[String(line.id)]) ? newItemData.form_values[String(line.id)].includes(option.option_value ?? option.tagOptions?.option_value) : false;
                                                                                                }).length > 0 && (
                                                                                                        <div>
                                                                                                            <h5 className="font-medium text-green-600 mb-1">Disponible</h5>
                                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                                {line.tag_options.filter((option: any) => { return Array.isArray(newItemData.form_values[String(line.id)]) ? newItemData.form_values[String(line.id)].includes(option.option_value) : false; }).map((option: any) => (
                                                                                                                    <span key={option.id} className="inline-flex items-center px-3 py-1 rounded-50 text-sm font-medium bg-green-100 text-green-600 border border-green-500">
                                                                                                                        <i className="fa fa-check-circle text-green-500 mr-1" />{""}
                                                                                                                        {option.option_value ?? option.tagOptions?.option_value ?? ""}
                                                                                                                    </span>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        </div>
                                                                                                    )
                                                                                                }
                                                                                                {line.tag_options.filter((option: any) => { return !(Array.isArray(newItemData.form_values[String(line.id)]) ? newItemData.form_values[String(line.id)].includes(option.option_value) : false); }).length > 0 && (
                                                                                                    <div>
                                                                                                        <h5 className="font-medium text-gray-400 mb-1">Non disponible</h5>
                                                                                                        <div className="flex flex-wrap gap-2">
                                                                                                            {line.tag_options.filter((option: any) => { return !(Array.isArray(newItemData.form_values[String(line.id)]) ? newItemData.form_values[String(line.id)].includes(option.option_value) : false); }).map((option: any) => (
                                                                                                                <span key={option.id} className="inline-flex items-center px-3 py-1 rounded-50 text-sm font-light bg-gray-100 border border-gray-300">
                                                                                                                    <i className="fa fa-times-circle text-gray-400 mr-1" />{""}
                                                                                                                    {option.option_value ?? option.tagOptions?.option_value ?? ""}
                                                                                                                </span>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>
                                                                                        ) : line.tag_options && line.tag_options.length > 0 ? (
                                                                                            <div className="flex flex-wrap gap-2">
                                                                                                {line.tag_options
                                                                                                    .map((option: any) => {
                                                                                                        let isSelected = false;
                                                                                                        if (line.type === "checkbox") { isSelected = Array.isArray(newItemData.form_values[String(line.id)]) ? newItemData.form_values[String(line.id)].includes(option.option_value ?? option.tagOptions?.option_value) : false; }
                                                                                                        else { isSelected = String(newItemData.form_values[String(line.id)]) === String(option.option_value ?? option.tagOptions?.option_value); }
                                                                                                        if (isSelected) {
                                                                                                            return (
                                                                                                                <span key={option.id} className="font-medium text-gray-700">
                                                                                                                    {option.option_value ?? option.tagOptions?.option_value ?? ""}
                                                                                                                </span>
                                                                                                            );
                                                                                                        }
                                                                                                        return null;
                                                                                                    })
                                                                                                    .filter(Boolean)}
                                                                                            </div>
                                                                                        ) : (<div className="text-gray-800 font-medium">{String(newItemData.form_values[String(line.id)]) || (<span className="text-gray-400 font-normal">Not provided</span>)}</div>)}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            );
                                                        });
                                                    })()}
                                                </div>
                                            </div>
                                        )}
                                        {newItemData.gallery_images && newItemData.gallery_images.length > 0 && (
                                            <div className="mb-2">
                                                <h3 className="text-xl font-semibold mb-1 flex items-center gap-2">
                                                    <Camera className="text-primary mr-2" />
                                                    <span className="text-slate-700">Gallery</span>
                                                </h3>
                                                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                                    {newItemData.gallery_images.map((img: File, idx: number) => (
                                                        <Image
                                                            key={idx}
                                                            src={img && typeof img === 'string' ? img : (img && typeof img === 'object' && 'name' in img ? URL.createObjectURL(img as any) : '/images/default.jpg')}
                                                            alt={`Gallery ${idx + 1}`}
                                                            className="w-full h-20 object-cover rounded"
                                                            width={200}
                                                            height={200}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <div className="col-span-1 flex flex-col gap-4">
                                        <div className="bg-gray-50 rounded-lg w-full">
                                            <h3 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><DisplayIcon iconName="contact" size={20} />Contact Information</h3>
                                            {providerInfo ? (
                                                <>
                                                    <div className="flex items-center gap-2 mb-4">
                                                        <Image src={providerInfo.logo || '/images/default.jpg'} alt="Provider Logo" className="w-20 h-20 object-cover rounded" width={100} height={100} />
                                                        <div className="text-gray-500 italic">
                                                            <div className="font-regular text-lg flex items-center gap-2"><DisplayIcon iconName="building" size={16} /> {providerInfo.ste_title || "N/A"}</div>
                                                            <div className="font-regular text-lg flex items-center gap-2"><DisplayIcon iconName="phone" size={16} /> {providerInfo.phone_number || "N/A"}</div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <div className="text-sm"><span className="text-gray-500">Email: </span><span className="font-medium">{providerInfo.email || "N/A"}</span></div>
                                                        <div className="text-sm"><span className="text-gray-500">WhatsApp: </span><span className="font-medium">{providerInfo.whatsapp || "N/A"}</span></div>
                                                        <div className="pt-2">
                                                            <div className="text-sm text-gray-500 mb-2">Social Media</div>
                                                            <div className="flex gap-3 flex-wrap">
                                                                {providerInfo.facebook && (<a href={providerInfo.facebook} target="_blank" rel="noopener noreferrer" className="p-2 bg-blue-100 rounded-full text-blue-600 hover:bg-blue-200 transition-colors duration-200"><DisplayIcon iconName="facebook" size={18} /></a>)}
                                                                {providerInfo.instagram && (<a href={providerInfo.instagram} target="_blank" rel="noopener noreferrer" className="p-2 bg-linear-to-r from-purple-500 to-pink-500 rounded-full text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200"><DisplayIcon iconName="instagram" size={18} /></a>)}
                                                                {providerInfo.tiktok && (<a href={providerInfo.tiktok} target="_blank" rel="noopener noreferrer" className="p-2 bg-black rounded-full text-white hover:bg-gray-800 transition-colors duration-200"><DisplayIcon iconName="music-2" size={18} /></a>)}
                                                                {providerInfo.youtube && (<a href={providerInfo.youtube} target="_blank" rel="noopener noreferrer" className="p-2 bg-red-500 rounded-full text-white hover:bg-red-600 transition-colors duration-200"><DisplayIcon iconName="youtube" size={18} /></a>)}
                                                                {!(providerInfo.facebook || providerInfo.instagram || providerInfo.tiktok || providerInfo.youtube) && <span className="text-gray-500 text-xs py-2">No social media links</span>}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg w-full">
                                            <h3 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><DisplayIcon iconName="info" size={20} />About</h3>
                                            {providerInfo ? (<div className="text-sm">{providerInfo.about || <span className="text-gray-500 italic">No information provided</span>}</div>) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg w-full">
                                            <h3 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><DisplayIcon iconName="award" size={20} />Experience & Foundation</h3>
                                            {providerInfo ? (
                                                <div className="space-y-2">
                                                    <div className="text-sm"><span className="text-gray-500">Foundation Date: </span><span className="font-medium">{providerInfo.foudation_date ? new Date(providerInfo.foudation_date).toLocaleDateString() : "N/A"}</span></div>
                                                    <div className="text-sm"><span className="text-gray-500">Experience: </span><span className="font-medium">{providerInfo.experience || "N/A"}</span></div>
                                                </div>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg w-full">
                                            <h3 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><DisplayIcon iconName="map-pin" size={20} />Location</h3>
                                            {providerInfo ? (
                                                <div className="space-y-3">
                                                    <div className="text-sm"><span className="text-gray-500">Country: </span><span className="font-medium">{providerInfo.country || "N/A"}</span></div>
                                                    <div className="text-sm"><span className="text-gray-500">City: </span><span className="font-medium">{providerInfo.city || "N/A"}</span></div>
                                                    <div className="text-sm"><span className="text-gray-500">Postal Code: </span><span className="font-medium">{providerInfo.postal_code || "N/A"}</span></div>
                                                    <div className="text-sm"><span className="text-gray-500">Department: </span><span className="font-medium">{providerInfo.department || "N/A"}</span></div>
                                                    <div className="text-sm"><span className="text-gray-500">Street: </span><span className="font-medium">{providerInfo.street || "N/A"}</span></div>
                                                    <div className="pt-2">
                                                        <div className="text-sm text-gray-500 mb-2">Map Location</div>
                                                        <div className="rounded overflow-hidden border border-gray-300">
                                                            <LeafletMapPicker
                                                                initial={(() => {
                                                                    if (providerInfo.map_location) {
                                                                        const [lat, lng] = providerInfo.map_location.split(',').map(Number);
                                                                        return { lat: lat || 34.0, lng: lng || 9.0 };
                                                                    }
                                                                    return { lat: 34.0, lng: 9.0 };
                                                                })()}
                                                                onPick={(pos) => { toast.success(t('toastMapLocationSelected')); }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (<div className="text-gray-500 italic">Select a provider to view information</div>)}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg w-full">
                                            <h3 className="font-semibold text-gray-700 mb-3 text-lg flex items-center gap-2"><DisplayIcon iconName="credit-card" size={20} />Payment Methods</h3>
                                            {providerInfo ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {providerInfo.payment_en_especes == 1 && (<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">Cash</span>)}
                                                    {providerInfo.payment_virement == 1 && (<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">Transfer</span>)}
                                                    {providerInfo.payment_par_cheque == 1 && (<span className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full">Check</span>)}
                                                    {providerInfo.payment_en_especes != 1 && providerInfo.payment_virement !== 1 && providerInfo.payment_par_cheque !== 1 && (<span className="text-gray-500 italic">No payment methods specified</span>)}
                                                </div>
                                            ) : (
                                                <div className="text-gray-500 italic">Select a provider to view information</div>
                                            )}
                                        </div>
                                        <div className="bg-gray-50 rounded-lg w-full">
                                            <div className="font-semibold mb-1">Operating Hours</div>
                                            <div className="text-sm text-gray-700">
                                                <div>Monday - Friday: 9am - 8pm</div>
                                                <div>Saturday: 10am - 6pm</div>
                                                <div>Sunday: Closed</div>
                                            </div>
                                        </div>
                                        {newItemData.video_files && newItemData.video_files.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg w-full">
                                                <div className="font-semibold mb-1">Video</div>
                                                <video
                                                    src={newItemData.video_files[0] && typeof newItemData.video_files[0] === 'string'
                                                        ? newItemData.video_files[0]
                                                        : (newItemData.video_files[0] && typeof newItemData.video_files[0] === 'object' && 'name' in newItemData.video_files[0]
                                                            ? URL.createObjectURL(newItemData.video_files[0] as any)
                                                            : '')}
                                                    controls
                                                    className="w-full rounded-lg"
                                                />
                                            </div>
                                        )}
                                        {newItemData.document_files && newItemData.document_files.length > 0 && (
                                            <div className="bg-gray-50 rounded-lg w-full">
                                                <div className="font-semibold mb-1">Document</div>
                                                Download document support from{""}
                                                <a
                                                    href={newItemData.document_files[0] && typeof newItemData.document_files[0] === 'string'
                                                        ? newItemData.document_files[0]
                                                        : (newItemData.document_files[0] && typeof newItemData.document_files[0] === 'object' && 'name' in newItemData.document_files[0]
                                                            ? URL.createObjectURL(newItemData.document_files[0] as any)
                                                            : '#')}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-600"
                                                >
                                                    {newItemData.document_files[0] && typeof newItemData.document_files[0] === 'string'
                                                        ? newItemData.document_files[0].split('/').pop() || 'Document'
                                                        : (newItemData.document_files[0] && 'name' in newItemData.document_files[0]
                                                            ? (newItemData.document_files[0] as any).name
                                                            : 'Document')}
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="mt-6 flex justify-between space-x-4 bg-gray-50 rounded-b-lg">
                            <div className="flex space-x-4">
                                {currentStep > 1 && (<Button onClick={handlePreviousStep} className="backBtn">Previous</Button>)}
                                {currentStep < 4 ? (<Button onClick={handleNextStep} className="nextBtn">Next</Button>) : (<Button onClick={handleWizardSave} className={isEditing ? 'updateBtn' : 'createBtn'}>{isEditing ? 'Update' : 'Create'}</Button>)}
                            </div>
                            <Button onClick={handleCloseWizard} className="closeBtn">Close</Button>
                        </div>
                    </div>
                </Modal>
            )}
            {isStatsModalOpen && (
                <Modal isOpen={isStatsModalOpen} onClose={handleCloseStatsModal} title="Service Details" widthClass="w-full max-w-7xl">
                    <div className="">
                        {loading ? (
                            <div className="text-center py-8">Loading details...</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                                {/* Left Column: Content */}
                                <div className="md:col-span-8 space-y-6">
                                    {/* 1. Title */}
                                    <h3 className="text-3xl font-bold text-gray-900">{currentItem?.title}</h3>

                                    {/* 2. Principal Image */}
                                    {currentItem?.image && (
                                        <div className="relative aspect-video rounded-xl overflow-hidden shadow-md w-full">
                                            <Image
                                                src={currentItem.image.startsWith('/') ? currentItem.image : `/${currentItem.image}`}
                                                alt={currentItem.title || ""}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                    )}

                                    {/* 3. Provider/Company and Date */}
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-b py-3">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">Provider:</span>
                                            {(currentItem as any)?.users ? `${(currentItem as any).users.firstname} ${(currentItem as any).users.lastname}` : "N/A"}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">Price:</span>
                                            <span className="text-green-600 font-semibold">{Number(currentItem?.price || 0).toFixed(3)} TND</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-gray-900">Created:</span>
                                            {currentItem?.created_at ? new Date(currentItem.created_at).toLocaleDateString() : "N/A"}
                                        </div>
                                    </div>

                                    {/* 4. Description */}
                                    <div className="prose max-w-none text-gray-700">
                                        <p className="whitespace-pre-line">{currentItem?.description || "No description available."}</p>
                                    </div>

                                    {/* 5. Media Gallery */}
                                    {itemMedia && itemMedia.length > 0 && (
                                        <div className="space-y-2">
                                            <h4 className="font-bold text-lg">Media Gallery</h4>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                                {itemMedia.map((media, index) => (
                                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-white shadow-sm hover:opacity-90 transition-opacity">
                                                        {media.media_type?.startsWith("video/") ? (
                                                            <video src={media.file} className="w-full h-full object-cover" controls />
                                                        ) : (
                                                            <Image
                                                                src={media.file ? (media.file.startsWith('/') ? media.file : `/${media.file}`) : '/images/default.jpg'}
                                                                alt={`Media ${index}`}
                                                                fill
                                                                className="object-cover"
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Column: Sidebar (Stats & Comments) */}
                                <div className="md:col-span-4 space-y-6">
                                    {/* 6. Stats Box */}
                                    <div className="bg-gray-50 rounded-xl space-y-3">
                                        <div className="p-4">
                                            <h4 className="font-bold text-gray-900 mb-2">Statistics</h4>
                                            <div className="flex flex-col gap-3">
                                                <div className="flex items-center justify-between" title="Views">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Eye className="w-5 h-5 text-blue-500" />
                                                        <span>Views</span>
                                                    </div>
                                                    <span className="font-semibold">{interactionStats?.views ?? 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between" title="Shares">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Share2 className="w-5 h-5 text-cyan-500" />
                                                        <span>Shares</span>
                                                    </div>
                                                    <span className="font-semibold">{interactionStats?.shares ?? 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between" title="Likes">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <ThumbsUp className="w-5 h-5 text-green-500" />
                                                        <span>Likes</span>
                                                    </div>
                                                    <span className="font-semibold">{interactionStats?.likes ?? 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between" title="Dislikes">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <ThumbsDown className="w-5 h-5 text-red-500" />
                                                        <span>Dislikes</span>
                                                    </div>
                                                    <span className="font-semibold">{interactionStats?.dislikes ?? 0}</span>
                                                </div>
                                                <div className="flex items-center justify-between pt-2 mt-1" title="Average Rating">
                                                    <div className="flex items-center gap-2 text-gray-600">
                                                        <Star className="w-5 h-5 text-yellow-500 fill-current" />
                                                        <span>Rating</span>
                                                    </div>
                                                    <div className="text-right">
                                                        <span className="font-semibold block">{interactionStats?.avgRating?.toFixed(1) || "0.0"}</span>
                                                        <span className="text-xs text-gray-400">({interactionStats?.totalRatings ?? 0} reviews)</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 7. Comments Section */}
                                    <div className="rounded-xl flex flex-col h-[500px] sticky to bg-white shadow-sm">
                                        <div className="bg-gray-50 px-4 py-3 flex justify-between items-center rounded-t-xl">
                                            <h4 className="font-bold flex items-center gap-2">
                                                <MessageCircle className="w-5 h-5" />
                                                Comments ({itemComments.length})
                                            </h4>
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {itemComments && itemComments.length > 0 ? (
                                                itemComments.map((comment: any) => (
                                                    <div key={comment.id} className="group flex">
                                                        <div className={`flex-1 p-3 relative transition-colors ${comment.isDeleted ? 'bg-red-50 hover:bg-red-100' : 'bg-gray-50 hover:bg-gray-100'}`}>
                                                            <div className="flex justify-between items-start">
                                                                <span className="font-semibold text-sm flex items-center gap-2">
                                                                    {comment.user ? `${comment.user.firstname} ${comment.user.lastname}` : `User ${comment.userId}`}
                                                                    {comment.isDeleted && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded border border-red-200 tracking-wide font-bold">Deleted</span>}
                                                                </span>
                                                                <span className="text-xs text-gray-400 mr-20">{comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'N/A'}</span>
                                                            </div>
                                                            <p className={`text-sm whitespace-pre-wrap ${comment.isDeleted ? 'text-gray-500 italic' : 'text-gray-700'}`}>{comment.content}</p>

                                                            {/* Comment Actions — role-based header layout */}
                                                            <div className="absolute top-2 right-2 flex items-center gap-2">
                                                                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    {/* Root only: restore */}
                                                                    {user?.role === 'Root' && comment.isDeleted && (
                                                                        <button onClick={() => handleRestoreItemComment(comment.id)} className="text-gray-400 hover:text-green-600 p-1 rounded transition-colors" title="Restore comment"><RotateCcw className="w-3.5 h-3.5" /></button>
                                                                    )}
                                                                    {/* Admin: soft-delete (hide) */}
                                                                    {(user?.role === 'Admin' || user?.role === 'Root') && !comment.isDeleted && (
                                                                        <button onClick={() => handleSoftDeleteItemComment(comment.id)} className="text-gray-400 hover:text-primary/50 p-1 rounded transition-colors" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                                                                    )}
                                                                    {/* Root only: hard-delete (permanent) */}
                                                                    {user?.role === 'Root' && (
                                                                        <button onClick={() => handleHardDeleteItemComment(comment.id)} className="text-gray-400 hover:text-red-600 p-1 rounded transition-colors" title="Delete permanently"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-center py-10 text-gray-500">
                                                    <div className="bg-gray-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"><MessageCircle className="w-6 h-6 text-gray-400" /></div>
                                                    <p>No comments yet.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <Button onClick={handleCloseStatsModal} className="bg-gray-200 hover:bg-gray-300 text-gray-800">Close</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {isDeleteModalOpen && (
                <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Delete Item">
                    <p className="text-gray-700">Are you sure you want to delete this item <strong>{currentItem?.title}</strong>?</p>
                    <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button onClick={handleDelete} className="deleteBtn">Delete</Button>
                        <Button onClick={handleCloseDeleteModal} className="closeBtn">Close</Button>
                    </div>
                </Modal>
            )}

            {isCommentDeleteModalOpen && (
                <Modal isOpen={isCommentDeleteModalOpen} onClose={() => setIsCommentDeleteModalOpen(false)} title={commentAction?.type === 'hard' ? "Delete permanently" : commentAction?.type === 'restore' ? "Restore comment" : "Delete"}>
                    <div className="space-y-6">
                        <p className="text-gray-600">
                            {commentAction?.type === 'hard'
                                ? "Are you sure you want to permanently delete this comment? This action cannot be undone."
                                : commentAction?.type === 'restore'
                                    ? "Are you sure you want to restore this comment? It will be visible to everyone again."
                                    : "Are you sure you want to delete this comment? It will be hidden from public but kept in records."}
                        </p>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                            <Button onClick={confirmCommentAction} className={commentAction?.type === 'hard' ? "deleteBtn" : commentAction?.type === 'restore' ? "createBtn" : "updateBtn"}>{commentAction?.type === 'hard' ? "Delete Permanently" : commentAction?.type === 'restore' ? "Restore" : "Delete"}</Button>
                            <Button onClick={() => setIsCommentDeleteModalOpen(false)} className="closeBtn">Close</Button>
                        </div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
