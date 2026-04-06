"use client";
import React from "react";
import { useTranslations } from "next-intl";

export default function InvoicesPage() {
  const t = useTranslations('Dashboard.invoices');
  return (
    <div className="p-6">
      <h1>{t('title')}</h1>
      {/* your invoices UI */}
    </div>
  );
}