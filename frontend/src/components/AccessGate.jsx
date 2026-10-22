import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

/**
 * AccessGate: ป้องกันการเข้าใช้แบบง่าย ด้วยรหัสผ่านกลาง
 *
 * - รหัสผ่านไม่ได้เก็บในโค้ด เก็บเป็นค่า SHA-256 ใน Environment Variable ของ Vercel
 *   ชื่อ VITE_ACCESS_HASH (repo เป็น public จึงไม่ควรใส่ค่าในไฟล์)
 * - ผ่านแล้วจำเครื่องไว้ (localStorage) จนกว่าจะเปลี่ยนรหัส หรือกดปุ่ม Lock
 * - ใส่ผิด 5 ครั้งติดกัน รอ 30 วินาที
 * - แอปหลัก (Firestore listener, ตัวอ่านบัตร) จะไม่ทำงานจนกว่าจะผ่านหน้านี้
 *
 * หมายเหตุ: เป็นการกันแบบคร่าวๆ ที่ฝั่งหน้าเว็บ ไม่ใช่การป้องกันฐานข้อมูล
 */

const EXPECTED_HASH = (import.meta.env.VITE_ACCESS_HASH || '').trim().toLowerCase();
const STORAGE_KEY = 'csp_access';
const MAX_FAILS = 5;
const COOLDOWN_MS = 30000;

async function sha256Hex(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

const readStored = () => {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch {
        return null;
    }
};

const writeStored = (value) => {
    try {
        if (value) localStorage.setItem(STORAGE_KEY, value);
        else localStorage.removeItem(STORAGE_KEY);
    } catch {
        /* ใช้ไม่ได้ในบางโหมด (เช่น private) ก็แค่ไม่จำเครื่อง */
    }
};

export default function AccessGate({ children }) {
    const [unlocked, setUnlocked] = useState(
        () => !!EXPECTED_HASH && readStored() === EXPECTED_HASH
    );
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [fails, setFails] = useState(0);
    const [coolingDown, setCoolingDown] = useState(false);
    const [busy, setBusy] = useState(false);

    // ครบเวลารอ -> ปลดล็อกปุ่ม
    useEffect(() => {
        if (!coolingDown) return;
        const t = setTimeout(() => {
            setCoolingDown(false);
            setError('');
        }, COOLDOWN_MS);
        return () => clearTimeout(t);
    }, [coolingDown]);

    const logout = () => {
        writeStored(null);
        setUnlocked(false);
    };

    const submit = async (e) => {
        e.preventDefault();
        if (busy || coolingDown || !password.trim()) return;

        setBusy(true);
        try {
            const hash = await sha256Hex(password.trim());
            if (hash === EXPECTED_HASH) {
                writeStored(hash);
                setFails(0);
                setError('');
                setUnlocked(true);
            } else {
                const n = fails + 1;
                if (n >= MAX_FAILS) {
                    setFails(0);
                    setCoolingDown(true);
                    setError('ใส่รหัสผิดหลายครั้ง กรุณารอ 30 วินาที');
                } else {
                    setFails(n);
                    setError('รหัสผ่านไม่ถูกต้อง');
                }
            }
        } catch {
            setError('เบราว์เซอร์นี้ตรวจรหัสไม่ได้ (ต้องเปิดผ่าน https)');
        } finally {
            setPassword('');
            setBusy(false);
        }
    };

    if (unlocked) {
        return typeof children === 'function' ? children(logout) : children;
    }

    // ยังไม่ได้ตั้งค่า VITE_ACCESS_HASH -> ปิดไว้ก่อน (ไม่เปิดให้เข้าโดยไม่มีรหัส)
    if (!EXPECTED_HASH) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-md text-center">
                    <Lock className="w-10 h-10 text-red-500 mx-auto mb-3" />
                    <h1 className="text-lg font-bold text-gray-800 mb-2">ยังไม่ได้ตั้งรหัสผ่านของระบบ</h1>
                    <p className="text-sm text-gray-600">
                        ผู้ดูแลต้องตั้งค่า <code className="font-mono">VITE_ACCESS_HASH</code> ใน Vercel
                        แล้ว Redeploy
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <form
                onSubmit={submit}
                className="max-w-sm w-full bg-white p-6 rounded-lg shadow-md"
            >
                <div className="flex flex-col items-center mb-5">
                    <div className="p-3 rounded-full bg-blue-100 mb-3">
                        <Lock className="w-7 h-7 text-blue-600" />
                    </div>
                    <h1 className="text-xl font-bold text-gray-800">Card Scanner Pro</h1>
                    <p className="text-sm text-gray-500 mt-1">กรุณาใส่รหัสผ่านเพื่อใช้งาน</p>
                </div>

                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoFocus
                    autoComplete="current-password"
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck="false"
                    disabled={coolingDown}
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none text-center disabled:bg-gray-100"
                />

                {error && (
                    <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={busy || coolingDown || !password.trim()}
                    className="mt-4 w-full py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    เข้าใช้งาน
                </button>
            </form>
        </div>
    );
}
