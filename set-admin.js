// This script requires Firebase Admin SDK
// You'll need to download your service account key from Firebase Console

import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// You need to download your service account key from:
// Firebase Console → Project Settings → Service Accounts → Generate New Private Key
// Save it as 'serviceAccountKey.json' in this directory

const serviceAccountPath = join(__dirname, 'serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

async function setAdminRole() {
  try {
    // Find user by email
    const userRecord = await admin.auth().getUserByEmail('greg@ailtq.com');
    console.log('Found user:', userRecord.uid);
    
    // Set admin role
    await admin.auth().setCustomUserClaims(userRecord.uid, { role: 'Admin' });
    console.log('✅ Successfully set Admin role for greg@ailtq.com');
    
    // Verify the change
    const updatedUser = await admin.auth().getUser(userRecord.uid);
    console.log('Updated user claims:', updatedUser.customClaims);
    
  } catch (error) {
    console.error('❌ Error setting admin role:', error);
  }
  
  process.exit(0);
}

setAdminRole(); 