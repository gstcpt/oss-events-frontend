'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { Mail } from "lucide-react";
import { resetPassword } from "@/lib/api/auth";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

const getFormSchema = (t: any) => z.object({ email: z.string().email({ message: t('invalid_email') }) });
type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

export default function ForgetPassword() {
    const t = useTranslations('Auth.forgetPassword');
    const tCommon = useTranslations('Common');
    const formSchema = getFormSchema(t);
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { email: "" } });
    const [sent, setSent] = useState(false);

    async function onSubmit(values: FormValues) {
        try {
            await resetPassword({ email: values.email, origin: window.location.origin });
            setSent(true);
            toast.success(t('forget_password_successful'));
        } catch (err: any) {
            if (err.response?.data?.message) {
                toast.error(err.response.data.message);
            } else {
                toast.error(t('forget_password_error'));
            }
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-[var(--background)]">
            <div className="relative flex flex-col md:flex-row w-full max-w-4xl shadow-xl shadow-black/5 rounded-3xl overflow-hidden bg-white border border-[#ece9e0]">
                {/* Left: Image */}
                <div className="hidden md:block md:w-1/2 relative">
                    <Image src="/images/default-images/auth/forget.jpg" width={800} height={800} alt="Forget Password illustration" className="object-cover h-full w-full" priority />
                    <div className="absolute inset-0 bg-linear-to-t from-[var(--footer)]/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white z-10">
                        <h3 className="text-2xl font-bold mb-2">{t('title')}</h3>
                        <p className="text-[#ece9e0] text-sm">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white">
                    <Card className="bg-transparent shadow-none border-0 p-0">
                        <CardHeader className="mb-6 px-0">
                            <CardTitle className="text-3xl font-bold mb-2 text-[var(--footer)]">{t('title')}</CardTitle>
                            {sent ? '' : (<CardDescription className="text-[#7a7a68] text-base">{t('subtitle')}</CardDescription>)}
                        </CardHeader>
                        <CardContent className="px-0">
                            {sent ? (
                                <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-center font-medium">
                                    {t('success_message')}
                                </div>
                            ) : (
                                <Form {...form}>
                                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                                        <FormField control={form.control} name="email" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">Email</FormLabel>
                                                <div className="relative">
                                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                    <Input className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('email_placeholder')} {...field} />
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
                            <div className="mt-8 text-center text-sm text-[#7a7a68]">
                                {t('remember_password')} <Link href="/login" className="text-[var(--primary)] hover:text-[#3a3a2e] font-semibold">{t('login_link')}</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
