import React from 'react';
import { ShieldCheck, Power, Coins } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function Header() {
    const { currentUser, setCurrentUser } = useApp();

    return (
        <header className="border-b border-slate-900 bg-slate-900/60 backdrop-blur sticky top-0 z-50 px-4 py-3">
            <div className="max-w-7xl mx-auto flex items-center justify-between">

                <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => setCurrentUser(null)}>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-amber-500 flex items-center justify-center shadow-lg shadow-emerald-500/10">
                        <Coins className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h1 className="text-base font-black text-white tracking-tight">PFUNEKANI</h1>
                            <span className="text-[9px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase">30-Day Fixed</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-medium">Microfinance Management Tower</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {currentUser ? (
                        <div className="flex items-center gap-3 bg-slate-950 pl-3 pr-1 py-1 rounded-xl border border-slate-850">
                            <div className="flex items-center gap-1.5 text-xs font-semibold">
                                {currentUser.role === 'admin' ? (
                                    <span className="flex items-center gap-1 text-amber-400 text-[11px] uppercase tracking-wider font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Security Admin Desk
                  </span>
                                ) : (
                                    <span className="text-slate-300">
                    Client: <strong className="text-emerald-400 font-bold">{currentUser.name}</strong>
                    <span className="text-[10px] bg-slate-900 ml-1.5 px-1.5 py-0.5 rounded border border-slate-800 text-slate-400 font-normal">
                      {currentUser.tier}
                    </span>
                  </span>
                                )}
                            </div>
                            <button
                                onClick={() => setCurrentUser(null)}
                                className="bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 p-1.5 rounded-lg transition"
                                title="Terminate Session"
                            >
                                <Power className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-xs text-slate-500 italic font-mono hidden sm:inline-block">
                            System Standing: Online & Compliant
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}