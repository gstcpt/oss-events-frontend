export interface AppLogs {
    id: number;
    entity: string;
    row_id: number;
    actor_id: number;
    action: string;
    log_message: string;
    company_id: number;
    created_at: string;
    users?: {
        firstname?: string;
        lastname?: string;
        email: string;
    };
    companies?: {
        title: string;
    };
}