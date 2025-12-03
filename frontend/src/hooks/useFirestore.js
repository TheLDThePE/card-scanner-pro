import { useState, useEffect } from 'react';
import {
    collection,
    addDoc,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    doc,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

export const useFirestore = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Real-time subscription to scans
    useEffect(() => {
        const q = query(
            collection(db, 'scans'),
            orderBy('timestamp', 'desc'),
            limit(50)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newScans = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setScans(newScans);
            setLoading(false);
        }, (err) => {
            console.error("Firestore error:", err);
            setError(err);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Function to add a new scan
    const addScan = async (scanData) => {
        try {
            await addDoc(collection(db, 'scans'), {
                ...scanData,
                timestamp: serverTimestamp(),
                synced: true // Will be handled by offline persistence automatically
            });
            return true;
        } catch (err) {
            console.error("Error adding scan:", err);
            setError(err);
            return false;
        }
    };

    // Function to delete a single scan
    const deleteScan = async (id) => {
        try {
            await deleteDoc(doc(db, 'scans', id));
            return true;
        } catch (err) {
            console.error("Error deleting scan:", err);
            setError(err);
            return false;
        }
    };

    // Function to clear all scans
    const clearAllScans = async () => {
        try {
            // Batch delete is limited to 500 ops, so we might need multiple batches
            // For simplicity in this demo, we'll map over current scans
            // In production with thousands of records, use a cloud function or recursive batch delete
            const batch = writeBatch(db);
            scans.forEach((scan) => {
                const docRef = doc(db, 'scans', scan.id);
                batch.delete(docRef);
            });
            await batch.commit();
            return true;
        } catch (err) {
            console.error("Error clearing scans:", err);
            setError(err);
            return false;
        }
    };

    return { scans, addScan, deleteScan, clearAllScans, loading, error };
};
