'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/lib/api';
import { toast } from 'sonner';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { openInvoiceInNewTab } from '@/components/ui/invoice';
import { getAppSettingsByFamille } from '@/lib/api/app-settings';
import { getCompanies } from '@/lib/api/companies';
import { useTranslations } from 'next-intl';
import { Subscription } from '@/types/subscriptions';
import { Pack } from '@/types/packs';
import { Company } from '@/types/companies';
import { getSubscriptions, createSubscription, updateSubscription, deleteSubscription } from '@/lib/api/subscription';
import { getPacks } from '@/lib/api/packs';

export default function Subscriptions() {
  const t = useTranslations('Dashboard.subscriptions');
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [packs, setPacks] = useState<Pack[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null);
  const [deletingSubscription, setDeletingSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    pack_id: '',
    start_date: '',
    end_date: '',
    company_id: '',
    status: '1'
  });
  const isRoot = user?.role === 'Root';
  const columns: DataTableColumn<Subscription>[] = [
    { header: 'ID', accessor: 'id' },
    { header: 'Pack', accessor: 'pack_id', cell: (subscription) => subscription.packs?.title || 'No Pack' },
    ...(isRoot ? [{ header: 'Company', accessor: 'companies.title' }] : []),
    { header: 'Start Date', accessor: 'start_date', cell: (subscription) => subscription.start_date ? new Date(subscription.start_date).toLocaleDateString() : 'Not Set' },
    { header: 'End Date', accessor: 'end_date', cell: (subscription) => subscription.end_date ? new Date(subscription.end_date).toLocaleDateString() : 'Not Set' },
    { header: 'Price', accessor: 'packs.price', cell: (subscription) => subscription.packs?.price ? `${subscription.packs.price} TND` : 'N/A' },
    {
      header: 'Status', accessor: 'status', cell: (subscription) => (
        <span className={`px-2 py-1 rounded-full text-xs ${subscription.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>{subscription.status === 1 ? 'Active' : 'Inactive'}</span>
      )
    }
  ];

  useEffect(() => {
    if (user) {
      fetchSubscriptions();
      fetchPacks();
      if (isRoot) {
        fetchCompanies();
      }
    }
  }, [user]);

  const fetchSubscriptions = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getSubscriptions();
      setSubscriptions(data);
    } catch (error) {
      console.log(error);
      toast.error('Error fetching subscriptions');
    } finally {
      setLoading(false);
    }
  };

  const fetchPacks = async () => {
    try {
      const data = await getPacks();
      setPacks(data.filter((pack: Pack) => pack.status === 1));
    } catch (error) {
      toast.error('Error fetching packs');
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error('Error fetching companies');
    }
  };

  const handleAdd = () => {
    setEditingSubscription(null);
    setFormData({
      pack_id: '',
      start_date: '',
      end_date: '',
      company_id: isRoot ? '' : user?.company_id?.toString() || '',
      status: '1'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription);
    setFormData({
      pack_id: subscription.pack_id?.toString() || '',
      start_date: subscription.start_date ? subscription.start_date.split('T')[0] : '',
      end_date: subscription.end_date ? subscription.end_date.split('T')[0] : '',
      company_id: subscription.company_id?.toString() || '',
      status: subscription.status?.toString() || '1'
    });
    setIsModalOpen(true);
  };

  const handleDelete = (subscription: Subscription) => {
    setDeletingSubscription(subscription);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingSubscription) {
      try {
        await deleteSubscription(deletingSubscription.id);
        fetchSubscriptions();
        toast.success('Subscription deleted successfully');
      } catch (error) {
        toast.error('Error deleting subscription');
      }
    }
    setIsDeleteModalOpen(false);
    setDeletingSubscription(null);
  };

  const handlePrintInvoice = async (subscription: Subscription) => {
    try {
      const [invoiceCounter, clientDetails, emailSettings, phoneSettings, addressSettings] = await Promise.all([
        getAppSettingsByFamille('INVOICE_COUNTER'),
        apiFetch(`/companies/${subscription.company_id}`),
        getAppSettingsByFamille('EMAIL'),
        getAppSettingsByFamille('PHONE'),
        getAppSettingsByFamille('ADRESSE')
      ]);

      const companySettings = await apiFetch(`/company-settings/company/${subscription.company_id}`);

      const emailAppId = emailSettings[0]?.id;
      const phoneAppId = phoneSettings[0]?.id;
      const addressAppId = addressSettings[0]?.id;

      const clientEmail = companySettings.find((cs: any) => cs.app_settings_id === emailAppId)?.custom_value || 'N/A';
      const clientPhone = companySettings.find((cs: any) => cs.app_settings_id === phoneAppId)?.custom_value || 'N/A';
      const clientAddress = companySettings.find((cs: any) => cs.app_settings_id === addressAppId)?.custom_value || 'N/A';

      let invoiceNumber = 'FA-2024-001';
      if (invoiceCounter.length > 0) {
        const currentYear = new Date().getFullYear();
        const prefix = invoiceCounter[0].title || 'FA';
        const value = invoiceCounter[0].value || 'Year-001';

        const numberMatch = value.match(/(\d+)$/);
        const number = numberMatch ? numberMatch[1] : '001';

        invoiceNumber = `${prefix}-${currentYear}-${number}`;
      }

      const invoiceData = {
        invoiceNumber,
        clientDetails: {
          title: clientDetails?.title,
          matricule: clientDetails?.matricule,
          email: clientEmail,
          phone: clientPhone,
          address: clientAddress
        },
        items: [{
          title: `${subscription.packs?.title || 'N/A'} Subscription`,
          description: 'Event management package',
          startDate: subscription.start_date,
          endDate: subscription.end_date,
          amount: subscription.packs?.price || 0
        }]
      };

      openInvoiceInNewTab(invoiceData);
    } catch (error) {
      toast.error('Error generating invoice');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.pack_id) {
      toast.error('Please select a pack');
      return;
    }

    if (isRoot && !formData.company_id) {
      toast.error('Please select a company');
      return;
    }

    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      toast.error('End date must be after start date');
      return;
    }

    try {
      const payload = {
        pack_id: formData.pack_id ? Number(formData.pack_id) : undefined,
        start_date: formData.start_date ? new Date(formData.start_date).toISOString() : undefined,
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : undefined,
        company_id: formData.company_id ? Number(formData.company_id) : undefined,
        status: Number(formData.status)
      };

      if (!isRoot && user?.company_id) {
        payload.company_id = Number(user.company_id);
      }

      if (editingSubscription) {
        await updateSubscription(editingSubscription.id, payload);
      } else {
        await createSubscription(payload as Omit<Subscription, 'id'>);
      }

      setIsModalOpen(false);
      fetchSubscriptions();
      toast.success(editingSubscription ? 'Subscription updated successfully' : 'Subscription created successfully');
    } catch (error) {
      toast.error('Error saving subscription');
    }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Subscriptions Management</h2>
          <Button onClick={handleAdd} className="addNewBtn"><i className="fa fa-plus mr-2"></i> Add New Subscription</Button>
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading subscriptions...</div>
          ) : (
            <DataTable
              columns={columns}
              data={subscriptions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCustomAction={handlePrintInvoice}
              customActionLabel="Print Invoice"
              iconCustomAction="fa fa-print"
              defaultSort={{ key: 'id', direction: 'descending' }}
            />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingSubscription ? 'Edit Subscription' : 'Add New Subscription'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="">
            <div>
              <Label htmlFor="pack">Pack *</Label>
              <Select value={formData.pack_id} onValueChange={(value) => setFormData({ ...formData, pack_id: value })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a pack" />
                </SelectTrigger>
                <SelectContent>
                  {packs.map((pack) => (
                    <SelectItem key={pack.id} value={pack.id.toString()}>
                      {pack.title} - {pack.price} TND
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {isRoot && (
              <div>
                <Label htmlFor="company">Company *</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {!isRoot && (
              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={user?.company_id ? `Company ID: ${user.company_id}` : 'No Company'}
                  disabled
                  className="bg-gray-100"
                />
              </div>
            )}

            <div>
              <Label htmlFor="start_date">Start Date</Label>
              <Input
                id="start_date"
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="end_date">End Date</Label>
              <Input
                id="end_date"
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Active</SelectItem>
                  <SelectItem value="0">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className={editingSubscription ? 'updateBtn' : 'createBtn'}>{editingSubscription ? 'Update' : 'Create'}</Button>
              <Button type="button" className="closeBtn" onClick={() => setIsModalOpen(false)}>Close</Button>
            </div>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        <p className="text-gray-700">Are you sure you want to delete this subscription <strong>{deletingSubscription?.packs?.title}</strong> of <strong>{deletingSubscription?.companies?.title}</strong> company?</p>
        <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDelete}>Delete</Button>
          <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>Close</Button>
        </div>
      </Modal>


    </div>
  );
}
