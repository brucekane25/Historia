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

const LATEST_VERSION = "3.0.0";

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
      <DialogContent className="sm:max-w-[440px] bg-[#0f1120] border border-white/10 text-white z-[1040]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <DialogTitle className="text-lg font-bold text-white">
              What&apos;s New in Gloria v3
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="py-2">
          <p className="text-sm text-white/50 mb-4">
            Here&apos;s what&apos;s new:
          </p>
          <ul className="space-y-2.5">
            {[
              {
                emoji: "⭐",
                title: "Bookmarked Events",
                desc: "Save your favorite events and access them anytime",
              },
              {
                emoji: "📅",
                title: "On This Day",
                desc: "Discover what happened on today's date throughout history",
              },
              {
                emoji: "🔍",
                title: "Event Detail Modal",
                desc: "Rich event details with Wikipedia links and quick actions",
              },
              {
                emoji: "⌨️",
                title: "Command Palette",
                desc: "Press ⌘K to search events and access quick actions",
              },
              {
                emoji: "🔗",
                title: "Share Events",
                desc: "Copy a link to any event and share it with others",
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
