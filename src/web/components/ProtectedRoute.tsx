import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@web/conference-and-visitors-booking/contexts/AuthContext";
import { setNavigate } from "@/lib/navigation";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

// Route guard implemented without effects; returns a redirect element when unauthenticated
export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, initializing } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Set navigate function for axios interceptor (401 handler)
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);

  if (initializing) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}



