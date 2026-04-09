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
import { getClients, createClient, updateClient, deleteUser, getCompanies } from '@/lib/api/user';
import { useTranslations } from 'next-intl';

interface Client {
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
export default function Clients() {
  const t = useTranslations('Dashboard.users.clients');
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ firstname: '', lastname: '', username: '', email: '', phone: '', password: '', company_id: '', status: '1' });
  const isRoot = user?.role === 'Root';
  const columns: DataTableColumn<Client>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('name'), accessor: 'firstname', cell: (client) => `${client.firstname || ''} ${client.lastname || ''}`.trim() || client.username },
    { header: t('username'), accessor: 'username' },
    { header: t('email'), accessor: 'email' },
    { header: t('phone'), accessor: 'phone' },
    {
      header: t('status'), accessor: 'status', cell: (client) => (
        <span className={`px-2 py-1 rounded-full text-xs ${client.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>{client.status === 1 ? t('active') : t('inactive')}</span>
      )
    },
    ...(isRoot ? [{
      header: t('company'),
      accessor: "companies",
      cell: (client: any) => <span className="">{client.companies_user?.title || t('systemCore')}</span>
    }] : []),
  ];
  useEffect(() => {
    if (user) {
      fetchClients();
      if (isRoot) { fetchCompanies(); }
    }
  }, [user]);
  const fetchClients = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getClients(user.id);
      setClients(data);
    } catch (error) { toast.error(t('errorFetchingClients')); }
    finally { setLoading(false); }
  };
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) { toast.error(t('errorFetchingCompanies')); }
  };
  const handleAdd = () => {
    setEditingClient(null);
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
  const handleEdit = (client: Client) => {
    setEditingClient(client);
    setFormData({
      firstname: client.firstname || '',
      lastname: client.lastname || '',
      username: client.username,
      email: client.email,
      phone: client.phone || '',
      password: '',
      company_id: client.company_id?.toString() || 'none',
      status: client.status.toString()
    });
    setIsModalOpen(true);
  };
  const handleDelete = (client: Client) => {
    setDeletingClient(client);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingClient) {
      try {
        await deleteUser(deletingClient.id);
        fetchClients();
        toast.success(t('clientDeletedSuccessfully'));
      } catch (error) { toast.error(t('errorDeletingClient')); }
    }
    setIsDeleteModalOpen(false);
    setDeletingClient(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        ...formData,
        company_id: formData.company_id && formData.company_id !== 'none' ? Number(formData.company_id) : undefined,
        phone: formData.phone || undefined,
        status: Number(formData.status)
      };
      if (!isRoot && user?.company_id) {
        payload.company_id = Number(user.company_id);
      }
      if (editingClient && !formData.password) {
        delete payload.password;
      }
      if (editingClient) {
        await updateClient(editingClient.id, payload, user);
      } else {
        await createClient(payload, user);
      }
      setIsModalOpen(false);
      fetchClients();
      toast.success(editingClient ? t('clientUpdatedSuccessfully') : t('clientCreatedSuccessfully'));
    } catch (error) { toast.error(t('errorSavingClient')); }
  };
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('clientsManagement')}</h2>
          <Button onClick={handleAdd} className="addNewBtn"><i className="fa fa-plus mr-2"></i> {t('addNewClient')}</Button>
        </div>
        <div className="p-6">{loading ? (<div className="text-center py-4">{t('loadingClients')}</div>) : (<DataTable columns={columns} data={clients} onEdit={handleEdit} onDelete={handleDelete} defaultSort={{ key: 'id', direction: 'descending' }} />)}</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingClient ? t('editClient') : t('addNewClient')}>
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
          {!editingClient && (
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingClient} minLength={8} />
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
            <Button type="submit" className={editingClient ? 'updateBtn' : 'createBtn'}>{editingClient ? t('update') : t('create')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('deleteClient')}>
        <p className="text-gray-700">{t('confirmDeleteClient')} <strong>{deletingClient?.firstname} {deletingClient?.lastname}</strong>?</p>
        <p className="text-sm text-gray-600">{t('actionCannotBeUndone')}</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDelete}>{t('delete')}</Button>
          <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>{t('close')}</Button>
        </div>
      </Modal>
    </div>
  );
}