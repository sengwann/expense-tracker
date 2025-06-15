"use client";

import { useState, memo, useCallback } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormLabel,
  Stack,
  FormControl,
  Input,
  Select,
  Button,
  useToast,
} from "@chakra-ui/react";
import { EditIcon, IconButton } from "@chakra-ui/icons";
import { doc, runTransaction } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  categoryOptions,
  expenseByCategory,
  incomeByCategory,
} from "@/app/lib/utils/util";
import { showToast } from "@/app/lib/utils/util";

function UpdateTransactionModal({
  userId,
  transaction: oldTransaction,
  mutateTransactions,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updatedData, setUpdatedData] = useState(oldTransaction);
  const [loading, setLoading] = useState(false);

  const toast = useToast();

  // Memoize the handleInputChange function to avoid recreating it on every render
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setUpdatedData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const handleUpdate = useCallback(async () => {
    try {
      setLoading(true);
      const { type, category, date, amount } = updatedData;
      if (!type || !category || !date || !amount) {
        showToast("Please fill in all required fields.", "error", toast);
        return;
      }

      if (amount <= 0) {
        showToast("Amount must be greater than 0.", "error", toast);
        return;
      }

      const sameDate = oldTransaction.date === updatedData.date;

      const oldTranRef = doc(
        db,
        "users",
        userId,
        "transactions",
        oldTransaction.id
      );
      const oldTotalRef = doc(
        db,
        "users",
        userId,
        "dailyTotals",
        oldTransaction.date
      );
      const newTotalRef = doc(
        db,
        "users",
        userId,
        "dailyTotals",
        updatedData.date
      );

      await runTransaction(db, async (transaction) => {
        const tranDoc = await transaction.get(oldTranRef);
        if (!tranDoc.exists()) {
          showToast("Transaction does not exist", "error", toast);
          return;
        }

        const oldTotalSnap = await transaction.get(oldTotalRef);
        if (!oldTotalSnap.exists()) {
          showToast("Old totals document missing", "error", toast);
          return;
        }

        const newTotalSnap = sameDate
          ? oldTotalSnap
          : await transaction.get(newTotalRef);

        // Remove old effect
        const oldTotals = { ...oldTotalSnap.data() };
        if (oldTransaction.type === "Expense") {
          oldTotals.totalExpense -= oldTransaction.amount;
          oldTotals.expenseByCategory[oldTransaction.category] =
            (oldTotals.expenseByCategory?.[oldTransaction.category] || 0) -
            oldTransaction.amount;
        } else {
          oldTotals.totalIncome -= oldTransaction.amount;
          oldTotals.incomeByCategory[oldTransaction.category] =
            (oldTotals.incomeByCategory?.[oldTransaction.category] || 0) -
            oldTransaction.amount;
        }
        oldTotals.lastUpdated = Date.now();
        transaction.set(oldTotalRef, oldTotals);

        // Apply new effect
        const newTotals = sameDate
          ? oldTotals
          : {
              ...(newTotalSnap?.data() || {
                totalExpense: 0,
                totalIncome: 0,
                expenseByCategory: {},
                incomeByCategory: {},
              }),
            };

        if (type === "Expense") {
          newTotals.totalExpense += amount;
          newTotals.expenseByCategory[category] =
            (newTotals.expenseByCategory?.[category] || 0) + amount;
        } else {
          newTotals.totalIncome += amount;
          newTotals.incomeByCategory[category] =
            (newTotals.incomeByCategory?.[category] || 0) + amount;
        }
        newTotals.lastUpdated = Date.now();
        transaction.set(newTotalRef, newTotals);

        // Update the transaction
        transaction.update(oldTranRef, updatedData);
      });

      showToast("Transaction updated!", "success", toast);
    } catch (err) {
      showToast(`Error updating transaction: ${err.message}`, "error", toast);
    } finally {
      mutateTransactions();
      onClose();
      setLoading(false);
    }
  }, [updatedData, mutateTransactions, toast, onClose, oldTransaction, userId]);

  return (
    <>
      <IconButton
        icon={<EditIcon />}
        colorScheme="blue"
        bg="#1E3A8A"
        aria-label="Edit transaction"
        onClick={onOpen}
        size="sm"
        _hover={{ bg: "#F97316" }}
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={{ base: "90vw", md: "500px" }} bg="white">
          <ModalHeader bg="#F3F4F6" color="#1E3A8A">
            Edit Transaction
          </ModalHeader>
          <ModalBody>
            <Stack spacing={4}>
              <FormControl>
                <FormLabel color="#374151">Type</FormLabel>
                <Select
                  placeholder="Select Type"
                  size="md"
                  value={updatedData.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setUpdatedData((prevData) => ({
                      ...prevData,
                      type: newType,
                      category: "",
                    }));
                  }}
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel color="#374151">Category</FormLabel>
                <Select
                  name="category"
                  value={updatedData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {categoryOptions(
                    updatedData.type,
                    expenseByCategory,
                    incomeByCategory
                  )}
                </Select>
              </FormControl>

              {/* Date Field */}
              <FormControl>
                <FormLabel color="#374151">Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={
                    updatedData.date
                      ? new Date(updatedData.date).toISOString().split("T")[0]
                      : ""
                  }
                  onChange={handleInputChange}
                />
              </FormControl>

              {/* Amount Field */}
              <FormControl>
                <FormLabel color="#374151">Amount</FormLabel>
                <Input
                  type="number"
                  min={1}
                  name="amount"
                  value={updatedData.amount}
                  onChange={(e) => {
                    const newAmount = e.target.value;
                    setUpdatedData((prevData) => ({
                      ...prevData,
                      amount: +newAmount,
                    }));
                  }}
                />
              </FormControl>

              {/* Description Field */}
              <FormControl>
                <FormLabel color="#374151">Description</FormLabel>
                <Input
                  name="description"
                  value={updatedData.description}
                  onChange={handleInputChange}
                />
              </FormControl>
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              bg="#1E3A8A"
              mr={3}
              onClick={handleUpdate}
              _hover={{ bg: "#F97316" }}
              isLoading={loading}
              loadingText="Saving..."
            >
              Save
            </Button>
            <Button variant="ghost" onClick={onClose} color="#374151">
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}

export default memo(UpdateTransactionModal);
