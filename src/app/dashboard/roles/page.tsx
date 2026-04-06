"use client";
import { useEffect, useState, useMemo, useCallback } from "react";
import { Role } from "@/types/roles";
import Modal from "@/components/ui/Modal";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import { getRoles, createRole, updateRole, deleteRole } from "@/lib/api/roles";
import { toast } from "sonner";
import { getPermissions } from "@/lib/api/permissions";
import { Permission } from "@/types/permissions";
import { getModules } from "@/lib/api/modules";
import { Module } from "@/types/modules";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertCircle, Search, CheckCircle, ShieldAlert, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations } from 'next-intl';

// ─── Permission Picker ────────────────────────────────────────────────────────
function PermissionPicker({
    modules,
    selectedIds,
    onChange,
}: {
    modules: Module[];
    selectedIds: string[];
    onChange: (ids: string[]) => void;
}) {
    const [search, setSearch] = useState("");
    const [expanded, setExpanded] = useState<Record<string | number, boolean>>({});

    const toggle = useCallback((id: string) => {
        onChange(selectedIds.includes(id) ? selectedIds.filter(x => x !== id) : [...selectedIds, id]);
    }, [selectedIds, onChange]);

    const toggleModule = useCallback((moduleId: string | number, permIds: string[]) => {
        const allSelected = permIds.every(id => selectedIds.includes(id));
        if (allSelected) {
            onChange(selectedIds.filter(id => !permIds.includes(id)));
        } else {
            onChange([...new Set([...selectedIds, ...permIds])]);
        }
    }, [selectedIds, onChange]);

    const toggleExpand = useCallback((moduleId: string | number) => {
        setExpanded(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
    }, []);

    const filtered = useMemo(() =>
        modules.map(m => ({
            ...m,
            permissions: (m.permissions || []).filter(p =>
                search === "" ||
                p.title?.toLowerCase().includes(search.toLowerCase()) ||
                p.code?.toLowerCase().includes(search.toLowerCase()) ||
                m.title?.toLowerCase().includes(search.toLowerCase())
            )
        })).filter(m => m.permissions.length > 0),
        [modules, search]
    );

    const totalSelected = selectedIds.length;
    const totalAll = modules.reduce((sum, m) => sum + (m.permissions?.length || 0), 0);

    const toggleAll = useCallback(() => {
        if (totalSelected === totalAll) { onChange([]); }
        else { onChange(modules.flatMap(m => (m.permissions || []).map(p => String(p.id)))); }
    }, [totalSelected, totalAll, modules, onChange]);

    return (
        <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex items-center gap-3 flex-wrap">
                <div className="relative flex-1 min-w-[140px]">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        type="text"
                        placeholder="Search permissions..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={toggleAll}
                    className="whitespace-nowrap text-sm h-10 px-4"
                >
                    {totalSelected === totalAll ? 'Deselect All' : 'Select All'}
                </Button>
                <span className="text-sm text-gray-500 whitespace-nowrap min-w-[100px] text-right">
                    {totalSelected} / {totalAll} selected
                </span>
            </div>

            {/* Scrollable list - Removed manual scroll restoration to prevent jumps */}
            <div className="max-h-[60vh] sm:max-h-[360px] overflow-y-auto border border-gray-200 rounded-lg bg-white shadow-sm">
                {filtered.length === 0 ? (
                    <p className="text-center text-gray-500 py-6 text-sm">
                        No permissions found
                    </p>
                ) : (
                    filtered.map((module, idx) => {
                        const permIds = (module.permissions || []).map(p => String(p.id));
                        const allChecked = permIds.every(id => selectedIds.includes(id));
                        const someChecked = permIds.some(id => selectedIds.includes(id));
                        const isOpen = !!expanded[module.id];

                        return (
                            <div key={module.id} className={idx < filtered.length - 1 ? 'border-b border-gray-100' : ''}>
                                {/* Module header */}
                                <div
                                    onClick={() => toggleExpand(module.id)}
                                    className="flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer select-none"
                                >
                                    <input
                                        type="checkbox"
                                        checked={allChecked}
                                        ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                                        onChange={() => toggleModule(module.id, permIds)}
                                        onClick={e => e.stopPropagation()}
                                        className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0 border-gray-300 focus:ring-blue-500 transition-all"
                                    />
                                    <span className="flex-1 text-sm font-semibold text-gray-900 tracking-tight">
                                        {module.title}
                                        <span className="ml-2 text-xs font-normal text-gray-500">
                                            ({permIds.filter(id => selectedIds.includes(id)).length}/{permIds.length})
                                        </span>
                                    </span>
                                    <i className={`fas fa-chevron-${isOpen ? 'up' : 'down'} text-xs text-gray-400 transition-transform`} />
                                </div>

                                {/* Permission rows */}
                                {isOpen && (
                                    <div className="flex flex-col bg-white">
                                        {(module.permissions || []).map((perm) => {
                                            const isChecked = selectedIds.includes(String(perm.id));
                                            return (
                                                <label
                                                    key={perm.id}
                                                    className={`flex items-start gap-3 px-5 py-2.5 cursor-pointer border-t border-gray-50 transition-colors hover:bg-blue-50/40 ${isChecked ? 'bg-blue-50/60' : ''}`}
                                                >
                                                    <div className="pt-0.5">
                                                        <input
                                                            type="checkbox"
                                                            checked={isChecked}
                                                            onChange={() => toggle(String(perm.id))}
                                                            className="w-4 h-4 text-blue-600 rounded cursor-pointer shrink-0 border-gray-300 focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div className="flex flex-col min-w-0 overflow-hidden">
                                                        <span className="text-sm text-gray-900 font-medium leading-snug">
                                                            {perm.title}
                                                        </span>
                                                        <span className="text-xs text-gray-500 font-mono mt-0.5 truncate max-w-full">
                                                            {perm.code}
                                                        </span>
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}

// ─── Role Form ───────────────────────────────────────────────────────────────
function RoleForm({
    role,
    modules,
    selectedPermissionIds,
    onPermissionChange,
    onSubmit,
    onClose,
    submitLabel,
}: {
    role?: Role | null;
    modules: Module[];
    selectedPermissionIds: string[];
    onPermissionChange: (ids: string[]) => void;
    onSubmit: (title: string, permissionIds: number[]) => void;
    onClose: () => void;
    submitLabel: string;
}) {
    const t = useTranslations('Dashboard.roles');
    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const title = (e.currentTarget.elements.namedItem('title') as HTMLInputElement).value;
                onSubmit(title, selectedPermissionIds.map(Number));
            }}
            className="flex flex-col gap-6 p-6"
        >
            <div className="mb-4 text-slate-700">
                <label className="block text-sm font-medium mb-1.5">{t('title_field')}</label>
                <Input name="title" type="text" required defaultValue={role?.title || ""} autoFocus />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('permissions')}</label>
                <div className="bg-gray-50/30 p-2 rounded-lg border border-gray-100">
                    <PermissionPicker
                        modules={modules}
                        selectedIds={selectedPermissionIds}
                        onChange={onPermissionChange}
                    />
                </div>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                <Button type="submit" className="createBtn">{submitLabel}</Button>
                <Button type="button" variant="outline" onClick={onClose} className="closeBtn">{t('close')}</Button>
            </div>
        </form>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function Roles() {
    const t = useTranslations('Dashboard.roles');
    const [roles, setRoles] = useState<Role[]>([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);
    const [modules, setModules] = useState<Module[]>([]);

    const fetchRoles = async () => {
        try { setRoles(await getRoles()); }
        catch { toast.error(t('errorLoading')); }
    };
    const fetchPermissions = async () => {
        try { const data = await getPermissions(); setPermissions(data.permissions || []); }
        catch { toast.error(t('errorLoading')); }
    };
    const fetchModules = async () => {
        try { const data = await getModules(); setModules(data.modules || []); }
        catch { toast.error(t('errorLoading')); }
    };

    useEffect(() => { fetchRoles(); fetchPermissions(); fetchModules(); }, []);

    const handleAddRole = async (title: string, permissionIds: number[]) => {
        try {
            await createRole({ title, permissionIds });
            fetchRoles();
            setIsAddModalOpen(false);
            toast.success(t('roleCreated'));
        } catch { toast.error(t('errorSaving')); }
    };

    const handleEditRole = async (title: string, permissionIds: number[]) => {
        if (!selectedRole) return;
        try {
            await updateRole(selectedRole.id, { title, permissionIds });
            fetchRoles();
            setIsEditModalOpen(false);
            setSelectedRole(null);
            toast.success(t('roleUpdated'));
        } catch { toast.error(t('errorSaving')); }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        try {
            await deleteRole(selectedRole.id);
            fetchRoles();
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
            toast.success(t('roleDeleted'));
        } catch { toast.error(t('errorSaving')); }
    };

    const openAddModal = () => { setSelectedRole(null); setSelectedPermissionIds([]); setIsAddModalOpen(true); };
    const openEditModal = (role: Role) => {
        setSelectedRole(role);
        setSelectedPermissionIds(role.role_permission?.map((rp: any) => String(rp.permissions.id)) || []);
        setIsEditModalOpen(true);
    };
    const openDeleteModal = (role: Role) => { setSelectedRole(role); setIsDeleteModalOpen(true); };
    const openPermissionsModal = (role: Role) => { setSelectedRole(role); setIsPermissionsModalOpen(true); };

    const columns: DataTableColumn<Role>[] = [
        { header: t('id'), accessor: "id" },
        { header: t('title_field'), accessor: "title" },
        {
            header: t('permissions'),
            accessor: "permissions",
            cell: (item: Role) => (
                <Button onClick={() => openPermissionsModal(item)} variant="outline" className="counterClick min-w-[40px] h-8 text-sm font-medium" title={t('viewPermissions')}>
                    {(item as any).role_permission?.length || 0}
                </Button>
            ),
        },
    ];

    return (
        <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-sm border border-gray-100">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{t('title')}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t('manageRolesDescription')}</p>
                    </div>
                    <Button onClick={openAddModal} className="addNewBtn bg-blue-600 hover:bg-blue-700 text-white" aria-label={t('addNewRole')}>
                        <i className="fas fa-plus mr-2"></i>{t('addNewRole')}
                    </Button>
                </div>
                <div className="p-6">
                    <DataTable
                        columns={columns}
                        data={roles}
                        onEdit={openEditModal}
                        onDelete={openDeleteModal}
                        defaultSort={{ key: 'id', direction: 'descending' }}
                    />
                </div>
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('addNewRole')}>
                    <RoleForm
                        key="add-new-role"
                        modules={modules}
                        selectedPermissionIds={selectedPermissionIds}
                        onPermissionChange={setSelectedPermissionIds}
                        onSubmit={handleAddRole}
                        onClose={() => setIsAddModalOpen(false)}
                        submitLabel={t('createRole')}
                    />
                </Modal>
            )}

            {/* Edit Modal */}
            {isEditModalOpen && selectedRole && (
                <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedRole(null); }} title={`${t('editRole')}: ${selectedRole.title}`}>
                    <RoleForm
                        key={`edit-role-${selectedRole.id}`}
                        role={selectedRole}
                        modules={modules}
                        selectedPermissionIds={selectedPermissionIds}
                        onPermissionChange={setSelectedPermissionIds}
                        onSubmit={handleEditRole}
                        onClose={() => { setIsEditModalOpen(false); setSelectedRole(null); }}
                        submitLabel={t('saveChanges')}
                    />
                </Modal>
            )}

            {/* Delete Modal */}
            {isDeleteModalOpen && selectedRole && (
                <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedRole(null); }} title={t('confirmDelete')}>
                    <p className="text-slate-700">{t('confirmDeleteMessage')} <strong>{selectedRole.title}</strong>?</p>
                    <p className="text-sm text-slate-500 mt-2">{t('deleteWarning')}</p>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button type="button" variant="destructive" onClick={handleDeleteRole} className="deleteBtn" aria-label={t('deleteRole')}>{t('confirmDelete')}</Button>
                        <Button type="button" variant="outline" onClick={() => { setIsDeleteModalOpen(false); setSelectedRole(null); }} className="closeBtn">{t('close')}</Button>
                    </div>
                </Modal>
            )}

            {/* View Permissions Modal */}
            {isPermissionsModalOpen && selectedRole && (
                <Modal isOpen={isPermissionsModalOpen} onClose={() => { setIsPermissionsModalOpen(false); setSelectedRole(null); }} title={`${t('permissions')}: ${selectedRole.title}`}>
                    <div className="mb-4">
                        {selectedRole.role_permission && (selectedRole.role_permission as any[]).length > 0 ? (
                            <div className="max-h-[450px] overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 custom-scrollbar">
                                {(selectedRole.role_permission as any[]).map((rp: any, idx, arr) => (
                                    <div key={rp.id || rp.permissions?.id} className={`flex items-start gap-3 p-3 bg-white ${idx < arr.length - 1 ? 'border-b border-gray-100' : ''}`}>
                                        <div className="pt-1">
                                            <i className="fas fa-check-circle text-green-500 text-sm"></i>
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-sm font-semibold text-gray-900 leading-snug">{rp.permissions?.title}</span>
                                            <span className="text-xs text-gray-500 font-mono mt-0.5">{rp.permissions?.code}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 px-4 bg-gray-50 border border-dashed border-gray-200 rounded-lg">
                                <i className="fas fa-shield-alt text-gray-300 text-4xl mb-3"></i>
                                <p className="text-gray-500 text-sm font-medium">No permissions configured.</p>
                                <p className="text-gray-400 text-xs mt-1 text-center">This role currently has no access rights assigned.</p>
                            </div>
                        )}
                    </div>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button type="button" variant="outline" onClick={() => { setIsPermissionsModalOpen(false); setSelectedRole(null); }} className="closeBtn">{t('close')}</Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}