import React from 'react';
import { 
    Layers, 
    Calendar, 
    Award, 
    Video, 
    Users, 
    UserPlus, 
    Flame, 
    Tv, 
    LogOut,
    Eye,
    ChevronRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ currentView, setCurrentView, adminTab, setAdminTab, onLaunchArena }) {
    const { user, isAdmin, logout } = useAuth();

    const navItems = [
        { id: 'bracket', label: 'Bracket Studio & Seeds', icon: Layers },
        { id: 'matches', label: 'Pairings & Results', icon: Calendar },
        { id: 'divisions', label: 'Divisions & Logos', icon: Award },
        { id: 'zoom', label: 'Zoom & Stream', icon: Video, badge: 'LIVE' },
        { id: 'users', label: 'Staff & Admin Accounts', icon: Users },
    ];

    return (
        <aside
            aria-label="Director Navigation Console"
            className="hidden lg:flex w-72 bg-white/80 dark:bg-[#0B0D14]/90 backdrop-blur-xl border-r border-slate-200/50 dark:border-white/[0.04] flex-col shrink-0 sticky top-14 sm:top-16 md:top-20 self-start h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden z-30 select-none transition-colors duration-200"
        >
            {/* Header / Brand Sub-Bar */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white/[0.08] flex items-center justify-center shrink-0 shadow-xs">
                        <Flame className="w-4 h-4 text-rose-500" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="font-extrabold text-xs tracking-wider text-slate-900 dark:text-white uppercase leading-tight">
                            Palay<span className="text-rose-500">Offs</span>
                        </h2>
                        <span className="text-[10px] font-mono font-medium tracking-wide text-slate-500 dark:text-slate-400 block">
                            Director Studio
                        </span>
                    </div>
                </div>

                {/* View Public Tournament Action */}
                <button
                    onClick={() => setCurrentView('landing')}
                    className="mt-4 w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100/70 hover:bg-slate-200/60 dark:bg-white/[0.03] dark:hover:bg-white/[0.07] transition-all group cursor-pointer"
                >
                    <div className="flex items-center gap-2">
                        <Eye className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors" />
                        <span>View Public Tournament</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </button>
            </div>

            {/* Navigation Items */}
            <div className="flex-1 px-3.5 py-3 space-y-6 overflow-y-auto">
                {isAdmin && (
                    <div className="space-y-4">
                        <div>
                            <p className="px-3 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                Tournament Management
                            </p>
                            <nav className="space-y-1">
                                {navItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = currentView === 'admin' && adminTab === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => {
                                                setCurrentView('admin');
                                                if (setAdminTab) setAdminTab(item.id);
                                            }}
                                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${
                                                isActive
                                                    ? 'bg-slate-900 text-white dark:bg-white/[0.1] dark:text-white shadow-xs'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                                                    isActive 
                                                        ? 'text-rose-500 dark:text-rose-400' 
                                                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                                                }`} />
                                                <span className="truncate">{item.label}</span>
                                            </div>
                                            {item.badge && (
                                                <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                                    isActive
                                                        ? 'bg-rose-500/20 text-rose-300'
                                                        : 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400'
                                                }`}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Arena Presenter Action */}
                        <div className="pt-2">
                            <p className="px-3 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                                Arena Stage Presenter
                            </p>
                            <button
                                onClick={onLaunchArena}
                                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-bold text-slate-900 dark:text-white bg-slate-100/90 hover:bg-slate-200/80 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] hover:border-slate-300 dark:hover:border-white/10 transition-all active:scale-[0.98] group cursor-pointer"
                            >
                                <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
                                    <Tv className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                                </div>
                                <div className="text-left min-w-0">
                                    <span className="block font-bold leading-tight truncate">Arena Display Mode</span>
                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-normal">Stadium TV Presenter</span>
                                </div>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Staff Profile Card & Quick Admin Creation */}
            <div className="p-3.5 mt-auto space-y-2">
                {isAdmin && (
                    <button
                        type="button"
                        onClick={() => {
                            setCurrentView('admin');
                            if (setAdminTab) setAdminTab('users');
                        }}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] transition-all cursor-pointer group"
                        title="Create new Admin / Referee account in Supabase database"
                    >
                        <UserPlus className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400 group-hover:text-rose-500 transition-colors" />
                        <span>+ Add Staff Account</span>
                    </button>
                )}

                <div className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-white/[0.02] flex items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 dark:bg-white/10 flex items-center justify-center font-bold text-xs text-white shrink-0">
                            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-xs text-slate-900 dark:text-white truncate">{user?.name}</p>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">
                                {user?.role}
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={logout}
                        title="Sign Out"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer"
                    >
                        <LogOut className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </aside>
    );
}

