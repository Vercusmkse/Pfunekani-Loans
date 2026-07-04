import React, { useState } from 'react';
import { X, ShieldCheck, User, FolderSync } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function AuthModal({ defaultRole, onClose }) {
    const { setCurrentUser } = useApp();
    const [role, setRole] = useState(defaultRole || 'client');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [tier, setTier] = useState('First-Timer');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (role === 'admin') {
            setCurrentUser({ name: "Operational Command Desk", role: 'admin' });
        } else {
            if (!name || !phone) {
                alert("Please complete matching entity profiles.");
                return;
            }
            setCurrentUser({ name, role: 'client', phone, tier });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md overflow-hidden relative shadow-2xl">

                <div className="bg-slate-950 px-5 py-4 border-b border-slate-850 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h3 className="text-sm font-black text-white uppercase tracking-wider">Secure Portal Authorization</h3>
                    </div>
                    <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-850 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-slate-950 p-1 rounded-xl border border-slate-850 flex">
                        <button
                            type="button" onClick={() => setRole('client')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${role === 'client' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <User className="w-4 h-4" /> Client Desk
                        </button>
                        <button
                            type="button" onClick={() => setRole('admin')}
                            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${role === 'admin' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            <FolderSync className="w-4 h-4" /> Admin Console
                        </button>
                    </div>

                    {role === 'client' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Full Corporate/Legal Name</label>
                                <input
                                    type="text" required placeholder="e.g. Thabo Khumalo" value={name} onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">WhatsApp Cell Connection</label>
                                <input
                                    type="text" required placeholder="e.g. 0790397516" value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block mb-1">System Profile Limit Tier</label>
                                <select
                                    value={tier} onChange={(e) => setTier(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:ring-1 focus:ring-emerald-500 focus:outline-none font-medium"
                                >
                                    <option value="First-Timer">First-Time User Profile (Max R500 Limit)</option>
                                    <option value="Senior">Senior Endorsed Account (Max R10,000 Limit)</option>
                                </select>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-amber-500/5 border border-amber-500/10 rounded-xl p-4 text-center space-y-1.5">
                            <p className="text-xs text-amber-400 font-medium leading-relaxed">
                                Developer simulation override mode active. Clicking authorize drops you straight into the operational monitoring tracking database.
                            </p>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-slate-200 to-white hover:from-white text-slate-950 font-black py-2.5 rounded-xl text-xs uppercase tracking-wider transition shadow-md"
                    >
                        Instantiate Session Securely
                    </button>
                </form>

            </div>
        </div>
    );
}