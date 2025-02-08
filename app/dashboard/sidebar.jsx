import {
  Avatar,
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  Link,
  useToast,
  Button,
} from "@chakra-ui/react";
import {
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaChartPie,
} from "react-icons/fa";
import { auth } from "../lib/firebase";
import { signOut } from "firebase/auth";
import { useAuth } from "../_Auth/AuthContext";

export default function Sidebar() {
  const toast = useToast();
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({
        position: "top",
        description: "Logout successfully!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        position: "top",
        description: `Error occure while logout! ${err.message}`,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg="#1E3A8A" // Dark Blue Sidebar
      color="white"
      w={["200px", "300px"]} // Responsive width
      p={4}
      h="100vh"
      position="fixed"
      left="0"
      top="0"
      display="flex"
      flexDirection="column"
      justifyContent="space-between"
    >
      {/* Profile Section */}
      <Flex direction="column" align="center" mb={8}>
        <Avatar size="xl" name={user.email} />
        <Text mt={2} fontSize="lg" fontWeight="bold" textAlign="center">
          {user.email}
        </Text>
      </Flex>

      {/* Navigation Links */}
      <VStack align="start" spacing={4} w="100%">
        <NavItem icon={FaHome} label="Home" href="#" />
        <NavItem icon={FaUser} label="Profile" href={"/profile"} />
        <NavItem icon={FaCog} label="Settings" href="#" />
        <NavItem icon={FaChartPie} label="Reports" href="#" />
      </VStack>

      {/* Logout Button */}
      <Button
        leftIcon={<Icon as={FaSignOutAlt} />}
        bg="#F97316" // Bright Orange Button
        color="white"
        _hover={{ bg: "#EA580C" }} // Darker Orange on Hover
        w="100%"
        onClick={handleLogout}
        mt={6}
      >
        Logout
      </Button>
    </Box>
  );
}
// Reusable Navigation Item Component
const NavItem = ({ icon, label, href }) => (
  <Link
    href={href}
    style={{ textDecoration: "none", width: "100%" }}
    _hover={{ bg: "rgba(255, 255, 255, 0.2)" }} // Subtle white hover effect
    p={3}
    borderRadius="md"
    display="flex"
    alignItems="center"
  >
    <Icon as={icon} mr={3} />
    <Text>{label}</Text>
  </Link>
);
