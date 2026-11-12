// Shared category palette used by the map and the globe.
export const CATEGORY_COLORS = {
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
  holidays: "#f472b6",
  exploration: "#06b6d4",
  sports: "#84cc16",
  technology: "#0ea5e9",
  selected: "#a78bfa",
  Default: "#94a3b8",
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.Default;
}