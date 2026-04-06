import { AppSetting } from './app-settings';
import { User } from './users';
import { Country, Governorate, Municipality } from './locations';

export interface Company {
    id: number;
    admin_id?: number;
    title: string;
    url: string;
    logo?: string;
    favicon?: string;
    matricule?: string;
    domain?: string;
    tel?: string;
    email?: string;
    address?: string;
    country_id?: number;
    governorat_id?: number;
    municipality_id?: number;
    date_foundation?: string;
    description?: string;
    contact?: string;
    status: number;
    admin?: User;
    countries?: Country;
    governorates?: Governorate;
    municipalities?: Municipality;
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
}

export interface CompanySettings {
    id: number;
    app_settings_id?: number;
    custom_value?: string;
    company_id?: number;
    status: number;
    app_settings?: AppSetting;
    companies?: Company;
}