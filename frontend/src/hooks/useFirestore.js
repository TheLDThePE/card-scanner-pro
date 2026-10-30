import { useState, useEffect } from 'react';
import {
    collection,
    query,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    deleteDoc,
    setDoc,
    getDocs,
    doc,
    writeBatch
} from 'firebase/firestore';
import { db } from '../firebase';

// เพดานความปลอดภัย (เดิม limit(50) ทำให้นับสแกนหยุดที่ 50)
// พนักงาน ~800 คน -> 3000 เผื่อบัตรไม่รู้จัก/รายการทดสอบ
const MAX_SCANS = 3000;

// รหัสเอกสาร = EmpNo: สแกนคนเดิมซ้ำ (หรือสองเครื่องพร้อมกัน) จะได้เอกสารเดียว ไม่เกิดรายการซ้ำ
const toDocId = (scanData) => {
    const raw = String(scanData.EmpNo || scanData.cardNumber || '').trim();
    let id = raw.replace(/[\/\s]+/g, '_');
    if (!id || id === '.' || id === '..' || /^__.*__$/.test(id)) {
        id = `scan_${id || Date.now()}`;
    }
    return id.slice(0, 200);
};

export const useFirestore = () => {
    const [scans, setScans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Real-time subscription to scans (ล่าสุดอยู่บนสุด)
    useEffect(() => {
        const q = query(
            collection(db, 'scans'),
            orderBy('timestamp', 'desc'),
            limit(MAX_SCANS)
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newScans = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            }));
            setScans(newScans);
            setError(null); // ได้ข้อมูลสำเร็จ = เคลียร์ข้อผิดพลาดเก่า
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
            await setDoc(doc(db, 'scans', toDocId(scanData)), {
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
    // ลบ "ทุกเอกสาร" ใน collection (ไม่ใช่เฉพาะที่แสดงอยู่) แบ่ง batch ละไม่เกิน 400 รายการ
    const clearAllScans = async () => {
        try {
            const snap = await getDocs(collection(db, 'scans'));
            let batch = writeBatch(db);
            let pending = 0;

            for (const d of snap.docs) {
                batch.delete(d.ref);
                pending++;
                if (pending === 400) {
                    await batch.commit();
                    batch = writeBatch(db);
                    pending = 0;
                }
            }
            if (pending > 0) {
                await batch.commit();
            }
            return true;
        } catch (err) {
            console.error("Error clearing scans:", err);
            setError(err);
            return false;
        }
    };

    return { scans, addScan, deleteScan, clearAllScans, loading, error };
};
