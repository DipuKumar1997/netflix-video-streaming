
import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const token = Cookies.get("jwtToken");
  const location = useLocation();

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <>{children}</>;
}
