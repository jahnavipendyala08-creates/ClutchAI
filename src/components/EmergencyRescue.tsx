import React, { useState } from "react";
import { Sparkles, X, Send, AlertOctagon, RefreshCw, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Task, Bill } from "../types";

interface EmergencyRescueProps {
  isOpen: boolean;
  onClose: () => void;
  tasks: Task[];
  bills: Bill[];
}

export default function EmergencyRescue({ isOpen, onClose, tasks, bills }: EmergencyRescueProps) {
  const [problem, setProblem] = useState("");
  const [advice, setAdvice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRescue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problem.trim()) return;

    setIsLoading(true);
    setAdvice(null);

    try {
      const res = await fetch("/api/rescue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem, tasks, bills }),
      });

      const data = await res.json();
      setAdvice(data.advice || "No rescue advice received. Deep breathe and take small steps.");
    } catch (err) {
      console.error(err);
      setAdvice(
        "ClutchAI offline or signal dropped.\n\nImmediate instructions:\n1. Isolate yourself from distractions.\n2. Write down the absolute single next physical action you must take.\n3. Run a 15-minute sprint. No email, no chat. Just work."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-amber-950/40 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ y: 50, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="relative bg-ivory-card border-3 border-maroon rounded-3xl max-w-lg w-full p-6 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-amber-900/10 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="bg-maroon p-1.5 rounded-xl text-white">
                  <AlertOctagon className="w-5 h-5 text-peach animate-pulse" />
                </div>
                <div>
                  <h3 className="font-sans font-black text-lg text-maroon">
                    Emergency Rescue Triage
                  </h3>
                  <p className="text-[10px] text-amber-900/60 font-semibold uppercase tracking-wider">
                    High-Consequence Crisis Control
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="text-amber-900/40 hover:text-amber-950 p-1.5 rounded-lg hover:bg-beige-bg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              {!advice ? (
                <div className="space-y-4">
                  <div className="p-4 bg-peach-light rounded-2xl border border-peach">
                    <p className="text-xs text-amber-950 leading-relaxed font-semibold">
                      Under massive pressure? Jammed by an overdue deliverable or impending server shutdown? Tell ClutchAI what's happening.
                    </p>
                  </div>

                  <form onSubmit={handleRescue} className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">
                        Describe the crisis in plain English:
                      </label>
                      <textarea
                        rows={4}
                        value={problem}
                        onChange={(e) => setProblem(e.target.value)}
                        placeholder="e.g., 'My client presentation is in 15 minutes, but my local database is failing and my manager is calling my phone!'"
                        className="w-full bg-white border-2 border-amber-900/10 rounded-xl p-3 text-sm focus:outline-none focus:border-terracotta text-amber-950 shadow-inner resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-maroon hover:bg-maroon-hover disabled:bg-amber-900/20 text-ivory-card font-extrabold text-sm py-3 rounded-xl transition-all shadow-[4px_4px_0px_0px_#D96B43] flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-peach" />
                      ) : (
                        <Zap className="w-4 h-4 text-peach fill-peach" />
                      )}
                      {isLoading ? "Drafting Clutch Blueprint..." : "Deploy Rescue Plan"}
                    </button>
                  </form>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-maroon text-peach-light rounded-2xl border-2 border-peach shadow-md">
                    <div className="flex items-center gap-1 text-xs font-bold text-peach mb-2">
                      <Sparkles className="w-4 h-4 text-peach" />
                      CLUTCH BLUEPRINT GENERATED
                    </div>

                    {/* Renders generated Markdown elegantly */}
                    <div className="text-xs space-y-3 leading-relaxed font-sans prose prose-sm prose-invert">
                      {advice.split("\n\n").map((para, pIdx) => {
                        if (para.startsWith("###")) {
                          return (
                            <h4 key={pIdx} className="text-sm font-black text-white mt-4 border-b border-white/10 pb-1">
                              {para.replace("###", "").trim()}
                            </h4>
                          );
                        }
                        if (para.startsWith("**")) {
                          return (
                            <p key={pIdx} className="text-white font-extrabold">
                              {para.trim()}
                            </p>
                          );
                        }
                        return <p key={pIdx}>{para}</p>;
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setAdvice(null);
                        setProblem("");
                      }}
                      className="flex-1 border-2 border-amber-900/10 hover:border-amber-900/20 text-amber-900/70 font-bold text-xs py-2.5 rounded-xl transition-all"
                    >
                      Formulate Another Rescue
                    </button>
                    <button
                      onClick={onClose}
                      className="flex-1 bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-xs py-2.5 rounded-xl transition-all shadow-sm"
                    >
                      Execute Blueprint
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
