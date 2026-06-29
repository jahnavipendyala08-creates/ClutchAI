import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Zap,
  Award,
  CreditCard,
  Calendar as CalendarIcon,
  HelpCircle,
  TrendingUp,
  User,
  Edit2,
  Check,
  Bell,
  RefreshCw,
} from "lucide-react";

import { Task, Bill, TimeBlock, AIRecommendation } from "./types";
import TaskPanel from "./components/TaskPanel";
import WeeklyMomentum from "./components/WeeklyMomentum";
import LedgerModule from "./components/LedgerModule";
import DashboardCalendar from "./components/DashboardCalendar";
import PersonalRecommendations from "./components/PersonalRecommendations";
import FloatingNav from "./components/FloatingNav";
import EmergencyRescue from "./components/EmergencyRescue";

import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  getDoc
} from "firebase/firestore";
import { db } from "./lib/firebase";

// Initializing real, representative mock-data to ensure the app works beautifully instantly
const initialTasks: Task[] = [
  {
    id: "task-1",
    title: "Project Phoenix Final Presentation Deck",
    category: "Work",
    priority: "high",
    dueDate: "2026-06-25",
    dueTime: "3:00 PM",
    completed: false,
  },
  {
    id: "task-2",
    title: "Review critical server resource leak logs",
    category: "Dev",
    priority: "medium",
    dueDate: "2026-06-25",
    dueTime: "5:00 PM",
    completed: false,
  },
  {
    id: "task-3",
    title: "Confirm airline check-in & itinerary",
    category: "Personal",
    priority: "low",
    dueDate: "2026-06-25",
    dueTime: "8:00 PM",
    completed: false,
  },
  {
    id: "task-4",
    title: "Verify database replication sanity check",
    category: "Security",
    priority: "high",
    dueDate: "2026-06-25",
    dueTime: "2:00 PM",
    completed: true,
  },
];

const initialBills: Bill[] = [
  {
    id: "bill-1",
    title: "AWS Cloud Server License",
    amount: 142.5,
    dueDate: "2026-06-27", // due soon (<48 hours)
    status: "Manual",
    category: "Subscription",
    paid: false,
  },
  {
    id: "bill-2",
    title: "Enterprise Internet Fiber Line",
    amount: 89.0,
    dueDate: "2026-06-29",
    status: "Auto-Pay",
    category: "Utility",
    paid: false,
  },
  {
    id: "bill-3",
    title: "Corporate Card Settle Balance",
    amount: 2450.0,
    dueDate: "2026-07-02",
    status: "Manual",
    category: "Credit Card",
    paid: false,
  },
  {
    id: "bill-4",
    title: "Acoustic Noise Filter App",
    amount: 12.0,
    dueDate: "2026-06-25",
    status: "Auto-Pay",
    category: "Subscription",
    paid: true,
  },
];

