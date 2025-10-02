import { Navigate } from "react-router-dom";
import Loading from "./componenet/common/Loading";
import { useUser } from "./contexts/UserContext";
import toast from "react-hot-toast";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useUser();

  if (loading) return <Loading />;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error("ليس لديك إذن للوصول إلى هذه الصفحة");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
