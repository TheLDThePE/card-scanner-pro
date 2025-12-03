import React, { useState, useEffect, useRef } from 'react';
import { Scan, Keyboard } from 'lucide-react';

const ScanInput = ({ onScan }) => {
    const [input, setInput] = useState('');
    const inputRef = useRef(null);

    useEffect(() => {
        // Auto-focus input on mount
        if (inputRef.current) {
            inputRef.current.focus();
        }

        // Keep focus on input unless user clicks away intentionally
        const handleBlur = () => {
            setTimeout(() => {
                if (inputRef.current) {
                    inputRef.current.focus();
                }
            }, 100);
        };

        // inputRef.current?.addEventListener('blur', handleBlur);
        // return () => inputRef.current?.removeEventListener('blur', handleBlur);
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        // Allow numbers and letters for EmpNo
        setInput(value.toUpperCase());

        // Auto-submit if 10 digits (CardNo)
        if (/^\d{10}$/.test(value)) {
            onScan(value);
            setInput('');
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && input.length > 0) {
            onScan(input);
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
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center tracking-widest font-mono"
                    autoComplete="off"
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
