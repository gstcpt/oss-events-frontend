'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { getTags, createTag, updateTag, deleteTag, getTagOptions, createTagOption, deleteTagOption } from '@/lib/api/tags';
import { getCompanies } from '@/lib/api/companies';
import { getCategories } from '@/lib/api/categories';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Category } from '@/types/categories';
import { useMemo } from 'react';
import MultiSelectCheckbox from '@/components/ui/MultiSelectCheckbox';
import DisplayIcon from '@/components/ui/DisplayIcon';
import IconPicker, { type IconPickerValue } from '@/components/ui/IconPicker';
import { Tag, TagOption } from "@/types/tags";
import { Company } from "@/types/companies";
import { useTranslations } from 'next-intl';

export default function Tags() {
  const t = useTranslations('Dashboard.tags');
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [tagOptions, setTagOptions] = useState<TagOption[]>([]);
  const [newOption, setNewOption] = useState('');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', type: '', company_id: '', status: '1', filter_option: '0' });
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedIcon, setSelectedIcon] = useState<IconPickerValue | null>(null);
  const [tempOptions, setTempOptions] = useState<string[]>([]);
  const [newTempOption, setNewTempOption] = useState('');
  const [editingOption, setEditingOption] = useState<{ id: number, value: string } | null>(null);
  const [rangeValues, setRangeValues] = useState({ min: '', max: '', step: '', type: 'number', unit: '' });
  const [numberValues, setNumberValues] = useState({ type: 'integer', min: '', max: '' });
  const [optionRangeValues, setOptionRangeValues] = useState({ min: '', max: '', step: '', type: 'number', unit: '' });
  const [dateUnit, setDateUnit] = useState('days');
  const [optionDateUnit, setOptionDateUnit] = useState('days');
  const [tableConfig, setTableConfig] = useState({ rows: 2, columns: 2, sideHeaders: ['', ''], topHeaders: ['', ''] });
  const [tableCells, setTableCells] = useState<{ [key: string]: string }>({});
  const [optionTableConfig, setOptionTableConfig] = useState({ rows: 2, columns: 2, sideHeaders: ['', ''], topHeaders: ['', ''] });
  const [optionTableCells, setOptionTableCells] = useState<{ [key: string]: string }>({});
  const categoryMap = useMemo(() => new Map(categories.map(c => [c.id, c])), [categories]);
  const formatCategoriesForSelect = (categories: Category[]) => {
    const categoryMap = new Map(categories.map(c => [c.id, { ...c, children: [] }]));
    const rootCategories: any[] = [];
    categories.forEach(c => {
      if (c.head_category_id) {
        const parent = categoryMap.get(c.head_category_id);
        if (parent) {
          // @ts-ignore
          parent.children.push(categoryMap.get(c.id));
        }
      } else { rootCategories.push(categoryMap.get(c.id)); }
    });
    const renderOptions = (cats: any[], depth = 0) => {
      let options: { label: string; value: string; }[] = [];
      for (const category of cats) {
        if (category) {
          options.push({ label: `${'--'.repeat(depth)} ${category.title}`, value: category.id.toString() });
          if (category.children && category.children.length > 0) { options = options.concat(renderOptions(category.children, depth + 1)); }
        }
      }
      return options;
    };
    return renderOptions(rootCategories);
  };
  const getPlaceholderText = (type?: string) => {
    switch (type) {
      case 'radio': return 'e.g., Sizes, Sexe or Yes, No';
      case 'checkbox': return 'e.g., Colors, ...';
      case 'select': return 'e.g., Brand, Model, ...';
      case 'date': return `e.g., 1, 2, 3 (${dateUnit})`;
      case 'range': return 'e.g., 100, 500, 1000 (min/max values)';
      case 'input': return 'e.g., any text value';
      case 'number': return 'e.g., any number value';
      default: return 'Enter option value';
    }
  };
  const getQuickOptions = (type: string, title?: string) => {
    switch (type) {
      case 'radio':
        return title?.toLowerCase().includes('size') ? ['XS', 'S', 'M', 'L', 'XL', 'XXL'] : ['Activer', 'Désactiver'];
      case 'checkbox':
        return title?.toLowerCase().includes('color') ? ['Red', 'Blue', 'Green', 'Black', 'White', 'Yellow'] : ['Option 1', 'Option 2', 'Option 3'];
      case 'select':
        return title?.toLowerCase().includes('brand') ? ['BMW', 'Mercedes', 'Audi', 'Toyota', 'Honda'] : ['Option A', 'Option B', 'Option C'];
      case 'date':
        return dateUnit === 'hours' ? ['1', '2', '4', '8', '12', '24'] : dateUnit === 'weeks' ? ['1', '2', '3', '4'] : ['1', '2', '3', '7', '14', '30'];
      default:
        return [];
    }
  };
  const addTempOption = () => {
    if (newTempOption.trim() && !tempOptions.includes(newTempOption.trim())) {
      setTempOptions([...tempOptions, newTempOption.trim()]);
      setNewTempOption('');
    }
  };
  const removeTempOption = (index: number) => { setTempOptions(tempOptions.filter((_, i) => i !== index)); };
  const addQuickOption = (option: string) => { if (!tempOptions.includes(option)) { setTempOptions([...tempOptions, option]); } };
  const isRoot = user?.role === 'Root';
  const columns: DataTableColumn<Tag>[] = [
    { header: t('id'), accessor: 'id' },
    { header: t('icon'), accessor: 'icon', cell: (tag) => (tag.icon ? <DisplayIcon iconName={tag.icon} size={16} /> : null) },
    { header: t('title_field'), accessor: 'title' },
    { header: t('type'), accessor: 'type' },
    {
      header: t('category'), accessor: 'category_tags',
      cell: (tag) => {
        if (!tag.category_tags || tag.category_tags.length === 0) { return t('all'); }
        const parentCategoryTitles = new Set<string>();
        tag.category_tags.forEach(ct => {
          const category = categoryMap.get(ct.category_id);
          if (category) {
            if (category.head_category_id) {
              const parentCategory = categoryMap.get(category.head_category_id);
              if (parentCategory) { parentCategoryTitles.add(parentCategory.title); }
            } else { parentCategoryTitles.add(category.title); }
          }
        });
        if (parentCategoryTitles.size > 0) { return Array.from(parentCategoryTitles).join(', '); }
        return 'N/A';
      }
    },
    {
      header: t('subCategory'), accessor: 'category_tags',
      cell: (tag) => {
        if (!tag.category_tags || tag.category_tags.length === 0) { return t('all'); }
        const subCategoryTitles = new Set<string>();
        tag.category_tags.forEach(ct => {
          const category = categoryMap.get(ct.category_id);
          if (category && category.head_category_id) { subCategoryTitles.add(category.title); }
        });
        if (subCategoryTitles.size > 0) { return Array.from(subCategoryTitles).join(', '); }
        return t('all');
      }
    },
    { header: t('options'), accessor: 'id', cell: (tag) => tag.tag_options?.length || 0 },
    { header: t('status'), accessor: 'status', cell: (tag) => (<span className={`px-2 py-1 rounded-full text-xs ${tag.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>{tag.status === 1 ? t('active') : t('inactive')}</span>) },
    ...(isRoot ? [{
      header: "Company",
      accessor: "companies",
      cell: (tag: any) => <span className="">{tag.companies?.title || "System Core"}</span>
    }] : []),
  ];
  useEffect(() => {
    if (user) {
      fetchTags();
      fetchCategories();
      if (isRoot) { fetchCompanies(); }
    }
  }, [user]);
  const fetchTags = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await getTags(user.id);
      setTags(data);
    } catch (error) { toast.error(t('errorLoading')); } finally { setLoading(false); }
  };
  const fetchCompanies = async () => {
    try {
      const data = await getCompanies();
      setCompanies(data);
    } catch (error) { toast.error(t('errorFetchingCompanies')); }
  };
  const fetchCategories = async () => {
    if (!user) return;
    try {
      const data = await getCategories(user);
      setCategories(data);
    } catch (error) { toast.error(t('errorFetchingCategories')); }
  };
  const fetchTagOptions = async (tagId: number) => {
    try {
      const data = await getTagOptions(tagId);
      setTagOptions(data);
    } catch (error) { toast.error(t('errorFetchingOptions')); }
  };
  const handleAdd = () => {
    setEditingTag(null);
    setFormData({ title: '', type: '', company_id: isRoot ? '0' : user?.company_id?.toString() || '0', status: '1', filter_option: '0' });
    setSelectedCategories([]);
    setSelectedIcon(null);
    setTempOptions([]);
    setNewTempOption('');
    setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
    setNumberValues({ type: 'integer', min: '', max: '' });
    setTableConfig({ rows: 2, columns: 2, sideHeaders: ['', ''], topHeaders: ['', ''] });
    setTableCells({});
    setIsModalOpen(true);
  };
  const handleEdit = async (tag: Tag) => {
    setEditingTag(tag);
    setFormData({ title: tag.title, type: tag.type || '', company_id: tag.company_id?.toString() || '0', status: tag.status?.toString() || '1', filter_option: tag.filter_option?.toString() || '0' });
    setSelectedCategories(tag.category_tags?.map(ct => ct.category_id.toString()) || []);
    setSelectedIcon((tag.icon as IconPickerValue) || null);
    try {
      const freshOptions = await getTagOptions(tag.id);
      if (tag.type === 'range' && freshOptions.length > 0) {
        const rangeOption = freshOptions[0]?.option_value || '';
        const rangeParts = rangeOption.split(',');
        const min = rangeParts.find(p => p.startsWith('min:'))?.split(':')[1] || '';
        const max = rangeParts.find(p => p.startsWith('max:'))?.split(':')[1] || '';
        const step = rangeParts.find(p => p.startsWith('step:'))?.split(':')[1] || '';
        const type = rangeParts.find(p => p.startsWith('type:'))?.split(':')[1] || 'number';
        const unit = rangeParts.find(p => p.startsWith('unit:'))?.split(':')[1] || '';
        setRangeValues({ min, max, step, type, unit });
        setTempOptions([]);
      } else if (tag.type === 'number' && freshOptions.length > 0) {
        const numberOption = freshOptions[0]?.option_value || '';
        const numberParts = numberOption.split(',');
        const type = numberParts.find(p => p.startsWith('type:'))?.split(':')[1] || 'integer';
        const min = numberParts.find(p => p.startsWith('min:'))?.split(':')[1] || '';
        const max = numberParts.find(p => p.startsWith('max:'))?.split(':')[1] || '';
        setNumberValues({ type, min, max });
        setTempOptions([]);
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
      } else if (tag.type === 'date' && freshOptions.length > 0) {
        const dateOptions = freshOptions.map(opt => {
          const optionValue = opt.option_value || '';
          const parts = optionValue.split(',');
          const value = parts.find(p => p.startsWith('value:'))?.split(':')[1] || '';
          const unit = parts.find(p => p.startsWith('unit:'))?.split(':')[1] || 'days';
          return `${value} ${unit}`;
        });
        setTempOptions(dateOptions);
        if (freshOptions.length > 0) {
          const firstOption = freshOptions[0].option_value || '';
          const parts = firstOption.split(',');
          const unit = parts.find(p => p.startsWith('unit:'))?.split(':')[1] || 'days';
          setDateUnit(unit);
        }
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
      } else if (tag.type === 'table' && freshOptions.length > 0) {
        const tableOption = freshOptions[0]?.option_value || '';
        try {
          const tableData = JSON.parse(tableOption);
          setTableConfig({ rows: tableData.rows || 2, columns: tableData.columns || 2, sideHeaders: tableData.sideHeaders || [], topHeaders: tableData.topHeaders || [] });
          setTableCells(tableData.cells || {});
        } catch (e) {
          setTableConfig({ rows: 2, columns: 2, sideHeaders: ['', ''], topHeaders: ['', ''] });
          setTableCells({});
        }
        setTempOptions([]);
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
      } else {
        setTempOptions(freshOptions.map(opt => opt.option_value || '') || []);
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
        setNumberValues({ type: 'integer', min: '', max: '' });
      }
    } catch (error) {
      if (tag.type === 'range' && tag.tag_options && tag.tag_options.length > 0) {
        const rangeOption = tag.tag_options[0]?.option_value || '';
        const rangeParts = rangeOption.split(',');
        const min = rangeParts.find(p => p.startsWith('min:'))?.split(':')[1] || '';
        const max = rangeParts.find(p => p.startsWith('max:'))?.split(':')[1] || '';
        const step = rangeParts.find(p => p.startsWith('step:'))?.split(':')[1] || '';
        const type = rangeParts.find(p => p.startsWith('type:'))?.split(':')[1] || 'number';
        const unit = rangeParts.find(p => p.startsWith('unit:'))?.split(':')[1] || '';
        setRangeValues({ min, max, step, type, unit });
        setTempOptions([]);
      } else if (tag.type === 'number' && tag.tag_options && tag.tag_options.length > 0) {
        const numberOption = tag.tag_options[0]?.option_value || '';
        const numberParts = numberOption.split(',');
        const type = numberParts.find(p => p.startsWith('type:'))?.split(':')[1] || 'integer';
        const min = numberParts.find(p => p.startsWith('min:'))?.split(':')[1] || '';
        const max = numberParts.find(p => p.startsWith('max:'))?.split(':')[1] || '';
        setNumberValues({ type, min, max });
        setTempOptions([]);
      } else if (tag.type === 'date' && tag.tag_options && tag.tag_options.length > 0) {
        const dateOptions = tag.tag_options.map(opt => {
          const optionValue = opt.option_value || '';
          const parts = optionValue.split(',');
          const value = parts.find(p => p.startsWith('value:'))?.split(':')[1] || '';
          const unit = parts.find(p => p.startsWith('unit:'))?.split(':')[1] || 'days';
          return `${value} ${unit}`;
        });
        setTempOptions(dateOptions);
        if (tag.tag_options.length > 0) {
          const firstOption = tag.tag_options[0].option_value || '';
          const parts = firstOption.split(',');
          const unit = parts.find(p => p.startsWith('unit:'))?.split(':')[1] || 'days';
          setDateUnit(unit);
        }
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
      } else if (tag.type === 'table' && tag.tag_options && tag.tag_options.length > 0) {
        const tableOption = tag.tag_options[0]?.option_value || '';
        try {
          const tableData = JSON.parse(tableOption);
          setTableConfig({ rows: tableData.rows || 2, columns: tableData.columns || 2, sideHeaders: tableData.sideHeaders || [], topHeaders: tableData.topHeaders || [] });
          setTableCells(tableData.cells || {});
        } catch (e) {
          setTableConfig({ rows: 2, columns: 2, sideHeaders: ['', ''], topHeaders: ['', ''] });
          setTableCells({});
        }
        setTempOptions([]);
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
      } else {
        setTempOptions(tag.tag_options?.map(opt => opt.option_value || '') || []);
        setRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
        setNumberValues({ type: 'integer', min: '', max: '' });
      }
    }
    setNewTempOption('');
    setIsModalOpen(true);
  };
  const handleDelete = (tag: Tag) => {
    setDeletingTag(tag);
    setIsDeleteModalOpen(true);
  };
  const handleManageOptions = async (tag: Tag) => {
    setSelectedTag(tag);
    await fetchTagOptions(tag.id);
    if (tag.type === 'date' && tag.tag_options && tag.tag_options.length > 0) {
      const firstOption = tag.tag_options[0].option_value || '';
      const parts = firstOption.split(',');
      const unit = parts.find(p => p.startsWith('unit:'))?.split(':')[1] || 'days';
      setOptionDateUnit(unit);
    } else { setOptionDateUnit('days'); }
    if (tag.type === 'table' && tag.tag_options && tag.tag_options.length > 0) {
      const tableOption = tag.tag_options[0]?.option_value || '';
      try {
        const tableData = JSON.parse(tableOption);
        setOptionTableConfig({ rows: tableData.rows || 2, columns: tableData.columns || 2, sideHeaders: tableData.sideHeaders || [], topHeaders: tableData.topHeaders || [] });
        setOptionTableCells(tableData.cells || {});
      } catch (e) {
        setOptionTableConfig({ rows: 2, columns: 2, sideHeaders: ['', ''], topHeaders: ['', ''] });
        setOptionTableCells({});
      }
    }
    setIsOptionsModalOpen(true);
  };
  const confirmDelete = async () => {
    if (deletingTag) {
      try {
        await deleteTag(deletingTag.id);
        fetchTags();
        toast.success(t('tagDeleted'));
      } catch (error) { toast.error(t('errorDeleting')); }
    }
    setIsDeleteModalOpen(false);
    setDeletingTag(null);
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error(t('pleaseEnterTitle'));
      return;
    }
    try {
      const payload = {
        title: formData.title,
        type: formData.type || undefined,
        filter_option: formData.filter_option ? Number(formData.filter_option) : 0,
        company_id: formData.company_id && formData.company_id !== '0' ? Number(formData.company_id) : undefined,
        status: Number(formData.status),
        category_ids: selectedCategories.map(id => Number(id)),
        icon: selectedIcon || undefined,
      };
      if (!isRoot && user?.company_id) { payload.company_id = Number(user.company_id); }
      let tagResult;
      if (editingTag) {
        tagResult = await updateTag(editingTag.id, payload);
        const existingOptions = await getTagOptions(editingTag.id);
        for (const option of existingOptions) { await deleteTagOption(option.id); }
      } else { tagResult = await createTag(payload); }
      const tagId = editingTag ? editingTag.id : Number(tagResult.id);
      if (formData.type === 'range') {
        if (rangeValues.min && rangeValues.max) {
          const rangeOption = `min:${rangeValues.min},max:${rangeValues.max},step:${rangeValues.step || '1'},type:${rangeValues.type},unit:${rangeValues.unit}`;
          await createTagOption({ tag_id: tagId, option_value: rangeOption });
        }
      } else if (formData.type === 'date') {
        for (const optionValue of tempOptions) {
          if (optionValue.trim()) {
            const parts = optionValue.trim().split(' ');
            const value = parts[0];
            const unit = parts.slice(1).join(' ') || dateUnit;
            const dateOption = `value:${value},unit:${unit}`;
            await createTagOption({ tag_id: tagId, option_value: dateOption });
          }
        }
      } else if (formData.type === 'table') {
        const tableData = { rows: tableConfig.rows, columns: tableConfig.columns, sideHeaders: tableConfig.sideHeaders, topHeaders: tableConfig.topHeaders, cells: tableCells };
        await createTagOption({ tag_id: tagId, option_value: JSON.stringify(tableData) });
      } else if (formData.type !== 'text' && formData.type !== 'number') { for (const optionValue of tempOptions) { if (optionValue.trim()) { await createTagOption({ tag_id: tagId, option_value: optionValue.trim() }); } } }
      setIsModalOpen(false);
      fetchTags();
      toast.success(editingTag ? t('tagUpdated') : t('tagCreated'));
    } catch (error) { toast.error(t('errorSaving')); }
  };
  const handleAddOption = async () => {
    if (!newOption.trim() || !selectedTag) return;
    try {
      let optionValue = '';
      if (selectedTag.type === 'date') {
        const value = newOption.trim();
        optionValue = `value:${value},unit:${optionDateUnit}`;
      } else { optionValue = newOption.trim(); }
      await createTagOption({ tag_id: selectedTag.id, option_value: optionValue });
      setNewOption('');
      fetchTagOptions(selectedTag.id);
      fetchTags();
      toast.success(t('optionAdded'));
    } catch (error) { toast.error(t('errorAddingOption')); }
  };
  const handleDeleteOption = async (optionId: number) => {
    try {
      await deleteTagOption(optionId);
      if (selectedTag) { fetchTagOptions(selectedTag.id); }
      fetchTags();
      toast.success(t('optionDeleted'));
    } catch (error) { toast.error(t('errorDeletingOption')); }
  };
  const handleEditOption = (option: TagOption) => {
    setEditingOption({ id: option.id, value: option.option_value || '' });
    if (selectedTag?.type === 'range') {
      const rangeOption = option.option_value || '';
      const rangeParts = rangeOption.split(',');
      const min = rangeParts.find(p => p.startsWith('min:'))?.split(':')[1] || '';
      const max = rangeParts.find(p => p.startsWith('max:'))?.split(':')[1] || '';
      const step = rangeParts.find(p => p.startsWith('step:'))?.split(':')[1] || '';
      const type = rangeParts.find(p => p.startsWith('type:'))?.split(':')[1] || 'number';
      const unit = rangeParts.find(p => p.startsWith('unit:'))?.split(':')[1] || '';
      setOptionRangeValues({ min, max, step, type, unit });
      setNewOption('');
    } else if (selectedTag?.type === 'date') {
      const dateOption = option.option_value || '';
      const parts = dateOption.split(',');
      const value = parts.find(p => p.startsWith('value:'))?.split(':')[1] || '';
      const unit = parts.find(p => p.startsWith('unit:'))?.split(':')[1] || 'days';
      setNewOption(value);
      setOptionDateUnit(unit);
      setOptionRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
    } else {
      setNewOption(option.option_value || '');
      setOptionRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
    }
  };
  const handleUpdateOption = async () => {
    if (!editingOption) return;
    let optionValue = '';
    if (selectedTag?.type === 'range') {
      if (!optionRangeValues.min || !optionRangeValues.max) {
        toast.error(t('pleaseEnterMinMax'));
        return;
      }
      optionValue = `min:${optionRangeValues.min},max:${optionRangeValues.max},step:${optionRangeValues.step || '1'},type:${optionRangeValues.type},unit:${optionRangeValues.unit}`;
    } else if (selectedTag?.type === 'date') {
      if (!newOption.trim()) return;
      const parts = newOption.trim().split(' ');
      const value = parts[0];
      const unit = parts.slice(1).join(' ') || 'days';
      optionValue = `value:${value},unit:${unit}`;
    } else {
      if (!newOption.trim()) return;
      optionValue = newOption.trim();
    }
    try {
      await deleteTagOption(editingOption.id);
      await createTagOption({ tag_id: selectedTag!.id, option_value: optionValue });
      setEditingOption(null);
      setNewOption('');
      setOptionRangeValues({ min: '', max: '', step: '', type: 'number', unit: '' });
      fetchTagOptions(selectedTag!.id);
      fetchTags();
      toast.success(t('optionUpdated'));
    } catch (error) { toast.error(t('errorUpdatingOption')); }
  };
  const cancelEditOption = () => {
    setEditingOption(null);
    setNewOption('');
  };
  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('tagsManagement')}</h2>
          <Button onClick={handleAdd} aria-label={t('addNewTag')} className="addNewBtn"><i className="fa fa-plus mr-2"></i> {t('addNewTag')}</Button>
        </div>
        <div className="p-6">
          {loading ?
            (<div className="text-center py-4">{t('loading')}</div>) :
            (<DataTable columns={columns} data={tags} onEdit={handleEdit} onDelete={handleDelete} onCustomAction={handleManageOptions} iconCustomAction={"fa fa-cogs"} customActionLabel={t('manageOptions')} defaultSort={{ key: 'id', direction: 'descending' }} />)
          }
        </div>
      </div>
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTag ? t('editTag') : t('createTag')} widthClass="max-w-7xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="categories">{t('categories')}</Label>
              <MultiSelectCheckbox options={formatCategoriesForSelect(categories)} selected={selectedCategories} onChange={setSelectedCategories} placeholder={t('selectCategories')} />
            </div>
            <div>
              <Label htmlFor="title">{t('elementLabel')} *</Label>
              <Input id="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required placeholder={t('placeholderLabel')} />
            </div>
            <div>
              <Label htmlFor="filterOption">{t('filterOption')}</Label>
              <Select value={formData.filter_option} onValueChange={(value) => setFormData({ ...formData, filter_option: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">{t('filterNo')}</SelectItem>
                  <SelectItem value="1">{t('filterYes')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <Label htmlFor="icon">{t('icon')}</Label>
              <IconPicker onSelect={(v) => setSelectedIcon(v || null)} initialValue={selectedIcon} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="type">{t('elementType')} *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger><SelectValue placeholder={t('chooseInputType')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="radio">{t('typeRadio')}</SelectItem>
                  <SelectItem value="checkbox">{t('typeCheckbox')}</SelectItem>
                  <SelectItem value="select">{t('typeSelect')}</SelectItem>
                  <SelectItem value="date">{t('typeDate')}</SelectItem>
                  <SelectItem value="range">{t('typeRange')}</SelectItem>
                  <SelectItem value="text">{t('typeText')}</SelectItem>
                  <SelectItem value="number">{t('typeNumber')}</SelectItem>
                  <SelectItem value="table">{t('typeTable')}</SelectItem>
                </SelectContent>
              </Select>
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
          </div>
          {formData.type === 'range' && (
            <div className="">
              <Label className="text-sm font-medium mb-3 block">{t('rangeConfig')}:</Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="rangeType">{t('rangeType')} *</Label>
                  <Select value={rangeValues.type} onValueChange={(value) => setRangeValues({ ...rangeValues, type: value })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="number">{t('rangeNumber')}</SelectItem>
                      <SelectItem value="date">{t('rangeDate')}</SelectItem>
                      <SelectItem value="time">{t('rangeTime')}</SelectItem>
                      <SelectItem value="decimal">{t('rangeDecimal')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="unit">{t('unit')}</Label>
                  <Input id="unit" value={rangeValues.unit} onChange={(e) => setRangeValues({ ...rangeValues, unit: e.target.value })} placeholder="e.g., $, days, hours, kg" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="min">{t('minVal')} *</Label>
                  <Input
                    id="min"
                    type={rangeValues.type === 'date' ? 'date' : rangeValues.type === 'time' ? 'time' : 'number'}
                    step={rangeValues.type === 'decimal' ? '0.01' : '1'}
                    value={rangeValues.min}
                    onChange={(e) => setRangeValues({ ...rangeValues, min: e.target.value })}
                    placeholder={rangeValues.type === 'date' ? 'YYYY-MM-DD' : '0'}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="max">{t('maxVal')} *</Label>
                  <Input
                    id="max"
                    type={rangeValues.type === 'date' ? 'date' : rangeValues.type === 'time' ? 'time' : 'number'}
                    step={rangeValues.type === 'decimal' ? '0.01' : '1'}
                    value={rangeValues.max}
                    onChange={(e) => setRangeValues({ ...rangeValues, max: e.target.value })}
                    placeholder={rangeValues.type === 'date' ? 'YYYY-MM-DD' : '100'}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="step">{t('stepSize')}</Label>
                  <Input
                    id="step"
                    type="number"
                    step={rangeValues.type === 'decimal' ? '0.01' : '1'}
                    value={rangeValues.step}
                    onChange={(e) => setRangeValues({ ...rangeValues, step: e.target.value })}
                    placeholder={rangeValues.type === 'decimal' ? '0.1' : '1'}
                  />
                </div>
              </div>
              {rangeValues.min && rangeValues.max && (<div className="mt-3 p-2 bg-blue-50 rounded text-sm text-blue-800">{t('preview')}: Range from {rangeValues.min}{rangeValues.unit} to {rangeValues.max}{rangeValues.unit} (step: {rangeValues.step || '1'})</div>)}
            </div>
          )}
          {formData.type === 'date' && (
            <div className="">
              <Label className="text-sm font-medium mb-3 block">{t('dateConfig')}:</Label>
              <div className="mb-4">
                <Label htmlFor="dateUnit">{t('timeUnit')} *</Label>
                <Select value={dateUnit} onValueChange={(value) => setDateUnit(value)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hours">{t('unitHours')}</SelectItem>
                    <SelectItem value="days">{t('unitDays')}</SelectItem>
                    <SelectItem value="weeks">{t('unitWeeks')}</SelectItem>
                    <SelectItem value="months">{t('unitMonths')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input value={newTempOption} onChange={(e) => setNewTempOption(e.target.value)} placeholder={getPlaceholderText(formData.type)} className="flex-1" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTempOption())} />
                  <Button type="button" onClick={addTempOption} className="createBtn" disabled={!newTempOption.trim()}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="text-xs text-gray-600">{t('quickAdd')} ({dateUnit}):</span>
                  {getQuickOptions(formData.type, formData.title).map((option) => (
                    <Button key={option} type="button" onClick={() => addQuickOption(`${option} ${dateUnit}`)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 text-xs" disabled={tempOptions.includes(`${option} ${dateUnit}`)}>
                      {option} {dateUnit}
                    </Button>
                  ))}
                </div>
                {tempOptions.length > 0 && (
                  <div className="">
                    <div className="text-xs text-gray-600 mb-2">{t('currentOptions')}:</div>
                    <div className="flex flex-wrap gap-2">
                      {tempOptions.map((option, index) => (
                        <div key={index} className="flex items-center bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                          <span className="mr-2">{option}</span>
                          <Button type="button" onClick={() => removeTempOption(index)} className="font-bold bg-transparent hover:bg-transparent text-red-500 hover:text-red-600 cursor-pointer">×</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          {formData.type === 'table' && (
            <div className="">
              <Label className="text-sm font-medium mb-3 block">{t('tableConfig')}:</Label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <Label htmlFor="tableRows">{t('rowsCount')} *</Label>
                  <Input
                    id="tableRows"
                    type="number"
                    min="1"
                    max="20"
                    value={tableConfig.rows}
                    onChange={(e) => {
                      const newRows = Math.max(1, Math.min(20, Number(e.target.value)));
                      const newSideHeaders = Array.from({ length: newRows }, (_, i) => tableConfig.sideHeaders[i] || '');
                      setTableConfig({ ...tableConfig, rows: newRows, sideHeaders: newSideHeaders });
                    }}
                    placeholder="e.g., 5"
                  />
                </div>
                <div>
                  <Label htmlFor="tableColumns">{t('colsCount')} *</Label>
                  <Input
                    id="tableColumns"
                    type="number"
                    min="1"
                    max="10"
                    value={tableConfig.columns}
                    onChange={(e) => {
                      const newCols = Math.max(1, Math.min(10, Number(e.target.value)));
                      const newTopHeaders = Array.from({ length: newCols }, (_, i) => tableConfig.topHeaders[i] || '');
                      setTableConfig({ ...tableConfig, columns: newCols, topHeaders: newTopHeaders });
                    }}
                    placeholder="e.g., 4"
                  />
                </div>
              </div>
              <div className="">
                <Label className="text-sm font-medium mb-2 block">{t('tablePreview')}:</Label>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr>
                        <th className="border border-gray-300 bg-gray-100 p-2 font-semibold"></th>
                        {Array.from({ length: tableConfig.columns }).map((_, i) => (
                          <th key={`preview-header-${i}`} className="border border-gray-300 bg-gray-100 p-2 font-semibold relative group">
                            <Input
                              value={tableConfig.topHeaders[i] || `Column ${i + 1}`}
                              onChange={(e) => {
                                const newHeaders = [...tableConfig.topHeaders];
                                newHeaders[i] = e.target.value;
                                setTableConfig({ ...tableConfig, topHeaders: newHeaders });
                              }}
                              placeholder={`Column ${i + 1}`}
                              className="text-xs p-1 h-8 w-full text-center font-semibold"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: tableConfig.rows }).map((_, rowIndex) => (
                        <tr key={`preview-row-${rowIndex}`}>
                          <td className="border border-gray-300 bg-gray-100 p-2 font-semibold relative group">
                            <Input
                              value={tableConfig.sideHeaders[rowIndex] || `Row ${rowIndex + 1}`}
                              onChange={(e) => {
                                const newHeaders = [...tableConfig.sideHeaders];
                                newHeaders[rowIndex] = e.target.value;
                                setTableConfig({ ...tableConfig, sideHeaders: newHeaders });
                              }}
                              placeholder={`Row ${rowIndex + 1}`}
                              className="text-xs p-1 h-8 w-full text-center font-semibold"
                            />
                          </td>
                          {Array.from({ length: tableConfig.columns }).map((_, colIndex) => (
                            <td key={`preview-cell-${rowIndex}-${colIndex}`} className="border border-gray-300 p-2 text-center text-gray-400">{tableCells[`${rowIndex}-${colIndex}`] || '-'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">{t('tipHeader')}</p>
                <p className="text-xs text-gray-500 mt-1">{t('noteProvider')}</p>
              </div>
            </div>
          )}
          {formData.type && !['text', 'range', 'date', 'table'].includes(formData.type) && (
            <div className="">
              <Label className="text-sm font-medium mb-3 block">{t('currentOptions')}:</Label>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <Input value={newTempOption} onChange={(e) => setNewTempOption(e.target.value)} placeholder={getPlaceholderText(formData.type)} className="flex-1" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTempOption())} />
                  <Button type="button" onClick={addTempOption} className="createBtn" disabled={!newTempOption.trim()}>{t('add')}</Button>
                </div>
                {formData.type && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600">{t('quickAdd')}:</span>
                    {getQuickOptions(formData.type, formData.title).map((option) => (
                      <Button key={option} type="button" onClick={() => addQuickOption(option)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 text-xs" disabled={tempOptions.includes(option)}>{option}</Button>
                    ))}
                  </div>
                )}
                {tempOptions.length > 0 && (
                  <div className="">
                    <div className="text-xs text-gray-600 mb-2">Current options:</div>
                    <div className="flex flex-wrap gap-2">
                      {tempOptions.map((option, index) => (
                        <div key={index} className="flex items-center bg-green-100 text-green-600 px-2 py-1 rounded text-sm">
                          <span className="mr-2">{option}</span>
                          <Button type="button" onClick={() => removeTempOption(index)} className="font-bold bg-transparent hover:bg-transparent text-red-500 hover:text-red-600 cursor-pointer">×</Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="grid grid-cols-1 gap-4">
            {isRoot && (
              <div>
                <Label htmlFor="company">{t('company')}</Label>
                <Select value={formData.company_id} onValueChange={(value) => setFormData({ ...formData, company_id: value })}>
                  <SelectTrigger><SelectValue placeholder={t('selectCompany')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">{t('noCompany')}</SelectItem>
                    {companies.map((company) => (<SelectItem key={company.id} value={company.id.toString()}>{company.title}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-3 pt-6 mt-6">
            <Button type="submit" className={editingTag ? 'updateBtn' : 'createBtn'} aria-label={editingTag ? t('update') : t('create')}>{editingTag ? t('update') : t('create')}</Button>
            <Button type="button" className="closeBtn" aria-label={t('close')} onClick={() => setIsModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirmDelete')}>
        <p className="text-gray-700">{t('confirmDeleteMessage')} <strong>{deletingTag?.title}</strong>?</p>
        <p className="text-sm text-gray-600">{t('deleteWarning')}</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDelete}>{t('delete')}</Button>
          <Button type="button" variant="outline" onClick={() => setIsDeleteModalOpen(false)} className="closeBtn">{t('cancel')}</Button>
        </div>
      </Modal>
      <Modal isOpen={isOptionsModalOpen} onClose={() => setIsOptionsModalOpen(false)} title={`Manage Options - ${selectedTag?.title}`}>
        <div className="space-y-6">
          <div className="space-y-3">
            {selectedTag?.type === 'range' && editingOption ? (
              <div className="rounded-lg bg-gray-50">
                <Label className="text-sm font-medium mb-3 block">{t('rangeConfig')}:</Label>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <Label>{t('rangeType')}</Label>
                    <Select value={optionRangeValues.type} onValueChange={(value) => setOptionRangeValues({ ...optionRangeValues, type: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="number">{t('rangeNumber')}</SelectItem>
                        <SelectItem value="date">{t('rangeDate')}</SelectItem>
                        <SelectItem value="time">{t('rangeTime')}</SelectItem>
                        <SelectItem value="decimal">{t('rangeDecimal')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{t('unit')}</Label>
                    <Input value={optionRangeValues.unit} onChange={(e) => setOptionRangeValues({ ...optionRangeValues, unit: e.target.value })} placeholder="e.g., $, days, hours" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <Label>{t('minVal')}</Label>
                    <Input
                      type={optionRangeValues.type === 'date' ? 'date' : optionRangeValues.type === 'time' ? 'time' : 'number'}
                      step={optionRangeValues.type === 'decimal' ? '0.01' : '1'}
                      value={optionRangeValues.min}
                      onChange={(e) => setOptionRangeValues({ ...optionRangeValues, min: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t('maxVal')}</Label>
                    <Input
                      type={optionRangeValues.type === 'date' ? 'date' : optionRangeValues.type === 'time' ? 'time' : 'number'}
                      step={optionRangeValues.type === 'decimal' ? '0.01' : '1'}
                      value={optionRangeValues.max}
                      onChange={(e) => setOptionRangeValues({ ...optionRangeValues, max: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{t('stepSize')}</Label>
                    <Input
                      type="number"
                      step={optionRangeValues.type === 'decimal' ? '0.01' : '1'}
                      value={optionRangeValues.step}
                      onChange={(e) => setOptionRangeValues({ ...optionRangeValues, step: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateOption} className="updateBtn" disabled={!optionRangeValues.min || !optionRangeValues.max}>{t('update')}</Button>
                  <Button onClick={cancelEditOption} className="closeBtn">{t('close')}</Button>
                </div>
              </div>
            ) : selectedTag?.type === 'date' ? (
              <div className="rounded-lg bg-gray-50">
                <Label className="text-sm font-medium mb-3 block">{editingOption ? t('editTag') : t('addNewTag')}</Label>
                <div className="mb-4">
                  <Label htmlFor="optionDateUnit">{t('timeUnit')}</Label>
                  <Select value={optionDateUnit} onValueChange={(value) => setOptionDateUnit(value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hours">{t('unitHours')}</SelectItem>
                      <SelectItem value="days">{t('unitDays')}</SelectItem>
                      <SelectItem value="weeks">{t('unitWeeks')}</SelectItem>
                      <SelectItem value="months">{t('unitMonths')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex space-x-2 mb-3">
                  <Input
                    value={newOption}
                    onChange={(e) => setNewOption(e.target.value)}
                    placeholder={t('placeholderDefault')}
                    className="flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && (editingOption ? handleUpdateOption() : handleAddOption())}
                  />
                  <Button onClick={editingOption ? handleUpdateOption : handleAddOption} className={editingOption ? "updateBtn" : "createBtn"} disabled={!newOption.trim()}>{editingOption ? t('update') : t('add')}</Button>
                  <Button onClick={cancelEditOption} className="closeBtn">{t('close')}</Button>
                </div>
                {!editingOption && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-xs text-gray-600">{t('quickAdd')} ({optionDateUnit}):</span>
                    {(optionDateUnit === 'hours' ? ['1', '2', '4', '8', '12', '24'] : optionDateUnit === 'weeks' ? ['1', '2', '3', '4'] : ['1', '2', '3', '7', '14', '30']).map((option) => (
                      <Button key={option} onClick={() => setNewOption(option)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 text-xs">{option} {optionDateUnit}</Button>
                    ))}
                  </div>
                )}
              </div>
            ) : selectedTag?.type === 'table' ? (
              <div>
                <div className="rounded-lg bg-gray-50">
                  <Label className="text-sm font-medium mb-3 block">{t('tableConfig')}:</Label>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <Label htmlFor="optionTableRows">{t('rowsCount')}</Label>
                      <Input
                        id="optionTableRows"
                        type="number"
                        min="1"
                        max="20"
                        value={optionTableConfig.rows}
                        onChange={(e) => {
                          const newRows = Math.max(1, Math.min(20, Number(e.target.value)));
                          const newSideHeaders = Array.from({ length: newRows }, (_, i) => optionTableConfig.sideHeaders[i] || '');
                          setOptionTableConfig({ ...optionTableConfig, rows: newRows, sideHeaders: newSideHeaders });
                        }}
                        placeholder="e.g., 5"
                      />
                    </div>
                    <div>
                      <Label htmlFor="optionTableColumns">{t('colsCount')}</Label>
                      <Input
                        id="optionTableColumns"
                        type="number"
                        min="1"
                        max="10"
                        value={optionTableConfig.columns}
                        onChange={(e) => {
                          const newCols = Math.max(1, Math.min(10, Number(e.target.value)));
                          const newTopHeaders = Array.from({ length: newCols }, (_, i) => optionTableConfig.topHeaders[i] || '');
                          setOptionTableConfig({ ...optionTableConfig, columns: newCols, topHeaders: newTopHeaders });
                        }}
                        placeholder="e.g., 4"
                      />
                    </div>
                  </div>
                  <div className="mb-4 rounded p-3 bg-white">
                    <Label className="text-sm font-medium mb-2 block">{t('tablePreview')}:</Label>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse">
                        <thead>
                          <tr>
                            <th className="border border-gray-300 bg-gray-100 p-2 font-semibold"></th>
                            {Array.from({ length: optionTableConfig.columns }).map((_, i) => (
                              <th key={`opt-preview-header-${i}`} className="border border-gray-300 bg-gray-100 p-2 font-semibold relative group">
                                <Input
                                  value={optionTableConfig.topHeaders[i] || `Column ${i + 1}`}
                                  onChange={(e) => {
                                    const newHeaders = [...optionTableConfig.topHeaders];
                                    newHeaders[i] = e.target.value;
                                    setOptionTableConfig({ ...optionTableConfig, topHeaders: newHeaders });
                                  }}
                                  placeholder={`Column ${i + 1}`}
                                  className="text-xs p-1 h-8 w-full text-center font-semibold"
                                />
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Array.from({ length: optionTableConfig.rows }).map((_, rowIndex) => (
                            <tr key={`opt-preview-row-${rowIndex}`}>
                              <td className="border border-gray-300 bg-gray-100 p-2 font-semibold relative group">
                                <Input
                                  value={optionTableConfig.sideHeaders[rowIndex] || `Row ${rowIndex + 1}`}
                                  onChange={(e) => {
                                    const newHeaders = [...optionTableConfig.sideHeaders];
                                    newHeaders[rowIndex] = e.target.value;
                                    setOptionTableConfig({ ...optionTableConfig, sideHeaders: newHeaders });
                                  }}
                                  placeholder={`Row ${rowIndex + 1}`}
                                  className="text-xs p-1 h-8 w-full text-center font-semibold"
                                />
                              </td>
                              {Array.from({ length: optionTableConfig.columns }).map((_, colIndex) => (
                                <td key={`opt-preview-cell-${rowIndex}-${colIndex}`} className="border border-gray-300 p-2">
                                  <Input
                                    value={optionTableCells[`${rowIndex}-${colIndex}`] || ''}
                                    onChange={(e) => { setOptionTableCells({ ...optionTableCells, [`${rowIndex}-${colIndex}`]: e.target.value }); }}
                                    placeholder="Enter value"
                                    className="text-xs p-1 h-8 w-full"
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">{t('tipHeader')}</p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={async () => {
                        if (!selectedTag) return;
                        try {
                          if (tagOptions.length > 0) { await deleteTagOption(tagOptions[0].id); }
                          const tableData = { rows: optionTableConfig.rows, columns: optionTableConfig.columns, sideHeaders: optionTableConfig.sideHeaders, topHeaders: optionTableConfig.topHeaders, cells: optionTableCells };
                          await createTagOption({ tag_id: selectedTag.id, option_value: JSON.stringify(tableData) });
                          await fetchTagOptions(selectedTag.id);
                          fetchTags();
                          toast.success(t('optionUpdated'));
                        } catch (error) { toast.error(t('errorUpdatingOption')); }
                      }}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <i className="fa fa-save mr-2"></i> {t('save')}
                    </Button>
                    <Button onClick={() => setIsOptionsModalOpen(false)} className="bg-gray-600 text-white hover:bg-gray-700">{t('close')}</Button>
                  </div>
                </div>
              </div>
            ) : selectedTag?.type === 'text' ? (
              <div className="bg-blue-50 rounded-lg text-center">
                <p className="text-blue-800 font-medium">📝 Text Input Field</p>
                <p className="text-blue-600 text-sm mt-1">This is a free text input field. No predefined options needed.</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <Input
                      value={newOption}
                      onChange={(e) => setNewOption(e.target.value)}
                      placeholder={editingOption ? t('placeholderDefault') : getPlaceholderText(selectedTag?.type)}
                      className="flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && (editingOption ? handleUpdateOption() : handleAddOption())}
                    />
                    {editingOption ? (
                      <>
                        <Button onClick={handleUpdateOption} className="updateBtn" disabled={!newOption.trim()}>{t('update')}</Button>
                        <Button onClick={cancelEditOption} className="closeBtn">{t('close')}</Button>
                      </>
                    ) : (<Button onClick={handleAddOption} className="createBtn" disabled={!newOption.trim()}>{t('add')}</Button>)}
                  </div>
                  {!editingOption && selectedTag?.type && (
                    <div className="flex flex-wrap gap-2">
                      <span className="text-sm text-gray-600">{t('quickAdd')}:</span>
                      {getQuickOptions(selectedTag.type).map((option) => (<Button key={option} onClick={() => setNewOption(option)} className="bg-gray-200 text-gray-700 hover:bg-gray-300 px-2 py-1 text-xs">{option}</Button>))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          <div className="rounded-lg">
            <div className="px-4 py-2 bg-gray-50"><h4 className="font-medium">{t('currentOptions')}</h4></div>
            <div className="max-h-60 overflow-y-auto">
              {tagOptions.length === 0 ? (<div className="text-center text-gray-500">{t('noTagsYet')}</div>) : (
                <div className="divide-y">
                  {tagOptions.map((option) => (
                    <div key={option.id} className="flex items-center justify-between p-3">
                      <span className="font-medium">{option.option_value}</span>
                      <div className="flex space-x-2">
                        <Button onClick={() => handleEditOption(option)} className="updateBtn" aria-label="Edit"><i className="fa fa-edit"></i></Button>
                        <Button onClick={() => handleDeleteOption(option.id)} className="deleteBtn" aria-label="Delete"><i className="fa fa-trash"></i></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end"><Button onClick={() => setIsOptionsModalOpen(false)} className="bg-gray-600 text-white hover:bg-gray-700">{t('close')}</Button></div>
        </div>
      </Modal>
    </div>
  );
}