export interface FAQItem {
    id: number;
    question: string;
    answer: string;
    faq_order?: number;
    faq_sections?: {
        title: string;
    } | null;
}