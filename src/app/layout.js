import { Geist, Geist_Mono } from "next/font/google";
// import "./globals.css";
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-markercluster/styles';
import VisitorCounter from "./components/VisitorCounter";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Gloria",
  description: "A simple Event Visualiser",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      {/* <VisitorCounter/> */}
      </body>
    </html>
  );
}
