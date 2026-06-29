import React from "react";
import { AIRecommendation } from "../types";
import { Sparkles, ArrowUpRight, Loader, CheckCircle } from "lucide-react";
import { motion } from "motion/react";

interface PersonalRecommendationsProps {
  recommendations: AIRecommendation[];
  onRefresh: () => void;
  isLoading: boolean;
  onExecuteRecommendation: (rec: AIRecommendation) => void;
}

export default function PersonalRecommendations({
  recommendations,
  onRefresh,
  isLoading,
  onExecuteRecommendation,
}: PersonalRecommendationsProps) {
  const getTypeColor = (type: AIRecommendation["type"]) => {
    switch (type) {
      case "action_item":
        return {
          bg: "bg-maroon text-peach-light border-maroon hover:bg-maroon-hover",
          badge: "bg-terracotta text-white",
          label: "ACTION REQUIRED",
        };
      case "ledger_alert":
        return {
          bg: "bg-peach text-maroon border-peach hover:bg-peach-dark",
          badge: "bg-maroon text-white",
          label: "LEDGER THREAT",
        };
      case "calendar_shift":
        return {
          bg: "bg-ivory-card text-amber-950 border-amber-900/10 hover:bg-beige-bg/40",
          badge: "bg-peach text-amber-950",
          label: "TIME OPTIMIZATION",
        };
      case "general":
      default:
        return {
          bg: "bg-beige-bg text-amber-900 border-amber-900/10 hover:bg-beige-bg/80",
          badge: "bg-amber-900/10 text-amber-900",
          label: "SYSTEM INSIGHT",
        };
    }
  };

  return (
    <div
      id="personal-recommendations-row"
      className="bg-ivory-card border-2 border-amber-900/10 rounded-2xl p-4 shadow-[4px_4px_0px_0px_rgba(88,24,37,0.08)]"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2 border-b border-amber-900/5">
        <div className="flex items-center gap-2">
          <div className="bg-peach-light p-1.5 rounded-lg border border-peach">
            <Sparkles className="w-4 h-4 text-terracotta animate-pulse" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-maroon">
              Proactive Personal Recommendations
            </h4>
            <p className="text-[10px] text-amber-900/60 font-medium">
              Real-time server-side predictive triage
            </p>
          </div>
        </div>

        <button
          onClick={onRefresh}
          disabled={isLoading}
          className="self-start sm:self-auto bg-terracotta hover:bg-terracotta-hover disabled:bg-amber-900/20 text-ivory-card font-bold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          {isLoading ? (
            <Loader className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Sparkles className="w-3.5 h-3.5" />
          )}
          {isLoading ? "Consulting ClutchAI..." : "Recalculate Insights"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {recommendations.map((rec, idx) => {
          const style = getTypeColor(rec.type);

          return (
            <motion.div
              key={rec.id || idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => onExecuteRecommendation(rec)}
              className={`${style.bg} border rounded-xl p-3.5 cursor-pointer shadow-sm transition-all flex flex-col justify-between relative overflow-hidden group`}
            >
              {/* Subtle top decoration */}
              <div className="absolute top-0 left-0 right-0 h-1 opacity-20 bg-white" />

              <div className="flex items-center justify-between mb-2">
                <span className={`${style.badge} text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded`}>
                  {style.label}
                </span>
                <span className="text-[9px] font-mono font-bold opacity-60">
                  Priority #{idx + 1}
                </span>
              </div>

              <p className="text-xs font-bold leading-relaxed mb-3">
                {rec.text}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-current/10 text-[10px] font-bold">
                <span className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <CheckCircle className="w-3 h-3 text-terracotta" />
                  Execute Immediately
                </span>
                <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
