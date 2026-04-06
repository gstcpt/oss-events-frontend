'use client';

import { useState, useEffect } from 'react';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getProviders, createProvider, updateProvider, deleteUser, getCompanies } from '@/lib/api/user';
import { useTranslations } from 'next-intl';

interface Provider {
  id: number;
  firstname?: string;
  lastname?: string;
  email: string;
  username: string;
  phone?: string;
  status: number;
  company_id?: number;
  companies_users_company_idTocompanies?: { id: number; title: string };
  companies_user?: { id: number; title: string };
}
interface Company {
  id: number;
  title: string;
}
export default function Providers() {
  const t = useTranslations('Dashboard.users.providers');
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null);
  const [deletingProvider, setDeletingProvider] = useState<Provider | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ firstname: '', lastname: '', username: '', email: '', phone: '', password: '', company_id: '', status: '1' });
  const isRoot = user?.role === 'Root';
  const columns: DataTableColumn<Provider>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('name'), accessor: 'firstname', cell: (provider) => `${provider.firstname || ''} ${provider.lastname || ''}`.trim() || provider.username },
    { header: t('username'), accessor: 'username' },
    { header: t('email'), accessor: 'email' },
    { header: t('phone'), accessor: 'phone' },
    {
      header: t('status'), accessor: 'status', cell: (provider) => (
        <span className={`px-2 py-1 rounded-full text-xs ${provider.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>{provider.status === 1 ? t('active') : t('inactive')}</span>
      )
    },
    ...(isRoot ? [{
      header: "Company",
      accessor: "companies",
      cell: (provider: any) => <span className="">{provider.companies_user?.title || "System Core"}</span>
    }] : []),
  ];
  useEffect(() => {
    if (user) {
      fetchProviders();
      if (isRoot) { fetchCompanies(); }
    }
  }, [user]);
  const fetchProviders = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getProviders(user.id);
      setProviders(data);
    } catch (error) { toast.error(t('errorFetchingProviders')); }
    finally { setLoading(false); }
  };
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) { toast.error(t('errorFetchingCompanies')); }
  };
  const handleAdd = () => {
    setEditingProvider(null);
    setFormData({
      firstname: '',
      lastname: '',
      username: '',
      email: '',
      phone: '',
      password: '',
      company_id: isRoot ? 'none' : user?.company_id?.toString() || 'none',
      status: '1'
    });
    setIsModalOpen(true);
  };
  const handleEdit = (provider: Provider) => {
    setEditingProvider(provider);
    setFormData({
      firstname: provider.firstname || '',
      lastname: provider.lastname || '',
      username: provider.username,
      email: provider.email,
      phone: provider.phone || '',
      password: '',
      company_id: provider.company_id?.toString() || 'none',
      status: provider.status.toString()
    });
    setIsModalOpen(true);
  };
  const handleDelete = (provider: Provider) => {
    setDeletingProvider(provider);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingProvider) {
      try {
        await deleteUser(deletingProvider.id);
        fetchProviders();
        toast.success(t('providerDeletedSuccessfully'));
      } catch (error) { toast.error(t('errorDeletingProvider')); }
    }
    setIsDeleteModalOpen(false);
    setDeletingProvider(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        company_id: formData.company_id && formData.company_id !== 'none' ? Number(formData.company_id) : undefined,
        phone: formData.phone || undefined,
        status: Number(formData.status)
      };
      if (!isRoot && user?.company_id) {
        payload.company_id = Number(user.company_id);
      }
      if (editingProvider) {
        await updateProvider(editingProvider.id, payload, user);
      } else {
        await createProvider(payload, user);
      }
      setIsModalOpen(false);
      fetchProviders();
      toast.success(editingProvider ? t('providerUpdatedSuccessfully') : t('providerCreatedSuccessfully'));
    } catch (error) { toast.error(t('errorSavingProvider')); }
  };
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('providersManagement')}</h2>
          <Button onClick={handleAdd} arial-label={t('addNewProvider')} className="addNewBtn"><i className="fa fa-plus mr-2"></i> {t('addNewProvider')}</Button>
        </div>
        <div className="p-6">{loading ? (<div className="text-center py-4">{t('loadingProviders')}</div>) : (<DataTable columns={columns} data={providers} onEdit={handleEdit} onDelete={handleDelete} defaultSort={{ key: 'id', direction: 'descending' }} />)}</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProvider ? t('editProvider') : t('addNewProvider')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="firstname">{t('firstName')}</Label>
              <Input id="firstname" value={formData.firstname} onChange={(e) => setFormData({ ...formData, firstname: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="lastname">{t('lastName')}</Label>
              <Input id="lastname" value={formData.lastname} onChange={(e) => setFormData({ ...formData, lastname: e.target.value })} />
            </div>
          </div>
          <div>
            <Label htmlFor="username">{t('username')}</Label>
            <Input id="username" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="email">{t('email')}</Label>
            <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="phone">{t('phoneOptional')}</Label>
            <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1234567890" />
          </div>
          {!editingProvider && (
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingProvider} minLength={8} />
            </div>
          )}
          {isRoot && (
            <div>
              <Label htmlFor="company">{t('company')}</Label>
              <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                <SelectTrigger><SelectValue placeholder={t('selectCompany')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noCompany')}</SelectItem>
                  {companies.map((company) => (<SelectItem key={company.id} value={company.id.toString()}>{company.title}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="status">{t('status')}</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('active')}</SelectItem>
                <SelectItem value="0">{t('inactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="submit" className={editingProvider ? 'updateBtn' : 'createBtn'}>{editingProvider ? t('update') : t('create')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('deleteProvider')}>
        <div className="space-y-6">
          <p className="text-gray-700">{t('confirmDeleteProvider')} <strong>{deletingProvider?.firstname} {deletingProvider?.lastname}</strong>?</p>
          <p className="text-sm text-gray-600">{t('actionCannotBeUndone')}</p>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="button" className="deleteBtn" onClick={confirmDelete}>{t('delete')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>{t('close')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}