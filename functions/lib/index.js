"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
exports.createUser = functions.https.onCall(async (data, context) => {
    var _a;
    // Check if the user is an admin
    if (((_a = context.auth) === null || _a === void 0 ? void 0 : _a.token.role) !== 'Admin') {
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
    }
    catch (error) {
        throw new functions.https.HttpsError('internal', error.message);
    }
});
//# sourceMappingURL=index.js.map