import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

const ProtectedRoute = ({ children, role }) => {
  const isAuthenticated = authService.isAuthenticated();
  const userRole = authService.getRole();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

export default ProtectedRoute;