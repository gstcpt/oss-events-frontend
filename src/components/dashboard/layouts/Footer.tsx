import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Dashboard.footer");

  return (
    <footer className="bg-gray-50 items-center flex justify-center shadow-sm border-t border-gray-200">
      <div className="max-w mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="text-sm text-black text-center">&copy; {new Date().getFullYear()} Oss Events. {t('rights')}</div>
        </div>
      </div>
    </footer>
  );
}
