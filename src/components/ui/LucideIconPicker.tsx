import { useState, useEffect, useMemo } from 'react';
import { icons } from 'lucide-react';
import { Input } from './input';

export type IconName = keyof typeof icons;
interface LucideIconPickerProps {
  onSelect: (iconName: IconName) => void;
  initialValue?: IconName | null;
}
const LucideIconPicker = ({ onSelect, initialValue = null }: LucideIconPickerProps) => {
  const [selectedIcon, setSelectedIcon] = useState<IconName | null>(initialValue);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {if (initialValue) {setSelectedIcon(initialValue);}}, [initialValue]);
  const handleSelect = (iconName: IconName) => {
    setSelectedIcon(iconName);
    onSelect(iconName);
  };
  const filteredIcons = useMemo(() => {
    const iconNames = Object.keys(icons) as IconName[];
    if (!searchTerm) return iconNames;
    return iconNames.filter(iconName => iconName.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [searchTerm]);
  return (
    <div className="space-y-3">
      <Input type="text" placeholder="Search icons..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full" />
      <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
        {filteredIcons.map((iconName) => {
          const LucideIcon = icons[iconName];
          return (
            <div key={iconName} onClick={() => handleSelect(iconName)} className={`cursor-pointer p-2 rounded text-center transition-colors ${selectedIcon === iconName ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`} title={iconName} >
              <LucideIcon size={16} />
              <div className="text-xs mt-1 truncate max-w-10">{iconName}</div>
            </div>
          );
        })}
        {filteredIcons.length === 0 && (<div className="col-span-full text-center py-4 text-gray-500">No icons found for "{searchTerm}"</div>)}
      </div>
    </div>
  );
};
export default LucideIconPicker;