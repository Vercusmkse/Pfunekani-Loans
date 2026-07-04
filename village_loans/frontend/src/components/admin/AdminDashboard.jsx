import React, { useState } from 'react';
import { AlertTriangle, MessageCircle, TrendingUp, DollarSign, Wallet } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AdminDashboard() {
    const { loans, approveLoan, clearLoanAsPaid, extendLoanDuration30Days, sendProximityReminderMessage } = useApp();
    const [filterMode, setFilterMode] = useState('all');
    const [errorLogs, setErrorLogs] = useState({});

    const displaySet = loans.filter(item => {
        if (filterMode === 'all') return true;
        const itemDate = new Date(item.dateApplied);
        const currentDate = new Date();

        if (filterMode === 'monthly') {
            return itemDate.getMonth() === currentDate.getMonth() && itemDate.getFullYear() === currentDate.getFullYear();
        }
        if (filterMode === 'yearly') {
            return itemDate.getFullYear() === currentDate.getFullYear();
        }
        return true;
    });

    const totalCapitalDeployed = displaySet.reduce((sum, l) => sum + (l.status !== 'Pending Approval' ? l.amount : 0), 0);
    const totalExpectedInflow = displaySet.reduce((sum, l) => sum + (l.status !== 'Pending Approval' ? l.totalRepayable : 0), 0);
    const netCalculatedProfits = displaySet.reduce((sum, l) => sum + (l.status !== 'Pending Approval' ? l.interest : 0), 0);

    const calculateDaysLeft = (targetDateStr) => {
        const target = new Date(targetDateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        const msDiff = target.getTime() - today.getTime();
        return Math.ceil(msDiff / (1000 * 60 * 60 * 24));
    };

    const executeExtensionVetting = (id) => {
        const outcome = extendLoanDuration30Days(id);
        if (!outcome.success) {
            setErrorLogs(prev => ({ ...prev, [id]: outcome.msg }));
            setTimeout(() => {
                setErrorLogs(prev => ({ ...prev, [id]: null }));
            }, 4000);
        }
    };

    return (
        <div className="space-y-6 animate-fadeIn">

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                <div>
                    <h2 className="text-base font-black text-white uppercase tracking-wider">Administrative Operations Command</h2>
                    <p className="text-xs text-slate-400">Track structural cycles, review credit deployment logs, and push warnings.</p>
                </div>
                <div className="bg-slate-950 p-1 rounded-xl border border-slate-850 flex gap-1">
                    {['all', 'monthly', 'yearly'].map(mode => (
                        <button
                            key={mode} onClick={() => setFilterMode(mode)}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition uppercase tracking-wider ${filterMode === mode ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            {mode} cycle
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Capital Assets Deployed</span>
                    <h3 className="text-2xl font-black text-white mt-1 font-mono">R {totalCapitalDeployed.toLocaleString('en-ZA')}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> Deployed 30-Day Principal</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Total Expected Return</span>
                    <h3 className="text-2xl font-black text-amber-400 mt-1 font-mono">R {totalExpectedInflow.toLocaleString('en-ZA')}</h3>
                    <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Capitalized Target Recovery</p>
                </div>
                <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block">Net Calculated Yield Profit</span>
                    <h3 className="text-2xl font-black text-emerald-400 mt-1 font-mono">R {netCalculatedProfits.toLocaleString('en-ZA')}</h3>
                    <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Derived 40% Operational Premium</p>
                </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 overflow-hidden">
                <h3 className="text-sm font-black text-white uppercase tracking-wider mb-4">Contract Asset Ledger Workspace</h3>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                        <thead>
                        <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-widest text-[9px] font-bold">
                            <th className="pb-3 px-2">Deal Entity ID</th>
                            <th className="pb-3 px-2">Account Tier</th>
                            <th className="pb-3 px-2">Principal</th>
                            <th className="pb-3 px-2">Maturity Target</th>
                            <th className="pb-3 px-2">Proximity Timeline</th>
                            <th className="pb-3 px-2 text-right">Administrative Execution Router</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-850/60 text-slate-300">
                        {displaySet.map(item => {
                            const daysRemaining = calculateDaysLeft(item.dueDate);
                            const isProximityWarning = daysRemaining <= 5 && item.status === "Active";

                            return (
                                <tr key={item.id} className={`hover:bg-slate-950/40 transition-colors ${isProximityWarning ? 'bg-red-500/[0.03]' : ''}`}>
                                    <td className="py-3.5 px-2">
                                        <span className="text-[9px] font-mono text-slate-500 block font-bold">ID: {item.id}</span>
                                        <span className="text-sm font-black text-white">{item.borrowerName}</span>
                                    </td>
                                    <td className="py-3.5 px-2">
                      <span className="bg-slate-950 text-slate-400 font-mono text-[10px] px-2 py-0.5 rounded border border-slate-800">
                        {item.borrowerTier}
                      </span>
                                    </td>
                                    <td className="py-3.5 px-2 font-mono font-bold text-slate-200">R {item.amount}</td>
                                    <td className="py-3.5 px-2">
                                        <span className="font-bold font-mono text-emerald-400 block">R {item.totalRepayable}</span>
                                        <span className="text-[10px] text-slate-500 block">Target: {item.dueDate}</span>
                                    </td>
                                    <td className="py-3.5 px-2">
                                        {item.status === 'Pending Approval' ? (
                                            <span className="text-slate-500 italic">Awaiting Approval</span>
                                        ) : item.status === 'Settled' ? (
                                            <span className="text-emerald-500 font-semibold">Completed</span>
                                        ) : (
                                            <div className="flex items-center gap-1">
                          <span className={`font-mono font-bold ${isProximityWarning ? 'text-red-400 animate-pulse' : 'text-slate-300'}`}>
                            {daysRemaining > 0 ? `${daysRemaining} Days Left` : "Overdue Tracking"}
                          </span>
                                                {isProximityWarning && <AlertTriangle className="w-3.5 h-3.5 text-red-400" />}
                                            </div>
                                        )}
                                    </td>
                                    <td className="py-3.5 px-2 text-right space-y-1">
                                        {item.status === 'Pending Approval' ? (
                                            <button
                                                onClick={() => approveLoan(item.id)}
                                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition"
                                            >
                                                Approve & Fire WhatsApp
                                            </button>
                                        ) : item.status === 'Settled' ? (
                                            <span className="text-slate-500 text-[11px] italic pr-3 block">Closed Profile Contract</span>
                                        ) : (
                                            <div className="flex justify-end items-center gap-1.5 flex-wrap">
                                                {errorLogs[item.id] && (
                                                    <span className="text-[9px] font-medium text-red-400 block border border-red-950 bg-red-950/20 p-1 rounded">{errorLogs[item.id]}</span>
                                                )}

                                                <button
                                                    onClick={() => sendProximityReminderMessage(item.id)}
                                                    className="bg-slate-950 text-amber-400 border border-slate-800 hover:bg-slate-850 p-1.5 rounded-lg transition"
                                                    title="Trigger 5-day WhatsApp alert notification"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={() => executeExtensionVetting(item.id)}
                                                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition ${
                                                        item.interestPaid >= item.interest
                                                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-sm'
                                                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                                    }`}
                                                    title="Extend 30 Days (Requires 40% Interest Settled)"
                                                >
                                                    Extend 30 Days
                                                </button>

                                                <button
                                                    onClick={() => clearLoanAsPaid(item.id)}
                                                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-2.5 py-1.5 rounded-lg text-[10px] uppercase tracking-wider transition"
                                                >
                                                    Paid
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
}