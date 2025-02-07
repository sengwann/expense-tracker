import { auth } from "../../lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export async function POST(req) {
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ success: false, error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  const { email, password } = await req.json();

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    // Successful user creation
    return new Response(
      JSON.stringify({ success: true, data: userCredential.user }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    let errorMessage;

    switch (err.code) {
      case "auth/email-already-in-use":
        errorMessage = "This email is already registered. Try logging in.";
        break;

      case "auth/invalid-email":
        errorMessage = "This email address is not valid.";
        break;

      case "auth/weak-password":
        errorMessage =
          "The password is too weak. Please use a stronger password.";
        break;

      default:
        errorMessage = `An unexpected error occurred: ${err.message}`;
    }

    // Return error response
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }
}
