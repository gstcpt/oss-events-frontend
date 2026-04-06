import { Tag } from './tags';
import { Company } from './companies';

export interface Category {
  children: any;
  id: number;
  title: string;
  head_category_id?: number | null;
  image: string;
  description?: string | null;
  company_id?: number | null;
  status: number;
  companies?: Company;
  categories?: Category;
  other_categories?: Category[];
  category_tags?: CategoryTags[];
  item_category?: any[];
}

export interface CategoryTags {
  id: number;
  category_id: number;
  tag_id: number;
  categories?: Category;
  tags?: Tag;
}

export interface CreateCategoryData {
  title: string;
  head_category_id?: number | null;
  image: string;
  description?: string | null;
  company_id?: number | null;
  status?: number;
}

export interface UpdateCategoryData {
  title?: string;
  head_category_id?: number | null;
  image?: string;
  description?: string | null;
  company_id?: number | null;
  status?: number;
}