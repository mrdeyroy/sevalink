import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * AuthLayout — Shared layout for all authentication pages.
 * Renders: Navbar → scrollable content area (centered card) → Footer
 *
 * The Navbar is fixed (z-[2000]), so we offset with pt-16.
 * The layout uses flex-col + min-h-screen so the footer always sticks
 * to the bottom even when content is short.
 */
const AuthLayout = ({ children, gradient = "from-slate-50 via-blue-50 to-indigo-50" }) => {
    return (
        <div className="flex flex-col min-h-screen">
            <Navbar />

            {/* Main scrollable area — pushes footer down */}
            <main
                className={`flex-1 flex flex-col items-center justify-center bg-gradient-to-br ${gradient} pt-20 pb-12 px-4`}
            >
                {children}
            </main>

            <Footer />
        </div>
    );
};

export default AuthLayout;
