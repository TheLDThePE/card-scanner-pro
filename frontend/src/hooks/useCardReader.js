import { useEffect, useRef } from 'react';

export const useCardReader = (onScan) => {
    const buffer = useRef('');
    const lastKeyTime = useRef(Date.now());
    const TIMEOUT = 50; // Max time between keystrokes for a scanner (usually very fast)

    useEffect(() => {
        const handleKeyDown = (e) => {
            const currentTime = Date.now();

            // If too much time passed, reset buffer (it was likely manual typing)
            if (currentTime - lastKeyTime.current > TIMEOUT) {
                buffer.current = '';
            }

            lastKeyTime.current = currentTime;

            // Ignore non-character keys
            if (e.key.length !== 1) {
                if (e.key === 'Enter') {
                    // Scanner usually sends Enter at the end
                    if (buffer.current.length === 10 && /^\d+$/.test(buffer.current)) {
                        onScan(buffer.current);
                        buffer.current = '';
                    }
                }
                return;
            }

            buffer.current += e.key;

            // Check if we have 10 digits (some scanners might not send Enter)
            if (buffer.current.length > 10) {
                // Keep only last 10
                buffer.current = buffer.current.slice(-10);
            }

            if (buffer.current.length === 10 && /^\d+$/.test(buffer.current)) {
                // We might want to wait for Enter, but if we're strict about 10 digits:
                // onScan(buffer.current);
                // buffer.current = '';
                // Better to wait for Enter or a small timeout to confirm it's a scan sequence
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onScan]);
};
