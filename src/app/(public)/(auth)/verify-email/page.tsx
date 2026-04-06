"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { verifyEmail, resendVerification } from "@/lib/api/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MailCheck, MailWarning, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

export default function VerifyEmail() {
    const t = useTranslations('Auth.verifyEmail');
    const tCommon = useTranslations('Common');
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<"pending" | "success" | "error">("pending");
    const [message, setMessage] = useState(t('verifying'));
    const [email, setEmail] = useState("");
    const [resendStatus, setResendStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

    useEffect(() => {
        const token = searchParams.get("token");
        const emailParam = searchParams.get("email");
        if (emailParam) setEmail(emailParam);

        if (token) {
            setStatus("pending");
            setMessage(t('verifying'));
            verifyEmail({ token })
                .then(() => {
                    setStatus("success");
                    setMessage(t('verify_success'));
                })
                .catch(() => {
                    setStatus("error");
                    setMessage(t('verify_error'));
                });
        } else {
            setStatus("pending");
            setMessage(t('check_email'));
        }
    }, [searchParams, t]);

    const handleResend = async () => {
        setResendStatus("sending");
        try {
            await resendVerification({ email, origin: window.location.origin });
            setResendStatus("sent");
            setMessage(t('resend_success'));
        } catch {
            setResendStatus("error");
            setMessage(t('resend_error'));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 pt-24 bg-[var(--background)]">
            <div className="relative flex flex-col md:flex-row w-full max-w-4xl shadow-xl shadow-black/5 rounded-3xl overflow-hidden bg-white border border-[#ece9e0]">
                {/* Left: Image */}
                <div className="hidden md:block md:w-1/2 relative">
                    <Image src="/images/default-images/auth/verify.jpg" width={800} height={800} alt="Verify Email illustration" className="object-cover h-full w-full" priority />
                    <div className="absolute inset-0 bg-linear-to-t from-[var(--footer)]/80 to-transparent" />
                    <div className="absolute bottom-8 left-8 text-white z-10">
                        <h3 className="text-2xl font-bold mb-2">{t('title')}</h3>
                        <p className="text-[#ece9e0] text-sm">{t('subtitle')}</p>
                    </div>
                </div>

                {/* Right: Content */}
                <div className="w-full md:w-1/2 flex flex-col justify-center p-8 md:p-12 bg-white">
                    <Card className="bg-transparent shadow-none border-0 p-0">
                        <CardHeader className="mb-6 px-0 text-center md:text-left">
                            <CardTitle className="text-3xl font-bold mb-2 text-[var(--footer)]">{t('title')}</CardTitle>
                            <CardDescription className="text-[#7a7a68] text-base">
                                {status === "success" ? t('verify_success') : t('subtitle')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <div className="flex flex-col items-center justify-center py-8 mb-6 bg-[var(--background)] rounded-3xl border border-[#ece9e0]">
                                {status === "success" ? (
                                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <MailCheck className="w-10 h-10 text-green-600" />
                                    </div>
                                ) : status === "error" ? (
                                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                        <MailWarning className="w-10 h-10 text-red-600" />
                                    </div>
                                ) : (
                                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                                    </div>
                                )}
                                <p className={`text-center font-medium px-4 ${status === "success" ? "text-green-700" :
                                    status === "error" ? "text-red-700" :
                                        "text-[#7a7a68]"
                                    }`}>
                                    {status === "success" ? t('verify_success') :
                                        status === "error" ? t('verify_error') :
                                            t('verifying')}
                                </p>
                            </div>

                            {(status === "error" || (status === "pending" && !searchParams.get("token"))) && (
                                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleResend(); }} >
                                    <div className="relative">
                                        <Input
                                            type="email"
                                            placeholder={t('email_placeholder')}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={resendStatus === "sending"}
                                            className="pl-4 py-6 rounded-xl border-[#ece9e0] focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)] bg-[var(--background)] focus:bg-white transition-all text-[var(--footer)]"
                                            required
                                        />
                                    </div>
                                    <Button type="submit" disabled={!email || resendStatus === "sending"} className="w-full py-6 rounded-xl bg-[var(--footer)] hover:bg-[#3a3a2e] text-white font-bold text-lg shadow-lg transition-all">
                                        {resendStatus === "sending" ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> {tCommon('loading')}
                                            </>
                                        ) : t('resend_button')}
                                    </Button>
                                </form>
                            )}

                            {status === "success" && (
                                <Link href="/login" className="block w-full">
                                    <Button className="w-full py-6 rounded-xl bg-[var(--primary)] hover:bg-[#3a3a2e] text-white font-bold text-lg shadow-lg hover:shadow-black/10 transition-all">
                                        {t('go_to_login')}
                                    </Button>
                                </Link>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
