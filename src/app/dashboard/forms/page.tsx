"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { File, Trash2 } from "lucide-react";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useAuth } from "@/context/AuthContext";
import { Form, formLines, formLineOptions } from "@/types/forms";
import { getForms, createForm, updateForm, deleteForm, getForm } from "@/lib/api/forms";
import { getCompanies } from "@/lib/api/companies";
import { getAllCategories } from "@/lib/api/categories";
import { getTagsByCategory } from "@/lib/api/tags";
import { Company } from "@/types/companies";
import { Category } from "@/types/categories";
import { Tag } from "@/types/tags";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DisplayIcon from "@/components/ui/DisplayIcon";
import { useTranslations } from "next-intl";

const FormsPage = () => {
    const t = useTranslations('Dashboard.forms');
    const { user } = useAuth();
    const [forms, setForms] = useState<Form[]>([]);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
    const [availableTags, setAvailableTags] = useState<Tag[]>([]);
    const [formTitle, setFormTitle] = useState("");
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [selectedCategoryId, setSelectedCategoryId] = useState("");
    const [formLines, setFormLines] = useState<Partial<formLines>[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingForm, setEditingForm] = useState<Form | null>(null);
    const [deletingForm, setDeletingForm] = useState<Form | null>(null);
    const [step, setStep] = useState(1);
    const [draggedTag, setDraggedTag] = useState<Tag | null>(null);
    const [draggedLine, setDraggedLine] = useState<Partial<formLines> | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<string, number[]>>({});
    const isDragging = !!draggedTag || !!draggedLine;

    const formatCategoriesForSelect = (categories: Category[]) => {
        const categoryMap = new Map(categories.map(c => [c.id, { ...c, children: [] }]));
        const rootCategories: any[] = [];
        categories.forEach(c => {
            if (c.head_category_id) {
                const parent = categoryMap.get(c.head_category_id);
                if (parent) {
                    // @ts-ignore
                    parent.children.push(categoryMap.get(c.id));
                }
            } else { rootCategories.push(categoryMap.get(c.id)); }
        });
        const renderOptions = (cats: any[], depth = 0) => {
            let options: { label: string; value: string; }[] = [];
            for (const category of cats) {
                if (category) {
                    options.push({ label: `${'--'.repeat(depth)} ${category.title}`, value: category.id.toString() });
                    if (category.children && category.children.length > 0) { options = options.concat(renderOptions(category.children, depth + 1)); }
                }
            }
            return options;
        };
        return renderOptions(rootCategories);
    };
    const fetchForms = async () => {
        try {
            const data = await getForms();
            setForms(data);
        } catch { toast.error(t('toastErrorFetchForms')); }
    };
    const fetchCompanies = async () => {
        try {
            const data = await getCompanies();
            setCompanies(data);
        } catch { toast.error(t('toastErrorFetchCompanies')); }
    };
    const fetchCategories = async () => {
        try {
            const data = await getAllCategories();
            setCategories(data);
        } catch { toast.error(t('toastErrorFetchCategories')); }
    };
    useEffect(() => {
        fetchForms();
        fetchCompanies();
        fetchCategories();
    }, []);
    useEffect(() => {
        if (selectedCompanyId) {
            const newFilteredCategories = categories.filter((c) => c.company_id?.toString() === selectedCompanyId);
            setFilteredCategories(newFilteredCategories);
            if (!newFilteredCategories.some(c => c.id.toString() === selectedCategoryId)) { setSelectedCategoryId(""); }
        } else {
            setFilteredCategories(categories);
            setSelectedCategoryId("");
        }
    }, [selectedCompanyId, categories, selectedCategoryId]);
    const extractOptionIds = (options: formLineOptions[] | undefined): number[] => {
        if (!options) return [];
        const ids: number[] = [];
        for (const opt of options) { if (opt.tag_option_id !== undefined) { ids.push(opt.tag_option_id); } }
        return ids;
    };
    const handleOpenModal = async (form: Form | null) => {
        setEditingForm(form);
        if (form) {
            const fullForm = await getForm(form.id);
            setFormTitle(fullForm.title);
            setSelectedCompanyId(fullForm.company_id?.toString() || "");
            setSelectedCategoryId(fullForm.category_id?.toString() || "");
            const linesWithIds = (fullForm.form_lines || []).map(line => ({ ...line, line_id: line.id.toString() }));
            setFormLines(linesWithIds);
            const initialOptions: Record<string, number[]> = {};
            linesWithIds.forEach((line) => { if (line.form_line_options && line.form_line_options.length > 0) { initialOptions[line.line_id!] = extractOptionIds(line.form_line_options); } });
            setSelectedOptions(initialOptions);
        } else if (user?.company_id) { setSelectedCompanyId(user.company_id.toString()); }
        setIsModalOpen(true);
    };
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingForm(null);
        setFormTitle("");
        setSelectedCompanyId("");
        setSelectedCategoryId("");
        setFormLines([]);
        setAvailableTags([]);
        setStep(1);
        setSelectedOptions({});
    };
    const handleOpenDeleteModal = (form: Form) => {
        setDeletingForm(form);
        setIsDeleteModalOpen(true);
    };
    const handleCloseDeleteModal = () => {
        setDeletingForm(null);
        setIsDeleteModalOpen(false);
    };
    const handleTagDragStart = (tag: Tag) => {
        setDraggedTag(tag);
        setDraggedLine(null);
    };
    const handleLineDragStart = (line: Partial<formLines>) => {
        setDraggedLine(line);
        setDraggedTag(null);
    };
    const handleDrop = (target: { positionv: number; positionh: number }) => {
        if (!draggedTag && !draggedLine) return;
        const grid: Partial<formLines>[][] = [];
        formLines.forEach(line => {
            const v = line.positionv || 0;
            const h = line.positionh || 0;
            if (!grid[v]) { grid[v] = []; }
            grid[v][h] = line;
        });
        for (let i = 0; i < grid.length; i++) { if (grid[i]) { grid[i] = grid[i].filter(Boolean); } else { grid[i] = []; } }
        let itemToDrop: Partial<formLines>;
        if (draggedLine) {
            itemToDrop = draggedLine;
            const sourceV = draggedLine.positionv!;
            const sourceH = draggedLine.positionh!;
            if (grid[sourceV]) { grid[sourceV].splice(sourceH, 1); }
        } else if (draggedTag) {
            itemToDrop = {
                label: draggedTag.title,
                type: draggedTag.type,
                icon: draggedTag.icon,
                tag_id: draggedTag.id,
                required: false,
                form_line_options: [],
                line_id: Math.random().toString(36).substr(2, 9),
            };
        } else { return; }
        while (grid.length <= target.positionv) { grid.push([]); }
        grid[target.positionv].splice(target.positionh, 0, itemToDrop);
        const newFormLines: Partial<formLines>[] = [];
        grid.filter(row => row.length > 0)
            .forEach((row, v) => {
                row.forEach((line, h) => {
                    line.positionv = v;
                    line.positionh = h;
                    newFormLines.push(line);
                });
            });
        setFormLines(newFormLines);
        setDraggedTag(null);
        setDraggedLine(null);
        setFormLines(newFormLines);
    };
    const updateFormLine = (lineId: string, updated: Partial<formLines>) => { setFormLines(prevLines => prevLines.map(line => line.line_id === lineId ? { ...line, ...updated } : line)); };
    const removeFormLine = (lineToRemove: Partial<formLines>) => {
        if (!lineToRemove) return;
        const newFormLines = formLines.filter(line => line !== lineToRemove);
        const grid: Partial<formLines>[][] = [];
        newFormLines.forEach(line => {
            const v = line.positionv || 0;
            const h = line.positionh || 0;
            if (!grid[v]) grid[v] = [];
            grid[v][h] = line;
        });
        for (let i = 0; i < grid.length; i++) {
            if (grid[i]) grid[i] = grid[i].filter(Boolean);
            else grid[i] = [];
        }
        const finalFormLines: Partial<formLines>[] = [];
        grid.filter(row => row.length > 0)
            .forEach((row, v) => {
                row.forEach((line, h) => {
                    line.positionv = v;
                    line.positionh = h;
                    finalFormLines.push(line);
                });
            });
        setFormLines(finalFormLines);
        if (lineToRemove.line_id) {
            setSelectedOptions(prev => {
                const newOptions = { ...prev };
                delete newOptions[lineToRemove.line_id!];
                return newOptions;
            });
        }
    };
    const handleOptionChange = (lineId: string, optionId: number) => {
        setSelectedOptions((prev) => {
            const lineOptions = prev[lineId] ? [...prev[lineId]] : [];
            const optionIndex = lineOptions.indexOf(optionId);
            if (optionIndex > -1) { lineOptions.splice(optionIndex, 1); } else { lineOptions.push(optionId); }
            return { ...prev, [lineId]: lineOptions };
        });
    };
    const goToStep2 = async () => {
        if (!formTitle || !selectedCompanyId || !selectedCategoryId) {
            toast.error(t('toastErrorRequiredFields'));
            return;
        }
        try {
            const tags = await getTagsByCategory(parseInt(selectedCategoryId));
            setAvailableTags(tags);
            setStep(2);
        } catch (error) { toast.error(t('toastErrorFetchTags')); }
    };
    const goToStep3 = () => { setStep(3); };
    const handleSubmit = async () => {
        const data = {
            title: formTitle,
            company_id: parseInt(selectedCompanyId),
            category_id: parseInt(selectedCategoryId),
            status: 1,
            form_lines: formLines.map((l) => {
                const { line_id, ...cleanLine } = l as any;
                return {
                    ...cleanLine,
                    form_line_options: line_id && selectedOptions[line_id] ? selectedOptions[line_id].map((optionId) => {
                        const tag = availableTags.find(t => t.id === cleanLine.tag_id);
                        const option = tag?.tag_options?.find(opt => opt.id === optionId);
                        return { tag_option_id: optionId };
                    }).filter(option => option.tag_option_id !== undefined) : [],
                };
            }),
        };
        try {
            if (editingForm) {
                await updateForm({ id: editingForm.id, ...(data as any) });
                toast.success(t('toastFormUpdated'));
            } else {
                await createForm(data as any);
                toast.success(t('toastFormCreated'));
            }
            fetchForms();
            handleCloseModal();
        } catch { toast.error(t('toastErrorSaveForm')); }
    };
    const handleDelete = async () => {
        if (!deletingForm) return;
        try {
            await deleteForm(deletingForm.id);
            toast.success(t('toastFormDeleted'));
            fetchForms();
            handleCloseDeleteModal();
        } catch { toast.error(t('toastErrorDeleteForm')); }
    };
    const isRootUser = Number(user?.role_id) === 1;
    const columns: DataTableColumn<Form>[] = [
        { accessor: "id", header: "ID" },
        { accessor: "title", header: "Title" },
        { accessor: "category_title", header: "Category" },
        ...(isRootUser ? [{
            header: "Company",
            accessor: "companies",
            cell: (f: any) => <span className="">{f.companies?.title || "System Core"}</span>
        }] : []),
        { accessor: "created_at", header: "Created At", cell: (f) => (f.created_at ? new Date(f.created_at).toLocaleString() : "N/A") },
        { accessor: "updated_at", header: "Updated At", cell: (f) => (f.updated_at ? new Date(f.updated_at).toLocaleString() : "N/A") },
    ];
    return (
        <div className="space-y-8">
            <div className="card">
                <div className="px-6 py-4 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('formsManagement')}</h2>
                    <Button onClick={() => handleOpenModal(null)} className="addNewBtn"><i className="fa fa-plus mr-2"></i>{t('addNewForm')}</Button>
                </div>
                <div className="p-6">{forms.length ? (<DataTable columns={columns} data={forms} onEdit={handleOpenModal} onDelete={handleOpenDeleteModal} />) : (<p className="text-center mt-5 text-gray-500">{t('noData')}</p>)}</div>
            </div>
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingForm ? "Edit Form" : "Add Form"} widthClass="max-w-8xl">
                <div className="overflow-y-auto max-h-[85vh]">
                    {step === 1 && (
                        <div>
                            <div className="space-y-6">
                                {/* Company */}
                                {user?.role === "Root" && (<div>
                                    <Label>Select Company</Label>
                                    <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} disabled={user?.role !== "Root"}>
                                        <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                                        <SelectContent>{companies.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.title}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                )}
                                {/* Category */}
                                <div>
                                    <Label>Select Category</Label>
                                    <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
                                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                                        <SelectContent>{formatCategoriesForSelect(filteredCategories).map((c) => (<SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>))}</SelectContent>
                                    </Select>
                                </div>
                                {/* Title */}
                                <div>
                                    <Label>Form Title</Label>
                                    <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Enter title" />
                                </div>
                            </div>
                            <div className="mt-6 flex justify-end space-x-2">
                                <Button className="nextBtn" onClick={goToStep2}>Next</Button>
                                <Button className="closeBtn" variant="ghost" onClick={handleCloseModal}>Close</Button>
                            </div>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="grid grid-cols-4 gap-4">
                            {/* Tags list */}
                            <div className="col-span-1 border-r display-flex flex-col">
                                <h3 className="font-semibold mb-4">Available Fields</h3>
                                <div className="space-y-2 overflow-y-auto max-h-[60vh]">{availableTags.map((tag) => (<div key={tag.id} draggable onDragStart={() => handleTagDragStart(tag)} className="p-2 border rounded cursor-grab flex items-center gap-2">
                                    {tag.icon && <DisplayIcon iconName={tag.icon} size={16} className="text-gray-600" />} {tag.title}
                                </div>))}</div>
                            </div>
                            {/* Form layout */}
                            <div className="col-span-3 min-h-75" onDragOver={(e) => e.preventDefault()}>
                                <Label>Form Layout</Label>
                                <div
                                    className={`border-2 border-dashed rounded-md p-4 space-y-1 transition-colors overflow-y-auto max-h-[60vh] ${isDragging ? 'bg-gray-100' : ''}`}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const grid = formLines.reduce((acc, line) => {
                                            const v = line.positionv || 0;
                                            if (!acc[v]) acc[v] = [];
                                            acc[v].push(line);
                                            return acc;
                                        }, [] as Partial<formLines>[][]);
                                        handleDrop({ positionv: grid.length, positionh: 0 });
                                    }}
                                    onDragOver={(e) => e.preventDefault()}
                                >
                                    {formLines.length === 0 && (
                                        <div
                                            className={`h-24 flex items-center justify-center rounded-md transition-colors ${isDragging ? 'bg-blue-100' : ''}`}
                                            onDrop={(e) => { e.stopPropagation(); handleDrop({ positionv: 0, positionh: 0 }); }}
                                            onDragOver={(e) => e.preventDefault()}
                                        >
                                            <p className="text-center text-gray-500">Drop fields here</p>
                                        </div>
                                    )}
                                    {formLines.reduce((acc, line) => {
                                        const v = line.positionv || 0;
                                        if (!acc[v]) acc[v] = [];
                                        acc[v].push(line);
                                        return acc;
                                    }, [] as Partial<formLines>[][]).map((row, v) => (
                                        <div key={v} className="flex items-center bg-gray-50 p-1 rounded-md overflow-x-auto" onDragOver={(e) => e.preventDefault()}>
                                            <div className={`w-8 h-10 rounded-md transition-colors ${isDragging ? 'bg-blue-200' : ''}`} onDrop={(e) => { e.stopPropagation(); handleDrop({ positionv: v, positionh: 0 }); }} onDragOver={(e) => e.preventDefault()} />
                                            {row.sort((a, b) => (a.positionh || 0) - (b.positionh || 0)).map((line, h) => (
                                                <div key={formLines.findIndex(l => l === line)} className="flex-none flex items-center">
                                                    <div className="p-3 border rounded bg-white shadow-sm w-64" draggable onDragStart={() => handleLineDragStart(line)}>
                                                        <div className="flex items-center gap-2">
                                                            {line.tag_id && (
                                                                <DisplayIcon iconName={availableTags.find(t => t.id === line.tag_id)?.icon || 'circle-dot'} size={16} className="text-gray-600" />
                                                            )}
                                                            <span>{line.label} ({line.type})</span>
                                                        </div>
                                                        <div className="flex items-center space-x-4 mt-2">
                                                            <Label className="flex items-center space-x-2">
                                                                <Checkbox className="w-4 h-4" defaultChecked={!!line.required} onCheckedChange={(checked) => updateFormLine(line.line_id!, { required: !!checked })} />
                                                                <span className="text-sm text-gray-700">Required</span>
                                                            </Label>
                                                            <Button variant="ghost" size="sm" onClick={() => removeFormLine(line)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                                                        </div>
                                                    </div>
                                                    <div className={`w-8 h-10 rounded-md transition-colors ${isDragging ? 'bg-blue-200' : ''}`} onDrop={(e) => { e.stopPropagation(); handleDrop({ positionv: v, positionh: h + 1 }); }} onDragOver={(e) => e.preventDefault()} />
                                                </div>
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="col-span-4 mt-6 flex justify-between">
                                <Button className="backBtn" variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button className="nextBtn" onClick={goToStep3}>Next</Button>
                                <Button className="closeBtn" variant="ghost" onClick={handleCloseModal}>Close</Button>
                            </div>
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                            <h3 className="font-semibold mb-4">Configure Field Options</h3>
                            <div className="space-y-6 max-h-100 overflow-y-auto">
                                {formLines.reduce((acc, line) => {
                                    const v = line.positionv || 0;
                                    if (!acc[v]) acc[v] = [];
                                    acc[v].push(line);
                                    return acc;
                                }, [] as Partial<formLines>[][]).map((row, v) => (
                                    <div key={`row-${v}`} className="flex items-start gap-2 mb-2">
                                        {row.sort((a, b) => (a.positionh || 0) - (b.positionh || 0)).map((line) => {
                                            const tag = availableTags.find((t) => t.id === line.tag_id);
                                            if (!tag || !line.line_id) return null;
                                            return (
                                                <div key={line.line_id} className="border rounded flex-1 min-w-75">
                                                    <div className="flex items-center gap-2">
                                                        {tag.icon && <DisplayIcon iconName={tag.icon} size={16} className="text-gray-600" />}
                                                        <h4 className="font-medium">{line.label}</h4>
                                                    </div>
                                                    {tag.tag_options && Array.isArray(tag.tag_options) && tag.tag_options.length > 0 ? (
                                                        <div className="grid grid-cols-2 gap-2 mt-2">
                                                            {tag.tag_options.map((option) => (
                                                                <Label key={option.id} className="flex items-center space-x-2">
                                                                    <Checkbox className="w-4 h-4" defaultChecked={selectedOptions[line.line_id!]?.includes(option.id)} onCheckedChange={() => handleOptionChange(line.line_id!, option.id)} />
                                                                    <span className="text-sm text-gray-700">{option.option_value || ''}</span>
                                                                </Label>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="mt-2 text-sm text-gray-600">
                                                            {line.type === 'number' ? 'Numeric field - no options to configure' :
                                                                line.type === 'text' ? 'Text field - no options to configure' :
                                                                    'Field has no predefined options'}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div className="mt-6 flex justify-between">
                                <Button className="backBtn" variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                <Button className={editingForm ? "updateBtn" : "createBtn"} onClick={handleSubmit}>{editingForm ? "Update" : "Create"}</Button>
                                <Button className="closeBtn" variant="ghost" onClick={handleCloseModal}>Close</Button>
                            </div>
                        </div>
                    )}
                </div>
            </Modal>

            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseDeleteModal} title="Delete Form">
                <p className="text-gray-700">Are you sure you want to delete this form <strong>"{deletingForm?.title}"</strong>?</p>
                <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
                <div className="mt-6 flex justify-end space-x-2">
                    <Button className="deleteBtn" onClick={handleDelete}>Delete</Button>
                    <Button className="closeBtn" variant="ghost" onClick={handleCloseDeleteModal}>Close</Button>
                </div>
            </Modal>
        </div>
    );
};

export default FormsPage;