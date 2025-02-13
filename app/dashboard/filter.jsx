"use client";

import {
  Button,
  Select,
  Stack,
  PopoverContent,
  PopoverTrigger,
  Popover,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { DateRange } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { useAuth } from "../_Auth/AuthContext";
import exportToExcel from "../lib/exportExcel/exportExcel";

export const Filters = ({
  filters,
  setFilters,
  displayValue,
  setDisplayValue,
  categoryType,
  setCategoryType,
  transactions,
  setTotalIncome,
  setTotalExpense,
  setNetBalance,
  filterLogic,
  setOtherExpense,
  setSkinCareExpense,
  setClothesExpense,
  setHealthExpense,
  setFoodExpense,
}) => {
  const { user } = useAuth();
  const [fileredData, setFileredData] = useState(transactions);

  useEffect(() => {
    if (!user) return;
    setFileredData(transactions);
  }, [transactions, user]);

  const calculateTotals = (filteredTransactions) => {
    const income = filteredTransactions
      .filter((t) => t.type === "Income")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const expense = filteredTransactions
      .filter((t) => t.type === "Expense")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const food = filteredTransactions
      .filter((t) => t.category === "food")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const health = filteredTransactions
      .filter((t) => t.category === "health")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const clothes = filteredTransactions
      .filter((t) => t.category === "clothes")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const skinCare = filteredTransactions
      .filter((t) => t.category === "skin care")
      .reduce((acc, curr) => acc + curr.amount, 0);

    const other = filteredTransactions
      .filter((t) => t.category === "other")
      .reduce((acc, curr) => acc + curr.amount, 0);

    return {
      income,
      expense,
      netBalance: income - expense,
      food,
      health,
      clothes,
      skinCare,
      other,
    };
  };

  const handleSelect = (ranges) => {
    const newDateRange = [ranges.selection];
    setFilters({
      ...filters,
      dateRange: newDateRange,
    });

    setDisplayValue({
      start: ranges.selection.startDate.toLocaleDateString(),
      end: ranges.selection.endDate.toLocaleDateString(),
    });

    const filteredTransactions = transactions.filter((transaction) =>
      filterLogic(transaction, { ...filters, dateRange: newDateRange })
    );
    setFileredData(filteredTransactions);
    const total = calculateTotals(filteredTransactions);
    setTotalIncome(total.income);

    setTotalExpense(total.expense);
    setNetBalance(total.netBalance);
    setFoodExpense(total.food);
    setHealthExpense(total.health);
    setClothesExpense(total.clothes);
    setSkinCareExpense(total.skinCare);
    setOtherExpense(total.other);
  };

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      spacing={{ base: 2, md: 4 }}
      mb={8}
      justifyContent="flex-end"
    >
      <Button
        bg="#1E3A8A"
        color="white"
        _hover={{ bg: "#F97316" }}
        w={{ base: "100%", md: "250px" }}
        onClick={() => exportToExcel(fileredData, user.uid)}
      >
        Export to Excel
      </Button>
      {/* Date Range Filter */}
      <Box>
        <Popover>
          <PopoverTrigger>
            <Button
              w={{ base: "100%", md: "250px" }}
              bg="gray.200"
              _hover={{ bg: "gray.300" }}
            >
              {displayValue.start} - {displayValue.end}
            </Button>
          </PopoverTrigger>
          <PopoverContent width="fit-content" p={4}>
            <DateRange
              ranges={filters.dateRange}
              onChange={handleSelect}
              moveRangeOnFirstSelection={false}
            />
          </PopoverContent>
        </Popover>
      </Box>

      {/* Transaction Type Filter */}
      <Select
        placeholder="Filter by transaction type"
        size="md"
        width={{ base: "100%", sm: "40%", md: "20%" }} // Make select boxes take full width on mobile
        onChange={(e) => {
          const newCategoryType = e.target.value;
          setCategoryType(newCategoryType);
          const newFilters = { ...filters, type: newCategoryType };
          setFilters(newFilters);

          const filteredTransactions = transactions.filter((transaction) =>
            filterLogic(transaction, newFilters)
          );
          setFileredData(filteredTransactions);
          const total = calculateTotals(filteredTransactions);
          setTotalIncome(total.income);
          setTotalExpense(total.expense);
          setNetBalance(total.netBalance);
          setFoodExpense(total.food);
          setHealthExpense(total.health);
          setClothesExpense(total.clothes);
          setSkinCareExpense(total.skinCare);
          setOtherExpense(total.other);
        }}
        _hover={{ cursor: "pointer" }}
      >
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
      </Select>

      {/* Category Filter */}
      <Select
        placeholder="Filter by category"
        width={{ base: "100%", sm: "40%", md: "200px" }} // Adjust width for smaller screens
        onChange={(e) => {
          const newCategoryType = e.target.value;
          const newFilters = { ...filters, category: newCategoryType };
          setFilters(newFilters);

          const filteredTransactions = transactions.filter((transaction) =>
            filterLogic(transaction, newFilters)
          );
          setFileredData(filteredTransactions);
          const total = calculateTotals(filteredTransactions);
          setTotalIncome(total.income);
          setTotalExpense(total.expense);
          setNetBalance(total.netBalance);
          setFoodExpense(total.food);
          setHealthExpense(total.health);
          setClothesExpense(total.clothes);
          setSkinCareExpense(total.skinCare);
          setOtherExpense(total.other);
        }}
        _hover={{ cursor: "pointer" }}
      >
        {categoryType === "" ? (
          <option value="">All</option>
        ) : categoryType === "Expense" ? (
          <>
            <option value="food">Food</option>
            <option value="health">Health</option>
            <option value="clothes">Clothes</option>
            <option value="skin care">Skin care</option>
            <option value="other">Other</option>
          </>
        ) : (
          <>
            <option value="salary">Salary</option>
            <option value="get bonus">Get bonus</option>
          </>
        )}
      </Select>
    </Stack>
  );
};
