import React, { useState } from "react";
import { Task } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Play,
  Plus,
  Trash2,
  X,
  Zap,
  Timer,
  Pause,
  RotateCcw,
} from "lucide-react";

interface TaskPanelProps {
  tasks: Task[];
  onToggleComplete: (id: string) => void;
  onAddTask: (task: Omit<Task, "id" | "completed">) => void;
  onDeleteTask: (id: string) => void;
  onExecuteAction: (task: Task) => void;
}

export default function TaskPanel({
  tasks,
  onToggleComplete,
  onAddTask,
  onDeleteTask,
  onExecuteAction,
}: TaskPanelProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "medium" | "low">("high");
  const [newCategory, setNewCategory] = useState("Work");
  const [newTime, setNewTime] = useState("12:00 PM");

  // Timer simulation state for direct execution of a task
  const [activeTimerTask, setActiveTimerTask] = useState<Task | null>(null);
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes standard
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerIntervalId, setTimerIntervalId] = useState<any | null>(null);

  const startTimer = (task: Task) => {
    setActiveTimerTask(task);
    setTimeLeft(1500); // reset to 25 mins
    setTimerRunning(true);
    onExecuteAction(task);
  };

  React.useEffect(() => {
    let interval: any;
    if (timerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setTimerRunning(false);
      if (activeTimerTask) {
        onToggleComplete(activeTimerTask.id);
        setActiveTimerTask(null);
      }
    }
    return () => clearInterval(interval);
  }, [timerRunning, timeLeft, activeTimerTask]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask({
      title: newTitle,
      priority: newPriority,
      category: newCategory,
      dueDate: new Date().toISOString().split("T")[0],
      dueTime: newTime,
    });
    setNewTitle("");
    setIsAdding(false);
  };

  return (
    <div
      id="action-items-container"
      className="bg-ivory-card border-2 border-amber-900/10 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(88,24,37,0.08)] flex flex-col h-full"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/10">
        <div>
          <h3 className="font-sans font-extrabold text-xl text-maroon flex items-center gap-2">
            <Zap className="w-5 h-5 text-terracotta fill-terracotta" />
            Action Items
          </h3>
          <p className="text-xs text-amber-900/60 font-medium">
            Intelligent Priority Queue
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-terracotta text-ivory-card hover:bg-terracotta-hover transition-colors p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-[2px_2px_0px_0px_#581825]"
        >
          {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          Add Task
        </button>
      </div>

      {/* Task Creation Form Overlay or Inline Accordion */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="bg-beige-bg/40 border border-peach/50 rounded-xl p-3.5 mb-4 overflow-hidden space-y-3"
          >
            <div>
              <label className="block text-xs font-bold text-amber-950/80 mb-1">
                Objective Name
              </label>
              <input
                type="text"
                placeholder="e.g. Settle presentation deck"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-2 text-sm focus:outline-none focus:border-terracotta"
                required
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-amber-950/80 mb-1">
                  Urgency
                </label>
                <select
                  value={newPriority}
                  onChange={(e: any) => setNewPriority(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1.5 text-xs font-bold text-amber-950"
                >
                  <option value="high">🔥 High</option>
                  <option value="medium">⚡ Medium</option>
                  <option value="low">🌱 Low</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-950/80 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  placeholder="Work"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-amber-950/80 mb-1">
                  Due Time
                </label>
                <input
                  type="text"
                  placeholder="3:00 PM"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1.5 text-xs"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs font-bold text-amber-900/60 hover:text-amber-950"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-maroon hover:bg-maroon-hover text-ivory-card px-3 py-1.5 text-xs font-bold rounded-lg shadow-sm"
              >
                Deploy Task
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Active Sprint Timer Section */}
      <AnimatePresence>
        {activeTimerTask && (
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="bg-maroon text-ivory-card rounded-xl p-4 mb-4 border border-terracotta/40 shadow-md flex flex-col gap-2"
          >
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-terracotta text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-full text-white">
                  CLUTCH FOCUS SPRINT
                </span>
                <h4 className="font-bold text-sm mt-1 truncate max-w-[180px]">
                  {activeTimerTask.title}
                </h4>
              </div>
              <button
                onClick={() => setActiveTimerTask(null)}
                className="text-white/60 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-between bg-black/20 rounded-lg p-3 my-1">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5 text-peach animate-pulse" />
                <span className="font-mono text-xl font-bold tracking-tight">
                  {formatTime(timeLeft)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setTimerRunning(!timerRunning)}
                  className="bg-terracotta hover:bg-terracotta-hover p-1.5 rounded-md text-white transition-colors"
                >
                  {timerRunning ? (
                    <Pause className="w-3.5 h-3.5" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}
                </button>
                <button
                  onClick={() => setTimeLeft(1500)}
                  className="bg-white/10 hover:bg-white/20 p-1.5 rounded-md text-white transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => {
                onToggleComplete(activeTimerTask.id);
                setActiveTimerTask(null);
              }}
              className="w-full bg-ivory-card text-maroon hover:bg-peach hover:text-maroon font-bold text-xs py-1.5 rounded-md text-center transition-all shadow-sm"
            >
              Complete Task & Stop Timer
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List container */}
      <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 max-h-[360px]">
        {tasks.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-amber-900/40 p-4">
            <AlertCircle className="w-8 h-8 stroke-1 mb-2 text-peach" />
            <p className="text-sm font-semibold">Zero task blockages</p>
            <p className="text-xs">Your priority queue is clear.</p>
          </div>
        ) : (
          tasks.map((task) => {
            const isHigh = task.priority === "high";
            const isMedium = task.priority === "medium";

            // Determine card background, border, text color dynamically based on urgency
            let cardBg = "bg-ivory-card border-amber-900/10 text-amber-950";
            let actionBtnClass =
              "bg-terracotta text-ivory-card hover:bg-terracotta-hover";

            if (isHigh && !task.completed) {
              cardBg =
                "bg-maroon text-ivory-card border-maroon urgent-border-pulse";
              actionBtnClass = "bg-peach text-maroon hover:bg-white";
            } else if (isMedium && !task.completed) {
              cardBg = "bg-terracotta text-ivory-card border-terracotta";
              actionBtnClass = "bg-ivory-card text-terracotta hover:bg-peach";
            } else if (task.completed) {
              cardBg = "bg-beige-bg/30 border-amber-900/5 text-amber-950/40";
            }

            return (
              <motion.div
                key={task.id}
                layoutId={`task-${task.id}`}
                className={`${cardBg} border-2 rounded-xl p-3.5 relative shadow-sm flex flex-col justify-between transition-all group`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2.5">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className="mt-0.5 transition-transform active:scale-95"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <div
                          className={`w-5 h-5 rounded-md border-2 ${
                            isHigh || isMedium
                              ? "border-white/50 hover:border-white"
                              : "border-amber-900/30 hover:border-terracotta"
                          } flex items-center justify-center`}
                        />
                      )}
                    </button>
                    <div>
                      <span
                        className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.25 rounded-md ${
                          task.completed
                            ? "bg-amber-900/10 text-amber-900/40"
                            : isHigh
                            ? "bg-amber-950 text-peach"
                            : isMedium
                            ? "bg-maroon text-peach"
                            : "bg-peach-light text-maroon"
                        }`}
                      >
                        {task.category}
                      </span>
                      <h4
                        className={`font-bold text-sm mt-1 leading-snug ${
                          task.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {task.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded-md transition-opacity ${
                      isHigh || isMedium
                        ? "text-white/60 hover:text-white"
                        : "text-amber-900/40 hover:text-rose-600"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between mt-3 pt-3 border-t border-amber-900/10">
                  <span
                    className={`font-mono text-[10px] font-bold ${
                      task.completed
                        ? "text-amber-900/30"
                        : isHigh || isMedium
                        ? "text-peach"
                        : "text-amber-900/60"
                    }`}
                  >
                    Due {task.dueTime ? `@ ${task.dueTime}` : "Today"}
                  </span>

                  {!task.completed && (
                    <button
                      onClick={() => startTimer(task)}
                      className={`${actionBtnClass} px-3 py-1 rounded-lg text-xs font-extrabold flex items-center gap-1 shadow-sm transition-all active:scale-95`}
                    >
                      <Play className="w-3 h-3 fill-current" />
                      Action
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
