import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
    ShieldCheck, 
    Sparkles, 
    Calendar, 
    Radio, 
    Save, 
    Layers, 
    CheckCircle2, 
    AlertCircle, 
    RefreshCw, 
    Play, 
    Settings,
    Edit3,
    Trophy,
    Award,
    ArrowLeftRight,
    Shuffle,
    Tv,
    Clock,
    Lock,
    ExternalLink,
    Upload,
    Image,
    Plus,
    Minus,
    RotateCcw,
    Crown,
    QrCode,
    Copy,
    Check,
    Video,
    Link2,
    Swords,
    Flame,
    Filter,
    Zap,
    Unlock,
    ChevronDown,
    ChevronUp,
    X,
    AlertTriangle
} from 'lucide-react';
import api from '../services/api';

export default function AdminDashboard({ onDataChanged, activeTab = 'bracket', setActiveTab, onLaunchArena }) {
    const [title, setTitle] = useState('PalayOffs MLBB Pro Championship');
    const [sportId, setSportId] = useState('');
    const [sports, setSports] = useState([]);
    const [divisions, setDivisions] = useState([]);
    const [tournaments, setTournaments] = useState([]);
    const [selectedTournamentId, setSelectedTournamentId] = useState('');

    // Matchmaking seeds
    const [seedA, setSeedA] = useState('');
    const [seedB, setSeedB] = useState('');
    const [seedC, setSeedC] = useState('');
    const [seedD, setSeedD] = useState('');
    const [sf1Time, setSf1Time] = useState('');
    const [sf2Time, setSf2Time] = useState('');
    const [streamUrl, setStreamUrl] = useState('https://www.youtube.com/watch?v=palayoffs-live');

    // Status & Feedback
    const [loading, setLoading] = useState(false);
    const [successBanner, setSuccessBanner] = useState('');
    const [errorBanner, setErrorBanner] = useState('');

    // Match schedule editor state
    const [matches, setMatches] = useState([]);
    const [editingMatch, setEditingMatch] = useState({});
    const [matchStageFilter, setMatchStageFilter] = useState('all');
    const [matchLosingScores, setMatchLosingScores] = useState({});
    const [openAdvancedMatch, setOpenAdvancedMatch] = useState({});

    // Division editor state
    const [editingDivision, setEditingDivision] = useState({});

    // Dynamic Zoom Live Broadcast Studio State
    const [zoomUrl, setZoomUrl] = useState('https://zoom.us/j/84920491823?pwd=palayoffs');
    const [zoomMeetingId, setZoomMeetingId] = useState('849 2049 1823');
    const [zoomPasscode, setZoomPasscode] = useState('PALAYOFFS');
    const [adminQrPreview, setAdminQrPreview] = useState('');
    const [zoomCopied, setZoomCopied] = useState(false);
    // Custom Confirmation Modal state
    const [confirmModal, setConfirmModal] = useState(null);

    const fetchAdminData = async () => {
        try {
            setLoading(true);
            const [metaRes, tourneysRes] = await Promise.all([
                api.get('/admin/meta'),
                api.get('/admin/tournaments'),
            ]);

            if (metaRes.data.success) {
                setSports(metaRes.data.sports || []);
                const divs = metaRes.data.divisions || [];
                setDivisions(divs);

                const mlbb = metaRes.data.sports.find((s) => s.slug === 'mlbb');
                if (mlbb && !sportId) setSportId(mlbb.id);

                if (divs.length >= 4 && !seedA) {
                    setSeedA(divs[0].id);
                    setSeedB(divs[1].id);
                    setSeedC(divs[2].id);
                    setSeedD(divs[3].id);
                }
            }

            if (tourneysRes.data.success) {
                const tourneys = tourneysRes.data.tournaments || [];
                setTournaments(tourneys);
                if (tourneys.length > 0) {
                    const current = selectedTournamentId 
                        ? tourneys.find((t) => t.id === parseInt(selectedTournamentId, 10)) || tourneys[0]
                        : tourneys[0];
                    setSelectedTournamentId(current.id);
                    setMatches(current.matches || []);
                    if (current.stream_url) setZoomUrl(current.stream_url);
                    if (current.zoom_meeting_id) setZoomMeetingId(current.zoom_meeting_id);
                    if (current.zoom_passcode) setZoomPasscode(current.zoom_passcode);
                }
            }
        } catch (err) {
            try {
                const publicRes = await api.get('/public/landing-data');
                if (publicRes.data.success) {
                    const divs = publicRes.data.divisions || [];
                    const tourney = publicRes.data.tournament;
                    const matchesList = publicRes.data.bracket_tree?.all_matches || [];
                    setDivisions(divs);
                    if (tourney) {
                        setTournaments([tourney]);
                        setSelectedTournamentId(tourney.id);
                        setMatches(matchesList);
                        if (tourney.stream_url) setZoomUrl(tourney.stream_url);
                        if (tourney.zoom_meeting_id) setZoomMeetingId(tourney.zoom_meeting_id);
                        if (tourney.zoom_passcode) setZoomPasscode(tourney.zoom_passcode);
                    }
                }
            } catch {
                setErrorBanner(err.response?.data?.message || 'Failed loading admin data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAdminData();
    }, []);

    // Generate Scannable QR Code whenever zoomUrl changes
    useEffect(() => {
        if (zoomUrl) {
            QRCode.toDataURL(zoomUrl, {
                width: 320,
                margin: 2,
                color: {
                    dark: '#0F172A',
                    light: '#FFFFFF'
                }
            })
            .then(url => setAdminQrPreview(url))
            .catch(err => console.error('Failed generating admin QR code:', err));
        }
    }, [zoomUrl]);

    // Save Zoom stream settings to backend database
    const handleSaveZoomStream = async (e) => {
        if (e) e.preventDefault();
        try {
            setSavingZoom(true);
            setErrorBanner('');
            const res = await api.post('/admin/zoom-stream', {
                tournament_id: selectedTournamentId || tournaments[0]?.id,
                zoom_url: zoomUrl,
                zoom_meeting_id: zoomMeetingId,
                zoom_passcode: zoomPasscode,
            });

            if (res.data.success) {
                setSuccessBanner('Zoom live broadcast stream updated and synchronized across all Arena displays & mobile QR codes!');
                setTimeout(() => setSuccessBanner(''), 5000);
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed saving Zoom stream configuration.');
        } finally {
            setSavingZoom(false);
        }
    };

    // Swap SF1 seeds
    const swapSf1 = () => {
        const temp = seedA;
        setSeedA(seedB);
        setSeedB(temp);
    };

    // Swap SF2 seeds
    const swapSf2 = () => {
        const temp = seedC;
        setSeedC(seedD);
        setSeedD(temp);
    };

    // Randomize seeds
    const shuffleSeeds = () => {
        if (divisions.length < 4) return;
        const shuffled = [...divisions].sort(() => 0.5 - Math.random());
        setSeedA(shuffled[0].id);
        setSeedB(shuffled[1].id);
        setSeedC(shuffled[2].id);
        setSeedD(shuffled[3].id);
    };

    // Generate bracket submission
    const handleGenerateBracket = async (e) => {
        e.preventDefault();
        setSuccessBanner('');
        setErrorBanner('');

        const seeds = [seedA, seedB, seedC, seedD];
        if (new Set(seeds).size !== 4) {
            setErrorBanner('All 4 seeds must be assigned to different divisions.');
            return;
        }

        try {
            setLoading(true);
            const res = await api.post('/admin/tournaments/generate-bracket', {
                title,
                sport_id: sportId,
                seed_a_id: seedA,
                seed_b_id: seedB,
                seed_c_id: seedC,
                seed_d_id: seedD,
                base_scheduled_at: sf1Time || null,
                stream_url: streamUrl,
            });

            if (res.data.success) {
                setSuccessBanner('Tournament bracket generated & matchups locked successfully!');
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed generating bracket.');
        } finally {
            setLoading(false);
        }
    };

    // Save match fixture modifications
    const handleSaveMatch = async (matchId) => {
        const edits = editingMatch[matchId] || {};
        try {
            setLoading(true);
            const res = await api.patch(`/admin/matches/${matchId}/schedule`, edits);
            if (res.data.success) {
                setSuccessBanner(`Match #${matchId} parameters saved & synchronized!`);
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed updating match record');
        } finally {
            setLoading(false);
        }
    };

    // Quick Update Best-of series format
    const handleUpdateBestOf = async (matchId, num) => {
        try {
            setLoading(true);
            const res = await api.patch(`/admin/matches/${matchId}/schedule`, {
                best_of: num
            });
            if (res.data.success) {
                setSuccessBanner(`Match format updated to Best of ${num} (BO${num})`);
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed updating Best-of series format');
        } finally {
            setLoading(false);
        }
    };

    // Save division properties directly (including logo_path)
    const handleSaveDivision = async (divId) => {
        const edits = editingDivision[divId] || {};
        try {
            setLoading(true);
            const res = await api.patch(`/admin/divisions/${divId}`, edits);
            if (res.data.success) {
                setSuccessBanner(`Division #${divId} updated successfully!`);
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed updating division');
        } finally {
            setLoading(false);
        }
    };

    // 1-Click Winner Decision & Instant Auto-Advancement
    const handleAdvanceWinner = async (matchId, winnerId, scoreA, scoreB, bestOf) => {
        try {
            setLoading(true);
            setErrorBanner('');
            const payload = {
                winner_id: winnerId,
                score_a: scoreA,
                score_b: scoreB,
            };
            if (bestOf) payload.best_of = bestOf;
            const res = await api.post(`/admin/matches/${matchId}/advance-winner`, payload);
            if (res.data.success) {
                setSuccessBanner('Winner declared! The tournament bracket nodes have automatically advanced.');
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed declaring match winner');
        } finally {
            setLoading(false);
        }
    };

    // Per-game logging: record each game result. Once a side reaches the wins
    // required by the Best-of format, the series winner is declared automatically.
    const handleLogGame = async (match, side, delta, divA, divB, bestOf, curA, curB) => {
        const winsNeeded = Math.ceil(bestOf / 2);
        let newA = curA;
        let newB = curB;
        if (side === 'a') newA = Math.max(0, curA + delta);
        if (side === 'b') newB = Math.max(0, curB + delta);
        if (newA > winsNeeded || newB > winsNeeded) return;

        // Clear any local score edits so the persisted value is shown
        if (editingMatch[match.id]) {
            const { score_a, score_b, ...rest } = editingMatch[match.id];
            setEditingMatch({ ...editingMatch, [match.id]: rest });
        }

        if (newA >= winsNeeded && divA) {
            await handleAdvanceWinner(match.id, divA.id, newA, newB, bestOf);
            return;
        }
        if (newB >= winsNeeded && divB) {
            await handleAdvanceWinner(match.id, divB.id, newA, newB, bestOf);
            return;
        }

        try {
            setLoading(true);
            setErrorBanner('');
            const res = await api.patch(`/admin/matches/${match.id}/schedule`, {
                score_a: newA,
                score_b: newB,
                status: newA + newB > 0 ? 'live' : 'scheduled',
            });
            if (res.data.success) {
                const gameNo = newA + newB;
                setSuccessBanner(
                    delta > 0
                        ? `Game ${gameNo} logged for ${side === 'a' ? divA?.name : divB?.name}. Series: ${newA} - ${newB}`
                        : `Last game undone. Series: ${newA} - ${newB}`
                );
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed logging game result');
        } finally {
            setLoading(false);
        }
    };

    // Reset single match fixture
    const handleResetMatch = async (matchId) => {
        try {
            setLoading(true);
            setErrorBanner('');
            const res = await api.post(`/admin/matches/${matchId}/reset`);
            if (res.data.success) {
                setSuccessBanner(`Match #${matchId} reset to scheduled state.`);
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed resetting match');
        } finally {
            setLoading(false);
        }
    };

    // Finalize tournament standings and disburse points
    const handleFinalizeTournament = (tId) => {
        setConfirmModal({
            title: 'Finalize Tournament Standings?',
            description: 'Are you sure you want to finalize this tournament? This will officially calculate and disburse the season points to all division leaderboards (1st: 25 PTS, 2nd: 20 PTS, 3rd: 15 PTS, 4th: 10 PTS) and mark the tournament as completed.',
            confirmLabel: 'Yes, Finalize Standings',
            confirmColor: 'bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950',
            icon: 'crown',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    setErrorBanner('');
                    const res = await api.post(`/admin/tournaments/${tId}/finalize`);
                    if (res.data.success) {
                        setSuccessBanner('Tournament finalized and points successfully disbursed to divisions!');
                        await fetchAdminData();
                        if (onDataChanged) onDataChanged();
                    }
                } catch (err) {
                    setErrorBanner(err.response?.data?.message || 'Failed finalizing tournament');
                } finally {
                    setLoading(false);
                    setConfirmModal(null);
                }
            },
        });
    };

    // Reset tournament bracket to pristine double-elimination state
    const handleResetTournament = (tId) => {
        setConfirmModal({
            title: 'Reset Tournament Bracket?',
            description: 'This will reset the tournament bracket back to the initial Double Elimination state (M1: Mauve vs Mint, M2: Peach vs Cyan) and clear match scores.',
            confirmLabel: 'Yes, Reset Bracket',
            confirmColor: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white',
            icon: 'reset',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    setErrorBanner('');
                    const res = await api.post(`/admin/tournaments/${tId}/reset`);
                    if (res.data.success) {
                        setSuccessBanner('Tournament bracket reset to initial double-elimination state.');
                        await fetchAdminData();
                        if (onDataChanged) onDataChanged();
                    }
                } catch (err) {
                    setErrorBanner(err.response?.data?.message || 'Failed resetting tournament');
                } finally {
                    setLoading(false);
                    setConfirmModal(null);
                }
            },
        });
    };

    // Reset all division points to 0 for operational readiness
    const handleResetAllPoints = () => {
        setConfirmModal({
            title: 'Reset All Leaderboard Points to 0?',
            description: 'This will reset all division season standings back to 0 PTS for a clean tournament start. This action cannot be undone.',
            confirmLabel: 'Yes, Reset All Points',
            confirmColor: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white',
            icon: 'reset',
            onConfirm: async () => {
                try {
                    setLoading(true);
                    setErrorBanner('');
                    const res = await api.post('/admin/divisions/reset-points');
                    if (res.data.success) {
                        setSuccessBanner('All division leaderboard scores reset to 0 PTS! System is operationally ready.');
                        await fetchAdminData();
                        if (onDataChanged) onDataChanged();
                    }
                } catch (err) {
                    setErrorBanner(err.response?.data?.message || 'Failed resetting points');
                } finally {
                    setLoading(false);
                    setConfirmModal(null);
                }
            },
        });
    };

    // Upload division logo
    const handleUploadLogo = async (divId, file) => {
        if (!file) return;
        const formData = new FormData();
        formData.append('image', file);
        try {
            setLoading(true);
            setErrorBanner('');
            const res = await api.post(`/admin/divisions/${divId}/upload-logo`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res.data.success) {
                setSuccessBanner(`Division logo uploaded successfully!`);
                await fetchAdminData();
                if (onDataChanged) onDataChanged();
            }
        } catch (err) {
            setErrorBanner(err.response?.data?.message || 'Failed uploading logo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Header & Arena Presenter Mode Callout */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.04]">
                <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-sm">
                        <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                            Tournament Director Studio
                            <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 uppercase">
                                Superuser
                            </span>
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Configure who fights whom, schedule matches, manage broadcast feeds, and display on arena TVs
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {/* Launch Arena Mode Button */}
                    <button
                        type="button"
                        onClick={onLaunchArena}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-500 hover:from-rose-500 hover:to-amber-400 text-white font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                        title="Display full tournament on stadium TV or big monitor"
                    >
                        <Tv className="w-4 h-4" />
                        <span>Arena TV Presenter Mode</span>
                    </button>

                    <button
                        onClick={fetchAdminData}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-50 dark:bg-white/[0.03] dark:hover:bg-white/[0.06] border border-slate-200 dark:border-white/[0.05] text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                        <span className="hidden sm:inline">Sync Data</span>
                    </button>
                </div>
            </div>

            {/* Notification Banners */}
            {successBanner && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 shadow-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold">{successBanner}</span>
                </div>
            )}
            {errorBanner && (
                <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2.5 shadow-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                    <span className="font-bold">{errorBanner}</span>
                </div>
            )}


            {/* MOBILE ADMIN NAVIGATION BAR (< lg screens) */}
            <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {[
                    { id: 'bracket', label: 'Bracket Studio', icon: Layers },
                    { id: 'matches', label: 'Pairings & Results', icon: Calendar },
                    { id: 'divisions', label: 'Divisions & Logos', icon: Award },
                    { id: 'zoom', label: 'Zoom Live Stream', icon: Video },
                ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab && setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                                isActive
                                    ? 'bg-purple-600 text-white shadow-md'
                                    : 'bg-white dark:bg-white/[0.03] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.04] hover:bg-slate-100 dark:hover:bg-white/[0.06]'
                            }`}
                        >
                            <Icon className="w-4 h-4 shrink-0" />
                            <span>{tab.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* TAB 1: MATCHMAKING & SEED STUDIO */}
            {activeTab === 'bracket' && (
                <div className="rounded-3xl bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.04] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.04]">
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span>Visual Matchmaking Bracket Studio</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Configure which divisions will clash in Semifinal 1 and Semifinal 2, assign schedules, and auto-link to the Grand Final
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={shuffleSeeds}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.04] transition-colors"
                        >
                            <Shuffle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                            <span>Shuffle Matchups</span>
                        </button>
                    </div>

                    <form onSubmit={handleGenerateBracket} className="space-y-6">
                        {/* Title & Sport Selector */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Tournament Event Title
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="e.g. MLBB PalayOffs Invitational Cup 2026"
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-slate-200 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.05] focus:border-purple-500 focus:outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                                    Assigned Esports Sport
                                </label>
                                <select
                                    value={sportId}
                                    onChange={(e) => setSportId(e.target.value)}
                                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-slate-200 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-white/[0.05] focus:border-purple-500 focus:outline-none"
                                >
                                    {sports.map((s) => (
                                        <option key={s.id} value={s.id}>
                                             {s.name} ({s.slug.toUpperCase()})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Interactive Matchmaking Cards (Who Fights Whom) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* SF1 Clash Configuration */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] space-y-4 shadow-sm">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.04]">
                                    <div>
                                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                            Match 1: Semifinal 1 (SF1)
                                        </span>
                                        <p className="text-[10px] text-slate-500 font-mono">Winner advances to Grand Final Slot A</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={swapSf1}
                                        title="Swap Opponents"
                                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                        <ArrowLeftRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                            Competitor A Faction
                                        </label>
                                        <select
                                            value={seedA}
                                            onChange={(e) => setSeedA(e.target.value)}
                                            className="w-full p-2.5 bg-white dark:bg-[#151926] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] font-bold"
                                        >
                                            {divisions.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} Division ({d.color_hex})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-center font-mono text-[11px] text-purple-600 dark:text-purple-400 font-black">
                                        VS
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                            Competitor B Faction
                                        </label>
                                        <select
                                            value={seedB}
                                            onChange={(e) => setSeedB(e.target.value)}
                                            className="w-full p-2.5 bg-white dark:bg-[#151926] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] font-bold"
                                        >
                                            {divisions.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} Division ({d.color_hex})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* SF2 Clash Configuration */}
                            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] space-y-4 shadow-sm">
                                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/[0.04]">
                                    <div>
                                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 uppercase tracking-wider">
                                            Match 2: Semifinal 2 (SF2)
                                        </span>
                                        <p className="text-[10px] text-slate-500 font-mono">Winner advances to Grand Final Slot B</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={swapSf2}
                                        title="Swap Opponents"
                                        className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 transition-colors"
                                    >
                                        <ArrowLeftRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                            Competitor C Faction
                                        </label>
                                        <select
                                            value={seedC}
                                            onChange={(e) => setSeedC(e.target.value)}
                                            className="w-full p-2.5 bg-white dark:bg-[#151926] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] font-bold"
                                        >
                                            {divisions.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} Division ({d.color_hex})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center justify-center font-mono text-[11px] text-purple-600 dark:text-purple-400 font-black">
                                        VS
                                    </div>

                                    <div>
                                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                                            Competitor D Faction
                                        </label>
                                        <select
                                            value={seedD}
                                            onChange={(e) => setSeedD(e.target.value)}
                                            className="w-full p-2.5 bg-white dark:bg-[#151926] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] font-bold"
                                        >
                                            {divisions.map((d) => (
                                                <option key={d.id} value={d.id}>
                                                    {d.name} Division ({d.color_hex})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 px-6 rounded-2xl font-black text-sm text-white bg-rose-600 hover:bg-rose-700 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                        >
                            <ShieldCheck className="w-5 h-5" />
                            <span>Commit Pairings & Initialize Tournament Nodes</span>
                        </button>
                    </form>
                </div>
            )}

            {/* TAB 2: PAIRINGS & SCHEDULE MANAGER (SIMPLIFIED & INTUITIVE BRACKET COORDINATOR) */}
            {activeTab === 'matches' && (() => {
                // Key matches for progressive status tracking
                const m1Match = matches.find(m => m.match_identifier === 'M1' || m.match_identifier === 'UB1');
                const m2Match = matches.find(m => m.match_identifier === 'M2' || m.match_identifier === 'UB2');
                const ubFMatch = matches.find(m => m.match_identifier === 'UB-F');
                const lbR1Match = matches.find(m => m.match_identifier === 'LB-R1');
                const lbFMatch = matches.find(m => m.match_identifier === 'LB-F');
                const gfMatch = matches.find(m => m.match_identifier === 'GF');

                // Pipeline Status Calculations
                const p1DoneCount = (m1Match?.winner_id ? 1 : 0) + (m2Match?.winner_id ? 1 : 0);
                const p1AllDone = Boolean(m1Match?.winner_id && m2Match?.winner_id);

                const p2Unlocked = p1AllDone;
                const p2DoneCount = (ubFMatch?.winner_id ? 1 : 0) + (lbR1Match?.winner_id ? 1 : 0);
                const p2AllDone = Boolean(ubFMatch?.winner_id && lbR1Match?.winner_id);

                const p3Unlocked = Boolean(ubFMatch?.winner_id && lbR1Match?.winner_id);
                const p3AllDone = Boolean(lbFMatch?.winner_id);

                const p4Unlocked = Boolean(ubFMatch?.winner_id && lbFMatch?.winner_id);
                const p4AllDone = Boolean(gfMatch?.winner_id);

                // Phase Definitions (unified progress + navigation)
                const PHASES = [
                    {
                        id: 'p1',
                        step: 1,
                        title: 'Opening (M1 & M2)',
                        subtitle: 'Seed 1 vs 2 & Seed 3 vs 4',
                        identifiers: ['M1', 'UB1', 'M2', 'UB2'],
                        unlocked: true,
                        doneCount: p1DoneCount,
                        total: 2,
                        isDone: p1AllDone,
                    },
                    {
                        id: 'p2',
                        step: 2,
                        title: 'Semis & Elimination',
                        subtitle: 'Upper Final & Lower R1',
                        identifiers: ['UB-F', 'LB-R1'],
                        unlocked: p2Unlocked,
                        doneCount: p2DoneCount,
                        total: 2,
                        isDone: p2AllDone,
                    },
                    {
                        id: 'p3',
                        step: 3,
                        title: 'Lower Final (Bronze)',
                        subtitle: 'Bronze Decider Match',
                        identifiers: ['LB-F'],
                        unlocked: p3Unlocked,
                        doneCount: p3AllDone ? 1 : 0,
                        total: 1,
                        isDone: p3AllDone,
                    },
                    {
                        id: 'p4',
                        step: 4,
                        title: 'Grand Final (Gold)',
                        subtitle: 'Championship Decider',
                        identifiers: ['GF'],
                        unlocked: p4Unlocked,
                        doneCount: p4AllDone ? 1 : 0,
                        total: 1,
                        isDone: p4AllDone,
                    },
                ];

                // Canonical display order: M1, M2 first, then UB-F, LB-R1, LB-F, GF
                const MATCH_ORDER = { 'M1': 1, 'UB1': 1, 'M2': 2, 'UB2': 2, 'UB-F': 3, 'LB-R1': 4, 'LB-F': 5, 'GF': 6 };
                const sortedMatches = [...matches].sort((a, b) => {
                    const orderA = MATCH_ORDER[a.match_identifier] || 99;
                    const orderB = MATCH_ORDER[b.match_identifier] || 99;
                    return orderA - orderB;
                });

                // Filtered matches based on selected phase tab
                const filteredMatches = sortedMatches.filter((m) => {
                    if (matchStageFilter === 'all') return true;
                    const selectedPhase = PHASES.find(p => p.id === matchStageFilter);
                    return selectedPhase ? selectedPhase.identifiers.includes(m.match_identifier) : true;
                });

                // Match Metadata Helper
                const getMatchMeta = (identifier) => {
                    switch (identifier) {
                        case 'M1':
                        case 'UB1':
                            return {
                                title: 'Match 1 · Opening Clash',
                                phaseTag: 'Phase 1 · Opening',
                                tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                                flow: 'Winner ➔ Upper Final (UB-F) · Loser ➔ Lower Round 1 (LB-R1)',
                            };
                        case 'M2':
                        case 'UB2':
                            return {
                                title: 'Match 2 · Opening Clash',
                                phaseTag: 'Phase 1 · Opening',
                                tagColor: 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 border-purple-200 dark:border-purple-800',
                                flow: 'Winner ➔ Upper Final (UB-F) · Loser ➔ Lower Round 1 (LB-R1)',
                            };
                        case 'UB-F':
                            return {
                                title: 'Upper Bracket Final (Semifinal)',
                                phaseTag: 'Phase 2 · Semifinal',
                                tagColor: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 border-blue-200 dark:border-blue-800',
                                flow: 'Winner ➔ Grand Final (GF) · Loser ➔ Lower Final (LB-F)',
                            };
                        case 'LB-R1':
                            return {
                                title: 'Lower Bracket Round 1 (Elimination)',
                                phaseTag: 'Phase 2 · Elimination',
                                tagColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-800',
                                flow: 'Winner ➔ Lower Final (LB-F) · Loser eliminated in 4th (10 PTS)',
                            };
                        case 'LB-F':
                            return {
                                title: 'Lower Bracket Final (Bronze Match)',
                                phaseTag: 'Phase 3 · Bronze Decider',
                                tagColor: 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-800',
                                flow: 'Winner ➔ Grand Final (GF) · Loser takes 3rd Place (15 PTS)',
                            };
                        case 'GF':
                            return {
                                title: 'Grand Final Championship (Gold Match)',
                                phaseTag: 'Phase 4 · Championship',
                                tagColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
                                flow: 'Winner is Champion (25 PTS) · Runner-Up takes 2nd (20 PTS)',
                            };
                        default:
                            return {
                                title: `Match ${identifier}`,
                                phaseTag: 'Tournament Match',
                                tagColor: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
                                flow: 'Tournament Bracket Match',
                            };
                    }
                };

                // Unlock State Helper
                const getMatchUnlockState = (m, divAVal, divBVal) => {
                    const isOpening = ['M1', 'M2', 'UB1', 'UB2'].includes(m.match_identifier);
                    if (isOpening) return { isUnlocked: true, pendingMsg: '' };

                    const hasBothDivisions = Boolean(divAVal && divBVal);
                    if (hasBothDivisions) return { isUnlocked: true, pendingMsg: '' };

                    let pendingMsg = 'Awaiting preceding match results';
                    if (m.match_identifier === 'UB-F') {
                        const m1Won = Boolean(m1Match?.winner_id);
                        const m2Won = Boolean(m2Match?.winner_id);
                        if (!m1Won && !m2Won) pendingMsg = 'Awaiting Winners of Match 1 (M1) & Match 2 (M2)';
                        else if (!m1Won) pendingMsg = 'Awaiting Winner of Match 1 (M1)';
                        else if (!m2Won) pendingMsg = 'Awaiting Winner of Match 2 (M2)';
                    } else if (m.match_identifier === 'LB-R1') {
                        const m1Won = Boolean(m1Match?.winner_id);
                        const m2Won = Boolean(m2Match?.winner_id);
                        if (!m1Won && !m2Won) pendingMsg = 'Awaiting Losers of Match 1 (M1) & Match 2 (M2)';
                        else if (!m1Won) pendingMsg = 'Awaiting Loser of Match 1 (M1)';
                        else if (!m2Won) pendingMsg = 'Awaiting Loser of Match 2 (M2)';
                    } else if (m.match_identifier === 'LB-F') {
                        const lbR1Won = Boolean(lbR1Match?.winner_id);
                        const ubFWon = Boolean(ubFMatch?.winner_id);
                        if (!lbR1Won && !ubFWon) pendingMsg = 'Awaiting Winner of Lower R1 & Loser of Upper Final';
                        else if (!lbR1Won) pendingMsg = 'Awaiting Winner of Lower Round 1 (LB-R1)';
                        else if (!ubFWon) pendingMsg = 'Awaiting Loser of Upper Final (UB-F)';
                    } else if (m.match_identifier === 'GF') {
                        const ubFWon = Boolean(ubFMatch?.winner_id);
                        const lbFWon = Boolean(lbFMatch?.winner_id);
                        if (!ubFWon && !lbFWon) pendingMsg = 'Awaiting Champions of Upper Final & Lower Final';
                        else if (!ubFWon) pendingMsg = 'Awaiting Winner of Upper Final (UB-F)';
                        else if (!lbFWon) pendingMsg = 'Awaiting Winner of Lower Final (LB-F)';
                    }

                    return { isUnlocked: false, pendingMsg };
                };

                return (
                    <div className="rounded-3xl bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.04] p-5 sm:p-7 shadow-sm dark:shadow-2xl space-y-6">
                        {/* Header & Tournament Level Actions */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.04]">
                            <div>
                                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    <span>Match Results & Bracket Coordinator</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                    Double Elimination Tree. Log the winner of each game — once a team reaches the Best-of target, they're declared the series winner and advance automatically.
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {selectedTournamentId && (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => handleFinalizeTournament(selectedTournamentId)}
                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                                            title="Finalize tournament and disburse official 25, 20, 15, 10 points to divisions"
                                        >
                                            <Crown className="w-4 h-4" />
                                            <span>Finalize Tournament</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => handleResetTournament(selectedTournamentId)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-700 dark:text-slate-300 font-bold text-xs border border-slate-200 dark:border-white/[0.04] transition-all cursor-pointer"
                                            title="Reset entire tournament bracket back to initial Double Elimination state"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                                            <span>Reset Bracket</span>
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* UNIFIED 4-PHASE PROGRESSION PIPELINE & FILTER BAR */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                                <span className="flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                                    <span>Tournament Pipeline & Stage Filter:</span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setMatchStageFilter('all')}
                                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                        matchStageFilter === 'all'
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-950 shadow-sm'
                                            : 'bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/[0.04]'
                                    }`}
                                >
                                    <Layers className="w-3 h-3" />
                                    <span>View All Matches ({matches.length})</span>
                                </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {PHASES.map((p) => {
                                    const isSelected = matchStageFilter === p.id;
                                    return (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setMatchStageFilter(matchStageFilter === p.id ? 'all' : p.id)}
                                            className={`p-3.5 rounded-xl text-left transition-all border cursor-pointer relative ${
                                                isSelected
                                                    ? 'ring-2 ring-rose-500 shadow-sm bg-rose-500/10 border-rose-500/40'
                                                    : p.isDone
                                                    ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10'
                                                    : p.unlocked
                                                    ? 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.04] hover:border-rose-400'
                                                    : 'bg-slate-50/50 dark:bg-white/[0.01] border-slate-200/60 dark:border-white/[0.02] opacity-60'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="font-mono text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                                                    Step {p.step}
                                                </span>
                                                <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                                                    p.isDone
                                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                                                        : p.unlocked
                                                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                                                        : 'bg-slate-200 dark:bg-white/[0.05] text-slate-500'
                                                }`}>
                                                    {!p.unlocked && <Lock className="w-2.5 h-2.5" />}
                                                    {p.isDone ? `✓ Done (${p.total}/${p.total})` : p.unlocked ? `${p.doneCount}/${p.total} Done` : 'Locked'}
                                                </span>
                                            </div>
                                            <h5 className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                                {p.title}
                                            </h5>
                                            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                                                {p.subtitle}
                                            </p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* COMPACT ACTIVE STAGE GUIDANCE BANNER (MINIMAL 3 COLORS) */}
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.05] text-xs flex flex-wrap items-center justify-between gap-3 text-slate-700 dark:text-slate-300">
                            <div className="flex items-center gap-2.5">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0" />
                                <div>
                                    {!p1AllDone ? (
                                        <span><strong>Current Step: Phase 1 (Opening Matches M1 & M2).</strong> M1 and M2 are displayed first below. Log each game; the series winner is auto-declared and unlocks Phase 2.</span>
                                    ) : !p2AllDone ? (
                                        <span><strong>Current Step: Phase 2 (Upper Final & Lower R1).</strong> M1 and M2 concluded! Log who wins UB-F and LB-R1 below.</span>
                                    ) : !p3AllDone ? (
                                        <span><strong>Current Step: Phase 3 (Lower Bracket Final).</strong> Log who wins the Lower Final to punch their ticket to the Grand Championship.</span>
                                    ) : !p4AllDone ? (
                                        <span><strong>Current Step: Phase 4 (Grand Final).</strong> The Upper and Lower champions are ready! Declare the Grand Champion of PalayOffs.</span>
                                    ) : (
                                        <span><strong>Tournament Complete!</strong> All matches have been concluded. Click "Finalize Tournament" above to disburse official points.</span>
                                    )}
                                </div>
                            </div>
                            {matchStageFilter !== 'all' && (
                                <button
                                    type="button"
                                    onClick={() => setMatchStageFilter('all')}
                                    className="text-[11px] font-bold text-slate-900 dark:text-white hover:underline cursor-pointer"
                                >
                                    Show All Stages
                                </button>
                            )}
                        </div>

                        {/* STREAMLINED MATCH CARDS (M1 & M2 ALWAYS FIRST) */}
                        <div className="space-y-4">
                            {filteredMatches.map((m) => {
                                const edits = editingMatch[m.id] || {};
                                const scheduledVal = edits.scheduled_at !== undefined ? edits.scheduled_at : (m.scheduled_at ? m.scheduled_at.substring(0, 16) : '');
                                const streamVal = edits.stream_url !== undefined ? edits.stream_url : (m.stream_url || '');
                                const statusVal = edits.status !== undefined ? edits.status : m.status;
                                const divAVal = edits.division_a_id !== undefined ? edits.division_a_id : (m.division_a_id || '');
                                const divBVal = edits.division_b_id !== undefined ? edits.division_b_id : (m.division_b_id || '');
                                const scoreAVal = edits.score_a !== undefined ? edits.score_a : (m.score_a ?? 0);
                                const scoreBVal = edits.score_b !== undefined ? edits.score_b : (m.score_b ?? 0);
                                const bestOfVal = edits.best_of !== undefined ? edits.best_of : (m.best_of || (m.match_identifier === 'GF' ? 5 : 3));

                                const divA = divisions.find((d) => d.id === parseInt(divAVal, 10)) || m.division_a || m.divisionA;
                                const divB = divisions.find((d) => d.id === parseInt(divBVal, 10)) || m.division_b || m.divisionB;

                                const meta = getMatchMeta(m.match_identifier);
                                const { isUnlocked, pendingMsg } = getMatchUnlockState(m, divAVal, divBVal);
                                const isAdvancedOpen = Boolean(openAdvancedMatch[m.id]);

                                const winsNeeded = Math.ceil(bestOfVal / 2);
                                // Persisted series score (source of truth for per-game logging)
                                const liveA = m.score_a ?? 0;
                                const liveB = m.score_b ?? 0;
                                const gamesPlayed = liveA + liveB;
                                const nextGameNo = gamesPlayed + 1;

                                return (
                                    <div
                                        key={m.id}
                                        className={`rounded-2xl border transition-all overflow-hidden ${
                                            !isUnlocked
                                                ? 'bg-slate-50/50 dark:bg-white/[0.01] border-dashed border-slate-200 dark:border-white/[0.03]'
                                                : m.winner_id
                                                ? 'bg-white dark:bg-[#121623] border-emerald-500/30 shadow-sm'
                                                : 'bg-white dark:bg-[#121623] border-slate-200 dark:border-white/[0.04] shadow-sm hover:border-slate-400'
                                        }`}
                                    >
                                        {/* 1. COMPACT HEADER BAR - FULLY RESPONSIVE ON MOBILE */}
                                        <div className="p-3 sm:p-4 bg-slate-50/70 dark:bg-white/[0.02] border-b border-slate-200 dark:border-white/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            {/* Row 1: ID, Title & Status Pill */}
                                            <div className="flex items-center justify-between gap-2.5 min-w-0 flex-1">
                                                <div className="flex items-center gap-2.5 min-w-0">
                                                    <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-mono font-black text-xs shadow-sm shrink-0">
                                                        {m.match_identifier}
                                                    </span>
                                                    <div className="min-w-0">
                                                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                                                            {meta.title}
                                                        </h4>
                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block truncate">
                                                            {meta.flow}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Status Pill (always visible and unclipped) */}
                                                <div className="shrink-0">
                                                    {m.winner_id ? (
                                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] sm:text-[11px] font-mono flex items-center gap-1 border border-emerald-500/30 whitespace-nowrap">
                                                            <Check className="w-3 h-3" />
                                                            <span>Concluded</span>
                                                        </span>
                                                    ) : isUnlocked ? (
                                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold text-[10px] sm:text-[11px] font-mono flex items-center gap-1 border border-rose-500/30 whitespace-nowrap">
                                                            <Unlock className="w-3 h-3" />
                                                            <span>{gamesPlayed > 0 ? `Live (G${nextGameNo})` : 'Ready to Log'}</span>
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-slate-200 dark:bg-white/[0.05] text-slate-500 font-bold text-[10px] sm:text-[11px] font-mono flex items-center gap-1 border border-slate-300 dark:border-white/[0.05] whitespace-nowrap">
                                                            <Lock className="w-3 h-3 text-slate-400" />
                                                            <span>Locked</span>
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Row 2 on mobile / Right column on desktop: Series Format Selector */}
                                            <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200/50 dark:border-white/[0.02]">
                                                <div className="flex items-center bg-white dark:bg-[#151926] border border-slate-200 dark:border-white/[0.05] rounded-lg p-0.5 text-xs font-mono w-full sm:w-auto justify-between sm:justify-start">
                                                    <span className="px-1.5 text-slate-400 text-[10px] uppercase font-bold shrink-0">Series:</span>
                                                    <div className="flex items-center gap-0.5">
                                                        {[1, 3, 5, 7].map((num) => {
                                                            const tooShort = !m.winner_id && Math.ceil(num / 2) <= Math.max(liveA, liveB);
                                                            return (
                                                            <button
                                                                key={num}
                                                                type="button"
                                                                disabled={loading || tooShort}
                                                                onClick={() => handleUpdateBestOf(m.id, num)}
                                                                className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                                                                    bestOfVal === num
                                                                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                                                                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.05]'
                                                                }`}
                                                                title={tooShort ? `Current series score exceeds BO${num}` : `Set series format to Best of ${num}`}
                                                            >
                                                                BO{num}
                                                            </button>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* 2. MATCHUP & WINNER LOGGING BODY */}
                                        <div className="p-3.5 sm:p-5 space-y-4">
                                            {/* COMPETITORS VS ROW */}
                                            <div className="grid grid-cols-1 md:grid-cols-11 items-center gap-2.5 sm:gap-3">
                                                {/* Competitor A Card */}
                                                <div className={`md:col-span-5 p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                                                    m.winner_id === divA?.id
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                                                        : 'bg-slate-50 dark:bg-[#151928] border-slate-200 dark:border-white/[0.03]'
                                                }`}>
                                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                                        <div
                                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center font-black text-sm text-slate-950 shrink-0 shadow-sm border border-black/5 dark:border-white/10"
                                                            style={{ backgroundColor: divA?.color_hex || '#B784A7' }}
                                                        >
                                                            {divA?.logo_path ? (
                                                                <img src={divA.logo_path} alt={divA.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{divA?.name ? divA.name.charAt(0) : 'A'}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Slot A</span>
                                                            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate" title={divA?.name || 'Awaiting Competitor'}>
                                                                {divA?.name || 'Awaiting Competitor'}
                                                            </h5>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                                            {scoreAVal}
                                                        </span>
                                                        {m.winner_id === divA?.id && (
                                                            <span className="block text-[10px] text-emerald-500 font-black uppercase font-mono">
                                                                👑 Winner
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* VS Middle Badge */}
                                                <div className="md:col-span-1 flex items-center justify-center py-0.5">
                                                    <span className="text-[10px] sm:text-xs font-black font-mono px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                                        VS
                                                    </span>
                                                </div>

                                                {/* Competitor B Card */}
                                                <div className={`md:col-span-5 p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
                                                    m.winner_id === divB?.id
                                                        ? 'bg-emerald-500/10 border-emerald-500/40 ring-1 ring-emerald-500/30'
                                                        : 'bg-slate-50 dark:bg-[#151928] border-slate-200 dark:border-white/[0.03]'
                                                }`}>
                                                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                                        <div
                                                            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden flex items-center justify-center font-black text-sm text-slate-950 shrink-0 shadow-sm border border-black/5 dark:border-white/10"
                                                            style={{ backgroundColor: divB?.color_hex || '#98FF98' }}
                                                        >
                                                            {divB?.logo_path ? (
                                                                <img src={divB.logo_path} alt={divB.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <span>{divB?.name ? divB.name.charAt(0) : 'B'}</span>
                                                            )}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <span className="text-[10px] font-mono text-slate-400 uppercase block">Slot B</span>
                                                            <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate" title={divB?.name || 'Awaiting Competitor'}>
                                                                {divB?.name || 'Awaiting Competitor'}
                                                            </h5>
                                                        </div>
                                                    </div>

                                                    <div className="text-right shrink-0">
                                                        <span className="font-mono text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                                                            {scoreBVal}
                                                        </span>
                                                        {m.winner_id === divB?.id && (
                                                            <span className="block text-[10px] text-emerald-500 font-black uppercase font-mono">
                                                                👑 Winner
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 3. SIMPLIFIED WINNER LOGGING / STATUS ACTION */}
                                            {/* CASE 1: LOCKED FIXTURE */}
                                            {!isUnlocked && (
                                                <div className="p-3.5 rounded-xl bg-slate-100/70 dark:bg-white/[0.01] border border-dashed border-slate-300 dark:border-white/[0.03] text-xs flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-400">
                                                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                                                        <span><strong>Fixture Locked:</strong> {pendingMsg}. Will automatically unlock as soon as prior matches finish.</span>
                                                    </div>
                                                </div>
                                            )}

                                            {/* CASE 2: CONCLUDED FIXTURE */}
                                            {isUnlocked && m.winner_id && (
                                                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/30 flex flex-wrap items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                                                        <Trophy className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                                        <span>
                                                            Series Concluded: <strong>{m.winner?.name || 'Winner'}</strong> won the match ({scoreAVal} - {scoreBVal}). Bracket nodes advanced.
                                                        </span>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={() => handleResetMatch(m.id)}
                                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-white/[0.04] hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold border border-slate-200 dark:border-white/[0.05] transition-colors cursor-pointer shadow-sm"
                                                        title="Reset this match and clear downstream bracket slots"
                                                    >
                                                        <RotateCcw className="w-3.5 h-3.5 text-rose-500" />
                                                        <span>Re-open / Reset Match</span>
                                                    </button>
                                                </div>
                                            )}

                                            {/* CASE 3: PER-GAME LOGGING (AUTO-DECLARES SERIES WINNER) */}
                                            {isUnlocked && !m.winner_id && (
                                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] space-y-4">
                                                    {/* Instruction line */}
                                                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                                        <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                                            <Crown className="w-4 h-4 text-rose-500" />
                                                            <span>Log Game {nextGameNo} Winner</span>
                                                        </span>
                                                        <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                                                            Best of {bestOfVal} · First to <strong className="text-rose-600 dark:text-rose-400 font-bold">{winsNeeded}</strong> win{winsNeeded > 1 ? 's' : ''} is auto-declared
                                                        </span>
                                                    </div>

                                                    {/* Per-team game logging */}
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {[
                                                            { side: 'a', div: divA, wins: liveA, fallback: 'Competitor A', btnColor: 'bg-rose-600 hover:bg-rose-500 text-white', pip: 'bg-rose-500' },
                                                            { side: 'b', div: divB, wins: liveB, fallback: 'Competitor B', btnColor: 'bg-emerald-600 hover:bg-emerald-500 text-white', pip: 'bg-emerald-500' },
                                                        ].map(({ side, div, wins, fallback, btnColor, pip }) => {
                                                            const isMatchPoint = wins === winsNeeded - 1;
                                                            return (
                                                                <div key={side} className="p-3 rounded-xl bg-white dark:bg-[#151926] border border-slate-200 dark:border-white/[0.04] space-y-3">
                                                                    <div className="flex items-center justify-between gap-2">
                                                                        <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                                                                            {div?.name || fallback}
                                                                        </span>
                                                                        {isMatchPoint && (
                                                                            <span className="text-[10px] font-mono font-black uppercase px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
                                                                                Match Point
                                                                            </span>
                                                                        )}
                                                                    </div>

                                                                    {/* Win pips */}
                                                                    <div className="flex items-center gap-1.5">
                                                                        {Array.from({ length: winsNeeded }).map((_, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className={`h-2 flex-1 rounded-full transition-colors ${i < wins ? pip : 'bg-slate-200 dark:bg-white/[0.08]'}`}
                                                                            />
                                                                        ))}
                                                                        <span className="ml-1 font-mono text-xs font-black text-slate-700 dark:text-slate-200 shrink-0">
                                                                            {wins}/{winsNeeded}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-stretch gap-2">
                                                                        <button
                                                                            type="button"
                                                                            disabled={loading || !divA || !divB}
                                                                            onClick={() => handleLogGame(m, side, 1, divA, divB, bestOfVal, liveA, liveB)}
                                                                            className={`flex-1 py-2.5 px-3 rounded-lg ${btnColor} font-extrabold text-xs shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed`}
                                                                            title={isMatchPoint ? 'Winning this game clinches the series' : `Log Game ${nextGameNo} for this team`}
                                                                        >
                                                                            <Check className="w-3.5 h-3.5" />
                                                                            <span>Won Game {nextGameNo}{isMatchPoint ? ' (Clinch)' : ''}</span>
                                                                        </button>
                                                                        <button
                                                                            type="button"
                                                                            disabled={loading || wins === 0}
                                                                            onClick={() => handleLogGame(m, side, -1, divA, divB, bestOfVal, liveA, liveB)}
                                                                            className="px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/[0.05] transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                                                                            title="Undo one game win"
                                                                        >
                                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                                                        Series: <strong className="font-mono text-slate-800 dark:text-white">{liveA} - {liveB}</strong> after {gamesPlayed} game{gamesPlayed === 1 ? '' : 's'}. The bracket advances automatically once a team reaches {winsNeeded} win{winsNeeded > 1 ? 's' : ''}.
                                                    </p>
                                                </div>
                                            )}

                                            {/* 4. COLLAPSIBLE ADVANCED SETTINGS & OVERRIDES */}
                                            <div className="pt-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setOpenAdvancedMatch({ ...openAdvancedMatch, [m.id]: !isAdvancedOpen })}
                                                    className="text-[11px] font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                                                >
                                                    <Settings className="w-3 h-3" />
                                                    <span>{isAdvancedOpen ? 'Hide' : 'Show'} Advanced Settings (Schedule & Manual Overrides)</span>
                                                    {isAdvancedOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                </button>

                                                {isAdvancedOpen && (
                                                    <div className="mt-3 p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] space-y-3">
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                                                            <div>
                                                                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                                    Division A Override
                                                                </label>
                                                                <select
                                                                    value={divAVal}
                                                                    onChange={(e) =>
                                                                        setEditingMatch({
                                                                            ...editingMatch,
                                                                            [m.id]: { ...edits, division_a_id: e.target.value || null },
                                                                        })
                                                                    }
                                                                    className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-semibold text-xs"
                                                                >
                                                                    <option value="">TBD (Pending)</option>
                                                                    {divisions.map((d) => (
                                                                        <option key={d.id} value={d.id}>
                                                                            {d.name} Division
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                                    Division B Override
                                                                </label>
                                                                <select
                                                                    value={divBVal}
                                                                    onChange={(e) =>
                                                                        setEditingMatch({
                                                                            ...editingMatch,
                                                                            [m.id]: { ...edits, division_b_id: e.target.value || null },
                                                                        })
                                                                    }
                                                                    className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-semibold text-xs"
                                                                >
                                                                    <option value="">TBD (Pending)</option>
                                                                    {divisions.map((d) => (
                                                                        <option key={d.id} value={d.id}>
                                                                            {d.name} Division
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            </div>

                                                            <div>
                                                                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                                    Scheduled Date & Time
                                                                </label>
                                                                <input
                                                                    type="datetime-local"
                                                                    value={scheduledVal}
                                                                    onChange={(e) =>
                                                                        setEditingMatch({
                                                                            ...editingMatch,
                                                                            [m.id]: { ...edits, scheduled_at: e.target.value },
                                                                        })
                                                                    }
                                                                    className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-mono text-xs"
                                                                />
                                                            </div>

                                                            <div>
                                                                <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                                    Match Status Override
                                                                </label>
                                                                <select
                                                                    value={statusVal}
                                                                    onChange={(e) =>
                                                                        setEditingMatch({
                                                                            ...editingMatch,
                                                                            [m.id]: { ...edits, status: e.target.value },
                                                                        })
                                                                    }
                                                                    className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-semibold text-xs"
                                                                >
                                                                    <option value="scheduled">Scheduled</option>
                                                                    <option value="live">Live in Progress</option>
                                                                    <option value="finished">Finished (Completed)</option>
                                                                </select>
                                                            </div>
                                                        </div>

                                                        <div className="flex justify-end pt-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => handleSaveMatch(m.id)}
                                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-950 hover:opacity-90 font-bold text-xs shadow-sm cursor-pointer"
                                                            >
                                                                <Save className="w-3.5 h-3.5" />
                                                                <span>Save Overrides</span>
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            })()}

            {/* TAB 3: DIVISIONS & POINTING LEDGER WITH TEAM LOGO EDITOR */}
            {activeTab === 'divisions' && (
                <div className="rounded-3xl bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.04] p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/[0.04]">
                        <div>
                            <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                <span>Division Management & Team Logo Studio</span>
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Edit team logo images (displayed prominently in Arena Display TV), faction colors, names, and leaderboard points
                            </p>
                        </div>

                        {/* Reset All Points Quick Action */}
                        <button
                            type="button"
                            onClick={handleResetAllPoints}
                            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/40 text-rose-700 dark:text-rose-300 font-bold text-xs border border-rose-200 dark:border-rose-800/40 transition-colors cursor-pointer"
                            title="Reset all division points to 0 for operational tournament start"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset All Leaderboards to 0 PTS</span>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {divisions.map((div) => {
                            const edits = editingDivision[div.id] || {};
                            const nameVal = edits.name !== undefined ? edits.name : div.name;
                            const hexVal = edits.color_hex !== undefined ? edits.color_hex : div.color_hex;
                            const ptsVal = edits.total_accumulated_points !== undefined ? edits.total_accumulated_points : (div.total_accumulated_points ?? 0);
                            const logoVal = edits.logo_path !== undefined ? edits.logo_path : (div.logo_path || '');

                            const presets = [
                                { label: 'Mauve Crest', path: '/assets/divisions/mauve.svg' },
                                { label: 'Cyan Crest', path: '/assets/divisions/cyan.svg' },
                                { label: 'Mint Crest', path: '/assets/divisions/mint.svg' },
                                { label: 'Peach Crest', path: '/assets/divisions/peach.svg' },
                            ];

                            return (
                                <div
                                    key={div.id}
                                    className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.04] space-y-4 shadow-sm"
                                >
                                    {/* Division Header & Save */}
                                    <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/[0.04]">
                                        <div className="flex items-center gap-3">
                                            {/* Logo Preview */}
                                            <div 
                                                className="w-12 h-12 rounded-xl flex items-center justify-center p-1 border-2 shadow-md shrink-0 overflow-hidden"
                                                style={{ 
                                                    backgroundColor: hexVal + '22',
                                                    borderColor: hexVal 
                                                }}
                                            >
                                                {logoVal ? (
                                                    <img 
                                                        src={logoVal} 
                                                        alt={nameVal} 
                                                        className="w-full h-full object-contain filter drop-shadow-sm"
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div 
                                                    className="w-full h-full rounded-lg flex items-center justify-center font-black text-sm text-slate-950"
                                                    style={{ 
                                                        backgroundColor: hexVal,
                                                        display: logoVal ? 'none' : 'flex'
                                                    }}
                                                >
                                                    {nameVal.charAt(0)}
                                                </div>
                                            </div>

                                            <div>
                                                <span className="font-black text-slate-900 dark:text-white text-base block">
                                                    {nameVal} Division
                                                </span>
                                                <span className="text-[10px] font-mono text-slate-500 uppercase">
                                                    Faction #{div.id} · {ptsVal} PTS
                                                </span>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleSaveDivision(div.id)}
                                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm cursor-pointer transition-all active:scale-95"
                                        >
                                            <Save className="w-3.5 h-3.5" />
                                            <span>Save Division</span>
                                        </button>
                                    </div>

                                    {/* Team Logo Image Editor */}
                                    <div className="space-y-2 p-3 rounded-xl bg-white dark:bg-[#151926] border border-slate-200 dark:border-white/[0.04]">
                                        <label className="text-[11px] font-black text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                                            Team Image / Logo Path (Used in Arena Display)
                                        </label>
                                        <input
                                            type="text"
                                            value={logoVal}
                                            onChange={(e) =>
                                                setEditingDivision({
                                                    ...editingDivision,
                                                    [div.id]: { ...edits, logo_path: e.target.value },
                                                })
                                            }
                                            placeholder="URL or /assets/divisions/..."
                                            className="w-full p-2 bg-slate-50 dark:bg-white/[0.03] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-mono text-xs"
                                        />

                                        {/* Presets & File Upload */}
                                        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[10px]">
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-slate-500 font-mono">Presets:</span>
                                                {presets.map((p, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() =>
                                                            setEditingDivision({
                                                                ...editingDivision,
                                                                [div.id]: { ...edits, logo_path: p.path },
                                                            })
                                                        }
                                                        className="px-2 py-0.5 rounded bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-slate-700 dark:text-slate-300 font-mono"
                                                    >
                                                        {p.label.split(' ')[0]}
                                                    </button>
                                                ))}
                                            </div>

                                            <label className="flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline cursor-pointer font-bold">
                                                <Upload className="w-3 h-3" />
                                                <span>Upload Image File</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => handleUploadLogo(div.id, e.target.files[0])}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Name, Hex & Points */}
                                    <div className="grid grid-cols-3 gap-3 text-xs">
                                        <div>
                                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                Division Name
                                            </label>
                                            <input
                                                type="text"
                                                value={nameVal}
                                                onChange={(e) =>
                                                    setEditingDivision({
                                                        ...editingDivision,
                                                        [div.id]: { ...edits, name: e.target.value },
                                                    })
                                                }
                                                className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-bold"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                Hex Color Code
                                            </label>
                                            <input
                                                type="text"
                                                value={hexVal}
                                                onChange={(e) =>
                                                    setEditingDivision({
                                                        ...editingDivision,
                                                        [div.id]: { ...edits, color_hex: e.target.value },
                                                    })
                                                }
                                                className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-mono"
                                            />
                                        </div>

                                        <div>
                                            <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-mono block mb-1">
                                                Accumulated PTS
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={ptsVal}
                                                onChange={(e) =>
                                                    setEditingDivision({
                                                        ...editingDivision,
                                                        [div.id]: { ...edits, total_accumulated_points: parseInt(e.target.value, 10) || 0 },
                                                    })
                                                }
                                                className="w-full p-2 bg-white dark:bg-[#151926] text-slate-900 dark:text-white rounded-lg border border-slate-200 dark:border-white/[0.05] font-mono font-bold"
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* TAB 4: DYNAMIC ZOOM LIVE BROADCAST STUDIO */}
            {activeTab === 'zoom' && (
                <div className="space-y-6">
                    <div className="rounded-3xl bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.04] p-6 sm:p-8 shadow-sm dark:shadow-2xl">
                        {/* Header */}
                        <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-200 dark:border-white/[0.04]">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2.5">
                                    <Video className="w-6 h-6 text-blue-500" />
                                    <span>Zoom Live Broadcast & Spectator Stream Studio</span>
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                    Configure the official Zoom link, meeting ID, and passcode. Generates dynamic real-time QR codes for audience mobile streaming and synchronizes across all Arena Stadium Displays.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={onLaunchArena}
                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
                            >
                                <Tv className="w-4 h-4" />
                                <span>Preview on Arena Display</span>
                            </button>
                        </div>

                        {/* Content Grid: Form on Left (7 cols), QR Card on Right (5 cols) */}
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6 items-start">
                            {/* Left: Configuration Form */}
                            <form onSubmit={handleSaveZoomStream} className="lg:col-span-7 space-y-5">
                                {/* Tournament Target Selector */}
                                <div>
                                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1.5">
                                        Target Tournament
                                    </label>
                                    <select
                                        value={selectedTournamentId}
                                        onChange={(e) => setSelectedTournamentId(e.target.value)}
                                        className="w-full p-3 bg-slate-50 dark:bg-[#151926] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] text-xs font-mono"
                                    >
                                        {tournaments.map((t) => (
                                            <option key={t.id} value={t.id}>
                                                #{t.id} - {t.title} ({t.format})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Full Zoom Join URL */}
                                <div>
                                    <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1.5 flex items-center justify-between">
                                        <span>Zoom Join URL / Stream Link</span>
                                        <span className="text-[10px] text-blue-500 lowercase font-normal">encoded in live QR code</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="url"
                                            required
                                            value={zoomUrl}
                                            onChange={(e) => setZoomUrl(e.target.value)}
                                            placeholder="https://zoom.us/j/1234567890?pwd=..."
                                            className="w-full p-3.5 pr-24 bg-slate-50 dark:bg-[#151926] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (navigator.clipboard) {
                                                    navigator.clipboard.writeText(zoomUrl);
                                                    setZoomCopied(true);
                                                    setTimeout(() => setZoomCopied(false), 2000);
                                                }
                                            }}
                                            className="absolute right-2 top-2 px-2.5 py-1.5 rounded-lg bg-white dark:bg-white/[0.06] border border-slate-200 dark:border-white/[0.05] text-slate-700 dark:text-slate-300 text-[11px] font-bold flex items-center gap-1 hover:bg-slate-100"
                                        >
                                            {zoomCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                            <span>{zoomCopied ? 'Copied' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                                        Spectators scanning the Arena QR code on their smartphone will immediately open this link.
                                    </p>
                                </div>

                                {/* Meeting ID and Passcode */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1.5">
                                            Meeting ID (Display Card)
                                        </label>
                                        <input
                                            type="text"
                                            value={zoomMeetingId}
                                            onChange={(e) => setZoomMeetingId(e.target.value)}
                                            placeholder="e.g. 849 2049 1823"
                                            className="w-full p-3 bg-slate-50 dark:bg-[#151926] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] text-xs font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase block mb-1.5">
                                            Meeting Passcode
                                        </label>
                                        <input
                                            type="text"
                                            value={zoomPasscode}
                                            onChange={(e) => setZoomPasscode(e.target.value)}
                                            placeholder="e.g. PALAYOFFS"
                                            className="w-full p-3 bg-slate-50 dark:bg-[#151926] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-white/[0.05] text-xs font-mono font-bold text-amber-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Quick Presets & Test Buttons */}
                                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setZoomUrl('https://zoom.us/j/84920491823?pwd=palayoffs');
                                            setZoomMeetingId('849 2049 1823');
                                            setZoomPasscode('PALAYOFFS');
                                        }}
                                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-300 font-semibold hover:bg-slate-200 text-[11px] border border-slate-200 dark:border-white/[0.05]"
                                    >
                                        Preset: Default PalayOffs Zoom
                                    </button>

                                    <a
                                        href={zoomUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold hover:bg-blue-100 text-[11px] border border-blue-200 dark:border-blue-900/40 flex items-center gap-1"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Test Open in Zoom</span>
                                    </a>
                                </div>

                                {/* Submit Save Button */}
                                <div className="pt-4 border-t border-slate-200 dark:border-white/[0.04]">
                                    <button
                                        type="submit"
                                        disabled={savingZoom}
                                        className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                    >
                                        {savingZoom ? (
                                            <RefreshCw className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Save className="w-4 h-4" />
                                        )}
                                        <span>{savingZoom ? 'Broadcasting...' : 'Save & Broadcast Live to Arena Display'}</span>
                                    </button>
                                </div>
                            </form>

                            {/* Right: Live Generated QR Preview & Stadium Card Mirror */}
                            <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 dark:border-white/[0.04] shadow-xl space-y-5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-blue-400 uppercase">
                                        <QrCode className="w-4 h-4" />
                                        <span>Live Dynamic QR Preview</span>
                                    </div>
                                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono border border-emerald-800/60 font-bold">
                                        ● Real-Time Sync
                                    </span>
                                </div>

                                {/* QR Code Canvas */}
                                <div className="p-4 bg-white rounded-2xl flex items-center justify-center shadow-inner">
                                    {adminQrPreview ? (
                                        <img
                                            src={adminQrPreview}
                                            alt="Zoom Live QR Code"
                                            className="w-48 h-48 object-contain"
                                        />
                                    ) : (
                                        <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs font-mono">
                                            Generating QR Code...
                                        </div>
                                    )}
                                </div>

                                {/* Arena Card Preview Info */}
                                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 dark:border-white/[0.05] text-xs font-mono space-y-2">
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>Meeting ID:</span>
                                        <strong className="text-white text-sm">{zoomMeetingId || 'Not set'}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>Passcode:</span>
                                        <strong className="text-amber-400 text-sm">{zoomPasscode || 'None'}</strong>
                                    </div>
                                    <div className="truncate text-[10px] text-slate-500 pt-1 border-t border-slate-800 dark:border-white/[0.04]">
                                        URL: {zoomUrl}
                                    </div>
                                </div>

                                <p className="text-[11px] text-slate-400 leading-tight">
                                    This QR code is rendered live on the <strong>Arena Stadium Display (`/arena`)</strong>. Spectators pointing their mobile phones at the screen will directly enter this Zoom meeting.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CUSTOM DIRECTOR CONFIRMATION MODAL (REPLACES BROWSER LOCALHOST PROMPTS) */}
            {confirmModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="confirm-modal-title"
                    onClick={() => !loading && setConfirmModal(null)}
                >
                    <div
                        className="relative w-full max-w-md bg-white dark:bg-[#121520] border border-slate-200 dark:border-white/[0.05] rounded-3xl shadow-2xl p-6 sm:p-7 text-slate-900 dark:text-slate-100 overflow-hidden space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Glow effect */}
                        <div className="absolute -top-24 -left-24 w-48 h-48 bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

                        {/* Close Button */}
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => setConfirmModal(null)}
                            aria-label="Close Confirmation Modal"
                            className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        {/* Modal Header */}
                        <div className="flex items-center gap-3.5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                                confirmModal.icon === 'crown'
                                    ? 'bg-gradient-to-tr from-amber-500 to-yellow-500 text-slate-950'
                                    : 'bg-gradient-to-tr from-rose-600 to-rose-500 text-white'
                            }`}>
                                {confirmModal.icon === 'crown' ? (
                                    <Crown className="w-6 h-6" />
                                ) : (
                                    <AlertTriangle className="w-6 h-6" />
                                )}
                            </div>
                            <div className="min-w-0 pr-6">
                                <h3 id="confirm-modal-title" className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight">
                                    {confirmModal.title}
                                </h3>
                                <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold uppercase tracking-wider block mt-0.5">
                                    Director Confirmation
                                </span>
                            </div>
                        </div>

                        {/* Modal Body / Description */}
                        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                            {confirmModal.description}
                        </p>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-white/[0.04]">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => setConfirmModal(null)}
                                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-xs font-bold text-slate-700 dark:text-slate-300 transition-all cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={loading}
                                onClick={confirmModal.onConfirm}
                                className={`px-5 py-2.5 rounded-xl font-black text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center gap-2 ${confirmModal.confirmColor}`}
                            >
                                {loading ? (
                                    <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {confirmModal.icon === 'crown' ? (
                                            <Crown className="w-4 h-4" />
                                        ) : (
                                            <RotateCcw className="w-4 h-4" />
                                        )}
                                        <span>{confirmModal.confirmLabel}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
