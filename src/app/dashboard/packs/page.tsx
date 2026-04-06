'use client';

import { useEffect, useState } from 'react';
import { Pack, PackLine } from '@/types/packs';
import { Module } from '@/types/modules';
import Modal from '@/components/ui/Modal';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import { getPacks, createPack, updatePack, deletePack, createPackLine, updatePackLine, deletePackLine } from '@/lib/api/packs';
import { getModules } from '@/lib/api/modules';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj);
};

const getStatusText = (status: number) => status === 1 ? 'Active' : 'Inactive';

export default function Packs() {
  const t = useTranslations('Dashboard.packs');
  const [packs, setPacks] = useState<Pack[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [isSubscriptionsModalOpen, setIsSubscriptionsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const [isAddPackLineModalOpen, setIsAddPackLineModalOpen] = useState(false);
  const [isEditPackLineModalOpen, setIsEditPackLineModalOpen] = useState(false);
  const [isDeletePackLineModalOpen, setIsDeletePackLineModalOpen] = useState(false);
  const [selectedPackLine, setSelectedPackLine] = useState<PackLine | null>(null);

  const fetchPacks = async () => {
    try {
      const data = await getPacks();
      setPacks(data);
    } catch (error) {
      toast.error(t('errorLoading'));
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
    fetchPacks();
    fetchModules();
  }, []);

  const handleAddPack = async (data: Omit<Pack, 'id'>) => {
    try {
      await createPack(data);
      fetchPacks();
      setIsAddModalOpen(false);
      toast.success(t('packCreated'));
    } catch (error) {
      toast.error(t('errorSaving'));
    }
  };

  const handleEditPack = async (id: number, data: Partial<Omit<Pack, 'id'>>) => {
    try {
      await updatePack(id, data);
      fetchPacks();
      setIsEditModalOpen(false);
      setSelectedPack(null);
      toast.success(t('packUpdated'));
    } catch (error) {
      toast.error(t('errorSaving'));
    }
  };

  const handleDeletePack = async () => {
    if (selectedPack) {
      try {
        await deletePack(selectedPack.id);
        fetchPacks();
        setIsDeleteModalOpen(false);
        setSelectedPack(null);
        toast.success(t('packDeleted'));
      } catch (error) {
        toast.error(t('errorSaving'));
      }
    }
  };

  const handleAddPackLine = async (data: Omit<PackLine, 'id'>) => {
    try {
      await createPackLine(data);
      fetchPacks();
      setIsAddPackLineModalOpen(false);
      toast.success(t('packLineCreated'));
    } catch (error) {
      toast.error(t('errorSaving'));
    }
  };

  const handleEditPackLine = async (id: number, data: Partial<Omit<PackLine, 'id'>>) => {
    try {
      await updatePackLine(id, data);
      fetchPacks();
      setIsEditPackLineModalOpen(false);
      setSelectedPackLine(null);
      toast.success(t('packLineUpdated'));
    } catch (error) {
      toast.error(t('errorSaving'));
    }
  };

  const handleDeletePackLine = async () => {
    if (selectedPackLine) {
      try {
        await deletePackLine(selectedPackLine.id);
        fetchPacks();
        setIsDeletePackLineModalOpen(false);
        setSelectedPackLine(null);
        toast.success(t('packLineDeleted'));
      } catch (error) {
        toast.error(t('errorSaving'));
      }
    }
  };

  const openEditModal = (pack: Pack) => {
    setSelectedPack(pack);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (pack: Pack) => {
    setSelectedPack(pack);
    setIsDeleteModalOpen(true);
  };

  const openSubscriptionsModal = (pack: Pack) => {
    setSelectedPack(pack);
    setIsSubscriptionsModalOpen(true);
  };

  const openAddPackLineModal = (pack: Pack) => {
    setSelectedPack(pack);
    setIsAddPackLineModalOpen(true);
  };

  const openEditPackLineModal = (packLine: PackLine) => {
    setSelectedPackLine(packLine);
    setIsEditPackLineModalOpen(true);
  };

  const openDeletePackLineModal = (packLine: PackLine) => {
    setSelectedPackLine(packLine);
    setIsDeletePackLineModalOpen(true);
  };

  const toggleRow = (id: number) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const columns: DataTableColumn<Pack>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('title_field'), accessor: 'title' },
    { header: t('price'), accessor: 'price' },
    { header: t('duration'), accessor: 'duration' },
    { header: t('description_field'), accessor: 'description' },
    {
      header: t('subscriptions'),
      accessor: 'subscriptions',
      cell: (item: Pack) => (<Button onClick={() => openSubscriptionsModal(item)} className="counterClick" disabled={!item.subscriptions || item.subscriptions.length === 0}>{item.subscriptions ? item.subscriptions.length : 0}</Button>),
    },
    {
      header: t('packLines'),
      accessor: 'pack_lines',
      cell: (item: Pack) => (
        <span>{item.pack_lines ? item.pack_lines.length : 0}</span>
      ),
    },
    {
      header: t('status'),
      accessor: 'status',
      cell: (item: Pack) => getStatusText(item.status ?? 0),
    },
  ];

  const filteredPacks = packs.filter(item =>
    columns.some(column =>
      String(getNestedValue(item, column.accessor))
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    )
  );

  const renderRowDetails = (pack: Pack) => {
    return (
      <div className="p-4 bg-gray-100">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-bold">{t('packLinesFor', { title: pack.title })}</h4>
          <Button onClick={() => openAddPackLineModal(pack)} className="createBtn" aria-label={t('addNewPackLine')}><i className="fas fa-plus mr-2"></i>{t('addNewPackLine')}</Button>
        </div>
        {pack.pack_lines && pack.pack_lines.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('module')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('priceHT')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('tva')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('priceTTC')}</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('discount')}</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('actions')}</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pack.pack_lines.map(line => (
                <tr key={line.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{line.modules?.title || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.price_ht}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.tva_value}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.price_ttc}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{line.discount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button onClick={() => openEditPackLineModal(line)} className="updateBtn w-9 h-9 mr-2" aria-label={t('editPackLine')}><i className="fas fa-edit"></i></Button>
                    <Button onClick={() => openDeletePackLineModal(line)} className="deleteBtn w-9 h-9" aria-label={t('deletePackLine')}><i className="fas fa-trash"></i></Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (<p>{t('noPackLines')}</p>)}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold ">{t('title')}</h2>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setIsAddModalOpen(true)} className="createBtn" aria-label={t('addNewPack')}><i className="fas fa-plus mr-2"></i>{t('addNewPack')}</Button>
          </div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={filteredPacks}
            onEdit={openEditModal}
            onDelete={openDeleteModal}
            expandable={true}
            expandedRows={expandedRows}
            toggleRow={toggleRow}
            renderRowDetails={renderRowDetails}
            defaultSort={{ key: 'id', direction: 'descending' }}
          />
        </div>
      </div>

      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('addNewPack')}>
          <form className=""
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                title: formData.get('title') as string,
                price: parseFloat(formData.get('price') as string),
                duration: parseInt(formData.get('duration') as string, 10),
                description: formData.get('description') as string,
                status: parseInt(formData.get('status') as string, 10),
              };
              await handleAddPack(data);
            }}
          >
            <div>
              <div className="mb-4 text-slate-700">
                <label className="block text-sm font-medium">{t('title_field')}</label>
                <Input name="title" type="text" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
              </div>
              <div className="mb-4 text-slate-700">
                <label className="block text-sm font-medium">{t('price')}</label>
                <Input name="price" type="number" step="0.000001" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
              </div>
              <div className="mb-4 text-slate-700">
                <label className="block text-sm font-medium">{t('duration')}</label>
                <Input name="duration" type="number" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
              </div>
              <div className="mb-4 text-slate-700">
                <label className="block text-sm font-medium">{t('description_field')}</label>
                <textarea name="description" required className="mt-1 p-2 border border-gray-300 rounded-md w-full"></textarea>
              </div>
              <div className="mb-4 text-slate-700">
                <label className="block text-sm font-medium">{t('status')}</label>
                <select name="status" required className="mt-1 p-2 border border-gray-300 rounded-md w-full">
                  <option value="1">{t('active')}</option>
                  <option value="0">{t('inactive')}</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                <Button type="submit" className="createBtn" aria-label={t('create')}>{t('create')}</Button>
                <Button type="button" onClick={() => setIsAddModalOpen(false)} className="closeBtn" aria-label={t('close')}>{t('close')}</Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {isEditModalOpen && selectedPack && (
        <Modal isOpen={isEditModalOpen} onClose={() => { setIsEditModalOpen(false); setSelectedPack(null); }} title={t('editPack')}>
          <form className=""
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                title: formData.get('title') as string,
                price: parseFloat(formData.get('price') as string),
                duration: parseInt(formData.get('duration') as string, 10),
                description: formData.get('description') as string,
                status: parseInt(formData.get('status') as string, 10),
              };
              await handleEditPack(selectedPack.id, data);
            }}
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('title_field')}</label>
              <Input name="title" type="text" defaultValue={selectedPack.title} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('price')}</label>
              <Input name="price" type="number" step="0.000001" defaultValue={selectedPack.price} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('duration')}</label>
              <Input name="duration" type="number" defaultValue={selectedPack.duration} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('description_field')}</label>
              <textarea name="description" defaultValue={selectedPack.description} required className="mt-1 p-2 border border-gray-300 rounded-md w-full"></textarea>
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('status')}</label>
              <select name="status" defaultValue={selectedPack.status} required className="mt-1 p-2 border border-gray-300 rounded-md w-full">
                <option value="1">{t('active')}</option>
                <option value="0">{t('inactive')}</option>
              </select>
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="updateBtn" aria-label={t('update')}>{t('update')}</Button>
              <Button type="button" onClick={() => { setIsEditModalOpen(false); setSelectedPack(null); }} className="closeBtn" aria-label={t('close')}>{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}

      {isDeleteModalOpen && selectedPack && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedPack(null); }} title={t('confirmDelete')}>
          <div className="">
            <p className="text-gray-700">{t('confirmDeleteMessage')} <strong>{selectedPack.title}</strong>?</p>
            <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="button" onClick={handleDeletePack} className="deleteBtn" aria-label={t('deletePack')}>{t('confirmDelete')}</Button>
              <Button type="button" onClick={() => { setIsDeleteModalOpen(false); setSelectedPack(null); }} className="closeBtn" aria-label={t('close')}>{t('close')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {isSubscriptionsModalOpen && selectedPack && (
        <Modal isOpen={isSubscriptionsModalOpen} onClose={() => { setIsSubscriptionsModalOpen(false); setSelectedPack(null); }} title={t('subscriptionsFor', { title: selectedPack.title })}>
          <div className="space-y-6">
            {selectedPack.subscriptions && selectedPack.subscriptions.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('company')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('startDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('endDate')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500  tracking-wider">{t('status')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedPack.subscriptions.map(sub => (<tr key={sub.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sub.companies?.title || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.start_date ? new Date(sub.start_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.end_date ? new Date(sub.end_date).toLocaleDateString() : 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sub.status === 1 ? t('active') : t('inactive')}</td>
                  </tr>
                  ))}
                </tbody>
              </table>) : (<p>{t('noSubscriptions')}</p>)}
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="button" onClick={() => { setIsSubscriptionsModalOpen(false); setSelectedPack(null); }} className="closeBtn">{t('close')}</Button>
            </div>
          </div>
        </Modal>
      )}

      {isAddPackLineModalOpen && selectedPack && (
        <Modal isOpen={isAddPackLineModalOpen} onClose={() => setIsAddPackLineModalOpen(false)} title={t('addNewPackLine')}>
          <form className=""
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                pack_id: Number(selectedPack.id),
                module_id: parseInt(formData.get('module_id') as string, 10),
                price_ht: parseFloat(formData.get('price_ht') as string),
                tva_value: parseFloat(formData.get('tva_value') as string),
                price_ttc: parseFloat(formData.get('price_ttc') as string),
                discount: parseFloat(formData.get('discount') as string),
              };
              await handleAddPackLine(data);
            }}
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('module')}</label>
              <select name="module_id" required className="mt-1 p-2 border border-gray-300 rounded-md w-full">
                <option value="">{t('selectModule')}</option>
                {Array.isArray(modules) && modules.length > 0 ? modules.map(module => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                )) : (
                  <option disabled>{t('noModules')}</option>
                )}
              </select>
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('priceHT')}</label>
              <Input name="price_ht" type="number" step="0.000001" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('tva')}</label>
              <Input name="tva_value" type="number" step="0.000001" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('priceTTC')}</label>
              <Input name="price_ttc" type="number" step="0.000001" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('discount')}</label>
              <Input name="discount" type="number" step="0.000001" required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="createBtn" aria-label={t('create')}>{t('create')}</Button>
              <Button type="button" onClick={() => setIsAddPackLineModalOpen(false)} className="closeBtn" aria-label={t('close')}>{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}

      {isEditPackLineModalOpen && selectedPackLine && (
        <Modal isOpen={isEditPackLineModalOpen} onClose={() => setIsEditPackLineModalOpen(false)} title={t('editPackLine')}>
          <form className=""
            onSubmit={async (e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                module_id: parseInt(formData.get('module_id') as string, 10),
                price_ht: parseFloat(formData.get('price_ht') as string),
                tva_value: parseFloat(formData.get('tva_value') as string),
                price_ttc: parseFloat(formData.get('price_ttc') as string),
                discount: parseFloat(formData.get('discount') as string),
              };
              await handleEditPackLine(selectedPackLine.id, data);
            }}
          >
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('module')}</label>
              <select name="module_id" defaultValue={selectedPackLine.module_id} required className="mt-1 p-2 border border-gray-300 rounded-md w-full">
                <option value="">{t('selectModule')}</option>
                {Array.isArray(modules) && modules.length > 0 ? modules.map(module => (
                  <option key={module.id} value={module.id}>{module.title}</option>
                )) : (
                  <option disabled>{t('noModules')}</option>
                )}
              </select>
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('priceHT')}</label>
              <Input name="price_ht" type="number" step="0.000001" defaultValue={selectedPackLine.price_ht} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('tva')}</label>
              <Input name="tva_value" type="number" step="0.000001" defaultValue={selectedPackLine.tva_value} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('priceTTC')}</label>
              <Input name="price_ttc" type="number" step="0.000001" defaultValue={selectedPackLine.price_ttc} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="mb-4 text-slate-700">
              <label className="block text-sm font-medium">{t('discount')}</label>
              <Input name="discount" type="number" step="0.000001" defaultValue={selectedPackLine.discount} required className="mt-1 p-2 border border-gray-300 rounded-md w-full" />
            </div>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="submit" className="updateBtn" aria-label={t('update')}>{t('update')}</Button>
              <Button type="button" onClick={() => setIsEditPackLineModalOpen(false)} className="closeBtn" aria-label={t('close')}>{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}

      {isDeletePackLineModalOpen && selectedPackLine && (
        <Modal isOpen={isDeletePackLineModalOpen} onClose={() => setIsDeletePackLineModalOpen(false)} title={t('deletePackLine')}>
          <div className="">
            <p className="text-gray-700">{t('confirmDeleteMessage')}</p>
            <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="button" onClick={handleDeletePackLine} className="deleteBtn" aria-label={t('deletePackLine')}>{t('confirmDelete')}</Button>
              <Button type="button" onClick={() => setIsDeletePackLineModalOpen(false)} className="closeBtn" aria-label={t('close')}>{t('close')}</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}