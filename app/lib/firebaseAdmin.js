import admin from "firebase-admin";

// Load environment variable
const serviceAccount = process.env.FIREBASE_ADMIN_SDK
  ? JSON.parse(process.env.FIREBASE_ADMIN_SDK)
  : null;

// Ensure the service account object is valid
if (!serviceAccount || !serviceAccount.project_id) {
  throw new Error("Firebase Admin SDK credentials are missing or invalid.");
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export { admin };