const initialSchedule: TimeBlock[] = [
  {
    id: "block-1",
    time: "09:00 AM",
    duration: "1.5h",
    title: "High-Priority Deliverables Sprint",
    type: "Work",
  },
  {
    id: "block-2",
    time: "11:00 AM",
    duration: "1h",
    title: "Project Phoenix Final Touches",
    type: "Focus",
  },
  {
    id: "block-3",
    time: "12:30 PM",
    duration: "30m",
    title: "Decompress & Hydrate Rest",
    type: "Break",
  },
  {
    id: "block-4",
    time: "01:30 PM",
    duration: "2h",
    title: "Deep Coding & Bug Slaying",
    type: "Focus",
  },
  {
    id: "block-5",
    time: "04:00 PM",
    duration: "1h",
    title: "Admin Tasks & Settle Billing",
    type: "Work",
  },
];

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [schedule, setSchedule] = useState<TimeBlock[]>([]);
  const [activeTab, setActiveTab] = useState("home");
  const [profileName, setProfileName] = useState("Alex");
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState("Alex");

  // AI Recommendations State
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isRecLoading, setIsRecLoading] = useState(false);

  // Emergency Rescue Triage overlay state
  const [isRescueOpen, setIsRescueOpen] = useState(false);

  // Notifications status for visual feedback
  const [notifText, setNotifText] = useState<string | null>(null);

  // Auto-calculate weekly completion momentum rate based on actual tasks
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  // If no tasks, fall back to default requested 92% metric so visual is perfect
  const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 92;

  // Seeding check on mount
  useEffect(() => {
    const checkAndSeed = async () => {
      try {
        const seedRef = doc(db, "settings", "seed_state");
        const seedSnap = await getDoc(seedRef);
        if (!seedSnap.exists() || !seedSnap.data()?.seeded) {
          console.log("Seeding initial data into Firestore...");
          // Seed tasks
          for (const t of initialTasks) {
            await setDoc(doc(db, "tasks", t.id), t);
          }
          // Seed bills
          for (const b of initialBills) {
            await setDoc(doc(db, "bills", b.id), b);
          }
          // Seed schedule
          for (const s of initialSchedule) {
            await setDoc(doc(db, "schedule", s.id), s);
          }
          // Seed profile
          await setDoc(doc(db, "profile", "alex"), { name: "Alex" });
          // Mark as seeded
          await setDoc(seedRef, { seeded: true });
          console.log("Seeding complete!");
        }
      } catch (error) {
        console.error("Error checking or seeding data:", error);
      }
    };

    checkAndSeed();
  }, []);

  // Real-time Firestore sync
  useEffect(() => {
    const unsubTasks = onSnapshot(collection(db, "tasks"), (snapshot) => {
      const list: Task[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as Task);
      });
      setTasks(list);
    });

    const unsubBills = onSnapshot(collection(db, "bills"), (snapshot) => {
      const list: Bill[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as Bill);
      });
      setBills(list);
    });

    const unsubSchedule = onSnapshot(collection(db, "schedule"), (snapshot) => {
      const list: TimeBlock[] = [];
      snapshot.forEach((doc) => {
        list.push({ ...doc.data(), id: doc.id } as TimeBlock);
      });
      setSchedule(list);
    });

    const unsubProfile = onSnapshot(doc(db, "profile", "alex"), (docSnap) => {
      if (docSnap.exists()) {
        const name = docSnap.data()?.name || "Alex";
        setProfileName(name);
        setTempName(name);
      }
    });

    return () => {
      unsubTasks();
      unsubBills();
      unsubSchedule();
      unsubProfile();
    };
  }, []);

  // Sync / fetch AI recommendations from backend
  const fetchAIRecommendations = async () => {
    setIsRecLoading(true);
    try {
      const response = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: tasks.filter((t) => !t.completed),
          bills: bills.filter((b) => !b.paid),
          schedule: schedule.length > 0 ? schedule : initialSchedule,
        }),
      });
      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.error("AI Recommendation Fetch Error:", err);
      // Fallback standard items if backend has connection hiccups
      setRecommendations([
        {
          id: "rec-fallback-1",
          type: "action_item",
          text: "Action Item: Tackle 'Project Phoenix Final Presentation Deck' first.",
          actionId: "task-1",
        },
        {
          id: "rec-fallback-2",
          type: "ledger_alert",
          text: "Ledger Alert: Settle AWS Cloud Server License balance to keep your momentum streak.",
          actionId: "bill-1",
        },
        {
          id: "rec-fallback-3",
          type: "calendar_shift",
          text: "Calendar Alert: Secure 45m deep focus window immediately after lunch block.",
          actionId: "block-4",
        },
      ]);
    } finally {
      setIsRecLoading(false);
    }
  };

  // Run on mount or when key collections are loaded/changed
  useEffect(() => {
    if (tasks.length > 0 || bills.length > 0) {
      fetchAIRecommendations();
    }
  }, [tasks.length, bills.length]);

  const triggerNotification = (text: string) => {
    setNotifText(text);
    setTimeout(() => {
      setNotifText(null);
    }, 4000);
  };

  // Task Actions
  const handleToggleTaskComplete = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (task) {
      const nextCompleted = !task.completed;
      await updateDoc(doc(db, "tasks", id), { completed: nextCompleted });
      triggerNotification(
        nextCompleted
          ? `Secured objective: "${task.title}"! Momentum updated.`
          : `Restored priority blockage: "${task.title}"`
      );
    }
  };

  const handleAddTask = async (newTaskData: Omit<Task, "id" | "completed">) => {
    const newTask = {
      ...newTaskData,
      completed: false,
    };
    await addDoc(collection(db, "tasks"), newTask);
    triggerNotification(`Deployed critical objective: "${newTaskData.title}"`);
  };

  const handleDeleteTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    await deleteDoc(doc(db, "tasks", id));
    if (task) {
      triggerNotification(`Purged objective: "${task.title}" from queue.`);
    }
  };

  // Settle Bill/Ledger Commitment
  const handlePayBill = async (id: string) => {
    const bill = bills.find((b) => b.id === id);
    if (bill) {
      await updateDoc(doc(db, "bills", id), { paid: true });
      triggerNotification(`Liability settled with ${bill.title}. Ledger balanced.`);
    }
  };

  const handleAddBill = async (newBillData: Omit<Bill, "id" | "paid">) => {
    const newBill = {
      ...newBillData,
      paid: false,
    };
    await addDoc(collection(db, "bills"), newBill);
    triggerNotification(`Registered liability to ${newBillData.title} (${newBillData.amount})`);
  };

  const handleDeleteBill = async (id: string) => {
    await deleteDoc(doc(db, "bills", id));
  };

  // Scheduler Actions
  const handleAddBlock = async (newBlockData: Omit<TimeBlock, "id">) => {
    await addDoc(collection(db, "schedule"), newBlockData);
    triggerNotification(`Scheduled new block: "${newBlockData.title}"`);
  };

  const handleDeleteBlock = async (id: string) => {
    const block = schedule.find((s) => s.id === id);
    await deleteDoc(doc(db, "schedule", id));
    if (block) {
      triggerNotification(`Removed block: "${block.title}"`);
    }
  };

  // Direct action execution from recommendations click
  const handleExecuteRecommendation = (rec: AIRecommendation) => {
    if (rec.actionId) {
      // Find matching task or bill and direct highlight or execute
      const matchingTask = tasks.find((t) => t.id === rec.actionId);
      const matchingBill = bills.find((b) => b.id === rec.actionId);

      if (matchingTask) {
        // Toggle complete or scroll to tasks
        setActiveTab("tasks");
        triggerNotification(`Executing Recommendation: Running Focus block for "${matchingTask.title}"`);
        // Highlight task element
        const el = document.getElementById("action-items-container");
        el?.scrollIntoView({ behavior: "smooth" });
      } else if (matchingBill) {
        setActiveTab("ledger");
        triggerNotification(`Executing Recommendation: Settle outstanding balance for "${matchingBill.title}"`);
        const el = document.getElementById("ledger-bills-module");
        el?.scrollIntoView({ behavior: "smooth" });
      } else {
        triggerNotification(`Redirecting to action slot for insight`);
      }
    } else {
      setIsRescueOpen(true);
    }
  };

  const handleExecuteAction = (task: Task) => {
    triggerNotification(`Launching focus session for: "${task.title}"`);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempName.trim()) {
      await setDoc(doc(db, "profile", "alex"), { name: tempName });
      setIsEditingName(false);
      triggerNotification(`Identity calibrated. Welcome back, ${tempName}!`);
    }
  };

  return (
    <div className="min-h-screen bg-beige-bg pb-28 pt-4 px-4 sm:px-6 lg:px-8">
      {/* Dynamic Toast Notification Area */}
      <AnimatePresence>
        {notifText && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-maroon text-peach-light border-2 border-peach px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 font-semibold text-xs"
          >
            <div className="bg-terracotta p-1 rounded-lg">
              <Zap className="w-4 h-4 text-white animate-pulse" />
            </div>
            <span>{notifText}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Component A: Header & Greeting Banner */}
        <header
          id="clutch-greeting-header"
          className="bg-ivory-card border-2 border-amber-900/10 rounded-2xl p-6 shadow-[4px_4px_0px_0px_rgba(88,24,37,0.08)] relative overflow-hidden"
        >
          {/* Decorative Corner Accents representing high velocity / flat grids */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-peach opacity-30 rounded-bl-full pointer-events-none" />
          <div className="absolute top-0 right-0 w-12 h-12 bg-terracotta opacity-20 rounded-bl-full pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="bg-maroon p-3.5 rounded-2xl border-2 border-peach flex items-center justify-center shadow-inner">
                <Zap className="w-7 h-7 text-peach fill-peach" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase font-extrabold tracking-wider bg-peach text-maroon px-2 py-0.5 rounded-full">
                    Active System Copilot
                  </span>
                  <span className="text-amber-900/30 font-mono text-[10px]">•</span>
                  <span className="font-mono text-[10px] uppercase font-bold text-amber-900/60">
                    Host: Cloud-Safe
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {isEditingName ? (
                    <form onSubmit={handleSaveName} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="bg-beige-bg border-2 border-terracotta rounded-lg px-2.5 py-1 text-sm font-black text-maroon focus:outline-none"
                        autoFocus
                      />
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-1 rounded-md"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </form>
                  ) : (
                    <h1 className="font-sans font-black text-2xl sm:text-3xl text-maroon flex items-center gap-2 leading-none">
                      Welcome back, {profileName}.
                      <button
                        onClick={() => {
                          setTempName(profileName);
                          setIsEditingName(true);
                        }}
                        className="text-amber-900/40 hover:text-maroon p-1 rounded-md transition-colors"
                        title="Calibrate Identity"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </h1>
                  )}
                </div>
                <p className="text-sm font-semibold text-amber-900/70 mt-1 leading-snug">
                  Let’s make today count. Your urgent blockage vectors are secured.
                </p>
              </div>
            </div>

            {/* Quick Metrics HUD */}
            <div className="flex items-center gap-4 bg-beige-bg/50 p-3 rounded-xl border border-peach/20 self-start sm:self-auto font-mono text-xs">
              <div className="text-center px-2">
                <span className="text-amber-900/50 block text-[9px] font-bold">BLOCKAGES</span>
                <span className="text-base font-black text-maroon">
                  {tasks.filter((t) => !t.completed).length}
                </span>
              </div>
              <div className="w-px h-8 bg-amber-900/10" />
              <div className="text-center px-2">
                <span className="text-amber-900/50 block text-[9px] font-bold">EXPIRING LIABILITIES</span>
                <span className="text-base font-black text-terracotta">
                  {bills.filter((b) => !b.paid).length}
                </span>
              </div>
              <div className="w-px h-8 bg-amber-900/10" />
              <div className="text-center px-2">
                <span className="text-amber-900/50 block text-[9px] font-bold">SHIELDED SLOTS</span>
                <span className="text-base font-black text-emerald-800">45%</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Nav Filtering layout to coordinate sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Action Items Panel (Component B) */}
          <div
            className={`lg:col-span-4 transition-all duration-300 ${
              activeTab !== "home" && activeTab !== "tasks" ? "hidden lg:block opacity-40 hover:opacity-100" : ""
            }`}
          >
            <TaskPanel
              tasks={tasks}
              onToggleComplete={handleToggleTaskComplete}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onExecuteAction={handleExecuteAction}
            />
          </div>

          {/* Center Column: Weekly Momentum (Component C) & Personal Recommendations (Component F) */}
          <div
            className={`lg:col-span-4 space-y-6 transition-all duration-300 ${
              activeTab !== "home" && activeTab !== "calendar" && activeTab !== "tasks" ? "hidden lg:block opacity-40 hover:opacity-100" : ""
            }`}
          >
            <WeeklyMomentum
              completionRate={completionRate}
              totalTasks={totalTasks}
              completedTasks={completedTasks}
            />
            <PersonalRecommendations
              recommendations={recommendations}
              onRefresh={fetchAIRecommendations}
              isLoading={isRecLoading}
              onExecuteRecommendation={handleExecuteRecommendation}
            />
          </div>

          {/* Right Column: Ledger Module (Component D) */}
          <div
            className={`lg:col-span-4 space-y-6 transition-all duration-300 ${
              activeTab !== "home" && activeTab !== "ledger" ? "hidden lg:block opacity-40 hover:opacity-100" : ""
            }`}
          >
            <LedgerModule
              bills={bills}
              onPayBill={handlePayBill}
              onAddBill={handleAddBill}
              onDeleteBill={handleDeleteBill}
            />
          </div>

          {/* Full-width Extended Row: Scheduler View (Component E) */}
          <div
            className={`lg:col-span-12 transition-all duration-300 ${
              activeTab !== "home" && activeTab !== "calendar" ? "hidden lg:block opacity-40 hover:opacity-100" : ""
            }`}
          >
            <DashboardCalendar blocks={schedule} onAddBlock={handleAddBlock} onDeleteBlock={handleDeleteBlock} />
          </div>
        </div>

        {/* Footer Area with Humble Professional design branding */}
        <footer className="text-center text-[10px] text-amber-900/35 font-mono py-4 pb-12">
          CLUTCHAI PROACTIVE TRIAGE MODULE • CONVERGING HIGH CONSEQUENCE DECISIONS INTO ACTION • CREATED WITH STABILITY
        </footer>
      </div>

      {/* Component G: Floating Bottom Navigation dock */}
      <FloatingNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          setActiveTab(tab);
          // Auto scroll to corresponding module on mobile/narrow viewports
          if (tab === "tasks") {
            document.getElementById("action-items-container")?.scrollIntoView({ behavior: "smooth" });
          } else if (tab === "ledger") {
            document.getElementById("ledger-bills-module")?.scrollIntoView({ behavior: "smooth" });
          } else if (tab === "calendar") {
            document.getElementById("dashboard-calendar-widget")?.scrollIntoView({ behavior: "smooth" });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
        onOpenRescue={() => setIsRescueOpen(true)}
      />

      {/* Sliding Dialog for Emergency Rescue Chat */}
      <EmergencyRescue
        isOpen={isRescueOpen}
        onClose={() => setIsRescueOpen(false)}
        tasks={tasks}
        bills={bills}
      />
    </div>
  );
}
