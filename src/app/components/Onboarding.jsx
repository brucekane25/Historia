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
import { Globe, Map, Compass, Sparkles, ArrowRight, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: <Globe className="w-8 h-8 text-purple-400" />,
    title: "Welcome to Gloria",
    description:
      "Explore thousands of historical events across every era, region, and category — on an interactive map or 3D globe.",
  },
  {
    icon: <Map className="w-8 h-8 text-purple-400" />,
    title: "Map & Globe Views",
    description:
      "Switch between a fast clustered map and a live 3D globe. The globe renders events as glowing points, with an optional density heatmap and animated connection arcs.",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
    title: "Explore the Live Globe",
    description:
      "Hover a point to preview an event, click to open it, and focus the camera on any selection. Use the Density, Arcs, Glow, and Pins controls to shape the view.",
  },
  {
    icon: <Compass className="w-8 h-8 text-purple-400" />,
    title: "Filter & Search",
    description:
      "Use the Tweaks panel to filter by year range, categories, and page size. Search the full archive from the navbar or command palette, or hit Surprise Me for a random event.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    title: "Ready to Explore!",
    description:
      "Save events with bookmarks, share links, open the stats panel, and switch themes. Press Ctrl/⌘ K anytime to jump anywhere.",
  },
];

const Onboarding = ({ forceOpen, onClose, lightMode = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const isDark = !lightMode;

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setStep(0);
      sessionStorage.setItem("gloria_onboarding_active", "true");
      return;
    }
    const hasVisited = localStorage.getItem("gloria_onboarded_v3");
    if (!hasVisited) {
      setIsOpen(true);
      sessionStorage.setItem("gloria_onboarding_active", "true");
      localStorage.setItem("gloria_onboarded_v3", "true");
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setStep(0);
    sessionStorage.removeItem("gloria_onboarding_active");
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  const currentStep = steps[step];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(); }}>
      <DialogContent className={`sm:max-w-[440px] z-[1040] border ${isDark ? "bg-[#0f1120] border-white/10 text-white" : "bg-white border-black/10 text-gray-900"}`}>
        <DialogHeader>
          <div className="flex flex-col items-center text-center pt-4">
            <div className="relative mb-4">
              {currentStep.icon}
              <div className="absolute inset-0 blur-xl bg-purple-500/20 rounded-full" />
            </div>
            <DialogTitle className={`text-xl font-bold ${isDark ? "text-white" : "text-gray-900"}`}>
              {currentStep.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="text-center px-4 pb-2">
          <p className={`text-sm leading-relaxed ${isDark ? "text-white/60" : "text-gray-500"}`}>
            {currentStep.description}
          </p>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center gap-1.5 py-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step
                ? "w-6 bg-purple-500"
                : i < step
                  ? "w-1.5 bg-purple-500/40"
                  : `w-1.5 ${isDark ? "bg-white/10" : "bg-black/10"}`
                }`}
            />
          ))}
        </div>

        <DialogFooter className="flex gap-2 sm:justify-center">
          {step < steps.length - 1 ? (
            <>
              <Button
                variant="ghost"
                onClick={handleClose}
                className={`${isDark ? "text-white/40 hover:text-white hover:bg-white/5" : "text-gray-400 hover:text-gray-900 hover:bg-black/5"}`}
              >
                Skip
              </Button>
              <Button
                onClick={handleNext}
                className="bg-purple-600 hover:bg-purple-500 text-white gap-1"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </>
          ) : (
            <Button
              onClick={handleClose}
              className="bg-purple-600 hover:bg-purple-500 text-white px-8"
            >
              Let&apos;s Explore!
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default Onboarding;