"use client";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const LoadingScreen = ({ lightMode }) => {
    const isDark = !lightMode;
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`fixed inset-0 z-[1050] flex flex-col items-center justify-center ${isDark ? "bg-[#0a0c1a]" : "bg-[#f0f2f7]"
                }`}
        >
            {/* Animated Globe */}
            <div className="relative mb-8">
                <div className="animate-spin-slow">
                    <Globe
                        className={`w-16 h-16 ${isDark ? "text-purple-400" : "text-purple-600"
                            }`}
                        strokeWidth={1.2}
                    />
                </div>
                {/* Glow ring */}
                <div
                    className={`absolute inset-0 rounded-full blur-xl opacity-30 ${isDark ? "bg-purple-500" : "bg-purple-400"
                        }`}
                />
            </div>

            {/* Text */}
            <h1
                className={`text-2xl font-bold tracking-tight mb-2 ${isDark ? "text-white" : "text-gray-900"
                    }`}
            >
                Gloria
            </h1>
            <p
                className={`text-sm ${isDark ? "text-white/40" : "text-gray-500"
                    }`}
            >
                Loading historical events...
            </p>

            {/* Progress shimmer */}
            <div className={`mt-6 w-48 h-1 rounded-full overflow-hidden ${isDark ? "bg-white/5" : "bg-black/5"
                }`}>
                <div className="h-full w-1/3 rounded-full bg-purple-500/60 animate-shimmer"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6), transparent)',
                        backgroundSize: '200% 100%',
                    }} />
            </div>
        </motion.div>
    );
};

export default LoadingScreen;
