"use client";
import { useMemo } from "react";
import { X, BarChart3, TrendingUp, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const categoryColors = {
    war: "#ef4444",
    political: "#8b5cf6",
    cultural: "#f59e0b",
    scientific: "#10b981",
    religious: "#eab308",
    disasters: "#f97316",
    discoveries: "#3b82f6",
    historical: "#ec4899",
    economic: "#14b8a6",
    social: "#f43f5e",
    births: "#a78bfa",
    deaths: "#6b7280",
    events: "#22d3ee",
    environmental: "#22c55e",
};

const EventStats = ({ events, isOpen, onClose, mode }) => {
    const isDark = !mode;

    // Category distribution
    const categoryData = useMemo(() => {
        const counts = {};
        events.forEach((e) => {
            const cat = e.category || "unknown";
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return Object.entries(counts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
    }, [events]);

    const maxCategoryCount = Math.max(
        ...categoryData.map(([_, count]) => count),
        1
    );

    // Timeline distribution (group by century)
    const timelineData = useMemo(() => {
        const centuries = {};
        events.forEach((e) => {
            const century = Math.floor(e.year / 100) * 100;
            centuries[century] = (centuries[century] || 0) + 1;
        });
        return Object.entries(centuries)
            .map(([year, count]) => ({ year: parseInt(year), count }))
            .sort((a, b) => a.year - b.year);
    }, [events]);

    const maxTimelineCount = Math.max(
        ...timelineData.map((d) => d.count),
        1
    );

    // Year range
    const yearRange = useMemo(() => {
        if (events.length === 0) return { min: 0, max: 0 };
        const years = events.map((e) => e.year);
        return { min: Math.min(...years), max: Math.max(...years) };
    }, [events]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-2xl shadow-2xl p-4 w-[300px] max-h-[80vh] overflow-y-auto ${isDark ? "glass-dark" : "glass"
                        }`}
                    style={{
                        border: isDark
                            ? "1px solid rgba(255,255,255,0.06)"
                            : "1px solid rgba(0,0,0,0.06)",
                        color: isDark ? "#e5e7eb" : "#111827",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <BarChart3
                                className={`w-4 h-4 ${isDark ? "text-purple-400" : "text-purple-600"
                                    }`}
                            />
                            <h3 className="text-sm font-semibold">Event Statistics</h3>
                        </div>
                        <button
                            onClick={onClose}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${isDark
                                    ? "text-white/40 hover:text-white hover:bg-white/10"
                                    : "text-gray-400 hover:text-gray-900 hover:bg-black/5"
                                }`}
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>

                    {/* Summary stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                        <StatCard
                            isDark={isDark}
                            label="Events"
                            value={events.length.toLocaleString()}
                        />
                        <StatCard
                            isDark={isDark}
                            label="Earliest"
                            value={yearRange.min}
                        />
                        <StatCard
                            isDark={isDark}
                            label="Latest"
                            value={yearRange.max}
                        />
                    </div>

                    {/* Category Distribution */}
                    <div className="mb-4">
                        <p
                            className={`text-[10px] font-medium mb-2 flex items-center gap-1 ${isDark ? "text-white/40" : "text-gray-400"
                                }`}
                        >
                            <BarChart3 className="w-3 h-3" /> CATEGORIES
                        </p>
                        <div className="space-y-1.5">
                            {categoryData.map(([cat, count]) => (
                                <div key={cat} className="flex items-center gap-2">
                                    <span
                                        className={`text-[10px] w-16 truncate capitalize ${isDark ? "text-white/50" : "text-gray-500"
                                            }`}
                                    >
                                        {cat}
                                    </span>
                                    <div className="flex-1 h-4 rounded-full overflow-hidden relative"
                                        style={{
                                            background: isDark
                                                ? "rgba(255,255,255,0.05)"
                                                : "rgba(0,0,0,0.05)",
                                        }}
                                    >
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${(count / maxCategoryCount) * 100}%`,
                                            }}
                                            transition={{ duration: 0.6, delay: 0.05 }}
                                            className="h-full rounded-full"
                                            style={{
                                                backgroundColor:
                                                    categoryColors[cat] || "#6b7280",
                                            }}
                                        />
                                    </div>
                                    <span
                                        className={`text-[10px] font-mono w-8 text-right ${isDark ? "text-white/40" : "text-gray-400"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Sparkline */}
                    <div>
                        <p
                            className={`text-[10px] font-medium mb-2 flex items-center gap-1 ${isDark ? "text-white/40" : "text-gray-400"
                                }`}
                        >
                            <TrendingUp className="w-3 h-3" /> TIMELINE
                        </p>
                        <div className="flex items-end gap-[2px] h-16">
                            {timelineData.map((d, i) => (
                                <div
                                    key={d.year}
                                    className="flex-1 rounded-t-sm transition-all duration-200 hover:opacity-100 group relative"
                                    style={{
                                        height: `${(d.count / maxTimelineCount) * 100}%`,
                                        minHeight: "2px",
                                        backgroundColor: isDark
                                            ? "rgba(139,92,246,0.5)"
                                            : "rgba(139,92,246,0.6)",
                                        opacity: 0.7,
                                    }}
                                    title={`${d.year}s: ${d.count} events`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-1">
                            <span
                                className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"
                                    }`}
                            >
                                {timelineData[0]?.year || ""}
                            </span>
                            <span
                                className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"
                                    }`}
                            >
                                {timelineData[timelineData.length - 1]?.year || ""}
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function StatCard({ isDark, label, value }) {
    return (
        <div
            className={`p-2 rounded-lg text-center ${isDark ? "bg-white/[0.03]" : "bg-black/[0.02]"
                }`}
            style={{
                border: isDark
                    ? "1px solid rgba(255,255,255,0.04)"
                    : "1px solid rgba(0,0,0,0.04)",
            }}
        >
            <p
                className={`text-sm font-bold ${isDark ? "text-purple-400" : "text-purple-600"
                    }`}
            >
                {value}
            </p>
            <p
                className={`text-[9px] ${isDark ? "text-white/30" : "text-gray-400"
                    }`}
            >
                {label}
            </p>
        </div>
    );
}

export default EventStats;
