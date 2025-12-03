import React, { useState, useMemo } from 'react';
import { Clock, User, Building, Trash2, Search } from 'lucide-react';
import PasswordModal from './PasswordModal';

const RecordsList = ({ scans, onDelete }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedScanId, setSelectedScanId] = useState(null);
    const [filters, setFilters] = useState({
        cardNumber: '',
        EmpNo: '',
        name: '',
        GroupCode: '',
        ZoneCode: '',
        department: '',
        Telephone: '',
        Emergency_tel: '',
        Phase: '',
        Shift: ''
    });

    const handleDeleteClick = (id) => {
        setSelectedScanId(id);
        setIsModalOpen(true);
    };

    const handleConfirmDelete = () => {
        if (selectedScanId) {
            onDelete(selectedScanId);
            setSelectedScanId(null);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    // Filter scans based on all filter criteria
    const filteredScans = useMemo(() => {
        return scans.filter(scan => {
            return Object.keys(filters).every(key => {
                const filterValue = filters[key].toLowerCase();
                if (!filterValue) return true;
                const scanValue = (scan[key] || '').toString().toLowerCase();
                return scanValue.includes(filterValue);
            });
        });
    }, [scans, filters]);

    if (!scans || scans.length === 0) {
        return (
            <div className="text-center py-10 text-gray-500 bg-white rounded-lg shadow-sm">
                <p>No scans yet today</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-700">Recent Scans</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 text-gray-600 text-sm">
                                <th className="px-6 py-3 font-medium">CardNo</th>
                                <th className="px-6 py-3 font-medium">EmpNo</th>
                                <th className="px-6 py-3 font-medium">Name</th>
                                <th className="px-6 py-3 font-medium">GroupCode</th>
                                <th className="px-6 py-3 font-medium">ZoneCode</th>
                                <th className="px-6 py-3 font-medium">Department</th>
                                <th className="px-6 py-3 font-medium">Telephone</th>
                                <th className="px-6 py-3 font-medium">Emergency_tel</th>
                                <th className="px-6 py-3 font-medium">Phase</th>
                                <th className="px-6 py-3 font-medium">ScanTime</th>
                                <th className="px-6 py-3 font-medium">Plandate</th>
                                <th className="px-6 py-3 font-medium">Shift</th>
                                <th className="px-6 py-3 font-medium">Action</th>
                            </tr>
                            {/* Filter Row */}
                            <tr className="bg-white border-b border-gray-200">
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.cardNumber}
                                        onChange={(e) => handleFilterChange('cardNumber', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.EmpNo}
                                        onChange={(e) => handleFilterChange('EmpNo', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.name}
                                        onChange={(e) => handleFilterChange('name', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.GroupCode}
                                        onChange={(e) => handleFilterChange('GroupCode', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.ZoneCode}
                                        onChange={(e) => handleFilterChange('ZoneCode', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.department}
                                        onChange={(e) => handleFilterChange('department', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.Telephone}
                                        onChange={(e) => handleFilterChange('Telephone', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.Emergency_tel}
                                        onChange={(e) => handleFilterChange('Emergency_tel', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.Phase}
                                        onChange={(e) => handleFilterChange('Phase', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    {/* ScanTime - no filter */}
                                </th>
                                <th className="px-2 py-2">
                                    {/* Plandate - no filter */}
                                </th>
                                <th className="px-2 py-2">
                                    <input
                                        type="text"
                                        placeholder="Filter..."
                                        value={filters.Shift}
                                        onChange={(e) => handleFilterChange('Shift', e.target.value)}
                                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-2 py-2">
                                    {/* Action - no filter */}
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredScans.map((scan) => (
                                <tr key={scan.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-sm font-medium text-gray-800">
                                        {scan.cardNumber}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.EmpNo || '-'}
                                    </td>
                                    <td className="px-6 py-4 min-w-[200px]">
                                        <div className="flex items-center gap-2 whitespace-nowrap">
                                            <User className="w-4 h-4 text-blue-500" />
                                            <span className="font-medium text-gray-900">{scan.name || 'Unknown'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.GroupCode || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.ZoneCode || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Building className="w-4 h-4 text-gray-400" />
                                            {scan.department || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.Telephone || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.Emergency_tel || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.Phase || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {scan.timestamp ? new Date(scan.timestamp.toDate()).toLocaleTimeString() : 'Pending...'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.Plandate || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {scan.Shift || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <button
                                            onClick={() => handleDeleteClick(scan.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors border border-red-200"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Reset Data
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <PasswordModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedScanId(null);
                }}
                onSuccess={handleConfirmDelete}
                title="Confirm Deletion"
            />
        </>
    );
};

export default RecordsList;
