import React, { useState } from "react";
import { Bill } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  CreditCard,
  Plus,
  DollarSign,
  Calendar,
  AlertTriangle,
  Check,
  TrendingDown,
  Trash2,
  X,
  Sparkles,
} from "lucide-react";

interface LedgerModuleProps {
  bills: Bill[];
  onPayBill: (id: string) => void;
  onAddBill: (bill: Omit<Bill, "id" | "paid">) => void;
  onDeleteBill: (id: string) => void;
}

export default function LedgerModule({
  bills,
  onPayBill,
  onAddBill,
  onDeleteBill,
}: LedgerModuleProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState<number | "">("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState<"Auto-Pay" | "Manual">("Manual");
  const [category, setCategory] = useState<Bill["category"]>("Utility");

  // State to handle animated payout sequence
  const [payingBillId, setPayingBillId] = useState<string | null>(null);
  const [payoutStep, setPayoutStep] = useState<"idle" | "processing" | "done">("idle");

  const handleSettleBalance = (id: string) => {
    setPayingBillId(id);
    setPayoutStep("processing");

    setTimeout(() => {
      setPayoutStep("done");
      setTimeout(() => {
        onPayBill(id);
        setPayingBillId(null);
        setPayoutStep("idle");
      }, 1200);
    }, 1500);
  };

  const calculateDaysRemaining = (dueDateStr: string): number => {
    const due = new Date(dueDateStr);
    const today = new Date();
    // Normalize times
    due.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(val);
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !amount || !dueDate) return;
    onAddBill({
      title,
      amount: Number(amount),
      dueDate,
      status,
      category,
    });
    setTitle("");
    setAmount("");
    setDueDate("");
    setIsAdding(false);
  };

  return (
    <div
      id="ledger-bills-module"
      className="bg-ivory-card border-2 border-amber-900/10 rounded-2xl p-5 shadow-[4px_4px_0px_0px_rgba(88,24,37,0.08)] h-full flex flex-col"
    >
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-900/10">
        <div>
          <h3 className="font-sans font-extrabold text-xl text-maroon flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-terracotta" />
            Commitments & Ledger
          </h3>
          <p className="text-xs text-amber-900/60 font-medium">
            High-Consequence Expiring Debts
          </p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="bg-maroon hover:bg-maroon-hover text-ivory-card transition-colors px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 shadow-[2px_2px_0px_0px_#D96B43]"
        >
          {isAdding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          Register Bill
        </button>
      </div>

      {/* Register Bill Inline Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleCreateBill}
            className="bg-beige-bg/40 border border-peach/50 rounded-xl p-3.5 mb-4 overflow-hidden space-y-3"
          >
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-amber-950/80 mb-1">
                  Commitment Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Server License"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-2 text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-950/80 mb-1">
                  Amount (USD)
                </label>
                <input
                  type="number"
                  placeholder="142.50"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value !== "" ? Number(e.target.value) : "")}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-2 text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-amber-950/80 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1.5 text-xs text-amber-950"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-950/80 mb-1">
                  Type
                </label>
                <select
                  value={category}
                  onChange={(e: any) => setCategory(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1.5 text-xs"
                >
                  <option value="Subscription">Subscription</option>
                  <option value="Utility">Utility</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Rent">Rent</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-amber-950/80 mb-1">
                  Mode
                </label>
                <select
                  value={status}
                  onChange={(e: any) => setStatus(e.target.value)}
                  className="w-full bg-ivory-card border border-amber-950/20 rounded-lg p-1.5 text-xs font-bold"
                >
                  <option value="Manual">Manual Pay</option>
                  <option value="Auto-Pay">Auto-Pay</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-2 py-1 text-xs font-bold text-amber-900/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-terracotta hover:bg-terracotta-hover text-ivory-card px-3 py-1 rounded-lg text-xs font-bold"
              >
                Add Liability
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Bill Payout Simulation Modal/Overlay */}
      <AnimatePresence>
        {payingBillId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-amber-950/40 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-ivory-card border-3 border-maroon rounded-2xl p-6 max-w-md w-full text-center shadow-2xl relative"
            >
              <div className="flex justify-center mb-4">
                <div className="bg-peach-light p-3 rounded-full border-2 border-peach">
                  <DollarSign className="w-8 h-8 text-terracotta animate-bounce" />
                </div>
              </div>

              <h4 className="text-xl font-extrabold text-maroon">
                Clutch Settlement Service
              </h4>
              <p className="text-sm text-amber-900/70 mt-1">
                Authorizing quick-strike balance settlement...
              </p>

              <div className="my-6 p-4 bg-beige-bg/40 rounded-xl border border-peach/30 font-mono">
                <div className="text-xs text-amber-900/50">Target Creditor</div>
                <div className="font-bold text-lg text-maroon">
                  {bills.find((b) => b.id === payingBillId)?.title}
                </div>
                <div className="mt-2 text-xs text-amber-900/50">Amount Blocked</div>
                <div className="text-2xl font-black text-terracotta">
                  {formatCurrency(bills.find((b) => b.id === payingBillId)?.amount || 0)}
                </div>
              </div>

              {payoutStep === "processing" ? (
                <div className="flex flex-col items-center justify-center space-y-2 mt-4">
                  <div className="w-12 h-12 border-4 border-peach border-t-terracotta rounded-full animate-spin" />
                  <span className="text-xs font-bold text-amber-950 font-mono">
                    Executing transaction, securing receipt...
                  </span>
                </div>
              ) : (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center space-y-2 mt-4"
                >
                  <div className="w-12 h-12 bg-emerald-100 border-2 border-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-600 stroke-[3px]" />
                  </div>
                  <span className="text-sm font-bold text-emerald-800 font-mono">
                    Liability Settled! Momentum Restored.
                  </span>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ledger Table Layout */}
      <div className="flex-1 overflow-y-auto max-h-[350px] pr-1">
        {bills.length === 0 ? (
          <div className="h-40 flex flex-col items-center justify-center text-center text-amber-900/40">
            <Check className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="text-sm font-semibold">Zero Outstanding Debts</p>
            <p className="text-xs">Your external ledger is paid clean.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => {
              const daysRemaining = calculateDaysRemaining(bill.dueDate);
              const isUrgent = daysRemaining <= 2 && !bill.paid;

              return (
                <div
                  key={bill.id}
                  className={`border-2 rounded-xl p-4 transition-all relative ${
                    bill.paid
                      ? "bg-beige-bg/20 border-amber-900/5 opacity-50"
                      : isUrgent
                      ? "bg-ivory-card border-maroon urgent-border-pulse shadow-md"
                      : "bg-ivory-card border-amber-900/10 shadow-sm"
                  }`}
                >
                  {/* Urgent Warning Ribbon */}
                  {isUrgent && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 bg-maroon text-white text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded">
                      <AlertTriangle className="w-2.5 h-2.5 text-peach animate-pulse" />
                      CRITICAL &lt; 48H
                    </div>
                  )}

                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] uppercase tracking-wider font-bold text-amber-900/50">
                          {bill.category}
                        </span>
                        <span className="text-amber-900/30">•</span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            bill.status === "Auto-Pay"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {bill.status}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-base text-amber-950 mt-1">
                        {bill.title}
                      </h4>
                    </div>

                    <div className="text-right">
                      <span className="text-lg font-mono font-black text-maroon block">
                        {formatCurrency(bill.amount)}
                      </span>
                      <span className="text-[10px] text-amber-900/60 font-medium flex items-center justify-end gap-1">
                        <Calendar className="w-3 h-3 text-terracotta" />
                        Due {bill.dueDate}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-amber-900/10">
                    <div className="text-xs">
                      {bill.paid ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3px]" /> Paid & Cleared
                        </span>
                      ) : (
                        <span className="text-amber-900/70 font-mono font-semibold">
                          {daysRemaining < 0
                            ? `Overdue by ${Math.abs(daysRemaining)} days!`
                            : daysRemaining === 0
                            ? "Due TODAY!"
                            : `${daysRemaining} days remaining`}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onDeleteBill(bill.id)}
                        className="text-amber-900/40 hover:text-rose-600 p-1.5 rounded-lg hover:bg-beige-bg transition-colors"
                        title="Remove liability"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>

                      {!bill.paid && (
                        <button
                          onClick={() => handleSettleBalance(bill.id)}
                          className="bg-terracotta hover:bg-terracotta-hover text-ivory-card font-extrabold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-sm flex items-center gap-1 active:scale-95"
                        >
                          <Sparkles className="w-3 h-3 text-peach" />
                          Pay Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
