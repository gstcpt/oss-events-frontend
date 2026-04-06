"use client";
import { useState, useEffect } from "react";
import { locationsApi } from "@/lib/api/locations";
import { Country, Governorate, Municipality } from "@/types/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DataTable, { DataTableColumn } from "@/components/ui/DataTable";
import Modal from "@/components/ui/Modal";
import { Plus, Search, MapPin, Building, Home } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export default function LocationsDashboard() {
    const t = useTranslations('Dashboard.locations');
    const [activeTab, setActiveTab] = useState<"countries" | "governorates" | "municipalities">("countries");
    const [countries, setCountries] = useState<Country[]>([]);
    const [governorates, setGovernorates] = useState<Governorate[]>([]);
    const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Country | Governorate | Municipality | null>(null);
    const [deletingItem, setDeletingItem] = useState<Country | Governorate | Municipality | null>(null);
    const [formData, setFormData] = useState({ name: "", country_id: "", governorate_id: "", code: "" });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        loadCountries();
        loadGovernorates();
        loadMunicipalities();
    }, []);

    const loadCountries = async () => {
        setIsLoading(true);
        const response = await locationsApi.getCountries();
        if (response.success && response.data) { setCountries(response.data as Country[]); } else { toast.error(response.error || t('toast.loadFailed')); }
        setIsLoading(false);
    };

    const loadGovernorates = async () => {
        const response = await locationsApi.getGovernorates();
        if (response.success && response.data) { setGovernorates(response.data as Governorate[]); }
    };

    const loadMunicipalities = async () => {
        const response = await locationsApi.getMunicipalities();
        if (response.success && response.data) { setMunicipalities(response.data as Municipality[]); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            let response;
            if (editingItem) {
                if (activeTab === "countries") { response = await locationsApi.updateCountry(editingItem.id, { name: formData.name }); }
                else if (activeTab === "governorates") { response = await locationsApi.updateGovernorate(editingItem.id, { name: formData.name, country_id: parseInt(formData.country_id) }); }
                else { response = await locationsApi.updateMunicipality(editingItem.id, { name: formData.name, code: formData.code, governorate_id: parseInt(formData.governorate_id) }); }
            } else {
                if (activeTab === "countries") { response = await locationsApi.createCountry({ name: formData.name }); }
                else if (activeTab === "governorates") { response = await locationsApi.createGovernorate({ name: formData.name, country_id: parseInt(formData.country_id) }); }
                else { response = await locationsApi.createMunicipality({ name: formData.name, code: formData.code, governorate_id: parseInt(formData.governorate_id) }); }
            }
            if (response.success) {
                toast.success(editingItem ? t('toast.updated') : t('toast.created'));
                setIsModalOpen(false);
                setEditingItem(null);
                setFormData({ name: "", country_id: "", governorate_id: "", code: "" });
                if (activeTab === "countries") loadCountries();
                if (activeTab === "governorates") loadGovernorates();
                if (activeTab === "municipalities") loadMunicipalities();
            } else { toast.error(response.error || t('toast.operationFailed')); }
        } catch (error) { toast.error(t('toast.error')); } finally { setIsLoading(false); }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({ name: "", country_id: "", governorate_id: "", code: "" });
        setIsModalOpen(true);
    };

    const filteredData = () => {
        let data: (Country | Governorate | Municipality)[] = [];
        if (activeTab === "countries") data = countries;
        if (activeTab === "governorates") data = governorates;
        if (activeTab === "municipalities") data = municipalities;
        return data.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
    };

    const getColumns = () => {
        if (activeTab === "countries") { return [{ header: t('columns.name'), accessor: "name", className: "font-medium" }] as DataTableColumn<Country | Governorate | Municipality>[]; }
        else if (activeTab === "governorates") {
            return [{ header: t('columns.name'), accessor: "name", className: "font-medium" }, { header: t('columns.country'), accessor: "countries.name", cell: (item: any) => item.countries?.name || t('na') }] as DataTableColumn<Country | Governorate | Municipality>[];
        }
        else {
            return [
                { header: t('columns.name'), accessor: "name", className: "font-medium" }, { header: t('columns.governorate'), accessor: "governorates.name", cell: (item: any) => item.governorates?.name || t('na') }, { header: t('columns.code'), accessor: "code" }
            ] as DataTableColumn<Country | Governorate | Municipality>[];
        }
    };

    const handleEditFromTable = (item: Country | Governorate | Municipality) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            country_id: item.hasOwnProperty("country_id") ? (item as Governorate).country_id.toString() : "",
            governorate_id: item.hasOwnProperty("governorate_id") ? (item as Municipality).governorate_id.toString() : "",
            code: item.hasOwnProperty("code") ? (item as Municipality).code : ""
        });
        setIsModalOpen(true);
    };

    const handleDeleteFromTable = (item: Country | Governorate | Municipality) => {
        setDeletingItem(item);
        setIsDeleteModalOpen(true);
    };

    const confirmDelete = async () => {
        if (!deletingItem) return;

        setIsLoading(true);
        setIsDeleteModalOpen(false);

        try {
            let response;
            if (activeTab === "countries") { response = await locationsApi.deleteCountry(deletingItem.id); }
            else if (activeTab === "governorates") { response = await locationsApi.deleteGovernorate(deletingItem.id); }
            else { response = await locationsApi.deleteMunicipality(deletingItem.id); }

            if (response.success) {
                toast.success(t('toast.deleted'));
                if (activeTab === "countries") loadCountries();
                if (activeTab === "governorates") loadGovernorates();
                if (activeTab === "municipalities") loadMunicipalities();
            } else { toast.error(response.error || t('toast.deleteFailed')); }
        } catch (error) { toast.error(t('toast.error')); } finally {
            setIsLoading(false);
            setDeletingItem(null);
        }
    };

    const cancelDelete = () => {
        setIsDeleteModalOpen(false);
        setDeletingItem(null);
    };

    return (
        <div className="space-y-8">
            <div className="card">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex flex-col">
                        <h2 className="text-lg font-semibold text-gray-900">{t("title")}</h2>
                        <p className="text-sm text-gray-500 mt-1">{t("subtitle")}</p>
                    </div>
                    <div className="flex items-center space-x-4"><Button className="addNewBtn" onClick={openCreateModal}><Plus className="w-4 h-4 mr-2" />{t("addNew")}</Button></div>
                </div>

                <div className="p-6">
                    {/* Tabs */}
                    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
                        <button onClick={() => setActiveTab("countries")} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "countries" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                            <MapPin className="w-4 h-4 mr-2" />{t("tabs.countries")}
                        </button>
                        <button onClick={() => setActiveTab("governorates")} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "governorates" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                            <Building className="w-4 h-4 mr-2" />{t("tabs.governorates")}
                        </button>
                        <button onClick={() => setActiveTab("municipalities")} className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === "municipalities" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
                            <Home className="w-4 h-4 mr-2" />{t("tabs.municipalities")}
                        </button>
                    </div>

                    <DataTable columns={getColumns()} data={filteredData()} onEdit={handleEditFromTable} onDelete={handleDeleteFromTable} defaultSort={{ key: "id", direction: "descending" }} />
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? t('modal.editTitle') : t('modal.addTitle')}>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.name")}</label>
                        <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder={t("form.namePlaceholder")} required />
                    </div>
                    {activeTab ==="governorates" && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.country")}</label>
                            <select value={formData.country_id} onChange={(e) => setFormData({ ...formData, country_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                <option value="">{t("form.selectCountry")}</option>
                                {countries.map((country: Country) => (<option key={country.id} value={country.id}>{country.name}</option>))}
                            </select>
                        </div>
                    )}
                    {activeTab ==="municipalities" && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.governorate")}</label>
                                <select value={formData.governorate_id} onChange={(e) => setFormData({ ...formData, governorate_id: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">{t("form.selectGovernorate")}</option>
                                    {governorates.map((governorate: Governorate) => (<option key={governorate.id} value={governorate.id}>{governorate.name} ({governorate.countries?.name})</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t("form.code")}</label>
                                <Input value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder={t("form.codePlaceholder")} required />
                            </div>
                        </>
                    )}
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button className={editingItem ? `updateBtn` : `createBtn`} type="submit" disabled={isLoading}>{isLoading ? t("buttons.saving") : editingItem ? t("buttons.update") : t("buttons.create")}</Button>
                        <Button className="closeBtn" type="button" variant="outline" onClick={() => setIsModalOpen(false)} disabled={isLoading}>{t("buttons.close")}</Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={cancelDelete} title={t("modal.deleteTitle")}>
                <div className="space-y-6">
                    <p className="text-gray-700">{t("modal.deleteMessage")}?</p>
                    {deletingItem && (
                        <div className="bg-gray-50 p-3 rounded-md">
                            <p className="font-medium text-gray-900">{deletingItem.name}</p>
                            {activeTab ==="governorates" && (<p className="text-sm text-gray-600 mt-1">{t("modal.country_label")} {(deletingItem as Governorate).countries?.name || t("na")}</p>)}
                            {activeTab ==="municipalities" && (
                                <>
                                    <p className="text-sm text-gray-600 mt-1">{t("modal.governorate_label")} {(deletingItem as Municipality).governorates?.name || t("na")}</p>
                                    <p className="text-sm text-gray-600 mt-1">{t("modal.code_label")} {(deletingItem as Municipality).code}</p>
                                </>
                            )}
                        </div>
                    )}
                    <p className="text-sm text-red-600 font-medium">{t("modal.cannotUndo")}</p>
                    <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
                        <Button className="deleteBtn" type="button" variant="destructive" onClick={confirmDelete} disabled={isLoading}>{isLoading ? t("buttons.deleting") : t("buttons.delete")}</Button>
                        <Button className="closeBtn" type="button" variant="outline" onClick={cancelDelete} disabled={isLoading}>{t("buttons.close")}</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}