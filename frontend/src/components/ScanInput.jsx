import React, { useState, useEffect, useRef } from 'react';
// import { Scan, Keyboard } from 'lucide-react';

const ScanInput = ({ onScan }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;

        el.focus();

        const handleBlur = () => {
            setTimeout(() => {
                // ✅ ตรวจสอบก่อนว่า focus ไปอยู่ที่ element อื่นไหม
                // ถ้า focus อยู่ที่ input อื่น (เช่น modal) → ไม่ดึงกลับ
                const activeEl = document.activeElement;
                const isOtherInput =
                    activeEl &&
                    activeEl !== el &&
                    (activeEl.tagName === 'INPUT' ||
                        activeEl.tagName === 'TEXTAREA' ||
                        activeEl.isContentEditable);

                if (!isOtherInput && inputRef.current) {
                    inputRef.current.focus();
                }
            }, 150);
        };

        el.addEventListener('blur', handleBlur);
        return () => el.removeEventListener('blur', handleBlur);
    }, []);

    const handleChange = (e) => {
        setInput(e.target.value.toUpperCase());
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.trim().length > 0) {
            e.preventDefault();
            const trimmed = input.trim();

            // ✅ ถ้าเป็นตัวเลขล้วน → ปล่อยให้ useCardReader จัดการ
            //    ScanInput จัดการเฉพาะ EmpNo (มีตัวอักษร) เท่านั้น
            if (/^\d+$/.test(trimmed)) {
                setInput('');
                return; // ← ไม่ยิง onScan ซ้ำ!
            }

            // EmpNo เช่น P1553, D6702
            onScan(trimmed.toUpperCase());
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
                // <Keyboard className="w-5 h-5 text-gray-400" />
            </div>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    maxLength={20}
                    placeholder="Scan CardNo .."
                    inputMode="none"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center tracking-widest font-mono"
                    style={{ caretColor: 'transparent' }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {input.length}/20
                </div>
            </div>

            <p className="mt-2 text-sm text-gray-500 text-center">
                Scan card 
            </p>
        </div>
    );
};

export default ScanInput;
