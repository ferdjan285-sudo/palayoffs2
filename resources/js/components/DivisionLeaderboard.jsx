import React, { useState } from 'react';
import { Crown, Medal, Award, Shield, Zap, X, ChevronRight, Trophy, Swords, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function DivisionLeaderboard({ divisions = [], matches = [], tournament = null }) {
    const [selectedDivision, setSelectedDivision] = useState(null);

    // Sort strictly by total_accumulated_points descending
    const sorted = [...divisions].sort((a, b) => (b.total_accumulated_points || 0) - (a.total_accumulated_points || 0));
    const maxPoints = Math.max(...sorted.map((d) => d.total_accumulated_points || 0), 25);

    const getTierMaterial = (rankIndex) => {
        switch (rankIndex) {
            case 0:
                return {
                    rankStr: '01',
                    badgeBg: 'bg-amber-400 text-slate-950 font-black',
                    icon: <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />,
                    barGradient: 'from-amber-400 to-yellow-500',
                    tierTag: 'CHAMPIONSHIP TIER',
                    tierTagClass: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
                };
            case 1:
                return {
                    rankStr: '02',
                    badgeBg: 'bg-slate-300 text-slate-950 font-black',
                    icon: <Medal className="w-4 h-4 text-slate-400 fill-slate-300" />,
                    barGradient: 'from-slate-300 to-slate-400',
                    tierTag: 'RUNNER-UP',
                    tierTagClass: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                };
            case 2:
                return {
                    rankStr: '03',
                    badgeBg: 'bg-amber-700 text-white font-black',
                    icon: <Award className="w-4 h-4 text-amber-600 fill-amber-700" />,
                    barGradient: 'from-amber-600 to-amber-700',
                    tierTag: 'PODIUM CONTENDER',
                    tierTagClass: 'bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300',
                };
            default:
                return {
                    rankStr: '04',
                    badgeBg: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-black',
                    icon: <Shield className="w-4 h-4 text-slate-400" />,
                    barGradient: 'from-slate-400 to-slate-500',
                    tierTag: 'CHALLENGER',
                    tierTagClass: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
                };
        }
    };

    // Calculate match breakdown for a division
    const getDivisionBreakdown = (divisionId) => {
        const teamMatches = matches.filter((m) => {
            const divAId = m.division_a_id || m.division_a?.id || m.divisionA?.id;
            const divBId = m.division_b_id || m.division_b?.id || m.divisionB?.id;
            return divAId === divisionId || divBId === divisionId;
        });

        let wins = 0;
        let losses = 0;
        let gamesWon = 0;
        let gamesLost = 0;

        const list = teamMatches.map((m) => {
            const divAId = m.division_a_id || m.division_a?.id || m.divisionA?.id;
            const isTeamA = divAId === divisionId;
            const teamScore = isTeamA ? (m.score_a ?? 0) : (m.score_b ?? 0);
            const oppScore = isTeamA ? (m.score_b ?? 0) : (m.score_a ?? 0);
            const oppDiv = isTeamA ? (m.division_b || m.divisionB) : (m.division_a || m.divisionA);

            const isFinished = Boolean(m.winner_id || m.status === 'finished');
            const isWinner = m.winner_id === divisionId;

            if (isFinished) {
                if (isWinner) wins++;
                else losses++;
                gamesWon += teamScore;
                gamesLost += oppScore;
            }

            return {
                id: m.id,
                identifier: m.match_identifier || m.identifier,
                roundName: m.round_name || `Stage ${m.match_identifier || 'Match'}`,
                scheduledAt: m.scheduled_at,
                oppDiv,
                teamScore,
                oppScore,
                isFinished,
                isWinner,
                status: m.status,
                bestOf: m.best_of || 3,
            };
        });

        const totalPlayed = wins + losses;
        const winrate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;

        return {
            wins,
            losses,
            gamesWon,
            gamesLost,
            totalPlayed,
            winrate,
            list,
        };
    };

    const activeBreakdown = selectedDivision ? getDivisionBreakdown(selectedDivision.id) : null;

    return (
        <div id="leaderboard-section" className="space-y-4">
            {/* Header with Live Status Tag */}
            <div className="flex items-center justify-between pb-1">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <span>Division Leaderboard</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Official tournament standings · Click team for match log</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#181D2D] border border-slate-200 dark:border-slate-800 text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    LIVE LEDGER
                </div>
            </div>

            {/* Clean Cards Stack (Clickable to inspect match history) */}
            <div className="space-y-3">
                {sorted.map((div, index) => {
                    const material = getTierMaterial(index);
                    const pts = div.total_accumulated_points || 0;
                    const percent = Math.min(100, Math.round((pts / maxPoints) * 100));

                    return (
                        <button
                            key={div.id}
                            type="button"
                            onClick={() => setSelectedDivision(div)}
                            className="w-full text-left relative rounded-2xl p-4 transition-all duration-200 bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800/80 shadow-sm hover:shadow-md hover:border-purple-500/50 dark:hover:border-purple-500/50 group overflow-hidden cursor-pointer"
                        >
                            {/* Card Header: Medallion + Division Details */}
                            <div className="relative z-10 flex items-center justify-between gap-3 mb-3">
                                <div className="flex items-center gap-3 min-w-0">
                                    {/* Rank Medallion */}
                                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${material.badgeBg} shadow-sm`}>
                                        <span className="font-mono text-xs font-black tracking-tight">{material.rankStr}</span>
                                    </div>

                                    {/* Team Logo Badge */}
                                    {div.logo_path ? (
                                        <div 
                                            className="w-9 h-9 rounded-xl flex items-center justify-center p-1 border shadow-sm shrink-0 overflow-hidden bg-white dark:bg-[#141722]"
                                            style={{ borderColor: div.color_hex + '66' }}
                                        >
                                            <img src={div.logo_path} alt={div.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                                        </div>
                                    ) : null}

                                    {/* Division Name & Hex Chip */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {div.name} Division
                                            </h4>
                                            {material.icon}
                                        </div>

                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                                style={{ backgroundColor: div.color_hex }}
                                            />
                                            <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md ${material.tierTagClass}`}>
                                                {material.tierTag}
                                            </span>
                                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold hidden sm:inline group-hover:underline flex items-center gap-0.5">
                                                <span>Breakdown</span>
                                                <ChevronRight className="w-3 h-3 inline" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Points Capsule */}
                                <div className="text-right shrink-0">
                                    <div className="text-lg font-black font-mono text-slate-900 dark:text-white tracking-tight">
                                        {pts}{' '}
                                        <span className="text-xs font-sans font-bold text-rose-500">
                                            PTS
                                        </span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-mono">
                                        {percent}% quota
                                    </span>
                                </div>
                            </div>

                            {/* Clean Progress Bar */}
                            <div className="relative z-10 w-full bg-slate-100 dark:bg-[#0D0F15] h-2 rounded-full overflow-hidden p-0.5 border border-slate-200/60 dark:border-white/5">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r ${material.barGradient}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Pointing Formula & Ledger Card */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800/80 shadow-sm text-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Authoritative Pointing Formula
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Official</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-amber-600 dark:text-amber-300 font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500" /> 1st Place
                        </span>
                        <span className="text-emerald-600 dark:text-emerald-400 font-black">+25 PTS</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <Medal className="w-3 h-3 text-slate-400" /> 2nd Place
                        </span>
                        <span className="text-cyan-600 dark:text-cyan-400 font-black">+20 PTS</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-600" /> 3rd Place
                        </span>
                        <span className="text-amber-600 dark:text-amber-400 font-black">+15 PTS</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-slate-400" /> 4th Place
                        </span>
                        <span className="text-slate-600 dark:text-slate-400 font-black">+10 PTS</span>
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                    Points are automatically distributed upon Grand Final conclusion (1st: 25, 2nd: 20, 3rd: 15, 4th: 10).
                </p>
            </div>

            {/* TEAM MATCH BREAKDOWN MODAL */}
            {selectedDivision && activeBreakdown && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 dark:bg-black/80 backdrop-blur-sm animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="team-breakdown-title"
                    onClick={() => setSelectedDivision(null)}
                >
                    <div
                        className="relative w-full max-w-lg bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Background Glow */}
                        <div
                            className="absolute -top-24 -right-24 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                            style={{ backgroundColor: selectedDivision.color_hex }}
                        />

                        {/* Close Button */}
                        <button
                            type="button"
                            onClick={() => setSelectedDivision(null)}
                            aria-label="Close Breakdown Modal"
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-200 dark:border-slate-800">
                            {selectedDivision.logo_path ? (
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center p-1.5 border shadow-sm shrink-0 bg-white dark:bg-[#181D2D]"
                                    style={{ borderColor: selectedDivision.color_hex }}
                                >
                                    <img src={selectedDivision.logo_path} alt={selectedDivision.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                                </div>
                            ) : (
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg text-slate-950 shrink-0 shadow-sm"
                                    style={{ backgroundColor: selectedDivision.color_hex }}
                                >
                                    {selectedDivision.name.charAt(0)}
                                </div>
                            )}

                            <div>
                                <h3 id="team-breakdown-title" className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                    <span>{selectedDivision.name} Division</span>
                                    <span
                                        className="w-2.5 h-2.5 rounded-full inline-block"
                                        style={{ backgroundColor: selectedDivision.color_hex }}
                                    />
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                                    Official PalayOffs Performance Log
                                </p>
                            </div>
                        </div>

                        {/* Quick Metrics Bar */}
                        <div className="grid grid-cols-3 gap-2 py-4 border-b border-slate-200 dark:border-slate-800 font-mono text-center">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E111B] border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase block">Total Points</span>
                                <span className="text-base font-black text-amber-500">
                                    {selectedDivision.total_accumulated_points || 0} PTS
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E111B] border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase block">Match Record</span>
                                <span className="text-base font-black text-slate-900 dark:text-white">
                                    <span className="text-emerald-500">{activeBreakdown.wins}W</span> - <span className="text-rose-500">{activeBreakdown.losses}L</span>
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0E111B] border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-400 uppercase block">Winrate</span>
                                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                                    {activeBreakdown.winrate}%
                                </span>
                            </div>
                        </div>

                        {/* Match-by-Match History */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-2.5 pr-1">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>Tournament Match Breakdown</span>
                                <span className="font-mono text-[10px]">{activeBreakdown.list.length} Matches</span>
                            </h4>

                            {activeBreakdown.list.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-[#0E111B] border border-dashed border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
                                    No matches recorded for this division yet.
                                </div>
                            ) : (
                                activeBreakdown.list.map((m) => {
                                    const oppName = m.oppDiv?.name || 'TBD (Opponent)';
                                    const oppColor = m.oppDiv?.color_hex || '#64748B';

                                    return (
                                        <div
                                            key={m.id}
                                            className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                                                m.isFinished
                                                    ? m.isWinner
                                                        ? 'bg-emerald-500/5 border-emerald-500/30'
                                                        : 'bg-rose-500/5 border-rose-500/30'
                                                    : 'bg-slate-50 dark:bg-[#0E111B] border-slate-200 dark:border-slate-800'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex items-center justify-center shrink-0">
                                                    {m.isFinished ? (
                                                        m.isWinner ? (
                                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                                        ) : (
                                                            <XCircle className="w-5 h-5 text-rose-500" />
                                                        )
                                                    ) : (
                                                        <Clock className="w-5 h-5 text-amber-500 animate-pulse" />
                                                    )}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-mono font-black text-xs text-purple-600 dark:text-purple-400">
                                                            {m.identifier}
                                                        </span>
                                                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                                            vs {oppName}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                                                        {m.roundName} · BO{m.bestOf}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Score & Result Pill */}
                                            <div className="text-right shrink-0">
                                                <div className="font-mono text-sm font-black text-slate-900 dark:text-white">
                                                    {m.teamScore} - {m.oppScore}
                                                </div>
                                                <span
                                                    className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full inline-block ${
                                                        m.isFinished
                                                            ? m.isWinner
                                                                ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                                : 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                                            : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                                                    }`}
                                                >
                                                    {m.isFinished ? (m.isWinner ? 'Victory' : 'Defeat') : 'Pending'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedDivision(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
