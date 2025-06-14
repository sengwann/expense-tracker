import { db } from "@/app/lib/firebaseAdmin";
import { NextResponse } from "next/server";
import {
  isValidDate,
  initializeDefaultTotals,
  expenseByCategory,
  incomeByCategory,
} from "@/app/lib/utils/util";
import dayjs from "dayjs";

const today = dayjs();
const firstDay = today.startOf("month");
const lastDay = today.endOf("month");

const calculateTotals = (totalsSnapshot, type, category) => {
  return totalsSnapshot.docs.reduce((acc, cur) => {
    const data = cur.data();

    // Default totals calculation for both Expense and Income
    const addCategoryData = (categoryData, categoryType) => {
      Object.entries(categoryData).forEach(([cat, amount]) => {
        if (categoryType) {
          // If category is provided, just update that one
          if (cat === categoryType) {
            acc[categoryType] += amount || 0;
          }
        } else {
          acc[cat] = (acc[cat] || 0) + amount || 0;
        }
      });
    };

    if (!type) {
      acc.totalExpense += data.totalExpense || 0;
      acc.totalIncome += data.totalIncome || 0;

      addCategoryData(data.expenseByCategory, category);
      addCategoryData(data.incomeByCategory, category);
    } else if (type === "Expense") {
      if (category) {
        acc.totalExpense += data.expenseByCategory[category] || 0;
      } else {
        acc.totalExpense += data.totalExpense || 0;
      }
      addCategoryData(data.expenseByCategory, category);
    } else if (type === "Income") {
      if (category) {
        acc.totalIncome += data.incomeByCategory[category] || 0;
      } else {
        acc.totalIncome += data.totalIncome || 0;
      }
      addCategoryData(data.incomeByCategory, category);
    }

    return acc;
  }, initializeDefaultTotals(expenseByCategory, incomeByCategory));
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId") || null;
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const limit = Number(searchParams.get("limit")) || 5;
    const startDate =
      searchParams.get("startDate") || firstDay.format("YYYY-MM-DD");
    const endDate = searchParams.get("endDate") || lastDay.format("YYYY-MM-DD");
    const lastDocId = searchParams.get("lastDocId") || null;

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
      .collection("transactions")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate)
      .orderBy("date", "desc")
      .limit(limit);

    let totalsQuery = db
      .collection("users")
      .doc(userId)
      .collection("dailyTotals")
      .where("date", ">=", startDate)
      .where("date", "<=", endDate);

    if (type) {
      const byTotal = type === "Expense" ? "totalExpense" : "totalIncome";
      tranQuery = tranQuery.where("type", "==", type);
      totalsQuery = totalsQuery.where(byTotal, ">", 0);

      if (category) {
        tranQuery = tranQuery.where("category", "==", category);
      }
    }

    if (lastDocId) {
      const lastDocSnapshot = await db
        .collection("users")
        .doc(userId)
        .collection("transactions")
        .doc(lastDocId)
        .get();

      if (!lastDocSnapshot.exists) {
        return NextResponse.json({
          status: 400,
          error: "Invalid last document id!",
        });
      }

      // Use the document snapshot, not just the ID
      tranQuery = tranQuery.startAfter(lastDocSnapshot);
    }

    const [tranSnapshot, totalsSnapshot] = await Promise.all([
      tranQuery.get(),
      totalsQuery.get(),
    ]);

    const transactions = tranSnapshot.docs.map((doc) => ({
      ...doc.data(),
    }));

    if (tranSnapshot.empty) {
      return NextResponse.json({
        status: 404,
        error: "No transactions found for the given criteria.",
      });
    }

    const totals = calculateTotals(totalsSnapshot, type, category);

    // Merge category fields into expenseByCategory and incomeByCategory if present
    const mergedExpenseByCategory = { ...(totals.expenseByCategory || {}) };
    const mergedIncomeByCategory = { ...(totals.incomeByCategory || {}) };

    // Add any top-level category fields into the respective objects
    Object.keys(totals).forEach((key) => {
      if (mergedExpenseByCategory.hasOwnProperty(key)) {
        mergedExpenseByCategory[key] = totals[key];
      }
      if (mergedIncomeByCategory.hasOwnProperty(key)) {
        mergedIncomeByCategory[key] = totals[key];
      }
    });

    const hasMore = transactions.length === limit;
    const lastDoc = hasMore ? transactions[transactions.length - 1].id : null;

    return NextResponse.json({
      status: 200,
      transactions,
      totals: {
        ...totals,
        expenseByCategory: mergedExpenseByCategory,
        incomeByCategory: mergedIncomeByCategory,
      },
      lastDoc,
      hasMore,
    });
  } catch (error) {
    return NextResponse.json({
      status: 500,
      error: error.message || "Internal server error. Please try again later.",
    });
  }
}
