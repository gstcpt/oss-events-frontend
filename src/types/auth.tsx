export type RegisterData = {
  firstname: string;
  lastname: string;
  username: string;
  email: string;
  password: string;
  origin: string;
  role_id: number;
}

export type VerifyEmailData = {
  token: string;
}

export interface ResendVerificationData {
  email: string;
  origin: string;
}

export type ResetPasswordData = {
  email: string;
  origin: string;
}

export type NewPasswordData = {
  token: string;
  newPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
  origin: string;
}

export interface LoginResponse {
  token?: string;
  user?: any;
  message?: string;
}