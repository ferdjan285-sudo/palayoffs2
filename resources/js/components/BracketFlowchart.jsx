import React from 'react';
import { 
    Trophy, 
    Crown, 
    Swords, 
    Users, 
    ArrowRight, 
    ArrowDown,
    Flame,
    Radio
} from 'lucide-react';

export default function BracketFlowchart({ bracketData, onSelectMatch }) {
    const allMatches = bracketData?.all_matches || [];
    
    // Find matches by identifier
    const m1 = allMatches.find(m => m.match_identifier === 'M1' || m.match_identifier === 'UB1' || m.identifier === 'M1' || m.identifier === 'UB1');
    const m2 = allMatches.find(m => m.match_identifier === 'M2' || m.match_identifier === 'UB2' || m.identifier === 'M2' || m.identifier === 'UB2');
    const ubFinal = allMatches.find(m => m.match_identifier === 'UB-F' || m.identifier === 'UB-F');
    const lbR1 = allMatches.find(m => m.match_identifier === 'LB-R1' || m.identifier === 'LB-R1');
    const lbFinal = allMatches.find(m => m.match_identifier === 'LB-F' || m.identifier === 'LB-F');
    const gf = allMatches.find(m => m.match_identifier === 'GF' || m.identifier === 'GF');

    // Helper to get division details
    const getDiv = (match, slot) => {
        if (!match) return null;
        if (slot === 'a') return match.division_a || match.divisionA;
        if (slot === 'b') return match.division_b || match.divisionB;
        return null;
    };

    return (
        <div id="bracket-section" className="relative w-full rounded-3xl bg-white dark:bg-[#080B14] border border-slate-200 dark:border-[#1E2538] p-5 sm:p-8 shadow-sm dark:shadow-2xl overflow-hidden select-none transition-colors duration-200">
            {/* Top Atmospheric Glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent pointer-events-none" />

            {/* 1. TOURNAMENT BANNER HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-8 border-b border-slate-200 dark:border-[#182033]">
                {/* Left: Mobile Legends Brand Mark */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-md flex items-center justify-center font-black text-slate-950 text-xl tracking-tighter">
                        M
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-base tracking-widest text-slate-900 dark:text-white uppercase">
                                MOBILE LEGENDS
                            </span>
                        </div>
                        <p className="text-[10px] tracking-[0.25em] text-slate-500 dark:text-slate-400 font-mono uppercase">
                            BANG BANG
                        </p>
                    </div>
                </div>

                {/* Center: Dynamic Title */}
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-black italic tracking-wide text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-amber-200 uppercase drop-shadow-sm">
                        4-Team Double Elimination
                    </h2>
                    <p className="text-xs sm:text-sm font-mono tracking-[0.3em] text-cyan-600 dark:text-cyan-400 uppercase font-bold mt-0.5">
                        TOURNAMENT BRACKET
                    </p>
                </div>

                {/* Right: Tournament Tagline */}
                <div className="hidden lg:block text-right">
                    <p className="text-sm font-black italic tracking-wider text-cyan-600 dark:text-cyan-300">
                        BIGGER DREAMS,
                    </p>
                    <p className="text-sm font-black italic tracking-wider text-amber-500 dark:text-amber-400">
                        BIGGER BATTLES
                    </p>
                </div>
            </div>

            {/* 2. MAIN TOURNAMENT BRACKETING GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-stretch">
                {/* LEFT & CENTER: Upper and Lower Brackets */}
                <div className="xl:col-span-8 space-y-8 flex flex-col justify-between">
                    
                    {/* ====== A. UPPER BRACKET ====== */}
                    <div className="relative rounded-3xl bg-slate-50/70 dark:bg-[#0B101D]/90 border border-sky-200 dark:border-[#1B4079] p-5 sm:p-6 shadow-sm dark:shadow-2xl overflow-hidden">
                        {/* Upper Bracket Header Tag */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-r-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-sm -ml-6 border-y border-r border-sky-500">
                                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                                <span>UPPER BRACKET</span>
                            </div>
                            <span className="text-[11px] font-mono text-sky-600 dark:text-cyan-400 font-bold tracking-wider uppercase">
                                Winners Path · Best of 3
                            </span>
                        </div>

                        {/* Upper Bracket Matches */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* Round 1 (M1 & M2) */}
                            <div className="space-y-4">
                                <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
                                    ROUND 1
                                </div>

                                {/* M1: Mauve vs Mint */}
                                <div className="relative">
                                    <MatchContainer
                                        matchId="M1"
                                        match={m1}
                                        teamA={getDiv(m1, 'a') || { name: 'MAUVE', color_hex: '#B784A7' }}
                                        teamB={getDiv(m1, 'b') || { name: 'MINT', color_hex: '#98FF98' }}
                                        theme="blue"
                                        onSelect={onSelectMatch}
                                    />
                                </div>

                                {/* M2: Peach vs Cyan */}
                                <div className="relative">
                                    <MatchContainer
                                        matchId="M2"
                                        match={m2}
                                        teamA={getDiv(m2, 'a') || { name: 'PEACH', color_hex: '#FFCBA4' }}
                                        teamB={getDiv(m2, 'b') || { name: 'CYAN', color_hex: '#00E5FF' }}
                                        theme="blue"
                                        onSelect={onSelectMatch}
                                    />
                                </div>
                            </div>

                            {/* Upper Bracket Final */}
                            <div className="space-y-4">
                                <div className="text-[11px] font-black uppercase tracking-widest text-sky-700 dark:text-cyan-300 px-1 flex items-center justify-between">
                                    <span>UPPER BRACKET FINAL</span>
                                    <span className="text-[10px] font-mono text-sky-600 dark:text-cyan-500 font-bold">To Grand Final</span>
                                </div>

                                <div className="relative">
                                    <FinalSlotContainer
                                        title=""
                                        match={ubFinal}
                                        slotA={getDiv(ubFinal, 'a')}
                                        slotB={getDiv(ubFinal, 'b')}
                                        placeholderA="Winner M1"
                                        placeholderB="Winner M2"
                                        theme="blue"
                                        onSelect={onSelectMatch}
                                    />

                                    {/* Route Indicators */}
                                    <div className="mt-3 flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-sky-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                                            <ArrowRight className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                                            Winner → Grand Final
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                            <ArrowDown className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                            Loser → Lower Bracket Final
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ====== B. LOWER BRACKET ====== */}
                    <div className="relative rounded-3xl bg-slate-50/70 dark:bg-[#140A10]/90 border border-rose-200 dark:border-[#8A182E] p-5 sm:p-6 shadow-sm dark:shadow-2xl overflow-hidden">
                        {/* Lower Bracket Header Tag */}
                        <div className="flex items-center justify-between mb-6">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-r-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-sm -ml-6 border-y border-r border-rose-500">
                                <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
                                <span>LOWER BRACKET</span>
                            </div>
                            <span className="text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold tracking-wider uppercase">
                                Elimination & Decider Path
                            </span>
                        </div>

                        {/* Lower Bracket Matches */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                            {/* Lower Round 1 */}
                            <div className="space-y-4">
                                <div className="text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
                                    LOWER ROUND 1
                                </div>

                                <MatchContainer
                                    matchId="LR1"
                                    match={lbR1}
                                    teamA={getDiv(lbR1, 'a')}
                                    teamB={getDiv(lbR1, 'b')}
                                    placeholderA="Loser M1"
                                    placeholderB="Loser M2"
                                    theme="red"
                                    onSelect={onSelectMatch}
                                />

                                {/* Transition Pill */}
                                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-[#220B14] border border-rose-200 dark:border-[#6B1527] text-center">
                                    <span className="text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                                        Winner of Lower Round 1
                                    </span>
                                </div>
                            </div>

                            {/* Lower Bracket Final */}
                            <div className="space-y-4">
                                <div className="text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 px-1 flex items-center justify-between">
                                    <span>LOWER BRACKET FINAL</span>
                                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">Decider</span>
                                </div>

                                <div className="p-4 rounded-2xl bg-white dark:bg-[#1C0D16] border border-rose-200 dark:border-[#A81B34] shadow-sm hover:shadow-md space-y-3 cursor-pointer transition-all"
                                    onClick={() => onSelectMatch && onSelectMatch(lbFinal)}
                                >
                                    {/* Slot 1: Winner of Lower Round 1 */}
                                    <TeamBar
                                        division={getDiv(lbFinal, 'a')}
                                        placeholder="Winner of Lower Round 1"
                                        score={lbFinal?.score_a}
                                        theme="red"
                                    />

                                    {/* Bold Red VS Badge */}
                                    <div className="flex items-center justify-center my-1">
                                        <span className="text-base font-black italic tracking-widest text-rose-600 dark:text-rose-500">
                                            VS
                                        </span>
                                    </div>

                                    {/* Slot 2: Loser of Upper Bracket Final */}
                                    <TeamBar
                                        division={getDiv(lbFinal, 'b')}
                                        placeholder="Loser of Upper Bracket Final"
                                        score={lbFinal?.score_b}
                                        theme="red"
                                    />

                                    {/* Status Badge */}
                                    <div className="pt-2 border-t border-slate-100 dark:border-rose-950 flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-rose-600 dark:text-rose-400 font-bold">Winner → Grand Final</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-bold">Loser = 3rd Place</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Grand Final (Clean Neutral Championship Card - Fully Visible Crown & Responsive Text Fit) */}
                <div className="xl:col-span-4 flex flex-col justify-center pt-8">
                    <div className="relative rounded-3xl bg-white dark:bg-[#0B101D] border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm dark:shadow-2xl flex flex-col justify-center overflow-visible">
                        {/* Fully Visible Championship Crown Badge (Zero clipping) */}
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 flex items-center justify-center w-12 h-12 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 shadow-md border border-slate-200 dark:border-slate-700 z-20">
                            <Crown className="w-6 h-6 text-white dark:text-slate-100" />
                        </div>

                        {/* Grand Final Header */}
                        <div className="text-center mt-3 mb-6">
                            <h3 className="text-xl sm:text-2xl font-black tracking-widest text-slate-900 dark:text-white uppercase">
                                GRAND FINAL
                            </h3>
                            <p className="text-[11px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                                Championship Match · Bo5
                            </p>
                        </div>

                        {/* Grand Final Teams Card (Spacious layout, no text clipping) */}
                        <div 
                            onClick={() => onSelectMatch && onSelectMatch(gf)}
                            className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 dark:bg-[#0F1626] border border-slate-200 dark:border-slate-800 shadow-xs space-y-3 sm:space-y-4 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                        >
                            {/* Slot 1: Winner of Upper Bracket Final */}
                            <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#141E34] border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {getDiv(gf, 'a')?.logo_path ? (
                                        <img 
                                            src={getDiv(gf, 'a').logo_path} 
                                            alt={getDiv(gf, 'a').name} 
                                            className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter drop-shadow-sm" 
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-slate-500 shrink-0">
                                            UB
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 pr-1">
                                        <p className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white leading-snug break-words">
                                            {getDiv(gf, 'a')?.name ? `${getDiv(gf, 'a').name} Division` : 'Winner of Upper Final'}
                                        </p>
                                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                            Upper Bracket Champion
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-[#0B101D] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                                    {gf?.score_a ?? 0}
                                </span>
                            </div>

                            {/* Divider VS */}
                            <div className="flex items-center justify-center my-0.5">
                                <span className="text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 font-mono">
                                    — VS —
                                </span>
                            </div>

                            {/* Slot 2: Winner of Lower Bracket Final */}
                            <div className="p-3 sm:p-3.5 rounded-xl bg-white dark:bg-[#141E34] border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-3 shadow-xs">
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                    {getDiv(gf, 'b')?.logo_path ? (
                                        <img 
                                            src={getDiv(gf, 'b').logo_path} 
                                            alt={getDiv(gf, 'b').name} 
                                            className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter drop-shadow-sm" 
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-mono font-bold text-[10px] text-slate-500 shrink-0">
                                            LB
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 pr-1">
                                        <p className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white leading-snug break-words">
                                            {getDiv(gf, 'b')?.name ? `${getDiv(gf, 'b').name} Division` : 'Winner of Lower Final'}
                                        </p>
                                        <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                            Lower Bracket Champion
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-[#0B101D] px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
                                    {gf?.score_b ?? 0}
                                </span>
                            </div>
                        </div>

                        {/* Status & Points Reward */}
                        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center space-y-2">
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-mono text-xs font-black uppercase">
                                {gf?.status === 'finished' ? 'Champion Crowned' : gf?.status === 'live' ? '● Live Championship' : 'Awaiting Finalists'}
                            </span>
                            <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                                1st Place (+25 PTS) · 2nd Place (+20 PTS)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. BOTTOM LEGEND BAR */}
            <div className="mt-8 pt-5 border-t border-slate-200 dark:border-[#182033] flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                {/* Left: 4 Teams Total Note */}
                <div className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-[#141C30] border border-slate-200 dark:border-[#233152] flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider block text-xs">
                            4 TEAMS TOTAL
                        </span>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                            All 4 teams start in the Upper Bracket. After Round 1, 2 teams drop to the Lower Bracket.
                        </p>
                    </div>
                </div>

                {/* Center: Blue & Red Routing Key */}
                <div className="flex flex-wrap items-center gap-5">
                    <div className="flex items-center gap-2">
                        <span className="w-6 h-3 rounded-sm bg-sky-600 dark:bg-[#1E4E8C] shadow-sm" />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-cyan-200">
                            = Winner advances
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="w-6 h-3 rounded-sm bg-rose-600 dark:bg-[#A81B34] shadow-sm" />
                        <span className="text-[11px] font-bold text-slate-700 dark:text-rose-200">
                            = Loser goes to Lower Bracket (or eliminated)
                        </span>
                    </div>
                </div>

                {/* Right: Golden M Badge */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center font-black text-slate-950 text-base shadow-sm shrink-0">
                    M
                </div>
            </div>
        </div>
    );
}

// Sub-component: Match Container for Round 1 (M1, M2, Lower R1)
function MatchContainer({ matchId, match, teamA, teamB, placeholderA = 'TBD Seed A', placeholderB = 'TBD Seed B', theme = 'blue', onSelect }) {
    const isBlue = theme === 'blue';
    const isLive = match?.status === 'live';

    return (
        <div 
            onClick={() => onSelect && onSelect(match)}
            className={`rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow overflow-hidden flex items-stretch ${
                isBlue 
                    ? 'bg-white dark:bg-[#0E1528] border-slate-200 dark:border-[#1D3C6A]' 
                    : 'bg-white dark:bg-[#1E0D16] border-slate-200 dark:border-[#661625]'
            } ${isLive ? 'ring-2 ring-rose-500 shadow-md' : ''}`}
        >
            {/* Left Match Label Pill */}
            <div className={`w-11 flex flex-col items-center justify-center font-black font-mono text-xs border-r py-2 gap-0.5 ${
                isBlue 
                    ? 'bg-sky-50 dark:bg-[#152B4D] border-slate-200 dark:border-[#1D3C6A] text-sky-700 dark:text-cyan-300' 
                    : 'bg-rose-50 dark:bg-[#3A101A] border-slate-200 dark:border-[#661625] text-rose-700 dark:text-rose-300'
            }`}>
                <span>{matchId}</span>
                {match?.best_of && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 uppercase font-black">
                        BO{match.best_of}
                    </span>
                )}
            </div>

            {/* Team Rows */}
            <div className="flex-1 p-3 space-y-2">
                <TeamBar
                    division={teamA}
                    placeholder={placeholderA}
                    score={match?.score_a}
                    isWinner={Boolean(match?.winner && teamA && match.winner.id === teamA.id)}
                    theme={theme}
                />
                <TeamBar
                    division={teamB}
                    placeholder={placeholderB}
                    score={match?.score_b}
                    isWinner={Boolean(match?.winner && teamB && match.winner.id === teamB.id)}
                    theme={theme}
                />
            </div>
        </div>
    );
}

// Sub-component: Upper Bracket Final Container
function FinalSlotContainer({ match, slotA, slotB, placeholderA, placeholderB, theme = 'blue', onSelect }) {
    const isLive = match?.status === 'live';

    return (
        <div 
            onClick={() => onSelect && onSelect(match)}
            className={`p-4 rounded-2xl bg-white dark:bg-[#0E1528] border border-slate-200 dark:border-[#1D3C6A] hover:shadow-md transition-all cursor-pointer shadow-sm space-y-2.5 ${
                isLive ? 'ring-2 ring-rose-500 shadow-md' : ''
            }`}
        >
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-slate-800/80">
                <span>{match?.identifier || 'FINAL'}</span>
                {match?.best_of && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        BO{match.best_of}
                    </span>
                )}
            </div>
            <TeamBar
                division={slotA}
                placeholder={placeholderA}
                score={match?.score_a}
                isWinner={Boolean(match?.winner && slotA && match.winner.id === slotA.id)}
                theme={theme}
            />
            <TeamBar
                division={slotB}
                placeholder={placeholderB}
                score={match?.score_b}
                isWinner={Boolean(match?.winner && slotB && match.winner.id === slotB.id)}
                theme={theme}
            />
        </div>
    );
}

// Sub-component: Team Bar
function TeamBar({ division, placeholder = 'TBD Seed', score = 0, isWinner = false, theme = 'blue' }) {
    const isBlue = theme === 'blue';
    const hasDiv = Boolean(division && division.name);
    const logo = division?.logo_path;

    return (
        <div className={`flex items-center justify-between p-2 rounded-xl transition-all ${
            isWinner 
                ? 'bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-white/20' 
                : 'bg-slate-50 dark:bg-[#080C16] border border-slate-100 dark:border-[#141C30]'
        }`}>
            {/* Team Left Pill + Logo + Name */}
            <div className="flex items-center gap-2 truncate">
                <span className={`w-2 h-6 rounded-sm shrink-0 ${
                    isBlue ? 'bg-sky-500 dark:bg-cyan-500' : 'bg-rose-500'
                }`} />

                {hasDiv && logo ? (
                    <img 
                        src={logo} 
                        alt={division.name} 
                        className="w-5 h-5 object-contain shrink-0 filter drop-shadow-sm" 
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : null}

                <span className={`font-black text-xs sm:text-sm uppercase tracking-wider truncate ${
                    hasDiv ? 'text-slate-900 dark:text-white' : 'text-slate-400 italic'
                }`}>
                    {hasDiv ? division.name : placeholder}
                </span>
            </div>

            {/* Score Pill */}
            <div className="font-mono font-black text-xs px-2 py-0.5 rounded-lg bg-white dark:bg-[#0F1422] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 shrink-0">
                {score ?? 0}
            </div>
        </div>
    );
}
