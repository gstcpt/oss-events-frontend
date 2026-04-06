'use client';
import { useEffect, useState } from 'react';
import { Module } from '@/types/modules';
import Modal from '@/components/ui/Modal';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { getModules, createModule, updateModule, deleteModule } from '@/lib/api/modules';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
const getNestedValue = (obj: any, path: string) => { return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj); };
export default function Modules() {
  const t = useTranslations('Dashboard.modules');
  const [modules, setModules] = useState<Module[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
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
  useEffect(() => { fetchModules(); }, []);
  const handleAddModule = async (title: string, code: string) => {
    try {
      await createModule(title, code);
      fetchModules();
      setIsAddModalOpen(false);
      toast.success(t('moduleCreated'));
    } catch (error) { toast.error(t('errorSaving')); }
  };
  const handleEditModule = async (id: number, title: string, code: string) => {
    try {
      await updateModule(id, title, code);
      fetchModules();
      setIsEditModalOpen(false);
      setSelectedModule(null);
      toast.success(t('moduleUpdated'));
    } catch (error) { toast.error(t('errorSaving')); }
  };
  const handleDeleteModule = async () => {
    if (selectedModule) {
      try {
        await deleteModule(selectedModule.id);
        fetchModules();
        setIsDeleteModalOpen(false);
        setSelectedModule(null);
        toast.success(t('moduleDeleted'));
      } catch (error) { toast.error(t('errorSaving')); }
    }
  };
  const openEditModal = (module: Module) => {
    setSelectedModule(module);
    setIsEditModalOpen(true);
  };
  const openDeleteModal = (module: Module) => {
    setSelectedModule(module);
    setIsDeleteModalOpen(true);
  };
  const openPermissionsModal = (module: Module) => {
    setSelectedModule(module);
    setIsPermissionsModalOpen(true);
  };
  const columns: DataTableColumn<Module>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('title_field'), accessor: 'title' },
    { header: t('code'), accessor: 'code' },
    {
      header: t('numberPermissions'),
      accessor: 'permissions',
      cell: (item: Module) => (<Button onClick={() => openPermissionsModal(item)} className="counterClick">{item.permissions?.length || 0}</Button>),
    },
  ];
  const filteredModules = Array.isArray(modules) ? modules.filter(item => columns.some(column => String(getNestedValue(item, column.accessor)).toLowerCase().includes(searchTerm.toLowerCase()))) : [];
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold ">{t('title')}</h2>
          <div className="flex items-center space-x-4"><Button onClick={() => setIsAddModalOpen(true)} className="createBtn" aria-label={t('addNewModule')}><i className="fa fa-plus mr-2"></i>{t('addNewModule')}</Button></div>
        </div>
        <div className="p-6">
          <DataTable columns={columns} data={filteredModules} onEdit={openEditModal} onDelete={openDeleteModal} defaultSort={{ key: 'id', direction: 'descending' }} />
        </div>
      </div>
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('addNewModule')}>
          <form className=""
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get('title') as string;
              const code = formData.get('code') as string;
              await handleAddModule(title, code);
            }}
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('title_field')}</label>
              <Input name="title" type="text" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('code')}</label>
              <Input name="code" type="text" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="createBtn" aria-label={t('create')}>{t('create')}</Button>
              <Button type="button" onClick={() => setIsAddModalOpen(false)} className="closeBtn">{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}
      {isEditModalOpen && selectedModule && (
        <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedModule(null); }} title={t('editModule')}>
          <form className=""
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get('title') as string;
              const code = formData.get('code') as string;
              await handleEditModule(selectedModule.id, title, code);
            }}
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('title_field')}</label>
              <Input name="title" type="text" defaultValue={selectedModule.title} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('code')}</label>
              <Input name="code" type="text" defaultValue={selectedModule.code} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="updateBtn" aria-label={t('update')}>{t('update')}</Button>
              <Button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedModule(null); }} className="closeBtn">{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}
      {isDeleteModalOpen && selectedModule && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedModule(null); }} title={t('confirmDelete')}>
          <p className="text-slate-700">{t('confirmDeleteMessage')} <strong>{selectedModule.title}</strong>?</p>
          <p className="text-sm text-slate-500 mt-2">{t('deleteWarning')}</p>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="button" onClick={handleDeleteModule} className="deleteBtn" aria-label={t('deleteModule')}>{t('confirmDelete')}</Button>
            <Button type="button" onClick={() => { setIsDeleteModalOpen(false); setSelectedModule(null); }} className="closeBtn">{t('close')}</Button>
          </div>
        </Modal>
      )}
      {isPermissionsModalOpen && selectedModule && (
        <Modal isOpen={isPermissionsModalOpen} onClose={() => { setIsPermissionsModalOpen(false); setSelectedModule(null); }} title={`${t('permissions')} : ${selectedModule.title}`}>
          <div className="my-4">
            {selectedModule.permissions && selectedModule.permissions.length > 0 ? (
              <div className="space-y-2">
                {selectedModule.permissions.map((permission: any) => (<div key={permission.id} className="bg-gray-100 p-3 rounded-lg flex items-center justify-between"><span className="text-sm font-medium">{permission.title}</span></div>))}
              </div>
            ) : (<p className="text-center text-slate-500 py-4">No permissions found for this module.</p>)}
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6"><Button type="button" onClick={() => { setIsPermissionsModalOpen(false); setSelectedModule(null); }} className="closeBtn">{t('close')}</Button></div>
        </Modal>
      )}
    </div>
  );
}