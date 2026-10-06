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
    
    // Perceptive luminance formula (ITU-R BT.709 standard)
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    // White text if dark (< 160), dark slate text if light (>= 160)
    return yiq < 160 ? '#FFFFFF' : '#0F172A';
}

export default function MatchScheduleTable({ matches = [], onSelectMatch }) {
    const [statusFilter, setStatusFilter] = useState('all');

    const filtered = matches.filter((m) => {
        if (statusFilter === 'all') return true;
        return m.status === statusFilter;
    });

    return (
        <div id="schedules-section" className="rounded-2xl bg-white dark:bg-[#141722] border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm dark:shadow-xl transition-all">
            {/* Table Header & Status Filter Pills */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-200 dark:border-slate-800">
                <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-rose-500" />
                        <span>Tournament Log & Match Schedule</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Chronological fixtures, verified scores, and referee sign-offs</p>
                </div>

                {/* Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0B0D13] p-1 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                    {['all', 'live', 'scheduled', 'finished'].map((filterKey) => (
                        <button
                            key={filterKey}
                            onClick={() => setStatusFilter(filterKey)}
                            className={`px-3 py-1 rounded-lg font-semibold uppercase text-[11px] transition-all cursor-pointer ${
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

            {/* Responsive Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-mono text-[11px] uppercase">
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
                    <tbody className="divide-y divide-slate-200 dark:divide-[#1B2030]">
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
                                        className="hover:bg-slate-50 dark:hover:bg-[#181D2D] transition-colors cursor-pointer group"
                                    >
                                        {/* Scheduled Date */}
                                        <td className="py-3.5 px-3 font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                <span>{item.scheduled_at || 'TBD'}</span>
                                            </div>
                                        </td>

                                        {/* Round / Match */}
                                        <td className="py-3.5 px-3 whitespace-nowrap font-semibold text-slate-800 dark:text-slate-200">
                                            <span>{item.round_name}</span>
                                            {item.best_of && (
                                                <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-[#151926] text-purple-700 dark:text-purple-300 font-bold border border-purple-200 dark:border-purple-800/60">
                                                    BO{item.best_of}
                                                </span>
                                            )}
                                        </td>

                                        {/* Division A Colored Tag (White font when card is dark, alternately) */}
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

                                        {/* Score Box */}
                                        <td className="py-3.5 px-2 text-center whitespace-nowrap">
                                            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-[#0B0D13] border border-slate-200 dark:border-slate-800 font-mono font-black text-sm text-slate-900 dark:text-slate-100">
                                                <span className={item.score_a > item.score_b ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                                                    {item.score_a}
                                                </span>
                                                <span className="text-slate-400">:</span>
                                                <span className={item.score_b > item.score_a ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}>
                                                    {item.score_b}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Division B Colored Tag (White font when card is dark, alternately) */}
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

                                        {/* Match Status Badge */}
                                        <td className="py-3.5 px-3 text-center whitespace-nowrap">
                                            {isLive ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase font-mono bg-rose-50 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                                    Live
                                                </span>
                                            ) : isFinished ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400">
                                                    Finished
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase font-mono bg-blue-50 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400">
                                                    Scheduled
                                                </span>
                                            )}
                                        </td>

                                        {/* Referee Sign-Off Status */}
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

                                        {/* Broadcast Stream Link */}
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
