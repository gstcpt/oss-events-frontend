'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Textarea from '@/components/ui/textarea';
import { getCompanyById, updateCompany } from '@/lib/api/companies';
import { uploadCompanyLogo, uploadCompanyFavicon } from '@/lib/api/upload';
import { Company } from '@/types/companies';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { useTranslations } from 'next-intl';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Country, Governorate, Municipality } from '@/types/locations';
import { getAllCountries, getGovernrateByCountryId, getMunicipalityByGovernrateId } from '@/lib/api/locations';

export default function CompanySettings() {
  const t = useTranslations('Dashboard.companySettings');
  const { user } = useAuth();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  const [activeTab, setActiveTab] = useState('profile');

  const isValidImageSrc = (src: string | null | undefined): src is string => {
    if (!src || typeof src !== 'string') {
      return false;
    }

    if (src.startsWith('/')) {
      return true;
    }

    try {
      new URL(src);
      return true;
    } catch {
      return false;
    }
  };
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingFavicon, setUploadingFavicon] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [formData, setFormData] = useState({
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
    facebook: '',
    instagram: '',
    tiktok: '',
    linkedin: '',
    twitter: '',
    youtube: ''
  });

  const [countries, setCountries] = useState<Country[]>([]);
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);

  useEffect(() => {
    fetchInitialLocations();
  }, []);

  const fetchInitialLocations = async () => {
    try {
      const countryData = await getAllCountries();
      setCountries(countryData);
    } catch (error) {
      toast.error('Error fetching locations');
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

  const [logoFile, setLogoFile] = useState<File | null>(null);
  useEffect(() => {
    if (!user?.company_id) {
      toast.error('No company associated with your account');
      router.push('/dashboard');
      return;
    }
    fetchCompany();
  }, [user]);
  const fetchCompany = async () => {
    try {
      setLoading(true);
      const companyData = await getCompanyById(user!.company_id!);
      setCompany(companyData);
      setFormData({
        title: companyData.title || '',
        url: companyData.url || '',
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
        facebook: companyData.facebook || '',
        instagram: companyData.instagram || '',
        tiktok: companyData.tiktok || '',
        linkedin: companyData.linkedin || '',
        twitter: companyData.twitter || '',
        youtube: companyData.youtube || ''
      });
    }
    catch (error) { toast.error('Failed to load company information'); }
    finally { setLoading(false); }
  };
  const handleInputChange = (field: string, value: string) => { setFormData(prev => ({ ...prev, [field]: value })); };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    setUploading(true);
    try {
      const result = await uploadCompanyLogo(file, company.id, formData.title || 'company');
      handleInputChange('logo', result.logoUrl);
    } catch (error) {
      toast.error('Error uploading logo');
    } finally {
      setUploading(false);
    }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !company) return;

    setUploadingFavicon(true);
    try {
      const result = await uploadCompanyFavicon(file, company.id, formData.title || 'company');
      handleInputChange('favicon', result.faviconUrl);
    } catch (error) {
      toast.error('Error uploading favicon');
    } finally {
      setUploadingFavicon(false);
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!company) return;
    try {
      setSaving(true);
      const payload = {
        ...formData,
        country_id: formData.country_id !== 'none' ? Number(formData.country_id) : undefined,
        governorat_id: formData.governorat_id !== 'none' ? Number(formData.governorat_id) : undefined,
        municipality_id: formData.municipality_id !== 'none' ? Number(formData.municipality_id) : undefined,
      };
      await updateCompany(company.id, payload);
      toast.success('Company information updated successfully');
      fetchCompany();
    }
    catch (error) { toast.error('Failed to update company information'); }
    finally { setSaving(false); }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company information...</p>
        </div>
      </div>
    );
  }
  if (!company) { return (<div className="text-center py-8"><p className="text-gray-600">No company information found</p></div>); }
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-primary to-primary/80 p-8 shadow-2xl shadow-primary/20">
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-48 h-48 bg-black/10 rounded-full blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row items-center gap-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-2xl bg-white p-2 shadow-xl border border-white/20 overflow-hidden flex items-center justify-center transition-transform hover:scale-105 duration-300">
              {formData.logo ? (
                <NextImage
                  src={isValidImageSrc(formData.logo) ? formData.logo : '/images/default.jpg'}
                  alt="Logo"
                  className="max-h-full max-w-full object-contain"
                  width={128}
                  height={128}
                />
              ) : (
                <div className="text-slate-300 flex flex-col items-center">
                  <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-lg rounded-xl flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100 group-hover:scale-110 duration-200">
              <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            {uploading && (
              <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-col md:flex-row items-center gap-3">
              <h1 className="text-3xl font-bold text-white tracking-tight">{formData.title || "Company Profile"}</h1>
              <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-xs font-semibold text-white uppercase tracking-wider">
                {company.status === 1 ? "Active" : "Inactive"}
              </span>
            </div>
            <p className="text-white/80 max-w-xl text-lg font-medium leading-relaxed">
              {formData.url || "Manage your organization's digital identity and settings"}
            </p>
          </div>
        </div>
      </div>

      {/* Settings Navigation */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100/50 backdrop-blur-sm rounded-2xl border border-slate-200/50">
        {[
          { id: 'profile', label: 'General Info', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
          { id: 'branding', label: 'Branding', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
          { id: 'about', label: 'Company Bio', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
          { id: 'contact', label: 'Connect', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${activeTab === tab.id
              ? 'bg-white text-primary shadow-sm ring-1 ring-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
              }`}
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
            </svg>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up">
        <div className="bg-white rounded-xl shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="p-8 md:p-12">

            {activeTab === 'profile' && (
              <div className="space-y-10 animate-fade-in">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  <div className="space-y-2 group">
                    <Label htmlFor="title" className="text-sm font-bold text-slate-800 ml-1 transition-colors group-focus-within:text-primary">Company Legal Name *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g. Acme Corporation"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                      required
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="url" className="text-sm font-bold text-slate-800 ml-1 transition-colors group-focus-within:text-primary">Corporate Website URL *</Label>
                    <Input
                      id="url"
                      type="url"
                      value={formData.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="https://acme.inc"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg disabled:opacity-70 disabled:cursor-not-allowed"
                      required
                      disabled={user?.role !== 'Root'}
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="domain" className="text-sm font-bold text-slate-800 ml-1 transition-colors group-focus-within:text-primary">Industry Sector</Label>
                    <Input
                      id="domain"
                      value={formData.domain}
                      onChange={(e) => handleInputChange('domain', e.target.value)}
                      placeholder="e.g. Technology & Logistics"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="matricule" className="text-sm font-bold text-slate-800 ml-1 transition-colors group-focus-within:text-primary">Tax ID / Registration Number</Label>
                    <Input
                      id="matricule"
                      value={formData.matricule}
                      onChange={(e) => handleInputChange('matricule', e.target.value)}
                      placeholder="e.g. TAX-99-410"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                    />
                  </div>
                  <div className="space-y-2 group">
                    <Label htmlFor="date_foundation" className="text-sm font-bold text-slate-800 ml-1 transition-colors group-focus-within:text-primary">Foundation Date</Label>
                    <Input
                      id="date_foundation"
                      type="date"
                      value={formData.date_foundation}
                      onChange={(e) => handleInputChange('date_foundation', e.target.value)}
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'branding' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 animate-fade-in">
                <div className="space-y-6">
                  {/* Logo Upload Section */}
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-4 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-800">Company Logo</h3>
                    <p className="text-sm text-slate-500 max-w-[200px]">The primary logo used in the header and reports. Best resolution: 200x50px.</p>

                    <div className="relative group">
                      <div className="w-48 h-24 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-4 transition-transform group-hover:scale-105 duration-300">
                        {formData.logo ? (
                          <NextImage src={isValidImageSrc(formData.logo) ? formData.logo : '/images/default-images/logo.png'} alt="Company Logo" className="max-h-full max-w-full object-contain" width={160} height={40} />
                        ) : (
                          <div className="text-slate-300">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-white shadow-md rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.811-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.811 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
                      </label>
                      {uploading && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                          <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Favicon Upload Section */}
                  <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col items-center text-center space-y-4 transition-all hover:shadow-xl hover:shadow-slate-200/50">
                    <h3 className="text-xl font-bold text-slate-800">Company Favicon</h3>
                    <p className="text-sm text-slate-500 max-w-[200px]">The icon that appears in browser tabs. Best resolution: 32x32px.</p>

                    <div className="relative group">
                      <div className="w-24 h-24 rounded-2xl bg-white shadow-lg border border-slate-100 flex items-center justify-center p-4 transition-transform group-hover:scale-105 duration-300">
                        {formData.favicon ? (
                          <NextImage src={isValidImageSrc(formData.favicon) ? formData.favicon : '/favicon.ico'} alt="Favicon" className="max-h-full max-w-full object-contain" width={48} height={48} />
                        ) : (
                          <div className="text-slate-300">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-white shadow-md rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50 transition-colors border border-slate-100">
                        <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <input type="file" accept=".ico,image/png,image/x-icon" className="hidden" onChange={handleFaviconUpload} />
                      </label>
                      {uploadingFavicon && (
                        <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center space-y-6">
                  <div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
                    <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Visual Identity Tips
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0"></span>
                        Use high-resolution transparent PNG files for logos.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0"></span>
                        Favicons should be simple, iconic shapes that work at small sizes.
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0"></span>
                        Consistency in logo and favicon helps users identify your brand.
                      </li>
                    </ul>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">Logo Path</Label>
                      <Input value={formData.logo} readOnly className="bg-slate-50 text-slate-500 font-mono text-xs cursor-default" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-bold text-slate-800">Favicon Path</Label>
                      <Input value={formData.favicon} readOnly className="bg-slate-50 text-slate-500 font-mono text-xs cursor-default" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'about' && (
              <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                <div className="space-y-3">
                  <Label htmlFor="description" className="text-lg font-bold text-slate-800 ml-1">Company Narrative</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Tell your story, your vision and what makes you special..."
                    rows={8}
                    className="rounded-3xl border-slate-200 bg-slate-50/30 p-8 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg leading-relaxed shadow-inner"
                  />
                </div>
                <div className="flex items-center gap-4 text-slate-400 text-sm px-4">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p>This description will be featured on your public landing page. Use compelling copy that highlights your unique value propositions.</p>
                </div>
              </div>
            )}

            {activeTab === 'contact' && (
              <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label htmlFor="tel" className="font-bold text-slate-800">Support Phone</Label>
                    <Input
                      id="tel"
                      value={formData.tel}
                      onChange={(e) => handleInputChange('tel', e.target.value)}
                      placeholder="+216 ... "
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="email" className="font-bold text-slate-800">Company Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="contact@company.com"
                      className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="address" className="font-bold text-slate-800">Physical Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="Street, Building, etc."
                    className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <Label className="font-bold text-slate-800">Country</Label>
                    <Select value={formData.country_id} onValueChange={(value) => handleInputChange('country_id', value)}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6"><SelectValue placeholder="Country" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Country</SelectItem>
                        {countries.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-slate-800">Governorate</Label>
                    <Select value={formData.governorat_id} onValueChange={(value) => handleInputChange('governorat_id', value)} disabled={formData.country_id === 'none'}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6"><SelectValue placeholder="Governorate" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Governorate</SelectItem>
                        {governorates.map(g => <SelectItem key={g.id} value={g.id.toString()}>{g.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-3">
                    <Label className="font-bold text-slate-800">Municipality</Label>
                    <Select value={formData.municipality_id} onValueChange={(value) => handleInputChange('municipality_id', value)} disabled={formData.governorat_id === 'none'}>
                      <SelectTrigger className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6"><SelectValue placeholder="Municipality" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select Municipality</SelectItem>
                        {municipalities.map(m => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="contact" className="text-lg font-bold text-slate-800 ml-1">Contact Page Greeting Description</Label>
                  <Textarea
                    id="contact"
                    value={formData.contact}
                    onChange={(e) => handleInputChange('contact', e.target.value)}
                    placeholder="Short greeting text for visitors..."
                    rows={4}
                    className="rounded-3xl border-slate-200 bg-slate-50/30 p-8 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all text-lg leading-relaxed shadow-inner"
                  />
                </div>

                {/* Social Media Section */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    Social Media Presence
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <Label htmlFor="facebook" className="font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
                        Facebook
                      </Label>
                      <Input
                        id="facebook"
                        value={formData.facebook}
                        onChange={(e) => handleInputChange('facebook', e.target.value)}
                        placeholder="https://facebook.com/your-page"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="instagram" className="font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.584-.071 4.85c-.055 1.17-.249 1.805-.415 2.227-.217.562-.477.96-.896 1.382-.42.419-.819.679-1.381.896-.422.164-1.057.36-2.227.413-1.266.057-1.646.07-4.85.07s-3.584-.015-4.85-.071c-1.17-.055-1.805-.249-2.227-.415-.562-.217-.96-.477-1.382-.896-.419-.42-.679-.819-.896-1.381-.164-.422-.36-1.057-.413-2.227-.057-1.266-.07-1.646-.07-4.85s.015-3.584.071-4.85c.055-1.17.249-1.805.415-2.227.217-.562.477-.96.896-1.382.42-.419.819-.679 1.381-.896.422-.164 1.057-.36 2.227-.413 1.266-.057 1.646-.07 4.85-.07zM12 5.832a6.168 6.168 0 100 12.336 6.168 6.168 0 000-12.336zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
                        Instagram
                      </Label>
                      <Input
                        id="instagram"
                        value={formData.instagram}
                        onChange={(e) => handleInputChange('instagram', e.target.value)}
                        placeholder="https://instagram.com/yourprofile"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="linkedin" className="font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        LinkedIn
                      </Label>
                      <Input
                        id="linkedin"
                        value={formData.linkedin}
                        onChange={(e) => handleInputChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/company/yourcompany"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="twitter" className="font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        X / Twitter
                      </Label>
                      <Input
                        id="twitter"
                        value={formData.twitter}
                        onChange={(e) => handleInputChange('twitter', e.target.value)}
                        placeholder="https://x.com/yourhandle"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="tiktok" className="font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V9.13a8.16 8.16 0 004.77 1.52V7.18a4.85 4.85 0 01-1-.49z" /></svg>
                        TikTok
                      </Label>
                      <Input
                        id="tiktok"
                        value={formData.tiktok}
                        onChange={(e) => handleInputChange('tiktok', e.target.value)}
                        placeholder="https://tiktok.com/@youraccount"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label htmlFor="youtube" className="font-bold text-slate-800 flex items-center gap-2">
                        <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                        YouTube
                      </Label>
                      <Input
                        id="youtube"
                        value={formData.youtube}
                        onChange={(e) => handleInputChange('youtube', e.target.value)}
                        placeholder="https://youtube.com/@yourchannel"
                        className="h-14 rounded-2xl border-slate-200 bg-slate-50/30 px-6 focus:bg-white focus:ring-4 focus:ring-primary/10 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3 text-slate-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-sm">End-to-end encrypted settings</span>
              </div>
              <Button
                type="submit"
                disabled={saving}
                className="h-16 px-12 rounded-xl bg-primary text-white text-lg font-bold shadow-2xl shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-1 active:translate-y-0 transition-all duration-300 disabled:opacity-70 disabled:hover:translate-y-0"
              >
                {saving ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving Changes...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Save Modifications
                  </div>
                )}
              </Button>
            </div>

          </div>
        </div>
      </form>
    </div>
  );
}