'use client';

import { useState, useEffect } from 'react';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getMainCategories,
} from "@/lib/api/categories";
import { uploadCategoryImage } from "@/lib/api/upload";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Category } from "@/types/categories";
import Image from "next/image";
import Link from "next/link";
import { getAllCompanies } from "@/lib/api/companies";
import { Company } from "@/types/companies";
import { useTranslations } from 'next-intl';

export default function Categories() {
  const t = useTranslations('Dashboard.categories');
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainCategories, setMainCategories] = useState<Category[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSubCategoriesModalOpen, setIsSubCategoriesModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [viewingSubCategories, setViewingSubCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    head_category_id: "none",
    image: "",
    description: "",
    status: "1",
    company_id: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const columns: DataTableColumn<Category>[] = [
    { header: t('id'), accessor: 'id' },
    {
      header: t('image'),
      accessor: 'image',
      cell: (category) => (
        <div className="w-12 h-12 relative">
          <Image src={category.image ? (category.image.startsWith('/') ? category.image : `/${category.image}`) : '/images/default.jpg'} alt={category.title} fill sizes="48px" className="object-cover rounded-md" />
        </div>
      )
    },
    { header: t('title_field'), accessor: 'title' },
    {
      header: t('parentCategory'),
      accessor: 'head_category_id',
      cell: (category) => {
        if (!category.head_category_id) return t('mainCategory');
        const parentCategory = categories.find(cat => cat.id == category.head_category_id);
        return parentCategory?.title || t('unknownParent');
      }
    },
  ];

  if (user?.role === 'Root') {
    columns.push({
      header: t('company'),
      accessor: 'companies',
      cell: (category) => category.companies?.title || 'N/A',
    });
  }

  columns.push(
    {
      header: t('subCategories'), accessor: 'children',
      cell: (category) => (
        <div className="flex items-center space-x-2">
          <Button variant="link" className="counterClick" onClick={() => handleViewSubCategories(category)}>{category.children?.length ? category.children.length : 0}</Button>
        </div>
      )
    },
    {
      header: t('status'),
      accessor: 'status',
      cell: (category) => (<span className={`px-2 py-1 rounded-full text-xs ${category.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>{category.status === 1 ? t('active') : t('inactive')}</span>)
    },
  );

  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchMainCategories();
      if (user.role === "Root") {
        fetchCompanies();
      }
    }
  }, [user]);

  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error(t('errorFetchingCompanies'));
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await getAllCategories();
      const filteredData = user?.role === 'Root' ? data : data.filter(category => category.company_id === user?.company_id);
      setCategories(filteredData);
    } catch (error) { toast.error(t('errorLoading')); } finally { setLoading(false); }
  };

  const fetchMainCategories = async () => {
    try {
      const data = await getMainCategories();
      const filteredData = user?.role === 'Root' ? data : data.filter(category => category.company_id === user?.company_id);
      setMainCategories(filteredData);
    } catch (error) {
      toast.error(t('errorFetchingMainCategories'));
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({
      title: "",
      head_category_id: "none",
      image: "",
      description: "",
      status: "1",
      company_id: user?.company_id?.toString() || "",
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      title: category.title,
      head_category_id: category.head_category_id?.toString() || "none",
      image: category.image,
      description: category.description || "",
      status: category.status.toString(),
      company_id: category.company_id?.toString() || "",
    });
    setSelectedFile(null);
    setIsModalOpen(true);
  };

  const handleDelete = (category: Category) => {
    setDeletingCategory(category);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (deletingCategory) {
      try {
        await deleteCategory(deletingCategory.id);
        fetchCategories();
        fetchMainCategories();
        toast.success(t('categoryDeleted'));
      } catch (error) { toast.error(t('errorDeleting')); }
    }
    setIsDeleteModalOpen(false);
    setDeletingCategory(null);
  };

  const handleViewSubCategories = (category: Category) => {
    setViewingSubCategories(category.children || []);
    setIsSubCategoriesModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t('titleRequired'));
      return;
    }
    if (!editingCategory && !selectedFile) {
      toast.error(t('imageRequired'));
      return;
    }
    try {
      let imageUrl = formData.image;
      if (editingCategory) {
        if (selectedFile) {
          const result = await uploadCategoryImage(
            selectedFile,
            editingCategory.id,
            formData.title
          );
          imageUrl = result.imageUrl;
        }
        const payload = {
          title: formData.title.trim(),
          head_category_id:
            formData.head_category_id !== "none"
              ? Number(formData.head_category_id)
              : null,
          image: imageUrl,
          description: formData.description || null,
          company_id:
            user?.role === "Root"
              ? Number(formData.company_id)
              : user?.company_id,
          status: Number(formData.status),
        };
        await updateCategory(editingCategory.id, payload);
        toast.success(t('categoryUpdated'));
      } else {
        const tempId = Date.now();
        const result = await uploadCategoryImage(
          selectedFile!,
          tempId,
          formData.title
        );
        imageUrl = result.imageUrl;
        const payload = {
          title: formData.title.trim(),
          head_category_id:
            formData.head_category_id !== "none"
              ? Number(formData.head_category_id)
              : null,
          image: imageUrl,
          description: formData.description || null,
          company_id:
            user?.role === "Root"
              ? Number(formData.company_id)
              : user?.company_id,
          status: Number(formData.status),
        };
        await createCategory(payload);
        toast.success(t('categoryCreated'));
      }
      setIsModalOpen(false);
      await fetchCategories();
      await fetchMainCategories();
    } catch (error) { toast.error(t('errorSaving')); }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('title')}</h2>
          <Button onClick={handleAdd} aria-label={t('addNewCategory')} className="addNewBtn"><i className="fa fa-plus mr-2"></i> {t('addNewCategory')}</Button>
        </div>
        <div className="p-6">{loading ? (<div className="text-center py-4">{t('loading')}</div>) : (<DataTable columns={columns} data={categories} onEdit={handleEdit} onDelete={handleDelete} defaultSort={{ key: 'id', direction: 'descending' }} />)}</div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? t('editCategory') : t('addNewCategory')}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="title">{t('title_field')}</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
          </div>
          <div>
            <Label htmlFor="description">{t('description')} <span className="text-gray-400 text-xs font-normal">({t('optional')})</span></Label>
            <textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder={t('descriptionPlaceholder')} className="w-full mt-1 px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary resize-none" />
          </div>
          {user?.role === "Root" && (
            <div>
              <Label htmlFor="company">{t('company')}</Label>
              <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                <SelectTrigger><SelectValue placeholder={t('selectCompany')} /></SelectTrigger>
                <SelectContent>{companies.map((company) => (<SelectItem key={company.id} value={company.id.toString()}>{company.title}</SelectItem>))}</SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label htmlFor="parent">{t('parentCategory')}</Label>
            <Select value={formData.head_category_id} onValueChange={(value) => setFormData({ ...formData, head_category_id: value })}>
              <SelectTrigger><SelectValue placeholder={t('selectParentCategory')} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('noParent')}</SelectItem>
                {mainCategories.map((category) => (<SelectItem key={category.id} value={category.id.toString()}>{category.title}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="image">{t('image')}</Label>
            <Input id="image" type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} required={!editingCategory} />
            <div className="mt-3">
              {selectedFile ? (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image src={URL.createObjectURL(selectedFile)} alt="Preview" width={128} height={128} className="object-cover rounded-lg" />
                </div>
              ) : editingCategory && formData.image ? (
                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image src={formData.image.startsWith("/") ? formData.image : `/${formData.image}`} alt="Current image" width={128} height={128} className="object-cover rounded-lg" />
                </div>
              ) : (<div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center"><span className="text-gray-400 text-sm">{t('noImage')}</span></div>)}
            </div>
          </div>
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
            <Button type="submit" className={editingCategory ? "updateBtn" : "createBtn"}>{editingCategory ? t('update') : t('create')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirmDelete')}>
        <p className="text-gray-700">{t('confirmDeleteMessage')} <strong>{deletingCategory?.title}</strong>?</p>
        <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDelete}>{t('delete')}</Button>
          <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>{t('close')}</Button>
        </div>
      </Modal>
      <Modal isOpen={isSubCategoriesModalOpen} onClose={() => setIsSubCategoriesModalOpen(false)} title={t('subCategoriesTitle')}>
        <div className="space-y-6">
          {viewingSubCategories.length > 0 ? (<ul className="space-y-2">{viewingSubCategories.map((subCategory) => (<li key={subCategory.id} className="p-2 border rounded-md">{subCategory.title}</li>))}</ul>) : (<p>{t('noSubCategoriesFound')}</p>)}
          <Button className="closeBtn" type="button" variant="outline" onClick={() => setIsSubCategoriesModalOpen(false)}>{t('close')}</Button>
        </div>
      </Modal>
    </div>
  );
}