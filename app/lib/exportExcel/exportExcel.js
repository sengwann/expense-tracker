import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const exportToExcel = async (userId, filters) => {
  // Fetch transactions based on filters
  const transactionsResponse = await fetch(
    `/api/transactions/exportToExcel?userId=${userId}&type=${
      filters.type || ""
    }&category=${filters.category || ""}&startDate=${
      filters.startDate || ""
    }&endDate=${filters.endDate || ""}`
  );
  const transactionsJson = await transactionsResponse.json();
  const transactions = transactionsJson.transactions || [];

  if (!transactions.length) {
    alert("No transactions found for export.");
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
};

export default exportToExcel;
