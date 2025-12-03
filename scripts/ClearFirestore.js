// ClearFirestore.js
// Delete all documents in the 'cards' collection

const admin = require('firebase-admin');
const fs = require('fs');

// Configuration
const CONFIG = {
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

// Delete all documents in a collection
async function deleteCollection(db, collectionPath, batchSize = 500) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(db, query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(db, query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        // When there are no documents left, we are done
        resolve();
        return;
    }

    // Delete documents in a batch
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    log(`Deleted ${batchSize} documents`);

    // Recurse on the next process tick, to avoid
    // exploding the stack.
    process.nextTick(() => {
        deleteQueryBatch(db, query, resolve);
    });
}

// Main function
async function clearFirestore() {
    try {
        log('=========================================');
        log('Starting Firestore cleanup process');
        log('=========================================');

        // Check if service account file exists
        if (!fs.existsSync(CONFIG.serviceAccountPath)) {
            log(`ERROR: Service account file not found at ${CONFIG.serviceAccountPath}`);
            process.exit(1);
        }

        log(`Service account file found: ${CONFIG.serviceAccountPath}`);

        // Initialize Firebase Admin SDK
        log('Initializing Firebase Admin SDK...');
        const serviceAccount = require(CONFIG.serviceAccountPath);

        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        const db = admin.firestore();
        log('Firebase Admin SDK initialized successfully');

        // Delete all documents in the collection
        log(`Deleting all documents in collection '${CONFIG.collectionName}'...`);
        await deleteCollection(db, CONFIG.collectionName);

        log('=========================================');
        log('Cleanup completed successfully!');
        log('All documents have been deleted.');
        log('=========================================');

        process.exit(0);

    } catch (error) {
        log(`FATAL ERROR: ${error.message}`);
        log(`Stack trace: ${error.stack}`);
        process.exit(1);
    }
}

// Run the cleanup
clearFirestore();
