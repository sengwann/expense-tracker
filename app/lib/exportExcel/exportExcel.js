import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { db } from "../firebase"; // Firestore instance
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const exportToExcel = async (transactions, userId) => {
  if (!transactions || transactions.length === 0) {
    return;
  }

  const fileName = `Expenses_${new Date().toISOString().slice(0, 10)}.xlsx`;

  // Convert transactions to rows
  const headers = ["Date", "Type", "Category", "Amount", "Description"];
  const data = transactions.map((tx) => [
    new Date(tx.date).toLocaleDateString(),
    tx.type,
    tx.category,
    tx.amount,
    tx.description || "N/A",
  ]);

  // Create worksheet
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

  // Auto-size columns
  worksheet["!cols"] = headers.map((_, i) => ({
    wch:
      Math.max(
        headers[i].length,
        ...data.map((row) => (row[i] ? row[i].toString().length : 0))
      ) + 2,
  }));

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

  // Save File
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const dataBlob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(dataBlob, fileName);

  // ✅ Save export history in Firestore
  await addDoc(collection(db, "exportHistory"), {
    userId,
    fileName,
    timestamp: serverTimestamp(),
    recordCount: transactions.length,
  });
};

export default exportToExcel;
