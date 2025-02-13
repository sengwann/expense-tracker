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
  Input,
} from "@chakra-ui/react";
import {
  FaHome,
  FaCog,
  FaSignOutAlt,
  FaUser,
  FaChartPie,
  FaCamera,
} from "react-icons/fa";
import { auth, db, storage } from "../lib/firebase"; // Import Firestore & Storage
import { signOut } from "firebase/auth";
import { useAuth } from "../_Auth/AuthContext";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useRef, useState } from "react";

export default function Sidebar() {
  const toast = useToast();
  const { user } = useAuth();
  const fileInputRef = useRef(null);
  const [profileImage, setProfileImage] = useState(user?.photoURL || ""); // Store profile image

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
        description: `Error occurred while logging out! ${err.message}`,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  const handleProfileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const storageRef = ref(storage, `profilePictures/${user.uid}`);
    try {
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore user document
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: downloadURL,
      });

      setProfileImage(downloadURL); // Update UI
      toast({
        position: "top",
        description: "Profile picture updated!",
        status: "success",
        duration: 2000,
        isClosable: true,
      });
    } catch (err) {
      toast({
        position: "top",
        description: `Failed to upload image: ${err.message}`,
        status: "error",
        duration: 2000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg="#1E3A8A"
      color="white"
      w={["200px", "300px"]}
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
      <Flex direction="column" align="center" mb={8} position="relative">
        <Avatar size="xl" name={user.email} src={profileImage} />

        {/* Camera Icon Button */}
        <Button
          position="absolute"
          bottom="5px"
          right="5px"
          size="xs"
          bg="gray.700"
          color="white"
          _hover={{ bg: "gray.600" }}
          borderRadius="full"
          onClick={() => fileInputRef.current.click()}
        >
          <Icon as={FaCamera} />
        </Button>

        {/* Hidden File Input */}
        <Input
          type="file"
          accept="image/*"
          hidden
          ref={fileInputRef}
          onChange={handleProfileUpload}
        />

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

      <Button
        leftIcon={<Icon as={FaSignOutAlt} />}
        bg="#F97316"
        color="white"
        _hover={{ bg: "#EA580C" }}
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
    _hover={{ bg: "rgba(255, 255, 255, 0.2)" }}
    p={3}
    borderRadius="md"
    display="flex"
    alignItems="center"
  >
    <Icon as={icon} mr={3} />
    <Text>{label}</Text>
  </Link>
);
