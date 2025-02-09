"use client";

import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Input,
  Select,
  Stack,
  HStack,
  InputRightAddon,
  InputGroup,
  FormControl,
  VStack,
  useToast,
  IconButton,
  TableContainer,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormLabel,
  Skeleton,
} from "@chakra-ui/react";
import Sidebar from "./sidebar";
import {
  collection,
  onSnapshot,
  where,
  query,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { EditIcon, DeleteIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { format } from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { Filters } from "./filter";
import dayjs from "dayjs";
import ProtectedRoute from "../_Auth/ProtectedRoute";
import { useAuth } from "../_Auth/AuthContext";

const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

const getSymbol = (currency) => {
  const symbol = {
    baht: "THB",
    kyats: "MMK",
    usd: "$",
    jpy: "JPY",
  };

  return symbol[currency];
};

const TransactionsTable = ({ transactions, Toast, loading }) => {
  const handleUpdate = async (id, updateData) => {
    try {
      const transactionRef = doc(db, "transactions", id);

      // Use updateDataFilter instead of updateData
      await updateDoc(transactionRef, updateData);

      Toast("top", "Updated transaction successfully!", "success", 3000, true);
    } catch (err) {
      let errorMessage = "An error occurred while updating the transaction.";
      switch (err.code) {
        case "permission-denied":
          errorMessage =
            "You do not have permission to update this transaction.";
          break;
        case "not-found":
          errorMessage = "The transaction does not exist.";
          break;
        default:
          errorMessage = `An unexpected error occurred: ${err.message}`;
      }

      Toast("top", errorMessage, "error", 3000, true); // Fixed status
    }
  };

  const handleDelete = async (id) => {
    try {
      const transactionRef = doc(db, "transactions", id);

      // Delete the transaction
      await deleteDoc(transactionRef);

      Toast("top", "Transaction deleted successfully!", "success", 3000, true);
    } catch (err) {
      let errorMessage = "An error occurred while deleting the transaction.";
      switch (err.code) {
        case "permission-denied":
          errorMessage =
            "You do not have permission to delete this transaction.";
          break;
        case "not-found":
          errorMessage = "The transaction does not exist.";
          break;
        default:
          errorMessage = `An unexpected error occurred: ${err.message}`;
      }

      Toast("top", errorMessage, "error", 3000, true);
    }
  };

  return (
    <TableContainer
      height="300px"
      overflowX="auto" // Enables horizontal scroll on small screens
    >
      <Table variant="simple" mb={8} size="sm">
        <Thead bg="gray.200" position="sticky" top="0" zIndex="1">
          <Tr>
            <Th color="#1E3A8A">Date</Th>
            <Th color="#1E3A8A">Type</Th>
            <Th color="#1E3A8A">Category</Th>
            <Th color="#1E3A8A">Description</Th>
            <Th isNumeric color="#1E3A8A">
              Amount
            </Th>
            <Th color="#1E3A8A">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {loading
            ? Array(5)
                .fill(0)
                .map((_, index) => (
                  <Tr key={index}>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="60px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="120px" />
                    </Td>
                    <Td isNumeric>
                      <Skeleton height="20px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="60px" />
                    </Td>
                  </Tr>
                ))
            : transactions.map((transaction, index) => (
                <Tr key={transaction.id}>
                  <Td>{format(new Date(transaction.date), "yyyy-MM-dd")}</Td>
                  <Td>
                    <Badge
                      colorScheme={
                        transaction.type === "Income" ? "green" : "red"
                      }
                    >
                      {transaction.type}
                    </Badge>
                  </Td>
                  <Td>{transaction.category}</Td>
                  <Td maxW="200px" isTruncated>
                    {transaction.description}
                  </Td>
                  <Td isNumeric>
                    {transaction.amount} {getSymbol(transaction.currencyType)}
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      {/* Update Button */}
                      <UpdateTransactionModal
                        transaction={transaction}
                        onUpdate={handleUpdate}
                      />
                      {/* Delete Button */}
                      <IconButton
                        icon={<DeleteIcon />}
                        colorScheme="red"
                        aria-label="Delete transaction"
                        onClick={() => handleDelete(transaction.id)}
                        size="sm"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
};
const PaginatedTable = ({
  transactions,
  page,
  setPage,
  Toast,
  setTransactions,
  loading,
}) => {
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);

  const displayedTransactions = transactions.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  return (
    <Box>
      <TransactionsTable
        transactions={displayedTransactions}
        setTransactions={setTransactions}
        Toast={Toast}
        loading={loading}
      />

      {/* Pagination Controls */}
      <Box
        mt={1}
        display="flex"
        justifyContent="center"
        alignItems="center"
        gap={{ base: 3, md: 4 }} // More spacing on mobile
      >
        <IconButton
          icon={<ChevronLeftIcon />}
          aria-label="Previous page"
          isDisabled={page === 1}
          onClick={() => setPage(page - 1)}
          size={{ base: "sm", md: "md" }} // Smaller on mobile
        />

        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="bold">
          Page {page} of {totalPages}
        </Text>

        <IconButton
          icon={<ChevronRightIcon />}
          aria-label="Next page"
          isDisabled={page === totalPages}
          onClick={() => setPage(page + 1)}
          size={{ base: "sm", md: "md" }}
        />
      </Box>
    </Box>
  );
};

const getDefaultDateRange = () => {
  const startOfMonth = dayjs().startOf("month").toISOString();
  const endOfMonth = dayjs().endOf("month").toISOString();
  return [{ startDate: startOfMonth, endDate: endOfMonth, key: "selection" }];
};

const filterLogic = (transaction, filters) => {
  const { type, category, dateRange } = filters;

  // Parse transaction date for comparison
  const transactionDate = new Date(transaction.date);

  const isWithinDateRange =
    transactionDate >= new Date(dateRange[0].startDate) &&
    transactionDate <= new Date(dateRange[0].endDate);

  const matchesType = type === "" || transaction.type === type;
  const matchesCategory = category === "" || transaction.category === category;

  return isWithinDateRange && matchesType && matchesCategory;
};

export default function Dashboard() {
  const [formData, setFormData] = useState({
    type: "Expense",
    category: "Food",
    date: new Date().toISOString().split("T")[0],
    amount: 1,
    description: "",
    currencyType: "baht",
  });

  const [transactions, setTransactions] = useState([]);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    dateRange: getDefaultDateRange(),
  });

  const [displayValue, setDisplayValue] = useState({
    start: new Date().toLocaleDateString(),
    end: new Date().toLocaleDateString(),
  });

  const [loading, setLoading] = useState(true);
  const [addloading, setAddLoading] = useState(false);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [netBalance, setNetBalance] = useState(0);
  const [foodExpense, setFoodExpense] = useState(0);
  const [healthExpense, setHealthExpense] = useState(0);
  const [clothesExpense, setClothesExpense] = useState(0);
  const [otherExpense, setOtherExpense] = useState(0);
  const [skinCareExpense, setSkinCareExpense] = useState(0);
  const [transactionType, setTransactionType] = useState("Expense");
  const [categoryType, setCategoryType] = useState("");

  const { user } = useAuth();
  const toast = useToast();

  useEffect(() => {
    if (!user) return;

    const collectionRef = collection(db, "transactions");
    const userTransactionsQuery = query(
      collectionRef,
      where("userId", "==", user.uid)
    );

    const unsubscribe = onSnapshot(
      userTransactionsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTransactions(data);
        setLoading(false);
        // Calculate totals
        const calculateTotal = (data, type) => {
          return data
            .filter((t) => t.type === type)
            .reduce((acc, curr) => acc + curr.amount, 0);
        };

        const calculateCategoryTotal = (data, category) => {
          return data
            .filter((t) => t.category === category)
            .reduce((acc, curr) => acc + curr.amount, 0);
        };

        const income = calculateTotal(data, "Income");
        const expense = calculateTotal(data, "Expense");
        const food = calculateCategoryTotal(data, "food");
        const health = calculateCategoryTotal(data, "health");
        const clothes = calculateCategoryTotal(data, "clothes");
        const other = calculateCategoryTotal(data, "other");
        const skinCare = calculateCategoryTotal(data, "skin care");

        setTotalIncome(income);
        setTotalExpense(expense);
        setNetBalance(income - expense);
        setFoodExpense(food);
        setHealthExpense(health);
        setClothesExpense(clothes);
        setOtherExpense(other);
        setSkinCareExpense(skinCare);
      },
      (error) => {
        toast({
          position: "top",
          title: "Error",
          description: `Failed to fetch transactions,${error.message}`,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    );

    return () => unsubscribe();
  }, [user, toast]);

  const chartOptions = {
    chart: { type: "donut" },
    labels: ["Income", "Expense"],
    colors: ["#2563EB", "#F97316"], // Blue for Income, Orange for Expense
  };

  const categoryChartOptions = {
    chart: { type: "donut" },
    labels: ["Food", "Health", "Skin care", "Clothes", "Other"],
    colors: ["#2563EB", "#F97316", "#9333EA", "#FACC15", "#F43F5E"],
  };

  const incomeExpenseChartData = [totalIncome, totalExpense];
  const categoryChartData = [
    foodExpense,
    healthExpense,
    skinCareExpense,
    clothesExpense,
    otherExpense,
  ];

  const Toast = (position, description, status, duration, isClosable) => {
    toast({
      position,
      description,
      status,
      duration,
      isClosable,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleAdd = async (e) => {
    e.preventDefault();

    // Form validation
    if (formData.amount <= 0) {
      Toast(
        "top",
        "Please provide a valid amount and description.",
        "error",
        3000,
        true
      );
      return;
    }

    setAddLoading(true);

    if (!user) {
      setAddLoading(false);
      Toast("top", "User is not authenticated.", "error", 3000, true);
      return;
    }

    try {
      // Add transaction to Firestore
      await addDoc(collection(db, "transactions"), {
        ...formData,
        userId: user.uid, // Associate the transaction with the authenticated user
        createdAt: new Date().toISOString(), // Add a timestamp
      });
      setAddLoading(false);
      // Reset form
      setFormData({
        type: "",
        category: "",
        currencyType: "baht",
        amount: 1,
        date: new Date().toISOString().split("T")[0],
        description: "",
      });

      // Show success message
      Toast("top", "Expense has been added!", "success", 3000, true);
    } catch (err) {
      setAddLoading(false);
      let errorMessage = "An error occurred while adding the expense.";

      // Handle specific Firestore errors
      switch (err.code) {
        case "permission-denied":
          errorMessage =
            "You do not have permission to perform this operation.";
          break;
        case "unauthenticated":
          errorMessage = "You must be logged in to add a transaction.";
          break;
        case "invalid-argument":
          errorMessage = "The data provided is invalid.";
          break;
        case "resource-exhausted":
          errorMessage = "Quota exceeded. Try again later.";
          break;
        case "unavailable":
          errorMessage = "Firestore service is currently unavailable.";
          break;
        default:
          errorMessage = `An unexpected error occurred: ${err.message}`;
      }

      // Show error message
      Toast("top", errorMessage, "error", 3000, true);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <Flex direction={{ base: "column", md: "row" }}>
        {/* Sidebar */}
        <Box
          display={{ base: "none", md: "block" }}
          width="300px"
          maxW="1200px"
          color="white"
          minHeight="100vh"
          p={5}
        >
          <Sidebar />
        </Box>

        {/* Main Content */}
        <Box bg="#F3F4F6" p={8} ml={{ base: 0, md: "60px" }} w="full">
          <Heading mb={6} textAlign="center" color="#1E3A8A">
            Welcome to Expense Tracker
          </Heading>

          {/* Top Section */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
            <Stat bg="#D1FAE5" p={4} borderRadius="md">
              <StatLabel color="#047857">Total Income</StatLabel>
              <StatNumber color="#10B981">${totalIncome.toFixed(2)}</StatNumber>
            </Stat>
            <Stat bg="#FECACA" p={4} borderRadius="md">
              <StatLabel color="#B91C1C">Total Expense</StatLabel>
              <StatNumber color="#EF4444">
                ${totalExpense.toFixed(2)}
              </StatNumber>
            </Stat>
            <Stat bg="#DBEAFE" p={4} borderRadius="md">
              <StatLabel color="#1E40AF">Balance</StatLabel>
              <StatNumber color="#2563EB">${netBalance.toFixed(2)}</StatNumber>
            </Stat>
          </SimpleGrid>

          {/* Transaction Form */}
          <form onSubmit={handleAdd}>
            <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={4}>
              <FormControl>
                <Select
                  placeholder="Select Type"
                  size="md"
                  value={formData.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setFormData({ ...formData, type: newType });
                    setTransactionType(newType);
                  }}
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>

              <FormControl>
                <Select
                  placeholder="Select category"
                  size="md"
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  {transactionType === "Expense" ? (
                    <>
                      <option value="food">Food</option>
                      <option value="skin care">Skin care</option>
                      <option value="clothes">Clothes</option>
                      <option value="health">Health</option>
                      <option value="other">Other</option>
                    </>
                  ) : (
                    <>
                      <option value="salary">Salary</option>
                      <option value="get bonus">Get bonus</option>
                    </>
                  )}
                </Select>
              </FormControl>

              {/* Other Form Inputs */}
              <FormControl>
                <Input
                  type="date"
                  size="md"
                  name="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  onChange={handleInputChange}
                />
              </FormControl>
              <FormControl>
                <InputGroup width={{ base: "100%", md: "200px" }}>
                  <Input
                    placeholder="Amount"
                    type="number"
                    required
                    value={formData.amount}
                    onChange={(e) => {
                      const newAmount = e.target.value;
                      setFormData({ ...formData, amount: +newAmount });
                    }}
                  />
                  <InputRightAddon p={0}>
                    <Select
                      border="none"
                      size="sm"
                      name="currencyType"
                      value={formData.currencyType}
                      onChange={handleInputChange}
                    >
                      <option value="baht">THB</option>
                      <option value="kyats">MMK</option>
                      <option value="usd">USD</option>
                      <option value="jpy">JPY</option>
                    </Select>
                  </InputRightAddon>
                </InputGroup>
              </FormControl>
              <Input
                placeholder="Description"
                size="md"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
              <Button
                bg="#1E3A8A"
                color="white"
                _hover={{ bg: "#F97316" }}
                w={{ base: "100%", md: "250px" }}
                isLoading={addloading}
                type="submit"
              >
                Add
              </Button>
            </Stack>
          </form>

          {/* Filter and Table */}
          <Stack spacing={4} mb={8}>
            <PaginatedTable
              transactions={transactions
                .filter((txn) => filterLogic(txn, filters))
                .sort((a, b) => new Date(a.date) - new Date(b.date))}
              setTransactions={setTransactions}
              Toast={Toast}
              page={page}
              setPage={setPage}
              loading={loading}
            />
            <Filters
              transactions={transactions}
              filterLogic={filterLogic}
              filters={filters}
              setFilters={setFilters}
              displayValue={displayValue}
              setDisplayValue={setDisplayValue}
              categoryType={categoryType}
              setCategoryType={setCategoryType}
              totalIncome={totalIncome}
              totalExpense={totalExpense}
              setTotalIncome={setTotalIncome}
              setTotalExpense={setTotalExpense}
              setFoodExpense={setFoodExpense}
              setHealthExpense={setHealthExpense}
              setNetBalance={setNetBalance}
              setOtherExpense={setOtherExpense}
              setSkinCareExpense={setSkinCareExpense}
              setClothesExpense={setClothesExpense}
            />
          </Stack>

          {/* Charts Section */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justifyContent="space-evenly"
          >
            <VStack width={{ base: "100%", md: "50%" }}>
              <Heading size="md" mb={4} color="#1E3A8A">
                Expense Breakdown
              </Heading>
              <Box bg="white" p={4} borderRadius="md" w="100%">
                <Chart
                  options={chartOptions}
                  series={incomeExpenseChartData}
                  type="donut"
                  width="100%"
                />
              </Box>
            </VStack>
            <VStack width={{ base: "100%", md: "50%" }}>
              <Heading size="md" mb={4} color="#1E3A8A">
                Category Breakdown
              </Heading>
              <Box bg="white" p={4} borderRadius="md" w="100%">
                <Chart
                  options={categoryChartOptions}
                  series={categoryChartData}
                  type="donut"
                  width="100%"
                />
              </Box>
            </VStack>
          </Flex>
        </Box>
      </Flex>
    </ProtectedRoute>
  );
}

function UpdateTransactionModal({ transaction, onUpdate }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updatedData, setUpdatedData] = useState(transaction);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData({ ...updatedData, [name]: value });
  };

  const handleSubmit = async () => {
    await onUpdate(transaction.id, updatedData);
    onClose();
  };

  return (
    <>
      {/* Open Edit Modal Button */}
      <IconButton
        icon={<EditIcon />}
        colorScheme="blue"
        bg="#1E3A8A" // Modern blue color
        aria-label="Edit transaction"
        onClick={onOpen}
        size="sm"
        _hover={{ bg: "#F97316" }} // Orange on hover for the button
      />

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent maxWidth={{ base: "90vw", md: "500px" }} bg="white">
          <ModalHeader bg="#F3F4F6" color="#1E3A8A">
            Edit Transaction
          </ModalHeader>{" "}
          {/* Light gray background with modern blue header */}
          <ModalBody>
            <Stack spacing={4}>
              {/* Type Field */}
              <FormControl>
                <FormLabel color="#374151">Type</FormLabel>{" "}
                {/* Dark gray for text */}
                <Select
                  placeholder="Select Type"
                  size="md"
                  value={updatedData.type}
                  onChange={(e) => {
                    const newType = e.target.value;
                    setUpdatedData({
                      ...updatedData,
                      type: newType,
                      category: "",
                    });
                    setTransactionType(newType);
                  }}
                >
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>

              {/* Category Field */}
              <FormControl>
                <FormLabel color="#374151">Category</FormLabel>
                <Select
                  name="category"
                  value={updatedData.category}
                  onChange={handleInputChange}
                >
                  <option value="">Select Category</option>
                  {updatedData.type === "Income" ? (
                    <>
                      <option value="salary">Salary</option>
                      <option value="get bonus">Get bonus</option>
                    </>
                  ) : (
                    <>
                      <option value="food">Food</option>
                      <option value="clothes">Clothes</option>
                      <option value="health">Health</option>
                      <option value="other">Other</option>
                    </>
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
                    setUpdatedData({ ...updatedData, amount: +newAmount });
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
              onClick={handleSubmit}
              _hover={{ bg: "#F97316" }}
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
