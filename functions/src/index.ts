import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.createUser = functions.https.onCall(async (data, context) => {
  // Check if the user is an admin
  if (context.auth?.token.role !== 'Admin') {
    throw new functions.https.HttpsError('permission-denied', 'Only admins can create users.');
  }

  const { email, password, role } = data;

  try {
    const userRecord = await admin.auth().createUser({
      email: email,
      password: password,
    });

    await admin.firestore().collection('users').doc(userRecord.uid).set({
      email: email,
      role: role,
    });

    return { result: `Successfully created ${email} as a ${role}.` };
  } catch (error) {
    throw new functions.https.HttpsError('internal', (error as Error).message);
  }
});
