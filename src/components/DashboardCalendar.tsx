import React, { useState } from "react";
import { TimeBlock } from "../types";
import { Calendar as CalendarIcon, Clock, Plus, Target, Trash2, Zap } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface DashboardCalendarProps {
  blocks: TimeBlock[];
  onAddBlock: (block: Omit<TimeBlock, "id">) => void;
  onDeleteBlock: (id: string) => void;
}

export default function DashboardCalendar({ blocks, onAddBlock, onDeleteBlock }: DashboardCalendarProps) {
  const [selectedDay, setSelectedDay] = useState<number>(25); // Set to today's date matching context
  const [selectedMonth, setSelectedMonth] = useState("June");
  const [selectedYear, setSelectedYear] = useState(2026);

  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [blockTitle, setBlockTitle] = useState("");
  const [blockType, setBlockType] = useState<"Work" | "Focus" | "Break">("Focus");
  const [blockTime, setBlockTime] = useState("02:00 PM");
  const [blockDuration, setBlockDuration] = useState("1h");

  // Filter state
  const [filterType, setFilterType] = useState<"All" | "Work" | "Focus" | "Break">("All");

  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockTitle.trim()) return;

    onAddBlock({
      title: blockTitle,
      type: blockType,
      time: blockTime,
      duration: blockDuration,
    });
    setBlockTitle("");
    setIsAddingBlock(false);
  };

  const handleDeleteBlock = (id: string) => {
    onDeleteBlock(id);
  };

  const getBlockStyles = (type: TimeBlock["type"]) => {
    switch (type) {
      case "Focus":
        return {
          bg: "bg-peach text-maroon border-l-4 border-terracotta",
          badge: "bg-terracotta text-white",
          icon: <Target className="w-3.5 h-3.5" />,
        };
      case "Work":
        return {
          bg: "bg-peach-light text-amber-950 border-l-4 border-peach-dark",
          badge: "bg-peach-dark text-amber-950",
          icon: <Zap className="w-3.5 h-3.5" />,
        };
      case "Break":
        return {
          bg: "bg-ivory-card text-amber-900/80 border-l-4 border-amber-200 border-2 border-amber-900/5",
          badge: "bg-beige-bg text-amber-900",
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  const filteredBlocks = blocks.filter((b) => {
    if (filterType === "All") return true;
    return b.type === filterType;
  });

  return (
    <div
      id="dashboard-calendar-widget"
      className="bg-ivory-card border-2 border-amber-900/10 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(88,24,37,0.08)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/10">
        <div>
          <h3 className="font-sans font-extrabold text-xl text-maroon flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-terracotta" />
            Clutch Scheduler
          </h3>
          <p className="text-xs text-amber-900/60 font-medium">
            Time-Blocking & Intentional Breaks
          </p>
        </div>

        <div className="flex gap-1.5 bg-beige-bg/60 p-1 rounded-xl">
          {(["All", "Work", "Focus", "Break"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                filterType === type
                  ? "bg-maroon text-ivory-card shadow-sm"
                  : "text-amber-900/60 hover:text-amber-950"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 flex-1 min-h-[380px]">
        {/* Left: Mini Monthly Calendar View */}
        <div className="md:col-span-5 flex flex-col border-r border-amber-900/5 pr-4 justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="font-extrabold text-sm text-maroon">
                {selectedMonth} {selectedYear}
              </span>
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-amber-900/40">
                Mini-Grid
              </span>
            </div>

            {/* Calendar Days Header */}
            <div className="grid grid-cols-7 gap-1 text-center mb-1">
              {["S", "M", "T", "W", "T", "F", "S"].map((d, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-bold text-amber-900/40 font-mono"
                >
                  {d}
                </span>
              ))}
            </div>

            {/* Calendar Grid Days */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding offset for Friday June 1, 2026 */}
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={`empty-${idx}`} />
              ))}
              {daysInMonth.map((day) => {
                const isSelected = selectedDay === day;
                const isToday = day === 25; // Highlight the 25th as current system date

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day)}
                    className={`aspect-square text-xs font-bold rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-terracotta text-white shadow-md scale-105"
                        : isToday
                        ? "bg-maroon text-white border-2 border-peach-dark"
                        : "hover:bg-peach-light text-amber-950"
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-beige-bg/40 rounded-xl border border-peach/20 text-xs">
            <div className="font-extrabold text-maroon flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
              Proactive Shielding Active
            </div>
            <p className="text-amber-900/70 leading-relaxed">
              No overlapping tasks. 45% of your calendar is shielded for deep focus flow.
            </p>
          </div>
        </div>

        {/* Right: Daily Timeline View */}
        <div className="md:col-span-7 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-900/60 font-mono">
              Schedule for June {selectedDay}
            </span>
            <button
              onClick={() => setIsAddingBlock(!isAddingBlock)}
              className="text-terracotta hover:text-terracotta-hover text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Book Block
            </button>
          </div>

          {/* Book Block Form Inline Accordion */}
          <AnimatePresence>
            {isAddingBlock && (
              <motion.form
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                onSubmit={handleCreateBlock}
                className="bg-peach-light/40 border border-peach rounded-xl p-3 mb-3 space-y-2 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-amber-950/80 uppercase">
                      Block Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Design Sync"
                      value={blockTitle}
                      onChange={(e) => setBlockTitle(e.target.value)}
                      className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1 text-xs"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-amber-950/80 uppercase">
                      Time Slot
                    </label>
                    <input
                      type="text"
                      placeholder="02:00 PM"
                      value={blockTime}
                      onChange={(e) => setBlockTime(e.target.value)}
                      className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1 text-xs"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[9px] font-bold text-amber-950/80 uppercase">
                      Type
                    </label>
                    <select
                      value={blockType}
                      onChange={(e: any) => setBlockType(e.target.value)}
                      className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1 text-xs"
                    >
                      <option value="Focus">🎯 Focus Block</option>
                      <option value="Work">⚡ Work Block</option>
                      <option value="Break">☕ Rest/Break</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-amber-950/80 uppercase">
                      Duration
                    </label>
                    <input
                      type="text"
                      placeholder="45 min"
                      value={blockDuration}
                      onChange={(e) => setBlockDuration(e.target.value)}
                      className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1 text-xs"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingBlock(false)}
                    className="text-[10px] font-bold text-amber-900/60"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-maroon hover:bg-maroon-hover text-ivory-card px-2.5 py-1 text-[10px] font-bold rounded"
                  >
                    Confirm Block
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Timeline Blocks List */}
          <div className="flex-1 overflow-y-auto max-h-[280px] space-y-3.5 pr-1">
            {filteredBlocks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-amber-900/30 p-4">
                <Clock className="w-8 h-8 stroke-1 mb-1" />
                <p className="text-xs font-semibold">Empty schedule range</p>
              </div>
            ) : (
              filteredBlocks.map((block) => {
                const styles = getBlockStyles(block.type);

                return (
                  <div
                    key={block.id}
                    className={`${styles.bg} rounded-xl p-3 shadow-sm flex items-center justify-between group relative`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-amber-900 font-mono font-extrabold text-xs">
                        {block.time}
                        <span className="block text-[9px] font-normal text-amber-900/50">
                          ({block.duration})
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`${styles.badge} text-[8px] uppercase tracking-wider font-extrabold px-1.5 rounded`}
                          >
                            {block.type}
                          </span>
                        </div>
                        <h4 className="font-extrabold text-sm mt-0.5 leading-snug">
                          {block.title}
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="text-amber-900/40 p-1">{styles.icon}</div>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="opacity-0 group-hover:opacity-100 text-amber-900/40 hover:text-rose-600 p-1 rounded transition-opacity"
                        title="Delete slot"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
