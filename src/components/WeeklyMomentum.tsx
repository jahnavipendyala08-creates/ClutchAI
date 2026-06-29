import React from "react";
import { motion } from "motion/react";
import { Award, CheckCircle2, TrendingUp } from "lucide-react";

interface WeeklyMomentumProps {
  completionRate: number; // e.g. 92
  totalTasks: number;
  completedTasks: number;
}

export default function WeeklyMomentum({
  completionRate,
  totalTasks,
  completedTasks,
}: WeeklyMomentumProps) {
  // SVG circular path calculation
  const radius = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (completionRate / 100) * circumference;

  return (
    <div
      id="weekly-momentum-card"
      className="bg-ivory-card border-2 border-amber-900/10 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(88,24,37,0.08)] flex flex-col items-center justify-between h-full relative overflow-hidden"
    >
      {/* Decorative Warm Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-peach" />

      <div className="w-full flex items-center justify-between mb-4">
        <h3 className="font-sans font-bold text-lg text-maroon flex items-center gap-2">
          <Award className="w-5 h-5 text-terracotta" />
          Weekly Momentum
        </h3>
        <div className="bg-peach-light text-maroon px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 border border-peach-dark/30">
          <TrendingUp className="w-3.5 h-3.5 text-terracotta" />
          Elite tier
        </div>
      </div>

      {/* Main Metric Visualization */}
      <div className="relative flex items-center justify-center my-4 w-40 h-40">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-beige-bg"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Foreground animated circle */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            className="stroke-terracotta"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-4xl font-extrabold text-maroon font-mono tracking-tight"
          >
            {Math.round(completionRate)}%
          </motion.span>
          <span className="text-[10px] uppercase tracking-widest font-bold text-amber-900/60 mt-0.5">
            Completed
          </span>
        </div>
      </div>

      {/* Descriptive Labels */}
      <div className="text-center w-full mt-2">
        <p className="text-sm font-semibold text-amber-950 px-2 leading-snug">
          You completed <span className="text-terracotta font-bold">{Math.round(completionRate)}%</span> of prioritized tasks this week.
        </p>
        <p className="text-xs text-amber-900/60 mt-2 flex items-center justify-center gap-1.5 font-mono">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {completedTasks}/{totalTasks} critical objectives secured
        </p>
      </div>

      {/* Fun progress bar underneath */}
      <div className="w-full bg-beige-bg h-1.5 rounded-full overflow-hidden mt-4">
        <div
          className="bg-maroon h-full transition-all duration-500 ease-out"
          style={{ width: `${completionRate}%` }}
        />
      </div>
    </div>
  );
}
