import React, { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

const NetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) {
        return (
            <div className="fixed bottom-4 right-4 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm border border-green-200">
                <Wifi className="w-3 h-3" />
                Online • Live Sync
            </div>
        );
    }

    return (
        <div className="fixed bottom-4 right-4 bg-red-100 text-red-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 shadow-sm border border-red-200 animate-pulse">
            <WifiOff className="w-3 h-3" />
            Offline • Queued
        </div>
    );
};

export default NetworkStatus;
