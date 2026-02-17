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
import { Sparkles, X } from "lucide-react";

const LATEST_VERSION = "2.0.0";

const WhatsNew = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const lastSeenVersion = localStorage.getItem("lastSeenVersion");
    if (lastSeenVersion !== LATEST_VERSION) {
      setIsOpen(true);
      localStorage.setItem("lastSeenVersion", LATEST_VERSION);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[440px] bg-[#0f1120] border border-white/10 text-white">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <DialogTitle className="text-lg font-bold text-white">
              What's New in Gloria v2
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-white/50 mb-4">
            Here's what we've been working on:
          </p>
          <ul className="space-y-2.5">
            {[
              {
                emoji: "🌍",
                title: "3D Globe View",
                desc: "Explore events on an interactive Three.js globe",
              },
              {
                emoji: "✨",
                title: "Complete UI Redesign",
                desc: "Glassmorphic design with smooth animations",
              },
              {
                emoji: "🌙",
                title: "Enhanced Dark Mode",
                desc: "Refined dark theme across all components",
              },
              {
                emoji: "🎯",
                title: "Better Navigation",
                desc: "Floating toolbar, horizontal scrolling cards, and more",
              },
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.04]"
              >
                <span className="text-lg">{item.emoji}</span>
                <div>
                  <h4 className="text-sm font-medium text-white">
                    {item.title}
                  </h4>
                  <p className="text-xs text-white/40">{item.desc}</p>
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
