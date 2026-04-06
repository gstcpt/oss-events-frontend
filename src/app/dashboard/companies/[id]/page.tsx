'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DataTable, { DataTableColumn } from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Textarea from '@/components/ui/textarea';
import { getCompanyById, updateCompany, getCompanySettings, createCompanySettings, updateCompanySettings, deleteCompanySettings, getAppSettings } from '@/lib/api/companies';
import { getAdmins } from '@/lib/api/user';
import { uploadCompanyLogo, uploadCompanyFavicon } from '@/lib/api/upload';
import { Company, CompanySettings } from '@/types/companies';
import { User } from '@/types/users';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { Country, Governorate, Municipality } from '@/types/locations';
import { getAllCountries, getGovernrateByCountryId, getMunicipalityByGovernrateId } from '@/lib/api/locations';

interface AppSetting {
  id: string;
  famille: string;
  title: string;
  value?: string;
}

export default function CompanyDetails() {
  const { user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const companyId = Number(params.id);
  const t = useTranslations('Dashboard.companies');

  const [company, setCompany] = useState<Company | null>(null);

  const isValidImageSrc = (src: string | null | undefined): src is string => {
    if (!src || typeof src !== 'string') { return false; }
    if (src.startsWith('/') || src.startsWith('blob:') || src.startsWith('data:')) { return true; }
    try {
      new URL(src);
      return true;
    } catch { return false; }
  };

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [companySettings, setCompanySettings] = useState<CompanySettings[]>([]);
  const [appSettings, setAppSettings] = useState<AppSetting[]>([]);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingSetting, setEditingSetting] = useState<CompanySettings | null>(null);
  const [deletingSetting, setDeletingSetting] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyFormData, setCompanyFormData] = useState({
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


  const [settingsFormData, setSettingsFormData] = useState({
    app_settings_id: '',
    custom_value: '',
    status: '1'
  });

  const settingsColumns: DataTableColumn<CompanySettings>[] = [
    { header: t('settingsColumns.id'), accessor: 'id' },
    {
      header: t('settingsColumns.setting'), accessor: 'app_settings_id', cell: (setting) => {
        const appSetting = Array.isArray(appSettings) ? appSettings.find(app => app.id === (setting.app_settings_id ?? 0).toString()) : null;
        return appSetting ? `${appSetting.title} (${appSetting.famille})` : t('settingsColumns.unknownSetting');
      }
    },
    {
      header: t('settingsColumns.defaultValue'), accessor: 'app_settings_id', cell: (setting) => {
        const appSetting = Array.isArray(appSettings) ? appSettings.find(app => app.id === (setting.app_settings_id ?? 0).toString()) : null;
        return appSetting?.value || t('settingsColumns.noDefault');
      }
    },
    { header: t('settingsColumns.customValue'), accessor: 'custom_value' },
    {
      header: t('settingsColumns.status'), accessor: 'status', cell: (setting) => (
        <span className={`px-2 py-1 rounded-full text-xs ${setting.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>
          {setting.status === 1 ? t('statusActive') : t('statusInactive')}
        </span>
      )
    },
  ];

  useEffect(() => {
    if (user && companyId) {
      fetchCompanyData();
      fetchUsers();
      fetchAppSettings();
      fetchInitialLocations();
    }
  }, [user, companyId]);

  const fetchInitialLocations = async () => {
    try {
      const countryData = await getAllCountries();
      setCountries(countryData);
    } catch (error) {
      toast.error('Error fetching locations');
    }
  };

  useEffect(() => {
    if (companyFormData.country_id && companyFormData.country_id !== 'none') {
      fetchGovernorates(Number(companyFormData.country_id));
    } else {
      setGovernorates([]);
      setMunicipalities([]);
    }
  }, [companyFormData.country_id]);

  useEffect(() => {
    if (companyFormData.governorat_id && companyFormData.governorat_id !== 'none') {
      fetchMunicipalities(Number(companyFormData.governorat_id));
    } else {
      setMunicipalities([]);
    }
  }, [companyFormData.governorat_id]);

  const fetchGovernorates = async (countryId: number) => {
    try {
      const data = await getGovernrateByCountryId(countryId);
      setGovernorates(data);
    } catch (error) {
      toast.error('Error fetching governorates');
    }
  };

  const fetchMunicipalities = async (governorateId: number) => {
    try {
      const data = await getMunicipalityByGovernrateId(governorateId);
      setMunicipalities(data);
    } catch (error) {
      toast.error('Error fetching municipalities');
    }
  };

  const fetchCompanyData = async () => {
    try {
      const [companyData, settingsData] = await Promise.all([
        getCompanyById(companyId),
        getCompanySettings(companyId)
      ]);

      setCompany(companyData);
      setCompanySettings(settingsData || []);

      if (companyData) {
        setCompanyFormData({
          admin_id: companyData.admin_id?.toString() || 'none',
          title: companyData.title,
          url: companyData.url,
          logo: companyData.logo || '',
          favicon: companyData.favicon || '',
          matricule: companyData.matricule || '',
          domain: companyData.domain || '',
          date_foundation: companyData.date_foundation ? companyData.date_foundation.split('T')[0] : '',
          description: companyData.description || '',
          contact: companyData.contact || '',
          tel: companyData.tel || '',
          email: companyData.email || '',
          address: companyData.address || '',
          country_id: companyData.country_id?.toString() || 'none',
          governorat_id: companyData.governorat_id?.toString() || 'none',
          municipality_id: companyData.municipality_id?.toString() || 'none',
          status: companyData.status.toString()
        });
      }
    } catch (error) {
      toast.error('Error fetching company data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    setUploadingLogo(true);
    setLogoPreview(URL.createObjectURL(file));
    try {
      const result = await uploadCompanyLogo(file, company.id, companyFormData.title || 'company');
      setCompanyFormData({ ...companyFormData, logo: result.logoUrl });
      toast.success('Logo updated successfully');
    } catch (error) { toast.error('Error uploading logo'); }
    finally { setUploadingLogo(false); }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;
    setUploadingFavicon(true);
    setFaviconPreview(URL.createObjectURL(file));
    try {
      const result = await uploadCompanyFavicon(file, company.id, companyFormData.title || 'company');
      setCompanyFormData({ ...companyFormData, favicon: result.faviconUrl });
      toast.success('Favicon updated successfully');
    } catch (error) { toast.error('Error uploading favicon'); }
    finally { setUploadingFavicon(false); }
  };

  const fetchUsers = async () => {
    try {
      console.log(user);
      if (!user) return;
      const data = await getAdmins(user.id);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users", error);
      toast.error('Error fetching users');
    }
  };

  const fetchAppSettings = async () => {
    try {
      const response = await getAppSettings();
      setAppSettings(response.appSettings || []);
    } catch (error) {
      toast.error('Error fetching app settings');
    }
  };

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...companyFormData,
        admin_id: companyFormData.admin_id && companyFormData.admin_id !== 'none' ? Number(companyFormData.admin_id) : undefined,
        country_id: companyFormData.country_id && companyFormData.country_id !== 'none' ? Number(companyFormData.country_id) : undefined,
        governorat_id: companyFormData.governorat_id && companyFormData.governorat_id !== 'none' ? Number(companyFormData.governorat_id) : undefined,
        municipality_id: companyFormData.municipality_id && companyFormData.municipality_id !== 'none' ? Number(companyFormData.municipality_id) : undefined,
        status: Number(companyFormData.status),
        date_foundation: companyFormData.date_foundation || undefined
      };

      await updateCompany(companyId, payload);
      toast.success('Company updated successfully');
      setIsCompanyModalOpen(false);
      fetchCompanyData();
    } catch (error) {
      toast.error('Error updating company');
    }
  };

  const handleAddSetting = () => {
    setEditingSetting(null);
    setSettingsFormData({
      app_settings_id: '',
      custom_value: '',
      status: '1'
    });
    setIsSettingsModalOpen(true);
  };

  const handleEditSetting = (setting: CompanySettings) => {
    setEditingSetting(setting);
    setSettingsFormData({
      app_settings_id: setting.app_settings_id?.toString() || '',
      custom_value: setting.custom_value || '',
      status: setting.status.toString()
    });
    setIsSettingsModalOpen(true);
  };

  const handleDeleteSetting = (setting: CompanySettings) => {
    setDeletingSetting(setting);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSetting = async () => {
    if (deletingSetting) {
      try {
        await deleteCompanySettings(deletingSetting.id);
        fetchCompanyData();
        toast.success('Setting deleted successfully');
      } catch (error) {
        toast.error('Error deleting setting');
      }
    }
    setIsDeleteModalOpen(false);
    setDeletingSetting(null);
  };

  const handleSubmitSetting = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...settingsFormData,
        app_settings_id: Number(settingsFormData.app_settings_id),
        company_id: companyId,
        status: Number(settingsFormData.status)
      };

      if (editingSetting) {
        await updateCompanySettings(editingSetting.id, payload);
        toast.success('Setting updated successfully');
      } else {
        await createCompanySettings(payload);
        toast.success('Setting created successfully');
      }

      setIsSettingsModalOpen(false);
      fetchCompanyData();
    } catch (error) {
      toast.error('Error saving setting');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading company details...</div>;
  }

  if (!company) {
    return <div className="text-center py-8">Company not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* Company Information */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Company Information</h2>
          <div className="space-x-2">
            <Button onClick={() => setIsCompanyModalOpen(true)} className="updateBtn"><i className="fa fa-edit mr-2"></i> Update Company</Button>
            <Button onClick={() => router.back()} className="hover:text-gray-900 bg-gray-200 text-gray-900 hover:bg-gray-300" variant="outline"><i className="fa fa-arrow-left mr-2"></i> Back</Button>
          </div>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-3 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Logo</h4>
                <img src={isValidImageSrc(company.logo) ? (company.logo.startsWith('/') ? `${company.logo}?v=${company.id}` : company.logo) : '/images/default.jpg'} alt={company.title} className="w-32 h-32 rounded-full bg-gray-200 p-2 object-contain" />
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-2">Favicon</h4>
                <img src={isValidImageSrc(company.favicon) ? (company.favicon.startsWith('/') ? `${company.favicon}?v=${company.id}` : company.favicon) : '/images/default.jpg'} alt="Favicon" className="w-12 h-12 bg-gray-100 p-1 border rounded shadow-sm object-contain" />
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Basic Information</h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Title</dt>
                  <dd className="text-sm text-gray-900">{company.title}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">URL</dt>
                  <dd className="text-sm text-gray-900">{company.url}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Domain</dt>
                  <dd className="text-sm text-gray-900">{company.domain || 'Not set'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Matricule</dt>
                  <dd className="text-sm text-gray-900">{company.matricule || 'Not set'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Additional Details</h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Admin</dt>
                  <dd className="text-sm text-gray-900">
                    {company.admin
                      ? `${company.admin.firstname || ''} ${company.admin.lastname || ''}`.trim() || company.admin.email
                      : 'No Admin'
                    }
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Foundation Date</dt>
                  <dd className="text-sm text-gray-900">
                    {company.date_foundation ? new Date(company.date_foundation).toLocaleDateString() : 'Not set'}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="text-sm text-gray-900">
                    <span className={`px-2 py-1 rounded-full text-xs ${company.status === 1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-800'}`}>
                      {company.status === 1 ? t('statusActive') : t('statusInactive')}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="text-sm text-gray-900">{company.description || 'No description'}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Contact & Location</h3>
              <dl className="mt-2 space-y-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone / Email</dt>
                  <dd className="text-sm text-gray-900">{company.tel || 'N/A'} / {company.email || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Address</dt>
                  <dd className="text-sm text-gray-900">{company.address || 'N/A'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="text-sm text-gray-900">
                    {company.countries?.name || 'N/A'} - {company.governorates?.name || 'N/A'} - {company.municipalities?.name || 'N/A'}
                  </dd>
                </div>
              </dl>
            </div>
          </div>{/* end grid */}
        </div>{/* end p-6 */}
      </div>{/* end card */}

      {/* Company Settings */}
      <div className="card">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold">{t('companySettings')}</h2>
          <Button onClick={handleAddSetting} aria-label={t('addNewSetting')} className="addNewBtn"><i className="fa fa-plus mr-2"></i> {t('addNewSetting')}</Button>
        </div>
        <div className="p-6">
          <DataTable
            columns={settingsColumns}
            data={companySettings}
            onEdit={handleEditSetting}
            onDelete={handleDeleteSetting}
            defaultSort={{ key: 'id', direction: 'descending' }}
          />
        </div>
      </div>

      {/* Edit Company Modal */}
      <Modal isOpen={isCompanyModalOpen} onClose={() => setIsCompanyModalOpen(false)} title={t('editCompany')}>
        <form onSubmit={handleUpdateCompany} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">{t('labelCompanyTitle')}</Label>
              <Input
                id="title"
                value={companyFormData.title}
                onChange={(e) => setCompanyFormData({ ...companyFormData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="url">{t('labelCompanyUrl')}</Label>
              <Input
                id="url"
                value={companyFormData.url}
                onChange={(e) => setCompanyFormData({ ...companyFormData, url: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="domain">{t('labelDomain')}</Label>
              <Input
                id="domain"
                value={companyFormData.domain}
                onChange={(e) => setCompanyFormData({ ...companyFormData, domain: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="matricule">{t('labelMatricule')}</Label>
              <Input
                id="matricule"
                value={companyFormData.matricule}
                onChange={(e) => setCompanyFormData({ ...companyFormData, matricule: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="admin_id">{t('labelAdmin')}</Label>
              <Select value={companyFormData.admin_id} onValueChange={(value) => setCompanyFormData({ ...companyFormData, admin_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t('selectAdmin')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{t('noAdmin')}</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.firstname && user.lastname ? `${user.firstname} ${user.lastname}` : user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date_foundation">{t('labelFoundationDate')}</Label>
              <Input
                id="date_foundation"
                type="date"
                value={companyFormData.date_foundation}
                onChange={(e) => setCompanyFormData({ ...companyFormData, date_foundation: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 py-4 border-y border-slate-100 bg-slate-50/50 -mx-6 px-6">
            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Company Logo
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-16 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-2 relative overflow-hidden group/logo transition-all hover:border-primary/30">
                  {(logoPreview || companyFormData.logo) ? (
                    <img src={logoPreview || (isValidImageSrc(companyFormData.logo) ? (companyFormData.logo.startsWith('/') ? `${companyFormData.logo}?v=${company?.id}` : companyFormData.logo) : '/images/default-images/logo.png')} alt="Preview" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="text-slate-300 text-[10px] font-bold uppercase tracking-tighter">No Logo</div>
                  )}
                  {uploadingLogo && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className="flex-1">
                  <div className="cursor-pointer bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 text-primary text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 4m4 0v12" />
                    </svg>
                    Upload New Logo
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={uploadingLogo} />
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Favicon
              </Label>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center p-3 relative overflow-hidden group/fav transition-all hover:border-primary/30">
                  {(faviconPreview || companyFormData.favicon) ? (
                    <img src={faviconPreview || (isValidImageSrc(companyFormData.favicon) ? (companyFormData.favicon.startsWith('/') ? `${companyFormData.favicon}?v=${company?.id}` : companyFormData.favicon) : '/favicon.ico')} alt="Preview" className="max-h-full max-w-full object-contain" style={{ width: 32, height: 32 }} />
                  ) : (
                    <div className="text-slate-300 text-[8px] font-bold uppercase tracking-tighter text-center">No Favicon</div>
                  )}
                  {uploadingFavicon && (
                    <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
                <label className="flex-1">
                  <div className="cursor-pointer bg-white border border-slate-200 hover:border-primary hover:bg-primary/5 text-primary text-xs font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M16 8l-4-4m0 0L8 4m4 0v12" />
                    </svg>
                    Upload Favicon
                  </div>
                  <input type="file" accept=".ico,image/png,image/x-icon,image/jpeg" className="hidden" onChange={handleFaviconUpload} disabled={uploadingFavicon} />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tel">Contact Phone</Label>
              <Input
                id="tel"
                value={companyFormData.tel}
                onChange={(e) => setCompanyFormData({ ...companyFormData, tel: e.target.value })}
                placeholder="+216 73 123 456"
              />
            </div>
            <div>
              <Label htmlFor="email">Contact Email</Label>
              <Input
                id="email"
                type="email"
                value={companyFormData.email}
                onChange={(e) => setCompanyFormData({ ...companyFormData, email: e.target.value })}
                placeholder="contact@company.com"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={companyFormData.address}
              onChange={(e) => setCompanyFormData({ ...companyFormData, address: e.target.value })}
              placeholder="Street Name, Building"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="country_id">Country</Label>
              <Select value={companyFormData.country_id} onValueChange={(value) => setCompanyFormData({ ...companyFormData, country_id: value, governorat_id: 'none', municipality_id: 'none' })}>
                <SelectTrigger><SelectValue placeholder="Country" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Country</SelectItem>
                  {countries.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="governorat_id">Governorate</Label>
              <Select value={companyFormData.governorat_id} onValueChange={(value) => setCompanyFormData({ ...companyFormData, governorat_id: value, municipality_id: 'none' })} disabled={companyFormData.country_id === 'none'}>
                <SelectTrigger><SelectValue placeholder="Governorate" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Governorate</SelectItem>
                  {governorates.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="municipality_id">Municipality</Label>
              <Select value={companyFormData.municipality_id} onValueChange={(value) => setCompanyFormData({ ...companyFormData, municipality_id: value })} disabled={companyFormData.governorat_id === 'none'}>
                <SelectTrigger><SelectValue placeholder="Municipality" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Select Municipality</SelectItem>
                  {municipalities.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">{t('labelDescription')}</Label>
            <Textarea id="description" value={companyFormData.description} onChange={(e) => setCompanyFormData({ ...companyFormData, description: e.target.value })} rows={3} />
          </div>
          <div>
            <Label htmlFor="contact">Contact Greeting</Label>
            <Textarea id="contact" value={companyFormData.contact} onChange={(e) => setCompanyFormData({ ...companyFormData, contact: e.target.value })} rows={3} />
          </div>

          <div>
            <Label htmlFor="status">{t('labelStatus')}</Label>
            <Select value={companyFormData.status} onValueChange={(value) => setCompanyFormData({ ...companyFormData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('statusActive')}</SelectItem>
                <SelectItem value="0">{t('statusInactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="submit" className="updateBtn">{t('update')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsCompanyModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      <Modal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} title={editingSetting ? t('editSetting') : t('addSetting')}>
        <form onSubmit={handleSubmitSetting} className="space-y-6">
          <div>
            <Label htmlFor="app_settings_id">{t('labelAppSetting')} *</Label>
            <Select value={settingsFormData.app_settings_id} onValueChange={(value) => setSettingsFormData({ ...settingsFormData, app_settings_id: value })}>
              <SelectTrigger><SelectValue placeholder={t('selectAppSetting')} /></SelectTrigger>
              <SelectContent>{Array.isArray(appSettings) && appSettings.map((appSetting) => (<SelectItem key={appSetting.id} value={appSetting.id.toString()}>{appSetting.title} ({appSetting.famille})</SelectItem>))}</SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="custom_value">{t('labelCustomValue')}</Label>
            <Input
              id="custom_value"
              value={settingsFormData.custom_value}
              onChange={(e) => setSettingsFormData({ ...settingsFormData, custom_value: e.target.value })}
              placeholder={t('leaveEmptyDefault')}
            />
          </div>

          <div>
            <Label htmlFor="status">{t('labelStatus')}</Label>
            <Select value={settingsFormData.status} onValueChange={(value) => setSettingsFormData({ ...settingsFormData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">{t('statusActive')}</SelectItem>
                <SelectItem value="0">{t('statusInactive')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
            <Button type="submit" className={editingSetting ? 'updateBtn' : 'createBtn'}>{editingSetting ? t('update') : t('create')}</Button>
            <Button type="button" className="closeBtn" onClick={() => setIsSettingsModalOpen(false)}>{t('close')}</Button>
          </div>
        </form>
      </Modal>

      {/* Delete Setting Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title={t('confirmDelete')}>
        <p className="text-gray-700">Are you sure you want to delete this setting?</p>
        <p className="text-sm text-gray-600">Warning: This action is permanent and cannot be undone.</p>
        <div className="flex justify-end space-x-3 pt-6 border-t border-slate-100 mt-6">
          <Button type="button" className="deleteBtn" onClick={confirmDeleteSetting}>{t('delete')}</Button>
          <Button type="button" className="closeBtn" onClick={() => setIsDeleteModalOpen(false)}>{t('close')}</Button>
        </div>
      </Modal>
    </div >
  );
}