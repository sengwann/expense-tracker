"use client";

import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
  Container,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { useAuth } from "../_Auth/AuthContext";
import { useRouter } from "next/navigation";

const ProfileEdit = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (user) {
      try {
        // Step 1: Re-authenticate the user
        const credential = EmailAuthProvider.credential(email, oldPassword);
        await reauthenticateWithCredential(user, credential);

        // Step 2: Update password
        if (newPassword) {
          await updatePassword(user, newPassword);
          setOldPassword("");
          setNewPassword("");
          toast({
            position: "top",
            description: "Password updated successfully!",
            status: "success",
            duration: 1000,
            isClosable: true,
          });
          router.push("/dashboard");
        }
      } catch (error) {
        toast({
          position: "top",
          description: `Incorrect old password! ${error.message}`,
          status: "error",
          duration: 1000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      toast({
        position: "top",
        description: "No user is signed in",
        status: "error",
        duration: 1000,
        isClosable: true,
      });
    }
  };

  return (
    <Container
      bg="#F3F4F6" // Light gray background to maintain modern and clean look
      minH="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      p={4}
    >
      <Box
        p={6}
        width={["90%", "400px"]}
        maxW="400px"
        mx="auto"
        bg="white"
        borderRadius="md"
        boxShadow="lg" // Slightly stronger shadow for better visibility
      >
        <Heading size="lg" mb={5} textAlign="center" color="#1E3A8A">
          {" "}
          {/* Modern Blue Heading */}
          Edit Profile
        </Heading>

        <form onSubmit={handleSave}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel color="#374151">Email</FormLabel>{" "}
              {/* Darker gray for form labels */}
              <Input value={email} readOnly bg="gray.100" />
            </FormControl>

            <FormControl>
              <FormLabel color="#374151">Old Password</FormLabel>
              <InputGroup>
                <Input
                  type={showOldPassword ? "text" : "password"}
                  minLength={6}
                  required
                  value={oldPassword}
                  placeholder="Old password"
                  onChange={(e) => setOldPassword(e.target.value)}
                  bg="gray.100"
                />
                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    color="#1E3A8A" // Modern orange for icon button
                  >
                    {showOldPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <FormControl>
              <FormLabel color="#374151">New Password</FormLabel>
              <InputGroup>
                <Input
                  type={showNewPassword ? "text" : "password"}
                  minLength={6}
                  placeholder="New password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  bg="gray.100"
                />
                <InputRightElement>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    color="#1E3A8A" // Modern orange for icon button
                  >
                    {showNewPassword ? <ViewOffIcon /> : <ViewIcon />}
                  </Button>
                </InputRightElement>
              </InputGroup>
            </FormControl>

            <Button
              colorScheme="orange" // Use the orange color scheme for the button
              type="submit"
              isLoading={loading}
              width="100%"
              bg="#1E3A8A" // Set button to orange
              _hover={{ bg: "#F97316" }} // Hover state to modern blue
              color="white"
            >
              Save Changes
            </Button>
          </VStack>
        </form>
      </Box>
    </Container>
  );
};

export default ProfileEdit;
