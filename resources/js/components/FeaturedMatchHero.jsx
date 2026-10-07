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
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/70 dark:border-white/[0.06] shadow-xs p-4 sm:p-6 md:p-8 transition-all bg-white dark:bg-[#10131D]">
            <div className="relative z-10 space-y-6">
                {/* Top Badge Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/[0.04]">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-white/[0.05] text-xs">
                        {isLive ? (
                            <>
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="font-bold text-rose-600 dark:text-rose-400 tracking-wider uppercase flex items-center gap-1 text-[11px] font-mono">
                                    <Radio className="w-3.5 h-3.5" />
                                    Live Clash Active
                                </span>
                            </>
                        ) : (
                            <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px] uppercase tracking-wider flex items-center gap-1.5 font-mono">
                                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                                Spotlight Clash
                            </span>
                        )}
                        <span className="text-slate-300 dark:text-slate-600">·</span>
                        <span className="text-slate-900 dark:text-white font-mono text-[11px] font-bold uppercase">
                            {match.match_identifier || 'Stage UB1'} · BO{match.best_of || 3}
                        </span>
                    </div>

                    <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {roundTitle} · MLBB 5v5
                    </div>
                </div>

                {/* Center: Head-to-Head Clash Layout */}
                <div className="grid grid-cols-11 items-center gap-2 sm:gap-6 py-2">
                    {/* Team A */}
                    <div className="col-span-5 flex flex-col items-center md:items-start text-center md:text-left space-y-2 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center p-3 transition-transform hover:scale-105 overflow-hidden">
                            {divA.logo_path ? (
                                <img src={divA.logo_path} alt={divA.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="font-black text-2xl sm:text-3xl text-slate-800 dark:text-slate-200">
                                    {divA.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 w-full">
                            <h3 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {divA.name}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block">
                                Division Faction
                            </span>
                        </div>
                    </div>

                    {/* VS & Score Centerpiece */}
                    <div className="col-span-1 flex flex-col items-center justify-center py-2 shrink-0">
                        <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-slate-100 dark:bg-white/[0.04] flex items-center justify-center">
                            <Swords className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 dark:text-slate-500" />
                        </div>

                        <div className="mt-2 font-mono font-bold text-base sm:text-xl md:text-2xl text-slate-900 dark:text-white tracking-tight text-center">
                            <span>{match.score_a ?? 0}</span>
                            <span className="text-slate-400 mx-1">:</span>
                            <span>{match.score_b ?? 0}</span>
                        </div>

                        <span className="text-[9px] font-mono uppercase font-semibold text-slate-400 dark:text-slate-500 mt-0.5">
                            {isLive ? 'LIVE' : 'VS'}
                        </span>
                    </div>

                    {/* Team B */}
                    <div className="col-span-5 flex flex-col items-center md:items-end text-center md:text-right space-y-2 min-w-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl sm:rounded-3xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/60 dark:border-white/[0.06] flex items-center justify-center p-3 transition-transform hover:scale-105 overflow-hidden">
                            {divB.logo_path ? (
                                <img src={divB.logo_path} alt={divB.name} className="w-full h-full object-contain" />
                            ) : (
                                <span className="font-black text-2xl sm:text-3xl text-slate-800 dark:text-slate-200">
                                    {divB.name.charAt(0)}
                                </span>
                            )}
                        </div>

                        <div className="min-w-0 w-full">
                            <h3 className="text-sm sm:text-lg md:text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight truncate">
                                {divB.name}
                            </h3>
                            <span className="text-[10px] sm:text-xs font-mono text-slate-400 uppercase tracking-wider block">
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
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
                        >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Watch Arena Live Feed</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}

