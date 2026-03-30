import React, { useState, useEffect, useRef } from 'react';
import { Scan, Keyboard } from 'lucide-react';

const ScanInput = ({ onScan }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;

        el.focus();

        // ✅ เปิด auto-refocus กลับ (ถูก comment ออกในของเดิม)
        //    ป้องกัน iOS เปิด/ปิด virtual keyboard แล้ว focus หาย
        const handleBlur = () => {
            setTimeout(() => {
                if (inputRef.current) inputRef.current.focus();
            }, 100);
        };

        el.addEventListener('blur', handleBlur);
        return () => el.removeEventListener('blur', handleBlur);
    }, []);

    const handleChange = (e) => {
        // ✅ ลบ auto-submit ออก — useCardReader จัดการแล้ว
        //    ScanInput ทำหน้าที่แค่แสดงค่าที่กำลังพิมพ์เท่านั้น
        setInput(e.target.value.toUpperCase());
    };

    const handleKeyDown = (e) => {
        // ✅ ใช้สำหรับ manual EmpNo พิมพ์เอง + Enter เท่านั้น
        //    useCardReader จะจัดการ CardNo จาก RFID อยู่แล้ว
        if (e.key === 'Enter' && input.trim().length > 0) {
            e.preventDefault(); // ✅ ป้องกัน iOS form submit
            const trimmed = input.trim();

            // ✅ pad 0 นำหน้าถ้าเป็นตัวเลขล้วน
            const padded = /^\d+$/.test(trimmed)
                ? trimmed.padStart(10, '0')
                : trimmed.toUpperCase();

            onScan(padded);
            setInput('');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Scan className="w-6 h-6 text-blue-600" />
                    Scan Card
                </h2>
                <Keyboard className="w-5 h-5 text-gray-400" />
            </div>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    maxLength={20}
                    placeholder="Scan CardNo or type EmpNo..."
                    inputMode="none"        // ✅ ป้องกัน virtual keyboard บน iOS
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center tracking-widest font-mono"
                    style={{ caretColor: 'transparent' }} // ✅ ซ่อน cursor กระพริบ
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {input.length}/20
                </div>
            </div>

            <p className="mt-2 text-sm text-gray-500 text-center">
                Scan card or type Employee No (e.g., P1553) + Enter
            </p>
        </div>
    );
};

export default ScanInput;
