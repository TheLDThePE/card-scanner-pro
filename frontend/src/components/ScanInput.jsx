import React, { useState, useEffect, useRef } from 'react';
import { ScanLine, Keyboard, Send } from 'lucide-react';

const ScanInput = ({ onScan }) => {
    const [input, setInput] = useState('');
    // false = โหมดสแกน (ไม่เด้ง keyboard บนมือถือ), true = โหมดพิมพ์เอง (เด้ง keyboard)
    const [manualMode, setManualMode] = useState(false);
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

    const submit = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        if (/^\d+$/.test(trimmed)) {
            // โหมดสแกน: ตัวเลขล้วนให้ useCardReader จัดการ (เหมือนเดิม)
            if (!manualMode) {
                setInput('');
                return;
            }
            // โหมดพิมพ์เอง: CardNo 9-10 หลัก เติม 0 ข้างหน้าให้ครบ 10 หลักเหมือน reader
            const value = trimmed.length >= 9 ? trimmed.padStart(10, '0') : trimmed;
            onScan(value);
        } else {
            onScan(trimmed.toUpperCase());
        }
        setInput('');
    };

    const handleKeyDown = (e) => {
        // โหมดพิมพ์เอง: กัน useCardReader (ฟัง keydown ทั้งหน้า) จับตัวอักษรซ้ำ
        if (manualMode) e.stopPropagation();

        if (e.key === 'Enter') {
            e.preventDefault();
            submit();
        }
    };

    const toggleManual = () => {
        const next = !manualMode;
        setManualMode(next);
        setInput('');

        const el = inputRef.current;
        if (el) {
            // ต้องเปลี่ยนก่อน แล้ว blur/focus ใหม่ ในจังหวะที่ผู้ใช้กดปุ่ม
            // ไม่งั้นมือถือ (โดยเฉพาะ iOS) จะไม่เด้ง/ซ่อน keyboard ตามโหมด
            el.inputMode = next ? 'text' : 'none';
            el.blur();
            el.focus();
        }
    };

    // กดปุ่มแล้วไม่ให้ input เสีย focus
    const keepFocus = (e) => e.preventDefault();

    return (
        <div className="w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <ScanLine className="w-6 h-6 text-blue-600" />
                    Scan Card
                </h2>

                <button
                    type="button"
                    onMouseDown={keepFocus}
                    onClick={toggleManual}
                    className={
                        'flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ' +
                        (manualMode
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50')
                    }
                    aria-pressed={manualMode}
                >
                    <Keyboard className="w-4 h-4" />
                    {manualMode ? 'Manual' : 'Scanner'}
                </button>
            </div>

            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    maxLength={20}
                    placeholder={manualMode ? 'Type CardNo / EmpNo ...' : 'Scan CardNo ...'}
                    inputMode={manualMode ? 'text' : 'none'}
                    enterKeyHint="send"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize={manualMode ? 'characters' : 'off'}
                    spellCheck="false"
                    className="w-full px-4 py-3 text-lg border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-center tracking-widest font-mono"
                    style={{ caretColor: manualMode ? 'auto' : 'transparent' }}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                    {input.length}/20
                </div>
            </div>

            {manualMode && (
                <button
                    type="button"
                    onMouseDown={keepFocus}
                    onClick={submit}
                    disabled={!input.trim()}
                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <Send className="w-5 h-5" />
                    Submit
                </button>
            )}
        </div>
    );
};

export default ScanInput;
