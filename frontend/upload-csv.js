import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyB3ri9u3xe4aNvdALRnrg6pzyb0eh_kCe0",
    authDomain: "ld-evacuation.firebaseapp.com",
    projectId: "ld-evacuation",
    storageBucket: "ld-evacuation.firebasestorage.app",
    messagingSenderId: "238147181022",
    appId: "1:238147181022:web:d377e8826ddd31619a654f",
    measurementId: "G-5QDE376EWH"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const csvFilePath = path.join(__dirname, '../BYE2G_Master.csv');

console.log(`Reading CSV file from: ${csvFilePath}`);

const parseCSV = (content) => {
    const lines = content.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length === 0) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];

    for (let i = 1; i < lines.length; i++) {
        const currentLine = lines[i].split(',');
        if (currentLine.length === headers.length) {
            const obj = {};
            for (let j = 0; j < headers.length; j++) {
                obj[headers[j]] = currentLine[j].trim();
            }
            data.push(obj);
        } else {
            console.warn(`Skipping malformed line ${i + 1}: ${lines[i]}`);
        }
    }
    return data;
};

try {
    const fileContent = fs.readFileSync(csvFilePath, 'utf8');
    const records = parseCSV(fileContent);

    console.log(`Parsed ${records.length} records.`);

    let successCount = 0;
    let errorCount = 0;

    const uploadData = async () => {
        for (const row of records) {
            try {
                // Use CardNo as the document ID
                const cardNo = row.CardNo;
                if (!cardNo) {
                    console.warn('Skipping row without CardNo:', row);
                    continue;
                }

                await setDoc(doc(db, "cards", cardNo), row);
                successCount++;
                if (successCount % 50 === 0) {
                    console.log(`Uploaded ${successCount} records...`);
                }
            } catch (error) {
                console.error(`Error uploading card ${row.CardNo}:`, error);
                errorCount++;
            }
        }
        console.log(`Upload complete! Success: ${successCount}, Errors: ${errorCount}`);
        process.exit(0);
    };

    uploadData();

} catch (err) {
    console.error("Error reading or processing file:", err);
    process.exit(1);
}
