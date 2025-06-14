"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import useSWR from "swr";
import { Box, Flex, Heading, Stack, Skeleton } from "@chakra-ui/react";
import Sidebar from "./components/sidebar";
import TransactionForm from "./components/form";
import DisplayBalance from "./components/displayBalance";
import ProtectRoute from "../_Auth/ProtectRoute";
import PaginatedTable from "./components/TableComponents/PaginatedTable";
import { useAuth } from "../_Auth/AuthContext";
import { fetcher } from "@/app/lib/utils/util";
import Chart from "./components/chart";
import MainActions from "./components/MainActions";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    startDate: "",
    endDate: "",
  });
  const [lastDoc, setLastDoc] = useState(""); // Current page cursor
  const [cursorStack, setCursorStack] = useState([""]); // Stack of cursors for prev/next
  const [page, setPage] = useState(1);

  const { user } = useAuth();

  const PAGE_LIMIT = 5;

  const swrResponse = useSWR(
    user?.uid
      ? `${
          process.env.NEXT_PUBLIC_API_BASE_URL
        }/api/transactions?${new URLSearchParams({
          userId: user.uid,
          lastDocId: lastDoc,
          limit: PAGE_LIMIT,
          ...filters,
        })}`
      : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const {
    transactions = [],
    totals = {},
    lastDoc: newLastDoc = null,
    hasMore,
    totalPages = 1,
  } = useMemo(() => swrResponse.data || {}, [swrResponse.data]);

  const isTransactionsLoading = useMemo(
    () => swrResponse.isLoading,
    [swrResponse.isLoading]
  );

  const mutateTransactions = useCallback(() => {
    swrResponse.mutate();
  }, [swrResponse]);

  const memoizedFilters = useMemo(() => filters, [filters]);

  const chartData = useMemo(() => {
    const expense = totals?.totalExpense || 0;
    const income = totals?.totalIncome || 0;
    const expenseByCategory = totals?.expenseByCategory || {};
    const incomeByCategory = totals?.incomeByCategory || {};

    return {
      expense,
      income,
      expenseByCategory,
      incomeByCategory,
      category: filters.category || "",
    };
  }, [totals, filters.category]);

  // Pagination
  const handleNextPage = useCallback(() => {
    if (hasMore && newLastDoc) {
      setCursorStack((prev) => [...prev, newLastDoc]);
      setLastDoc(newLastDoc);
      setPage((p) => p + 1);
    }
  }, [hasMore, newLastDoc]);

  const handlePrevPage = useCallback(() => {
    if (cursorStack.length > 1) {
      setCursorStack((prev) => {
        const newStack = prev.slice(0, -1);
        setLastDoc(newStack[newStack.length - 1]);
        return newStack;
      });
      setPage((p) => Math.max(1, p - 1));
    }
  }, [cursorStack]);

  useEffect(() => {
    setLastDoc("");
    setCursorStack([""]);
    setPage(1);
  }, [memoizedFilters]);

  return (
    <ProtectRoute>
      <Flex direction={{ base: "column", md: "row" }}>
        {/* Sidebar */}
        <Box
          display={{ base: "none", md: "block" }}
          width="300px"
          color="white"
          minHeight="100vh"
          p={5}
          position="fixed"
          top={0}
          left={0}
          bg="#1E3A8A"
        >
          <Sidebar />
        </Box>

        {/* Main content */}
        <Box
          bg="#F3F4F6"
          p={{ base: 4, md: 8 }}
          ml={{ base: 0, md: "300px" }}
          w="full"
        >
          <Heading mb={6} textAlign="center" color="#1E3A8A">
            Welcome to Expense Tracker
          </Heading>

          <DisplayBalance mainTotals={totals} />

          <TransactionForm
            userId={user?.uid}
            mutateTransactions={mutateTransactions}
          />

          {/* Transactions Table */}
          <Stack spacing={4} mb={8}>
            {isTransactionsLoading ? (
              <Skeleton height="300px" />
            ) : (
              <PaginatedTable
                hasMore={hasMore}
                lastDoc={newLastDoc}
                userId={user?.uid}
                isLoading={isTransactionsLoading}
                transactions={transactions}
                mutateTransactions={mutateTransactions}
                onNextPage={handleNextPage}
                onPrevPage={handlePrevPage}
                page={page}
                totalPages={totalPages}
              />
            )}
          </Stack>

          {/* Filters and Actions */}
          <Box mt={6} mb={2} display="flex" justifyContent="center">
            <MainActions
              filters={memoizedFilters}
              setFilters={setFilters}
              transactions={transactions}
              userId={user?.uid}
              mutateTransactions={mutateTransactions}
            />
          </Box>

          <Chart chartData={chartData} />
        </Box>
      </Flex>
    </ProtectRoute>
  );
}
