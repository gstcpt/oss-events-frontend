"use client";
import { useState, useEffect } from "react";
import { newsletterApi } from "@/lib/api/newsletter";
import { Newsletter } from "@/types/newsletter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { Plus, Mail, Building, Calendar, Download } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getCompanies } from "@/lib/api/companies";
import { useTranslations } from "next-intl";

export default function NewsletterDashboard() {
    const t = useTranslations('Dashboard.newsletter');
    const { user } = useAuth();
    const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
    const [stats, setStats] = useState({ totalSubscribers: 0, thisMonth: 0, thisWeek: 0, today: 0 });
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Newsletter | null>(null);
    const [deletingNewsletter, setDeletingNewsletter] = useState<Newsletter | null>(null);
    const [formData, setFormData] = useState({ email: "", company_id: "" });
    const [isLoading, setIsLoading] = useState(false);
    const [companies, setCompanies] = useState<{ id: number; title: string }[]>([]);
    const isAuthorized = user && (user.role?.toLowerCase() === "admin" || user.role?.toLowerCase() === "root");
    useEffect(() => {
        if (user) {
            loadNewsletters();
            loadStats();
            loadCompanies();
        }
    }, [user]);
    useEffect(() => { if (!user || (user.role?.toLowerCase() !== "admin" && user.role?.toLowerCase() !== "root")) { toast.error("Unauthorized access"); } }, [user]);
    const loadNewsletters = async () => {
        if (!isAuthorized) return;
        setIsLoading(true);
        try {
            const response = await newsletterApi.getNewsletters(1, 100, searchTerm);
            if (response.success && response.data) { setNewsletters(response.data as Newsletter[]); } else { toast.error(response.error || "Failed to load newsletters"); }
        } catch (error) { toast.error("An error occurred while loading newsletters"); } finally { setIsLoading(false); }
    };
    const loadStats = async () => {
        if (!isAuthorized) return;
        try {
            const response = await newsletterApi.getNewsletterStats();
            if (response.success && response.data) { setStats(response.data); }
        } catch (error) { toast.error("An error occurred while loading stats"); }
    };
    const loadCompanies = async () => {
        if (!isAuthorized) return;
        try {
            const companyList = await getCompanies();
            const formattedCompanies = companyList.map((company) => ({ id: company.id, title: company.title }));
            setCompanies(formattedCompanies);
        } catch (error) { setCompanies([]); }
    };
    const handleSubmit = async (e: React.FormEvent) => {
        if (!isAuthorized) {
            toast.error("Unauthorized access");
            return;
        }
        e.preventDefault();
        setIsLoading(true);
        try {
            let response;
            const company_id = formData.company_id ? parseInt(formData.company_id) : undefined;
            if (editingItem) { response = await newsletterApi.updateNewsletter(editingItem.id, { email: formData.email, company_id }); } else { response = await newsletterApi.createNewsletter({ email: formData.email, company_id }); }
            if (response.success) {
                toast.success(editingItem ? "Newsletter updated successfully" : "Newsletter created successfully");
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({ email: "", company_id: "" });
                loadNewsletters();
                loadStats();
            } else { toast.error(response.error || "Operation failed"); }
        } catch (error) { toast.error("An error occurred"); } finally { setIsLoading(false); }
    };
    const handleEdit = (item: Newsletter) => {
        if (!isAuthorized) {
            toast.error("Unauthorized access");
            return;
        }
        setEditingItem(item);
        const companyId = user?.role === "Admin" ? (user.company_id ? String(user.company_id) : "") : item.company_id ? String(item.company_id) : "";
        setFormData({ email: item.email, company_id: companyId });
        setIsModalOpen(true);
    };
    const handleDelete = async (id: bigint) => {
        if (!isAuthorized) {
            toast.error("Unauthorized access");
            return;
        }
        const newsletterToDelete = newsletters.find(n => n.id === id);
        if (newsletterToDelete) {
            setDeletingNewsletter(newsletterToDelete);
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDelete = async () => {
        if (!deletingNewsletter || !isAuthorized) {
            toast.error("Unauthorized access or no item selected for deletion");
            return;
        }

        setIsLoading(true);
        try {
            const response = await newsletterApi.deleteNewsletter(deletingNewsletter.id);
            if (response.success) {
                toast.success("Newsletter subscription deleted successfully");
                loadNewsletters();
                loadStats();
            } else { toast.error(response.error || "Failed to delete newsletter subscription"); }
        } catch (error) { toast.error("An error occurred while deleting newsletter subscription"); }
        finally {
            setIsDeleteModalOpen(false);
            setDeletingNewsletter(null);
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        if (!isAuthorized) {
            toast.error("Unauthorized access");
            return;
        }
        setEditingItem(null);
        const initialCompanyId = user?.role === "Admin" && user.company_id ? String(user.company_id) : "";
        setFormData({ email: "", company_id: initialCompanyId });
        setIsModalOpen(true);
    };
    const handleExport = async () => {
        if (!isAuthorized) {
            toast.error("Unauthorized access");
            return;
        }
        setIsLoading(true);
        try {
            const response = await newsletterApi.exportNewsletters();
            if (response.success) { toast.success("Newsletter data exported successfully"); } else { toast.error(response.error || "Failed to export newsletters"); }
        } catch (error) { toast.error("An error occurred"); } finally { setIsLoading(false); }
    };
    const handleEditFromTable = (newsletter: any) => { handleEdit(newsletter); };
    const handleDeleteFromTable = async (newsletter: any) => {
        try {
            // Find the original newsletter in the newsletters array by matching the numeric ID
            // The newsletter passed from DataTable has been transformed with id as number
            const originalNewsletter = newsletters.find(n => Number(n.id) === newsletter.id);
            if (originalNewsletter) {
                setDeletingNewsletter(originalNewsletter);
                setIsDeleteModalOpen(true);
            } else {
                toast.error('Could not find newsletter to delete.');
            }
        } catch (error) {
            toast.error('Error preparing delete operation');
        }
    };
    const filteredNewsletters = newsletters.filter((newsletter) => newsletter.email.toLowerCase().includes(searchTerm.toLowerCase()) || (user?.role === "Root" && newsletter.companies?.title?.toLowerCase().includes(searchTerm.toLowerCase())));
    if (!user) { return (<div className="p-6"><div className="text-center py-12"><p className="text-gray-500">Please log in to access newsletter management</p></div></div>); }
    if (!isAuthorized) {
        return (
            <div className="p-6">
                <div className="text-center py-12">
                    <div className="text-red-500 mb-4"><Mail className="w-12 h-12 mx-auto" /></div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Unauthorized Access</h2>
                    <p className="text-gray-500">You don't have permission to manage newsletters</p>
                </div>
            </div>
        );
    }
    const columns: DataTableColumn<Newsletter>[] = [
        { header: "Email", accessor: "email", className: "font-medium" },
        ...(user?.role === "Root" ? [{ header: "Company", accessor: "company_id", cell: (newsletter: any) => (<div className="flex items-center"><Building className="w-4 h-4 mr-2 text-gray-400" /> {newsletter.companies?.title || "N/A"}</div>) }] : []),
        { header: "Subscribed Date", accessor: "created_at", cell: (newsletter: any) => (<div className="flex items-center"><Calendar className="w-4 h-4 mr-2 text-gray-400" /> {newsletter.created_at ? new Date(newsletter.created_at).toLocaleDateString() : "N/A"}</div>) },
    ];

    return (
        <div className="space-y-8">
            <div className="card">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Newsletter Management</h2>
                    <div className="flex items-center space-x-4">
                        <Button className="deleteBtn" onClick={handleExport} disabled={isLoading}><Download className="w-4 h-4 mr-2" />Export</Button>
                        <Button className="addNewBtn" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />Add Subscriber</Button>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-blue-100"><Mail className="w-6 h-6 text-blue-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Subscribers</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.totalSubscribers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100"><Calendar className="w-6 h-6 text-green-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">This Month</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100"><Calendar className="w-6 h-6 text-yellow-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">This Week</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-purple-100"><Calendar className="w-6 h-6 text-purple-600" /></div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Today</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6">{isLoading
                    ? (<div className="text-center py-4">Loading ...</div>)
                    : (<DataTable onEdit={handleEditFromTable} onDelete={handleDeleteFromTable} columns={columns as unknown as DataTableColumn<any>[]} data={filteredNewsletters.map((n) => ({ ...n, id: Number(n.id) }))} defaultSort={{ key: "id", direction: "descending" }} />)}
                </div>
            </div>
            {/* Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? "Edit Newsletter Subscription" : "Add New Subscriber"}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter email address" required />
                    </div>
                    {user?.role === "Root" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Company (Optional)</label>
                            <select value={formData.company_id} onChange={(e) => setFormData({ ...formData, company_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">Select a company</option>
                                {companies.map((company) => (<option key={company.id.toString()} value={company.id.toString()}>{company.title}</option>))}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button className={editingItem ? "updateBtn" : "createBtn"} type="submit" disabled={isLoading}>{isLoading ? "Saving..." : editingItem ? "Update" : "Create"}</Button>
                        <Button className="closeBtn" type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>Close</Button>
                    </div>
                </form>
            </Modal>
            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
                <p className="text-gray-700">Are you sure you want to delete this subscriber?</p>
                <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
                <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                    <Button type="button" className="deleteBtn" onClick={confirmDelete}>Delete</Button>
                    <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>Close</Button>
                </div>
            </Modal>
        </div>
    );
}