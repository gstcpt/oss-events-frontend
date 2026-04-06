'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface Option {
  label: string;
  value: string;
  children?: Option[];
}

interface MultiSelectCheckboxProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export default function MultiSelectCheckbox({ options, selected, onChange, placeholder }: MultiSelectCheckboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const renderOptions = (options: Option[], depth = 0) => {
    return options.map((option) => {
      const isVisible = option.label.toLowerCase().includes(searchTerm.toLowerCase());
      if (!isVisible) return null;

      return (
        <div key={option.value} style={{ marginLeft: `${depth * 20}px` }}>
          <label
            htmlFor={option.value}
            className="flex items-center space-x-2 my-1 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            <Checkbox
              id={option.value}
              checked={selected.includes(option.value)}
              onCheckedChange={() => handleSelect(option.value)}
            />
            <span>{option.label}</span>
          </label>
          {option.children && renderOptions(option.children, depth + 1)}
        </div>
      );
    });
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <Button
        type="button"
        variant="outline"
        className="w-full justify-between bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length > 0 ? `${selected.length} selected` : placeholder || 'Select...'}
        <span className="ml-2">{isOpen ? '-' : '+'}</span>
      </Button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
          <div className="p-2">
            <Input
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-2">
            {renderOptions(options)}
          </div>
        </div>
      )}
    </div>
  );
}