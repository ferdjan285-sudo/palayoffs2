import React, { useState } from 'react';
import { Lock, X, Shield, Radio, Eye, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ onSuccess }) {
    const { loginModalOpen, setLoginModalOpen, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    if (!loginModalOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);
        try {
            const user = await login(email, password);
            setIsLoading(false);
            if (onSuccess) onSuccess(user);
        } catch (err) {
            setIsLoading(false);
            setErrorMsg(err.response?.data?.message || err.message || 'Invalid email or password');
        }
    };

    const fillCredentials = (quickEmail, quickPassword) => {
        setEmail(quickEmail);
        setPassword(quickPassword);
        setErrorMsg('');
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
        >
            <div className="relative w-full max-w-md bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 sm:p-8 overflow-hidden text-slate-900 dark:text-slate-100 transition-colors duration-200">
                {/* Background decorative glows */}
                <div className="absolute -top-24 -left-24 w-48 h-48 bg-rose-500/10 dark:bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={() => setLoginModalOpen(false)}
                    aria-label="Close Login Modal"
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/50 dark:hover:bg-slate-800 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-rose-600 to-amber-500 p-0.5 shadow-md flex items-center justify-center">
                        <Lock className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 id="login-modal-title" className="text-lg font-extrabold text-slate-900 dark:text-white">Tournament Director Portal</h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Authenticate for administrative, scoring & bracket controls</p>
                    </div>
                </div>

                {/* Quick 1-Click Admin Preset */}
                <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-[#0F121B] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sparkles className="w-3 h-3 text-amber-500 dark:text-amber-400" />
                            1-Click Director Credentials
                        </span>
                    </div>
                    <button
                        type="button"
                        onClick={() => fillCredentials('admin@palayoffs.com', 'admin123')}
                        className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-[#181D2D] hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-slate-200 dark:border-slate-700 text-left transition-all text-xs font-semibold text-purple-700 dark:text-purple-300 shadow-sm cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                            <div>
                                <p className="leading-tight font-bold">Tournament Director (Superuser)</p>
                                <span className="text-[10px] text-slate-500 dark:text-purple-400/70 font-mono">admin@palayoffs.com</span>
                            </div>
                        </div>
                        <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-800">
                            Auto-Fill
                        </span>
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@palayoffs.com"
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F121B] text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-[#0F121B] text-slate-900 dark:text-slate-100 text-sm rounded-xl border border-slate-200 dark:border-slate-700 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 transition-all font-mono"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-2 py-3 px-4 rounded-xl font-bold text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <Lock className="w-4 h-4" />
                                <span>Sign In & Unlock Controls</span>
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
