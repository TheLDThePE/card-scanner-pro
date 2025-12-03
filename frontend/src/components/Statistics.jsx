import React from 'react';
import { BarChart3, Users, Clock, Zap } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center gap-4">
        <div className={`p-3 rounded-full ${color}`}>
            <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
            <p className="text-sm text-gray-500 font-medium">{label}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

const Statistics = ({ scans }) => {
    const totalScans = scans.length;

    // Calculate unique employees (exclude Unknown/N/A)
    // const uniqueEmployees = new Set(
    //     scans
    //         .filter(s => s.EmpNo && s.EmpNo !== 'N/A')
    //         .map(s => s.EmpNo)
    // ).size;

    const uniqueEmployees = new Set(
    scans
        .filter(s => {
            // นับเฉพาะคนที่พบใน Master (name ไม่ใช่ Unknown)
            return s.EmpNo && 
                   s.EmpNo !== 'N/A' && 
                   s.name && 
                   s.name !== 'Unknown';
        })
        .map(s => s.EmpNo)
).size;








    // Calculate average scan time (mock calculation as we don't have real scan duration yet)
    // In a real app, we'd track the time between keystrokes or from start to submit
    //  const avgTime = "0.4s";

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <StatCard
                icon={BarChart3}
                label="Total Scans Today"
                value={totalScans}
                color="bg-blue-500"
            />
            <StatCard
                icon={Users}
                label="Unique Employees"
                value={uniqueEmployees}
                color="bg-green-500"
            />
            {/* <StatCard
                icon={Zap}
                label="Avg. Scan Speed"
                value={avgTime}
                color="bg-purple-500"
            /> */}
        </div>
    );
};

export default Statistics;
