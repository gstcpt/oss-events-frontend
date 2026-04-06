'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { newPassword } from "@/lib/api/auth";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { Lock } from "lucide-react";
import { toast } from 'sonner';
import { useTranslations } from "next-intl";

const getFormSchema = (t: any) => z
    .object({
        newPassword: z.string().min(8, { message: t('invalid_password') }),
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: t('passwords_dont_match'),
        path: ["confirmPassword"],
    });

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

export default function NewPassword() {
    const t = useTranslations('Auth.newPassword');
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");
    const [success, setSuccess] = useState(false);

    const formSchema = getFormSchema(t);
    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: { newPassword: "", confirmPassword: "" },
    });

    async function onSubmit(values: FormValues) {
        if (!token) {
            toast.error(t('no_token'));
            return;
        }
        try {
            const res = await newPassword({ token, newPassword: values.newPassword });
            toast.success(t('new_password_successful'));
            setSuccess(true);
            setTimeout(() => router.push("/login"), 3000);
        } catch (err: any) {
            toast.error(err.message || t('new_password_error'));
        }
    }

    function onError(errors: any) {
        toast.error(t('form_errors') + (errors.confirmPassword?.message || errors.newPassword?.message || t('unknown_error')));
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-[var(--background)]">
            <div className="relative flex flex-col md:flex-row w-full max-w-4xl shadow-xl shadow-black/5 rounded-3xl overflow-hidden bg-white border border-[#ece9e0]">
                {/* Left: Image */}
                <div className="hidden md:block md:w-1/2 relative">
                    <Image src="/images/default-images/auth/new.jpg" width={800} height={800} alt="New password illustration" className="object-cover h-full w-full" priority />
                    <div className="absolute inset-0 bg-linear-to-t from-[var(--footer)]/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white z-10">
                        <h3 className="text-2xl font-bold mb-2">{t('security_title')}</h3>
                        <p className="text-[#ece9e0] text-sm">{t('security_subtitle')}</p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white">
                    <Card className="bg-transparent shadow-none border-0 p-0">
                        <CardHeader className="mb-6 px-0">
                            <CardTitle className="text-3xl font-bold mb-2 text-[var(--footer)]">{t('title')}</CardTitle>
                            {success ? (
                                <CardDescription className="text-green-600 font-medium">{t('success_message')}</CardDescription>
                            ) : (
                                <CardDescription className="text-[#7a7a68] text-base">{t('subtitle')}</CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="px-0">
                            {!success && (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit, onError)} className="space-y-5">
                                        <FormField control={form.control} name="newPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">{t('password_label')}</FormLabel>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                    <Input type="password" placeholder={t('password_placeholder')} {...field} className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">{t('confirm_password_label')}</FormLabel>
                                                <div className="relative">
                                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                    <Input type="password" placeholder={t('confirm_password_placeholder')} {...field} className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <Button type="submit" className="w-full py-6 rounded-xl bg-[var(--primary)] hover:bg-[#3a3a2e] text-white font-bold text-lg shadow-lg hover:shadow-black/10 transition-all">
                                            {t('submit')}
                                        </Button>
                                    </form>
                                </Form>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
