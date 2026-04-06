"use client";

import React, { useState, useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, Lock, Loader2 } from "lucide-react";
import { login } from "@/lib/api/auth";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Modal from "@/components/ui/Modal";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";
import { useCompany } from "@/context/CompanyContext";

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess?: () => void;
    redirectTo?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    onLoginSuccess,
    redirectTo = "/dashboard"
}) => {
    const t = useTranslations('Auth.login');
    const { setUser } = useAuth();
    const { companyId } = useCompany();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Tell the Header to switch to solid white when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.setAttribute("data-modal-open", "true");
        } else {
            document.body.removeAttribute("data-modal-open");
        }
        return () => {
            document.body.removeAttribute("data-modal-open");
        };
    }, [isOpen]);

    const formSchema = useMemo(() => z.object({
        email: z.string().email({ message: t('invalid_email') }),
        password: z.string().min(8, { message: t('invalid_password') })
    }), [t]);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setError("");
        setIsLoading(true);
        try {
            const res = await login({ ...values, origin: window.location.origin });

            if (res.token && res.user) {
                // Store auth data
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
                };

                localStorage.setItem("user", JSON.stringify(user));
                setUser(user);

                toast.success(t('login_successful'));

                // Close modal and handle success callback
                onClose();
                if (onLoginSuccess) {
                    onLoginSuccess();
                } else {
                    // Redirect to dashboard by default
                    window.location.href = redirectTo;
                }
            } else {
                toast.error(t('no_user_data'));
            }
        } catch (err: any) {
            setError(t('login_failed'));
            toast.error(err.message || t('login_failed'));
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title=""
            widthClass="max-w-md"
            showCloseButton={true}
        >
            <div className="flex flex-col">
                {/* Visual Header inspired by Auth Pages */}
                <div className="relative h-32 bg-[var(--footer)] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                        <Image
                            src="/images/default-images/auth/auth.jpg"
                            alt="Background"
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[var(--footer)]/90" />

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl mb-2 animate-bounce-slow">
                            <Image src={`/images/companies/${companyId}/logo.png`} alt="Logo" width={32} height={32} className="w-8 h-8 object-contain brightness-0" />
                        </div>
                        <h2 className="text-white font-bold text-xl tracking-tight">{t('modal_title')}</h2>
                    </div>
                </div>

                <div className="p-8">
                    <div className="mb-6 text-center">
                        <p className="text-[#7a7a68] text-sm leading-relaxed">
                            {t('welcome_subtitle') || "Sign in to access exclusive features and manage your events."}
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only font-semibold text-[var(--footer)] text-xs uppercase tracking-wider">{t('email_placeholder')}</FormLabel>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68]/70" />
                                            <Input
                                                className="h-12 pl-11 py-6 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)] placeholder:text-[#7a7a68]/50"
                                                placeholder={t('email_placeholder')}
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="sr-only font-semibold text-[var(--footer)] text-xs uppercase tracking-wider">{t('password_placeholder')}</FormLabel>
                                        <div className="relative">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7a68]/70" />
                                            <Input
                                                type="password"
                                                className="h-12 pl-11 py-6 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)] placeholder:text-[#7a7a68]/50"
                                                placeholder={t('password_placeholder')}
                                                {...field}
                                                disabled={isLoading}
                                            />
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end pt-1">
                                <a
                                    href="/forget-password"
                                    className="text-xs text-[#7a7a68] hover:text-[var(--primary)] transition-colors font-medium"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        onClose();
                                        window.location.href = "/forget-password";
                                    }}
                                >
                                    {t('forgot_password')}
                                </a>
                            </div>

                            {error && (
                                <div className="text-red-600 text-xs text-center bg-red-50 p-3 rounded-lg border border-red-100 animate-shake">
                                    {error}
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 py-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white font-bold text-base shadow-lg shadow-[var(--primary)]/20 hover:shadow-[var(--primary)]/30 transition-all flex items-center justify-center gap-2 mt-4"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <ShieldCheck className="w-5 h-5 opacity-80" />
                                        {t('submit')}
                                    </>
                                )}
                            </Button>
                        </form>
                    </Form>

                    <div className="mt-8 pt-6 border-t border-[#ece9e0] text-center">
                        <p className="text-sm text-[#7a7a68]">
                            {t('no_account')}{" "}
                            <a
                                href="/register"
                                className="text-[var(--primary)] hover:text-[var(--primary)]/80 font-bold transition-colors"
                                onClick={(e) => {
                                    e.preventDefault();
                                    onClose();
                                    window.location.href = "/register";
                                }}
                            >
                                {t('create_account')}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};