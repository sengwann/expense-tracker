"use client";

import { useState } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Heading,
  Button,
  FormErrorMessage,
  useToast,
  Text,
  Link,
  Spinner,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pswError, setPswError] = useState("");
  const [confirmError, setConfirmError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const toast = useToast();
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (password === confirmPassword && email.trim().length > 0) {
      if (password.length < 6) {
        setPswError("The password must be at least 6 characters long.");
        return;
      }
      setLoading(true);
      try {
        const response = await fetch("/api/signUp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setLoading(false);
          toast({
            position: "top",
            description: "We've created your account for you.",
            status: "success",
            duration: 3000,
            isClosable: true,
          });
          router.push("/dashboard");
        } else {
          setLoading(false);
          toast({
            position: "top",
            description: data.error || "An unknown error occurred.",
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (err) {
        setLoading(false);
        toast({
          position: "top",
          description: `Error occurred while signing up. Please try again.${err.message}`,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } else {
      setConfirmError("Passwords do not match.");
      toast({
        position: "top",
        description: "Passwords do not match or email is empty.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container
      bg="#F3F4F6" // Light Gray Background
      p={4}
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
      >
        <Heading
          fontWeight="400"
          size="lg"
          textAlign="center"
          mb={6}
          color="#1E3A8A"
        >
          Sign Up
        </Heading>
        <form onSubmit={handleSignUp} style={{ width: "100%" }}>
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

          <FormControl isInvalid={pswError}>
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (e.target.value.length < 6) {
                    setPswError("Password must be at least 6 characters long.");
                  } else {
                    setPswError("");
                  }
                }}
                required
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {pswError && <FormErrorMessage>{pswError}</FormErrorMessage>}
          </FormControl>

          <FormControl isInvalid={confirmError}>
            <FormLabel
              htmlFor="confirmPassword"
              fontWeight="normal"
              color="#374151"
            >
              Confirm Password
            </FormLabel>
            <InputGroup>
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                bg="gray.200"
                placeholder="Confirm password..."
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (e.target.value !== password) {
                    setConfirmError("Passwords do not match.");
                  } else {
                    setConfirmError("");
                  }
                }}
                required
              />
              <InputRightElement>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <ViewOffIcon /> : <ViewIcon />}
                </Button>
              </InputRightElement>
            </InputGroup>
            {confirmError && (
              <FormErrorMessage>{confirmError}</FormErrorMessage>
            )}
          </FormControl>

          <Button
            bg="#1E3A8A" // Dark Blue Button
            color="white"
            _hover={{ bg: "#F97316" }} // Orange on hover
            mt={4}
            width="100%"
            type="submit"
            isDisabled={loading}
          >
            {loading ? <Spinner size="sm" color="white" /> : "Sign Up"}
          </Button>
        </form>

        <Text fontSize="sm" align="center" color="#374151">
          Already have an account?{" "}
          <Link as={NextLink} href="/login" color="#F97316">
            Login
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}
