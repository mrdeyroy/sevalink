import { createContext, useState, useEffect, useContext, useCallback } from "react";
import axios from "axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const startTime = Date.now();
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const config = {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    };
                    const { data } = await axios.get("http://localhost:5000/api/auth/me", config);
                    setUser({ ...data, token });
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem("token");
                    setUser(null);
                }
            }

            // Ensure loading stays for at least 2 seconds
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 2000 - elapsedTime);

            setTimeout(() => {
                setLoading(false);
            }, remainingTime);
        };

        checkUser();
    }, []);

    const login = async (identifier, password) => {
        const { data } = await axios.post("http://localhost:5000/api/auth/login", {
            identifier,
            password,
        });
        localStorage.setItem("token", data.token);
        setUser(data);
        return data;
    };

    // Worker login using mobile number + password
    const workerLogin = async (mobile, password) => {
        const { data } = await axios.post("http://localhost:5000/api/auth/worker-login", {
            mobile,
            password,
        });
        localStorage.setItem("token", data.token);
        setUser(data);
        return data; // includes mustChangePassword flag
    };

    const register = async (name, email, mobile, password) => {
        const { data } = await axios.post("http://localhost:5000/api/auth/register", {
            name,
            email,
            mobile,
            password,
        });
        if (data.pending_verification) {
            return data;
        }
        if (data.token) {
            localStorage.setItem("token", data.token);
            setUser(data);
        }
        return data;
    };

    const sendMobileOTP = async (mobile) => {
        const { data } = await axios.post("http://localhost:5000/api/auth/send-mobile-otp", { mobile });
        return data;
    };

    const verifyMobileOTP = async (mobile, otp) => {
        const { data } = await axios.post("http://localhost:5000/api/auth/verify-mobile-otp", { mobile, otp });
        return data;
    };

    const changePassword = async (currentPassword, newPassword) => {
        const token = localStorage.getItem("token");
        const { data } = await axios.post(
            "http://localhost:5000/api/auth/change-password",
            { currentPassword, newPassword },
            { headers: { Authorization: `Bearer ${token}` } }
        );
        return data;
    };

    const updateProfile = async (formData) => {
        const token = localStorage.getItem("token");
        const { data } = await axios.put(
            "http://localhost:5000/api/auth/profile",
            formData,
            { headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" } }
        );
        // Update user in state immediately so Navbar avatar refreshes
        setUser((prev) => ({ ...prev, name: data.name, avatar: data.avatar }));
        return data;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    const googleLogin = useCallback(async (token) => {
        localStorage.setItem("token", token);
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get("http://localhost:5000/api/auth/me", config);
            setUser({ ...data, token });
        } catch (error) {
            console.error("Google login sequence failed:", error);
            localStorage.removeItem("token");
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, workerLogin, register, sendMobileOTP, verifyMobileOTP, changePassword, updateProfile, logout, googleLogin, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
