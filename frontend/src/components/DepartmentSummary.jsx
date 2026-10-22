import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Department Summary: แสดง "สแกนแล้ว / ทั้งหมด" ของแต่ละแผนก
 * - employees : รายการ Master Data ทั้งหมด (ต้องมี field Department, EmpNo)
 * - scans     : รายการสแกนวันนี้จาก useFirestore (ต้องมี field EmpNo)
 * ครบทุกคนในแผนก -> พื้นหลังสีเขียว
 */
export default function DepartmentSummary({ employees = [], scans = [] }) {
    const { rows, totalAll, scannedAll } = useMemo(() => {
        const scannedSet = new Set(
            scans.map((s) => String(s.EmpNo ?? '').trim()).filter(Boolean)
        );

        const map = new Map();
        const seen = new Set(); // กันนับ EmpNo ซ้ำใน Master
        let totalAll = 0;
        let scannedAll = 0;

        for (const emp of employees) {
            const empNo = String(emp.EmpNo ?? '').trim();
            if (!empNo || seen.has(empNo)) continue;
            seen.add(empNo);

            const dept = String(emp.Department ?? '').trim() || 'Unknown';
            if (!map.has(dept)) map.set(dept, { dept, total: 0, scanned: 0 });

            const row = map.get(dept);
            row.total += 1;
            totalAll += 1;
            if (scannedSet.has(empNo)) {
                row.scanned += 1;
                scannedAll += 1;
            }
        }

        return { rows: Array.from(map.values()), totalAll, scannedAll };
    }, [employees, scans]);

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 lg:p-6">
            <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-base lg:text-lg font-semibold text-gray-700">
                    Department Summary
                </h2>
                <span className="text-sm text-gray-500">
                    Scanned{' '}
                    <span className="font-semibold text-gray-800">
                        {scannedAll}/{totalAll}
                    </span>
                </span>
            </div>

            <div className="flex flex-wrap gap-3">
                {rows.map(({ dept, total, scanned }) => {
                    const done = total > 0 && scanned >= total;
                    return (
                        <div
                            key={dept}
                            className={
                                'min-w-[84px] px-4 py-3 rounded-lg border text-center transition-colors ' +
                                (done
                                    ? 'bg-green-100 border-green-400'
                                    : 'bg-gray-50 border-gray-200')
                            }
                        >
                            <div
                                className={
                                    'flex items-center justify-center gap-1 text-xs ' +
                                    (done ? 'text-green-700' : 'text-gray-500')
                                }
                            >
                                {done && <CheckCircle2 className="w-3 h-3" />}
                                {dept}
                            </div>
                            <div
                                className={
                                    'text-lg font-bold ' +
                                    (done ? 'text-green-700' : 'text-gray-800')
                                }
                            >
                                {scanned}/{total}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
