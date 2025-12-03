import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { toast } from 'react-hot-toast';

const PasswordModal = ({ isOpen, onClose, onSuccess, onConfirm, title = "Enter Password", message }) => {
    const [password, setPassword] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === '1234') {
            // Support both onSuccess and onConfirm for backward compatibility
            const callback = onConfirm || onSuccess;
            if (callback) {
                callback();
            }
            setPassword('');
            onClose();
        } else {
            toast.error('Incorrect password');
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-blue-600" />
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <p className="text-sm text-gray-600 mb-4">
                        {message || "Please enter the administrator password to proceed."}
                    </p>

                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all mb-4"
                        autoFocus
                    />

                    <div className="flex gap-3 justify-end">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm transition-colors"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default PasswordModal;
