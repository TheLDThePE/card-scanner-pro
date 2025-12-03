import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Search, Users, Filter, ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { getCardDetails, isCardsLoaded, onCardsLoaded, reloadCards } from '../utils/cardDatabase';

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

const MasterView = ({ onBack }) => {
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
    const stats = useMemo(() => {
        const total = allCards.length;
        const phases = {
            Phase1: allCards.filter(c => c.Phase === 'Phase1').length,
            Phase2: allCards.filter(c => c.Phase === 'Phase2').length,
            Phase3: allCards.filter(c => c.Phase === 'Phase3').length,
            Unknown: allCards.filter(c => !c.Phase || c.Phase === 'N/A').length
        };

        // Count departments
        const depts = {};
        allCards.forEach(c => {
            const dept = c.Department || 'Unknown';
            depts[dept] = (depts[dept] || 0) + 1;
        });

        // Count shifts
        const shifts = {
            ADM: allCards.filter(c => c.Shift === 'A' || c.Shift === 'D' || c.Shift === 'M').length,
            BNC: allCards.filter(c => c.Shift === 'B' || c.Shift === 'N' || c.Shift === 'C').length
        };

        return { total, phases, depts, shifts };
    }, [allCards]);

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
        <div className="min-h-screen bg-gray-50 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-white rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">Master Data View</h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            reloadCards();
                            setCardsReady(false);
                            setTimeout(() => setCardsReady(true), 100);
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        🔄 Reload Data
                    </button>
                    <div className="text-sm text-gray-500">
                        Total Records: {stats.total}
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <StatCard label="Total Employees" value={stats.total} color="text-blue-600" />
                <StatCard label="Phase 1" value={stats.phases.Phase1} color="text-green-600" />
                <StatCard label="Phase 2" value={stats.phases.Phase2} color="text-yellow-600" />
                <StatCard label="Phase 3" value={stats.phases.Phase3} color="text-purple-600" />
                <StatCard label="Unknown Phase" value={stats.phases.Unknown} color="text-red-600" />
            </div>

            {/* Department Summary */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6 overflow-x-auto">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Department Summary</h3>
                <div className="flex gap-4 min-w-max">
                    {Object.entries(stats.depts).map(([dept, count]) => (
                        <div key={dept} className="px-4 py-2 bg-gray-50 rounded-md border border-gray-100">
                            <span className="text-xs text-gray-500 block">{dept}</span>
                            <span className="text-lg font-bold text-gray-700">{count}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Shift Summary - ADM and BNC */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg shadow-sm border-2 border-orange-200">
                    <h3 className="text-lg font-bold text-orange-800 mb-2">ADM</h3>
                    <p className="text-4xl font-bold text-orange-600">{stats.shifts.ADM}</p>
                    <p className="text-sm text-orange-600 mt-1">Shift A + D + M</p>
                </div>
                <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg shadow-sm border-2 border-cyan-200">
                    <h3 className="text-lg font-bold text-cyan-800 mb-2">BNC</h3>
                    <p className="text-4xl font-bold text-cyan-600">{stats.shifts.BNC}</p>
                    <p className="text-sm text-cyan-600 mt-1">Shift B + N + C</p>
                </div>
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
                            {/* Filter Row */}
                            <tr className="bg-gray-50 border-b border-gray-200">
                                {columns.map(col => (
                                    <th key={`filter-${col.key}`} className="px-2 py-2">
                                        <input
                                            type="text"
                                            placeholder={`Filter ${col.label}...`}
                                            value={filters[col.key] || ''}
                                            onChange={(e) => handleFilterChange(col.key, e.target.value)}
                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 font-normal"
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
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50">
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
