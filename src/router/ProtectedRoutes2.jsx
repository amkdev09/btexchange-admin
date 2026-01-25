import { Navigate, useLocation } from "react-router-dom";
import { useAuth2 } from "../hooks/useAuth2";
import { useAuth } from "../hooks/useAuth";
import { useEffect } from "react";

const hasRequiredRole = (userData, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  if (!userData) return false;

  const userRoles = Array.isArray(userData?.roles)
    ? userData.roles
    : userData.role
      ? [userData.role]
      : [];

  if (userRoles.length === 0) return false;

  return allowedRoles.some((role) => userRoles.includes(role));
};

const ProtectedRoute2 = ({ children, roles }) => {
  const location = useLocation();
  const { token, userData } = useAuth2();
  const { setIsSecondGame, isSecondGame } = useAuth();

  // Ensure we're in second game mode for second game routes
  useEffect(() => {
    setIsSecondGame(true);
  }, [setIsSecondGame]);

  if (!token) {
    return <Navigate to="/network/login" state={{ from: location }} replace />;
  }

  if (!isSecondGame) {
    return <Navigate to="/" replace />;
  }

  if (!hasRequiredRole(userData, roles)) {
    return <Navigate to="/network/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute2;
