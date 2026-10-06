import React from 'react';
import { Radio, ExternalLink, Flame, Trophy, Play, Swords, Clock, Sparkles } from 'lucide-react';

export default function FeaturedMatchHero({ match }) {
    if (!match) {
        return (
            <div className="rounded-3xl bg-white dark:bg-[#121520] border border-slate-200/80 dark:border-white/[0.04] p-6 text-center text-slate-500 shadow-sm">
                No active featured match scheduled.
            </div>
        );
    }

    const divA = match.division_a || match.divisionA || { name: 'Seed 1', color_hex: '#B784A7' };
    const divB = match.division_b || match.divisionB || { name: 'Seed 2', color_hex: '#98FF98' };

    const colorA = divA.color_hex || '#B784A7';
    const colorB = divB.color_hex || '#98FF98';

    const isLive = match.status === 'live';
    const roundTitle = match.round_level === 2 ? 'Grand Finals — Best of 5' : (match.round_name || 'Semifinal Clash — Best of 3');
    const streamUrl = match.stream_url || 'https://zoom.us';

    return (
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/[0.05] shadow-sm dark:shadow-2xl p-4 sm:p-6 md:p-8 transition-all bg-white dark:bg-[#121520]">
            {/* Dynamic Hex Color Gradient Backdrop */}
            <div
                className="absolute inset-0 opacity-15 dark:opacity-25 transition-all duration-700 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${colorA} 0%, rgba(20, 23, 34, 0.2) 50%, ${colorB} 100%)`,
                }}
            />

            {/* Glass overlay pattern */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/80 to-transparent dark:from-[#0D0F15] dark:via-[#121520]/90 dark:to-transparent pointer-events-none" />

            <div className="relative z-10 space-y-6">
                {/* Top Badge Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/[0.05] text-xs backdrop-blur-md">
                        {isLive ? (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                <span className="font-black text-rose-600 dark:text-rose-400 tracking-wider uppercase flex items-center gap-1 text-[11px]">
                                    <Radio className="w-3.5 h-3.5" />
                                    Live Stream Active
                                </span>
                            </>
                        ) : (
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                                Upcoming Spotlight Match
                            </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-black uppercase">
                            {match.match_identifier || 'Stage UB1'}
                        </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {roundTitle} · MLBB 5v5
                    </div>
                </div>

                {/* Center: Head-to-Head Clash Layout (Flawless alignment on mobile & desktop) */}
                <div className="grid grid-cols-11 items-center gap-2 sm:gap-6 py-2">
                    {/* Team A */}
                    <div className="col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 min-w-0">
                        <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center p-2 shadow-md transition-transform hover:scale-105 overflow-hidden"
                            style={{ 
                                backgroundColor: colorA + '22',
                                borderColor: colorA,
                                borderWidth: '2px',
                                boxShadow: `0 0 20px ${colorA}33`
                            }}
                        >
                            {divA.logo_path ? (
                                <img src={divA.logo_path} alt={divA.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                            ) : (
                                <span className="font-black text-2xl sm:text-3xl text-slate-950" style={{ color: colorA }}>
                                    {divA.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 w-full">
                            <h3 className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {divA.name}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider block">
                                Division Faction
                            </span>
                        </div>
                    </div>

                    {/* VS & Score Centerpiece */}
                    <div className="col-span-1 flex flex-col items-center justify-center py-2 shrink-0">
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-100 dark:bg-[#1A1F30] border-2 border-rose-500/50 flex items-center justify-center shadow-md">
                            <Swords className="w-5 h-5 text-rose-500 animate-pulse" />
                        </div>

                        <div className="mt-2 font-mono font-black text-base sm:text-2xl md:text-3xl text-slate-900 dark:text-white tracking-tight text-center">
                            <span>{match.score_a ?? 0}</span>
                            <span className="text-slate-400 mx-1">-</span>
                            <span>{match.score_b ?? 0}</span>
                        </div>

                        <span className="text-[9px] font-mono uppercase font-bold text-rose-500 mt-0.5">
                            {isLive ? 'LIVE' : 'VS'}
                        </span>
                    </div>

                    {/* Team B */}
                    <div className="col-span-5 flex flex-col items-center md:items-end text-center md:text-right space-y-2 min-w-0">
                        <div 
                            className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl flex items-center justify-center p-2 shadow-md transition-transform hover:scale-105 overflow-hidden"
                            style={{ 
                                backgroundColor: colorB + '22',
                                borderColor: colorB,
                                borderWidth: '2px',
                                boxShadow: `0 0 20px ${colorB}33`
                            }}
                        >
                            {divB.logo_path ? (
                                <img src={divB.logo_path} alt={divB.name} className="w-full h-full object-contain filter drop-shadow-sm" />
                            ) : (
                                <span className="font-black text-2xl sm:text-3xl text-slate-950" style={{ color: colorB }}>
                                    {divB.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 w-full">
                            <h3 className="text-sm sm:text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {divB.name}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-mono text-slate-500 uppercase tracking-wider block">
                                Division Faction
                            </span>
                        </div>
                    </div>
                </div>

                {/* Footer Call to Action & Scheduled Info */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/[0.04]">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Scheduled: <strong className="text-slate-900 dark:text-white">{match.scheduled_at || 'Today · Stage Session'}</strong></span>
                    </div>

                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm transition-all active:scale-95 cursor-pointer"
                        >
                            <Play className="w-3.5 h-3.5 fill-white" />
                            <span>Watch Arena Live Feed</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

