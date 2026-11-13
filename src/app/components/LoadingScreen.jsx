"use client";
import { motion } from "framer-motion";
import { Globe } from "lucide-react";

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    top: `${(i * 53 + 7) % 100}%`,
    duration: 2 + ((i * 13) % 20) / 10,
    delay: ((i * 17) % 20) / 10,
    warm: i % 3 === 0,
}));

const LoadingScreen = ({ lightMode }) => {
    const isDark = !lightMode;
    return (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
            className="fixed inset-0 z-[1050] flex flex-col items-center justify-center bg-ink"
            style={{
                background: isDark
                    ? "radial-gradient(ellipse at center, #141a17 0%, #0d1110 68%, #070a09 100%)"
                    : "radial-gradient(ellipse at center, #f6f1e4 0%, #efe9da 68%, #e5decb 100%)",
            }}
        >
            {/* Drifting ink specks */}
            <div className="absolute inset-0 overflow-hidden">
                {[...PARTICLES].map((particle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-px h-px rounded-full"
                        style={{
                            backgroundColor: particle.warm
                                ? "var(--cinnabar)"
                                : "var(--parchment-dim)",
                            opacity: 0.5,
                            left: particle.left,
                            top: particle.top,
                        }}
                        animate={{
                            y: [0, -90],
                            opacity: [0, 0.6, 0],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                            ease: "easeOut",
                        }}
                    />
                ))}
            </div>

            {/* Meridian emblem */}
            <div className="relative mb-9 w-28 h-28 flex items-center justify-center">
                <motion.div
                    className="absolute inset-0 rounded-full border border-hairline"
                    animate={{ scale: [1, 1.45, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute inset-3 rounded-full"
                    style={{ border: "1px solid color-mix(in srgb, var(--cinnabar) 45%, transparent)" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.45, 0, 0.45] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
                />
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
                    className="relative"
                >
                    <Globe className="w-14 h-14 text-cinnabar" strokeWidth={0.75} />
                </motion.div>
                <span className="absolute w-1.5 h-1.5 rounded-full bg-cinnabar" />
            </div>

            {/* Title block */}
            <motion.h1
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-4xl sm:text-5xl font-semibold uppercase tracking-[0.26em] text-parchment pl-[0.26em]"
            >
                Gloria
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="mt-4 w-56 h-[3px] border-t border-b border-hairline"
            />

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 eyebrow text-dim"
            >
                Loading historical events
            </motion.p>

            {/* Indeterminate ruled progress */}
            <motion.div
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 224 }}
                transition={{ delay: 0.55 }}
                className="mt-7 h-px bg-hairline overflow-hidden"
            >
                <motion.div
                    className="h-full bg-cinnabar"
                    animate={{ x: ["-100%", "100%"] }}
                    transition={{
                        duration: 1.4,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    style={{ width: "60%" }}
                />
            </motion.div>
        </motion.div>
    );
};

export default LoadingScreen;
