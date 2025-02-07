import { db } from "../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { id, updatedData } = await req.json();

    if (!id || !updatedData) {
      return new Response(
        JSON.stringify({ success: false, error: "ID and data are required." }),
        { status: 400 }
      );
    }

    const docRef = doc(db, "transactions", id);
    await updateDoc(docRef, updatedData);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
