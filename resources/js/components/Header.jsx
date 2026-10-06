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
    Moon,
    Menu,
    X,
    User
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
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [showMobileSearch, setShowMobileSearch] = useState(false);
    const isStaffUser = Boolean(user && user.role === 'admin');

    const scrollTo = (id) => {
        setMobileMenuOpen(false);
        if (currentView !== 'landing') {
            setCurrentView('landing');
            setTimeout(() => {
                const el = document.getElementById(id);
                if (el) el.scrollIntoView({ behavior: 'smooth' });
            }, 120);
        } else {
            const el = document.getElementById(id);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <header className="w-full bg-white/95 dark:bg-[#0D0F15]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-40 shadow-xs dark:shadow-2xl transition-colors duration-200">
            <div className="max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 md:h-20 flex items-center justify-between gap-2">
                {/* 1. LEFT: Brand Identity */}
                <div className="flex items-center gap-2 shrink-0">
                    <div 
                        onClick={() => {
                            setCurrentView('landing');
                            setMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-sm flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
                            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0D0F15] animate-ping" />
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-[#0D0F15]" />
                        </div>
                        <div>
                            <h1 className="font-black text-sm sm:text-base md:text-lg tracking-wider text-slate-900 dark:text-white uppercase leading-none">
                                Palay<span className="text-rose-500">Offs</span>
                            </h1>
                            <p className="text-[8px] sm:text-[9px] text-slate-500 dark:text-slate-400 tracking-widest font-mono uppercase mt-0.5 hidden xs:block">
                                Tournament Engine
                            </p>
                        </div>
                    </div>
                </div>

                {/* 2. CENTER: Desktop Search & Navigation */}
                <div className="hidden md:flex flex-1 items-center justify-center gap-4 max-w-2xl lg:max-w-4xl mx-2">
                    {/* Search Input (Desktop) */}
                    <div className="relative w-full max-w-xs lg:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search matches, seeds..."
                            className="w-full pl-8 pr-3 py-1.5 sm:py-2 bg-slate-100 dark:bg-[#141722] hover:bg-slate-200/70 dark:hover:bg-[#181D2D] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-all"
                        />
                    </div>

                    {/* Navigation Items (Desktop Visitors) */}
                    {!isStaffUser ? (
                        <nav className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-[#12151E] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                            <button
                                onClick={() => scrollTo('bracket-section')}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                    currentView === 'landing'
                                        ? 'bg-rose-500 text-white shadow-xs'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E]'
                                }`}
                            >
                                <Layers className="w-3.5 h-3.5" />
                                <span>Bracket</span>
                            </button>

                            <button
                                onClick={() => scrollTo('featured-section')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E] transition-all"
                            >
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                                <span>Featured</span>
                            </button>

                            <button
                                onClick={() => scrollTo('schedules-section')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E] transition-all"
                            >
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Schedules</span>
                            </button>

                            <button
                                onClick={() => scrollTo('leaderboard-section')}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-[#1A1F2E] transition-all"
                            >
                                <BarChart3 className="w-3.5 h-3.5" />
                                <span>Standings</span>
                            </button>
                        </nav>
                    ) : (
                        /* Tournament Context Pill for Authenticated Staff */
                        <div className="hidden lg:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-100 dark:bg-[#12151E] border border-slate-200 dark:border-slate-800 text-xs">
                            <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                            <span className="font-extrabold text-slate-800 dark:text-white truncate max-w-[180px]">
                                {tournament?.title || 'Director Studio'}
                            </span>
                        </div>
                    )}
                </div>

                {/* 3. RIGHT: Clean Action Buttons Fitted for Mobile View */}
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                    {/* Mobile Search Icon Toggle (< md screens) */}
                    <button
                        type="button"
                        onClick={() => setShowMobileSearch(!showMobileSearch)}
                        className="md:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141722] dark:hover:bg-[#1A1F2E] text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                        aria-label="Search"
                    >
                        <Search className="w-4 h-4" />
                    </button>

                    {/* Quick Login / Portal Button */}
                    {!user ? (
                        <button
                            type="button"
                            onClick={() => setLoginModalOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-sm border-0 outline-none focus:outline-none active:scale-95 cursor-pointer transition-all"
                        >
                            <Lock className="w-3.5 h-3.5 text-white/95" />
                            <span className="hidden sm:inline font-sans">Admin</span>
                            <span className="font-sans font-bold">Login</span>
                        </button>
                    ) : (
                        <div className="flex items-center gap-1 sm:gap-1.5">
                            {/* View Switchers */}
                            {isAdmin && (
                                <button
                                    onClick={() => setCurrentView(currentView === 'admin' ? 'landing' : 'admin')}
                                    className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-0 outline-none ${
                                        currentView === 'admin'
                                            ? 'bg-purple-600 text-white shadow-xs'
                                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/[0.1]'
                                    }`}
                                >
                                    {currentView === 'admin' ? 'Public' : 'Admin'}
                                </button>
                            )}

                            {/* User Initials Badge */}
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center font-bold text-xs text-white shadow-xs shrink-0 border-0">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    )}

                    {/* Global Theme Toggle */}
                    <button
                        type="button"
                        onClick={toggleTheme}
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141722] dark:hover:bg-[#1A1F2E] text-slate-600 dark:text-slate-300 transition-all active:scale-95"
                    >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
                    </button>

                    {/* Mobile Hamburger Toggle */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="xl:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141722] dark:hover:bg-[#1A1F2E] text-slate-700 dark:text-slate-200 transition-all active:scale-95"
                        aria-label="Menu"
                    >
                        {mobileMenuOpen ? <X className="w-4 h-4 text-rose-500" /> : <Menu className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* EXPANDABLE MOBILE SEARCH BAR */}
            {showMobileSearch && (
                <div className="md:hidden px-3 pb-3 pt-1 border-t border-slate-100 dark:border-slate-800/80 bg-white/90 dark:bg-[#0D0F15]/90 animate-fadeIn">
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        <input
                            type="text"
                            value={searchQuery}
                            autoFocus
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search matches, team divisions, seeds..."
                            className="w-full pl-8 pr-8 py-2 bg-slate-100 dark:bg-[#141722] text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 rounded-xl border border-slate-200 dark:border-slate-800 focus:border-rose-500 focus:outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* MOBILE NAVIGATION DRAWER */}
            {mobileMenuOpen && (
                <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-[#0E111A]/95 backdrop-blur-xl px-4 py-4 space-y-3 animate-fadeIn shadow-2xl">
                    <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <button
                            onClick={() => scrollTo('bracket-section')}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-[#161B29] text-slate-800 dark:text-slate-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition-all text-left"
                        >
                            <Layers className="w-4 h-4 text-rose-500 shrink-0" />
                            <span>Knockout Bracket</span>
                        </button>

                        <button
                            onClick={() => scrollTo('featured-section')}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-[#161B29] text-slate-800 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 transition-all text-left"
                        >
                            <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Featured Clash</span>
                        </button>

                        <button
                            onClick={() => scrollTo('schedules-section')}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-[#161B29] text-slate-800 dark:text-slate-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-all text-left"
                        >
                            <Calendar className="w-4 h-4 text-blue-500 shrink-0" />
                            <span>Match Schedules</span>
                        </button>

                        <button
                            onClick={() => scrollTo('leaderboard-section')}
                            className="flex items-center gap-2 p-3 rounded-xl bg-slate-100 dark:bg-[#161B29] text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 transition-all text-left"
                        >
                            <BarChart3 className="w-4 h-4 text-purple-500 shrink-0" />
                            <span>Standings & Points</span>
                        </button>
                    </div>

                    {/* Arena TV Launcher Mobile Button */}
                    <button
                        onClick={() => {
                            setMobileMenuOpen(false);
                            onLaunchArena();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 shadow-md transition-all active:scale-95"
                    >
                        <Tv className="w-4 h-4" />
                        <span>Launch Arena Presenter Mode</span>
                    </button>

                    {user && (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center text-[10px] font-bold text-white">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-bold text-slate-800 dark:text-white truncate max-w-[150px]">
                                    {user.name} ({user.role})
                                </span>
                            </div>

                            <button
                                onClick={() => {
                                    setMobileMenuOpen(false);
                                    logout();
                                }}
                                className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:text-rose-600 p-1.5"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </header>
    );
}
