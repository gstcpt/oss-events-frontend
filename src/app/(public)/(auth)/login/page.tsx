"use client";

import React, { useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Mail, Lock } from "lucide-react";
import { login } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/types/users";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const getFormSchema = (t: any) => z.object({
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(8, { message: t('invalid_password') })
});
type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

export default function Login() {
    const t = useTranslations('Auth.login');
    const router = useRouter();
    const { setUser } = useAuth();
    const [error, setError] = useState("");
    const formSchema = getFormSchema(t);
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { email: "", password: "" } });

    async function onSubmit(values: FormValues) {
        setError("");
        try {
            const res = await login({ ...values, origin: window.location.origin });
            if (res.token && res.user) {
                document.cookie = `auth_token=${res.token}; path=/; max-age=604800; SameSite=Strict`;
                localStorage.setItem("token", res.token);
                const user = {
                    id: res.user.id,
                    firstname: res.user.firstname,
                    midname: res.user.midname || "",
                    lastname: res.user.lastname,
                    phone: res.user.phone || "",
                    username: res.user.username || "",
                    email: res.user.email,
                    email_verified: res.user.email_verified,
                    email_verification_token: res.user.email_verification_token || "",
                    password: res.user.password || "",
                    last_login: res.user.last_login,
                    password_reset_token: res.user.password_reset_token || "",
                    password_reset_token_expiry: res.user.password_reset_token_expiry || "",
                    role: res.user.role.title,
                    company_id: res.user.company?.id || null,
                    status: res.user.status || "active",
                    role_id: res.user.role_id,
                    avatar: res.user.avatar || "",
                    created_at: res.user.created_at,
                }
                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);
                router.push("/dashboard");
            } else {
                toast.error(t('no_user_data'));
            }
        } catch (err: any) {
            toast.error(err.message || t('login_failed'));
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-[var(--background)]">
            <div className="relative flex flex-col md:flex-row w-full max-w-4xl shadow-xl shadow-black/5 rounded-3xl overflow-hidden bg-white border border-[#ece9e0]">
                {/* Left: Image */}
                <div className="hidden md:block md:w-1/2 relative">
                    <Image src="/images/default-images/auth/login.jpg" width={800} height={800} alt="Login illustration" className="object-cover h-full w-full" priority />
                    <div className="absolute inset-0 bg-linear-to-t from-[var(--footer)]/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white z-10">
                        <h3 className="text-2xl font-bold mb-2">{t('welcome_title')}</h3>
                        <p className="text-[#ece9e0] text-sm">{t('welcome_subtitle')}</p>
                    </div>
                </div>
                {/* Right: Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white">
                    <Card className="bg-transparent shadow-none border-0 p-0">
                        <CardHeader className="mb-6 px-0">
                            <CardTitle className="text-3xl font-bold mb-2 text-[var(--footer)]">{t('title')}</CardTitle>
                            <CardDescription className="text-[#7a7a68] text-base">{t('subtitle')}</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Email</FormLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                <Input className="pl-10 py-6 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('email_placeholder')} {...field} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">Password</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                <Input type="password" className="pl-10 py-6 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('password_placeholder')} {...field} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    {error && <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
                                    <Button type="submit" className="w-full py-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white font-semibold text-lg shadow-lg hover:shadow-black/10 transition-all">{t('submit')}</Button>
                                </form>
                            </Form>
                            <div className="mt-8 text-center text-sm"><Link href="/forget-password" className="text-[#7a7a68] hover:text-[var(--primary)] transition-colors font-medium">{t('forgot_password')}</Link></div>
                            <div className="mt-4 text-center text-sm text-[#7a7a68]">{t('no_account')}{" "}<Link href="/register" className="text-[var(--primary)] hover:text-[#3a3a2e] font-semibold transition-colors">{t('create_account')}</Link></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}