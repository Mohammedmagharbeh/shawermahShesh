import { Navigate } from "react-router-dom";
import Loading from "./components/common/Loading";
import { useUser } from "./contexts/UserContext";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useUser();
  const { t } = useTranslation();

  if (loading) return <Loading />;

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    toast.error(t("no_permission"));

    return <Navigate to="/products" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
