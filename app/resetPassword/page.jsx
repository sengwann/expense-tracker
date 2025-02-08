"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { auth } from "../lib/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { Box, Button, Input, Text, useToast } from "@chakra-ui/react";
import Loading from "../lib/loading/loading";

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <ForgotPassword />
    </Suspense>
  );
}

function ForgotPassword() {
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const emailFromQuery = searchParams.get("email");
    if (emailFromQuery) {
      setEmail(emailFromQuery);
    }
  }, [searchParams]);

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        position: "top",
        title: "Error",
        description: "Please enter your email.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        position: "top",
        title: "Success",
        description: "Please go to your email and reset your password!",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      setEmail("");
    } catch (error) {
      toast({
        position: "top",
        title: "Error",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setLoading(false);
  };

  return (
    <Box
      maxW="400px"
      mx="auto"
      mt="100px"
      p={4}
      boxShadow="md"
      borderRadius="md"
      bg="white"
    >
      <Text fontSize="xl" fontWeight="bold" mb={4} color="#1E3A8A">
        Reset Password
      </Text>
      <Input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        mb={3}
      />
      <Button
        colorScheme="blue"
        onClick={handleResetPassword}
        isLoading={loading}
        w="full"
        _hover={{ bg: "#F97316" }}
      >
        Send Reset Link
      </Button>
    </Box>
  );
}
