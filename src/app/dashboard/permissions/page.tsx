'use client';

import { useEffect, useState } from 'react';
import { Permission } from '@/types/permissions';
import Modal from '@/components/ui/Modal';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { getPermissions, createPermission, updatePermission, deletePermission } from '@/lib/api/permissions';
import { toast } from 'sonner';
import { getModules } from '@/lib/api/modules';
import { Module } from '@/types/modules';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj);
};

export default function Permissions() {
  const t = useTranslations('Dashboard.permissions');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState<Permission | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPermissions = async () => {
    try {
      const data = await getPermissions();
      const permissionsArray = data?.permissions || data;
      setPermissions(Array.isArray(permissionsArray) ? permissionsArray : []);
    } catch (error) {
      toast.error(t('errorLoading'));
      setPermissions([]);
    }
  };

  const fetchModules = async () => {
    try {
      const data = await getModules();
      const modulesArray = data?.modules || data;
      setModules(Array.isArray(modulesArray) ? modulesArray : []);
    } catch (error) {
      toast.error(t('errorLoading'));
      setModules([]);
    }
  };

  useEffect(() => {
    fetchPermissions();
    fetchModules();
  }, []);

  const handleAddPermission = async (data: Omit<Permission, 'id'>) => {
    try {
      await createPermission(data);
      fetchPermissions(); // Re-fetch permissions after adding
      setIsAddModalOpen(false);
      toast.success(t('permissionCreated'));
    } catch (error) {
      toast.error(t('errorSaving'));
    }
  };

  const handleEditPermission = async (id: number, data: Partial<Omit<Permission, 'id'>>) => {
    try {
      await updatePermission(id, data);
      fetchPermissions();
      setIsEditModalOpen(false);
      setSelectedPermission(null);
      toast.success(t('permissionUpdated'));
    } catch (error) {
      toast.error(t('errorSaving'));
    }
  };

  const handleDeletePermission = async () => {
    if (selectedPermission) {
      try {
        await deletePermission(selectedPermission.id);
        fetchPermissions();
        setIsDeleteModalOpen(false);
        setSelectedPermission(null);
        toast.success(t('permissionDeleted'));
      } catch (error) {
        toast.error(t('errorSaving'));
      }
    }
  };

  const openEditModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (permission: Permission) => {
    setSelectedPermission(permission);
    setIsDeleteModalOpen(true);
  };

  const columns: DataTableColumn<Permission & { module?: Module }>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('title_field'), accessor: 'title' },
    { header: t('code'), accessor: 'code' },
    { header: t('module'), accessor: 'module.title' },
    {
      header: t('status'),
      accessor: 'status',
      cell: (item: Permission) => (
        <span className={`px-2 py-1 rounded text-xs ${item.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'
          }`}>
          {item.status === 1 ? t('active') : t('inactive')}
        </span>
      )
    },
  ];

  const permissionsWithModuleData = Array.isArray(permissions) ? permissions.map(permission => {
    const module = Array.isArray(modules) ? modules.find(m => m.id === permission.module_id) : undefined;
    return {
      ...permission,
      module: module
    };
  }) : [];

  const filteredPermissions = permissionsWithModuleData.filter(item =>
    columns.some(column =>
      String(getNestedValue(item, column.accessor))
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold ">{t('title')}</h2>
          <div className="flex items-center space-x-4"><Button onClick={() => setIsAddModalOpen(true)} className="createBtn" aria-label={t('addNewPermission')}><i className="fa fa-plus mr-2"></i>{t('addNewPermission')}</Button></div>
        </div>
        <div className="p-6"><DataTable columns={columns} data={filteredPermissions} onEdit={openEditModal} onDelete={openDeleteModal} defaultSort={{ key: 'id', direction: 'descending' }} /></div>
      </div>
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('addNewPermission')}>
          <form onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const data = { title: formData.get('title') as string, code: formData.get('code') as string, module_id: parseInt(formData.get('moduleId') as string, 10), status: parseInt(formData.get('status') as string, 10) };
            await handleAddPermission(data);
          }}
            className=""
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('title_field')}</label>
              <Input name="title" type="text" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('code')}</label>
              <Input name="code" type="text" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('module')}</label>
              <select name="moduleId" required className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-white text-slate-700 h-10">
                <option value="">{t('selectModule')}</option>
                {Array.isArray(modules) && modules.map(module => (<option key={module.id} value={module.id}>{module.title}</option>))}
              </select>
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('status')}</label>
              <select name="status" required className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-white text-slate-700 h-10">
                <option value="1">{t('active')}</option>
                <option value="0">{t('inactive')}</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="createBtn" aria-label={t('create')}>{t('create')}</Button>
              <Button type="button" onClick={() => setIsAddModalOpen(false)} className="closeBtn">{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}

      {isEditModalOpen && selectedPermission && (
        <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedPermission(null); }} title={t('editPermission')}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = { title: formData.get('title') as string, code: formData.get('code') as string, module_id: parseInt(formData.get('moduleId') as string, 10), status: parseInt(formData.get('status') as string, 10) };
              await handleEditPermission(selectedPermission.id, data);
            }}
            className=""
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('title_field')}</label>
              <Input name="title" type="text" defaultValue={selectedPermission.title} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('code')}</label>
              <Input name="code" type="text" defaultValue={selectedPermission.code} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('module')}</label>
              <select name="moduleId" defaultValue={selectedPermission.module_id} required className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-white text-slate-700 h-10">
                <option value="">{t('selectModule')}</option>
                {Array.isArray(modules) && modules.map(module => (<option key={module.id} value={module.id}>{module.title}</option>))}
              </select>
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('status')}</label>
              <select name="status" defaultValue={selectedPermission.status} required className="mt-1 p-2 border border-gray-300 rounded-md w-full bg-white text-slate-700 h-10">
                <option value="1">{t('active')}</option>
                <option value="0">{t('inactive')}</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="updateBtn" aria-label={t('update')}>{t('update')}</Button>
              <Button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedPermission(null); }} className="closeBtn">{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}
      {isDeleteModalOpen && selectedPermission && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedPermission(null); }} title={t('confirmDelete')}>
          <p className="text-slate-700">{t('confirmDeleteMessage')} <strong>{selectedPermission.title}</strong>?</p>
          <p className="text-sm text-slate-500 mt-2">{t('deleteWarning')}</p>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="button" onClick={handleDeletePermission} className="deleteBtn" aria-label={t('deletePermission')}>{t('confirmDelete')}</Button>
            <Button type="button" onClick={() => { setIsDeleteModalOpen(false); setSelectedPermission(null); }} className="closeBtn">{t('close')}</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}