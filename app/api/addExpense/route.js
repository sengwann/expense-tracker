import { db } from "../../lib/firebase";
import { addDoc, collection } from "firebase/firestore";
import { admin } from "@/app/lib/firebaseAdmin";

export async function POST(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    const token = req.headers.get("Authorization")?.split("Bearer ")[1]; // Extract token

    if (!token) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized - No token provided",
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Verify Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(token);

    const userId = decodedToken.uid; // Get userId from verified token

    const data = await req.json(); // Parse the request body

    if (data.userId !== userId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Unauthorized - User mismatch",
        }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // 🔹 Add transaction to Firestore
    const docRef = await addDoc(collection(db, "transactions"), {
      ...data,
      userId, // Ensure userId is securely set
      createdAt: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ success: true, data: docRef.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);
    let errorMessage = "Unknown error";

    switch (err.code) {
      case "permission-denied":
        errorMessage = "You do not have permission to perform this operation.";
        break;
      case "unauthenticated":
        errorMessage = "You must be logged in to add a transaction.";
        break;
      case "invalid-argument":
        errorMessage = "The data provided is invalid.";
        break;
      case "resource-exhausted":
        errorMessage = "Quota exceeded. Try again later.";
        break;
      case "unavailable":
        errorMessage = "Firestore service is currently unavailable.";
        break;
      default:
        errorMessage = `An unexpected error occurred: ${err.message}`;
    }

    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
