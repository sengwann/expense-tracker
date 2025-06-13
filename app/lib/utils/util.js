export const expenseByCategory = ["food", "shopping", "health", "other"];
export const incomeByCategory = ["salary", "gift", "investment", "bonus"];

export const categoryOptions = (type, expenseByCategory, incomeByCategory) => {
  return [
    <option key="select-category" value="">
      Category
    </option>,
    ...(type === "Expense" ? expenseByCategory : incomeByCategory).map(
      (cat) => (
        <option key={cat} value={cat.toLowerCase()}>
          {cat.charAt(0).toUpperCase() + cat.slice(1)}
        </option>
      )
    ),
  ];
};

export const getSymbol = (currency) =>
  ({
    baht: "THB",
    kyats: "MMK",
    usd: "$",
    jpy: "JPY",
  }[currency] || "$");

export const showToast = (description, status, toast) => {
  toast({
    position: "top",
    description,
    status,
    duration: 3000,
    isClosable: true,
  });
};

export const fetcher = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
};

export const updateExistingTotals = (
  transaction,
  totalRef,
  totalsData,
  newTransaction
) => {
  const { type, category, amount } = newTransaction;
  const updatedTotals = { ...totalsData };

  if (type === "Expense") {
    updatedTotals.totalExpense += amount;
    updatedTotals.expenseByCategory[category] =
      (updatedTotals.expenseByCategory?.[category] || 0) + amount;
  } else if (type === "Income") {
    updatedTotals.totalIncome += amount;
    updatedTotals.incomeByCategory[category] =
      (updatedTotals.incomeByCategory?.[category] || 0) + amount;
  }

  transaction.set(totalRef, updatedTotals);
};

export const initializeNewTotals = (
  transaction,
  totalRef,
  newTransaction,
  expenseByCategory = [],
  incomeByCategory = []
) => {
  const { type, category, amount, date } = newTransaction;
  const isIncome = type === "Income";

  const newTotals = {
    totalExpense: isIncome ? 0 : amount,
    totalIncome: isIncome ? amount : 0,
    incomeByCategory: incomeByCategory.reduce((acc, cat) => {
      acc[cat] = isIncome && category === cat ? amount : 0;
      return acc;
    }, {}),
    expenseByCategory: expenseByCategory.reduce((acc, cat) => {
      acc[cat] = !isIncome && category === cat ? amount : 0;
      return acc;
    }, {}),
    date,
  };

  transaction.set(totalRef, newTotals);
};

export function getCategoryAndTotal(type) {
  return {
    total: type === "Expense" ? "totalExpense" : "totalIncome",
    category: type === "Expense" ? "expenseByCategory" : "incomeByCategory",
  };
}

function isValidData(data) {
  return data && data.type && data.category && typeof data.amount === "number";
}
export const updateTotals = (oldData, newData, totals, getCategoryAndTotal) => {
  // Ensure type and category are valid
  if (!isValidData(oldData) || !isValidData(newData)) {
    throw new Error("Invalid data format");
  }

  const updatedTotals = { ...totals };
  const isTypeEqual = newData.type === oldData.type;
  const isCategoryEqual = newData.category === oldData.category;

  const { total: newTotal, category: newCategory } = getCategoryAndTotal(
    newData.type
  );

  if (isTypeEqual) {
    // Update the type total
    updatedTotals[newTotal] =
      updatedTotals[newTotal] - oldData.amount + newData.amount;

    // Update the categories
    updatedTotals[newCategory] = {
      ...updatedTotals[newCategory],
      [oldData.category]: isCategoryEqual
        ? updatedTotals[newCategory][oldData.category] -
          oldData.amount +
          newData.amount
        : updatedTotals[newCategory][oldData.category] - oldData.amount,
    };

    if (!isCategoryEqual) {
      updatedTotals[newCategory][newData.category] =
        (updatedTotals[newCategory][newData.category] || 0) + newData.amount;
    }
  } else {
    // Handle type change
    const { total: oldTotal, category: oldCategory } = getCategoryAndTotal(
      oldData.type
    );

    // Update old type total
    updatedTotals[oldTotal] = updatedTotals[oldTotal] - oldData.amount;

    // Update new type total
    updatedTotals[newTotal] = (updatedTotals[newTotal] || 0) + newData.amount;

    // Update old category
    updatedTotals[oldCategory] = {
      ...updatedTotals[oldCategory],
      [oldData.category]:
        updatedTotals[oldCategory][oldData.category] - oldData.amount,
    };

    // Update new category
    updatedTotals[newCategory] = {
      ...updatedTotals[newCategory],
      [newData.category]:
        (updatedTotals[newCategory]?.[newData.category] || 0) + newData.amount,
    };
  }

  return updatedTotals;
};

// ✅ Check if the date string is valid (YYYY-MM-DD)
export function isValidDate(dateString) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(dateString);
}

// ✅ Set time to end of the day (23:59:59.999)
export function getEndOfDay(dateString) {
  const date = new Date(dateString);
  date.setHours(23, 59, 59, 999);
  return date;
}

export function initializeDefaultTotals(
  expenseByCategory = [],
  incomeByCategory = []
) {
  const defaultTotals = {
    totalExpense: 0,
    totalIncome: 0,
    expenseByCategory: expenseByCategory.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {}),
    incomeByCategory: incomeByCategory.reduce((acc, cat) => {
      acc[cat] = 0;
      return acc;
    }, {}),
  };

  return defaultTotals;
}
