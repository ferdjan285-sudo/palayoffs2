import React, { useState } from 'react';
import { Calendar, Radio, CheckCircle2, Clock, ExternalLink, Play } from 'lucide-react';

// Calculate perceptive luminance to alternate between white and dark text
function getContrastTextColor(hexColor) {
    if (!hexColor) return '#FFFFFF';
    const cleanHex = hexColor.replace('#', '');
    if (cleanHex.length !== 6 && cleanHex.length !== 3) return '#FFFFFF';
    
    let r, g, b;
    if (cleanHex.length === 3) {
        r = parseInt(cleanHex[0] + cleanHex[0], 16);
        g = parseInt(cleanHex[1] + cleanHex[1], 16);
        b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
        r = parseInt(cleanHex.substring(0, 2), 16);
        g = parseInt(cleanHex.substring(2, 4), 16);
        b = parseInt(cleanHex.substring(4, 6), 16);
    }
    
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq < 160 ? '#FFFFFF' : '#0F172A';
}

export default function MatchScheduleTable({ matches = [], onSelectMatch }) {
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = matches.filter((m) => {
        if (statusFilter === 'all') return true;
        return m.status === statusFilter;
    });

    return (
        <div id="schedules-section" className="rounded-3xl bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.04] p-4 sm:p-6 shadow-sm dark:shadow-xl transition-all">
            {/* Header & Status Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-200 dark:border-white/[0.04]">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span>Tournament Log & Match Schedule</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Chronological fixtures, verified scores, and referee sign-offs</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-white/[0.03] p-1 rounded-xl border border-slate-200 dark:border-white/[0.04] text-xs overflow-x-auto">
                    {['all', 'live', 'scheduled', 'finished'].map((filterKey) => (
                        <button
                            key={filterKey}
                            onClick={() => setStatusFilter(filterKey)}
                            className={`px-2.5 sm:px-3 py-1 rounded-lg font-semibold uppercase text-[10px] sm:text-[11px] transition-all cursor-pointer whitespace-nowrap ${
                                statusFilter === filterKey
                                    ? 'bg-rose-500 text-white shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                        >
                            {filterKey === 'finished' ? 'Completed' : filterKey}
                        </button>
                    ))}
                </div>
            </div>

            {/* 1. MOBILE CARD VIEW (< md screens) */}
            <div className="md:hidden space-y-3">
                {filtered.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400">
                        No matches found for this filter.
                    </div>
                ) : (
                    filtered.map((item) => {
                        const isLive = item.status === 'live';
                        const isFinished = item.status === 'finished';
                        const colorA = item.division_a?.color_hex || '#475569';
                        const colorB = item.division_b?.color_hex || '#475569';
                        const textColorA = getContrastTextColor(colorA);
                        const textColorB = getContrastTextColor(colorB);

                        return (
                            <div
                                key={item.id}
                                onClick={() => onSelectMatch && onSelectMatch(item)}
                                className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.03] space-y-3 shadow-xs active:scale-[0.99] transition-transform cursor-pointer"
                            >
                                {/* Top Bar: Identifier, Round & Status */}
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <div className="flex items-center gap-2">
                                        <span className="font-mono font-black text-rose-600 dark:text-rose-400">
                                            {item.match_identifier || item.identifier}
                                        </span>
                                        <span className="text-slate-700 dark:text-slate-300 font-bold truncate max-w-[140px]">
                                            {item.round_name}
                                        </span>
                                        {item.best_of && (
                                            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-bold">
                                                BO{item.best_of}
                                            </span>
                                        )}
                                    </div>

                                    {/* Status Badge */}
                                    {isLive ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase font-mono bg-rose-500 text-white animate-pulse">
                                            Live
                                        </span>
                                    ) : isFinished ? (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono bg-slate-200 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300">
                                            Finished
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase font-mono bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                                            Scheduled
                                        </span>
                                    )}
                                </div>

                                {/* Teams Head-to-Head Card */}
                                <div className="p-2.5 rounded-xl bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-transparent flex items-center justify-between gap-2">
                                    {/* Team A */}
                                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold truncate"
                                            style={{ backgroundColor: colorA, color: textColorA }}
                                        >
                                            {item.division_a?.logo_path && (
                                                <img src={item.division_a.logo_path} alt="" className="w-3.5 h-3.5 object-contain" />
                                            )}
                                            <span className="truncate">{item.division_a?.name || 'TBD (Seed A)'}</span>
                                        </span>
                                    </div>

                                    {/* Score */}
                                    <div className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white shrink-0">
                                        <span>{item.score_a}</span> : <span>{item.score_b}</span>
                                    </div>

                                    {/* Team B */}
                                    <div className="flex items-center justify-end gap-1.5 min-w-0 flex-1">
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold truncate"
                                            style={{ backgroundColor: colorB, color: textColorB }}
                                        >
                                            <span className="truncate">{item.division_b?.name || 'TBD (Seed B)'}</span>
                                            {item.division_b?.logo_path && (
                                                <img src={item.division_b.logo_path} alt="" className="w-3.5 h-3.5 object-contain" />
                                            )}
                                        </span>
                                    </div>
                                </div>

                                {/* Footer: Time + Stream */}
                                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3 h-3 text-slate-400" />
                                        <span>{item.scheduled_at || 'TBD'}</span>
                                    </div>

                                    {item.referee_signed_off && (
                                        <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5 text-[10px]">
                                            <CheckCircle2 className="w-3 h-3" /> Signed
                                        </span>
                                    )}

                                    {item.stream_url && (
                                        <a
                                            href={item.stream_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            onClick={(e) => e.stopPropagation()}
                                            className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1"
                                        >
                                            <Play className="w-2.5 h-2.5 fill-current" /> Stream
                                        </a>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* 2. DESKTOP TABLE VIEW (md:block) */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-white/[0.04] text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
                            <th className="py-3 px-3">Date & Time</th>
                            <th className="py-3 px-3">Round / Match</th>
                            <th className="py-3 px-3 text-right">Faction A</th>
                            <th className="py-3 px-2 text-center">Score</th>
                            <th className="py-3 px-3 text-left">Faction B</th>
                            <th className="py-3 px-3 text-center">Status</th>
                            <th className="py-3 px-3 text-center">Sign-Off</th>
                            <th className="py-3 px-3 text-right">Broadcast</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-white/[0.03]">
                        {filtered.length === 0 ? (
                            <tr>
                                <td colSpan="8" className="py-8 text-center text-slate-500">
                                    No matches found matching the selected filter.
                                </td>
                            </tr>
                        ) : (
                            filtered.map((item) => {
                                const isLive = item.status === 'live';
                                const isFinished = item.status === 'finished';
                                const colorA = item.division_a?.color_hex || '#475569';
                                const colorB = item.division_b?.color_hex || '#475569';
                                const textColorA = getContrastTextColor(colorA);
                                const textColorB = getContrastTextColor(colorB);

                                return (
                                    <tr
                                        key={item.id}
                                        onClick={() => onSelectMatch && onSelectMatch(item)}
                                        className="hover:bg-slate-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer group"
                                    >
                                        <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{item.scheduled_at || 'TBD'}</span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                                            <span>{item.round_name}</span>
                                            {item.best_of && (
                                                <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/[0.04] text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/30">
                                                    BO{item.best_of}
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors"
                                                style={{ backgroundColor: colorA, color: textColorA }}
                                            >
                                                {item.division_a?.logo_path && (
                                                    <img 
                                                        src={item.division_a.logo_path} 
                                                        alt="" 
                                                        className="w-3.5 h-3.5 object-contain" 
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                                {item.division_a?.name || 'TBD (Seed A)'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-2 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.04] font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                                                <span className={item.score_a > item.score_b ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                                                    {item.score_a}
                                                </span>
                                                <span className="text-slate-400">:</span>
                                                <span className={item.score_b > item.score_a ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                                                    {item.score_b}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="py-3.5 px-3 text-left whitespace-nowrap">
                                            <span
                                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold shadow-sm transition-colors"
                                                style={{ backgroundColor: colorB, color: textColorB }}
                                            >
                                                {item.division_b?.logo_path && (
                                                    <img 
                                                        src={item.division_b.logo_path} 
                                                        alt="" 
                                                        className="w-3.5 h-3.5 object-contain" 
                                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                                    />
                                                )}
                                                {item.division_b?.name || 'TBD (Seed B)'}
                                            </span>
                                        </td>

                                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                            {isLive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Live
                                                </span>
                                            ) : isFinished ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-slate-100 text-slate-700 dark:bg-white/[0.06] dark:text-slate-300">
                                                    Finished
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                                    Scheduled
                                                </span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                            {item.referee_signed_off ? (
                                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                                    Verified
                                                </span>
                                            ) : (
                                                <span className="text-[11px] text-slate-400 font-mono">Pending</span>
                                            )}
                                        </td>

                                        <td className="py-3.5 px-3 text-right whitespace-nowrap">
                                            {item.stream_url ? (
                                                <a
                                                    href={item.stream_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="inline-flex items-center gap-1 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                                                >
                                                    <Play className="w-3 h-3 fill-current" />
                                                    <span className="text-[11px] font-semibold">Stream</span>
                                                </a>
                                            ) : (
                                                <span className="text-slate-400 font-mono text-[10px]">N/A</span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
