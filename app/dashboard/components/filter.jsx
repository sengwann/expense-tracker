"use client";

import { useState, memo, useCallback, useMemo } from "react";
import {
  Button,
  Select,
  FormControl,
  FormLabel,
  VStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Stack,
} from "@chakra-ui/react";
import {
  expenseByCategory,
  incomeByCategory,
  categoryOptions,
} from "@/app/lib/utils/util";

const Filters = memo(({ filters, setFilters }) => {
  // Initialize tempFilters with current filters
  const [tempFilters, setTempFilters] = useState(() => ({
    type: filters.type || "",
    category: filters.category || "",
    startDate: filters.startDate || "",
    endDate: filters.endDate || "",
  }));

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Memoize openModal since it's passed to Button onClick
  const openModal = useCallback(() => {
    setTempFilters({
      type: filters.type || "",
      category: filters.category || "",
      startDate: filters.startDate || "",
      endDate: filters.endDate || "",
    });
    setIsModalOpen(true);
  }, [filters]);

  // Memoize closeModal since it's passed to multiple onClick handlers
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  // Memoize applyFilters since it depends on tempFilters and setFilters
  const applyFilters = useCallback(() => {
    setFilters(tempFilters);
    setIsModalOpen(false);
  }, [tempFilters, setFilters]);

  // Memoize filter change handler
  const handleTempFilterChange = useCallback((field, value) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  // Memoize category options to prevent recalculation
  const categoryOption = useMemo(() => {
    const showAll = tempFilters.type === "";
    const showExpense = showAll || tempFilters.type === "Expense";
    const showIncome = showAll || tempFilters.type === "Income";

    return [
      <option key="select-category" value="">
        Select category
      </option>,
      ...(!showAll && showExpense
        ? categoryOptions("Expense", expenseByCategory, incomeByCategory)
        : []),
      ...(!showAll && showIncome
        ? categoryOptions("Income", expenseByCategory, incomeByCategory)
        : []),
    ];
  }, [tempFilters.type]);

  // Clear filters handler
  const handleClear = () => {
    setTempFilters({
      type: "",
      category: "",
      startDate: "",
      endDate: "",
    });
    setFilters({
      type: "",
      category: "",
      startDate: "",
      endDate: "",
    });
  };

  return (
    <>
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        <Button
          colorScheme="teal"
          w={{ base: "100%", md: "250px" }}
          onClick={openModal}
        >
          Open Filters
        </Button>
      </Stack>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Set Filters</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Type</FormLabel>
                <Select
                  value={tempFilters.type}
                  onChange={(e) =>
                    handleTempFilterChange("type", e.target.value)
                  }
                >
                  <option value="">All</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Category</FormLabel>
                <Select
                  value={tempFilters.category}
                  onChange={(e) =>
                    handleTempFilterChange("category", e.target.value)
                  }
                >
                  {categoryOption}
                </Select>
              </FormControl>

              <FormControl>
                <FormLabel>Start Date</FormLabel>
                <Input
                  type="date"
                  value={tempFilters.startDate}
                  onChange={(e) =>
                    handleTempFilterChange("startDate", e.target.value)
                  }
                />
              </FormControl>

              <FormControl>
                <FormLabel>End Date</FormLabel>
                <Input
                  type="date"
                  value={tempFilters.endDate}
                  onChange={(e) =>
                    handleTempFilterChange("endDate", e.target.value)
                  }
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="teal" mr={3} onClick={applyFilters}>
              Apply Filters
            </Button>
            <Button
              variant="outline"
              mr={3}
              onClick={() => {
                handleClear();
              }}
            >
              Clear Filter
            </Button>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

export default Filters;
