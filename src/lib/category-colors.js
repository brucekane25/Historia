// Shared category palette — muted surveyor's inks for the map and globe.
export const CATEGORY_COLORS = {
  war: "#c14a34",
  political: "#8a7580",
  cultural: "#d99a2b",
  scientific: "#4f9c8a",
  religious: "#b08f3f",
  disasters: "#cf6a2f",
  discoveries: "#4a7fa8",
  historical: "#b5657c",
  economic: "#3f8f86",
  social: "#c16b7a",
  births: "#9a86ad",
  deaths: "#6f7269",
  events: "#3f8f9c",
  environmental: "#5f8f4f",
  holidays: "#c26b8f",
  exploration: "#4f9c8a",
  sports: "#7fa34f",
  technology: "#5a7fb5",
  selected: "#c9a44c",
  Default: "#8a8a80",
};

export function getCategoryColor(category) {
  return CATEGORY_COLORS[category?.toLowerCase()] || CATEGORY_COLORS.Default;
}
