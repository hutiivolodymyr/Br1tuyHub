import { Navigate } from "react-router-dom";

function RoleProtectedRoute({ user, allowedRoles, children }) {
    if (!user) {
        return <Navigate to="/" />;
    }

    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/" />;
    }

    return children;
}

export default RoleProtectedRoute;