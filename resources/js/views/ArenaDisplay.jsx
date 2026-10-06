import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { 
    Maximize2, 
    Minimize2, 
    X, 
    Radio, 
    Flame, 
    Trophy, 
    Crown, 
    Clock, 
    Swords, 
    Sparkles, 
    Shield, 
    Volume2, 
    Calendar, 
    ChevronRight, 
    Play,
    QrCode,
    Smartphone,
    Video,
    Copy,
    Check,
    Edit2,
    ExternalLink
} from 'lucide-react';
import DivisionLeaderboard from '../components/DivisionLeaderboard';
import api from '../services/api';

export default function ArenaDisplay({ landingData, onExit, onRefresh }) {
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());

    const tournament = landingData?.tournament;
    const divisions = landingData?.divisions || [];
    const allMatches = landingData?.bracket_tree?.all_matches || [];

    // Canonical Double Elimination progression order
    const MATCH_ORDER = { 'M1': 1, 'UB1': 1, 'M2': 2, 'UB2': 2, 'UB-F': 3, 'LB-R1': 4, 'LB-F': 5, 'GF': 6 };
    const sortedMatches = [...allMatches].sort((a, b) => {
        const orderA = MATCH_ORDER[a.match_identifier] || 99;
        const orderB = MATCH_ORDER[b.match_identifier] || 99;
        return orderA - orderB;
    });

    // Auto-select match priority:
    // 1. Any active live match with no winner declared yet
    // 2. The first unconcluded match in bracket sequence (starts at 0-0)
    // 3. Fallback: Grand Final or the last fixture
    const liveMatch = sortedMatches.find(m => m.status === 'live' && !m.winner_id);
    const nextUnconcludedMatch = sortedMatches.find(m => !m.winner_id && m.status !== 'finished');
    const defaultAutoMatch = liveMatch || nextUnconcludedMatch || sortedMatches[sortedMatches.length - 1] || allMatches[0];

    const [selectedMatchId, setSelectedMatchId] = useState(defaultAutoMatch?.id);

    // Zoom and QR Code State for Mobile Spectators - dynamically initialized from configured tournament
    const configuredZoom = tournament?.stream_url || 'https://zoom.us/j/84920491823?pwd=palayoffs';
    const [zoomUrl, setZoomUrl] = useState(configuredZoom);
    const [meetingId, setMeetingId] = useState(tournament?.zoom_meeting_id || '849 2049 1823');
    const [meetingPasscode, setMeetingPasscode] = useState(tournament?.zoom_passcode || 'PALAYOFFS');
    const [qrDataUrl, setQrDataUrl] = useState('');
    const [isCopied, setIsCopied] = useState(false);
    const [isEditingZoom, setIsEditingZoom] = useState(false);
    const [isEnlargedQr, setIsEnlargedQr] = useState(false);

    // Sync Zoom and Stream settings dynamically from active tournament
    useEffect(() => {
        if (tournament?.stream_url) {
            setZoomUrl(tournament.stream_url);
        }
        if (tournament?.zoom_meeting_id) {
            setMeetingId(tournament.zoom_meeting_id);
        }
        if (tournament?.zoom_passcode) {
            setMeetingPasscode(tournament.zoom_passcode);
        }
    }, [tournament?.stream_url, tournament?.zoom_meeting_id, tournament?.zoom_passcode]);

    // Generate Scannable QR Code whenever zoomUrl changes
    useEffect(() => {
        QRCode.toDataURL(zoomUrl, {
            width: 400,
            margin: 2,
            color: {
                dark: '#0B0D17',
                light: '#FFFFFF'
            }
        })
        .then(url => setQrDataUrl(url))
        .catch(err => console.error('Failed generating QR code:', err));
    }, [zoomUrl]);

    const handleCopyZoom = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(zoomUrl);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleSaveArenaZoom = async () => {
        try {
            await api.post('/admin/zoom-stream', {
                tournament_id: tournament?.id,
                zoom_url: zoomUrl,
                zoom_meeting_id: meetingId,
                zoom_passcode: meetingPasscode,
            });
            if (onRefresh) onRefresh();
        } catch (e) {
            console.error('Failed saving zoom to database:', e);
        }
        setIsEditingZoom(false);
    };

    // Auto-advance Arena Matchup:
    // If a match is already concluded (e.g. 2-0 / winner_id set / finished),
    // automatically display the next upcoming match (which starts at 0-0).
    useEffect(() => {
        if (!allMatches.length) return;

        const currentMatch = allMatches.find(m => m.id === selectedMatchId);
        const isCurrentConcluded = currentMatch ? Boolean(currentMatch.winner_id || currentMatch.status === 'finished') : true;

        if (isCurrentConcluded && nextUnconcludedMatch) {
            // Automatically advance to the next upcoming 0-0 match
            setSelectedMatchId(nextUnconcludedMatch.id);
        } else if (!selectedMatchId && defaultAutoMatch?.id) {
            setSelectedMatchId(defaultAutoMatch.id);
        }
    }, [allMatches, selectedMatchId, nextUnconcludedMatch?.id, defaultAutoMatch?.id]);

    const activeMatch = allMatches.find(m => m.id === selectedMatchId) || defaultAutoMatch || {};

    // Clock ticker
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Toggle browser fullscreen
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
                setIsFullscreen(false);
            }
        }
    };

    const divA = activeMatch.division_a || activeMatch.divisionA;
    const divB = activeMatch.division_b || activeMatch.divisionB;
    const colorA = divA?.color_hex || '#B784A7';
    const colorB = divB?.color_hex || '#98FF98';

    const getStageName = (identifier) => {
        switch (identifier) {
            case 'M1':
            case 'UB1': return 'Upper Bracket Round 1 (M1)';
            case 'M2':
            case 'UB2': return 'Upper Bracket Round 1 (M2)';
            case 'UB-F': return 'Upper Bracket Final';
            case 'LB-R1': return 'Lower Round 1';
            case 'LB-F': return 'Lower Bracket Final';
            case 'GF': return 'Grand Final';
            default: return 'Tournament Match';
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-[#07090E] text-slate-100 flex flex-col overflow-hidden select-none animate-fadeIn">
            {/* Arena Top Navigation Header */}
            <header className="h-20 px-6 sm:px-10 bg-[#0C0E17]/95 border-b border-[#1E2335] flex items-center justify-between gap-6 backdrop-blur-2xl shrink-0">
                {/* Left: Branding & Broadcast Feed Indicator */}
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-xl shadow-rose-950/70 flex items-center justify-center shrink-0">
                        <Flame className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-xl sm:text-2xl font-black text-white tracking-wider uppercase leading-none">
                                Palay<span className="text-rose-500">Offs</span>
                            </h1>
                            <span className="px-3 py-0.5 rounded-full bg-rose-600 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-rose-950/50 animate-pulse">
                                <Radio className="w-3.5 h-3.5" />
                                Arena Stadium Display
                            </span>
                        </div>
                        <p className="text-xs text-slate-400 font-semibold tracking-wide mt-1">
                            {tournament?.title || 'MLBB Championship'} · Live Stage Feed
                        </p>
                    </div>
                </div>

                {/* Center: Stage Clock & Event Badge */}
                <div className="hidden lg:flex items-center gap-6 bg-[#131724] px-6 py-2.5 rounded-2xl border border-[#212638] shadow-inner">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <span className="font-bold text-sm text-white">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <div className="h-4 w-px bg-slate-700" />
                    <div className="flex items-center gap-2 text-xs text-amber-400 font-black uppercase tracking-wider">
                        <Trophy className="w-4 h-4" />
                        <span>Live Arena Matchup & Standings</span>
                    </div>
                </div>

                {/* Right: Fullscreen & Exit Presentation Controls */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={toggleFullscreen}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#141724] hover:bg-[#1A1F30] border border-slate-700 text-xs font-bold text-slate-200 transition-all shadow-md active:scale-95 cursor-pointer"
                        title="Toggle TV Fullscreen Mode"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span className="hidden sm:inline">{isFullscreen ? 'Windowed' : 'Fullscreen TV'}</span>
                    </button>

                    <button
                        onClick={onExit}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-lg shadow-rose-950/50 active:scale-95 cursor-pointer"
                        title="Exit Arena View"
                    >
                        <X className="w-4 h-4" />
                        <span>Exit Presentation</span>
                    </button>
                </div>
            </header>

            {/* ARENA STAGE BODY: ONLY 2 THINGS ON SCREEN:
                1. Matchup Display (e.g. Mauve vs Mint)
                2. Current Standing (Division Leaderboard)
            */}
            <main className="flex-1 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center overflow-y-auto">
                {/* 1. MATCHUP DISPLAY (MAUVE VS MINT) - 8 Cols */}
                <div className="lg:col-span-8 flex flex-col justify-center space-y-6">
                    {/* Matchup Card */}
                    <div className="relative rounded-3xl bg-[#0D101A] border-2 border-[#252B40] shadow-2xl overflow-hidden p-6 sm:p-10">
                        {/* Dynamic Background Glows */}
                        <div 
                            className="absolute -top-32 -left-32 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
                            style={{ backgroundColor: colorA }}
                        />
                        <div 
                            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-700"
                            style={{ backgroundColor: colorB }}
                        />

                        {/* Top Match Header: Stage Pill, Identifier, Live Status */}
                        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 pb-6 mb-8 border-b border-[#1F2538]">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-xl bg-[#171B2B] text-slate-200 border border-slate-700 text-xs font-mono font-bold uppercase">
                                    Stage {activeMatch.match_identifier || 'UB1'}
                                </span>
                                <div>
                                    <h2 className="text-lg font-black text-white tracking-wide uppercase">
                                        {getStageName(activeMatch.match_identifier)}
                                    </h2>
                                    <p className="text-xs text-slate-400 font-mono">
                                        Format: Best of {activeMatch.best_of || 3} (First to {Math.ceil((activeMatch.best_of || 3) / 2)} wins) · MLBB 5v5 Arena Match
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md ${
                                    activeMatch.status === 'live'
                                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50 animate-pulse'
                                        : activeMatch.status === 'finished'
                                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                }`}>
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    {activeMatch.status === 'live' ? 'Live On Stage' : activeMatch.status}
                                </span>
                            </div>
                        </div>

                        {/* Center Stage: Team A vs Team B Head-to-Head */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-6 items-center">
                            {/* Team A (e.g. Mauve) */}
                            <div className="md:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl bg-[#121524]/90 border border-[#22283D] shadow-xl">
                                <div 
                                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-slate-950 shadow-2xl mb-4 transition-transform hover:scale-105 overflow-hidden p-2"
                                    style={{ 
                                        backgroundColor: colorA + '22',
                                        borderColor: colorA,
                                        borderWidth: '2px',
                                        boxShadow: `0 0 35px ${colorA}66`
                                    }}
                                >
                                    {divA?.logo_path ? (
                                        <img 
                                            src={divA.logo_path} 
                                            alt={divA.name}
                                            className="w-full h-full object-contain filter drop-shadow-xl"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="w-full h-full rounded-2xl flex items-center justify-center font-black text-3xl text-slate-950"
                                        style={{ 
                                            backgroundColor: colorA,
                                            display: divA?.logo_path ? 'none' : 'flex'
                                        }}
                                    >
                                        {divA?.name ? divA.name.charAt(0) : '?'}
                                    </div>
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                                    {divA?.name || 'TBD Seed A'}
                                </h3>
                                <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-1">
                                    Division Faction
                                </p>

                                <div className="mt-4 px-4 py-1.5 rounded-xl bg-[#090C14] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                                    <span className="text-slate-500">Standings:</span>
                                    <span className="font-bold text-white">{divA?.total_accumulated_points ?? 0} PTS</span>
                                </div>

                                {/* Score Display */}
                                <div className="mt-6 font-mono font-black text-6xl sm:text-7xl text-white">
                                    {activeMatch.score_a ?? 0}
                                </div>
                            </div>

                            {/* Versus Emblem */}
                            <div className="md:col-span-3 flex flex-col items-center justify-center py-4">
                                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#181D2E] border-2 border-rose-500/50 flex items-center justify-center shadow-2xl shadow-rose-950/60">
                                    <Swords className="w-8 h-8 text-rose-500 animate-pulse" />
                                    <span className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[10px] uppercase tracking-wider border border-white/20">
                                        VS
                                    </span>
                                </div>

                                <span className="text-xs font-mono font-bold text-slate-400 mt-5 uppercase tracking-widest">
                                    Live Clash
                                </span>
                            </div>

                            {/* Team B (e.g. Mint) */}
                            <div className="md:col-span-4 flex flex-col items-center text-center p-6 rounded-2xl bg-[#121524]/90 border border-[#22283D] shadow-xl">
                                <div 
                                    className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-slate-950 shadow-2xl mb-4 transition-transform hover:scale-105 overflow-hidden p-2"
                                    style={{ 
                                        backgroundColor: colorB + '22',
                                        borderColor: colorB,
                                        borderWidth: '2px',
                                        boxShadow: `0 0 35px ${colorB}66`
                                    }}
                                >
                                    {divB?.logo_path ? (
                                        <img 
                                            src={divB.logo_path} 
                                            alt={divB.name}
                                            className="w-full h-full object-contain filter drop-shadow-xl"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="w-full h-full rounded-2xl flex items-center justify-center font-black text-3xl text-slate-950"
                                        style={{ 
                                            backgroundColor: colorB,
                                            display: divB?.logo_path ? 'none' : 'flex'
                                        }}
                                    >
                                        {divB?.name ? divB.name.charAt(0) : '?'}
                                    </div>
                                </div>

                                <h3 className="text-2xl sm:text-3xl font-black text-white tracking-wide uppercase">
                                    {divB?.name || 'TBD Seed B'}
                                </h3>
                                <p className="text-xs font-mono uppercase tracking-widest text-slate-400 mt-1">
                                    Division Faction
                                </p>

                                <div className="mt-4 px-4 py-1.5 rounded-xl bg-[#090C14] border border-slate-800 text-xs font-mono text-slate-300 flex items-center gap-2">
                                    <span className="text-slate-500">Standings:</span>
                                    <span className="font-bold text-white">{divB?.total_accumulated_points ?? 0} PTS</span>
                                </div>

                                {/* Score Display */}
                                <div className="mt-6 font-mono font-black text-6xl sm:text-7xl text-white">
                                    {activeMatch.score_b ?? 0}
                                </div>
                            </div>
                        </div>

                        {/* Match Switcher Tabs for Stadium Coordinator */}
                        {sortedMatches.length > 1 && (
                            <div className="relative z-10 mt-8 pt-6 border-t border-[#1F2538]">
                                <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-400">
                                    <span>Select Arena Stage Matchup:</span>
                                    <span className="font-mono text-[11px] text-slate-500">{sortedMatches.length} Fixtures</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {sortedMatches.map((m) => {
                                        const isSelected = m.id === activeMatch.id;
                                        const nameA = m.division_a?.name || m.divisionA?.name || 'TBD';
                                        const nameB = m.division_b?.name || m.divisionB?.name || 'TBD';
                                        const isConcluded = Boolean(m.winner_id || m.status === 'finished');
                                        return (
                                            <button
                                                key={m.id}
                                                onClick={() => setSelectedMatchId(m.id)}
                                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                                                    isSelected
                                                        ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg border border-rose-400/50'
                                                        : isConcluded
                                                        ? 'bg-[#10131E] hover:bg-[#161B29] text-slate-400 border border-slate-800/80 opacity-75'
                                                        : 'bg-[#141724] hover:bg-[#1A1F30] text-slate-200 border border-slate-800'
                                                }`}
                                            >
                                                <span className="font-mono text-[10px] opacity-75">{m.match_identifier}</span>
                                                <span>{nameA} vs {nameB}</span>
                                                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/40 text-slate-300">
                                                    {m.score_a ?? 0}-{m.score_b ?? 0}
                                                </span>
                                                {m.status === 'live' && !isConcluded && (
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                                )}
                                                {isConcluded && (
                                                    <span className="text-[10px] text-emerald-400 font-mono">✓</span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. RIGHT COLUMN: LIVE ZOOM QR CARD + CURRENT STANDINGS - 4 Cols */}
                <div className="lg:col-span-4 flex flex-col justify-center space-y-6">
                    {/* A. ZOOM LIVE SPECTATOR QR CODE CARD */}
                    <div className="relative rounded-3xl bg-[#0D101A] border-2 border-[#252B40] shadow-2xl p-5 sm:p-6 overflow-hidden group">
                        {/* Soft blue stage glow */}
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                        {/* QR Card Header */}
                        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-[#1E2335]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                    <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                                        <span>Watch On Phone</span>
                                    </h3>
                                    <p className="text-[10px] text-slate-400 font-mono">Scan for Live Zoom Room</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                <Video className="w-3 h-3 text-blue-400 animate-pulse" />
                                Zoom Cast
                            </span>
                        </div>

                        {/* QR Presentation Layout */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                            {/* Scannable White QR Canvas */}
                            <div 
                                onClick={() => setIsEnlargedQr(true)}
                                className="relative bg-white p-2.5 rounded-2xl shadow-xl shrink-0 cursor-pointer group/qr transition-transform hover:scale-105"
                                title="Click to enlarge QR code for distant scanning"
                            >
                                {qrDataUrl ? (
                                    <img 
                                        src={qrDataUrl} 
                                        alt="Zoom Live QR Code" 
                                        className="w-32 h-32 rounded-xl object-contain"
                                    />
                                ) : (
                                    <div className="w-32 h-32 flex items-center justify-center bg-slate-100 rounded-xl">
                                        <QrCode className="w-10 h-10 text-slate-400 animate-pulse" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/60 rounded-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity flex items-center justify-center text-white text-[11px] font-bold">
                                    <span>Tap to Enlarge</span>
                                </div>
                            </div>

                            {/* Credentials & Quick Launch */}
                            <div className="flex-1 text-center sm:text-left lg:text-center xl:text-left space-y-2 min-w-0 w-full">
                                <div>
                                    <span className="text-[11px] font-black uppercase text-slate-200 block">
                                        Arena Mobile Stream
                                    </span>
                                    <p className="text-[10px] text-slate-400 leading-tight">
                                        Point your camera to watch live audio & video feed directly on your phone.
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-[#131724] border border-[#1E2335] text-[10px] font-mono space-y-1">
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>Meeting ID:</span>
                                        <strong className="text-white">{meetingId}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-400">
                                        <span>Passcode:</span>
                                        <strong className="text-amber-400">{meetingPasscode}</strong>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <a
                                        href={zoomUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] text-center transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Join Zoom</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={handleCopyZoom}
                                        className="p-1.5 rounded-xl bg-[#181D2E] hover:bg-[#20273D] text-slate-300 border border-slate-700 transition-colors"
                                        title="Copy Zoom Link"
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingZoom(!isEditingZoom)}
                                        className="p-1.5 rounded-xl bg-[#181D2E] hover:bg-[#20273D] text-slate-300 border border-slate-700 transition-colors"
                                        title="Edit Zoom Link"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-blue-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Coordinator Edit Panel */}
                        {isEditingZoom && (
                            <div className="mt-3.5 pt-3 border-t border-[#1E2335] space-y-2 animate-fadeIn">
                                <label className="text-[10px] text-slate-400 uppercase font-mono block">
                                    Update Arena Zoom URL:
                                </label>
                                <input
                                    type="url"
                                    value={zoomUrl}
                                    onChange={(e) => setZoomUrl(e.target.value)}
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-3 py-1.5 bg-[#141724] text-xs text-white rounded-xl border border-slate-700 font-mono focus:outline-none focus:border-blue-500"
                                />
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <input
                                        type="text"
                                        value={meetingId}
                                        onChange={(e) => setMeetingId(e.target.value)}
                                        placeholder="Meeting ID"
                                        className="px-2.5 py-1 bg-[#141724] text-[11px] text-white rounded-lg border border-slate-700 font-mono"
                                    />
                                    <input
                                        type="text"
                                        value={meetingPasscode}
                                        onChange={(e) => setMeetingPasscode(e.target.value)}
                                        placeholder="Passcode"
                                        className="px-2.5 py-1 bg-[#141724] text-[11px] text-white rounded-lg border border-slate-700 font-mono"
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] pt-1">
                                    <span className="text-slate-500 font-mono">QR code updates in real-time</span>
                                    <button
                                        type="button"
                                        onClick={handleSaveArenaZoom}
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] shadow-sm transition-all"
                                    >
                                        Save & Sync
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* B. CURRENT STANDINGS (DIVISION LEADERBOARD) */}
                    <div className="rounded-3xl bg-[#0D101A] border-2 border-[#252B40] shadow-2xl p-5 sm:p-6">
                        <div className="flex items-center justify-between pb-3.5 mb-3.5 border-b border-[#1E2335]">
                            <div className="flex items-center gap-2.5">
                                <Trophy className="w-5 h-5 text-amber-400" />
                                <h3 className="text-sm font-black text-white uppercase tracking-wider">
                                    Current Standings
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400 bg-[#161B2B] px-2.5 py-1 rounded-lg border border-slate-800 uppercase">
                                Season Rank
                            </span>
                        </div>

                        {/* Standings List */}
                        <div className="space-y-2.5">
                            {divisions.map((div, index) => {
                                const rank = index + 1;
                                const color = div.color_hex || '#B784A7';
                                const points = div.total_accumulated_points ?? 0;

                                return (
                                    <div 
                                        key={div.id}
                                        className="flex items-center justify-between p-3 rounded-2xl bg-[#121624] border border-[#20263B] shadow-md transition-all"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {/* Rank Medal */}
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-[11px] shrink-0 ${
                                                rank === 1
                                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-md shadow-amber-900/40'
                                                    : rank === 2
                                                    ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950'
                                                    : rank === 3
                                                    ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100'
                                                    : 'bg-[#181D2E] text-slate-400'
                                            }`}>
                                                #{rank}
                                            </div>

                                            {/* Division Badge & Name */}
                                            <div 
                                                className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black text-slate-950 shadow-sm shrink-0 overflow-hidden p-0.5 border"
                                                style={{ backgroundColor: color + '22', borderColor: color }}
                                            >
                                                {div.logo_path ? (
                                                    <img src={div.logo_path} alt={div.name} className="w-full h-full object-contain" />
                                                ) : (
                                                    <span style={{ color: color }}>{div.name.charAt(0)}</span>
                                                )}
                                            </div>

                                            <div className="min-w-0">
                                                <h4 className="font-black text-white text-xs truncate">
                                                    {div.name} Division
                                                </h4>
                                                <p className="text-[9px] font-mono text-slate-500">
                                                    Rank #{rank} Faction
                                                </p>
                                            </div>
                                        </div>

                                        {/* Points Badge */}
                                        <div className="text-right shrink-0">
                                            <div className="font-mono font-black text-xs text-amber-400">
                                                {points} PTS
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Points Scheme Footnote */}
                        <div className="mt-4 pt-2.5 border-t border-[#1C2030] text-[9px] font-mono text-slate-500 flex items-center justify-between">
                            <span>1st (+25) · 2nd (+20)</span>
                            <span>3rd (+15) · 4th (+10)</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ENLARGED QR CODE MODAL FOR FAR AUDIENCE & STADIUM TV */}
            {isEnlargedQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-sm bg-[#0D101A] border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl">
                        <button
                            onClick={() => setIsEnlargedQr(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-center gap-2 mb-2 text-blue-400 font-mono text-xs font-bold uppercase">
                            <Video className="w-4 h-4" />
                            <span>Zoom Arena Stream</span>
                        </div>
                        <h3 className="text-xl font-black text-white uppercase mb-1">
                            Scan to Watch Live
                        </h3>
                        <p className="text-xs text-slate-400 mb-5">
                            Open phone camera · Instant access to live broadcast
                        </p>

                        <div className="inline-block bg-white p-4 rounded-3xl shadow-2xl mb-4">
                            <img src={qrDataUrl} alt="Zoom QR Code" className="w-56 h-56 rounded-2xl object-contain mx-auto" />
                        </div>

                        <div className="p-3 rounded-2xl bg-[#141724] border border-slate-800 text-xs font-mono space-y-1 mb-5">
                            <p className="text-slate-400">Meeting ID: <strong className="text-white">{meetingId}</strong></p>
                            <p className="text-slate-400">Passcode: <strong className="text-amber-400">{meetingPasscode}</strong></p>
                        </div>

                        <button
                            type="button"
                            onClick={() => setIsEnlargedQr(false)}
                            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase transition-colors cursor-pointer"
                        >
                            Close View
                        </button>
                    </div>
                </div>
            )}

            {/* Arena Bottom Broadcast Ticker */}
            <footer className="h-10 px-6 bg-[#090B12] border-t border-[#181C2B] flex items-center justify-between text-xs text-slate-400 font-mono shrink-0">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-slate-300 font-bold uppercase">Arena Stage Active</span>
                    <span className="text-slate-600">|</span>
                    <span className="text-slate-400">PalayOffs Official Matchup Display</span>
                </div>
                <div className="hidden sm:flex items-center gap-4 text-[11px] text-slate-500">
                    <span>Scan QR code with phone camera to join Zoom live commentary</span>
                </div>
            </footer>
        </div>
    );
}
