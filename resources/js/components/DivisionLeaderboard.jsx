import React, { useState } from 'react';
import { Crown, Medal, Award, Shield, Zap, X, ChevronRight, Trophy, Swords, Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function DivisionLeaderboard({ divisions = [], matches = [], tournament = null }) {
    const [selectedDivision, setSelectedDivision] = useState(null);

    // Sort strictly by total_accumulated_points descending
    const sorted = [...divisions].sort((a, b) => (b.total_accumulated_points || 0) - (a.total_accumulated_points || 0));
    const maxPoints = Math.max(...sorted.map((d) => d.total_accumulated_points || 0), 25);

    const getTierMaterial = (rankIndex, pts) => {
        const isZero = pts === 0;

        switch (rankIndex) {
            case 0:
                return {
                    rankStr: '#1',
                    icon: <Crown className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />,
                    barGradient: isZero ? 'bg-slate-300 dark:bg-slate-700' : 'bg-gradient-to-r from-amber-400 to-yellow-500',
                    tierTag: 'CHAMPIONSHIP TIER',
                };
            case 1:
                return {
                    rankStr: '#2',
                    icon: <Medal className="w-4 h-4 text-slate-400 fill-slate-300 shrink-0" />,
                    barGradient: isZero ? 'bg-slate-300 dark:bg-slate-700' : 'bg-gradient-to-r from-slate-400 to-slate-500',
                    tierTag: 'RUNNER-UP',
                };
            case 2:
                return {
                    rankStr: '#3',
                    icon: <Award className="w-4 h-4 text-amber-600 fill-amber-700 shrink-0" />,
                    barGradient: isZero ? 'bg-slate-300 dark:bg-slate-700' : 'bg-gradient-to-r from-amber-600 to-amber-700',
                    tierTag: 'PODIUM CONTENDER',
                };
            default:
                return {
                    rankStr: `#${rankIndex + 1}`,
                    icon: <Shield className="w-4 h-4 text-slate-400 shrink-0" />,
                    barGradient: isZero ? 'bg-slate-300 dark:bg-slate-700' : 'bg-gradient-to-r from-slate-400 to-slate-500',
                    tierTag: 'CHALLENGER',
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
            {/* Header with Clean Mobile-Responsive Live Status Tag */}
            <div className="flex items-center justify-between pb-1">
                <div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                        <span>Division Leaderboard</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Official tournament standings · Tap team for history</p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/[0.08] text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300 shadow-xs shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                    <span>LIVE LEDGER</span>
                </div>
            </div>

            {/* Clean Cards Stack without excessive color clutter */}
            <div className="space-y-2.5">
                {sorted.map((div, index) => {
                    const pts = div.total_accumulated_points || 0;
                    const isZero = pts === 0;
                    const material = getTierMaterial(index, pts);
                    const percent = isZero ? 0 : Math.min(100, Math.round((pts / maxPoints) * 100));
                    const isCyan = div.name?.toLowerCase().includes('cyan');

                    return (
                        <React.Fragment key={div.id}>
                            {isCyan && (
                                <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 bg-gradient-to-b from-cyan-500/10 via-cyan-500/[0.04] to-transparent dark:from-cyan-950/40 dark:via-cyan-900/15 dark:to-transparent border border-cyan-400/30 dark:border-cyan-400/20 text-center flex flex-col items-center justify-center shadow-xs group/trophy my-1">
                                    {/* Ambient Neon Atmosphere */}
                                    <div className="absolute -top-10 w-32 h-32 bg-cyan-400/20 dark:bg-cyan-400/15 rounded-full blur-2xl pointer-events-none" />
                                    <div className="absolute -bottom-8 w-24 h-24 bg-amber-400/15 dark:bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

                                    {/* Large Championship Trophy Cup */}
                                    <div className="relative z-10 w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/25 to-cyan-400/20 dark:from-amber-500/30 dark:via-yellow-400/25 dark:to-cyan-400/25 border border-amber-400/40 dark:border-amber-300/30 flex items-center justify-center shadow-lg shadow-amber-500/10 mb-2.5 transition-all duration-300 group-hover/trophy:scale-105 group-hover/trophy:shadow-cyan-500/20">
                                        <Trophy className="w-9 h-9 sm:w-11 sm:h-11 text-amber-500 dark:text-yellow-300 fill-amber-400/40 filter drop-shadow-md" />
                                    </div>

                                    {/* Title Below Cup */}
                                    <div className="relative z-10 space-y-1">
                                        <h4 className="text-xs sm:text-sm md:text-base font-black tracking-tight uppercase text-slate-900 dark:text-white">
                                            MLBB PalayOffs Cup 2026
                                        </h4>
                                        <p className="text-[10px] sm:text-[11px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                                            Championship Cup
                                        </p>
                                    </div>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setSelectedDivision(div)}
                                className="w-full text-left relative rounded-2xl p-3.5 sm:p-4 transition-all duration-200 bg-white dark:bg-[#121624] border border-slate-200/80 dark:border-white/[0.03] shadow-xs hover:shadow-md hover:dark:bg-[#161C2E] group overflow-hidden cursor-pointer active:scale-[0.99]"
                            >
                            {/* Card Header: Unboxed Rank Number/Icon + Division Details */}
                            <div className="relative z-10 flex items-center justify-between gap-3 mb-2.5">
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                    {/* Unboxed Rank Number & Distinctive Colored Icon */}
                                    <div className="flex items-center gap-1 shrink-0 font-mono font-black text-sm text-slate-700 dark:text-slate-300">
                                        {material.icon}
                                        <span className="text-xs">{material.rankStr}</span>
                                    </div>

                                    {/* Team Logo / Initial Badge */}
                                    {div.logo_path ? (
                                        <div 
                                            className="w-8 h-8 rounded-xl flex items-center justify-center p-1 shrink-0 overflow-hidden bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.04]"
                                        >
                                            <img src={div.logo_path} alt={div.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                                        </div>
                                    ) : null}

                                    {/* Division Name & Hex Chip */}
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                                {div.name} Division
                                            </h4>
                                        </div>

                                        <div className="flex items-center gap-2 mt-0.5">
                                            {/* ONLY Colored Dot */}
                                            <span
                                                className="w-2.5 h-2.5 rounded-full shrink-0 shadow-xs"
                                                style={{ backgroundColor: div.color_hex || '#B784A7' }}
                                                title={`Faction Color: ${div.color_hex}`}
                                            />
                                            {/* Single unified neutral/muted tier label */}
                                            <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-white/[0.05] text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/[0.04] uppercase">
                                                {material.tierTag}
                                            </span>
                                            <span className="text-[10px] text-purple-600 dark:text-purple-400 font-mono font-bold hidden sm:inline group-hover:underline flex items-center gap-0.5">
                                                <span>Breakdown</span>
                                                <ChevronRight className="w-3 h-3 inline" />
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Points Display: On 0 PTS just black/neutral */}
                                <div className="text-right shrink-0">
                                    <div className={`text-base sm:text-lg font-black font-mono tracking-tight ${
                                        isZero 
                                            ? 'text-slate-900 dark:text-white' 
                                            : 'text-slate-900 dark:text-white'
                                    }`}>
                                        {pts}{' '}
                                        <span className={`text-xs font-sans font-bold ${
                                            isZero ? 'text-slate-500 dark:text-slate-400' : 'text-rose-500'
                                        }`}>
                                            PTS
                                        </span>
                                    </div>
                                    <span className="text-[9px] sm:text-[10px] text-slate-400 font-mono">
                                        {percent}% quota
                                    </span>
                                </div>
                            </div>

                            {/* Clean Progress Bar without double outline */}
                            <div className="relative z-10 w-full bg-slate-100 dark:bg-black/30 h-1.5 sm:h-2 rounded-full overflow-hidden p-0.5">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${material.barGradient}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </button>
                    </React.Fragment>
                    );
                })}
            </div>

            {/* Pointing Formula & Ledger Card (Tonal depth without heavy outlines) */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#121624] border border-slate-200/80 dark:border-white/[0.03] shadow-xs text-xs space-y-3">
                <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        Authoritative Pointing Formula
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Official</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <Crown className="w-3 h-3 text-amber-500 fill-amber-500" /> 1st Place
                        </span>
                        <span className="text-slate-900 dark:text-white font-black">+25 PTS</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <Medal className="w-3 h-3 text-slate-400 fill-slate-400" /> 2nd Place
                        </span>
                        <span className="text-slate-900 dark:text-white font-black">+20 PTS</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <Award className="w-3 h-3 text-amber-700 fill-amber-700" /> 3rd Place
                        </span>
                        <span className="text-slate-900 dark:text-white font-black">+15 PTS</span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-white/[0.02] flex items-center justify-between">
                        <span className="text-slate-700 dark:text-slate-300 font-bold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-slate-400" /> 4th Place
                        </span>
                        <span className="text-slate-900 dark:text-white font-black">+10 PTS</span>
                    </div>
                </div>

                <p className="text-[10px] text-slate-400 font-mono">
                    Points distributed on Grand Final conclusion (1st: 25, 2nd: 20, 3rd: 15, 4th: 10).
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
                        className="relative w-full max-w-lg bg-white dark:bg-[#121624] border border-slate-200 dark:border-white/[0.08] rounded-3xl shadow-2xl p-5 sm:p-7 text-slate-900 dark:text-slate-100 overflow-hidden max-h-[90vh] flex flex-col"
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
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3.5 pb-4 border-b border-slate-100 dark:border-white/[0.04]">
                            {selectedDivision.logo_path ? (
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center p-1.5 shrink-0 bg-slate-50 dark:bg-white/[0.04]"
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
                        <div className="grid grid-cols-3 gap-2 py-4 border-b border-slate-100 dark:border-white/[0.04] font-mono text-center">
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                                <span className="text-[10px] text-slate-400 uppercase block">Total Points</span>
                                <span className="text-base font-black text-amber-500">
                                    {selectedDivision.total_accumulated_points || 0} PTS
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                                <span className="text-[10px] text-slate-400 uppercase block">Match Record</span>
                                <span className="text-base font-black text-slate-900 dark:text-white">
                                    <span className="text-emerald-500">{activeBreakdown.wins}W</span> - <span className="text-rose-500">{activeBreakdown.losses}L</span>
                                </span>
                            </div>
                            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.02]">
                                <span className="text-[10px] text-slate-400 uppercase block">Winrate</span>
                                <span className="text-base font-black text-purple-600 dark:text-purple-400">
                                    {activeBreakdown.winrate}%
                                </span>
                            </div>
                        </div>

                        {/* Match-by-Match History */}
                        <div className="flex-1 overflow-y-auto py-4 space-y-2 pr-1">
                            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center justify-between">
                                <span>Tournament Match Breakdown</span>
                                <span className="font-mono text-[10px]">{activeBreakdown.list.length} Matches</span>
                            </h4>

                            {activeBreakdown.list.length === 0 ? (
                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-white/[0.02] text-center text-xs text-slate-400">
                                    No matches recorded for this division yet.
                                </div>
                            ) : (
                                activeBreakdown.list.map((m) => {
                                    const oppName = m.oppDiv?.name || 'TBD (Opponent)';

                                    return (
                                        <div
                                            key={m.id}
                                            className={`p-3 rounded-2xl transition-all flex items-center justify-between gap-3 ${
                                                m.isFinished
                                                    ? m.isWinner
                                                        ? 'bg-emerald-500/10'
                                                        : 'bg-rose-500/10'
                                                    : 'bg-slate-50 dark:bg-white/[0.02]'
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
                        <div className="pt-4 border-t border-slate-100 dark:border-white/[0.04] flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedDivision(null)}
                                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.08] dark:hover:bg-white/[0.12] text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer"
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
