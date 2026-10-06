import React from 'react';
import { Radio, ExternalLink, Flame, Trophy, Play, Swords } from 'lucide-react';

export default function FeaturedMatchHero({ match }) {
    if (!match) {
        return (
            <div className="rounded-2xl bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800 p-6 text-center text-slate-500 shadow-sm">
                No active featured match scheduled.
            </div>
        );
    }

    const divA = match.division_a || { name: 'Seed 1', color_hex: '#B784A7' };
    const divB = match.division_b || { name: 'Seed 2', color_hex: '#00E5FF' };

    const colorA = divA.color_hex || '#B784A7';
    const colorB = divB.color_hex || '#00E5FF';

    const isLive = match.status === 'live';
    const roundTitle = match.round_level === 2 ? 'Grand Finals — Best of 5' : 'Semifinal Clash — Best of 3';
    const streamUrl = match.stream_url || 'https://www.youtube.com';

    return (
        <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-2xl p-6 md:p-8 transition-all bg-white dark:bg-[#121520]">
            {/* Dynamic Hex Color Gradient Backdrop */}
            <div
                className="absolute inset-0 opacity-20 dark:opacity-40 transition-all duration-700 pointer-events-none"
                style={{
                    background: `linear-gradient(135deg, ${colorA} 0%, rgba(20, 23, 34, 0.4) 50%, ${colorB} 100%)`,
                }}
            />

            {/* Glass overlay pattern */}
            <div className="absolute inset-0 bg-gradient-to-t from-white/90 via-white/60 to-transparent dark:from-[#0D0F15] dark:via-[#141722]/80 dark:to-transparent pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                {/* Left: Match Headliner & Competing Teams */}
                <div className="flex-1 space-y-4 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/60 text-xs backdrop-blur-md">
                        {isLive ? (
                            <>
                                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                                <span className="font-extrabold text-rose-600 dark:text-rose-400 tracking-wider uppercase flex items-center gap-1">
                                    <Radio className="w-3.5 h-3.5" />
                                    Live Stream Active
                                </span>
                            </>
                        ) : (
                            <span className="font-semibold text-slate-700 dark:text-slate-300">
                                Upcoming Spotlight Match
                            </span>
                        )}
                        <span className="text-slate-400">·</span>
                        <span className="text-amber-600 dark:text-amber-400 font-mono text-[11px] font-bold">{match.match_identifier || 'GF'}</span>
                    </div>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 sm:gap-3 text-lg sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                {divA.logo_path && <img src={divA.logo_path} alt={divA.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain filter drop-shadow-sm" />}
                                <span>{divA.name}</span>
                            </div>
                            <span className="text-rose-500 font-sans text-base sm:text-xl font-bold">VS</span>
                            <div className="flex items-center gap-1.5 sm:gap-2">
                                <span>{divB.name}</span>
                                {divB.logo_path && <img src={divB.logo_path} alt={divB.name} className="w-6 h-6 sm:w-8 sm:h-8 object-contain filter drop-shadow-sm" />}
                            </div>
                        </div>
                        <p className="text-xs md:text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                            {roundTitle}
                        </p>
                    </div>

                    {/* Score / Status Display */}
                    <div className="flex items-center justify-center md:justify-start gap-4">
                        <div className="flex items-center gap-2">
                            <span
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: colorA }}
                            />
                            <span className="text-xl md:text-2xl font-black font-mono text-slate-900 dark:text-white">
                                {match.score_a ?? 0}
                            </span>
                        </div>
                        <span className="text-slate-400 font-mono font-bold">:</span>
                        <div className="flex items-center gap-2">
                            <span className="text-xl md:text-2xl font-black font-mono text-slate-900 dark:text-white">
                                {match.score_b ?? 0}
                            </span>
                            <span
                                className="w-4 h-4 rounded-full shadow-sm"
                                style={{ backgroundColor: colorB }}
                            />
                        </div>

                        {match.scheduled_at && (
                            <div className="ml-4 pl-4 border-l border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 font-mono">
                                <div>Scheduled</div>
                                <div className="text-slate-900 dark:text-white font-semibold">
                                    {new Date(match.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Watch Live Stream Call-to-Action */}
                    <div className="pt-2">
                        <a
                            href={streamUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-sm hover:shadow transition-all active:scale-95"
                        >
                            <Play className="w-4 h-4 fill-white" />
                            <span>Watch Arena Live Feed</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                    </div>
                </div>

                {/* Right: Modern Head-to-Head Emblem */}
                <div className="flex items-center justify-center p-4">
                    <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-3xl bg-slate-100 dark:bg-[#181E2E] border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-lg">
                        <Swords className="w-12 h-12 md:w-16 md:h-16 text-rose-500 animate-pulse" />
                        <span className="absolute -bottom-2 px-3 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold uppercase tracking-widest shadow-sm">
                            HEAD-TO-HEAD
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
