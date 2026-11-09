import React, { useMemo, useState, useEffect } from 'react';
import { CheckCircle2, X, Search } from 'lucide-react';

/**
 * Department Summary แยกตามกลุ่มกะ (ซ้อม 2 รอบ)
 *   - ADM = Shift A + D + M
 *   - BNC = Shift B + N + C
 * แต่ละแผนกแสดง "สแกนแล้ว / ทั้งหมด" (ทั้งหมด = คนใน Master ที่รูดบัตรจริง) ครบ = พื้นเขียว
 *
 * กดได้:
 *   - ป้ายแผนก          -> popup รายชื่อของแผนกนั้น (ยังไม่สแกน / สแกนแล้ว)
 *   - ส่วนหัว ADM / BNC -> popup รายชื่อทั้งกะ (ทุกแผนก)
 *   - ปุ่ม Unknown      -> popup รายการที่สแกนแล้วแต่ไม่พบใน Master
 *
 * props
 *  - employees : Master Data ทั้งหมด (EmpNo, Name, Department, Shift, GroupCode, ZoneCode, Telephone, Emergency_tel, ScanTime)
 *  - scans     : รายการสแกนจาก useFirestore (EmpNo, cardNumber, timestamp)
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

const clean = (v) => String(v ?? '').trim();
const phone = (v) => {
    const t = clean(v);
    return t && t !== '0' ? t : '-';
};
const timeMs = (scan) =>
    scan && scan.timestamp && typeof scan.timestamp.toMillis === 'function'
        ? scan.timestamp.toMillis()
        : Number.MAX_SAFE_INTEGER; // ยังรอเวลาจากเซิร์ฟเวอร์ = ใหม่สุด
const fmtTime = (scan) =>
    scan && scan.timestamp && typeof scan.timestamp.toDate === 'function'
        ? scan.timestamp.toDate().toLocaleTimeString('en-GB')
        : 'Pending...';
const byGroupThenEmp = (a, b) =>
    clean(a.emp.GroupCode).localeCompare(clean(b.emp.GroupCode)) ||
    clean(a.emp.EmpNo).localeCompare(clean(b.emp.EmpNo));

// ปิด popup ด้วยปุ่ม Esc
function useEscape(onClose) {
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);
}

// กันตัวอ่านบัตร (ฟัง keydown ทั้งหน้า) จับตัวอักษรที่พิมพ์ในช่องค้นหาไปเป็นการสแกน
const stopReader = (e) => e.stopPropagation();

function Overlay({ onClose, children }) {
    useEscape(onClose);
    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-2 sm:p-4"
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="bg-white rounded-xl shadow-xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
                {children}
            </div>
        </div>
    );
}

// popup รายชื่อของแผนก / กะ : ยังไม่สแกน vs สแกนแล้ว
export function MembersModal({ title, subtitle, scanned, total, members, showDept, onClose }) {
    const missingAll = useMemo(
        () => members.filter((m) => !m.scan).sort(byGroupThenEmp),
        [members]
    );
    const doneAll = useMemo(
        () => members.filter((m) => m.scan).sort((a, b) => timeMs(b.scan) - timeMs(a.scan)),
        [members]
    );
    const [tab, setTab] = useState(() => (missingAll.length > 0 ? 'missing' : 'done'));
    const [q, setQ] = useState('');

    const needle = q.trim().toLowerCase();
    const matches = (m) =>
        !needle ||
        [m.emp.EmpNo, m.emp.Name, m.emp.GroupCode, m.emp.ZoneCode, m.emp.Department, m.emp.Telephone, m.emp.Emergency_tel]
            .some((v) => String(v ?? '').toLowerCase().includes(needle));

    const list = (tab === 'missing' ? missingAll : doneAll).filter(matches);
    const complete = total > 0 && scanned >= total;

    return (
        <Overlay onClose={onClose}>
            {/* Header */}
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div>
                    <h3 className="flex items-center gap-2 text-lg font-bold text-gray-800">
                        {complete && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                        {title}
                    </h3>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
                <div className="flex items-center gap-3">
                    <span className={'text-2xl font-bold ' + (complete ? 'text-green-600' : 'text-gray-800')}>
                        {scanned}/{total}
                    </span>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Tabs + search */}
            <div className="flex flex-wrap items-center gap-3 px-5 py-3 border-b border-gray-100">
                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setTab('missing')}
                        className={
                            'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ' +
                            (tab === 'missing'
                                ? 'bg-red-600 text-white border-red-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50')
                        }
                    >
                        ยังไม่สแกน ({missingAll.length})
                    </button>
                    <button
                        type="button"
                        onClick={() => setTab('done')}
                        className={
                            'px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ' +
                            (tab === 'done'
                                ? 'bg-green-600 text-white border-green-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50')
                        }
                    >
                        สแกนแล้ว ({doneAll.length})
                    </button>
                </div>
                <div className="relative flex-1 min-w-[180px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        onKeyDown={stopReader}
                        placeholder="ค้นหา EmpNo / ชื่อ / เบอร์ ..."
                        autoComplete="off"
                        className="w-full pl-9 pr-3 py-2 text-base border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* List */}
            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="px-4 py-2 font-medium">No.</th>
                            <th className="px-4 py-2 font-medium">EmpNo</th>
                            <th className="px-4 py-2 font-medium">Name</th>
                            {showDept && <th className="px-4 py-2 font-medium">Dept</th>}
                            <th className="px-4 py-2 font-medium whitespace-nowrap">Group / Zone</th>
                            <th className="px-4 py-2 font-medium">Telephone</th>
                            <th className="px-4 py-2 font-medium">Emergency</th>
                            <th className="px-4 py-2 font-medium whitespace-nowrap">เข้างาน</th>
                            {tab === 'done' && <th className="px-4 py-2 font-medium whitespace-nowrap">สแกนเมื่อ</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {list.map((m, i) => (
                            <tr key={m.emp.EmpNo} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-2 font-mono">{m.emp.EmpNo}</td>
                                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900">{m.emp.Name || '-'}</td>
                                {showDept && <td className="px-4 py-2">{m.emp.Department || '-'}</td>}
                                <td className="px-4 py-2 whitespace-nowrap">
                                    {clean(m.emp.GroupCode) || '-'} / {clean(m.emp.ZoneCode) || '-'}
                                </td>
                                <td className="px-4 py-2 whitespace-nowrap">{phone(m.emp.Telephone)}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{phone(m.emp.Emergency_tel)}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{clean(m.emp.ScanTime) || '-'}</td>
                                {tab === 'done' && (
                                    <td className="px-4 py-2 whitespace-nowrap">{fmtTime(m.scan)}</td>
                                )}
                            </tr>
                        ))}
                        {list.length === 0 && (
                            <tr>
                                <td colSpan={9} className="px-6 py-10 text-center text-gray-500">
                                    {needle
                                        ? 'ไม่พบรายการที่ค้นหา'
                                        : tab === 'missing'
                                            ? 'สแกนครบทุกคนแล้ว'
                                            : 'ยังไม่มีใครสแกน'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <div className="px-5 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-500">
                แสดง {list.length} รายการ · รายชื่อ = Master ที่อัปโหลดล่าสุด (อัปเดตสดตามการสแกน)
            </div>
        </Overlay>
    );
}

// popup รายการที่สแกนแล้วแต่ไม่พบใน Master
export function UnknownModal({ items, onClose }) {
    return (
        <Overlay onClose={onClose}>
            <div className="flex items-start justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Unknown ({items.length})</h3>
                    <p className="text-sm text-gray-500">
                        สแกนแล้วแต่ไม่พบใน Master อาจรูด/พิมพ์ผิด หรือยังไม่อยู่ในรายชื่อที่อัปโหลดล่าสุด
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    aria-label="Close"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <div className="overflow-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-gray-50 text-gray-600 text-sm">
                        <tr>
                            <th className="px-4 py-2 font-medium">No.</th>
                            <th className="px-4 py-2 font-medium">CardNo</th>
                            <th className="px-4 py-2 font-medium">EmpNo (ที่สแกน/พิมพ์)</th>
                            <th className="px-4 py-2 font-medium">สแกนเมื่อ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {items.map((s, i) => (
                            <tr key={s.id || i} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-gray-400">{i + 1}</td>
                                <td className="px-4 py-2 font-mono">{s.cardNumber || '-'}</td>
                                <td className="px-4 py-2 font-mono">{s.EmpNo || '-'}</td>
                                <td className="px-4 py-2 whitespace-nowrap">{fmtTime(s)}</td>
                            </tr>
                        ))}
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-6 py-10 text-center text-gray-500">
                                    ไม่มีรายการ Unknown
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </Overlay>
    );
}

export default function DepartmentSummary({ employees = [], scans = [] }) {
    const [modal, setModal] = useState(null); // { kind: 'dept' | 'group' | 'unknown', groupKey, dept }
    const closeModal = () => setModal(null);

    const { groups, totalAll, scannedAll, unknownScans } = useMemo(() => {
        // สแกนแรกสุดของแต่ละ EmpNo (scans เรียงใหม่สุดก่อน จึงไล่จากท้ายมาหน้า)
        const scanByEmp = new Map();
        for (let i = scans.length - 1; i >= 0; i--) {
            const key = clean(scans[i].EmpNo);
            if (key && !scanByEmp.has(key)) scanByEmp.set(key, scans[i]);
        }

        const acc = new Map(); // key -> { total, scanned, depts: Map, members: [] }
        const seen = new Set(); // กันนับ EmpNo ซ้ำใน Master
        let totalAll = 0;
        let scannedAll = 0;

        for (const emp of employees) {
            const empNo = clean(emp.EmpNo);
            if (!empNo || seen.has(empNo)) continue;
            seen.add(empNo);

            const shift = clean(emp.Shift).toUpperCase();
            const group = GROUPS.find((g) => g.shifts.includes(shift));
            const key = group ? group.key : 'OTHER';
            const dept = clean(emp.Department) || 'No dept';
            const scan = scanByEmp.get(empNo) || null;

            if (!acc.has(key)) acc.set(key, { total: 0, scanned: 0, depts: new Map(), members: [] });
            const g = acc.get(key);
            if (!g.depts.has(dept)) g.depts.set(dept, { dept, total: 0, scanned: 0, members: [] });
            const d = g.depts.get(dept);

            const member = { emp, scan };
            g.members.push(member);
            d.members.push(member);
            g.total += 1;
            d.total += 1;
            totalAll += 1;
            if (scan) {
                g.scanned += 1;
                d.scanned += 1;
                scannedAll += 1;
            }
        }

        // สแกนแล้วแต่ไม่อยู่ใน Master (ใหม่สุดก่อน ตามลำดับของ scans)
        const unknownScans = scans.filter((s) => {
            const k = clean(s.EmpNo);
            return !k || !seen.has(k);
        });

        const build = (key, sub, theme) => {
            const g = acc.get(key) || { total: 0, scanned: 0, depts: new Map(), members: [] };
            const depts = Array.from(g.depts.values()).sort(
                (a, b) => b.total - a.total || a.dept.localeCompare(b.dept)
            );
            return { key, sub, theme, total: g.total, scanned: g.scanned, depts, members: g.members };
        };

        const groups = GROUPS.map((g) => build(g.key, g.sub, g.theme));
        // กะอื่นๆ / ไม่มีข้อมูลกะ: แสดงเฉพาะเมื่อมีคน เพื่อให้ยอดรวมตรงกับ Master
        if (acc.has('OTHER')) groups.push(build('OTHER', 'Shift not in A/D/M/B/N/C', 'gray'));

        return { groups, totalAll, scannedAll, unknownScans };
    }, [employees, scans]);

    // เนื้อหา popup (คำนวณใหม่ทุกครั้งที่ scans เปลี่ยน จึงอัปเดตสด)
    let modalEl = null;
    if (modal) {
        if (modal.kind === 'unknown') {
            modalEl = <UnknownModal items={unknownScans} onClose={closeModal} />;
        } else {
            const g = groups.find((x) => x.key === modal.groupKey);
            if (g && modal.kind === 'group') {
                modalEl = (
                    <MembersModal
                        key={`group-${g.key}`}
                        title={`${g.key === 'OTHER' ? 'Other' : g.key} - ทุกแผนก`}
                        subtitle={g.sub}
                        scanned={g.scanned}
                        total={g.total}
                        members={g.members}
                        showDept
                        onClose={closeModal}
                    />
                );
            } else if (g && modal.kind === 'dept') {
                const d = g.depts.find((x) => x.dept === modal.dept);
                if (d) {
                    modalEl = (
                        <MembersModal
                            key={`dept-${g.key}-${d.dept}`}
                            title={`${d.dept} · ${g.key === 'OTHER' ? 'Other' : g.key}`}
                            subtitle={g.sub}
                            scanned={d.scanned}
                            total={d.total}
                            members={d.members}
                            showDept={false}
                            onClose={closeModal}
                        />
                    );
                }
            }
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base lg:text-lg font-semibold text-gray-700">
                    Department Summary
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                    <button
                        type="button"
                        disabled={unknownScans.length === 0}
                        onClick={() => setModal({ kind: 'unknown' })}
                        className={
                            'px-2.5 py-1 rounded-full border text-xs font-medium transition-colors ' +
                            (unknownScans.length > 0
                                ? 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-default')
                        }
                    >
                        Unknown {unknownScans.length}
                    </button>
                    <span>
                        Scanned{' '}
                        <span className="font-semibold text-gray-800">
                            {scannedAll}/{totalAll}
                        </span>
                    </span>
                </div>
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
                        <button
                            type="button"
                            disabled={g.total === 0}
                            onClick={() => setModal({ kind: 'group', groupKey: g.key })}
                            className="w-full flex items-start justify-between mb-4 text-left rounded-lg p-2 -mx-2 -mt-2 hover:bg-black/5 disabled:hover:bg-transparent disabled:cursor-default transition-colors"
                        >
                            <div>
                                <h3 className={`flex items-center gap-2 text-lg font-bold ${c.title}`}>
                                    {groupDone && <CheckCircle2 className="w-5 h-5" />}
                                    {g.key === 'OTHER' ? 'Other' : g.key}
                                </h3>
                                <p className={`text-sm ${c.text}`}>{g.sub}</p>
                            </div>
                            <div className="text-right">
                                <div className={`text-3xl lg:text-4xl font-bold ${c.text}`}>
                                    {g.scanned}/{g.total}
                                </div>
                                {g.total > 0 && (
                                    <div className={`text-xs opacity-80 ${c.text}`}>กดดูรายชื่อทั้งกะ</div>
                                )}
                            </div>
                        </button>

                        <div className="flex flex-wrap gap-3">
                            {g.depts.map(({ dept, total, scanned }) => {
                                const done = total > 0 && scanned >= total;
                                return (
                                    <button
                                        type="button"
                                        key={dept}
                                        onClick={() => setModal({ kind: 'dept', groupKey: g.key, dept })}
                                        className={
                                            'min-w-[84px] px-4 py-3 rounded-lg border text-center transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300 ' +
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
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                );
            })}

            {modalEl}
        </div>
    );
}
