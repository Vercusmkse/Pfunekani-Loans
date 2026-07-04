import React, { useState } from 'react';
import { ArrowRight, User, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react';

export default function LandingPage({ onOpenAuth }) {
    const [demoAmount, setDemoAmount] = useState(500);

    return (
        <div className="space-y-16 py-8 animate-fadeIn">

            <div className="text-center max-w-3xl mx-auto space-y-6 px-4">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1 text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Community Deployed Liquidity Engine
                </div>
                <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-none">
                    Transparent Lending for Local <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-amber-400">Micro Enterprises</span>
                </h1>
                <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
                    Access immediate liquidity for agricultural supplies, spaza shop stock, or delivery logistics. No hidden costs. Fixed 30-day cycles.
                </p>

                <div className="flex flex-wrap justify-center gap-4 pt-4">
                    <button
                        onClick={() => onOpenAuth('client')}
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-6 py-3 rounded-xl text-xs uppercase tracking-wider transition shadow-lg shadow-emerald-500/10 flex items-center gap-1.5"
                    >
                        Access Client Space <User className="w-4 h-4 text-slate-950" />
                    </button>
                    <button
                        onClick={() => onOpenAuth('admin')}
                        className="bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 font-bold px-6 py-3 rounded-xl text-xs transition flex items-center gap-1.5"
                    >
                        Admin Management Tower <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </button>
                </div>
            </div>

            <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-500 to-amber-500"></div>

                <div className="space-y-5">
                    <div>
                        <h3 className="text-lg font-black text-white uppercase tracking-wider">Maturity Cost Calculator</h3>
                        <p className="text-xs text-slate-400 mt-1">Drag the parameter controller to evaluate the strict 30-day repayment schedules.</p>
                    </div>

                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-xs font-bold text-slate-300">
                            <span>Required Borrowing Capital</span>
                            <span className="text-emerald-400 text-base font-black">R {demoAmount}</span>
                        </div>
                        <input
                            type="range" min="500" max="10000" step="500" value={demoAmount} onChange={(e) => setDemoAmount(parseInt(e.target.value))}
                            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>R500 (First-Timer Cap)</span>
                            <span>R10,000 (Senior Cap)</span>
                        </div>
                    </div>

                    <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-850 flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-400 leading-normal">
                            First-time registration limits capping is automatically enforced at <strong className="text-white">R500</strong>. Complete successful payment profiles to scale up your index limit to <strong className="text-emerald-400">R10,000</strong>.
                        </p>
                    </div>
                </div>

                <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 flex flex-col justify-between space-y-4">
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400 pb-2 border-b border-slate-900">
                            <span>Maturity Cycle Limit:</span>
                            <span className="text-white font-bold font-mono">30 Days (Fixed)</span>
                        </div>
                        <div className="flex justify-between text-slate-400 pt-1 pb-2 border-b border-slate-900">
                            <span>Dynamic Interest Multiplier:</span>
                            <span className="text-amber-400 font-bold font-mono">40% Cycle Fee</span>
                        </div>
                        <div className="flex justify-between text-slate-400 pt-1">
                            <span>Calculated Interest Cost:</span>
                            <span className="text-slate-300 font-semibold font-mono">R {(demoAmount * 0.40).toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="bg-emerald-950/30 border border-emerald-900/40 p-4 rounded-xl flex justify-between items-center">
                        <div>
                            <span className="text-[10px] uppercase text-emerald-400 block font-bold tracking-wider">Total Repayable Due</span>
                            <span className="text-xl font-black text-emerald-300 font-mono">R {(demoAmount * 1.40).toFixed(2)}</span>
                        </div>
                        <ArrowRight className="w-5 h-5 text-emerald-400" />
                    </div>
                </div>
            </div>

        </div>
    );
}