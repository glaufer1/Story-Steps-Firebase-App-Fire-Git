// import { getFirestore, collection, getDocs, writeBatch } from 'firebase/firestore';

// // This script is for one-time use to assign roles to existing users.
// // It is not part of the main application flow.

// const db = getFirestore();
// const usersRef = collection(db, 'users');

// const assignRolesToExistingUsers = async () => {
//   try {
//     const usersSnapshot = await getDocs(usersRef);
//     const batch = writeBatch(db);

//     usersSnapshot.forEach(doc => {
//       const userRef = doc.ref;
//       // Default all existing users to 'Admin'
//       batch.update(userRef, { role: 'Admin' });
//     });

//     await batch.commit();
//     console.log("All existing users have been assigned the 'Admin' role.");

//   } catch (error) {
//     console.error("Error assigning roles: ", error);
//   }
// };
