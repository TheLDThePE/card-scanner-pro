import React, { useState } from 'react';
import { Lock, X, Delete } from 'lucide-react';
import { toast } from 'react-hot-toast';

const CORRECT_PIN = '1234';
const PIN_LENGTH = 4;

const PasswordModal = ({ isOpen, onClose, onSuccess, onConfirm, title = "Enter Password", message }) => {
    const [pin, setPin] = useState('');

    if (!isOpen) return null;

    const handleDigit = (digit) => {
        if (pin.length >= PIN_LENGTH) return;
        const newPin = pin + digit;
        setPin(newPin);

        // ✅ auto-submit เมื่อครบ 4 หลัก
        if (newPin.length === PIN_LENGTH) {
            setTimeout(() => {
                if (newPin === CORRECT_PIN) {
                    const callback = onConfirm || onSuccess;
                    if (callback) callback();
                    setPin('');
                    onClose();
                } else {
                    toast.error('Incorrect PIN');
                    setPin('');
                }
            }, 200); // หน่วงนิดหน่อยให้เห็น dot ครบก่อน
        }
    };

    const handleDelete = () => {
        setPin(prev => prev.slice(0, -1));
    };

    const handleClose = () => {
        setPin('');
        onClose();
    };

    // ปุ่ม numpad
    const buttons = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        [null, '0', 'del'],
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-xs overflow-hidden">

                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        {title}
                    </h3>
                    <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6">
                    {/* Message */}
                    {message && (
                        <p className="text-sm text-gray-500 text-center mb-4">{message}</p>
                    )}

                    {/* PIN dots */}
                    <div className="flex justify-center gap-4 mb-6">
                        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full border-2 transition-all ${
                                    i < pin.length
                                        ? 'bg-blue-600 border-blue-600'
                                        : 'bg-white border-gray-300'
                                }`}
                            />
                        ))}
                    </div>

                    {/* PIN Pad */}
                    <div className="grid grid-cols-3 gap-3">
                        {buttons.flat().map((btn, idx) => {
                            if (btn === null) {
                                return <div key={idx} />;
                            }
                            if (btn === 'del') {
                                return (
                                    <button
                                        key={idx}
                                        onClick={handleDelete}
                                        className="flex items-center justify-center h-14 rounded-xl bg-gray-100 hover:bg-gray-200 active:bg-gray-300 transition-colors text-gray-600"
                                    >
                                        <Delete className="w-5 h-5" />
                                    </button>
                                );
                            }
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleDigit(btn)}
                                    className="flex items-center justify-center h-14 rounded-xl bg-gray-100 hover:bg-blue-50 active:bg-blue-100 transition-colors text-xl font-semibold text-gray-800"
                                >
                                    {btn}
                                </button>
                            );
                        })}
                    </div>

                    {/* Cancel */}
                    <button
                        onClick={handleClose}
                        className="w-full mt-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PasswordModal;
