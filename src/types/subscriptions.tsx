import { Company } from "./companies";
import { Pack } from "./packs";

export interface Subscription {
    id: number;
    pack_id?: number;
    start_date?: string;
    end_date?: string;
    company_id?: number;
    status?: number;
    companies?: Company;
    packs?: Pack;
}