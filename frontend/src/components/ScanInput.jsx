import React, { useState, useEffect, useRef } from 'react';
import { ScanLine } from 'lucide-react'; // ✅ เอา Keyboard ออก

const ScanInput = ({ onScan }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        const el = inputRef.current;
        if (!el) return;

        el.focus();

        const handleBlur = () => {
            setTimeout(() => {
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

            if (/^\d+$/.test(trimmed)) {
                setInput('');
                return;
            }

            onScan(trimmed.toUpperCase());
            setInput('');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ScanLine className="w-6 h-6 text-blue-600" />
                    Scan Card
                </h2>
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
            {/* ✅ เอาข้อความ hint ออกแล้ว */}
        </div>
    );
};

export default ScanInput;
