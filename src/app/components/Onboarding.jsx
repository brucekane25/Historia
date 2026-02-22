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
      "Switch between a classic map view and an immersive 3D globe. On the globe, toggle between cluster bars (showing event density) and individual pins.",
  },
  {
    icon: <BarChart3 className="w-8 h-8 text-purple-400" />,
    title: "3D Cluster Bars",
    description:
      "The globe shows 3D bars whose height indicates the number of events in each region. Hover to see a breakdown by category. Click to explore individual events.",
  },
  {
    icon: <Compass className="w-8 h-8 text-purple-400" />,
    title: "Filter & Explore",
    description:
      "Use the Tweaks panel to filter by year range and category. Search events by name in the navbar. Use the Random button to discover new events.",
  },
  {
    icon: <Sparkles className="w-8 h-8 text-purple-400" />,
    title: "Ready to Explore!",
    description:
      "Toggle dark mode, open the stats panel to see event distributions, and dive into history. Use the sidebar icons to access all features.",
  },
];

const Onboarding = ({ forceOpen, onClose }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setStep(0);
      return;
    }
    const hasVisited = localStorage.getItem("gloria_onboarded_v3");
    if (!hasVisited) {
      setIsOpen(true);
      localStorage.setItem("gloria_onboarded_v3", "true");
    }
  }, [forceOpen]);

  const handleClose = () => {
    setIsOpen(false);
    setStep(0);
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
      <DialogContent className="sm:max-w-[440px] bg-[#0f1120] border border-white/10 text-white z-[1040]">
        <DialogHeader>
          <div className="flex flex-col items-center text-center pt-4">
            <div className="relative mb-4">
              {currentStep.icon}
              <div className="absolute inset-0 blur-xl bg-purple-500/20 rounded-full" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              {currentStep.title}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="text-center px-4 pb-2">
          <p className="text-sm text-white/60 leading-relaxed">
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
                  : "w-1.5 bg-white/10"
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
                className="text-white/40 hover:text-white hover:bg-white/5"
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