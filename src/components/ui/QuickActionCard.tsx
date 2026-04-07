import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './button';
import { useTranslations } from 'next-intl';

interface QuickActionCardProps {
  icon: LucideIcon;
  keyProp: string;
  href?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  keyProp: key,
  href
}) => {
  const t = useTranslations('Dashboard.page');
  const tQuick = useTranslations('Dashboard.page.quickAccess');

  const title = tQuick(`${key}` as any);
  const description = tQuick(`${key}Desc` as any);
  const buttonText = tQuick(key === 'manageCompanies' ? 'viewCompanies' : key === 'userManagement' ? 'viewUsers' : key === 'globalStats' ? 'viewReports' : key === 'addProvider' ? 'addProvider' : key === 'manageClients' ? 'viewClients' : key === 'viewEvents' ? 'viewEvents' : key === 'newItem' ? 'addItem' : key === 'myItems' ? 'viewItems' : key === 'upcomingBookings' ? 'viewCalendar' : key === 'findItems' ? 'browse' : key === 'bookEvent' ? 'createEvent' : key === 'favorites' ? 'viewFavorites' : key) as string;

  const iconColorMap: Record<string, string> = {
    Building2: 'text-blue-600',
    Users: 'text-green-600',
    BarChart3: 'text-purple-600',
    Plus: 'text-orange-600',
    Calendar: 'text-yellow-600',
    PlusCircle: 'text-indigo-600',
    Package: 'text-blue-600',
    CalendarDays: 'text-amber-600',
    Search: 'text-cyan-600',
    PlusSquare: 'text-pink-600',
    Heart: 'text-red-600',
  };

  const iconBgMap: Record<string, string> = {
    Building2: 'bg-blue-100',
    Users: 'bg-green-100',
    BarChart3: 'bg-purple-100',
    Plus: 'bg-orange-100',
    Calendar: 'bg-yellow-100',
    PlusCircle: 'bg-indigo-100',
    Package: 'bg-blue-100',
    CalendarDays: 'bg-amber-100',
    Search: 'bg-cyan-100',
    PlusSquare: 'bg-pink-100',
    Heart: 'bg-red-100',
  };

  const iconColor = iconColorMap[Icon?.name || ''] || 'text-primary';
  const iconBgColor = iconBgMap[Icon?.name || ''] || 'bg-gray-100';

  return (
    <div className="card p-6 text-center">
      <div className={`mx-auto h-12 w-12 ${iconBgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="mb-4 text-slate-500 text-sm">{description}</p>
      {href ? (
        <Link href={href} className="btn-primary w-full block py-2 px-4 rounded">
          {buttonText}
        </Link>
      ) : null}
    </div>
  );
};