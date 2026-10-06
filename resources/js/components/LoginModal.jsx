import React, { useState } from 'react';
import { Lock, X, Shield, Eye, EyeOff, AlertCircle, Sparkles, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal({ onSuccess }) {
    const { loginModalOpen, setLoginModalOpen, login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn"
            role="dialog"
            aria-modal="true"
            aria-labelledby="login-modal-title"
            onClick={() => !isLoading && setLoginModalOpen(false)}
        >
            <div
                className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white dark:bg-[#121520] border border-slate-200/80 dark:border-white/[0.08] rounded-3xl shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100 transition-all animate-modal-pop"
                onClick={(e) => e.stopPropagation()}
            >

                {/* Subtle Decorative Gradient Glows */}
                <div className="absolute -top-20 -left-20 w-44 h-44 bg-rose-500/10 dark:bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -right-20 w-44 h-44 bg-purple-500/10 dark:bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

                {/* Close Button */}
                <button
                    onClick={() => setLoginModalOpen(false)}
                    disabled={isLoading}
                    aria-label="Close Login Modal"
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] transition-colors cursor-pointer disabled:opacity-40"
                >
                    <X className="w-4 h-4" />
                </button>

                {/* Modal Header */}
                <div className="flex items-center gap-3.5 mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
                        <Lock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 id="login-modal-title" className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                            Director Sign In
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Access bracket configuration, scores & Arena display
                        </p>
                    </div>
                </div>

                {/* Quick 1-Tap Director Credentials Card */}
                <div className="mb-5 p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.04] space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1 text-purple-600 dark:text-purple-400">
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Quick Demo Access</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">1-Tap Fill</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => fillCredentials('admin@palayoffs.com', 'admin123')}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-[#161B29] hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/80 dark:border-white/[0.05] transition-all cursor-pointer group shadow-2xs text-left"
                    >
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-300 flex items-center justify-center shrink-0 font-bold">
                                <Shield className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">Tournament Director</p>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">admin@palayoffs.com</span>
                            </div>
                        </div>
                        <span className="px-2 py-1 rounded-lg bg-purple-600 text-white font-mono text-[10px] font-black uppercase shrink-0 shadow-xs group-hover:scale-105 transition-transform">
                            Auto Fill
                        </span>
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2 animate-shake">
                        <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                        <span className="font-semibold">{errorMsg}</span>
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@palayoffs.com"
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#151926] text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.06] focus:border-rose-500 focus:outline-none transition-all font-mono"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                            Password
                        </label>
                        <div className="relative">
                            <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-[#151926] text-slate-900 dark:text-white text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.06] focus:border-rose-500 focus:outline-none transition-all font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 cursor-pointer"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-3 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-md transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        {isLoading ? (
                            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <>
                                <span>Sign In to Director Studio</span>
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
