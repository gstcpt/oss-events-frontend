export type User = {
    id: number;
    firstname: string;
    midname?: string;
    lastname: string;
    phone?: string;
    username?: string;
    email: string;
    email_verified?: boolean;
    email_verification_token?: string;
    password?: string;
    last_login?: string;
    password_reset_token?: string;
    password_reset_token_expiry?: string;
    role: string;
    company_id?: number;
    status?: string;
    role_id?: number;
    avatar?: string;
    created_at?: Date;
};

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
    refreshToken?: () => Promise<void>;
    login: (email: string, password: string) => Promise<{ success: boolean; error: string | null }>;
}

export type UserReceiver = {
    id: number;
    firstname: string;
    midname: string;
    lastname: string;
    phone: string;
    username: string;
    email: string;
    last_login: string;
    role: string;
    company_id: number;
    status: string;
};
export type UserSender = {
    id: number;
    firstname: string;
    midname: string;
    lastname: string;
    phone: string;
    username: string;
    email: string;
    last_login: string;
    role: string;
    company_id: number;
    status: string;
};
