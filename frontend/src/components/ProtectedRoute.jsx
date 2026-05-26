import { Navigate } from "react-router-dom";

function ProtectedRoute({ token, children }) {
    if (!token) {
        return <Navigate to="/" />;
    }

    return children;
}

export default ProtectedRoute;