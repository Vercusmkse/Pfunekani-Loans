import React, { useState } from "react";
import { Coins, Clock, ArrowUpRight, Wallet } from "lucide-react";
import { useApp } from "../../context/AppContext";

export default function ClientDashboard() {
  const { currentUser, loans, createLoanRequest, payClientInterestOnly } =
    useApp();
  const [amount, setAmount] = useState(
    currentUser.tier === "Senior" ? 2000 : 500,
  );
  const [purpose, setPurpose] = useState("");
  const [msg, setMsg] = useState(null);

  const clientHistory = loans.filter(
    (l) => l.borrowerName === currentUser.name,
  );
  const maxCapping = currentUser.tier === "Senior" ? 10000 : 500;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!purpose) {
      alert("Please state a clear reason for the loan request.");
      return;
    }
    const execution = createLoanRequest(currentUser, amount, purpose);
    if (execution.success) {
      setMsg({
        success: true,
        text: `Capital Request for R${amount} submitted for 30-day vetting tracking!`,
      });
      setPurpose("");
    } else {
      setMsg({ success: false, text: execution.msg });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
      <div className="lg:col-span-12 bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <span className="text-[10px] text-slate-500 uppercase font-mono tracking-widest block font-bold">
            Client Workspace
          </span>
          <h2 className="text-xl font-black text-white tracking-tight">
            {currentUser.name}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
              Tier Ranking: {currentUser.tier}
            </span>
            <span className="text-xs text-slate-400">
              Maximum Allotment Capacity:{" "}
              <strong className="text-white">R{maxCapping}</strong>
            </span>
          </div>
        </div>
        <div className="bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-850 flex items-center gap-3">
          <Wallet className="w-5 h-5 text-indigo-400" />
          <div>
            <span className="text-[9px] uppercase font-bold text-slate-500 block">
              Linked Contracts
            </span>
            <span className="text-sm font-black text-slate-200">
              {clientHistory.length} Registered
            </span>
          </div>
        </div>
      </div>

      <div className="lg:col-span-5 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
            <Coins className="w-4 h-4 text-emerald-400" /> Standard 30-Day
            Contract Request
          </h3>

          {msg && (
            <div
              className={`p-3 rounded-xl text-xs border font-medium ${msg.success ? "bg-emerald-950/40 border-emerald-900/60 text-emerald-400" : "bg-red-950/40 border-red-900/60 text-red-400"}`}
            >
              {msg.text}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-xs font-bold text-slate-300 mb-1">
                <label htmlFor="capital-sum">Requested Capital Sum</label>
                <span className="text-emerald-400 font-black text-sm">
                  R {amount}
                </span>
              </div>
              <input
                id="capital-sum"
                type="range"
                min="100"
                max={maxCapping}
                step="100"
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Min R100</span>
                <span>Profile Limit R{maxCapping}</span>
              </div>
            </div>

            <div>
              <label
                htmlFor="allocation-intention"
                className="text-[10px] text-slate-400 uppercase font-bold block mb-1"
              >
                Operational Allocation Intention
              </label>
              <textarea
                id="allocation-intention"
                rows="2"
                placeholder="e.g., Purchasing winter vegetable stock or processing store supplies..."
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none resize-none font-medium"
              />
            </div>

            <div className="bg-slate-950 border border-slate-850 p-3.5 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Contract Timeline:</span>
                <span className="text-white font-bold font-mono">
                  30 Days (Fixed)
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Interest Assessment (40%):</span>
                <span className="text-amber-400 font-bold font-mono">
                  R {(amount * 0.4).toFixed(2)}
                </span>
              </div>
              <div className="border-t border-slate-900 pt-2 flex justify-between items-center text-xs font-black text-white">
                <span>Total Due At Maturity:</span>
                <span className="text-emerald-400 font-mono">
                  R {(amount * 1.4).toFixed(2)}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-widest transition shadow-sm"
            >
              Submit Funding Request
            </button>
          </form>
        </div>
      </div>

      <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
        <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-400" /> Account Transaction
          History
        </h3>

        {clientHistory.length === 0 ? (
          <p className="text-slate-500 text-xs py-12 font-medium text-center">
            No structural loan portfolios registered to your active session
            profile.
          </p>
        ) : (
          <div className="space-y-3">
            {clientHistory.map((loanItem) => (
              <div
                key={loanItem.id}
                className="bg-slate-950 border border-slate-850 p-4 rounded-xl relative overflow-hidden"
              >
                <div
                  className={`absolute top-0 right-0 px-2 py-0.5 rounded-bl text-[9px] uppercase font-bold border-l border-b ${
                    loanItem.status === "Active"
                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-900"
                      : loanItem.status === "Pending Approval"
                        ? "bg-amber-950/60 text-amber-400 border-amber-900"
                        : "bg-slate-900 text-slate-500 border-slate-800"
                  }`}
                >
                  {loanItem.status}
                </div>

                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mt-2">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-slate-500 block font-bold">
                      ID: {loanItem.id}
                    </span>
                    <p className="text-xs font-bold text-slate-200">
                      Allocation:{" "}
                      <span className="text-slate-400 font-medium">
                        "{loanItem.purpose}"
                      </span>
                    </p>
                    <p className="text-[11px] text-slate-400 font-medium">
                      Capital Balance: R{loanItem.amount} | Due Cutoff:{" "}
                      <span className="text-amber-400 font-bold">
                        {loanItem.dueDate}
                      </span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase tracking-wider font-bold block">
                      Outstanding Balance
                    </span>
                    <span className="text-base font-black text-emerald-400 font-mono">
                      R {loanItem.remainingBalance}
                    </span>
                  </div>
                </div>

                {loanItem.status === "Active" &&
                  loanItem.remainingBalance > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center">
                      <div className="text-[10px] text-slate-400 font-medium">
                        Interest Threshold Settled:{" "}
                        <span
                          className={
                            loanItem.interestPaid >= loanItem.interest
                              ? "text-emerald-400 font-bold"
                              : "text-amber-400 font-bold"
                          }
                        >
                          R {loanItem.interestPaid} / R {loanItem.interest}
                        </span>
                      </div>
                      {loanItem.interestPaid < loanItem.interest && (
                        <button
                          onClick={() => payClientInterestOnly(loanItem.id)}
                          className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 px-3 py-1 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                        >
                          Settle Interest Only (R {loanItem.interest}){" "}
                          <ArrowUpRight className="w-3 h-3 text-slate-400" />
                        </button>
                      )}
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
