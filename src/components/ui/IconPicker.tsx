'use client';
import { useState, useEffect, useMemo } from 'react';
import { icons as lucideIcons } from 'lucide-react';
import * as TablerIcons from '@tabler/icons-react';
import { Input } from './input';
import DisplayIcon from './DisplayIcon';

// ── Build icon lists ─────────────────────────────────────────────────────────

const LUCIDE_NAMES: string[] = Object.keys(lucideIcons);

// Tabler exports components like `IconRoad`, `IconHome`, etc.
// We only keep the Icon* exports and strip the `Icon` prefix to get a clean name.
const TABLER_NAMES: string[] = Object.keys(TablerIcons)
    .filter((k) => k.startsWith('Icon') && k !== 'IconNode')
    .map((k) => k.slice(4)); // "IconRoad" → "Road"

// ── Types ─────────────────────────────────────────────────────────────────────

export type IconPickerValue = string; // "lucideName" or "tb:tablerName"

interface IconPickerProps {
    onSelect: (iconName: IconPickerValue) => void;
    initialValue?: IconPickerValue | null;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toPascalCase(str: string) {
    return str.replace(/(^\w|-\w)/g, (c) => c.replace('-', '').toUpperCase());
}

// ── Component ─────────────────────────────────────────────────────────────────

const IconPicker = ({ onSelect, initialValue = null }: IconPickerProps) => {
    const [selected, setSelected] = useState<IconPickerValue | null>(initialValue);
    const [search, setSearch] = useState('');
    const [tab, setTab] = useState<'lucide' | 'tabler'>('lucide');

    useEffect(() => {
        if (initialValue !== undefined) setSelected(initialValue);
        // Auto-switch tab to match existing value
        if (initialValue?.startsWith('tb:')) setTab('tabler');
        else if (initialValue) setTab('lucide');
    }, [initialValue]);

    const filteredLucide = useMemo(() => {
        if (!search) return LUCIDE_NAMES;
        const q = search.toLowerCase();
        return LUCIDE_NAMES.filter((n) => n.toLowerCase().includes(q));
    }, [search]);

    const filteredTabler = useMemo(() => {
        if (!search) return TABLER_NAMES;
        const q = search.toLowerCase();
        return TABLER_NAMES.filter((n) => n.toLowerCase().includes(q));
    }, [search]);

    const handleSelect = (value: IconPickerValue) => {
        setSelected(value);
        onSelect(value);
    };

    const activeList = tab === 'lucide' ? filteredLucide : filteredTabler;

    return (
        <div className="space-y-3">
            {/* Search */}
            <Input
                type="text"
                placeholder={`Search ${tab === 'lucide' ? 'Lucide' : 'Tabler'} icons…`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full"
            />

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 pb-1">
                <button
                    type="button"
                    onClick={() => setTab('lucide')}
                    className={`text-xs font-medium px-3 py-1 rounded-t transition-colors ${tab === 'lucide' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                    Lucide ({LUCIDE_NAMES.length})
                </button>
                <button
                    type="button"
                    onClick={() => setTab('tabler')}
                    className={`text-xs font-medium px-3 py-1 rounded-t transition-colors ${tab === 'tabler' ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                    Tabler ({TABLER_NAMES.length})
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-15 xl:grid-cols-20 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                {activeList.map((name) => {
                    const value = tab === 'lucide' ? name : `tb:${name}`;
                    return (
                        <div
                            key={value}
                            onClick={() => handleSelect(value)}
                            className={`cursor-pointer p-2 rounded text-center transition-colors ${selected === value ? 'bg-blue-100 border-2 border-blue-500' : 'hover:bg-gray-100'}`}
                            title={tab === 'lucide' ? name : `Icon${toPascalCase(name)}`}
                        >
                            <DisplayIcon iconName={value} size={16} />
                            <div className="text-xs mt-1 truncate max-w-10">{name}</div>
                        </div>
                    );
                })}
                {activeList.length === 0 && (
                    <div className="col-span-full text-center py-4 text-gray-500">
                        No icons found for &ldquo;{search}&rdquo;
                    </div>
                )}
            </div>

            {/* Current selection preview */}
            {selected && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded px-3 py-1.5 border">
                    <DisplayIcon iconName={selected} size={18} />
                    <span className="font-mono">{selected}</span>
                    <button
                        type="button"
                        onClick={() => { setSelected(null); onSelect(''); }}
                        className="ml-auto text-red-400 hover:text-red-600 text-xs"
                    >
                        ✕ Clear
                    </button>
                </div>
            )}
        </div>
    );
};

export default IconPicker;
