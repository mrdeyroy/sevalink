const PageLoader = () => {
    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {/* Main Content */}
            <div className="relative flex flex-col items-center gap-8">
                {/* Logo Pulse Ring */}
                <div className="relative">
                    {/* Outer rotating ring */}
                    <div className="absolute inset-0 w-24 h-24 rounded-full border-[3px] border-transparent border-t-blue-500 border-r-indigo-400 animate-loader-spin" />
                    {/* Middle pulsing ring */}
                    <div className="absolute inset-1 w-[88px] h-[88px] rounded-full border-2 border-blue-200/50 animate-loader-pulse" />
                    {/* Inner logo container */}
                    <div className="w-24 h-24 rounded-full bg-white shadow-xl shadow-blue-200/60 flex items-center justify-center">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30 p-1.5 overflow-hidden">
                            <img
                                src="/logo.png"
                                alt="SevaLink"
                                className="w-full h-full object-contain brightness-0 invert"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                    e.currentTarget.parentElement.innerHTML = `<span style="color:white;font-weight:800;font-size:20px;">S</span>`;
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Brand Name with shimmer */}
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-2xl font-extrabold tracking-tight">
                        <span className="bg-gradient-to-r from-blue-700 via-indigo-600 to-blue-700 bg-clip-text text-transparent bg-[length:200%_auto] animate-shimmer">
                            SevaLink
                        </span>
                    </h1>

                    {/* Animated dots loader */}
                    <div className="flex items-center gap-1.5 mt-1">
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce-dot" style={{ animationDelay: "0ms" }} />
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce-dot" style={{ animationDelay: "150ms" }} />
                        <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce-dot" style={{ animationDelay: "300ms" }} />
                    </div>
                </div>
            </div>

            {/* Styles */}
            <style>{`
                .orb {
                    position: absolute;
                    border-radius: 50%;
                    filter: blur(80px);
                    opacity: 0.4;
                }
                .orb-1 {
                    width: 300px; height: 300px;
                    background: radial-gradient(circle, #3b82f6 0%, transparent 70%);
                    top: 10%; left: 15%;
                    animation: orbFloat 6s ease-in-out infinite;
                }
                .orb-2 {
                    width: 250px; height: 250px;
                    background: radial-gradient(circle, #6366f1 0%, transparent 70%);
                    bottom: 15%; right: 10%;
                    animation: orbFloat 8s ease-in-out infinite reverse;
                }
                .orb-3 {
                    width: 200px; height: 200px;
                    background: radial-gradient(circle, #818cf8 0%, transparent 70%);
                    top: 50%; left: 55%;
                    animation: orbFloat 7s ease-in-out infinite 1s;
                }

                @keyframes orbFloat {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    33% { transform: translate(30px, -20px) scale(1.05); }
                    66% { transform: translate(-20px, 15px) scale(0.95); }
                }

                @keyframes loaderSpin {
                    to { transform: rotate(360deg); }
                }
                .animate-loader-spin {
                    animation: loaderSpin 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }

                @keyframes loaderPulse {
                    0%, 100% { transform: scale(1); opacity: 0.5; }
                    50% { transform: scale(1.08); opacity: 1; }
                }
                .animate-loader-pulse {
                    animation: loaderPulse 2s ease-in-out infinite;
                }

                @keyframes shimmer {
                    to { background-position: 200% center; }
                }
                .animate-shimmer {
                    animation: shimmer 2s linear infinite;
                }

                @keyframes bounceDot {
                    0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
                    30% { transform: translateY(-8px); opacity: 1; }
                }
                .animate-bounce-dot {
                    animation: bounceDot 1.4s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default PageLoader;
