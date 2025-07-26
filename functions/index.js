const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Automatically assign "Customer" role on new user signup
exports.setCustomerRole = functions.auth.user().onCreate(async (user) => {
  await admin.auth().setCustomUserClaims(user.uid, { role: 'Customer' });
});

// Callable function to update a user's role (admin only)
exports.updateUserRole = functions.https.onCall(async (data, context) => {
  // Check if request is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Request had no authentication.');
  }

  // Check if caller is admin
  const callerUid = context.auth.uid;
  const callerUser = await admin.auth().getUser(callerUid);
  if (!callerUser.customClaims || callerUser.customClaims.role !== 'Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can update user roles.');
  }

  // Validate input
  const { uid, role } = data;
  const allowedRoles = ['Admin', 'Creator', 'Customer'];
  if (!uid || !role || !allowedRoles.includes(role)) {
    throw new functions.https.HttpsError('invalid-argument', 'Invalid uid or role.');
  }

  // Update the user's custom claim
  await admin.auth().setCustomUserClaims(uid, { role });

  return { message: `Role for user ${uid} updated to ${role}.` };
});