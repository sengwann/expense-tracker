"use client";

import { useAuth } from "./AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loading from "../lib/loading/loading";

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Redirect if not authenticated
    }
  }, [user, loading, router]);

  if (loading) return <Loading />; // Show loading while checking auth

  return user ? children : null;
};

export default ProtectedRoute;
