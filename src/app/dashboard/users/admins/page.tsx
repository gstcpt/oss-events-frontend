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
import { getAdmins, createAdmin, updateAdmin, deleteUser, getCompanies } from '@/lib/api/user';
import { useTranslations } from 'next-intl';

interface Admin {
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
export default function Admins() {
  const t = useTranslations('Dashboard.users.admins');
  const { user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ firstname: '', lastname: '', username: '', email: '', phone: '', password: '', company_id: '', status: '1' });
  const isRoot = user?.role === 'Root';
  const columns: DataTableColumn<Admin>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('name'), accessor: 'firstname', cell: (admin) => `${admin.firstname || ''} ${admin.lastname || ''}`.trim() || admin.username },
    { header: t('username'), accessor: 'username' },
    { header: t('email'), accessor: 'email' },
    { header: t('phone'), accessor: 'phone' },
    {
      header: t('status'), accessor: 'status', cell: (admin) => (
        <span className={`px-2 py-1 rounded-full text-xs ${admin.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>{admin.status === 1 ? t('active') : t('inactive')}</span>
      )
    },
    ...(isRoot ? [{
      header: t('company'),
      accessor: "companies",
      cell: (admin: any) => <span className="">{admin.companies_user?.title || t('systemCore')}</span>
    }] : []),
  ];
  useEffect(() => {
    if (user) {
      fetchAdmins();
      if (isRoot) { fetchCompanies(); }
    }
  }, [user]);
  const fetchAdmins = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getAdmins(user.id);
      setAdmins(data);
    } catch (error) { toast.error(t('errorFetchingAdmins')); }
    finally { setLoading(false); }
  };
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) { toast.error(t('errorFetchingCompanies')); }
  };
  const handleAdd = () => {
    setEditingAdmin(null);
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
  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setFormData({
      firstname: admin.firstname || '',
      lastname: admin.lastname || '',
      username: admin.username,
      email: admin.email,
      phone: admin.phone || '',
      password: '',
      company_id: admin.company_id?.toString() || 'none',
      status: admin.status.toString()
    });
    setIsModalOpen(true);
  };
  const handleDelete = (admin: Admin) => {
    setDeletingAdmin(admin);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingAdmin) {
      try {
        await deleteUser(deletingAdmin.id);
        fetchAdmins();
        toast.success(t('adminDeletedSuccessfully'));
      } catch (error) { toast.error(t('errorDeletingAdmin')); }
    }
    setIsDeleteModalOpen(false);
    setDeletingAdmin(null);
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
      if (editingAdmin && !formData.password) {
        delete payload.password;
      }
      if (editingAdmin) {
        await updateAdmin(editingAdmin.id, payload, user);
      } else {
        await createAdmin(payload, user);
      }
      setIsModalOpen(false);
      fetchAdmins();
      toast.success(editingAdmin ? t('adminUpdatedSuccessfully') : t('adminCreatedSuccessfully'));
    } catch (error) { toast.error(t('errorSavingAdmin')); }
  };
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('adminsManagement')}</h2>
          <Button onClick={handleAdd} className="addNewBtn"><i className="fa fa-plus mr-2"></i> {t('addNewAdmin')}</Button>
        </div>
        <div className="p-6">{loading ? (<div className="text-center py-4">{t('loadingAdmins')}</div>) : (<DataTable columns={columns} data={admins} onEdit={handleEdit} onDelete={handleDelete} defaultSort={{ key: 'id', direction: 'descending' }} />)}</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAdmin ? t('editAdmin') : t('addNewAdmin')}>
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
          {!editingAdmin && (
            <div>
              <Label htmlFor="password">{t('password')}</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required={!editingAdmin} minLength={8} />
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
            <Button type="submit" className={editingAdmin ? 'updateBtn' : 'createBtn'}>{editingAdmin ? t('update') : t('create')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('deleteAdmin')}>
        <p className="text-gray-700">{t('confirmDeleteAdmin')} <strong>{deletingAdmin?.username}</strong>?</p>
        <p className="text-sm text-gray-600">{t('actionCannotBeUndone')}</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDelete}>{t('delete')}</Button>
          <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>{t('close')}</Button>
        </div>
      </Modal>
    </div>
  );
}