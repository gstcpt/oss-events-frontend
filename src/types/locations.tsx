export interface Country {
  id: number;
  name: string;
  governorates?: Governorate[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Governorate {
  id: number;
  name: string;
  country_id: number;
  countries?: Country;
  municipalities?: Municipality[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Municipality {
  id: number;
  name: string;
  code: string;
  governorate_id: number;
  governorates?: Governorate;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocationFormData {
  name: string;
  country_id?: number;
  governorate_id?: number;
}

export interface LocationResponse {
  success: boolean;
  data?: Country[] | Governorate[] | Municipality[];
  message?: string;
  error?: string;
}