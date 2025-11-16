import admin from 'firebase-admin';
// We must use 'fs' to read the JSON file since we're in an ES Module
import { readFileSync } from 'fs';

// Read the service account key
// The 'with' syntax is for new Node.js versions
import serviceAccount from '../serviceAccountKey.json' with { type: 'json' };

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Export the initialized Firestore database
export const db = admin.firestore();
console.log('✅ Connected to Firestore');