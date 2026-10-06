import React, { useState, useEffect } from 'react';
import { 
    Radio, 
    Trophy, 
    Plus, 
    Minus, 
    CheckCircle2, 
    AlertCircle, 
    Crown, 
    RefreshCw, 
    Lock,
    Shield,
    Clock,
    Flame,
    Check,
    Volume2
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function RefereePortal({ onDataChanged }) {
    const { user } = useAuth();
    const [matches, setMatches] = useState([]);
    const [tournament, setTournament] = useState(null);
    const [loading, setLoading] = useState(false);
    const [successBanner, setSuccessBanner] = useState('');
    const [errorBanner, setErrorBanner] = useState('');

    // Finalize Modal State
    const [finalizeModalOpen, setFinalizeModalOpen] = useState(false);
    const [divisions, setDivisions] = useState([]);
    const [rankings, setRankings] = useState({
        '1': '',
        '2': '',
        '3': '',
        '4': '',
    });

    const fetchMatches = async () => {
        try {
            setLoading(true);
            setErrorBanner('');
            const [matchesRes, metaRes] = await Promise.all([
                api.get('/referee/matches'),
                api.get('/public/landing-data'),
            ]);

            if (matchesRes.data.success) {
                setMatches(matchesRes.data.matches || []);
                setTournament(matchesRes.data.tournament);
            }

            if (metaRes.data.success) {
                const divs = metaRes.data.divisions || [];
                setDivisions(divs);

                if (divs.length >= 4 && !rankings['1']) {
                    setRankings({
                        '1': divs[0].id,
                        '2': divs[1].id,
                        '3': divs[2].id,
                        '4': divs[3].id,
                    });
                }
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed loading assigned matches');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMatches();
    }, []);

    // Live score adjustment
    const handleAdjustScore = async (match, team, delta) => {
        setSuccessBanner('');
        setErrorBanner('');

        const currentA = match.score_a ?? 0;
        const currentB = match.score_b ?? 0;

        const newScoreA = team === 'a' ? Math.max(0, currentA + delta) : currentA;
        const newScoreB = team === 'b' ? Math.max(0, currentB + delta) : currentB;

        try {
            const res = await api.patch(`/referee/matches/${match.id}/live-score`, {
                score_a: newScoreA,
                score_b: newScoreB,
            });

            if (res.data.success) {
                setMatches((prev) =>
                    prev.map((m) => (m.id === match.id ? { ...m, score_a: newScoreA, score_b: newScoreB } : m))
                );
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed updating score');
        }
    };

    // Update match status
    const handleStatusChange = async (match, newStatus) => {
        setSuccessBanner('');
        setErrorBanner('');

        try {
            const payload = { status: newStatus };

            if (newStatus === 'finished') {
                if (match.score_a > match.score_b) {
                    payload.winner_id = match.division_a_id;
                } else if (match.score_b > match.score_a) {
                    payload.winner_id = match.division_b_id;
                }
            }

            const res = await api.patch(`/referee/matches/${match.id}/live-score`, payload);
            if (res.data.success) {
                setSuccessBanner(`Match ${match.match_identifier} is now marked as ${newStatus.toUpperCase()}`);
                await fetchMatches();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed updating status');
        }
    };

    // Execute tournament finalization transaction
    const handleFinalizeTournament = async (e) => {
        e.preventDefault();
        setSuccessBanner('');
        setErrorBanner('');

        if (!tournament) return;

        const values = [rankings['1'], rankings['2'], rankings['3'], rankings['4']];
        if (new Set(values).size !== 4 || values.some((v) => !v)) {
            setErrorBanner('All 4 rankings must be assigned to different divisions.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post(`/referee/tournaments/${tournament.id}/finalize`, {
                rankings: {
                    1: rankings['1'],
                    2: rankings['2'],
                    3: rankings['3'],
                    4: rankings['4'],
                },
            });

            if (res.data.success) {
                setSuccessBanner('Tournament successfully finalized! Points (25, 20, 15, 10) have been disbursed.');
                setFinalizeModalOpen(false);
                await fetchMatches();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed finalizing tournament');
        } finally {
            setLoading(false);
        }
    };

    const isCompleted = tournament?.status === 'completed';
    const gfMatch = matches.find((m) => m.match_identifier === 'GF' || m.round_level === 2);
    const gfFinished = gfMatch && gfMatch.status === 'finished';

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Referee Cockpit Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-[#212638]">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-600/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
                        <Radio className="w-6 h-6 animate-pulse" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                            Official Referee Live Scoring Desk
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/40 uppercase">
                                Match Official
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Assigned Sport: <strong className="text-slate-900 dark:text-white">{user?.sport?.name || 'Mobile Legends: Bang Bang'}</strong> · Referee ID #{user?.id}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchMatches}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white hover:bg-slate-50 dark:bg-[#141722] dark:hover:bg-[#1A1F2E] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span>Refresh Matches</span>
                    </button>

                    {/* Finalize Placements Button */}
                    <button
                        onClick={() => setFinalizeModalOpen(true)}
                        disabled={isCompleted || !gfFinished}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all shadow-sm ${
                            isCompleted
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed'
                                : gfFinished
                                ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 hover:from-amber-300 hover:to-yellow-300 shadow-md cursor-pointer active:scale-95'
                                : 'bg-slate-100 dark:bg-[#1A1F2E] text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-800 cursor-not-allowed'
                        }`}
                        title={gfFinished ? 'Disburse 25/20/15/10 points to divisions' : 'Conclude Grand Finals first to finalize standings'}
                    >
                        <Crown className="w-4 h-4" />
                        <span>{isCompleted ? 'Tournament Sealed' : 'Finalize & Award Points'}</span>
                    </button>
                </div>
            </div>

            {/* Notification Banners */}
            {successBanner && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">{successBanner}</span>
                </div>
            )}
            {errorBanner && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="font-bold">{errorBanner}</span>
                </div>
            )}

            {isCompleted && (
                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-200 text-xs flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span className="font-medium">
                            This tournament has been officially finalized. Placements and points (25, 20, 15, 10) are permanently sealed in the division ledger.
                        </span>
                    </div>
                </div>
            )}

            {/* Assigned Match Cards */}
            <div className="space-y-6">
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 dark:text-slate-400 px-1">
                    <span>Assigned Fixtures for {user?.sport?.name || 'MLBB 5v5'}</span>
                    <span>Game Wins Counter & Sign-off</span>
                </div>

                {matches.length === 0 ? (
                    <div className="p-12 rounded-3xl bg-white dark:bg-[#141722] border border-slate-200 dark:border-[#212638] text-center text-slate-400 dark:text-slate-500 shadow-sm">
                        No matches currently assigned to your referee roster.
                    </div>
                ) : (
                    matches.map((m) => {
                        const isLive = m.status === 'live';
                        const isFinished = m.status === 'finished';
                        const colorA = m.division_a?.color_hex || '#B784A7';
                        const colorB = m.division_b?.color_hex || '#00E5FF';

                        return (
                            <div
                                key={m.id}
                                className={`rounded-3xl bg-white dark:bg-[#141722] border p-6 shadow-sm dark:shadow-2xl space-y-5 transition-all text-slate-900 dark:text-slate-100 ${
                                    isLive
                                        ? 'border-rose-400 dark:border-rose-500/70 shadow-md'
                                        : 'border-slate-200 dark:border-[#212638]'
                                }`}
                            >
                                {/* Match Card Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-[#212638]">
                                    <div className="flex items-center gap-3">
                                        <span className="px-3 py-1 rounded-xl bg-amber-100 dark:bg-[#0D0F15] text-amber-700 dark:text-amber-400 font-mono text-xs font-black border border-amber-200 dark:border-amber-500/30 shadow-sm">
                                            {m.match_identifier}
                                        </span>
                                        <div>
                                            <h4 className="text-base font-black text-slate-900 dark:text-white">
                                                {m.round_level === 2 ? 'Grand Finals Championship' : 'Semifinal Elimination Round'}
                                            </h4>
                                            <p className="text-[11px] text-slate-500 font-mono">
                                                Fixture #{m.id} · Advancing Path: {m.next_match_id ? `Match #${m.next_match_id}` : 'Crown Trophy'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Match Status Toggler (Scheduled -> Live -> Finished) */}
                                    <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#090B10] p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
                                        <button
                                            type="button"
                                            disabled={isCompleted}
                                            onClick={() => handleStatusChange(m, 'scheduled')}
                                            className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all cursor-pointer ${
                                                m.status === 'scheduled'
                                                    ? 'bg-blue-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            Scheduled
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isCompleted}
                                            onClick={() => handleStatusChange(m, 'live')}
                                            className={`px-3.5 py-1.5 rounded-xl font-black uppercase text-[10px] transition-all flex items-center gap-1.5 cursor-pointer ${
                                                isLive
                                                    ? 'bg-rose-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            <Radio className="w-3 h-3" />
                                            <span>● Live</span>
                                        </button>
                                        <button
                                            type="button"
                                            disabled={isCompleted}
                                            onClick={() => handleStatusChange(m, 'finished')}
                                            className={`px-3 py-1.5 rounded-xl font-bold uppercase text-[10px] transition-all flex items-center gap-1 cursor-pointer ${
                                                isFinished
                                                    ? 'bg-emerald-600 text-white shadow-sm'
                                                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                                            }`}
                                        >
                                            <Check className="w-3 h-3" />
                                            <span>Finished</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Tactile Game Win Counters */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    {/* Division A Scoring Pod */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200 dark:border-[#1E2435] flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shrink-0 shadow-sm"
                                                style={{ backgroundColor: colorA }}
                                            >
                                                {m.division_a?.name ? m.division_a.name.charAt(0) : '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                                                    {m.division_a?.name || 'Winner SF1 (TBD)'}
                                                </p>
                                                <span className="text-[10px] text-slate-500 font-mono block">
                                                    Faction Seed A
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tactile Counter */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                disabled={isCompleted || !m.division_a_id}
                                                onClick={() => handleAdjustScore(m, 'a', -1)}
                                                className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
                                                title="Decrement Game Win"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="font-mono font-black text-3xl text-slate-900 dark:text-white w-10 text-center">
                                                {m.score_a}
                                            </span>

                                            <button
                                                type="button"
                                                disabled={isCompleted || !m.division_a_id}
                                                onClick={() => handleAdjustScore(m, 'a', 1)}
                                                className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
                                                title="Increment Game Win"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Division B Scoring Pod */}
                                    <div className="p-5 rounded-2xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200 dark:border-[#1E2435] flex items-center justify-between shadow-sm">
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div
                                                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm text-slate-950 shrink-0 shadow-sm"
                                                style={{ backgroundColor: colorB }}
                                            >
                                                {m.division_b?.name ? m.division_b.name.charAt(0) : '?'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-sm text-slate-900 dark:text-white truncate">
                                                    {m.division_b?.name || 'Winner SF2 (TBD)'}
                                                </p>
                                                <span className="text-[10px] text-slate-500 font-mono block">
                                                    Faction Seed B
                                                </span>
                                            </div>
                                        </div>

                                        {/* Tactile Counter */}
                                        <div className="flex items-center gap-3">
                                            <button
                                                type="button"
                                                disabled={isCompleted || !m.division_b_id}
                                                onClick={() => handleAdjustScore(m, 'b', -1)}
                                                className="w-10 h-10 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 disabled:opacity-30 text-slate-700 dark:text-slate-200 font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
                                                title="Decrement Game Win"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>

                                            <span className="font-mono font-black text-3xl text-slate-900 dark:text-white w-10 text-center">
                                                {m.score_b}
                                            </span>

                                            <button
                                                type="button"
                                                disabled={isCompleted || !m.division_b_id}
                                                onClick={() => handleAdjustScore(m, 'b', 1)}
                                                className="w-10 h-10 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-30 text-white font-bold flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-sm"
                                                title="Increment Game Win"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {isFinished && m.winner && (
                                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                            <span className="font-bold">
                                                Official Sign-off: {m.winner.name} Division won and advanced!
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            {/* Tournament Finalization Modal */}
            {finalizeModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative w-full max-w-lg bg-white dark:bg-[#141722] border border-slate-200 dark:border-amber-500/40 rounded-3xl shadow-xl dark:shadow-2xl p-6 sm:p-8 text-slate-900 dark:text-slate-100">
                        <div className="flex items-center gap-3.5 mb-6">
                            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                                <Crown className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                                    Official Final Standings & Points Ledger
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                    Disburse points to all 4 divisions: 25p · 20p · 15p · 10p
                                </p>
                            </div>
                        </div>

                        <form onSubmit={handleFinalizeTournament} className="space-y-4">
                            {/* 1st Place */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D0F15] border border-amber-300 dark:border-amber-500/50 shadow-sm">
                                <label className="flex items-center justify-between text-xs font-black text-amber-700 dark:text-amber-300 uppercase mb-1.5">
                                    <span className="flex items-center gap-1.5">
                                        <Crown className="w-4 h-4 text-amber-500 dark:text-amber-400" /> 1st Place Champion
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">+25 PTS</span>
                                </label>
                                <select
                                    value={rankings['1']}
                                    onChange={(e) => setRankings({ ...rankings, '1': e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#141722] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                                >
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} Division ({d.color_hex})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 2nd Place */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200 dark:border-slate-700 shadow-sm">
                                <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                                    <span>2nd Place Runner-Up</span>
                                    <span className="text-cyan-600 dark:text-cyan-400 font-mono font-black">+20 PTS</span>
                                </label>
                                <select
                                    value={rankings['2']}
                                    onChange={(e) => setRankings({ ...rankings, '2': e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#141722] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                                >
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} Division ({d.color_hex})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 3rd Place */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200 dark:border-slate-700 shadow-sm">
                                <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                                    <span>3rd Place Contender</span>
                                    <span className="text-amber-600 dark:text-amber-500 font-mono font-black">+15 PTS</span>
                                </label>
                                <select
                                    value={rankings['3']}
                                    onChange={(e) => setRankings({ ...rankings, '3': e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#141722] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                                >
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} Division ({d.color_hex})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* 4th Place */}
                            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#0D0F15] border border-slate-200 dark:border-slate-700 shadow-sm">
                                <label className="flex items-center justify-between text-xs font-black text-slate-700 dark:text-slate-300 uppercase mb-1.5">
                                    <span>4th Place Challenger</span>
                                    <span className="text-slate-500 dark:text-slate-400 font-mono font-black">+10 PTS</span>
                                </label>
                                <select
                                    value={rankings['4']}
                                    onChange={(e) => setRankings({ ...rankings, '4': e.target.value })}
                                    className="w-full p-2.5 bg-white dark:bg-[#141722] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-slate-700 font-bold"
                                >
                                    {divisions.map((d) => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} Division ({d.color_hex})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#212638]">
                                <button
                                    type="button"
                                    onClick={() => setFinalizeModalOpen(false)}
                                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-[#0D0F15] border border-slate-200 dark:border-slate-800 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-5 py-2.5 rounded-xl text-xs font-black text-slate-950 bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
                                >
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Execute Placement Points Transaction</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
