import React from 'react';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from './button';

interface QuickActionCardProps {
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  buttonText: string;
  buttonClass?: string;
  onClick?: () => void;
  href?: string;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  icon: Icon,
  iconColor,
  iconBgColor,
  title,
  description,
  buttonText,
  buttonClass = "btn-primary",
  onClick,
  href
}) => {
  return (
    <div className="card p-6 text-center">
      <div className={`mx-auto h-12 w-12 ${iconBgColor} rounded-full flex items-center justify-center mb-4`}>
        <Icon className={`h-6 w-6 ${iconColor}`} />
      </div>
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="mb-4">{description}</p>
      {href ? (
        <Link href={href} className={`${buttonClass} w-full block py-2 px-4 rounded`}>
          {buttonText}
        </Link>
      ) : (
        <Button className={`${buttonClass} w-full`} onClick={onClick}>
          {buttonText}
        </Button>
      )}
    </div>
  );
};