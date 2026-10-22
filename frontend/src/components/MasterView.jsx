import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Users, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getCardDetails, isCardsLoaded, onCardsLoaded } from '../utils/cardDatabase';
import DepartmentSummary from './DepartmentSummary';

// Helper to get all cards from the database cache
// We need to export this from cardDatabase.js first, but for now we'll access the internal variable if possible
// or we'll add a getAllCards function to cardDatabase.js
import { getAllCards } from '../utils/cardDatabase';

const StatCard = ({ label, value, color, subtext }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <p className="text-sm text-gray-500 font-medium">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
    </div>
);

// scans = รายการสแกนวันนี้ (real-time จาก App) ใช้คำนวณ scanned/total ต่อแผนก
const MasterView = ({ onBack, scans = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [sortConfig, setSortConfig] = useState({ key: 'CardNo', direction: 'asc' });
    const [filters, setFilters] = useState({});
    const [cardsReady, setCardsReady] = useState(false);

    // Reload cards when component mounts
    useEffect(() => {
        if (!isCardsLoaded()) {
            onCardsLoaded(() => setCardsReady(true));
        } else {
            setCardsReady(true);
        }
    }, []);

    // Get all cards data
    const allCards = useMemo(() => getAllCards(), [cardsReady]);

    // Statistics
    const stats = useMemo(() => ({ total: allCards.length }), [allCards]);

    // Filter and Sort
    const processedData = useMemo(() => {
        let data = [...allCards];

        // Search
        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            data = data.filter(item =>
                Object.values(item).some(val =>
                    String(val).toLowerCase().includes(lowerSearch)
                )
            );
        }

        // Column Filters
        Object.keys(filters).forEach(key => {
            if (filters[key]) {
                const lowerFilter = filters[key].toLowerCase();
                data = data.filter(item =>
                    String(item[key] || '').toLowerCase().includes(lowerFilter)
                );
            }
        });

        // Sort
        if (sortConfig.key) {
            data.sort((a, b) => {
                const aVal = a[sortConfig.key] || '';
                const bVal = b[sortConfig.key] || '';

                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return data;
    }, [allCards, searchTerm, filters, sortConfig]);

    // Pagination
    const totalPages = Math.ceil(processedData.length / itemsPerPage);
    const currentData = processedData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleSort = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
        setCurrentPage(1); // Reset to first page on filter
    };

    const SortIcon = ({ columnKey }) => {
        if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 text-gray-300" />;
        return sortConfig.direction === 'asc'
            ? <ArrowUp className="w-3 h-3 text-blue-500" />
            : <ArrowDown className="w-3 h-3 text-blue-500" />;
    };

    const columns = [
        { key: 'CardNo', label: 'CardNo' },
        { key: 'EmpNo', label: 'EmpNo' },
        { key: 'Name', label: 'Name' },
        { key: 'GroupCode', label: 'GroupCode' },
        { key: 'ZoneCode', label: 'ZoneCode' },
        { key: 'Department', label: 'Department' },
        { key: 'Telephone', label: 'Telephone' },
        { key: 'Emergency_tel', label: 'Emergency' },
        { key: 'Phase', label: 'Phase' },
        { key: 'ScanTime', label: 'ScanTime' },
        { key: 'Plandate', label: 'Plandate' },
        { key: 'Shift', label: 'Shift' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-xl lg:text-2xl font-bold text-gray-800">Master Data View</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500">
                        Total Records: {stats.total}
                    </div>
                </div>
            </div>

            {/* Total Employees */}
            <div className="mb-6 max-w-xs">
                <StatCard label="Total Employees" value={stats.total} color="text-blue-600" />
            </div>

            {/* Department Summary: แยกตามกะ ADM / BNC, scanned / total ต่อแผนก (ครบ = พื้นเขียว) */}
            <div className="mb-6">
                <DepartmentSummary employees={allCards} scans={scans} />
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Search Bar */}
                <div className="p-4 border-b border-gray-100 flex gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search all columns..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm">
                                {columns.map(col => (
                                    <th
                                        key={col.key}
                                        className="px-4 py-3 font-medium border-b border-gray-200 cursor-pointer hover:bg-gray-100 whitespace-nowrap"
                                        onClick={() => handleSort(col.key)}
                                    >
                                        <div className="flex items-center gap-1">
                                            {col.label}
                                            <SortIcon columnKey={col.key} />
                                        </div>
                                    </th>
                                ))}
                            </tr>
                            {/* Filter Row (text-base บนมือถือ กัน iOS ซูมจออัตโนมัติตอนแตะช่อง) */}
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {columns.map(col => (
                                    <th key={`filter-${col.key}`} className="px-2 py-2">
                                        <input
                                            type="text"
                                            placeholder={`Filter ${col.label}...`}
                                            value={filters[col.key] || ''}
                                            onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                            className="w-full min-w-[110px] px-2 py-1 text-base lg:text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {currentData.map((item, idx) => (
                                <tr key={item.CardNo || idx} className="hover:bg-gray-50 transition-colors">
                                    {columns.map(col => (
                                        <td key={`${item.CardNo}-${col.key}`} className="px-4 py-3 text-sm text-gray-600 whitespace-nowrap">
                                            {item[col.key] || '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            {currentData.length === 0 && (
                                <tr>
                                    <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-500">
                                        No records found
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="px-4 lg:px-6 py-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
                    <div className="text-sm text-gray-500">
                        Showing {Math.min((currentPage - 1) * itemsPerPage + 1, processedData.length)} to {Math.min(currentPage * itemsPerPage, processedData.length)} of {processedData.length} entries
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="flex items-center px-4 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded">
                            Page {currentPage} of {totalPages || 1}
                        </span>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MasterView;
