import { apiFetch } from '@/lib/api';
import { 
  Country, 
  Governorate, 
  Municipality, 
  LocationFormData, 
  LocationResponse 
} from '@/types/locations';

const LOCATIONS_BASE_URL = '/locations';

export const locationsApi = {
  // Countries
  getCountries: async (): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/countries`);
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch countries'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch countries'
      };
    }
  },

  getCountry: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/countries/${id}`);
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch country'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch country'
      };
    }
  },

  createCountry: async (data: LocationFormData): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/countries`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to create country'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create country'
      };
    }
  },

  updateCountry: async (id: number, data: LocationFormData): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/countries/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update country'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update country'
      };
    }
  },

  deleteCountry: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/countries/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to delete country'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete country'
      };
    }
  },

  // Governorates
  getGovernorates: async (countryId?: number): Promise<LocationResponse> => {
    try {
      const url = countryId 
        ? `${LOCATIONS_BASE_URL}/governorates/country/${countryId}`
        : `${LOCATIONS_BASE_URL}/governorates`;
      const response = await apiFetch(url);
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch governorates'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch governorates'
      };
    }
  },

  getGovernorate: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/governorates/${id}`);
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch governorate'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch governorate'
      };
    }
  },

  createGovernorate: async (data: LocationFormData): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/governorates`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to create governorate'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create governorate'
      };
    }
  },

  updateGovernorate: async (id: number, data: LocationFormData): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/governorates/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update governorate'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update governorate'
      };
    }
  },

  deleteGovernorate: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/governorates/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to delete governorate'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete governorate'
      };
    }
  },

  // Municipalities
  getMunicipalities: async (governorateId?: number): Promise<LocationResponse> => {
    try {
      const url = governorateId 
        ? `${LOCATIONS_BASE_URL}/municipalities/governorate/${governorateId}`
        : `${LOCATIONS_BASE_URL}/municipalities`;
      const response = await apiFetch(url);
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch municipalities'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch municipalities'
      };
    }
  },

  getMunicipality: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/municipalities/${id}`);
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to fetch municipality'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to fetch municipality'
      };
    }
  },

  createMunicipality: async (data: LocationFormData & { code: string }): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/municipalities`, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to create municipality'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create municipality'
      };
    }
  },

  updateMunicipality: async (id: number, data: LocationFormData & { code: string }): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/municipalities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data)
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to update municipality'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update municipality'
      };
    }
  },

  deleteMunicipality: async (id: number): Promise<LocationResponse> => {
    try {
      const response = await apiFetch(`${LOCATIONS_BASE_URL}/municipalities/${id}`, {
        method: 'DELETE'
      });
      if (response.success) {
        return response;
      } else {
        return {
          success: false,
          error: response.error || 'Failed to delete municipality'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete municipality'
      };
    }
  }
};

// Standalone functions for backward compatibility
export const getAllCountries = async (): Promise<any[]> => {
  const response = await locationsApi.getCountries();
  return response.success && response.data ? response.data : [];
};

export const getGovernrateByCountryId = async (countryId: number): Promise<any[]> => {
  const response = await locationsApi.getGovernorates(countryId);
  return response.success && response.data ? response.data : [];
};

export const getMunicipalityByGovernrateId = async (governorateId: number): Promise<any[]> => {
  const response = await locationsApi.getMunicipalities(governorateId);
  return response.success && response.data ? response.data : [];
};

