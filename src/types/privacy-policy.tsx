export interface PrivacyPolicy {
  id: number;
  content: string;
  company_id: number | null;
  created_at: Date | null;
  updated_at: Date | null;
}