import { useEffect, useRef } from 'react';

export const useCardReader = (onScan) => {
    const buffer = useRef('');
    const lastKeyTime = useRef(Date.now());
    const submitTimer = useRef(null);

    const KEYSTROKE_TIMEOUT = 150; // ✅ เพิ่มจาก 50ms → 150ms รองรับ iOS + USB OTG
    const SUBMIT_DELAY = 150;      // ✅ รอ Enter จาก reader ถ้าไม่มาก็ submit เอง

    useEffect(() => {
        // ✅ pad CardNo ให้ครบ 10 หลัก ก่อน submit เสมอ
        const submitBuffer = () => {
            const value = buffer.current.trim();
            buffer.current = '';
            clearTimeout(submitTimer.current);

            if (!value) return;

            const padded = /^\d+$/.test(value)
                ? value.padStart(10, '0')
                : value.toUpperCase();

            onScan(padded);
        };

        const handleKeyDown = (e) => {
            const currentTime = Date.now();

            // ✅ ถ้าช้าเกิน threshold → reset buffer (manual typing)
            if (currentTime - lastKeyTime.current > KEYSTROKE_TIMEOUT) {
                buffer.current = '';
                clearTimeout(submitTimer.current);
            }

            lastKeyTime.current = currentTime;

            // ✅ Enter มา → submit ทันที
            if (e.key === 'Enter') {
                if (buffer.current.length > 0) {
                    submitBuffer();
                }
                return;
            }

            // รับเฉพาะ printable character
            if (e.key.length !== 1) return;

            buffer.current += e.key;

            // ✅ รองรับ 9-10 หลัก → ตั้ง timer รอ Enter
            //    ถ้า Enter มาก่อน timer จะ clear และ submit ทันที
            if (buffer.current.length >= 9 && /^\d+$/.test(buffer.current)) {
                clearTimeout(submitTimer.current);
                submitTimer.current = setTimeout(submitBuffer, SUBMIT_DELAY);
            }

            // ป้องกัน buffer ยาวเกิน
            if (buffer.current.length > 10) {
                buffer.current = buffer.current.slice(-10);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(submitTimer.current);
        };
    }, [onScan]);
};
