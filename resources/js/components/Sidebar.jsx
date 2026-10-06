import React from 'react';
import { 
    Layers, 
    Calendar, 
    BarChart3, 
    ShieldCheck, 
    Trophy, 
    Radio, 
    Flame, 
    Tv, 
    LogOut,
    Eye,
    Award,
    Clock,
    Sparkles,
    CheckCircle2,
    Video
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentView, setCurrentView, adminTab, setAdminTab, onLaunchArena }) {
    const { user, isAdmin, isReferee, logout } = useAuth();

    return (
        <aside
            aria-label="Director Navigation Console"
            className="hidden lg:flex w-72 bg-white dark:bg-[#12151E] border-r border-slate-200 dark:border-slate-800 flex-col shrink-0 sticky top-20 self-start h-[calc(100vh-5rem)] overflow-hidden z-30 select-none shadow-sm dark:shadow-2xl transition-colors duration-200"
        >
            {/* Staff Console Header */}
            <div className="h-20 px-6 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1017]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-md flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-black text-sm tracking-wider text-slate-900 dark:text-white uppercase leading-none truncate">
                            Palay<span className="text-rose-600 dark:text-rose-500">Offs</span>
                        </h2>
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider block mt-1 text-rose-600 dark:text-rose-400">
                            DIRECTOR STUDIO
                        </span>
                    </div>
                </div>
            </div>

            {/* Quick Switch to Public Showcase */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                <button
                    onClick={() => setCurrentView('landing')}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#161B29] dark:hover:bg-[#1D2335] border border-slate-200 dark:border-slate-800 transition-all shadow-sm group"
                >
                    <Eye className="w-4 h-4 text-rose-500 dark:text-rose-400 group-hover:scale-110 transition-transform" />
                    <span>View Public Tournament</span>
                </button>
            </div>

            {/* Main Navigation Area */}
            <div className="flex-1 py-5 px-4 space-y-6 overflow-y-auto text-xs">
                {/* ADMIN SECTIONS */}
                {isAdmin && (
                    <div className="space-y-4">
                        <div>
                            <p className="px-3 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
                                Tournament Management
                            </p>
                            <nav className="space-y-1.5">
                                <button
                                    onClick={() => {
                                        setCurrentView('admin');
                                        if (setAdminTab) setAdminTab('bracket');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                                        currentView === 'admin' && adminTab === 'bracket'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A1F2E]'
                                    }`}
                                >
                                    <Layers className={`w-4 h-4 shrink-0 ${
                                        currentView === 'admin' && adminTab === 'bracket' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                                    }`} />
                                    <span>Bracket Studio & Seeds</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setCurrentView('admin');
                                        if (setAdminTab) setAdminTab('matches');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                                        currentView === 'admin' && adminTab === 'matches'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A1F2E]'
                                    }`}
                                >
                                    <Calendar className={`w-4 h-4 shrink-0 ${
                                        currentView === 'admin' && adminTab === 'matches' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                                    }`} />
                                    <span>Pairings & Results</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setCurrentView('admin');
                                        if (setAdminTab) setAdminTab('divisions');
                                    }}
                                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                                        currentView === 'admin' && adminTab === 'divisions'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A1F2E]'
                                    }`}
                                >
                                    <Award className={`w-4 h-4 shrink-0 ${
                                        currentView === 'admin' && adminTab === 'divisions' ? 'text-white' : 'text-purple-500 dark:text-purple-400'
                                    }`} />
                                    <span>Divisions & Logos</span>
                                </button>

                                <button
                                    onClick={() => {
                                        setCurrentView('admin');
                                        if (setAdminTab) setAdminTab('zoom');
                                    }}
                                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all cursor-pointer ${
                                        currentView === 'admin' && adminTab === 'zoom'
                                            ? 'bg-purple-600 text-white shadow-md'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1A1F2E]'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <Video className={`w-4 h-4 shrink-0 ${
                                            currentView === 'admin' && adminTab === 'zoom' ? 'text-white' : 'text-blue-500 dark:text-blue-400'
                                        }`} />
                                        <span>Zoom & Stream</span>
                                    </div>
                                    <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-black ${
                                        currentView === 'admin' && adminTab === 'zoom'
                                            ? 'bg-white/20 text-white'
                                            : 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400'
                                    }`}>
                                        LIVE
                                    </span>
                                </button>
                            </nav>
                        </div>

                        {/* LIVE EVENT STAGE PRESENTER MODE */}
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                            <p className="px-3 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2">
                                Arena Stage Presenter
                            </p>
                            <button
                                onClick={onLaunchArena}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl font-black text-xs text-white bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 shadow-md transition-all active:scale-95 group cursor-pointer"
                            >
                                <Tv className="w-4 h-4 text-white group-hover:scale-110 transition-transform shrink-0" />
                                <div className="text-left">
                                    <span className="block leading-tight">Arena Display Mode</span>
                                    <span className="text-[10px] text-white/80 font-mono font-semibold">Stadium TV Presenter</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Staff Profile Card */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0E1017]">
                <div className="p-3 rounded-2xl bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-rose-600 flex items-center justify-center font-black text-xs text-white shrink-0 shadow-sm">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-black text-xs text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <span className={`text-[10px] font-mono font-bold uppercase ${
                                isAdmin ? 'text-purple-600 dark:text-purple-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        title="Sign Out"
                        className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </aside>
    );
}
