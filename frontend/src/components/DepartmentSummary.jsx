import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';

/**
 * Department Summary แยกตามกลุ่มกะ (สำหรับซ้อม 2 รอบ)
 *   - ADM = Shift A + D + M
 *   - BNC = Shift B + N + C
 * แต่ละแผนกแสดง "สแกนแล้ว / ทั้งหมด" (ทั้งหมด = คนใน Master ที่รูดบัตรจริง)
 * ครบทุกคน -> พื้นเขียว (ระดับแผนก และระดับกะ)
 *
 * props
 *  - employees : Master Data ทั้งหมด (ต้องมี Department, EmpNo, Shift)
 *  - scans     : รายการสแกนวันนี้จาก useFirestore (ต้องมี EmpNo)
 */

const GROUPS = [
    { key: 'ADM', sub: 'Shift A + D + M', shifts: ['A', 'D', 'M'], theme: 'orange' },
    { key: 'BNC', sub: 'Shift B + N + C', shifts: ['B', 'N', 'C'], theme: 'cyan' },
];

// เขียน class เต็มๆ (Tailwind ต้องเห็นชื่อ class ตรงตัว)
const THEMES = {
    orange: {
        card: 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200',
        title: 'text-orange-800',
        text: 'text-orange-600',
        tile: 'bg-white/70 border-orange-200',
        tileLabel: 'text-orange-700',
        tileNum: 'text-orange-700',
    },
    cyan: {
        card: 'bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200',
        title: 'text-cyan-800',
        text: 'text-cyan-600',
        tile: 'bg-white/70 border-cyan-200',
        tileLabel: 'text-cyan-700',
        tileNum: 'text-cyan-700',
    },
    gray: {
        card: 'bg-gray-50 border-gray-200',
        title: 'text-gray-700',
        text: 'text-gray-500',
        tile: 'bg-white border-gray-200',
        tileLabel: 'text-gray-500',
        tileNum: 'text-gray-700',
    },
    done: {
        card: 'bg-green-50 border-green-400',
        title: 'text-green-800',
        text: 'text-green-700',
    },
};

export default function DepartmentSummary({ employees = [], scans = [] }) {
    const { groups, totalAll, scannedAll } = useMemo(() => {
        const scannedSet = new Set(
            scans.map((s) => String(s.EmpNo ?? '').trim()).filter(Boolean)
        );

        const acc = new Map(); // key -> { total, scanned, depts: Map }
        const seen = new Set(); // กันนับ EmpNo ซ้ำใน Master
        let totalAll = 0;
        let scannedAll = 0;

        for (const emp of employees) {
            const empNo = String(emp.EmpNo ?? '').trim();
            if (!empNo || seen.has(empNo)) continue;
            seen.add(empNo);

            const shift = String(emp.Shift ?? '').trim().toUpperCase();
            const group = GROUPS.find((g) => g.shifts.includes(shift));
            const key = group ? group.key : 'OTHER';
            const dept = String(emp.Department ?? '').trim() || 'Unknown';
            const isScanned = scannedSet.has(empNo);

            if (!acc.has(key)) acc.set(key, { total: 0, scanned: 0, depts: new Map() });
            const g = acc.get(key);
            if (!g.depts.has(dept)) g.depts.set(dept, { dept, total: 0, scanned: 0 });
            const d = g.depts.get(dept);

            g.total += 1;
            d.total += 1;
            totalAll += 1;
            if (isScanned) {
                g.scanned += 1;
                d.scanned += 1;
                scannedAll += 1;
            }
        }

        const build = (key, sub, theme) => {
            const g = acc.get(key) || { total: 0, scanned: 0, depts: new Map() };
            const depts = Array.from(g.depts.values()).sort(
                (a, b) => b.total - a.total || a.dept.localeCompare(b.dept)
            );
            return { key, sub, theme, total: g.total, scanned: g.scanned, depts };
        };

        const groups = GROUPS.map((g) => build(g.key, g.sub, g.theme));
        // กะอื่นๆ / ไม่มีข้อมูลกะ: แสดงเฉพาะเมื่อมีคน เพื่อให้ยอดรวมตรงกับ Master
        if (acc.has('OTHER')) groups.push(build('OTHER', 'Shift not in A/D/M/B/N/C', 'gray'));

        return { groups, totalAll, scannedAll };
    }, [employees, scans]);

    return (
        <div className="space-y-4">
            <div className="flex items-baseline justify-between">
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

            {groups.map((g) => {
                const groupDone = g.total > 0 && g.scanned >= g.total;
                const t = THEMES[g.theme];
                const c = groupDone ? THEMES.done : t;

                return (
                    <div
                        key={g.key}
                        className={`p-4 lg:p-6 rounded-lg shadow-sm border-2 transition-colors ${c.card}`}
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className={`flex items-center gap-2 text-lg font-bold ${c.title}`}>
                                    {groupDone && <CheckCircle2 className="w-5 h-5" />}
                                    {g.key === 'OTHER' ? 'Other' : g.key}
                                </h3>
                                <p className={`text-sm ${c.text}`}>{g.sub}</p>
                            </div>
                            <div className={`text-3xl lg:text-4xl font-bold ${c.text}`}>
                                {g.scanned}/{g.total}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            {g.depts.map(({ dept, total, scanned }) => {
                                const done = total > 0 && scanned >= total;
                                return (
                                    <div
                                        key={dept}
                                        className={
                                            'min-w-[84px] px-4 py-3 rounded-lg border text-center transition-colors ' +
                                            (done ? 'bg-green-100 border-green-400' : t.tile)
                                        }
                                    >
                                        <div
                                            className={
                                                'flex items-center justify-center gap-1 text-xs ' +
                                                (done ? 'text-green-700' : t.tileLabel)
                                            }
                                        >
                                            {done && <CheckCircle2 className="w-3 h-3" />}
                                            {dept}
                                        </div>
                                        <div
                                            className={
                                                'text-lg font-bold ' +
                                                (done ? 'text-green-700' : t.tileNum)
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
            })}
        </div>
    );
}
