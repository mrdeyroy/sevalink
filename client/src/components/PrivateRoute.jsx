import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageLoader from "./PageLoader";

const PrivateRoute = ({ children, roles = [] }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <PageLoader />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    if (roles.length > 0 && !roles.includes(user.role)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-rose-100">
                <div className="bg-white rounded-2xl shadow-xl border border-red-100 p-10 text-center max-w-sm">
                    <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Access Denied</h2>
                    <p className="text-sm text-gray-500 mb-6">You don&apos;t have permission to view this page.</p>
                    <a href="/" className="inline-block px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5">
                        Go Home
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default PrivateRoute;
