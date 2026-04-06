"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { TermsConditions } from "@/types/terms-conditions";
import { getTermsConditions, createTermsConditions, updateTermsConditions, deleteTermsConditions } from "@/lib/api/terms-conditions";
import { getAllCompanies } from "@/lib/api/companies";
import { useTranslations } from "next-intl";
import dynamic from 'next/dynamic';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
const RichTextEditor = dynamic(() => import('@/components/ui/RichTextEditor'), { ssr: false });

export default function TermsConditionsPage() {
    const t = useTranslations('Dashboard.termsConditions');
    const { user } = useAuth();
    const [terms, setTerms] = useState<TermsConditions | null>(null);
    const [loading, setLoading] = useState(false);
    const [content, setContent] = useState("");
    const [companies, setCompanies] = useState<any[]>([]);
    const [allTerms, setAllTerms] = useState<TermsConditions[]>([]);

    // Modals for root
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [currentActionTerms, setCurrentActionTerms] = useState<TermsConditions | null>(null);
    const [selectedCompany, setSelectedCompany] = useState<number | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const fetchedTerms = await getTermsConditions();
            setAllTerms(fetchedTerms);
            if (user?.role === 'Root') {
                const companyData = await getAllCompanies();
                setCompanies(companyData);
            } else {
                const myTerms = fetchedTerms.find(t => t.company_id === user?.company_id) || fetchedTerms[0] || null;
                setTerms(myTerms);
                setContent(myTerms?.content || "");
            }
        } catch (error) { toast.error("Failed to fetch data"); } finally { setLoading(false); }
    };

    useEffect(() => {
        fetchData();
    }, [user]);

    const handleAdminSave = async () => {
        try {
            if (terms?.id) {
                await updateTermsConditions(terms.id, { content, company_id: user?.company_id } as Partial<TermsConditions>);
                toast.success(t('termsUpdated') || "Terms & Conditions updated successfully");
            } else {
                await createTermsConditions({ content, company_id: user?.company_id ?? null } as Omit<TermsConditions, 'id'>);
                toast.success(t('termsCreated') || "Terms & Conditions created successfully");
            }
            await fetchData();
        } catch (error) { toast.error(t('errorSaving') || "Failed to save Terms & Conditions"); }
    };

    const handleRootSave = async () => {
        try {
            if (currentActionTerms?.id) {
                await updateTermsConditions(currentActionTerms.id, { content, company_id: selectedCompany || null } as Partial<TermsConditions>);
                toast.success(t('termsUpdated') || "Terms & Conditions updated successfully");
            } else {
                await createTermsConditions({ content, company_id: selectedCompany || null } as Omit<TermsConditions, 'id'>);
                toast.success(t('termsCreated') || "Terms & Conditions created successfully");
            }
            setIsEditModalOpen(false);
            await fetchData();
        } catch (error) { toast.error(t('errorSaving') || "Failed to save Terms & Conditions"); }
    };

    const handleRootDelete = async () => {
        if (!currentActionTerms?.id) return;
        try {
            await deleteTermsConditions(currentActionTerms.id);
            toast.success(t('termsDeleted') || "Terms & Conditions deleted successfully");
            setIsDeleteModalOpen(false);
            await fetchData();
        } catch (error) { toast.error(t('errorDeleting') || "Failed to delete"); }
    }

    const getCompanyName = (companyId: number | null | undefined): string => {
        if (!companyId) return t('global');
        const c = companies.find(c => Number(c.id) === Number(companyId));
        return c ? c.title : `Company ${companyId}`;
    };
    const isRoot = user?.role === 'Root';
    const columns = [
        { header: t('id'), accessor: 'id' },
        {
            header: t('content'),
            accessor: 'content',
            cell: (row: any) => {
                const text = row.content ? row.content.replace(/<[^>]+>/g, '') : '';
                return <span className="truncate max-w-[200px] block" title={text}>{text.length > 100 ? text.substring(0, 100) + '...' : text}</span>;
            }
        },
        { header: t('createdAt'), accessor: 'created_at', cell: (row: any) => <span>{row.created_at ? new Date(row.created_at).toLocaleString() : '-'}</span> },
        { header: t('updatedAt'), accessor: 'updated_at', cell: (row: any) => <span>{row.updated_at ? new Date(row.updated_at).toLocaleString() : '-'}</span> },
        ...(isRoot ? [{
            header: "Company",
            accessor: "companies",
            cell: (row: any) => <span className="">{getCompanyName(row.company_id) || "System Core"}</span>
        }] : []),
    ];

    if (loading) { return <div className="flex justify-center items-center h-64">{t('loading')}</div>; }

    return (
        <div className="space-y-8">
            {user?.role === 'Root' ? (
                // ROOT VIEW
                <>
                    <div className="card">
                        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <h2 className="text-lg font-semibold">{t('title')}</h2>
                            <Button className="addNewBtn" onClick={() => {
                                setCurrentActionTerms(null);
                                setContent("");
                                setSelectedCompany(null);
                                setIsEditModalOpen(true);
                            }}>
                                <i className="fa fa-plus mr-2"></i> {t('addNewTerms')}
                            </Button>
                        </div>
                        <div className="p-6">
                            <DataTable
                                columns={columns}
                                data={allTerms as any[]}
                                onEdit={(row) => {
                                    setCurrentActionTerms(row as TermsConditions);
                                    setContent(row.content);
                                    setSelectedCompany(row.company_id);
                                    setIsEditModalOpen(true);
                                }}
                                onDelete={(row) => {
                                    setCurrentActionTerms(row as TermsConditions);
                                    setIsDeleteModalOpen(true);
                                }}
                                onCustomAction={(row: any) => {
                                    setCurrentActionTerms(row as TermsConditions);
                                    setIsPreviewModalOpen(true);
                                }}
                                iconCustomAction="fas fa-eye text-xs"
                                customActionLabel={t('preview')}
                                showEdit={true}
                                showDelete={true}
                                showSettings={false}
                                defaultSort={{ key: 'id', direction: 'descending' }}
                            />
                        </div>
                    </div>

                    {/* Root Modals */}
                    {isEditModalOpen && (
                        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={currentActionTerms?.id ? t('editTerms') : t('newTerms')}>
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('company')}</label>
                                    <select value={selectedCompany || ""} onChange={(e) => setSelectedCompany(e.target.value ? Number(e.target.value) : null)} className="w-full border border-gray-300 rounded-md px-3 py-2">
                                        <option value="">{t('global')} (No Company)</option>
                                        {companies.map((c) => (<option key={c.id} value={c.id}>{c.title}</option>))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('content')}</label>
                                    <RichTextEditor value={content} onChange={setContent} />
                                </div>
                                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                                    <Button onClick={handleRootSave} className={currentActionTerms?.id ? "updateBtn" : "createBtn"}>{currentActionTerms?.id ? t('update') : t('save')}</Button>
                                    <Button onClick={() => setIsEditModalOpen(false)} className="closeBtn">{t('cancel')}</Button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    {isPreviewModalOpen && currentActionTerms && (
                        <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title={`${t('preview')} - ${getCompanyName(currentActionTerms.company_id)}`} widthClass="max-w-7xl">
                            <div className="">
                                <div className="prose max-w-none text-slate-700 border rounded-md min-h-[200px] max-h-[60vh] overflow-y-auto" dangerouslySetInnerHTML={{ __html: currentActionTerms.content }} />
                                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                                    <Button onClick={() => setIsPreviewModalOpen(false)} className="closeBtn">{t('close')}</Button>
                                </div>
                            </div>
                        </Modal>
                    )}

                    <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('deleteTerms')}>
                        <div className="">
                            <p className="text-gray-700">{t('confirmDelete')}</p>
                            <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
                            <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                                <Button onClick={handleRootDelete} className="deleteBtn">{t('deleteTerms')}</Button>
                                <Button onClick={() => setIsDeleteModalOpen(false)} className="closeBtn">{t('cancel')}</Button>
                            </div>
                        </div>
                    </Modal>
                </>
            ) : (
                // ADMIN VIEW
                <div className="card">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="text-lg font-semibold">{t('title')}</h2>
                    </div>
                    <div className="p-6">
                        <div className="space-y-6">
                            <div>
                                {terms?.updated_at && <label className="block text-sm font-medium text-gray-500 mb-4">{t('lastUpdated')} {new Date(terms.updated_at).toLocaleString()}</label>}
                                <label className="block text-sm font-medium text-gray-700 mb-2">{t('content')}</label>
                                <div className="rounded-md shadow-sm" style={{ padding: '2px' }}>
                                    <RichTextEditor value={content} onChange={setContent} />
                                </div>
                            </div>
                            <div className="flex justify-end">
                                <Button onClick={handleAdminSave} className={terms?.id ? "updateBtn" : "createBtn"}>{terms?.id ? t('update') : t('save')}</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}