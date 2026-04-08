import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MemberProtectedRoute = ({ children }) => {
  const { isMember, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // Redirect to member login if not authenticated as a member
  if (!isMember) {
    return <Navigate to="/member-login" replace />;
  }

  // Render protected content if authenticated as member
  return children;
};

export default MemberProtectedRoute;
