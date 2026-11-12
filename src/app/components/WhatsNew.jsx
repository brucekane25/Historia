"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const LATEST_VERSION = "3.1.0";

const WhatsNew = ({ lightMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDark = !lightMode;

  useEffect(() => {
    const timer = setTimeout(() => {
      // Don't stack the release notes on top of the first-run tour.
      if (sessionStorage.getItem("gloria_onboarding_active")) return;

      const lastSeenVersion = localStorage.getItem("lastSeenVersion");
      if (lastSeenVersion !== LATEST_VERSION) {
        setIsOpen(true);
        localStorage.setItem("lastSeenVersion", LATEST_VERSION);
      }
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className={`sm:max-w-[440px] z-[1040] border ${isDark ? "bg-[#0f1120] border-white/10 text-white" : "bg-white border-black/10 text-gray-900"}`}>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <DialogTitle className={`text-lg font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              What&apos;s New in Gloria v3.1
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2">
          <p className={`text-sm mb-4 ${isDark ? "text-white/50" : "text-gray-500"}`}>
            Here&apos;s what&apos;s new:
          </p>
          <ul className="space-y-2.5">
            {[
              {
                emoji: "🌍",
                title: "Live 3D Globe",
                desc: "Glowing event points, density heat, connection arcs, and focus-on-select",
              },
              {
                emoji: "🗺️",
                title: "Keyless Map Layers",
                desc: "Dark, light, satellite, terrain, and street tiles with no API key required",
              },
              {
                emoji: "🔍",
                title: "Full-Archive Search",
                desc: "Search every event in the archive from the navbar or command palette",
              },
              {
                emoji: "🔖",
                title: "Persistent Bookmarks",
                desc: "Saved events now stay available even after changing filters or pages",
              },
              {
                emoji: "📊",
                title: "Sharper Stats & Links",
                desc: "Cleaner global statistics, shareable event links, and quick actions",
              },
            ].map((item, i) => (
              <li
                key={i}
                className={`flex items-start gap-3 p-2.5 rounded-lg border ${isDark ? "bg-white/[0.03] border-white/[0.04]" : "bg-black/[0.02] border-black/[0.04]"}`}
              >
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <h4 className={`text-sm font-medium ${isDark ? "text-white" : "text-gray-900"}`}>
                    {item.title}
                  </h4>
                  <p className={`text-xs ${isDark ? "text-white/40" : "text-gray-500"}`}>{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <DialogFooter>
          <Button
            onClick={handleClose}
            className="bg-purple-600 hover:bg-purple-500 text-white w-full"
          >
            Awesome!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WhatsNew;
