import React, { useState } from 'react';
import { 
    Search, 
    Lock, 
    RefreshCw, 
    ChevronDown, 
    Flame, 
    Trophy, 
    Layers, 
    Calendar, 
    BarChart3, 
    Gamepad2, 
    ShieldCheck, 
    Radio, 
    LogOut,
    ExternalLink,
    Tv,
    Sun,
    Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Header({ 
    searchQuery, 
    setSearchQuery, 
    onRefresh, 
    isRefreshing, 
    currentView, 
    setCurrentView,
    tournament,
    activeNavTab,
    setActiveNavTab,
    onLaunchArena
}) {
    const { user, isAdmin, logout, setLoginModalOpen } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const isStaffUser = Boolean(user && user.role === 'admin');

    const scrollTo = (id) => {
        if (currentView !== 'landing') {
            setCurrentView('landing');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="w-full bg-white/95 dark:bg-[#0D0F15]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-sm dark:shadow-2xl transition-colors duration-200">
            <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
                {/* 1. LEFT: Brand Identity */}
                <div className="flex items-center gap-4 shrink-0">
                    <div 
                        onClick={() => setCurrentView('landing')}
                        className="flex items-center gap-2.5 cursor-pointer group"
                    >
                        <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-md shrink-0 flex items-center justify-center group-hover:scale-105 transition-transform">
                            <Flame className="w-5 h-5 text-white" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0D0F15] animate-ping" />
                            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0D0F15]" />
                        </div>
                        <div className="hidden sm:block">
                            <h1 className="font-black text-lg tracking-wider text-slate-900 dark:text-white uppercase leading-none">
                                Palay<span className="text-rose-500">Offs</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 tracking-widest font-mono uppercase mt-0.5">
                                Esports Engine
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. CENTER: Search & Navigation Context */}
                <div className="flex-1 flex items-center justify-center gap-4 max-w-4xl mx-2">
                    {/* Search Input (Clean Subtle Border) */}
                    <div className="relative w-full max-w-xs md:max-w-sm">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search matches, seeds..."
                            className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-[#141722] hover:bg-slate-200/70 dark:hover:bg-[#181D2D] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-all"
                        />
                    </div>

                    {/* Navigation Items (Only shown for guest/spectator visitors; clean pill design) */}
                    {!isStaffUser ? (
                        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-[#12151E] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => {
                                    setCurrentView('landing');
                                    scrollTo('bracket-section');
                                }}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    currentView === 'landing'
                                        ? 'bg-rose-500 text-white shadow-sm'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E]'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Knockout Bracket</span>
                            </button>

                            <button
                                onClick={() => {
                                    setCurrentView('landing');
                                    scrollTo('featured-section');
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E] transition-all"
                            >
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                <span>Featured Clash</span>
                            </button>

                            <button
                                onClick={() => {
                                    setCurrentView('landing');
                                    scrollTo('schedules-section');
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E] transition-all"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Schedules</span>
                            </button>

                            <button
                                onClick={() => {
                                    setCurrentView('landing');
                                    scrollTo('leaderboard-section');
                                }}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E] transition-all"
                            >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>Standings</span>
                            </button>

                            <div className="h-4 w-px bg-slate-300 dark:bg-[#262C3E] mx-1" />

                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-gradient-to-r dark:from-rose-950/60 dark:to-purple-950/40 text-[11px] font-bold text-rose-600 dark:text-white">
                                <Gamepad2 className="w-3.5 h-3.5 text-rose-500" />
                                <span>MLBB 5v5</span>
                            </div>
                        </nav>
                    ) : (
                        /* Tournament Context Pill for Authenticated Staff */
                        <div className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-100 dark:bg-[#12151E] border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="font-extrabold text-slate-800 dark:text-white">
                                Tournament Director Studio
                            </span>
                            <span className="text-slate-400 dark:text-slate-600 font-mono">|</span>
                            <span className="text-slate-600 dark:text-slate-300 font-mono text-[11px] font-bold truncate max-w-[220px]">
                                {tournament?.title || 'MLBB PalayOffs Invitational Cup 2026'}
                            </span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 font-mono text-[10px] font-bold uppercase">
                                {tournament?.status || 'ongoing'}
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT: Portal Login, Arena Presenter, Theme Toggle, User Profile & Logout */}
                <div className="flex items-center gap-2.5 shrink-0">
                    {!user ? (
                        /* GUEST STATE: Clean solid button without outline noise */
                        <button
                            type="button"
                            onClick={() => setLoginModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
                            title="Open Official Staff & Admin Login Popup"
                        >
                            <Lock className="w-3.5 h-3.5 text-white/90" />
                            <span className="hidden sm:inline">Official / Admin Portal</span>
                            <span className="px-1.5 py-0.2 rounded bg-black/20 text-[10px] font-mono text-white uppercase">
                                Login
                            </span>
                        </button>
                    ) : (
                        /* LOGGED-IN STAFF STATE: Clean buttons without colored outline clutter */
                        <div className="flex items-center gap-2">
                            {/* Arena Presentation Launcher (Admin Only) */}
                            {isAdmin && (
                                <button
                                    onClick={onLaunchArena}
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-sm transition-all"
                                    title="Launch Event Presenter / Stadium Monitor View"
                                >
                                    <Tv className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">Arena Display</span>
                                </button>
                            )}

                            {/* View Switchers */}
                            {isAdmin && (
                                <button
                                    onClick={() => setCurrentView(currentView === 'admin' ? 'landing' : 'admin')}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                        currentView === 'admin'
                                            ? 'bg-purple-600 text-white shadow-sm'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                >
                                    {currentView === 'admin' ? 'Public View' : 'Admin Portal'}
                                </button>
                            )}

                            {/* User Profile Pill */}
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141722] border border-slate-200 dark:border-slate-800">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center font-bold text-[11px] text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-white hidden lg:inline max-w-[110px] truncate">
                                    {user.name}
                                </span>
                                <span className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded ${
                                    user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/80 dark:text-purple-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950/80 dark:text-amber-300'
                                }`}>
                                    {user.role}
                                </span>
                            </div>

                            {/* Standard Logout Button on Right Side */}
                            <button
                                onClick={logout}
                                title="Sign Out / Logout"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#141722] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-800 transition-all cursor-pointer"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span className="text-xs font-bold hidden md:inline">Logout</span>
                            </button>
                        </div>
                    )}

                    {/* Global Theme Toggle: Light Mode (default) / Dark Mode */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={isDark ? "Switch to Light Mode (Default)" : "Switch to Dark Mode"}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141722] dark:hover:bg-[#1A1F2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95 cursor-pointer"
                    >
                        {isDark ? (
                            <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45" />
                        ) : (
                            <Moon className="w-4 h-4 text-slate-600 transition-transform hover:-rotate-12" />
                        )}
                    </button>

                    {/* Refresh Button */}
                    <button
                        onClick={onRefresh}
                        disabled={isRefreshing}
                        title="Synchronize Live Tournament Data"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141722] dark:hover:bg-[#1A1F2E] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                    >
                        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-rose-500' : ''}`} />
                    </button>
                </div>
            </div>
        </header>
    );
}
