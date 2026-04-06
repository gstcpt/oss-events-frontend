'use client';

import { useState, useEffect } from 'react';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAppSetting, getAppSettings, updateAppSetting, deleteAppSetting } from '@/lib/api/app-settings';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

interface AppSetting {
  id: number;
  famille: string;
  title?: string;
  value?: string;
}

export default function AppSettings() {
  const t = useTranslations('Dashboard.appSettings');
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<AppSetting | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<AppSetting | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ famille: '', title: '', value: '' });
  const columns: DataTableColumn<AppSetting>[] = [{ header: t('id'), accessor: 'id' }, { header: t('familles'), accessor: 'famille' }, { header: t('title_field'), accessor: 'title' }, { header: t('value'), accessor: 'value' }];
  useEffect(() => { fetchAppSettings(); }, []);
  const fetchAppSettings = async () => {
    try {
      const response = await getAppSettings();
      setAppSettings(response.appSettings || []);
    }
    catch (error) { toast.error(t('errorFetching')); }
    finally { setLoading(false); }
  };
  const handleAdd = () => {
    setEditingSetting(null);
    setFormData({ famille: '', title: '', value: '' });
    setIsModalOpen(true);
  };
  const handleEdit = (setting: AppSetting) => {
    setEditingSetting(setting);
    setFormData({ famille: setting.famille, title: setting.title || '', value: setting.value || '' });
    setIsModalOpen(true);
  };
  const handleDelete = (setting: AppSetting) => {
    setDeletingSetting(setting);
    setIsDeleteModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingSetting) {
      try {
        await deleteAppSetting(deletingSetting.id);
        fetchAppSettings();
        toast.success(t('settingDeleted'));
      } catch (error) { toast.error(t('errorDeleting')); }
    }
    setIsDeleteModalOpen(false);
    setDeletingSetting(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.famille.trim()) {
      toast.error(t('familleRequired'));
      return;
    }
    try {
      const url = editingSetting ? `/app-settings/${editingSetting.id}` : '/app-settings';
      const method = editingSetting ? 'PATCH' : 'POST';
      await (editingSetting ? updateAppSetting(editingSetting.id, formData) : createAppSetting(formData));
      setIsModalOpen(false);
      fetchAppSettings();
      toast.success(editingSetting ? t('settingUpdated') : t('settingCreated'));
    } catch (error) { toast.error(t('errorSaving')); }
  };
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <Button onClick={handleAdd} className="addNewBtn" aria-label={t('addNewSetting')}><i className="fa fa-plus mr-2"></i>{t('addNewSetting')}</Button>
        </div>
        <div className="p-6">{loading ? (<div className="text-center py-4">{t('loading')}</div>) : (<DataTable columns={columns} data={appSettings} onEdit={handleEdit} onDelete={handleDelete} defaultSort={{ key: 'id', direction: 'descending' }} />)}</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSetting ? t('editSetting') : t('addNewSetting')}>
        <form onSubmit={handleSubmit} className="">
          <div>
            <Label htmlFor="famille">{t('familles')}</Label>
            <Input id="famille" value={formData.famille} onChange={(e) => setFormData({ ...formData, famille: e.target.value })} required placeholder={t('famillePlaceholder')} />
          </div>
          <div>
            <Label htmlFor="title">{t('title_field')}</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder={t('titlePlaceholder')} />
          </div>
          <div>
            <Label htmlFor="value">{t('value')}</Label>
            <Input id="value" value={formData.value} onChange={(e) => setFormData({ ...formData, value: e.target.value })} placeholder={t('valuePlaceholder')} />
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="submit" className={editingSetting ? 'updateBtn' : 'createBtn'}>{editingSetting ? t('save') : t('addNewSetting')}</Button>
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="closeBtn">{t('cancel')}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirmDelete')}>
        <p className="text-gray-700">{t('confirmDeleteMessage')} <strong>{deletingSetting?.famille}</strong>?</p>
        <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDelete}>{t('delete')}</Button>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="closeBtn">{t('cancel')}</Button>
        </div>
      </Modal>
    </div>
  );
}