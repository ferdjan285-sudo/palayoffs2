import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginModal from './components/LoginModal';
import PublicLanding from './views/PublicLanding';
import AdminDashboard from './views/AdminDashboard';
import ArenaDisplay from './views/ArenaDisplay';
import api from './services/api';
import { X, ExternalLink, Play, Radio, Trophy, Shield } from 'lucide-react';

function AppContent() {
    const { user, isAdmin, setLoginModalOpen } = useAuth();
    const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'admin' | 'present'
    const [adminTab, setAdminTab] = useState('bracket');
    const [searchQuery, setSearchQuery] = useState('');
    const [landingData, setLandingData] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedMatchModal, setSelectedMatchModal] = useState(null);

    // Fetch Public Landing Data
    const fetchLandingData = async () => {
        try {
            setIsRefreshing(true);
            const res = await api.get('/public/landing-data');
            if (res.data.success) {
                setLandingData(res.data);
            }
        } catch (err) {
            console.error('Failed fetching landing data:', err);
        } finally {
            setIsRefreshing(false);
        }
    };

    useEffect(() => {
        fetchLandingData();
        const interval = setInterval(fetchLandingData, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleSelectMatch = (match) => {
        setSelectedMatchModal(match);
    };

    // If in Live Arena Display / Presenter TV Mode
    if (currentView === 'present') {
        return (
            <ArenaDisplay
                landingData={landingData}
                onExit={() => setCurrentView(isAdmin ? 'admin' : 'landing')}
                onRefresh={fetchLandingData}
            />
        );
    }

    const isInsidePortal = currentView === 'admin' && user;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0D0F15] text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-rose-500 selection:text-white transition-colors duration-200">
            {/* Top Navigation Bar with Text-Aligned Links & Top-Left Login Portal Button */}
            <Header
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onRefresh={fetchLandingData}
                isRefreshing={isRefreshing}
                currentView={currentView}
                setCurrentView={setCurrentView}
                tournament={landingData?.tournament}
                onLaunchArena={() => setCurrentView('present')}
            />

            {/* Layout Wrapper:
                - If on Public Landing: NO left sidebar! Whole full-width page.
                - If inside Admin Portal: Dedicated balanced staff sidebar is shown.
            */}
            {isInsidePortal ? (
                <div className="flex-1 flex min-h-[calc(100vh-5rem)]">
                    {/* Balanced Inside Staff Sidebar */}
                    <Sidebar
                        currentView={currentView}
                        setCurrentView={setCurrentView}
                        adminTab={adminTab}
                        setAdminTab={setAdminTab}
                        onLaunchArena={() => setCurrentView('present')}
                    />

                    {/* Inside Portal Work Area */}
                    <main className="flex-1 p-3.5 sm:p-6 md:p-8 max-w-[1500px] w-full mx-auto overflow-y-auto">
                        {currentView === 'admin' && (
                            <AdminDashboard
                                onDataChanged={fetchLandingData}
                                activeTab={adminTab}
                                setActiveTab={setAdminTab}
                                onLaunchArena={() => setCurrentView('present')}
                            />
                        )}
                    </main>
                </div>
            ) : (
                /* The Whole Full-Width Public Page (NO SIDEBAR) */
                <main className="flex-1 w-full max-w-[1720px] mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
                    <PublicLanding
                        landingData={landingData}
                        searchQuery={searchQuery}
                        onSelectMatch={handleSelectMatch}
                    />
                </main>
            )}

            {/* Platform Footer */}
            <footer className="py-6 px-6 border-t border-slate-200 dark:border-[#1C202E] bg-white dark:bg-[#0A0C12] text-xs text-slate-500 dark:text-slate-400 text-center md:flex md:justify-between items-center transition-colors">
                <div>
                    © 2026 <strong>PalayOffs Esports Tournament Engine</strong>. Built with Laravel 12, MySQL, React 19 & Tailwind CSS.
                </div>
                <div className="mt-2 md:mt-0 flex items-center justify-center gap-4 text-[11px] font-mono">
                    <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Relational Directed Acyclic Graph Engine
                    </span>
                    <span>Vercel Serverless Ready</span>
                </div>
            </footer>

            {/* Top-Level Login Popup Modal */}
            <LoginModal
                onSuccess={(u) => {
                    if (u.role === 'admin') setCurrentView('admin');
                    fetchLandingData();
                }}
            />

            {/* Quick Match Inspect Modal */}
            {selectedMatchModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-md bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.05] rounded-3xl p-6 shadow-2xl text-slate-900 dark:text-slate-100">
                        <button
                            onClick={() => setSelectedMatchModal(null)}
                            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl bg-slate-100 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 font-mono text-xs font-black">
                                {selectedMatchModal.match_identifier || selectedMatchModal.identifier}
                            </span>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">Match Fixture Intelligence</h3>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] space-y-3.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Match Status</span>
                                <span className="font-black uppercase text-slate-900 dark:text-white font-mono">
                                    {selectedMatchModal.status}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400">Scheduled Time</span>
                                <span className="text-slate-700 dark:text-slate-200 font-mono">
                                    {selectedMatchModal.scheduled_at || 'TBD'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/[0.04]">
                                <span className="text-slate-500 dark:text-slate-400 font-bold">Faction Seed A</span>
                                <span className="font-black text-slate-900 dark:text-white">
                                    {selectedMatchModal.division_a?.name || 'TBD'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 dark:text-slate-400 font-bold">Faction Seed B</span>
                                <span className="font-black text-slate-900 dark:text-white">
                                    {selectedMatchModal.division_b?.name || 'TBD'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-white/[0.04] font-mono">
                                <span className="text-slate-500 dark:text-slate-400">Score Tracker</span>
                                <span className="text-base font-black text-rose-600 dark:text-rose-400">
                                    {selectedMatchModal.score_a ?? 0} : {selectedMatchModal.score_b ?? 0}
                                </span>
                            </div>

                            {selectedMatchModal.stream_url && (
                                <div className="pt-3">
                                    <a
                                        href={selectedMatchModal.stream_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold flex items-center justify-center gap-2 shadow-sm transition-all"
                                    >
                                        <Play className="w-4 h-4 fill-white" />
                                        <span>Open Broadcast Stream</span>
                                        <ExternalLink className="w-3.5 h-3.5" />
                                    </a>
                                </div>
                            )}

                            {/* Quick Shortcut for Staff */}
                            {isAdmin && (
                                <button
                                    onClick={() => {
                                        setSelectedMatchModal(null);
                                        setCurrentView('admin');
                                        setAdminTab('matches');
                                    }}
                                    className="w-full mt-2 py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors"
                                >
                                    Modify This Match in Admin Studio
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <AppContent />
            </AuthProvider>
        </ThemeProvider>
    );
}

const rootElement = document.getElementById('root');
if (rootElement) {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
