"use client";

import { useState, useEffect } from "react";
import { auth } from "../lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import NextLink from "next/link";
import { useAuth } from "../_Auth/AuthContext";
import { useRouter } from "next/navigation";

import {
  Container,
  VStack,
  Box,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Button,
  Text,
  Link,
  useToast,
  InputRightElement,
  InputGroup,
  IconButton,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function LogInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    if (user) {
      router.push("/dashboard"); // Redirect if already logged in
    }
  }, [user, router]);

  const handleLogIn = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (email.trim() && password.length >= 6) {
      try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push("/dashboard");
        setLoading(false);
        setEmail("");
        setPassword("");
        toast({
          position: "top",
          description: "Login successfully!",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        setLoading(false);
        let message = "An unknown error occurred. Please try again.";
        switch (error.code) {
          case "auth/invalid-credential":
            message = "Incorrect Email or Password.";
            break;
          case "auth/user-disabled":
            message = "This account has been disabled.";
            break;
          case "auth/network-request-failed":
            message = "Network error. Please check your connection.";
            break;
          case "auth/too-many-requests":
            message = "Too many failed attempts. Please try again later.";
            break;
          default:
            message = error.message;
        }
        toast({
          position: "top",
          description: message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      setLoading(false);
      toast({
        position: "top",
        description: "Invalid email or password.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container
      bg="#F3F4F6" // Light Gray Background
      p="4"
      maxW="none"
      width="100%"
      centerContent
      minHeight="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
    >
      <VStack
        spacing={3}
        align="stretch"
        p={6}
        bg="white"
        width={["90%", "400px", "500px"]}
        maxWidth="500px"
        borderRadius="md"
        boxShadow="md"
        textAlign="center"
      >
        <Heading
          fontWeight="400"
          size="lg"
          textAlign="center"
          mb={6}
          color="#1E3A8A"
        >
          Sign In
        </Heading>
        <form onSubmit={handleLogIn} style={{ width: "100%" }}>
          <Box width="100%">
            <FormControl>
              <FormLabel htmlFor="email" fontWeight="normal" color="#374151">
                Email
              </FormLabel>
              <Input
                id="email"
                type="email"
                bg="gray.200"
                placeholder="Enter email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </FormControl>
          </Box>
          <Box width="100%">
            <FormControl>
              <FormLabel htmlFor="password" fontWeight="normal" color="#374151">
                Password
              </FormLabel>
              <InputGroup>
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  bg="gray.200"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Toggle password visibility"
                    icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                    onClick={() => setShowPassword(!showPassword)}
                    variant="ghost"
                    size="sm"
                  />
                </InputRightElement>
              </InputGroup>
            </FormControl>
          </Box>
          <Button
            bg="#1E3A8A" // Dark Blue Button
            color="white"
            _hover={{ bg: "#F97316" }} // Orange on hover
            mt={4}
            width="100%"
            type="submit"
            isLoading={loading}
          >
            Login
          </Button>
        </form>
        <Text fontSize="sm" align="center" color="#374151">
          Don&apos;t have an account?{" "}
          <Link as={NextLink} color="#F97316" href="/signUp">
            Sign Up
          </Link>
        </Text>
        <Text fontSize="sm" align="center">
          <Link
            as={NextLink}
            color="#F97316"
            href={`/resetPassword?email=${email}`}
          >
            Forgot password?
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}
