export interface ProviderInfo {
  id: number;
  user_id: number | null;
  category_id: number | null;
  type_provider: number | null;
  ste_title: string | null;
  logo: string | null;
  tarification: string | null;
  email: string | null;
  phone_number: string | null;
  whatsapp: string | null;
  fix_phone: string | null;
  fax: string | null;
  country: string | null;
  city: string | null;
  postal_code: string | null;
  street: string | null;
  department: string | null;
  map_location: string | null;
  website: string | null;
  facebook: string | null;
  instagram: string | null;
  tiktok: string | null;
  youtube: string | null;
  experience: string | null;
  foudation_date: string | null;
  policy: string | null;
  about: string | null;
  payment_en_especes: number | null;
  payment_virement: number | null;
  payment_par_cheque: number | null;
  country_id: number | null;
  governorate_id: number | null;
  municipality_id: number | null;
  categories?: {
    id: number;
    title: string;
    image: string | null;
  } | null;
  countries?: {
    id: number;
    name: string;
  } | null;
  governorates?: {
    id: number;
    name: string;
  } | null;
  municipalities?: {
    id: number;
    name: string;
  } | null;
  provider_opening_hour?: {
    id: number;
    providerId: number;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isActive: boolean;
  }[];
  provider_opening_exception?: {
    id: number;
    providerId: number;
    date: string;
    startTime?: string;
    endTime?: string;
    isClosed: boolean;
    note?: string;
  }[];
}

export interface ProviderUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  role_id: number;
  company_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  provider_info: ProviderInfo[]; // Changed from ProviderInfo | null to ProviderInfo[]
  rating: number;
  reviewCount: number;
  itemCount: number;
}

export interface ProviderItemMedia {
  id: number;
  item_id: number;
  media: string;
  file?: string;
  type: string;
  media_type?: string;
  position: number;
}

export interface ProviderItemCategory {
  id: number;
  item_id: number;
  category_id: number;
  categories: {
    id: number;
    title: string;
    image: string | null;
  };
}

export interface ProviderItemInteraction {
  id: number;
  item_id: number;
  user_id: number | null;
  type: string;
  value: string;
  created_at: string;
}

export interface ProviderItem {
  id: number;
  title: string;
  image?: string;
  cover?: string;
  code?: string;
  description: string | null;
  price: number | null;
  provider_id: number;
  company_id: number;
  status: number;
  created_at: string;
  updated_at: string;
  item_category: ProviderItemCategory[];
  item_media: ProviderItemMedia[];
  interactions: ProviderItemInteraction[];
  // Dynamic properties for enrichment
  users?: any;
  provider_info?: any;
}

export interface ProviderStats {
  views: number;
  likes: number;
  dislikes: number;
  favorites: number;
  shares: number;
  directRating?: number;
  directRatingCount?: number;
  userRating?: number;
  userReactions?: {
    isLiked: boolean;
    isDisliked: boolean;
    isFavorite: boolean;
    userRating?: number;
  };
}

export interface ProviderDetail extends ProviderUser {
  items: ProviderItem[];
  stats?: ProviderStats;
}