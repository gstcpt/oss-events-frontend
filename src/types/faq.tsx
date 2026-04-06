export interface FAQ {
  id: number;
  question: string;
  answer: string;
  faq_order: number;
  section_id?: number | null;
  company_id: number;
  status: number;
}

export interface FAQSection {
  id: number;
  name: string;
  company_id: number;
  status: number;
}