'use client';

import { useState } from 'react';

export interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'date-range' | 'number-range' | 'boolean';
  options?: { value: string; label: string }[];
  placeholder?: string;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onFilterChange: (filters: Record<string, any>) => void;
  onClear: () => void;
}

export default function FilterBar({ filters, onFilterChange, onClear }: FilterBarProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...activeFilters, [key]: value };
    
    // Remove empty filters
    if (value === '' || value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
      delete newFilters[key];
    }
    
    setActiveFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleClear = () => {
    setActiveFilters({});
    onClear();
  };

  const activeFilterCount = Object.keys(activeFilters).length;

  return (
    <div className="rounded-xl border-2 border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-5 w-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
          </svg>
          <h3 className="font-semibold text-slate-900">Filters</h3>
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeFilterCount > 0 && (
            <button
              onClick={handleClear}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear all
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <svg
              className={`h-5 w-5 text-slate-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {filters.map((filter) => (
            <div key={filter.key}>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                {filter.label}
              </label>

              {filter.type === 'select' && (
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">{filter.placeholder || 'All'}</option>
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              )}

              {filter.type === 'multiselect' && (
                <div className="space-y-2">
                  {filter.options?.map((option) => (
                    <label key={option.value} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(activeFilters[filter.key] || []).includes(option.value)}
                        onChange={(e) => {
                          const current = activeFilters[filter.key] || [];
                          const updated = e.target.checked
                            ? [...current, option.value]
                            : current.filter((v: string) => v !== option.value);
                          handleFilterChange(filter.key, updated);
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                      />
                      <span className="text-sm text-slate-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              )}

              {filter.type === 'date-range' && (
                <div className="space-y-2">
                  <input
                    type="date"
                    value={activeFilters[filter.key]?.from || ''}
                    onChange={(e) =>
                      handleFilterChange(filter.key, {
                        ...activeFilters[filter.key],
                        from: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={activeFilters[filter.key]?.to || ''}
                    onChange={(e) =>
                      handleFilterChange(filter.key, {
                        ...activeFilters[filter.key],
                        to: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="To"
                  />
                </div>
              )}

              {filter.type === 'number-range' && (
                <div className="space-y-2">
                  <input
                    type="number"
                    value={activeFilters[filter.key]?.min || ''}
                    onChange={(e) =>
                      handleFilterChange(filter.key, {
                        ...activeFilters[filter.key],
                        min: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={activeFilters[filter.key]?.max || ''}
                    onChange={(e) =>
                      handleFilterChange(filter.key, {
                        ...activeFilters[filter.key],
                        max: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
                    placeholder="Max"
                  />
                </div>
              )}

              {filter.type === 'boolean' && (
                <select
                  value={activeFilters[filter.key] || ''}
                  onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                >
                  <option value="">All</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
