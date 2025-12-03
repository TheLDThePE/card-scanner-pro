// UploadToFirebase.js
// Upload employee data from Excel to Firebase Firestore using Admin SDK
// Reads directly from Excel to avoid encoding issues

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// Configuration
const CONFIG = {
    excelPath: 'D:\\evacuation-project\\BYE2G\\BYE2G_Master.xlsx',
    serviceAccountPath: 'D:\\evacuation-project\\BYE2G\\ld-evacuation-firebase-adminsdk-fbsvc-e53316bb64.json',
    logPath: 'D:\\evacuation-project\\BYE2G\\firebase_upload_log.txt',
    collectionName: 'cards'
};

// Logging function
function log(message) {
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(CONFIG.logPath, logMessage + '\n', 'utf8');
}

// Convert Excel serial date to readable format
function excelDateToJSDate(serial) {
    if (!serial || typeof serial !== 'number') return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);

    const year = date_info.getUTCFullYear();
    const month = String(date_info.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date_info.getUTCDate()).padStart(2, '0');

    return `${day}/${month}/${year} 00:00:00`;
}

// Main function
async function uploadToFirebase() {
    try {
        log('=========================================');
        log('Starting Firebase upload process');
        log('=========================================');

        // Check if Excel file exists
        if (!fs.existsSync(CONFIG.excelPath)) {
            log(`ERROR: Excel file not found at ${CONFIG.excelPath}`);
            process.exit(1);
        }

        // Check if service account file exists
        if (!fs.existsSync(CONFIG.serviceAccountPath)) {
            log(`ERROR: Service account file not found at ${CONFIG.serviceAccountPath}`);
            process.exit(1);
        }

        log(`Excel file found: ${CONFIG.excelPath}`);
        log(`Service account file found: ${CONFIG.serviceAccountPath}`);

        // Initialize Firebase Admin SDK
        log('Initializing Firebase Admin SDK...');
        const serviceAccount = require(CONFIG.serviceAccountPath);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const db = admin.firestore();
        log('Firebase Admin SDK initialized successfully');

        // Read Excel file
        log('Reading Excel file...');
        const workbook = XLSX.readFile(CONFIG.excelPath, {
            type: 'file',
            cellDates: false, // Keep dates as serial numbers for manual conversion
            cellNF: false,
            cellText: false
        });

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert to JSON with raw values
        const records = XLSX.utils.sheet_to_json(worksheet, {
            raw: false, // Get formatted strings for text
            defval: ''
        });

        const totalRecords = records.length;
        log(`Found ${totalRecords} records in Excel`);

        // Upload records in batches
        let successCount = 0;
        let errorCount = 0;
        const batchSize = 500; // Firestore batch limit

        for (let i = 0; i < records.length; i += batchSize) {
            const batch = db.batch();
            const currentBatch = records.slice(i, Math.min(i + batchSize, records.length));

            for (const row of currentBatch) {
                try {
                    // Use CardNo as document ID (pad with zeros to ensure 10 digits)
                    let cardNo = row.CardNo || row.cardno || '';
                    if (!cardNo) {
                        log(`WARNING: Row ${i + currentBatch.indexOf(row) + 1} has no CardNo, skipping...`);
                        errorCount++;
                        continue;
                    }

                    cardNo = String(cardNo).padStart(10, '0');

                    // Handle Plandate - check if it's a number (Excel serial date)
                    let plandate = row.Plandate || row.plandate || '';
                    if (plandate && !isNaN(plandate)) {
                        // It's an Excel serial date number
                        plandate = excelDateToJSDate(parseFloat(plandate));
                    }

                    // Prepare data
                    const data = {
                        CardNo: cardNo,
                        EmpNo: String(row.EmpNo || row.empno || 'N/A'),
                        Name: String(row.Name || row.name || 'N/A'),
                        GroupCode: String(row.GroupCode || row.groupcode || 'N/A'),
                        ZoneCode: String(row.ZoneCode || row.zonecode || 'N/A'),
                        Department: String(row.Department || row.department || 'N/A'),
                        Telephone: String(row.Telephone || row.telephone || row.Teleplone || row.teleplone || 'N/A'),
                        Emergency_tel: String(row.Emergency_tel || row.emergency_tel || 'N/A'),
                        Phase: String(row.Phase || row.phase || 'N/A'),
                        ScanTime: String(row.ScanTime || row.scantime || 'N/A'),
                        Plandate: plandate || 'N/A',
                        Shift: String(row.Shift || row.shift || 'N/A')
                    };

                    // Add to batch
                    const docRef = db.collection(CONFIG.collectionName).doc(cardNo);
                    batch.set(docRef, data, { merge: true });
                    successCount++;

                } catch (error) {
                    log(`ERROR processing row ${i + currentBatch.indexOf(row) + 1}: ${error.message}`);
                    errorCount++;
                }
            }

            // Commit batch
            try {
                await batch.commit();
                log(`Progress: ${Math.min(i + batchSize, records.length)} / ${totalRecords} records processed...`);
            } catch (error) {
                log(`ERROR committing batch: ${error.message}`);
                errorCount += currentBatch.length;
                successCount -= currentBatch.length;
            }
        }

        log('=========================================');
        log('Upload completed!');
        log(`Total records: ${totalRecords}`);
        log(`Successful: ${successCount}`);
        log(`Failed: ${errorCount}`);
        log('=========================================');

        process.exit(errorCount > 0 ? 1 : 0);

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`);
        log(`Stack trace: ${error.stack}`);
        process.exit(1);
    }
}

// Run the upload
uploadToFirebase();
