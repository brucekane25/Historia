import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';
import './globals.css';

export const metadata = {
  title: "Gloria — Explore History on a Globe",
  description: "An interactive 3D globe and map that lets you explore thousands of historical events across every era, region, and category. Discover wars, revolutions, discoveries, and more.",
  keywords: ["history", "map", "globe", "events", "timeline", "3D", "interactive"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" style={{ fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </body>
    </html>
  );
}
