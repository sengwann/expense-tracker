"use client";

import {
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { memo } from "react";

const DisplayBalance = memo(({ mainTotals }) => {
  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={8}>
      <Stat bg="#D1FAE5" p={4} borderRadius="md">
        <StatLabel color="#047857">Total Income</StatLabel>
        <StatNumber color="#2563EB">
          {mainTotals?.totalIncome || 0}{" "}
          <Text as="span" color="#2563EB">
            ฿
          </Text>
        </StatNumber>
      </Stat>
      <Stat bg="#FECACA" p={4} borderRadius="md">
        <StatLabel color="#B91C1C">Total Expense</StatLabel>
        <StatNumber color="#EF4444">
          {mainTotals?.totalExpense || 0}{" "}
          <Text as="span" color="#EF4444">
            ฿
          </Text>
        </StatNumber>
      </Stat>
      <Stat bg="#DBEAFE" p={4} borderRadius="md">
        <StatLabel color="#1E40AF">Balance</StatLabel>
        <StatNumber color="#2563EB">
          {(mainTotals?.totalIncome || 0) - (mainTotals?.totalExpense || 0)}{" "}
          <Text as="span" color="#2563EB">
            ฿
          </Text>
        </StatNumber>
      </Stat>
    </SimpleGrid>
  );
});
DisplayBalance.displayName = "DisplayBalance";

export default DisplayBalance;
