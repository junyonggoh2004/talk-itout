import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: "counsellor" | "student";
  allowAnonymous?: boolean;
}

const ProtectedRoute = ({ children, requiredRole, allowAnonymous = false }: ProtectedRouteProps) => {
  const { user, userRole, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Counsellor trying to access student pages - redirect to dashboard
  if (user && userRole === "counsellor" && requiredRole === "student") {
    return <Navigate to="/dashboard" replace />;
  }

  // If anonymous access is allowed and no user, allow through
  if (allowAnonymous && !user) {
    return <>{children}</>;
  }

  // If a specific role is required and user doesn't have it
  if (requiredRole === "counsellor") {
    if (!user) {
      return <Navigate to="/login" replace />;
    }
    if (userRole !== "counsellor") {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
