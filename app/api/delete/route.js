import { db } from "../../lib/firebase";
import { doc, deleteDoc } from "firebase/firestore";

export async function POST(req) {
  try {
    const { id } = await req.json();
    if (!id) {
      return new Response(
        JSON.stringify({ success: false, error: "ID is required." }),
        {
          status: 400,
        }
      );
    }

    const docRef = doc(db, "transactions", id);
    await deleteDoc(docRef);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500 }
    );
  }
}
