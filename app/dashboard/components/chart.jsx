"use client";

import { memo } from "react";
import { Box, Flex, Heading, VStack } from "@chakra-ui/react";
import dynamic from "next/dynamic";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const Chart = memo(({ chartData }) => {
  // Prepare data for Expense vs Income donut
  const expenseIncomeOptions = {
    chart: { type: "donut" },
    labels: ["Income", "Expense"],
    colors: ["#2563EB", "#F97316"], // blue, orange
  };
  const expenseIncomeSeries = [chartData.income || 0, chartData.expense || 0];

  // Prepare data for Expense Category donut
  let expenseCategoryLabels = Object.keys(chartData.expenseByCategory || {});
  let expenseCategorySeries = expenseCategoryLabels.map(
    (cat) => chartData.expenseByCategory[cat] ?? 0
  );

  // Generate a color palette with enough distinct colors for all categories
  const palette = [
    "#2563EB", // blue
    "#F97316", // orange
    "#9333EA", // purple
    "#FACC15", // yellow
    "#F43F5E", // pink
    "#10B981", // green
    "#6366F1", // indigo
    "#F59E42", // amber
    "#0EA5E9", // sky
    "#E11D48", // rose
    "#22D3EE", // cyan
    "#A3E635", // lime
    "#FBBF24", // gold
    "#C026D3", // fuchsia
    "#F472B6", // pink-light
    "#4ADE80", // emerald
    "#FDE68A", // yellow-light
    "#F87171", // red
    "#34D399", // teal
    "#818CF8", // violet
  ];
  const expenseCategoryOptions = {
    chart: { type: "donut" },
    labels: expenseCategoryLabels,
    colors: palette.slice(0, expenseCategoryLabels.length),
  };

  // If filtered by category and no breakdown, show the filtered category as the only slice
  if (
    (!expenseCategoryLabels.length ||
      expenseCategorySeries.every((v) => v === 0)) &&
    chartData.expense > 0 &&
    chartData.category
  ) {
    expenseCategoryLabels = [chartData.category];
    expenseCategorySeries = [chartData.expense];
  }

  const hasCategoryData =
    expenseCategoryLabels.length > 0 &&
    expenseCategorySeries.some((v) => v > 0);

  return (
    <Flex
      direction={{ base: "column", md: "row" }}
      justifyContent="space-evenly"
      mt={8}
      gap={8}
    >
      <VStack width={{ base: "100%", md: "50%" }}>
        <Heading size="md" mb={4} color="#1E3A8A">
          Expense vs Income
        </Heading>
        <Box bg="white" p={4} borderRadius="md" w="100%">
          <ApexChart
            options={expenseIncomeOptions}
            series={expenseIncomeSeries}
            type="donut"
            width="100%"
          />
        </Box>
      </VStack>
      <VStack width={{ base: "100%", md: "50%" }}>
        <Heading size="md" mb={4} color="#1E3A8A">
          Expense Category Breakdown
        </Heading>
        <Box bg="white" p={4} borderRadius="md" w="100%">
          {hasCategoryData ? (
            <ApexChart
              options={expenseCategoryOptions}
              series={expenseCategorySeries}
              type="donut"
              width="100%"
            />
          ) : (
            <Box textAlign="center" color="gray.500">
              No expense category data
            </Box>
          )}
        </Box>
      </VStack>
    </Flex>
  );
});

export default Chart;
