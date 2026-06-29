export interface Task {
  id: string;
  title: string;
  category: string;
  priority: "high" | "medium" | "low";
  dueDate: string; // ISO string or simple date string
  dueTime?: string;
  completed: boolean;
  notes?: string;
}

export interface Bill {
  id: string;
  title: string;
  amount: number;
  dueDate: string; // YYYY-MM-DD
  status: "Auto-Pay" | "Manual";
  category: "Subscription" | "Utility" | "Credit Card" | "Rent" | "Other";
  paid: boolean;
}

export interface TimeBlock {
  id: string;
  time: string; // e.g. "09:00 AM"
  duration: string; // e.g. "1h"
  title: string;
  type: "Work" | "Focus" | "Break";
  colorClass?: string;
}

export interface AIRecommendation {
  id: string;
  type: "action_item" | "ledger_alert" | "calendar_shift" | "general";
  text: string;
  actionId?: string;
}
