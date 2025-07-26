// Utility script to fix the cities collection
// Run this with: node fix-cities.js

const admin = require('firebase-admin');

// Initialize Firebase Admin
const serviceAccount = require('./serviceAccountKey.json'); // You'll need to download this from Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function fixCities() {
  try {
    console.log('🔧 Starting cities collection fix...');

    // First, let's see what's currently in the cities collection
    const citiesSnapshot = await db.collection('cities').get();
    console.log('📊 Current cities in database:', citiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    // Delete any documents with incorrect structure (like the one with just 'city' field)
    for (const doc of citiesSnapshot.docs) {
      const data = doc.data();
      if (data.city && !data.name) {
        console.log(`🗑️ Deleting incorrect document: ${doc.id}`);
        await doc.ref.delete();
      }
    }

    // Add some test cities with proper structure
    const testCities = [
      { name: 'San Francisco', state: 'CA' },
      { name: 'New York', state: 'NY' },
      { name: 'Chicago', state: 'IL' },
      { name: 'Los Angeles', state: 'CA' },
      { name: 'Miami', state: 'FL' }
    ];

    console.log('➕ Adding test cities...');
    for (const city of testCities) {
      const cityRef = await db.collection('cities').add({
        name: city.name,
        state: city.state,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`✅ Added city: ${city.name}, ${city.state} (ID: ${cityRef.id})`);
    }

    // Verify the cities were added
    const finalSnapshot = await db.collection('cities').get();
    console.log('📊 Final cities in database:', finalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    console.log('✅ Cities collection fix completed!');
  } catch (error) {
    console.error('❌ Error fixing cities:', error);
  } finally {
    process.exit(0);
  }
}

fixCities(); 