import { apiFetch } from "../api";
import { RegisterData, LoginData, VerifyEmailData, ResetPasswordData, NewPasswordData } from "@/types/auth";

export async function register(data: RegisterData) {try {return await apiFetch("/auth/register", { method: "POST", body: JSON.stringify(data) });} catch (error) {throw error;}}
export async function verifyEmail(data: VerifyEmailData) {try {return apiFetch("/auth/verify-email", { method: "POST", body: JSON.stringify(data) });} catch (error) {throw error;}}
export async function resendVerification(data: { email: string; origin: string }) {try {return apiFetch("/auth/resend-verification", { method: "POST", body: JSON.stringify(data) });} catch (error) {throw error;}}
export async function resetPassword(data: ResetPasswordData) {try {return await apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify(data) });} catch (error) {throw error;}}
export async function newPassword(data: NewPasswordData) {try {return await apiFetch("/auth/new-password", { method: "POST", body: JSON.stringify(data) });} catch (error) {throw error;}}
export async function login(data: LoginData) {try {return await apiFetch("/auth/login", { method: "POST", body: JSON.stringify(data) });} catch (error) {throw error;}}
export async function logout() {try {return await apiFetch("/auth/logout", { method: "POST" });} catch (error) {throw error;}}