import React, { useState } from 'react';
import BracketFlowchart from '../components/BracketFlowchart';
import FeaturedMatchHero from '../components/FeaturedMatchHero';
import DivisionLeaderboard from '../components/DivisionLeaderboard';
import MatchScheduleTable from '../components/MatchScheduleTable';
import { 
    Trophy, 
    ChevronLeft, 
    ChevronDown, 
    ChevronUp, 
    X, 
    Sparkles, 
    Award, 
    ArrowUpRight,
    Flame,
    Radio,
    Layers,
    Calendar,
    BarChart3,
    Swords,
    Info,
    ExternalLink,
    Play
} from 'lucide-react';

export default function PublicLanding({ landingData, searchQuery, onSelectMatch }) {
    const tournament = landingData?.tournament;
    const bracketTree = landingData?.bracket_tree;
    const divisions = landingData?.divisions || [];
    const featuredMatch = landingData?.featured_match;
    const schedule = landingData?.schedule || [];

    const [showBreakdown, setShowBreakdown] = useState(false);
    const [activeSection, setActiveSection] = useState('bracket');

    // Get sorted divisions for leaderboard breakdown
    const sortedDivisions = [...divisions].sort((a, b) => (b.total_accumulated_points || 0) - (a.total_accumulated_points || 0));
    const leaderTeam = sortedDivisions[0];

    // Identify active live match or next upcoming fixture for instant glance
    const allMatches = bracketTree?.all_matches || schedule || [];
    const liveMatch = allMatches.find(m => m.status === 'live' && !m.winner_id) || featuredMatch;
    const nextMatch = allMatches.find(m => !m.winner_id && m.status !== 'finished') || allMatches[0];
    const spotlightMatch = liveMatch || nextMatch;

    // Standardized Tournament Title across all screens
    const displayTitle = 'MLBB PalayOffs Cup 2026';
    const activeLeader = leaderTeam || (divisions.length > 0 ? divisions[0] : { name: 'Mauve', total_accumulated_points: 0 });

    // Filter schedule if search query is active
    const filteredSchedule = schedule.filter((item) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            item.round_name?.toLowerCase().includes(q) ||
            item.division_a?.name?.toLowerCase().includes(q) ||
            item.division_b?.name?.toLowerCase().includes(q) ||
            item.status?.toLowerCase().includes(q)
        );
    });

    const scrollToSection = (id, sectionName) => {
        if (sectionName) setActiveSection(sectionName);
        setShowBreakdown(false);
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Add subtle momentary highlight ring
            el.classList.add('ring-2', 'ring-rose-500/50', 'transition-all');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-rose-500/50');
            }, 1800);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fadeIn relative pb-12">
            {/* 1. WELCOMING TOURNAMENT OVERVIEW HUB & QUICK-NAVIGATION (First View UX Priority) */}
            <section className="relative rounded-3xl bg-white dark:bg-[#0D101C] border border-slate-200/80 dark:border-white/[0.05] p-4 sm:p-6 md:p-8 shadow-xs dark:shadow-2xl overflow-hidden transition-all duration-200 animate-fade-in-scale">
                {/* Background Subtle Gradient Glows */}
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-rose-500/10 dark:bg-rose-500/15 blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-purple-500/10 dark:bg-purple-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Left: Tournament Identity & Overview */}
                    <div className="space-y-3 max-w-xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] sm:text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-rose-500/20">
                                <Flame className="w-3.5 h-3.5" />
                                Official Championship
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 text-[10px] sm:text-xs font-mono font-bold uppercase border border-slate-200 dark:border-white/[0.05]">
                                4-Team Double Elimination
                            </span>
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] sm:text-xs font-bold uppercase flex items-center gap-1 border border-amber-500/20">
                                <Trophy className="w-3 h-3" />
                                {tournament?.status === 'active' ? 'Tournament In Progress' : 'Live Tournament'}
                            </span>
                        </div>

                        <div>
                            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-tight">
                                {displayTitle}
                            </h1>
                            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1 leading-relaxed">
                                {tournament?.description || 'Official Mobile Legends 5v5 esports tournament portal. Track brackets, live match stages, schedules, and divisional standings in real-time.'}
                            </p>
                        </div>

                        {/* Leaderboard quick status pill */}
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#131726] border border-slate-200 dark:border-white/[0.05] text-xs">
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                            <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">Current #1 Seed:</span>
                            <strong className="text-slate-900 dark:text-white font-extrabold">{activeLeader.name}</strong>
                            <span className="font-mono text-purple-600 dark:text-purple-400 font-black">({activeLeader.total_accumulated_points || 0} PTS)</span>
                        </div>
                    </div>

                    {/* Right: High-Impact Catchy Current Fixture Arena Card */}
                    {spotlightMatch && (
                        <div 
                            onClick={() => onSelectMatch ? onSelectMatch(spotlightMatch) : scrollToSection('featured-section', 'featured')}
                            className="w-full lg:w-96 rounded-3xl bg-gradient-to-b from-white via-slate-50 to-slate-100/90 dark:from-[#151928] dark:via-[#121524] dark:to-[#0E111D] border-2 border-rose-500/30 dark:border-rose-500/40 p-4 sm:p-5 shadow-lg shadow-rose-500/5 hover:shadow-xl hover:shadow-rose-500/10 transition-all duration-300 cursor-pointer group relative overflow-hidden active:scale-[0.99]"
                        >
                            {/* Ambient Duel Light Aura */}
                            <div 
                                className="absolute -top-12 -left-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                                style={{ backgroundColor: spotlightMatch.division_a?.color_hex || '#B784A7' }}
                            />
                            <div 
                                className="absolute -bottom-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-20 pointer-events-none"
                                style={{ backgroundColor: spotlightMatch.division_b?.color_hex || '#98FF98' }}
                            />

                            {/* Top Header Pill Bar */}
                            <div className="relative z-10 flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-white/[0.06]">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] sm:text-xs font-mono font-black uppercase tracking-wider border border-rose-500/20">
                                    <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                                    <span>{spotlightMatch.status === 'live' ? 'Live Stage Clash' : 'Current Stage Fixture'}</span>
                                </span>
                                
                                <span className="text-[10px] font-mono font-black px-2.5 py-1 rounded-xl bg-slate-900 text-white dark:bg-white dark:text-slate-950 uppercase shadow-xs">
                                    {spotlightMatch.match_identifier || 'Stage UB1'} · BO{spotlightMatch.best_of || 3}
                                </span>
                            </div>

                            {/* Center Duel Area: Head-to-Head Arena */}
                            <div className="relative z-10 grid grid-cols-11 items-center gap-2 py-1">
                                {/* Team A */}
                                <div className="col-span-4 flex flex-col items-center text-center space-y-1.5 min-w-0">
                                    <div 
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center p-1.5 shadow-md transition-transform group-hover:scale-105 overflow-hidden border-2"
                                        style={{ 
                                            backgroundColor: (spotlightMatch.division_a?.color_hex || '#B784A7') + '22',
                                            borderColor: spotlightMatch.division_a?.color_hex || '#B784A7',
                                            boxShadow: `0 0 15px ${(spotlightMatch.division_a?.color_hex || '#B784A7')}40`
                                        }}
                                    >
                                        {spotlightMatch.division_a?.logo_path ? (
                                            <img src={spotlightMatch.division_a.logo_path} alt={spotlightMatch.division_a.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                                        ) : (
                                            <span className="font-black text-sm text-slate-950" style={{ color: spotlightMatch.division_a?.color_hex || '#B784A7' }}>
                                                {spotlightMatch.division_a?.name?.charAt(0) || 'A'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-full">
                                        {spotlightMatch.division_a?.name || 'Seed A'}
                                    </span>
                                </div>

                                {/* VS & Score Centerpiece */}
                                <div className="col-span-3 flex flex-col items-center justify-center shrink-0">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-[#1C2134] border border-rose-500/40 flex items-center justify-center shadow-sm">
                                        <Swords className="w-4 h-4 text-rose-500 animate-pulse" />
                                    </div>
                                    <div className="mt-1 font-mono font-black text-sm sm:text-lg text-slate-900 dark:text-white tracking-tight">
                                        <span>{spotlightMatch.score_a ?? 0}</span>
                                        <span className="text-slate-400 mx-1">:</span>
                                        <span>{spotlightMatch.score_b ?? 0}</span>
                                    </div>
                                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-rose-500">
                                        {spotlightMatch.status === 'live' ? 'LIVE' : 'VS'}
                                    </span>
                                </div>

                                {/* Team B */}
                                <div className="col-span-4 flex flex-col items-center text-center space-y-1.5 min-w-0">
                                    <div 
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center p-1.5 shadow-md transition-transform group-hover:scale-105 overflow-hidden border-2"
                                        style={{ 
                                            backgroundColor: (spotlightMatch.division_b?.color_hex || '#98FF98') + '22',
                                            borderColor: spotlightMatch.division_b?.color_hex || '#98FF98',
                                            boxShadow: `0 0 15px ${(spotlightMatch.division_b?.color_hex || '#98FF98')}40`
                                        }}
                                    >
                                        {spotlightMatch.division_b?.logo_path ? (
                                            <img src={spotlightMatch.division_b.logo_path} alt={spotlightMatch.division_b.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                                        ) : (
                                            <span className="font-black text-sm text-slate-950" style={{ color: spotlightMatch.division_b?.color_hex || '#98FF98' }}>
                                                {spotlightMatch.division_b?.name?.charAt(0) || 'B'}
                                            </span>
                                        )}
                                    </div>
                                    <span className="block text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate max-w-full">
                                        {spotlightMatch.division_b?.name || 'Seed B'}
                                    </span>
                                </div>
                            </div>

                            {/* Catchy Action Footer CTA */}
                            <div className="relative z-10 mt-3.5 pt-2.5 border-t border-slate-200/60 dark:border-white/[0.04] flex items-center justify-between text-[11px] font-bold text-rose-600 dark:text-rose-400">
                                <span className="flex items-center gap-1">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                    <span>Matchup Arena</span>
                                </span>
                                <span className="group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-mono text-[10px] uppercase font-black">
                                    <span>Details & Lineup</span>
                                    <ArrowUpRight className="w-3.5 h-3.5" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. DIRECT 1-TAP NAVIGATION TABS (Easy exploration) */}
                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/[0.04]">
                    <div className="flex items-center justify-between gap-2 mb-2 px-1">
                        <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            Jump to Tournament Section:
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">1-Click Direct Access</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <button
                            type="button"
                            onClick={() => scrollToSection('bracket-section', 'bracket')}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                activeSection === 'bracket'
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm font-black'
                                    : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.04]'
                            }`}
                        >
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                activeSection === 'bracket' ? 'bg-white/20' : 'bg-slate-200/70 dark:bg-white/[0.05]'
                            }`}>
                                <Layers className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-xs font-bold leading-tight truncate">Bracket Canvas</span>
                                <span className={`text-[10px] font-mono block truncate ${activeSection === 'bracket' ? 'text-white/80' : 'text-slate-400'}`}>
                                    Double Elimination
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('featured-section', 'featured')}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                activeSection === 'featured'
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm font-black'
                                    : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.04]'
                            }`}
                        >
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                activeSection === 'featured' ? 'bg-white/20' : 'bg-slate-200/70 dark:bg-white/[0.05]'
                            }`}>
                                <Swords className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-xs font-bold leading-tight truncate">Featured Clash</span>
                                <span className={`text-[10px] font-mono block truncate ${activeSection === 'featured' ? 'text-white/80' : 'text-slate-400'}`}>
                                    Live Spotlight
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('schedules-section', 'schedule')}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                activeSection === 'schedule'
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm font-black'
                                    : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.04]'
                            }`}
                        >
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                activeSection === 'schedule' ? 'bg-white/20' : 'bg-slate-200/70 dark:bg-white/[0.05]'
                            }`}>
                                <Calendar className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-xs font-bold leading-tight truncate">Match Schedule</span>
                                <span className={`text-[10px] font-mono block truncate ${activeSection === 'schedule' ? 'text-white/80' : 'text-slate-400'}`}>
                                    {schedule.length} Total Fixtures
                                </span>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => scrollToSection('leaderboard-section', 'standings')}
                            className={`p-2.5 sm:p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                                activeSection === 'standings'
                                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm font-black'
                                    : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04] text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/[0.04]'
                            }`}
                        >
                            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                                activeSection === 'standings' ? 'bg-white/20' : 'bg-slate-200/70 dark:bg-white/[0.05]'
                            }`}>
                                <Trophy className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                                <span className="block text-xs font-bold leading-tight truncate">Standings & Points</span>
                                <span className={`text-[10px] font-mono block truncate ${activeSection === 'standings' ? 'text-white/80' : 'text-slate-400'}`}>
                                    Division Rankings
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </section>

            {/* Helpful UI Tip Banner */}
            <div className="px-4 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/[0.03] flex items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-rose-500 shrink-0" />
                    <span><strong>Pro-Tip:</strong> Tap on any matchup node across the bracket or schedule to open full team statistics, roster lineups, and set results.</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 shrink-0 hidden sm:inline">Interactive Portal</span>
            </div>

            {/* Main Center Content & Right Sidebar Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Center / Left Main Column */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8 min-w-0">
                    {/* (C) Flowchart Matchmaking Bracket Canvas */}
                    <section className="animate-fade-in-scale" style={{ animationDelay: '0.04s' }}>
                        <BracketFlowchart bracketData={bracketTree} onSelectMatch={onSelectMatch} />
                    </section>

                    {/* (D) Hero Featured Match Banner & Live Spotlight */}
                    <section id="featured-section" className="animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
                        <FeaturedMatchHero match={featuredMatch} />
                    </section>

                    {/* (F) Match Schedule & Chronological Log */}
                    <section id="schedules-section" className="animate-fade-in-scale" style={{ animationDelay: '0.16s' }}>
                        <MatchScheduleTable matches={filteredSchedule} onSelectMatch={onSelectMatch} />
                    </section>
                </div>

                {/* (E) Right Bar: Division Leaderboard & Pointing Rules */}
                <div id="leaderboard-section" className="lg:col-span-4 space-y-6 animate-fade-in-scale" style={{ animationDelay: '0.22s' }}>
                    <DivisionLeaderboard
                        divisions={divisions}
                        matches={bracketTree?.all_matches || schedule || []}
                        tournament={tournament}
                    />
                </div>
            </div>

            {/* FLOATING LEADERBOARD QUICK-ACTION WITH EXPANDABLE MINIMAL BREAKDOWN */}
            {activeLeader && (
                <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-40 flex flex-col items-end gap-2">
                    {/* MINIMAL FLOATING BREAKDOWN POPUP (Triggered by < toggle) */}
                    {showBreakdown && (
                        <div className="w-[290px] sm:w-[330px] rounded-2xl bg-white/95 dark:bg-[#121522]/95 backdrop-blur-xl border border-slate-200/80 dark:border-white/[0.08] shadow-2xl p-4 text-slate-900 dark:text-white space-y-3 animate-reveal-up">
                            {/* Popup Header */}
                            <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-white/[0.05]">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500">
                                        <Trophy className="w-3.5 h-3.5" />
                                    </div>
                                    <div>
                                        <h4 className="font-extrabold text-xs">Live Standings Breakdown</h4>
                                        <span className="text-[10px] text-slate-400 font-mono">Current Division Rankings</span>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setShowBreakdown(false)}
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors cursor-pointer"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Minimal Breakdown List */}
                            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-0.5">
                                {sortedDivisions.map((div, idx) => {
                                    const rank = idx + 1;
                                    const pts = div.total_accumulated_points || 0;
                                    const isFirst = rank === 1;

                                    return (
                                        <div
                                            key={div.id}
                                            className={`flex items-center justify-between p-2 rounded-xl text-xs transition-colors ${
                                                isFirst
                                                    ? 'bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30'
                                                    : 'bg-slate-50 dark:bg-white/[0.02] hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono font-black text-[10px] shrink-0 ${
                                                    rank === 1 ? 'bg-amber-500 text-slate-950 shadow-xs' :
                                                    rank === 2 ? 'bg-slate-300 dark:bg-slate-700 text-slate-900 dark:text-white' :
                                                    rank === 3 ? 'bg-amber-700/60 text-white' :
                                                    'bg-slate-100 dark:bg-white/[0.05] text-slate-500'
                                                }`}>
                                                    {rank}
                                                </span>

                                                <span
                                                    className="w-2.5 h-2.5 rounded-full shrink-0"
                                                    style={{ backgroundColor: div.color_hex || '#B784A7' }}
                                                />

                                                <span className="font-bold truncate text-slate-800 dark:text-slate-200 text-xs">
                                                    {div.name}
                                                </span>
                                            </div>

                                            <span className="font-mono font-black text-xs text-purple-600 dark:text-purple-400 shrink-0">
                                                {pts} PTS
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Jump to Full Section Button */}
                            <button
                                type="button"
                                onClick={() => scrollToSection('leaderboard-section', 'standings')}
                                className="w-full py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                                <span>View Full Leaderboard Section</span>
                                <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                        </div>
                    )}

                    {/* Floating Pill Button Bar */}
                    <div className="flex items-center rounded-full bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white shadow-2xl p-0.5 border border-white/20 backdrop-blur-md">
                        {/* < Minimal Breakdown Toggle Button */}
                        <button
                            type="button"
                            onClick={() => setShowBreakdown(!showBreakdown)}
                            className="flex items-center justify-center w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 active:scale-90 transition-all cursor-pointer"
                            title={showBreakdown ? "Close Standings Breakdown" : "View Floating Standings Breakdown"}
                            aria-label="Toggle minimal breakdown"
                        >
                            <span className="font-bold text-xs font-mono select-none">
                                {showBreakdown ? '✕' : '<'}
                            </span>
                        </button>

                        {/* Main Leaderboard Quick Jump */}
                        <button
                            type="button"
                            onClick={() => scrollToSection('leaderboard-section', 'standings')}
                            className="flex items-center gap-2 pl-2 pr-3.5 py-1.5 cursor-pointer hover:opacity-90 active:scale-98 transition-all"
                            title="Jump directly to Division Leaderboard"
                        >
                            <div className="w-6 h-6 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                            </div>
                            
                            <div className="text-left font-mono">
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-none flex items-center gap-1">
                                    <span>Leaderboard</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                </div>
                                <div className="text-[9px] sm:text-[10px] text-white/90 truncate max-w-[120px] sm:max-w-[150px] font-bold mt-0.5">
                                    1st: {activeLeader.name} ({activeLeader.total_accumulated_points || 0} PTS)
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

