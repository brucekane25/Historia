"use client";
import { useMemo, useState } from "react";
import { X, BarChart3, TrendingUp, Calendar, Globe, Loader2 } from "lucide-react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import { CATEGORY_COLORS as categoryColors } from "@/lib/category-colors";

const CATEGORY_LABELS = {
    selected: "Curated",
};

const categoryLabel = (category) => CATEGORY_LABELS[category] || category;

const EventStats = ({ events, isOpen, onClose, lightMode }) => {
    const isDark = !lightMode;
    const controls = useDragControls();
    const [globalStats, setGlobalStats] = useState(null);
    const [loadingGlobal, setLoadingGlobal] = useState(false);
    const [showGlobal, setShowGlobal] = useState(false);

    // Category distribution (client-side from loaded events)
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
            if (!Number.isFinite(e.year)) return;
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
        const years = events
            .map((e) => e.year)
            .filter((year) => Number.isFinite(year));
        if (years.length === 0) return { min: "—", max: "—" };
        return { min: Math.min(...years), max: Math.max(...years) };
    }, [events]);

    // Fetch global stats from server
    const fetchGlobalStats = async () => {
        if (globalStats) {
            setShowGlobal(!showGlobal);
            return;
        }
        setLoadingGlobal(true);
        setShowGlobal(true);
        try {
            const res = await fetch("/api/events/stats");
            if (res.ok) {
                const data = await res.json();
                setGlobalStats(data);
            } else {
                setShowGlobal(false);
            }
        } catch (err) {
            console.error("Failed to fetch global stats:", err);
            setShowGlobal(false);
        }
        setLoadingGlobal(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    drag
                    dragListener={false}
                    dragControls={controls}
                    dragMomentum={false}
                    whileDrag={{ scale: 1.01 }}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 20, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className={`absolute right-4 top-20 z-[1030] rounded-[4px] shadow-2xl p-4 w-[300px] max-h-[75vh] overflow-y-auto ${isDark ? "glass-dark" : "glass"
                        }`}
                    style={{
                        backgroundColor: "var(--plate)",
                        backdropFilter: "blur(24px)",
                        border: isDark
                            ? "1px solid color-mix(in srgb, var(--verdigris) 20%, transparent)"
                            : "1px solid color-mix(in srgb, var(--verdigris) 15%, transparent)",
                        boxShadow: isDark
                            ? "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 40px color-mix(in srgb, var(--verdigris) 10%, transparent)"
                            : "0 25px 50px -12px color-mix(in srgb, var(--parchment) 10%, transparent), 0 0 30px color-mix(in srgb, var(--verdigris) 8%, transparent)",
                        color: "var(--parchment)",
                    }}
                >
                        {/* Gradient border */}
                        <div className="relative h-1 -mx-4 -mt-4 mb-4 rounded-t-[3px] overflow-hidden">
                            <div 
                                className="absolute inset-0"
                                style={{
                                    background: "linear-gradient(90deg, var(--cinnabar) 0%, color-mix(in srgb, var(--brass) 55%, transparent) 55%, transparent 100%)",
                                    backgroundSize: '200% 100%',
                                    animation: 'shimmer 2s linear infinite',
                                }}
                            />
                        </div>
                    
                    {/* Header */}
                    <div
                        className="flex items-center justify-between mb-4 cursor-move"
                        onPointerDown={(e) => controls.start(e)}
                    >
                        <div className="flex items-center gap-2 pointer-events-none">
                            <BarChart3
                                className={`w-4 h-4 ${"text-verdigris"
                                    }`}
                            />
                            <h3 className="text-sm font-bold">Event Statistics</h3>
                        </div>
                        <button
                            onClick={onClose}
                            onPointerDown={(e) => e.stopPropagation()}
                            className={`w-7 h-7 rounded-[3px] flex items-center justify-center transition-all hover:scale-105 ${isDark
                                ? "text-parchment/40 hover:text-parchment hover:bg-parchment/10"
                                : "text-dim hover:text-parchment hover:bg-ink/5"
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
                            className={`text-[10px] font-medium mb-2 flex items-center gap-1 ${isDark ? "text-parchment/40" : "text-dim"
                                }`}
                        >
                            <BarChart3 className="w-3 h-3" /> CATEGORIES
                        </p>
                        <div className="space-y-1.5">
                            {categoryData.map(([cat, count]) => (
                                <div key={cat} className="flex items-center gap-2">
                                    <span
                                        className={`text-[10px] w-16 truncate capitalize ${isDark ? "text-parchment/50" : "text-dim"
                                            }`}
                                    >
                                        {categoryLabel(cat)}
                                    </span>
                                    <div className="flex-1 h-4 rounded-full overflow-hidden relative"
                                        style={{
                                            background: "color-mix(in srgb, var(--parchment) 5%, transparent)",
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
                                                    categoryColors[cat] || "var(--parchment-dim)",
                                            }}
                                        />
                                    </div>
                                    <span
                                        className={`text-[10px] font-mono w-8 text-right ${isDark ? "text-parchment/40" : "text-dim"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Timeline Sparkline */}
                    <div className="mb-4">
                        <p
                            className={`text-[10px] font-medium mb-2 flex items-center gap-1 ${isDark ? "text-parchment/40" : "text-dim"
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
                                            ? "color-mix(in srgb, var(--cinnabar) 50%, transparent)"
                                            : "color-mix(in srgb, var(--cinnabar) 60%, transparent)",
                                        opacity: 0.7,
                                    }}
                                    title={`${d.year}s: ${d.count} events`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between mt-1">
                            <span
                                className={`text-[9px] ${isDark ? "text-parchment/30" : "text-dim"
                                    }`}
                            >
                                {timelineData[0]?.year || ""}
                            </span>
                            <span
                                className={`text-[9px] ${isDark ? "text-parchment/30" : "text-dim"
                                    }`}
                            >
                                {timelineData[timelineData.length - 1]?.year || ""}
                            </span>
                        </div>
                    </div>

                    {/* ───────── Global Stats ───────── */}
                    <div>
                        <button
                            onClick={fetchGlobalStats}
                            className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded-[3px] text-xs font-medium transition-all ${isDark
                                ? "bg-cinnabar/10 text-cinnabar hover:bg-cinnabar/20"
                                : "bg-cinnabar/12 text-cinnabar hover:bg-cinnabar/12"
                                }`}
                        >
                            {loadingGlobal ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                                <Globe className="w-3.5 h-3.5" />
                            )}
                            {showGlobal ? "Hide" : "Show"} Global Stats
                        </button>

                        <AnimatePresence>
                            {showGlobal && globalStats && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="pt-3 space-y-3">
                                        {/* Global summary */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <StatCard
                                                isDark={isDark}
                                                label="Total DB"
                                                value={globalStats.totalEvents.toLocaleString()}
                                            />
                                            <StatCard
                                                isDark={isDark}
                                                label="With Coords"
                                                value={globalStats.withCoordinates.toLocaleString()}
                                            />
                                            <StatCard
                                                isDark={isDark}
                                                label="Year Span"
                                                value={`${globalStats.yearRange.min}–${globalStats.yearRange.max}`}
                                            />
                                        </div>

                                        {/* Top Decades */}
                                        <div>
                                            <p className={`text-[10px] font-medium mb-2 flex items-center gap-1 ${isDark ? "text-parchment/40" : "text-dim"}`}>
                                                <Calendar className="w-3 h-3" /> TOP DECADES
                                            </p>
                                            <div className="space-y-1">
                                                {globalStats.topDecades.slice(0, 8).map((d) => (
                                                    <div key={d.decade} className="flex items-center gap-2">
                                                        <span className={`text-[10px] w-12 font-mono ${isDark ? "text-parchment/50" : "text-dim"}`}>
                                                            {d.decade}s
                                                        </span>
                                                        <div className="flex-1 h-3 rounded-full overflow-hidden"
                                                            style={{
                                                                background: "color-mix(in srgb, var(--parchment) 5%, transparent)",
                                                            }}
                                                        >
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    width: `${(d.count / globalStats.topDecades[0].count) * 100}%`,
                                                                    backgroundColor: isDark ? "color-mix(in srgb, var(--cinnabar) 60%, transparent)" : "color-mix(in srgb, var(--cinnabar) 70%, transparent)",
                                                                }}
                                                            />
                                                        </div>
                                                        <span className={`text-[10px] font-mono w-8 text-right ${isDark ? "text-parchment/40" : "text-dim"}`}>
                                                            {d.count}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Global Category Breakdown */}
                                        <div>
                                            <p className={`text-[10px] font-medium mb-2 flex items-center gap-1 ${isDark ? "text-parchment/40" : "text-dim"}`}>
                                                <BarChart3 className="w-3 h-3" /> ALL CATEGORIES (DB)
                                            </p>
                                            <div className="space-y-1">
                                                {globalStats.categories.map((c) => (
                                                    <div key={c.category} className="flex items-center gap-2">
                                                        <span className={`text-[10px] w-16 truncate capitalize ${isDark ? "text-parchment/50" : "text-dim"}`}>
                                                            {categoryLabel(c.category)}
                                                        </span>
                                                        <div className="flex-1 h-3 rounded-full overflow-hidden"
                                                            style={{
                                                                background: "color-mix(in srgb, var(--parchment) 5%, transparent)",
                                                            }}
                                                        >
                                                            <div
                                                                className="h-full rounded-full"
                                                                style={{
                                                                    width: `${(c.count / globalStats.categories[0].count) * 100}%`,
                                                                    backgroundColor: categoryColors[c.category] || "var(--parchment-dim)",
                                                                }}
                                                            />
                                                        </div>
                                                        <span className={`text-[10px] font-mono w-10 text-right ${isDark ? "text-parchment/40" : "text-dim"}`}>
                                                            {c.count}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

function StatCard({ isDark, label, value }) {
    return (
        <div
            className={`p-2 rounded-[3px] text-center ${isDark ? "bg-plate/[0.03]" : "bg-ink/[0.02]"
                }`}
            style={{
                border: "1px solid color-mix(in srgb, var(--parchment) 4%, transparent)",
            }}
        >
            <p
                className={`text-sm font-bold ${"text-cinnabar"
                    }`}
            >
                {value}
            </p>
            <p
                className={`text-[9px] ${isDark ? "text-parchment/30" : "text-dim"
                    }`}
            >
                {label}
            </p>
        </div>
    );
}

export default EventStats;
