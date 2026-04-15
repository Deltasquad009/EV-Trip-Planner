import { Navigate } from "react-router-dom";
import storage from "../utils/storage";

/**
 * ProtectedRoute — wraps routes that require authentication.
 * Redirects to /login if no valid token is found.
 */
export default function ProtectedRoute({ children }) {
  const token = storage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
