"use client";

import { memo, useState, useCallback } from "react";
import {
  FormControl,
  Input,
  Select,
  Stack,
  InputGroup,
  InputRightAddon,
  Button,
  useToast,
} from "@chakra-ui/react";
import { doc, runTransaction, collection } from "firebase/firestore";
import { db } from "../../lib/firebase";
import {
  showToast,
  updateExistingTotals,
  initializeNewTotals,
  expenseByCategory,
  incomeByCategory,
  categoryOptions,
} from "../../lib/utils/util";

const TransactionForm = memo(({ userId, mutateTransactions }) => {
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    date: new Date().toLocaleDateString("en-CA"),
    amount: "",
    description: "",
    currencyType: "THB",
  });

  const toast = useToast();

  // Memoize handleChange to prevent recreation on every render
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      // Reset category if type changes
      if (name === "type" && value !== prev.type) {
        return {
          ...prev,
          type: value,
          category: "",
        };
      }
      return {
        ...prev,
        [name]:
          name === "amount"
            ? value === ""
              ? ""
              : Math.max(0, Number(value))
            : value,
      };
    });
  }, []);

  // Memoize handleAdd since it depends on formData and mutateTransactions
  const handleAdd = useCallback(
    async (e) => {
      e.preventDefault();

      if (!formData.type) {
        showToast("Please select a type.", "error", toast);
        return;
      }
      if (!formData.category) {
        showToast("Please select a category.", "error", toast);
        return;
      }
      if (!isValidAmount(formData.amount)) {
        showToast("Please provide a valid amount.", "error", toast);
        return;
      }

      try {
        await processTransaction();
        resetForm();
        showToast("Transaction added!", "success", toast);
      } catch (err) {
        showToast(`Error adding transaction: ${err.message}`, "error", toast);
      } finally {
        mutateTransactions();
      }
    },
    [formData, userId, mutateTransactions, toast]
  );

  // Helper functions
  const isValidAmount = (amount) => {
    return amount && Number(amount) > 0;
  };

  const processTransaction = async () => {
    const tranRef = doc(collection(db, "users", userId, "transactions"));
    const totalRef = doc(db, "users", userId, "dailyTotals", formData.date);
    const amount = Number(formData.amount);

    const newTransaction = {
      ...formData,
      amount,
      id: tranRef.id,
    };

    await runTransaction(db, async (transaction) => {
      const totalSnap = await transaction.get(totalRef);

      transaction.set(tranRef, newTransaction);

      // Update totals document
      if (totalSnap.exists()) {
        updateExistingTotals(
          transaction,
          totalRef,
          totalSnap.data(),
          newTransaction
        );
      } else {
        initializeNewTotals(
          transaction,
          totalRef,
          newTransaction,
          expenseByCategory,
          incomeByCategory
        );
      }
    });
  };

  const resetForm = () => {
    setFormData({
      type: "",
      category: "",
      date: new Date().toISOString().split("T")[0],
      amount: "",
      description: "",
      currencyType: "THB",
    });
  };

  return (
    <form onSubmit={handleAdd}>
      <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
        <FormControl>
          <Select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
          >
            <option value="">Type</option>
            <option value="Income">Income</option>
            <option value="Expense">Expense</option>
          </Select>
        </FormControl>

        <FormControl>
          <Select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
          >
            {categoryOptions(
              formData.type,
              expenseByCategory,
              incomeByCategory
            )}
          </Select>
        </FormControl>

        <FormControl>
          <Input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </FormControl>

        <FormControl>
          <InputGroup width={{ base: "100%", md: "200px" }}>
            <Input
              placeholder="Amount"
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min={0}
            />
            <InputRightAddon p={0}>
              <Select
                border="none"
                size="sm"
                name="currencyType"
                value={formData.currencyType}
                onChange={handleChange}
              >
                <option value="THB">THB</option>
              </Select>
            </InputRightAddon>
          </InputGroup>
        </FormControl>

        <Input
          placeholder="Description"
          name="description"
          value={formData.description}
          onChange={handleChange}
        />

        <Button
          bg="#1E3A8A"
          color="white"
          _hover={{ bg: "#F97316" }}
          w={{ base: "100%", md: "250px" }}
          type="submit"
        >
          Add
        </Button>
      </Stack>
    </form>
  );
});

export default TransactionForm;
