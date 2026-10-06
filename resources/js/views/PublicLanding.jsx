import React, { useState } from 'react';
import BracketFlowchart from '../components/BracketFlowchart';
import FeaturedMatchHero from '../components/FeaturedMatchHero';
import DivisionLeaderboard from '../components/DivisionLeaderboard';
import MatchScheduleTable from '../components/MatchScheduleTable';
import { Trophy, ChevronLeft, ChevronDown, ChevronUp, X, Sparkles, Award, ArrowUpRight } from 'lucide-react';

export default function PublicLanding({ landingData, searchQuery, onSelectMatch }) {
    const tournament = landingData?.tournament;
    const bracketTree = landingData?.bracket_tree;
    const divisions = landingData?.divisions || [];
    const featuredMatch = landingData?.featured_match;
    const schedule = landingData?.schedule || [];

    const [showBreakdown, setShowBreakdown] = useState(false);

    // Get sorted divisions for leaderboard breakdown
    const sortedDivisions = [...divisions].sort((a, b) => (b.total_accumulated_points || 0) - (a.total_accumulated_points || 0));
    const leaderTeam = sortedDivisions[0];

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

    const scrollToLeaderboard = () => {
        setShowBreakdown(false);
        const el = document.getElementById('leaderboard-section');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
            // Add momentary highlight glow
            el.classList.add('ring-2', 'ring-purple-500', 'transition-all');
            setTimeout(() => {
                el.classList.remove('ring-2', 'ring-purple-500');
            }, 1800);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-fadeIn relative">
            {/* Main Center Content & Right Sidebar Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Center / Left Main Column */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8 min-w-0">
                    {/* (C) Flowchart Matchmaking Bracket Canvas */}
                    <section className="animate-reveal-up" style={{ animationDelay: '0.05s' }}>
                        <BracketFlowchart bracketData={bracketTree} onSelectMatch={onSelectMatch} />
                    </section>

                    {/* (D) Hero Featured Match Banner & Live Spotlight */}
                    <section className="animate-reveal-up" style={{ animationDelay: '0.15s' }}>
                        <FeaturedMatchHero match={featuredMatch} />
                    </section>

                    {/* (F) Match Schedule & Chronological Log */}
                    <section className="animate-reveal-up" style={{ animationDelay: '0.25s' }}>
                        <MatchScheduleTable matches={filteredSchedule} onSelectMatch={onSelectMatch} />
                    </section>
                </div>

                {/* (E) Right Bar: Division Leaderboard & Pointing Rules */}
                <div className="lg:col-span-4 space-y-6 animate-reveal-up" style={{ animationDelay: '0.35s' }}>
                    <DivisionLeaderboard
                        divisions={divisions}
                        matches={bracketTree?.all_matches || schedule || []}
                        tournament={tournament}
                    />
                </div>
            </div>

            {/* FLOATING LEADERBOARD QUICK-ACTION WITH EXPANDABLE MINIMAL BREAKDOWN */}
            {leaderTeam && (
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
                                    className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.06] text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
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
                                onClick={scrollToLeaderboard}
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
                            onClick={scrollToLeaderboard}
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
                                    1st: {leaderTeam.name} ({leaderTeam.total_accumulated_points || 0} PTS)
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
