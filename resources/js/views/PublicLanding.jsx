import React from 'react';
import BracketFlowchart from '../components/BracketFlowchart';
import FeaturedMatchHero from '../components/FeaturedMatchHero';
import DivisionLeaderboard from '../components/DivisionLeaderboard';
import MatchScheduleTable from '../components/MatchScheduleTable';

export default function PublicLanding({ landingData, searchQuery, onSelectMatch }) {
    const tournament = landingData?.tournament;
    const bracketTree = landingData?.bracket_tree;
    const divisions = landingData?.divisions || [];
    const featuredMatch = landingData?.featured_match;
    const schedule = landingData?.schedule || [];

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

    return (
        <div className="space-y-6 md:space-y-8 animate-fadeIn">
            {/* Main Center Content & Right Sidebar Split */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Center / Left Main Column (C, D, F) */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8 min-w-0">
                    {/* (C) Flowchart Matchmaking Bracket Canvas */}
                    <section>
                        <BracketFlowchart bracketData={bracketTree} onSelectMatch={onSelectMatch} />
                    </section>

                    {/* Split Row for (D) Hero Featured Match Banner & Live Spotlight */}
                    <section>
                        <FeaturedMatchHero match={featuredMatch} />
                    </section>

                    {/* (F) Match Schedule & Chronological Log */}
                    <section>
                        <MatchScheduleTable matches={filteredSchedule} onSelectMatch={onSelectMatch} />
                    </section>
                </div>

                {/* (E) Right Bar: Division Leaderboard & Pointing Rules */}
                <div className="lg:col-span-4 space-y-6">
                        <DivisionLeaderboard
                            divisions={divisions}
                            matches={bracketTree?.all_matches || schedule || []}
                            tournament={tournament}
                        />
                </div>
            </div>
        </div>
    );
}
