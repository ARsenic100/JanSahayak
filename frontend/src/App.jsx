import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Auth from "./pages/Auth";
import Landing from "./pages/Landing";
import ProtectedRoute from "./hoc/ProtectedRoute";
import { authService } from "./services/authService";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Dashboard from "./pages/admin/Dashboard";
import Issues from "./pages/admin/Issues";
import Users from "./pages/admin/Users";
import EmployeeIssues from "./pages/employee/Issues";
import Profile from "./pages/employee/Profile";
import NotFound from "./pages/NotFound";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const authenticated = authService.isAuthenticated();
    setIsAuthenticated(authenticated);
    if (authenticated) {
      setUserRole(authService.getRole());
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
    setUserRole(authService.getRole());
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setUserRole(null);
  };

  return (
    <>
      <Toaster position="top-right" />
      <Router>
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
          {isAuthenticated && (
            <Navbar onLogout={handleLogout} userRole={userRole} />
          )}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate
                      to={
                        userRole === "admin"
                          ? "/admin/dashboard"
                          : "/employee/issues"
                      }
                      replace
                    />
                  ) : (
                    <Landing />
                  )
                }
              />
              <Route
                path="/auth"
                element={
                  isAuthenticated ? (
                    <Navigate
                      to={
                        userRole === "admin"
                          ? "/admin/dashboard"
                          : "/employee/issues"
                      }
                      replace
                    />
                  ) : (
                    <Auth onAuthSuccess={handleAuthSuccess} />
                  )
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute role="admin">
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/issues"
                element={
                  <ProtectedRoute role="admin">
                    <Issues />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute role="admin">
                    <Users />
                  </ProtectedRoute>
                }
              />

              {/* Employee Routes */}
              <Route
                path="/employee/issues"
                element={
                  <ProtectedRoute role="employee">
                    <EmployeeIssues />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/employee/profile"
                element={
                  <ProtectedRoute role="employee">
                    <Profile />
                  </ProtectedRoute>
                }
              />

              {/* Fallback Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          {!isAuthenticated && <Footer />}
        </div>
      </Router>
    </>
  );
}

export default App;
