'use client';

import { useState, useEffect } from 'react';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { getAllCompanies, createCompany, updateCompany, deleteCompany } from '@/lib/api/companies';
import { getAdmins } from '@/lib/api/user';
import { uploadCompanyLogo, uploadCompanyFavicon } from '@/lib/api/upload';
import { Company } from '@/types/companies';
import { User } from '@/types/users';
import { useAuth } from '@/context/AuthContext';
import NextImage from 'next/image';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Country, Governorate, Municipality } from '@/types/locations';
import { getAllCountries, getGovernrateByCountryId, getMunicipalityByGovernrateId } from '@/lib/api/locations';

export default function Companies() {
  const t = useTranslations('Dashboard.companies');
  const { user } = useAuth();
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

  const isValidImageSrc = (src: string | null | undefined): src is string => {
    if (!src || typeof src !== 'string') { return false; }
    if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:')) { return true; }
    try {
      new URL(src);
      return true;
    } catch { return false; }
  };

  const [formData, setFormData] = useState({
    admin_id: '',
    title: '',
    url: '',
    logo: '',
    favicon: '',
    matricule: '',
    domain: '',
    date_foundation: '',
    description: '',
    contact: '',
    tel: '',
    email: '',
    address: '',
    country_id: '',
    governorat_id: '',
    municipality_id: '',
    status: '1'
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  const columns: DataTableColumn<Company>[] = [
    { header: 'ID', accessor: 'id' },
    {
      header: 'Logo', accessor: 'logo', cell: (company) => (
        <div className="w-16 h-10 rounded-lg bg-white border border-slate-100 shadow-sm flex items-center justify-center p-1 overflow-hidden group/logo-cell transition-all hover:border-primary/30">
          {company.logo ? (
            <img src={isValidImageSrc(company.logo) ? (company.logo.startsWith('/') ? `${company.logo}?v=${company.id}` : company.logo) : '/images/default-images/logo.png'} alt="Logo" className="object-contain max-h-full max-w-full" style={{ maxHeight: 32, maxWidth: 64 }} />
          ) : (
            <div className="text-[10px] text-slate-300 font-bold uppercase tracking-tighter">No Image</div>
          )}
        </div>
      )
    },
    { header: 'Title', accessor: 'title' },
    { header: 'URL', accessor: 'url' },
    { header: 'Domain', accessor: 'domain' },
    { header: 'Matricule', accessor: 'matricule' },
    { header: 'Admin', accessor: 'admin_id', cell: (company) => company.admin ? `${company.admin.firstname || ''} ${company.admin.lastname || ''}`.trim() || company.admin.email : 'No Admin' },
    {
      header: 'Status', accessor: 'status', cell: (company) => (
        <span className={`px-2 py-1 rounded-full text-xs ${company.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>
          {company.status === 1 ? 'Active' : 'Inactive'}
        </span>
      )
    },
  ];

  useEffect(() => {
    if (user) {
      fetchCompanies();
      fetchUsers();
      fetchInitialLocations();
    }
  }, [user]);

  const fetchInitialLocations = async () => {
    try {
      const countryData = await getAllCountries();
      setCountries(countryData);
    } catch (error) {
      toast.error(t('toastErrorLocations'));
    }
  };

  useEffect(() => {
    if (formData.country_id && formData.country_id !== 'none') {
      fetchGovernorates(Number(formData.country_id));
    } else {
      setGovernorates([]);
      setMunicipalities([]);
    }
  }, [formData.country_id]);

  useEffect(() => {
    if (formData.governorat_id && formData.governorat_id !== 'none') {
      fetchMunicipalities(Number(formData.governorat_id));
    } else {
      setMunicipalities([]);
    }
  }, [formData.governorat_id]);

  const fetchGovernorates = async (countryId: number) => {
    try {
      const data = await getGovernrateByCountryId(countryId);
      setGovernorates(data);
    } catch (error) {
      toast.error(t('toastErrorGovernorates'));
    }
  };

  const fetchMunicipalities = async (governorateId: number) => {
    try {
      const data = await getMunicipalityByGovernrateId(governorateId);
      setMunicipalities(data);
    } catch (error) {
      toast.error(t('toastErrorMunicipalities'));
    }
  };

  const fetchCompanies = async () => {
    try {
      const data = await getAllCompanies();
      setCompanies(data);
    } catch (error) {
      toast.error(t('toastErrorCompaniesFetch'));
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      console.log("user", user);
      if (!user) return;
      const data = await getAdmins(user.id);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users", error);
      toast.error(t('toastErrorUsers'));
    }
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setLogoFile(null);
    setFaviconFile(null);
    setLogoPreview(null);
    setFaviconPreview(null);
    setFormData({
      admin_id: 'none',
      title: '',
      url: '',
      logo: '',
      favicon: '',
      matricule: '',
      domain: '',
      date_foundation: '',
      description: '',
      contact: '',
      tel: '',
      email: '',
      address: '',
      country_id: 'none',
      governorat_id: 'none',
      municipality_id: 'none',
      status: '1'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (company: Company) => {
    setEditingCompany(company);
    setLogoFile(null);
    setFaviconFile(null);
    setLogoPreview(null);
    setFaviconPreview(null);
    setFormData({
      admin_id: company.admin_id?.toString() || 'none',
      title: company.title,
      url: company.url,
      logo: company.logo || '',
      favicon: company.favicon || '',
      matricule: company.matricule || '',
      domain: company.domain || '',
      date_foundation: company.date_foundation ? company.date_foundation.split('T')[0] : '',
      description: company.description || '',
      contact: company.contact || '',
      tel: company.tel || '',
      email: company.email || '',
      address: company.address || '',
      country_id: company.country_id?.toString() || 'none',
      governorat_id: company.governorat_id?.toString() || 'none',
      municipality_id: company.municipality_id?.toString() || 'none',
      status: company.status.toString()
    });
    setIsModalOpen(true);
  };

  const handleDelete = (company: Company) => {
    setDeletingCompany(company);
    setIsDeleteModalOpen(true);
  };

  const handleSettings = (company: Company) => {
    router.push(`/dashboard/companies/${company.id}`);
  };

  const confirmDelete = async () => {
    if (deletingCompany) {
      try {
        await deleteCompany(deletingCompany.id);
        fetchCompanies();
        toast.success('Company deleted successfully');
      } catch (error) {
        toast.error('Error deleting company');
      }
    }
    setIsDeleteModalOpen(false);
    setDeletingCompany(null);
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingCompany) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      return;
    }

    setUploadingLogo(true);
    try {
      const result = await uploadCompanyLogo(file, editingCompany.id, formData.title || 'company');
      setFormData({ ...formData, logo: result.logoUrl });
      toast.success('Logo uploaded and saved');
    } catch (error) { toast.error('Error uploading logo'); }
    finally { setUploadingLogo(false); }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!editingCompany) {
      setFaviconFile(file);
      setFaviconPreview(URL.createObjectURL(file));
      return;
    }

    setUploadingFavicon(true);
    try {
      const result = await uploadCompanyFavicon(file, editingCompany.id, formData.title || 'company');
      setFormData({ ...formData, favicon: result.faviconUrl });
      toast.success('Favicon uploaded and saved');
    } catch (error) { toast.error('Error uploading favicon'); }
    finally { setUploadingFavicon(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = {
        title: formData.title,
        url: formData.url,
        status: Number(formData.status)
      };

      if (formData.admin_id && formData.admin_id !== 'none') {
        payload.admin_id = Number(formData.admin_id);
      }

      payload.logo = formData.logo;
      payload.favicon = formData.favicon;
      if (formData.matricule) payload.matricule = formData.matricule;
      if (formData.domain) payload.domain = formData.domain;
      if (formData.date_foundation) payload.date_foundation = formData.date_foundation;
      if (formData.description) payload.description = formData.description;
      if (formData.contact) payload.contact = formData.contact;
      if (formData.tel) payload.tel = formData.tel;
      if (formData.email) payload.email = formData.email;
      if (formData.address) payload.address = formData.address;
      if (formData.country_id && formData.country_id !== 'none') payload.country_id = Number(formData.country_id);
      if (formData.governorat_id && formData.governorat_id !== 'none') payload.governorat_id = Number(formData.governorat_id);
      if (formData.municipality_id && formData.municipality_id !== 'none') payload.municipality_id = Number(formData.municipality_id);

      let companyIdToUploadFor = editingCompany?.id;

      if (editingCompany) {
        await updateCompany(editingCompany.id, payload);
      } else {
        const result = await createCompany(payload);
        companyIdToUploadFor = result.id;
      }

      // Handle delayed uploads for new companies
      if (!editingCompany && companyIdToUploadFor) {
        if (logoFile) {
          try { await uploadCompanyLogo(logoFile, companyIdToUploadFor, formData.title); } catch (e) { toast.error("Logo upload failed"); }
        }
        if (faviconFile) {
          try { await uploadCompanyFavicon(faviconFile, companyIdToUploadFor, formData.title); } catch (e) { toast.error("Favicon upload failed"); }
        }
      }

      toast.success(editingCompany ? 'Company updated successfully' : 'Company created successfully');
      setIsModalOpen(false);
      fetchCompanies();
    } catch (error) {
      toast.error('Error saving company');
    }
  };

  return (
    <div className="space-y-8">
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Companies Management</h2>
          {user?.role === 'Root' && (<Button onClick={handleAdd} className="addNewBtn"><i className="fa fa-plus mr-2"></i> Add New Company</Button>)}
        </div>
        <div className="p-6">
          {loading ? (
            <div className="text-center py-4">Loading companies...</div>
          ) : (
            <DataTable
              columns={columns}
              data={companies}
              onEdit={handleEdit}
              onDelete={user?.role === 'Root' ? handleDelete : () => { }}
              onCustomAction={user?.role === 'Root' ? handleSettings : () => { }}
              customActionLabel="Settings"
              iconCustomAction="fa fa-cog"
              showDelete={user?.role === 'Root'}
              showSettings={user?.role === 'Root'}
              defaultSort={{ key: 'id', direction: 'descending' }}
            />
          )}
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCompany ? 'Edit Company' : 'Add New Company'}>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="font-semibold">Company Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Acme Corp"
                  className="bg-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url" className="font-semibold">Company URL *</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://acme.inc"
                  className="bg-white"
                  required
                  disabled={user?.role !== 'Root'}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="domain" className="font-semibold">Business Domain</Label>
                <Input
                  id="domain"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  placeholder="Technology"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="matricule" className="font-semibold">Registration No. (Matricule)</Label>
                <Input
                  id="matricule"
                  value={formData.matricule}
                  onChange={(e) => setFormData({ ...formData, matricule: e.target.value })}
                  placeholder="REG-12345"
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Administration & Status</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="admin_id" className="font-semibold">Company Admin</Label>
                <Select
                  value={formData.admin_id}
                  onValueChange={(value) => setFormData({ ...formData, admin_id: value })}
                  disabled={user?.role !== 'Root'}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select an admin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Admin Assigned</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id.toString()}>
                        {u.firstname && u.lastname ? `${u.firstname} ${u.lastname}` : u.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status" className="font-semibold">Account Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={user?.role !== 'Root'}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Active</SelectItem>
                    <SelectItem value="0">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="date_foundation" className="font-semibold">Foundation Date</Label>
                <Input
                  id="date_foundation"
                  type="date"
                  value={formData.date_foundation}
                  onChange={(e) => setFormData({ ...formData, date_foundation: e.target.value })}
                  className="bg-white"
                />
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Visual Assets & Branding</h3>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Logo</Label>
                <div className="flex items-center gap-4">
                  <div className="w-40 h-20 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-3 relative overflow-hidden group/logo-preview transition-all hover:border-primary/30">
                    {(logoPreview || formData.logo) ? (
                      <img src={logoPreview || (isValidImageSrc(formData.logo) ? (formData.logo.startsWith('/') ? `${formData.logo}?v=${editingCompany?.id || 'new'}` : formData.logo) : '/images/default-images/logo.png')} alt="Preview" className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/logo-preview:scale-110" />
                    ) : (
                      <div className="text-slate-300 text-[10px] font-bold uppercase tracking-widest text-center">No Logo<br /><span className="text-[8px] opacity-50 lowercase font-normal">Select a file</span></div>
                    )}
                    {uploadingLogo && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="cursor-pointer bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 text-primary text-[11px] font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 group">
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 4m4 0v12" />
                      </svg>
                      {editingCompany ? 'Change Logo' : 'Select Logo'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                    </label>
                    <Input
                      placeholder='Relative path fallback...'
                      value={formData.logo}
                      onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                      className="h-8 text-[9px] font-mono bg-white/50 border-slate-100"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700">Favicon</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center relative overflow-hidden group/fav-preview transition-all hover:border-primary/30">
                    {(faviconPreview || formData.favicon) ? (
                      <img src={faviconPreview || (isValidImageSrc(formData.favicon) ? (formData.favicon.startsWith('/') ? `${formData.favicon}?v=${editingCompany?.id || 'new'}` : formData.favicon) : '/favicon.ico')} alt="Preview" className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/fav-preview:scale-110" style={{ width: 48, height: 48 }} />
                    ) : (
                      <div className="text-slate-300 text-[8px] font-bold uppercase tracking-tighter text-center">No Favicon</div>
                    )}
                    {uploadingFavicon && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-3">
                    <label className="cursor-pointer bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 text-primary text-[11px] font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 group">
                      <svg className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 4m4 0v12" />
                      </svg>
                      {editingCompany ? 'Change Icon' : 'Select Icon'}
                      <input type="file" accept=".ico,image/png,image/x-icon" className="hidden" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                    </label>
                    <Input
                      placeholder='Favicon path fallback...'
                      value={formData.favicon}
                      onChange={(e) => setFormData({ ...formData, favicon: e.target.value })}
                      className="h-8 text-[9px] font-mono bg-white/50 border-slate-100"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Contact Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tel" className="font-semibold">Phone Number</Label>
                <Input
                  id="tel"
                  value={formData.tel}
                  onChange={(e) => setFormData({ ...formData, tel: e.target.value })}
                  placeholder="+216 73 123 456"
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-semibold">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@company.com"
                  className="bg-white"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address" className="font-semibold">Physical Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Street Name, Building Name"
                className="bg-white"
              />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-bold text-primary uppercase tracking-wider">Location Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country_id" className="font-semibold">Country</Label>
                <Select
                  value={formData.country_id}
                  onValueChange={(value) => setFormData({ ...formData, country_id: value, governorat_id: 'none', municipality_id: 'none' })}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select Country</SelectItem>
                    {countries.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="governorat_id" className="font-semibold">Governorate</Label>
                <Select
                  value={formData.governorat_id}
                  onValueChange={(value) => setFormData({ ...formData, governorat_id: value, municipality_id: 'none' })}
                  disabled={formData.country_id === 'none'}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Governorate" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select Governorate</SelectItem>
                    {governorates.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="municipality_id" className="font-semibold">Municipality</Label>
                <Select
                  value={formData.municipality_id}
                  onValueChange={(value) => setFormData({ ...formData, municipality_id: value })}
                  disabled={formData.governorat_id === 'none'}
                >
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select Municipality" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Select Municipality</SelectItem>
                    {municipalities.map((m) => (
                      <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <Label htmlFor="description" className="font-bold">About Us Narrative</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the company mission and history..." rows={4} className="bg-white" />
          </div>
          <div className="space-y-6">
            <Label htmlFor="contact" className="font-bold">Contact View Description</Label>
            <Textarea id="contact" value={formData.contact} onChange={(e) => setFormData({ ...formData, contact: e.target.value })} placeholder="Brief text for contact page greeting..." rows={4} className="bg-white" />
          </div>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="submit" className={`${editingCompany ? 'updateBtn' : 'createBtn'} px-10`}>{editingCompany ? 'Update Company' : 'Register Company'}</Button>
            <Button type="button" variant="outline" className="closeBtn px-8" onClick={() => setIsModalOpen(false)}>Close</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
        <div className="space-y-6">
          <p className="text-gray-700">Are you sure you want to delete <strong>{deletingCompany?.title}</strong>?</p>
          <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="button" className="deleteBtn" onClick={confirmDelete}>Delete</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>Close</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}