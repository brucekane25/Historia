"use client";
import { motion } from "framer-motion";
import { Globe, Sparkles } from "lucide-react";

const LoadingScreen = ({ lightMode }) => {
    const isDark = !lightMode;
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className={`fixed inset-0 z-[1050] flex flex-col items-center justify-center ${isDark ? "bg-[#0a0c1a]" : "bg-[#f0f2f7]"
                }`}
            style={{
                background: isDark
                    ? "radial-gradient(ellipse at center, #0f1729 0%, #0a0c1a 70%, #050714 100%)"
                    : "radial-gradient(ellipse at center, #f8fafc 0%, #f1f5f9 70%, #e2e8f0 100%)",
            }}
        >
            {/* Background particles */}
            <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                            backgroundColor: isDark ? "#8b5cf6" : "#a78bfa",
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                        }}
                        animate={{
                            y: [0, -100],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>
            
            {/* Animated Globe Container */}
            <div className="relative mb-10">
                {/* Outer glow rings */}
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `2px solid ${isDark ? "rgba(139,92,246,0.3)" : "rgba(139,92,246,0.2)"}`,
                    }}
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.5, 0, 0.5],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
                <motion.div
                    className="absolute inset-0 rounded-full"
                    style={{
                        border: `1px solid ${isDark ? "rgba(139,92,246,0.2)" : "rgba(139,92,246,0.15)"}`,
                    }}
                    animate={{
                        scale: [1, 2, 1],
                        opacity: [0.3, 0, 0.3],
                    }}
                    transition={{
                        duration: 2.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay: 0.3,
                    }}
                />
                
                {/* Main Globe */}
                <motion.div
                    animate={{ 
                        rotate: 360,
                    }}
                    transition={{
                        duration: 20,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                    className="relative"
                >
                    <Globe
                        className={`w-20 h-20 ${isDark ? "text-purple-400" : "text-purple-600"
                            }`}
                        strokeWidth={1}
                    />
                </motion.div>
                
                {/* Center sparkle */}
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.5, 1, 0.5],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <Sparkles 
                        className={`w-6 h-6 ${isDark ? "text-purple-300" : "text-purple-500"}`}
                    />
                </motion.div>
            </div>
            
            {/* Text */}
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={`text-3xl font-black tracking-tight mb-3 ${isDark ? "text-white" : "text-gray-900"
                    }`}
                style={{
                    textShadow: isDark 
                        ? "0 0 40px rgba(139,92,246,0.5)" 
                        : "0 0 20px rgba(139,92,246,0.3)",
                }}
            >
                Gloria
            </motion.h1>
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className={`text-sm font-medium ${isDark ? "text-white/50" : "text-gray-500"
                    }`}
            >
                Loading historical events...
            </motion.p>
            
            {/* Progress bar */}
            <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 200 }}
                transition={{ delay: 0.5 }}
                className={`mt-8 h-1.5 rounded-full overflow-hidden ${isDark ? "bg-white/10" : "bg-black/10"
                    }`}
            >
                <motion.div 
                    className="h-full rounded-full"
                    style={{
                        background: isDark
                            ? "linear-gradient(90deg, #8b5cf6, #a78bfa, #8b5cf6)"
                            : "linear-gradient(90deg, #7c3aed, #a78bfa, #7c3aed)",
                        backgroundSize: '200% 100%',
                    }}
                    animate={{
                        backgroundPosition: ["0% 0%", "200% 0%"],
                    }}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            </motion.div>
        </motion.div>
    );
};

export default LoadingScreen;
