import React, { useState } from 'react';
import { 
    Trophy, 
    Crown, 
    Swords, 
    Users, 
    ArrowRight, 
    ArrowDown, 
    Flame, 
    Radio, 
    Sparkles, 
    Layers, 
    Shield, 
    Zap, 
    ChevronRight, 
    SlidersHorizontal 
} from 'lucide-react';

export default function BracketFlowchart({ bracketData, onSelectMatch }) {
    const allMatches = bracketData?.all_matches || [];
    const [bracketView, setBracketView] = useState('all'); // 'all' | 'upper' | 'lower' | 'final'
    
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

    const STAGES = [
        { id: 'all', label: 'All Stages', icon: Swords, badge: 'Full View', color: 'from-cyan-600 to-blue-600' },
        { id: 'upper', label: 'Upper Bracket', icon: Shield, badge: 'Winners (Bo3)', color: 'from-sky-600 to-blue-700' },
        { id: 'lower', label: 'Lower Bracket', icon: Zap, badge: 'Deciders', color: 'from-rose-600 to-red-700' },
        { id: 'final', label: 'Grand Final', icon: Crown, badge: 'Championship (Bo5)', color: 'from-amber-500 to-yellow-600' },
    ];

    return (
        <div id="bracket-section" className="relative w-full rounded-3xl bg-white dark:bg-[#0A0D18] border border-slate-200/80 dark:border-white/[0.04] p-4 sm:p-6 md:p-8 shadow-xs dark:shadow-2xl overflow-hidden select-none transition-colors duration-200 animate-reveal-up">
            {/* Top Atmospheric Glow */}
            <div className="absolute top-0 left-1/4 right-1/4 h-px bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent pointer-events-none" />

            {/* 1. TOURNAMENT BANNER HEADER */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 sm:pb-6 mb-5 sm:mb-6 border-b border-slate-100 dark:border-white/[0.04]">
                {/* Left: Mobile Legends Brand Mark */}
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-400 p-0.5 shadow-sm flex items-center justify-center font-black text-slate-950 text-lg sm:text-xl tracking-tighter shrink-0">
                        M
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base tracking-widest text-slate-900 dark:text-white uppercase">
                                MOBILE LEGENDS
                            </span>
                        </div>
                        <p className="text-[9px] sm:text-[10px] tracking-[0.25em] text-slate-500 dark:text-slate-400 font-mono uppercase">
                            BANG BANG · 5v5
                        </p>
                    </div>
                </div>

                {/* Center: Dynamic Title */}
                <div className="text-center">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-black italic tracking-wide text-slate-900 dark:text-transparent dark:bg-clip-text dark:bg-gradient-to-r dark:from-white dark:via-slate-100 dark:to-amber-200 uppercase drop-shadow-xs">
                        4-Team Double Elimination
                    </h2>
                    <p className="text-[10px] sm:text-xs md:text-sm font-mono tracking-[0.2em] sm:tracking-[0.3em] text-cyan-600 dark:text-cyan-400 uppercase font-bold mt-0.5">
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

            {/* 2. RE-DESIGNED BRACKET STAGE SELECTOR */}
            <div className="mb-6">
                <div className="flex items-center justify-between gap-2 mb-2 px-1">
                    <span className="text-[11px] font-mono font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-500" />
                        <span>Filter Tournament Stage:</span>
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">Tap to inspect node</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 dark:bg-white/[0.02] p-1.5 rounded-2xl border border-slate-200/60 dark:border-white/[0.03]">
                    {STAGES.map((s) => {
                        const Icon = s.icon;
                        const isCurrent = bracketView === s.id;
                        return (
                            <button
                                key={s.id}
                                type="button"
                                onClick={() => setBracketView(s.id)}
                                className={`flex items-center gap-2 p-2 sm:p-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                                    isCurrent
                                        ? `bg-gradient-to-r ${s.color} text-white shadow-sm font-black`
                                        : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-white/[0.04]'
                                }`}
                            >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                                    isCurrent ? 'bg-white/20' : 'bg-slate-200/70 dark:bg-white/[0.05]'
                                }`}>
                                    <Icon className="w-3.5 h-3.5" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <span className="block text-xs font-bold leading-tight truncate">
                                        {s.label}
                                    </span>
                                    <span className={`text-[9px] font-mono block truncate ${
                                        isCurrent ? 'text-white/80' : 'text-slate-400'
                                    }`}>
                                        {s.badge}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 3. MAIN TOURNAMENT BRACKETING GRID */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 sm:gap-6 items-stretch">
                {/* LEFT & CENTER: Upper and Lower Brackets */}
                <div className={`xl:col-span-8 space-y-5 sm:space-y-6 flex flex-col justify-between ${
                    bracketView === 'final' ? 'hidden xl:flex' : 'flex'
                }`}>
                    
                    {/* ====== A. UPPER BRACKET ====== */}
                    <div className={`relative rounded-3xl bg-slate-50/70 dark:bg-[#0E1322] border border-sky-100 dark:border-white/[0.03] p-4 sm:p-5 shadow-xs dark:shadow-xl overflow-hidden transition-all ${
                        bracketView === 'lower' ? 'hidden xl:block' : 'block'
                    }`}>
                        {/* Upper Bracket Header Tag */}
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-r-xl bg-gradient-to-r from-sky-600 to-blue-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xs -ml-4 sm:-ml-5">
                                <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                                <span>UPPER BRACKET</span>
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-mono text-sky-600 dark:text-cyan-400 font-bold tracking-wider uppercase">
                                Winners Path · Best of 3
                            </span>
                        </div>

                        {/* Upper Bracket Matches */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-center">
                            {/* Round 1 (M1 & M2) */}
                            <div className="space-y-3 sm:space-y-3.5">
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
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
                            <div className="space-y-3 sm:space-y-3.5">
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-sky-700 dark:text-cyan-300 px-1 flex items-center justify-between">
                                    <span>UPPER BRACKET FINAL</span>
                                    <span className="text-[10px] font-mono text-sky-600 dark:text-cyan-500 font-bold">To Grand Final</span>
                                </div>

                                <div className="relative">
                                    <FinalSlotContainer
                                        match={ubFinal}
                                        slotA={getDiv(ubFinal, 'a')}
                                        slotB={getDiv(ubFinal, 'b')}
                                        placeholderA="Winner M1"
                                        placeholderB="Winner M2"
                                        theme="blue"
                                        onSelect={onSelectMatch}
                                    />

                                    {/* Route Indicators */}
                                    <div className="mt-2.5 sm:mt-3 flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-sky-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                                            <ArrowRight className="w-3 h-3 text-sky-600 dark:text-cyan-400" />
                                            Winner → Grand Final
                                        </span>
                                        <span className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
                                            <ArrowDown className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                                            Loser → Lower Final
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ====== B. LOWER BRACKET ====== */}
                    <div className={`relative rounded-3xl bg-slate-50/70 dark:bg-[#160D14] border border-rose-100 dark:border-white/[0.03] p-4 sm:p-5 shadow-xs dark:shadow-xl overflow-hidden transition-all ${
                        bracketView === 'upper' ? 'hidden xl:block' : 'block'
                    }`}>
                        {/* Lower Bracket Header Tag */}
                        <div className="flex items-center justify-between mb-4 sm:mb-5">
                            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-r-xl bg-gradient-to-r from-rose-600 to-red-700 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-xs -ml-4 sm:-ml-5">
                                <span className="w-2 h-2 rounded-full bg-rose-300 animate-ping" />
                                <span>LOWER BRACKET</span>
                            </div>
                            <span className="text-[10px] sm:text-[11px] font-mono text-rose-600 dark:text-rose-400 font-bold tracking-wider uppercase">
                                Elimination & Decider Path
                            </span>
                        </div>

                        {/* Lower Bracket Matches */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 items-center">
                            {/* Lower Round 1 */}
                            <div className="space-y-3 sm:space-y-3.5">
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 px-1">
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
                                <div className="p-2 sm:p-2.5 rounded-xl bg-rose-50/70 dark:bg-white/[0.02] text-center border border-transparent dark:border-white/[0.02]">
                                    <span className="text-xs font-black text-rose-700 dark:text-rose-300 uppercase tracking-wide">
                                        Winner of Lower Round 1
                                    </span>
                                </div>
                            </div>

                            {/* Lower Bracket Final */}
                            <div className="space-y-3 sm:space-y-3.5">
                                <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-rose-700 dark:text-rose-300 px-1 flex items-center justify-between">
                                    <span>LOWER BRACKET FINAL</span>
                                    <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400 font-bold">Decider</span>
                                </div>

                                <div className="p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#1E111C] border border-slate-100 dark:border-white/[0.04] shadow-xs hover:shadow-md space-y-2.5 sm:space-y-3 cursor-pointer transition-all"
                                    onClick={() => onSelectMatch && onSelectMatch(lbFinal)}
                                >
                                    <TeamBar
                                        division={getDiv(lbFinal, 'a')}
                                        placeholder="Winner of Lower Round 1"
                                        score={lbFinal?.score_a}
                                        theme="red"
                                    />

                                    <div className="flex items-center justify-center my-1">
                                        <span className="text-sm sm:text-base font-black italic tracking-widest text-rose-600 dark:text-rose-500">
                                            VS
                                        </span>
                                    </div>

                                    <TeamBar
                                        division={getDiv(lbFinal, 'b')}
                                        placeholder="Loser of Upper Bracket Final"
                                        score={lbFinal?.score_b}
                                        theme="red"
                                    />

                                    <div className="pt-2 border-t border-slate-100 dark:border-white/[0.04] flex items-center justify-between text-[10px] font-mono">
                                        <span className="text-rose-600 dark:text-rose-400 font-bold">Winner → Grand Final</span>
                                        <span className="text-slate-500 dark:text-slate-400 font-bold">Loser = 3rd Place</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT: Grand Final Championship Card */}
                <div className={`xl:col-span-4 flex flex-col justify-center pt-5 sm:pt-6 ${
                    bracketView === 'upper' || bracketView === 'lower' ? 'hidden xl:flex' : 'flex'
                }`}>
                    <div className="relative rounded-3xl bg-white dark:bg-[#101526] border border-slate-100 dark:border-white/[0.04] p-5 sm:p-6 shadow-xs dark:shadow-2xl flex flex-col justify-center overflow-visible">
                        {/* Championship Crown Badge */}
                        <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex items-center justify-center w-11 h-11 rounded-2xl bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 shadow-md border border-slate-200/50 dark:border-white/10 z-20">
                            <Crown className="w-5 h-5 text-white dark:text-slate-100" />
                        </div>

                        {/* Grand Final Header */}
                        <div className="text-center mt-3 mb-4 sm:mb-5">
                            <h3 className="text-lg sm:text-xl md:text-2xl font-black tracking-widest text-slate-900 dark:text-white uppercase">
                                GRAND FINAL
                            </h3>
                            <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-slate-500 dark:text-slate-400 uppercase font-bold mt-1">
                                Championship Match · Bo5
                            </p>
                        </div>

                        {/* Grand Final Teams Card */}
                        <div 
                            onClick={() => onSelectMatch && onSelectMatch(gf)}
                            className="p-3 sm:p-4 rounded-2xl bg-slate-50/70 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.03] shadow-xs space-y-2 sm:space-y-3 cursor-pointer hover:border-slate-300 dark:hover:border-white/10 transition-all"
                        >
                            {/* Slot 1: Winner of Upper Bracket Final */}
                            <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#151D34] border border-transparent dark:border-white/[0.02] flex items-center justify-between gap-2 sm:gap-3 shadow-xs">
                                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                                    {getDiv(gf, 'a')?.logo_path ? (
                                        <img 
                                            src={getDiv(gf, 'a').logo_path} 
                                            alt={getDiv(gf, 'a').name} 
                                            className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter drop-shadow-sm" 
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center font-mono font-bold text-[10px] text-slate-500 shrink-0">
                                            UB
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 pr-1">
                                        <p className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white leading-snug break-words">
                                            {getDiv(gf, 'a')?.name ? `${getDiv(gf, 'a').name} Division` : 'Winner of Upper Final'}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                            Upper Bracket Champion
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-black/40 px-2 sm:px-2.5 py-1 rounded-lg shrink-0">
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
                            <div className="p-2.5 sm:p-3 rounded-xl bg-white dark:bg-[#151D34] border border-transparent dark:border-white/[0.02] flex items-center justify-between gap-2 sm:gap-3 shadow-xs">
                                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                                    {getDiv(gf, 'b')?.logo_path ? (
                                        <img 
                                            src={getDiv(gf, 'b').logo_path} 
                                            alt={getDiv(gf, 'b').name} 
                                            className="w-6 h-6 sm:w-7 sm:h-7 object-contain shrink-0 filter drop-shadow-sm" 
                                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-slate-100 dark:bg-white/[0.05] flex items-center justify-center font-mono font-bold text-[10px] text-slate-500 shrink-0">
                                            LB
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1 pr-1">
                                        <p className="text-xs sm:text-sm font-black uppercase text-slate-900 dark:text-white leading-snug break-words">
                                            {getDiv(gf, 'b')?.name ? `${getDiv(gf, 'b').name} Division` : 'Winner of Lower Final'}
                                        </p>
                                        <p className="text-[9px] sm:text-[10px] font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                                            Lower Bracket Champion
                                        </p>
                                    </div>
                                </div>
                                <span className="font-mono font-black text-xs sm:text-sm text-slate-900 dark:text-white bg-slate-100 dark:bg-black/40 px-2 sm:px-2.5 py-1 rounded-lg shrink-0">
                                    {gf?.score_b ?? 0}
                                </span>
                            </div>
                        </div>

                        {/* Status & Points Reward */}
                        <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-100 dark:border-white/[0.04] text-center space-y-1.5">
                            <span className="inline-block px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-slate-800 dark:text-slate-200 font-mono text-[11px] sm:text-xs font-black uppercase">
                                {gf?.status === 'finished' ? 'Champion Crowned' : gf?.status === 'live' ? '● Live Championship' : 'Awaiting Finalists'}
                            </span>
                            <p className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 font-bold">
                                1st Place (+25 PTS) · 2nd Place (+20 PTS)
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* 4. BOTTOM LEGEND BAR */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-slate-100 dark:border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4 text-xs">
                {/* Left: 4 Teams Total Note */}
                <div className="flex items-center gap-2.5 sm:gap-3 text-slate-700 dark:text-slate-300">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center text-cyan-600 dark:text-cyan-400 shrink-0">
                        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </div>
                    <div>
                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider block text-[11px] sm:text-xs">
                            4 TEAMS TOTAL
                        </span>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                            Double elimination system with continuous live progression.
                        </p>
                    </div>
                </div>

                {/* Center: Blue & Red Routing Key */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-4 sm:w-5 h-2.5 sm:h-3 rounded-sm bg-sky-600 dark:bg-sky-500 shadow-xs" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-cyan-200">
                            = Winner advances
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="w-4 sm:w-5 h-2.5 sm:h-3 rounded-sm bg-rose-600 dark:bg-rose-500 shadow-xs" />
                        <span className="text-[10px] sm:text-[11px] font-bold text-slate-700 dark:text-rose-200">
                            = Lower Bracket (or eliminated)
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Sub-component: Match Container for Round 1
function MatchContainer({ matchId, match, teamA, teamB, placeholderA = 'TBD Seed A', placeholderB = 'TBD Seed B', theme = 'blue', onSelect }) {
    const isBlue = theme === 'blue';
    const isLive = match?.status === 'live';

    return (
        <div 
            onClick={() => onSelect && onSelect(match)}
            className={`rounded-2xl transition-all cursor-pointer shadow-xs hover:shadow-md overflow-hidden flex items-stretch border ${
                isBlue 
                    ? 'bg-white dark:bg-[#12182B] border-slate-100 dark:border-white/[0.04]' 
                    : 'bg-white dark:bg-[#1E111C] border-slate-100 dark:border-white/[0.04]'
            } ${isLive ? 'ring-2 ring-rose-500 shadow-md' : ''}`}
        >
            {/* Left Match Label Pill */}
            <div className={`w-10 sm:w-11 flex flex-col items-center justify-center font-black font-mono text-xs py-2 gap-0.5 ${
                isBlue 
                    ? 'bg-sky-50 dark:bg-white/[0.04] text-sky-700 dark:text-cyan-300' 
                    : 'bg-rose-50 dark:bg-white/[0.04] text-rose-700 dark:text-rose-300'
            }`}>
                <span>{matchId}</span>
                {match?.best_of && (
                    <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-black/10 dark:bg-white/10 uppercase font-black">
                        BO{match.best_of}
                    </span>
                )}
            </div>

            {/* Team Rows */}
            <div className="flex-1 p-2 sm:p-2.5 space-y-1.5">
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
            className={`p-3 sm:p-3.5 rounded-2xl bg-white dark:bg-[#12182B] border border-slate-100 dark:border-white/[0.04] hover:shadow-md transition-all cursor-pointer shadow-xs space-y-2 ${
                isLive ? 'ring-2 ring-rose-500 shadow-md' : ''
            }`}
        >
            <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-500 pb-1 border-b border-slate-100 dark:border-white/[0.04]">
                <span>{match?.identifier || 'FINAL'}</span>
                {match?.best_of && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
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
        <div className={`flex items-center justify-between p-1.5 sm:p-2 rounded-xl transition-all ${
            isWinner 
                ? 'bg-slate-100/90 dark:bg-white/[0.08] shadow-xs' 
                : 'bg-slate-50 dark:bg-white/[0.02] hover:dark:bg-white/[0.04]'
        }`}>
            {/* Team Left Pill + Logo + Name */}
            <div className="flex items-center gap-1.5 sm:gap-2 truncate min-w-0 pr-1">
                <span className={`w-1.5 h-4 sm:h-5 rounded-full shrink-0 ${
                    isBlue ? 'bg-sky-500 dark:bg-cyan-400' : 'bg-rose-500'
                }`} />

                {hasDiv && logo ? (
                    <img 
                        src={logo} 
                        alt={division.name} 
                        className="w-4 h-4 sm:w-5 sm:h-5 object-contain shrink-0 filter drop-shadow-sm" 
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
            <div className="font-mono font-black text-[11px] sm:text-xs px-2 py-0.5 rounded-lg bg-white dark:bg-black/40 text-slate-800 dark:text-slate-200 shrink-0">
                {score ?? 0}
            </div>
        </div>
    );
}
