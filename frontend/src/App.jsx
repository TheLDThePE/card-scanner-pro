import React, { useState, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import ScanInput from './components/ScanInput';
import RecordsList from './components/RecordsList';
import Statistics from './components/Statistics';
// import NetworkStatus from './components/NetworkStatus';
import PasswordModal from './components/PasswordModal';
import MasterView from './components/MasterView';
import { useFirestore } from './hooks/useFirestore';
import { useCardReader } from './hooks/useCardReader';
import { searchCard } from './utils/cardDatabase';
import { Monitor, Trash2, Database } from 'lucide-react';

function App() {
    const { scans, addScan, deleteScan, clearAllScans, loading, error } = useFirestore();
    const [isResetAllModalOpen, setIsResetAllModalOpen] = useState(false);
    const [currentView, setCurrentView] = useState('scan'); // 'scan' or 'master'

    const handleScan = async (input) => {
        // Search by CardNo or EmpNo
        const cardDetails = searchCard(input);

        const scanData = {
            // cardNumber: input,
            cardNumber: cardDetails?.CardNo || input,  // ← ใช้ CardNo จาก Master ถ้ามี
            name: cardDetails?.Name || 'Unknown',
            // EmpNo: cardDetails?.EmpNo || 'N/A',
            EmpNo: cardDetails?.EmpNo || input,  // ← ถ้าไม่เจอใน Master ใช้ input เป็น EmpNo
            GroupCode: cardDetails?.GroupCode || 'N/A',
            ZoneCode: cardDetails?.ZoneCode || 'N/A',
            department: cardDetails?.Department || 'N/A',
            Telephone: cardDetails?.Telephone || cardDetails?.Teleplone || 'N/A',
            Emergency_tel: cardDetails?.Emergency_tel || 'N/A',
            Phase: cardDetails?.Phase || 'N/A',
            Plandate: cardDetails?.Plandate || 'N/A',
            Shift: cardDetails?.Shift || 'N/A',
            scanTime: 0 // Placeholder for now
        };

        // Check for duplicate scan by EmpNo
        if (scanData.EmpNo !== 'N/A') {
            const isDuplicate = scans.some(scan => scan.EmpNo === scanData.EmpNo);
            if (isDuplicate) {
                toast.error(`⚠️ Already scanned: ${cardDetails?.Name || input} (${scanData.EmpNo})`, {
                    duration: 4000,
                    icon: '⚠️'
                });
                return; // Don't add duplicate scan
            }
        }

        if (cardDetails) {
            toast.success(`Scanned: ${cardDetails.Name} (${cardDetails.EmpNo})`, { duration: 2000 });
        } else {
            toast.error(`Unknown: ${input}`, { duration: 3000 });
        }

        const success = await addScan(scanData);
        if (!success) {
            toast.error('Failed to save scan (will retry when online)');
        }
    };

    // Use card reader hook
    useCardReader(handleScan);

    const handleConfirmResetAll = async () => {
        const success = await clearAllScans();
        if (success) {
            toast.success('All records cleared successfully');
            setIsResetAllModalOpen(false);
        } else {
            toast.error('Failed to clear records');
        }
    };

    // Calculate shift group statistics
    const shiftStats = {
        ADM: scans.filter(scan =>
            scan.Shift === 'A' || scan.Shift === 'D' || scan.Shift === 'M'
        ).length,
        BNC: scans.filter(scan =>
            scan.Shift === 'B' || scan.Shift === 'N' || scan.Shift === 'C'
        ).length
    };

    // Render Master View
    if (currentView === 'master') {
        return <MasterView onBack={() => setCurrentView('scan')} />;
    }

    // Render Scan Page
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <Toaster position="top-right" />

            <div className="max-w-7xl mx-auto space-y-6">
                {/* Header */}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Monitor className="w-8 h-8 text-blue-600" />
                        <h1 className="text-2xl font-bold text-gray-800">Card Scanner Pro</h1>
                    </div>
                    {/* <NetworkStatus /> */}
                </div>

                {/* Stats */}
                <Statistics scans={scans} />

                {/* Scan Input & Actions */}
                <div className="grid grid-cols-2 lg:flex lg:flex-row gap-4 lg:gap-6 items-stretch lg:items-start">
                    {/* Master Data Button */}
                    <button
                        onClick={() => setCurrentView('master')}
                        className="col-span-1 order-4 lg:order-1 flex flex-col items-center justify-center p-4 lg:p-6 bg-green-600 rounded-lg shadow-md hover:bg-green-700 transition-all group w-full lg:w-[180px] h-auto aspect-square lg:h-[180px] lg:aspect-auto text-white"
                    >
                        <Database className="w-8 h-8 lg:w-12 lg:h-12 mb-2 lg:mb-3 group-hover:scale-110 transition-transform" />
                        <span className="font-semibold text-sm lg:text-base">Master Data</span>
                        <span className="text-xs mt-1 hidden lg:block opacity-90">View All Employees</span>
                    </button>

                    {/* ADM Shift Group Card */}
                    <div className="col-span-1 order-2 lg:order-2 flex flex-col items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg shadow-md border-2 border-orange-200 w-full lg:w-[180px] h-auto aspect-square lg:h-[180px] lg:aspect-auto">
                        <span className="text-xs lg:text-sm font-medium text-orange-600 mb-1">ADM</span>
                        <span className="text-3xl lg:text-5xl font-bold text-orange-600">{shiftStats.ADM}</span>
                        <span className="text-[10px] lg:text-xs text-orange-500 mt-1 lg:mt-2 text-center">Shift A + D + M</span>
                    </div>

                    {/* BNC Shift Group Card */}
                    <div className="col-span-1 order-3 lg:order-3 flex flex-col items-center justify-center p-4 lg:p-6 bg-gradient-to-br from-cyan-50 to-cyan-100 rounded-lg shadow-md border-2 border-cyan-200 w-full lg:w-[180px] h-auto aspect-square lg:h-[180px] lg:aspect-auto">
                        <span className="text-xs lg:text-sm font-medium text-cyan-600 mb-1">BNC</span>
                        <span className="text-3xl lg:text-5xl font-bold text-cyan-600">{shiftStats.BNC}</span>
                        <span className="text-[10px] lg:text-xs text-cyan-500 mt-1 lg:mt-2 text-center">Shift B + N + C</span>
                    </div>

                    {/* Scanner (Center on Desktop, Top on Mobile) */}
                    <div className="col-span-2 order-1 lg:order-4 lg:flex-1 w-full">
                        <ScanInput onScan={handleScan} />
                    </div>

                    {/* Reset Button */}
                    <button
                        onClick={() => setIsResetAllModalOpen(true)}
                        className="col-span-1 order-5 lg:order-5 flex flex-col items-center justify-center p-4 lg:p-6 bg-red-600 rounded-lg shadow-md hover:bg-red-700 transition-colors text-white w-full lg:w-[180px] h-auto aspect-square lg:h-[180px] lg:aspect-auto"
                    >
                        <Trash2 className="w-8 h-8 lg:w-12 lg:h-12 mb-2 lg:mb-3" />
                        <span className="font-semibold text-sm lg:text-base">Reset Data</span>
                    </button>
                </div>

                {/* Records List */}
                <RecordsList scans={scans} onDelete={deleteScan} />
            </div>

            {/* Reset All Modal */}
            <PasswordModal
                isOpen={isResetAllModalOpen}
                onClose={() => setIsResetAllModalOpen(false)}
                onConfirm={handleConfirmResetAll}
                title="Reset All Data"
                message="Are you sure you want to delete ALL scan records? This action cannot be undone."
            />
        </div>
    );
}

export default App;
