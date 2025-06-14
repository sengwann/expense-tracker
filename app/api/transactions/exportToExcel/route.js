import { db } from "@/app/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import { isValidDate } from "@/app/lib/utils/util";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId") || null;
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const startDate = searchParams.get("startDate") || "";
    const endDate = searchParams.get("endDate") || "";

    if (!userId) {
      return NextResponse.json({ status: 400, error: "User ID is required!" });
    }

    if (startDate && !isValidDate(startDate)) {
      return NextResponse.json({
        status: 400,
        error: "Invalid startDate format. Use YYYY-MM-DD.",
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return NextResponse.json({
        status: 400,
        error: "Invalid endDate format. Use YYYY-MM-DD.",
      });
    }

    // Firestore queries
    let tranQuery = db
      .collection("users")
      .doc(userId)
      .collection("transactions");

    if (type) {
      tranQuery = tranQuery.where("type", "==", type);

      if (category) {
        tranQuery = tranQuery.where("category", "==", category);
      }
    }

    if (startDate) {
      tranQuery = tranQuery.where("date", ">=", startDate);

      if (endDate) {
        tranQuery = tranQuery.where("date", "<=", endDate);
      }
    }

    const transactionsSnapshot = await tranQuery.get();
    const transactions = transactionsSnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    if (transactions.length === 0) {
      return NextResponse.json({
        status: 404,
        error: "No transactions found.",
      });
    }

    return NextResponse.json({
      status: 200,
      transactions,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error.message || "Internal Server Error",
    });
  }
}
