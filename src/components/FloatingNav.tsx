import React from "react";
import { Home, ClipboardList, CreditCard, Calendar, Sparkles } from "lucide-react";
import { motion } from "motion/react";

interface FloatingNavProps {
  activeTab: string;
  onChangeTab: (tab: string) => void;
  onOpenRescue: () => void;
}

export default function FloatingNav({ activeTab, onChangeTab, onOpenRescue }: FloatingNavProps) {
  const tabs = [
    { id: "home", label: "Home", icon: <Home className="w-4 h-4" /> },
    { id: "tasks", label: "Tasks", icon: <ClipboardList className="w-4 h-4" /> },
    { id: "ledger", label: "Ledger", icon: <CreditCard className="w-4 h-4" /> },
    { id: "calendar", label: "Calendar", icon: <Calendar className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
      <div className="backdrop-blur-md bg-ivory-card/85 border-2 border-amber-900/10 shadow-[0px_8px_24px_rgba(88,24,37,0.08),4px_4px_0px_0px_rgba(217,107,67,0.1)] px-5 py-3 rounded-full flex items-center gap-6 pointer-events-auto max-w-md">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className="relative flex flex-col items-center justify-center text-amber-950 font-sans transition-all active:scale-90"
            >
              {/* Dynamic slide indicator */}
              {isActive && (
                <motion.div
                  layoutId="active-dock-indicator"
                  className="absolute -inset-x-2 -inset-y-1.5 bg-peach-light rounded-full z-0"
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                />
              )}

              <div className="relative z-10 flex items-center gap-1.5 px-2 py-0.5">
                <span className={isActive ? "text-terracotta" : "text-amber-950/60"}>
                  {tab.icon}
                </span>
                <span
                  className={`text-xs font-extrabold tracking-tight transition-colors ${
                    isActive ? "text-maroon" : "text-amber-950/60"
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          );
        })}

        {/* Separator */}
        <div className="w-0.5 h-6 bg-amber-900/10" />

        {/* Emergency Rescue Trigger */}
        <button
          onClick={onOpenRescue}
          className="bg-maroon hover:bg-maroon-hover text-white px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 shadow-sm hover:shadow transition-all active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5 text-peach animate-pulse" />
          Rescue
        </button>
      </div>
    </div>
  );
}
