'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { toast } from 'sonner';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { FAQ } from '@/types/faq';
import { getFAQs, getFAQ, createFAQ, updateFAQ, deleteFAQ } from '@/lib/api/faq';
import { FaqSection, getFaqSections, createFaqSection, deleteFaqSection, updateFaqSection } from '@/lib/api/faq-sections';
import { getAllCompanies } from '@/lib/api/companies';
import { getAllUsers } from '@/lib/api/user';
import { useTranslations } from 'next-intl';

export default function FaqPage() {
    const t = useTranslations('Dashboard.faq');
    const { user } = useAuth();
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [currentFAQ, setCurrentFAQ] = useState<Partial<FAQ> | null>(null);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteOpen] = useState(false);
    const [companies, setCompanies] = useState<any[]>([]);
    const [users, setUsers] = useState<any[]>([]);
    const [sections, setSections] = useState<FaqSection[]>([]);
    const [isSectionsModalOpen, setIsSectionsModalOpen] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState('');
    const [newSectionCompany, setNewSectionCompany] = useState<number | null>(null);
    const [currentSection, setCurrentSection] = useState<FaqSection | null>(null);

    const handleOpenModal = () => {
        const initialState: Partial<FAQ> = { question: '', answer: '', faq_order: 1, status: 1 };
        if (String(user?.role_id) === '2' && user?.company_id) { initialState.company_id = user.company_id; }
        setCurrentFAQ(initialState);
        setIsOpen(true);
    };

    const handleEditFAQ = (faq: FAQ) => {
        setCurrentFAQ(faq);
        setIsOpen(true);
    };

    const handleSave = async () => {
        try {
            let faqToSave = currentFAQ;
            if (!currentFAQ?.id && String(user?.role_id) === '2' && user?.company_id && (!currentFAQ?.company_id || currentFAQ.company_id === undefined)) { faqToSave = { ...currentFAQ, company_id: user.company_id }; }
            if (currentFAQ?.id) {
                const { id, ...faqWithoutId } = faqToSave as FAQ;
                await updateFAQ(id, faqWithoutId as Partial<FAQ>);
                toast.success(t('questionUpdated'));
            } else {
                await createFAQ(faqToSave as Omit<FAQ, 'id'>);
                toast.success(t('questionCreated'));
            }
            const fetchedFAQs = await getFAQs();
            setFaqs(fetchedFAQs);
            setIsOpen(false);
            setCurrentFAQ(null);
        } catch (error) { toast.error(t('errorSaving')); }
    };

    const handleDelete = async () => {
        try {
            if (currentFAQ?.id) {
                await deleteFAQ(currentFAQ.id);
                toast.success(t('questionDeleted'));
                const fetchedFAQs = await getFAQs();
                setFaqs(fetchedFAQs);
                setIsDeleteOpen(false);
                setCurrentFAQ(null);
            }
        } catch (error) { toast.error(t('errorSaving')); }
    };

    const handleOpenDeleteModal = (faq: FAQ) => {
        setCurrentFAQ(faq);
        setIsDeleteOpen(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const fetchedFAQs = await getFAQs();
                setFaqs(fetchedFAQs);
                const fetchedSections = await getFaqSections();
                setSections(fetchedSections);
                if (user && user.role === 'Root') {
                    const companyData = await getAllCompanies();
                    setCompanies(companyData);
                    const userData = await getAllUsers();
                    setUsers(userData);
                }
            } catch (error) { toast.error(t('errorFetchingData')); } finally { setLoading(false); }
        };

        fetchData();
    }, []);

    const getCompanyName = (companyId: number): string => {
        const company = companies.find(c => Number(c.id) === Number(companyId));
        return company ? company.title : `Company ${companyId}`;
    };

    const columns = [
        { header: t('id'), accessor: 'id' },
        { header: t('section'), accessor: 'section_id', cell: (row: any) => <span>{sections.find(s => s.id === row.section_id)?.title || '-'}</span> },
        { header: t('question'), accessor: 'question', cell: (row: any) => <span className='truncate max-w-xs block'>{row.question}</span> },
        { header: t('answer'), accessor: 'answer', cell: (row: any) => <span className='truncate max-w-xs block'>{row.answer}</span> },
        { header: t('order'), accessor: 'faq_order' }, ...(user && user.role === 'Root' ? [{ header: t('company'), accessor: 'company_id', cell: (row: any) => <span>{getCompanyName(row.company_id)}</span> }] : []),
        { header: t('status'), accessor: 'status', cell: (row: any) => <span>{row.status === 1 ? t('active') : t('inactive')}</span> },
    ];

    return (
        <div className="space-y-8">
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">{t('title')}</h2>
                    <div className="flex gap-2">
                        <Button onClick={() => setIsSectionsModalOpen(true)} className="bg-gray-200 text-black hover:bg-gray-300">{t('manageSections')}</Button>
                        <Button onClick={handleOpenModal} aria-label={t('addNewQuestion')} className="addNewBtn"><i className="fa fa-plus mr-2"></i>{t('addNewQuestion')}</Button>
                    </div>
                </div>
                <div className="p-6"><DataTable columns={columns} data={faqs as any[]} onEdit={handleEditFAQ} onDelete={handleOpenDeleteModal} showEdit={true} showDelete={true} showSettings={true} defaultSort={{ key: 'id', direction: 'descending' }} /></div>
            </div>
            {isOpen && (
                <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={currentFAQ?.id ? t('editQuestion') : t('addNewQuestion')} aria-label={currentFAQ?.id ? t('editQuestion') : t('addNewQuestion')}>
                    <div className="">
                        <div className="space-y-6">
                            <div>
                                <Label htmlFor="section_id">{t('section')}</Label>
                                <select id="section_id" className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" value={currentFAQ?.section_id || ''} onChange={(e) => {
                                    const newFAQ = currentFAQ?.id ? { ...currentFAQ as FAQ, section_id: e.target.value ? parseInt(e.target.value) : null } : { ...(currentFAQ || { question: '', answer: '', faq_order: 1, status: 1, company_id: user && String(user.role_id) === '2' ? user.company_id : undefined }), section_id: e.target.value ? parseInt(e.target.value) : null };
                                    if (user && String(user.role_id) === '2' && user.company_id) { newFAQ.company_id = user.company_id; }
                                    setCurrentFAQ(newFAQ);
                                }}>
                                    <option value="">{t('noSection')}</option>
                                    {sections.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <Label htmlFor="question">{t('question')}</Label>
                                <Input id="question" name="question" type="text" className="w-full" defaultValue={currentFAQ?.question || ''} onChange={(e) => {
                                    const newFAQ = currentFAQ?.id ? { ...currentFAQ as FAQ, question: e.target.value } : { ...(currentFAQ || { answer: '', faq_order: 1, status: 1, company_id: user && String(user.role_id) === '2' ? user.company_id : undefined }), question: e.target.value };
                                    if (user && String(user.role_id) === '2' && user.company_id) { newFAQ.company_id = user.company_id; }
                                    setCurrentFAQ(newFAQ);
                                }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="answer">{t('answer')}</Label>
                                <Textarea id="answer" name="answer" className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" rows={4} defaultValue={currentFAQ?.answer || ''} onChange={(e) => {
                                    const newFAQ = currentFAQ?.id ? { ...currentFAQ as FAQ, answer: e.target.value } : { ...(currentFAQ || { question: '', faq_order: 1, status: 1, company_id: user && String(user.role_id) === '2' ? user.company_id : undefined }), answer: e.target.value };
                                    if (user && String(user.role_id) === '2' && user.company_id) { newFAQ.company_id = user.company_id; }
                                    setCurrentFAQ(newFAQ);
                                }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="faq_order">{t('order')}</Label>
                                <Input id="faq_order" name="faq_order" type="number" className="w-full px-3 py-2" defaultValue={currentFAQ?.faq_order || 1} onChange={(e) => {
                                    const newFAQ = currentFAQ?.id ? { ...currentFAQ as FAQ, faq_order: parseInt(e.target.value) } : { ...(currentFAQ || { question: '', answer: '', status: 1, company_id: user && String(user.role_id) === '2' ? user.company_id : undefined }), faq_order: parseInt(e.target.value) };
                                    if (user && String(user.role_id) === '2' && user.company_id) { newFAQ.company_id = user.company_id; }
                                    setCurrentFAQ(newFAQ);
                                }}
                                />
                            </div>
                            <div>
                                <Label htmlFor="status">{t('status')}</Label>
                                <select id="status" name="status" className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" defaultValue={currentFAQ?.status || 1} onChange={(e) => {
                                    const newFAQ = currentFAQ?.id ? { ...currentFAQ as FAQ, status: parseInt(e.target.value) } : { ...(currentFAQ || { question: '', answer: '', faq_order: 1, company_id: user && String(user.role_id) === '2' ? user.company_id : undefined }), status: parseInt(e.target.value) };
                                    if (user && String(user.role_id) === '2' && user.company_id) { newFAQ.company_id = user.company_id; }
                                    setCurrentFAQ(newFAQ);
                                }}
                                >
                                    <option value="1">{t('active')}</option>
                                    <option value="0">{t('inactive')}</option>
                                </select>
                            </div>
                            {(user && String(user.role_id) === '1') && (
                                <div>
                                    <Label htmlFor="company_id">{t('company')}</Label>
                                    <select id="company_id" name="company_id" className="w-full rounded-md px-3 py-2 border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary" defaultValue={currentFAQ?.company_id || ''}
                                        onChange={(e) => {
                                            const newFAQ = currentFAQ?.id ? { ...currentFAQ as FAQ, company_id: parseInt(e.target.value) } : { ...(currentFAQ || { question: '', answer: '', faq_order: 1, status: 1 }), company_id: parseInt(e.target.value) };
                                            setCurrentFAQ(newFAQ);
                                        }}
                                    >
                                        <option value="">{t('global')}</option>
                                        {companies.map((company) => (<option key={company.id} value={company.id}>{company.title}</option>))}
                                    </select>
                                </div>
                            )}
                            {(user && String(user.role_id) === '2') && (<Input type="hidden" id="company_id" name="company_id" value={user?.company_id || ''} />)}
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <Button type="button" onClick={handleSave} className={currentFAQ?.id ? 'updateBtn' : 'createBtn'}>{currentFAQ?.id ? t('update') : t('create')}</Button>
                            <Button type="button" onClick={() => { setIsOpen(false); setCurrentFAQ(null); }} className="closeBtn">{t('close')}</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {isDeleteModalOpen && (
                <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteOpen(false)} title={t('confirmDelete')} aria-label={t('confirmDelete')}>
                    <div className="space-y-6">
                        <p className="text-gray-700">{t('confirmDeleteMessage')} <strong>{currentFAQ?.question}</strong>?</p>
                        <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                            <Button onClick={handleDelete} className="deleteBtn">{t('delete')}</Button>
                            <Button onClick={() => setIsDeleteOpen(false)} className="closeBtn">{t('close')}</Button>
                        </div>
                    </div>
                </Modal>
            )}

            {isSectionsModalOpen && (
                <Modal isOpen={isSectionsModalOpen} onClose={() => setIsSectionsModalOpen(false)} title={t('manageSections')}>
                    <div className="space-y-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-2">
                                <Input placeholder={currentSection ? t('editTitle') : t('addSection')} value={newSectionTitle} onChange={e => setNewSectionTitle(e.target.value)} />
                                {(user && user.role === 'Root') && (
                                    <select className="rounded-md border border-gray-200 px-3 py-2" value={newSectionCompany || ''} onChange={(e) => setNewSectionCompany(e.target.value ? parseInt(e.target.value) : null)}>
                                        <option value="">{t('global')} (No Company)</option>
                                        {companies.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                )}
                                <Button onClick={async () => {
                                    if (newSectionTitle) {
                                        try {
                                            const compId = user && user.role !== 'Root' ? user.company_id : newSectionCompany;
                                            if (currentSection) {
                                                await updateFaqSection(currentSection.id, { title: newSectionTitle, company_id: compId || undefined });
                                                toast.success(t('sectionUpdated'));
                                            } else {
                                                await createFaqSection({ title: newSectionTitle, status: 1, company_id: compId || undefined });
                                                toast.success(t('sectionCreated'));
                                            }
                                            setNewSectionTitle('');
                                            setNewSectionCompany(null);
                                            setCurrentSection(null);
                                            setSections(await getFaqSections());
                                        } catch (e) { toast.error(t('errorSavingSection')); }
                                    }
                                }} className={currentSection ? "updateBtn" : "createBtn"}>{currentSection ? t('update') : t('add')}</Button>
                                {currentSection && (
                                    <Button onClick={() => {
                                        setNewSectionTitle('');
                                        setNewSectionCompany(null);
                                        setCurrentSection(null);
                                    }} className="closeBtn">{t('close')}</Button>
                                )}
                            </div>
                        </div>
                        <ul className="divide-y rounded-md">
                            {sections.map(s => (
                                <li key={s.id} className="p-3 flex justify-between items-center hover:bg-gray-50">
                                    <span className="cursor-pointer flex-1" onClick={() => {
                                        setCurrentSection(s);
                                        setNewSectionTitle(s.title);
                                        setNewSectionCompany(s.company_id || null);
                                    }}>{s.title}</span>
                                    <div className="flex gap-2">
                                        <Button size="sm" variant="outline" className="updateBtn" onClick={() => {
                                            setCurrentSection(s);
                                            setNewSectionTitle(s.title);
                                            setNewSectionCompany(s.company_id || null);
                                        }}>{t('edit')}</Button>
                                        <Button size="sm" variant="destructive" className="deleteBtn" onClick={async () => {
                                            await deleteFaqSection(s.id);
                                            setSections(await getFaqSections());
                                            toast.success(t('sectionDeleted'));
                                        }}>{t('delete')}</Button>
                                    </div>
                                </li>
                            ))}
                            {sections.length === 0 && <li className="p-3 text-gray-500">{t('noSectionsFound')}</li>}
                        </ul>
                        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6"><Button onClick={() => setIsSectionsModalOpen(false)} className="closeBtn">{t('close')}</Button></div>
                    </div>
                </Modal>
            )}
        </div>
    );
}
