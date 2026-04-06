'use client';
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown, ChevronRight, ChevronDown } from "lucide-react";
import React, { useState, isValidElement } from 'react';
const getNestedValue = (obj: any, path: string) => { return path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : ''), obj); };
export interface DataTableColumn<T> { header: string; accessor: string; cell?: (item: T) => React.ReactNode; className?: string; }
interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  expandable?: boolean;
  expandedRows?: Set<number>;
  toggleRow?: (id: number) => void;
  renderRowDetails?: (item: T) => React.ReactNode;
  onCustomAction?: (item: T) => void;
  customActionLabel?: string;
  iconCustomAction?: string;
  onSecondaryAction?: (item: T) => void;
  secondaryActionLabel?: string;
  iconSecondaryAction?: string;
  showEdit?: boolean;
  showDelete?: boolean;
  showSettings?: boolean;
  defaultSort?: SortConfig;
}

type SortConfig = { key: string; direction: 'ascending' | 'descending'; } | null;

export default function DataTable<T extends { id: number }>({
  columns,
  data,
  onEdit,
  onDelete,
  expandable = false,
  expandedRows = new Set(),
  toggleRow,
  renderRowDetails,
  onCustomAction,
  customActionLabel,
  iconCustomAction,
  onSecondaryAction,
  secondaryActionLabel,
  iconSecondaryAction,
  showEdit = true,
  showDelete = true,
  showSettings = true,
  defaultSort
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>(defaultSort || { key: 'id', direction: 'descending' });
  const [searchTerm, setSearchTerm] = useState('');
  const filteredData = data.filter((item) => {
    if (!searchTerm) return true;
    return columns.some((column) => {
      let valueToSearch: any = getNestedValue(item, column.accessor);
      if (column.cell) {
        const cellOutput = column.cell(item);
        if (typeof cellOutput === 'string' || typeof cellOutput === 'number') { valueToSearch = cellOutput; }
        else if (isValidElement(cellOutput) && (cellOutput.props as any).children) {
          const children = (cellOutput.props as any).children;
          if (Array.isArray(children)) {
            valueToSearch = children.map(child => {
              if (typeof child === 'string' || typeof child === 'number') { return child; }
              if (isValidElement(child) && typeof (child.props as any).children === 'string') { return (child.props as any).children; }
              return '';
            }).join(' ');
          } else if (typeof children === 'string' || typeof children === 'number') { valueToSearch = children; }
        }
      }
      return String(valueToSearch).toLowerCase().includes(searchTerm.toLowerCase());
    });
  });
  const sortedData = [...filteredData].sort((a, b) => {
    if (sortConfig !== null) {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      if (sortConfig.key === 'id') {
        const numA = Number(aValue);
        const numB = Number(bValue);
        if (numA < numB) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (numA > numB) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      }
      const stringA = String(aValue).toLowerCase();
      const stringB = String(bValue).toLowerCase();
      if (stringA < stringB) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (stringA > stringB) return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginate = (pageNumber: number) => { if (pageNumber > 0 && pageNumber <= totalPages) setCurrentPage(pageNumber); };
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = sortedData.slice(startIndex, endIndex);
  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') { direction = 'descending'; }
    setSortConfig({ key, direction });
  };
  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) { return <ArrowUp className="ml-2 h-4 w-4" />; }
    if (sortConfig.direction === 'ascending') { return <ArrowUp className="ml-2 h-4 w-4" />; }
    return <ArrowDown className="ml-2 h-4 w-4" />;
  };
  return (
    <div className="space-y-4">
      <div className="relative group">
        <input
          type="text"
          placeholder="Search across all columns..."
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-300 outline-none pr-10 hover:bg-white hover:shadow-md"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-900 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 table-fixed">
            <thead className="bg-slate-50/50">
              <tr>
                {expandable && (<th scope="col" className="w-12 px-4 py-4"><span className="sr-only">Expand</span></th>)}
                {columns.map((column, index) => (
                  <th key={index} scope="col" className={`px-4 py-4 text-left text-[12px] font-bold tracking-widest text-slate-500 cursor-pointer transition-colors hover:text-slate-900 select-none ${column.className || ''}`} onClick={() => requestSort(column.accessor)}>
                    <div className="flex items-center group">
                      {column.header}
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {getSortIcon(column.accessor)}
                      </span>
                    </div>
                  </th>
                ))}
                {(showEdit || showDelete || onCustomAction || onSecondaryAction) && (
                  <th scope="col" className="w-40 px-4 py-4 text-right text-[12px] font-bold tracking-widest text-slate-500">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 bg-white">
              {currentData.length > 0 ? (
                currentData.flatMap((item, index) => {
                  const rows = [
                    <tr key={`${item.id}-${index}`} className="hover:bg-slate-50/50 transition-colors group">
                      {expandable && (
                        <td className="px-4 py-4 whitespace-nowrap">
                          <button
                            className="bg-slate-100 text-slate-600 p-1.5 rounded-lg hover:bg-slate-900 hover:text-white transition-all duration-300"
                            onClick={() => toggleRow?.(item.id)}
                          >
                            {expandedRows.has(item.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                          </button>
                        </td>
                      )}
                      {columns.map((column, colIndex) => (
                        <td key={colIndex} className={`px-4 py-4 text-sm font-medium text-slate-600 ${column.className || ''}`}>
                          {column.cell ? column.cell(item) : String(getNestedValue(item, column.accessor as string) ?? '')}
                        </td>
                      ))}
                      {(showEdit || showDelete || onCustomAction || onSecondaryAction) && (
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {onCustomAction && (
                              <button
                                onClick={() => onCustomAction(item)}
                                className="p-2 rounded-lg text-white bg-indigo-500 hover:bg-indigo-600 transition-all shadow-sm hover:shadow-md active:scale-95 w-10 h-10"
                                title={customActionLabel}
                              >
                                {iconCustomAction ? <i className={iconCustomAction}></i> : <ChevronRight size={14} />}
                              </button>
                            )}
                            {onSecondaryAction && (
                              <button
                                onClick={() => onSecondaryAction(item)}
                                className="p-2 rounded-lg text-white bg-emerald-500 hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md active:scale-95 w-10 h-10"
                                title={secondaryActionLabel}
                              >
                                {iconSecondaryAction ? <i className={iconSecondaryAction}></i> : <ChevronRight size={14} />}
                              </button>
                            )}
                            {showEdit && (
                              <button
                                onClick={() => onEdit?.(item)}
                                className="p-2 rounded-lg text-white bg-yellow-500 hover:bg-yellow-600 transition-all shadow-sm hover:shadow-md active:scale-95 w-10 h-10"
                                title="Edit"
                              >
                                <i className="fas fa-edit text-xs"></i>
                              </button>
                            )}
                            {showDelete && (
                              <button
                                onClick={() => onDelete?.(item)}
                                className="p-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition-all shadow-sm hover:shadow-md active:scale-95 w-10 h-10"
                                title="Delete"
                              >
                                <i className="fas fa-trash text-xs"></i>
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ];
                  if (expandable && expandedRows.has(item.id) && renderRowDetails) {
                    rows.push(
                      <tr key={`${item.id}-details`} className="bg-slate-50/30">
                        <td colSpan={columns.length + (expandable ? 1 : 0) + 1} className="px-8 py-6 border-l-4 border-slate-900">
                          {renderRowDetails(item)}
                        </td>
                      </tr>
                    );
                  }
                  return rows;
                })
              ) : (
                <tr>
                  <td colSpan={columns.length + (expandable ? 1 : 0) + 1} className="px-4 py-12 text-center text-slate-400 font-medium italic">
                    No matching records found in the current selection
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {sortedData.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2 py-4">
          <div className="flex items-center space-x-6">
            <span className="text-xs font-bold text-slate-400  tracking-widest">
              Showing <span className="text-slate-900">{startIndex + 1}</span> - <span className="text-slate-900">{Math.min(endIndex, sortedData.length)}</span> of <span className="text-slate-900">{sortedData.length}</span>
            </span>
            <div className="flex items-center space-x-2">
              <label className="text-[10px] font-bold tracking-widest text-slate-400">Page Size</label>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold text-slate-700 outline-none focus:ring-1 focus:ring-slate-900 transition-all"
              >
                {[5, 10, 15, 20, 25, 50, 100].map(size => (<option key={size} value={size}>{size}</option>))}
              </select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-xl text-slate-600 bg-white border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all active:scale-95"
            >
              <ChevronRight size={18} className="rotate-180" />
            </button>
            <div className="flex items-center space-x-1 px-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) { pageNum = i + 1; }
                else if (currentPage <= 3) { pageNum = i + 1; }
                else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                else { pageNum = currentPage - 2 + i; }
                return (
                  <button
                    key={pageNum}
                    onClick={() => paginate(pageNum)}
                    className={`min-w-[36px] h-9 text-xs font-bold rounded-xl transition-all ${currentPage === pageNum ? 'bg-slate-900 text-white shadow-lg shadow-slate-200 scale-110' : 'text-slate-500 hover:bg-slate-100'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-xl text-slate-600 bg-white border border-slate-100 shadow-sm hover:bg-slate-900 hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-slate-600 transition-all active:scale-95"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}