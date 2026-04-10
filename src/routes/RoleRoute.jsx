import { Navigate } from "react-router-dom";
import Spinner from "../components/shared/Spinner";
import { useAuth } from "../contexts/AuthContext";
import { DASHBOARD_REDIRECT } from "../utils/constants";

function RoleRoute({ allowedRoles, children }) {
  const { userProfile, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <Spinner fullScreen label="Checking permissions..." />;
  }

  if (!userProfile) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return <Navigate to={DASHBOARD_REDIRECT[userProfile.role]} replace />;
  }

  return children;
}

export default RoleRoute;
