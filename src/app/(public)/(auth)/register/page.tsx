'use client';

import { useRouter } from 'next/navigation';
import React from 'react';
import Link from 'next/link';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import { User, Mail, Lock, AtSign, FileUser } from "lucide-react";
import { register } from '@/lib/api/auth';
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTranslations } from "next-intl";

const getFormSchema = (t: any) => z.object({
    firstname: z.string().min(2, { message: t('invalid_firstname') }),
    lastname: z.string().min(2, { message: t('invalid_lastname') }),
    username: z.string().min(2, { message: t('invalid_username') }),
    email: z.string().email({ message: t('invalid_email') }),
    password: z.string().min(8, { message: t('invalid_password') }),
    confirmPassword: z.string().min(8, { message: t('invalid_confirm_password') }),
    role_id: z.number().int().min(1, { message: t('invalid_role') }),
}).refine(data => data.password === data.confirmPassword, { message: t('passwords_dont_match'), path: ["confirmPassword"] });

type FormValues = z.infer<ReturnType<typeof getFormSchema>>;

export default function Register() {
    const t = useTranslations('Auth.register');
    const router = useRouter();
    const formSchema = getFormSchema(t);
    const form = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: { firstname: "", lastname: "", username: "", email: "", password: "", confirmPassword: "" } });

    async function onSubmit(values: FormValues) {
        try {
            await register({ firstname: values.firstname, lastname: values.lastname, username: values.username, email: values.email, password: values.password, origin: window.location.origin, role_id: values.role_id });
            router.push('/verify-email');
        } catch (err: any) { toast.error(t('register_failed')); }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-[var(--background)]">
            <div className="relative flex flex-col md:flex-row w-full max-w-4xl shadow-xl shadow-black/5 rounded-3xl overflow-hidden bg-white border border-[#ece9e0]">
                {/* Left: Image */}
                <div className="hidden md:block md:w-1/2 relative">
                    <Image src="/images/default-images/auth/register.jpg" width={800} height={800} alt="Register illustration" className="object-cover h-full w-full" priority />
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
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField control={form.control} name="firstname" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">{t('firstname_placeholder')}</FormLabel>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                    <Input className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('firstname_placeholder')} {...field} />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                        <FormField control={form.control} name="lastname" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="sr-only">{t('lastname_placeholder')}</FormLabel>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                    <Input className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('lastname_placeholder')} {...field} />
                                                </div>
                                                <FormMessage />
                                            </FormItem>
                                        )} />
                                    </div>
                                    <FormField control={form.control} name="username" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">{t('username_placeholder')}</FormLabel>
                                            <div className="relative">
                                                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                <Input className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('username_placeholder')} {...field} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="email" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">{t('email_placeholder')}</FormLabel>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                <Input className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('email_placeholder')} {...field} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="password" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">{t('password_placeholder')}</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                <Input type="password" className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('password_placeholder')} {...field} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">{t('confirm_password_placeholder')}</FormLabel>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70" />
                                                <Input type="password" className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]" placeholder={t('confirm_password_placeholder')} {...field} />
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="role_id" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="sr-only">{t('select_role')}</FormLabel>
                                            <div className="relative">
                                                <FileUser className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#7a7a68]/70 pointer-events-none z-10" />
                                                <Select onValueChange={(value) => field.onChange(+value)} defaultValue={field.value?.toString()}>
                                                    <FormControl>
                                                        <SelectTrigger className="pl-10 py-5 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]">
                                                            <SelectValue placeholder={t('select_role')} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="3">{t('role_provider')}</SelectItem>
                                                        <SelectItem value="4">{t('role_client')}</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <Button type="submit" className="w-full py-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/80 text-white font-semibold text-lg shadow-lg hover:shadow-black/10 transition-all mt-2">{t('submit')}</Button>
                                </form>
                            </Form>
                            <div className="mt-6 text-center text-sm text-[#7a7a68]">{t('already_have_account')}{" "}<Link href="/login" className="text-[var(--primary)] hover:text-[#3a3a2e] font-semibold transition-colors">{t('login')}</Link></div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}