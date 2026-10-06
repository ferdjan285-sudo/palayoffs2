import React, { useState, useEffect } from 'react';
import BracketFlowchart from '../components/BracketFlowchart';
import FeaturedMatchHero from '../components/FeaturedMatchHero';
import DivisionLeaderboard from '../components/DivisionLeaderboard';
import MatchScheduleTable from '../components/MatchScheduleTable';
import { Trophy, BarChart3, ChevronDown, Sparkles } from 'lucide-react';

export default function PublicLanding({ landingData, searchQuery, onSelectMatch }) {
    const tournament = landingData?.tournament;
    const bracketTree = landingData?.bracket_tree;
    const divisions = landingData?.divisions || [];
    const featuredMatch = landingData?.featured_match;
    const schedule = landingData?.schedule || [];

    const [showFloatingButton, setShowFloatingButton] = useState(true);

    // Get the top ranked team for preview in the floating pill
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

            {/* FLOATING LEADERBOARD QUICK-ACTION PILL (Fixed at bottom on mobile & desktop) */}
            {showFloatingButton && leaderTeam && (
                <div className="fixed bottom-4 right-3 sm:bottom-6 sm:right-6 z-30">
                    <button
                        type="button"
                        onClick={scrollToLeaderboard}
                        className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 text-white shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 animate-float-pulse border border-white/20 cursor-pointer group backdrop-blur-md"
                        title="Jump directly to Division Leaderboard & Standings"
                    >
                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-black/20 flex items-center justify-center shrink-0">
                            <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                        </div>
                        
                        <div className="text-left font-mono">
                            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-wider leading-none flex items-center gap-1">
                                <span>Leaderboard</span>
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                            </div>
                            <div className="text-[9px] sm:text-[10px] text-white/90 truncate max-w-[130px] sm:max-w-[160px] font-bold mt-0.5">
                                1st: {leaderTeam.name} ({leaderTeam.total_accumulated_points || 0} PTS)
                            </div>
                        </div>

                        <ChevronDown className="w-4 h-4 text-white/80 group-hover:translate-y-0.5 transition-transform shrink-0" />
                    </button>
                </div>
            )}
        </div>
    );
}
