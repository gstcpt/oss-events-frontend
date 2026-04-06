'use client';

import { useEffect, useState } from 'react';
import { AppLogs } from '@/types/logs';
import { useAuth } from '@/context/AuthContext';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { getLogs, deleteLog } from '@/lib/api/logs';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';

const getNestedValue = (obj: any, path: string) => {
  return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj);
};

export default function Logs() {
  const t = useTranslations('Dashboard.logs');
  const { user } = useAuth();
  const [appLogs, setLogs] = useState<AppLogs[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AppLogs | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const isRootUser = user?.role === 'Root';

  const fetchLogs = async () => {
    try {
      const data = await getLogs();
      setLogs(data);
    } catch (error) {
      toast.error(t('errorLoading'));
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDeleteLog = async () => {
    if (selectedLog) {
      try {
        await deleteLog(selectedLog.id);
        fetchLogs();
        setIsDeleteModalOpen(false);
        setSelectedLog(null);
        toast.success(t('logDeleted'));
      } catch (error) {
        toast.error(t('errorSaving'));
      }
    }
  };

  const openDeleteModal = (log: AppLogs) => {
    setSelectedLog(log);
    setIsDeleteModalOpen(true);
  };

  const columns: DataTableColumn<AppLogs>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('entity'), accessor: 'entity' },
    { header: t('action'), accessor: 'action' },
    {
      header: t('actor'),
      accessor: 'users',
      cell: (item: AppLogs) => {
        if (item.users) {
          const name = [item.users.firstname, item.users.lastname].filter(Boolean).join(' ');
          return name || item.users.email;
        }
        return 'N/A';
      },
    },
    ...(isRootUser ? [{ header: t('company'), accessor: 'company_id' as const, cell: (tag: AppLogs) => tag.companies?.title || 'No Company' }] : []),
    {
      header: t('date'),
      accessor: 'created_at',
      cell: (item: AppLogs) => new Date(item.created_at).toLocaleString(),
    },
    {
      header: t('message'), accessor: 'log_message', cell: (item: AppLogs) => (
        <div style={{ wordBreak: 'break-word', whiteSpace: 'pre-line', maxWidth: 240 }}>
          {item.log_message}
        </div>
      )
    },
  ];

  const filteredLogs = appLogs.filter(item =>
    columns.some(column => {
      const value = column.accessor === 'users'
        ? (item.users ? [item.users.firstname, item.users.lastname, item.users.email].filter(Boolean).join(' ') : '')
        : String(getNestedValue(item, column.accessor) ?? '');
      return value.toLowerCase().includes(searchTerm.toLowerCase());
    })
  );

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <div className="flex items-center space-x-4"></div>
        </div>
        <div className="p-6">
          <DataTable
            columns={columns}
            data={filteredLogs}
            onEdit={() => { }}
            onDelete={openDeleteModal}
            showEdit={false}
            showDelete={isRootUser}
            defaultSort={{ key: 'id', direction: 'descending' }}
          />
        </div>
      </div>

      {isDeleteModalOpen && selectedLog && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => { setIsDeleteModalOpen(false); setSelectedLog(null); }} title={t('confirmDelete')}>
          <form className="">
            <p className="text-gray-700">{t('confirmDeleteMessage')}</p>
            <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
              <Button type="button" onClick={handleDeleteLog} className="deleteBtn" aria-label={t('deleteLog')}>{t('confirmDelete')}</Button>
              <Button type="button" onClick={() => { setIsDeleteModalOpen(false); setSelectedLog(null); }} className="closeBtn">{t('close')}</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}