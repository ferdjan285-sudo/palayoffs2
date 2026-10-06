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
    ExternalLink,
    Sun,
    Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import DivisionLeaderboard from '../components/DivisionLeaderboard';
import api from '../services/api';

export default function ArenaDisplay({ landingData, onExit, onRefresh }) {
    const { isDark, toggleTheme } = useTheme();
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
        <div className="fixed inset-0 z-50 bg-slate-100 dark:bg-[#07090E] text-slate-900 dark:text-slate-100 flex flex-col overflow-hidden select-none animate-fadeIn transition-colors duration-200">
            {/* Arena Top Navigation Header */}
            <header className="min-h-16 sm:h-20 px-3.5 sm:px-6 md:px-10 bg-white/95 dark:bg-[#0C0E17]/95 border-b border-slate-200 dark:border-[#1E2335] flex items-center justify-between gap-3 sm:gap-6 backdrop-blur-2xl shrink-0 z-20 transition-colors duration-200">
                {/* Left: Branding & Broadcast Feed Indicator */}
                <div className="flex items-center gap-2.5 sm:gap-4 min-w-0">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-rose-950/20 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                            <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white tracking-wider uppercase leading-none truncate">
                                Palay<span className="text-rose-500">Offs</span>
                            </h1>
                            <span className="px-2 sm:px-3 py-0.5 rounded-full bg-rose-600 text-white text-[9px] sm:text-[11px] font-black uppercase tracking-widest flex items-center gap-1 shadow-sm shrink-0 animate-pulse">
                                <Radio className="w-3 h-3" />
                                Arena Display
                            </span>
                        </div>
                        <p className="hidden sm:block text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide mt-0.5 truncate">
                            MLBB PalayOffs Cup 2026 · Live Stage Feed
                        </p>
                    </div>
                </div>

                {/* Center: Stage Clock & Event Badge */}
                <div className="hidden lg:flex items-center gap-5 bg-slate-50 dark:bg-[#131724] px-5 py-2 rounded-2xl border border-slate-200 dark:border-[#212638] shadow-inner transition-colors duration-200">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-600 dark:text-slate-300">
                        <Clock className="w-4 h-4 text-rose-500" />
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                    </div>
                    <div className="h-4 w-px bg-slate-300 dark:bg-slate-700" />
                    <div className="flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 font-black uppercase tracking-wider">
                        <Trophy className="w-4 h-4" />
                        <span>Live Arena Matchup & Standings</span>
                    </div>
                </div>

                {/* Right: Theme Toggle, Fullscreen & Exit Presentation Controls */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                    {/* Theme Toggle Button */}
                    <button
                        onClick={toggleTheme}
                        className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141724] dark:hover:bg-[#1A1F30] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    >
                        {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
                        <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'}</span>
                    </button>

                    {/* TV Fullscreen Button */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 sm:px-3.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#141724] dark:hover:bg-[#1A1F30] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 transition-all shadow-sm active:scale-95 cursor-pointer flex items-center gap-1.5"
                        title="Toggle TV Fullscreen Mode"
                    >
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                        <span className="hidden md:inline">{isFullscreen ? 'Windowed' : 'TV Fullscreen'}</span>
                    </button>

                    {/* Exit Presentation */}
                    <button
                        onClick={onExit}
                        className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition-all shadow-md shadow-rose-950/30 active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
                        title="Exit Arena View"
                    >
                        <X className="w-4 h-4" />
                        <span className="hidden sm:inline">Exit Presentation</span>
                        <span className="sm:hidden">Exit</span>
                    </button>
                </div>
            </header>

            {/* ARENA STAGE BODY: ONLY 2 THINGS ON SCREEN:
                1. Matchup Display (e.g. Mauve vs Mint)
                2. Current Standing (Division Leaderboard & Mobile Stream QR)
            */}
            <main className="flex-1 p-3.5 sm:p-6 md:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start lg:items-center overflow-y-auto w-full">
                {/* 1. MATCHUP DISPLAY (MAUVE VS MINT) - 8 Cols on desktop */}
                <div className="lg:col-span-8 flex flex-col justify-center space-y-4 sm:space-y-6 w-full">
                    {/* Matchup Card */}
                    <div className="relative rounded-3xl bg-white dark:bg-[#0D101A] border border-slate-200 dark:border-[#252B40] shadow-xl dark:shadow-2xl overflow-hidden p-4 sm:p-6 md:p-8 transition-colors duration-200">
                        {/* Dynamic Background Glows */}
                        <div 
                            className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-15 dark:opacity-25 pointer-events-none transition-all duration-700"
                            style={{ backgroundColor: colorA }}
                        />
                        <div 
                            className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-15 dark:opacity-25 pointer-events-none transition-all duration-700"
                            style={{ backgroundColor: colorB }}
                        />

                        {/* Top Match Header: Stage Pill, Identifier, Live Status */}
                        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-slate-200 dark:border-[#1F2538]">
                            <div className="flex items-center gap-2.5 sm:gap-3">
                                <span className="px-2.5 sm:px-3 py-1 rounded-xl bg-slate-100 dark:bg-[#171B2B] text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-mono font-bold uppercase">
                                    Stage {activeMatch.match_identifier || 'UB1'}
                                </span>
                                <div>
                                    <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-wide uppercase">
                                        {getStageName(activeMatch.match_identifier)}
                                    </h2>
                                    <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-mono">
                                        Format: Best of {activeMatch.best_of || 3} (First to {Math.ceil((activeMatch.best_of || 3) / 2)} wins) · MLBB 5v5 Arena Match
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm ${
                                    activeMatch.status === 'live'
                                        ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-300 border border-rose-500/40 animate-pulse'
                                        : activeMatch.status === 'finished'
                                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                        : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/30'
                                }`}>
                                    <span className="w-2 h-2 rounded-full bg-rose-500" />
                                    {activeMatch.status === 'live' ? 'Live On Stage' : activeMatch.status}
                                </span>
                            </div>
                        </div>

                        {/* Center Stage: Team A vs Team B Head-to-Head */}
                        <div className="relative z-10 grid grid-cols-1 md:grid-cols-11 gap-4 sm:gap-6 items-center">
                            {/* Team A (e.g. Mauve) */}
                            <div className="md:col-span-4 flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#121524]/90 border border-slate-200 dark:border-[#22283D] shadow-md dark:shadow-xl transition-all">
                                <div 
                                    className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-slate-950 shadow-lg mb-3 sm:mb-4 transition-transform hover:scale-105 overflow-hidden p-2"
                                    style={{ 
                                        backgroundColor: colorA + '22',
                                        borderColor: colorA,
                                        borderWidth: '2px',
                                        boxShadow: `0 0 30px ${colorA}44`
                                    }}
                                >
                                    {divA?.logo_path ? (
                                        <img 
                                            src={divA.logo_path} 
                                            alt={divA.name}
                                            className="w-full h-full object-contain filter drop-shadow-md"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-950"
                                        style={{ 
                                            backgroundColor: colorA,
                                            display: divA?.logo_path ? 'none' : 'flex'
                                        }}
                                    >
                                        {divA?.name ? divA.name.charAt(0) : '?'}
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-wide uppercase truncate max-w-full">
                                    {divA?.name || 'TBD Seed A'}
                                </h3>
                                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
                                    Division Faction
                                </p>

                                <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 rounded-xl bg-white dark:bg-[#090C14] border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm">
                                    <span className="text-slate-400 dark:text-slate-500">Standings:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{divA?.total_accumulated_points ?? 0} PTS</span>
                                </div>

                                {/* Score Display */}
                                <div className="mt-4 sm:mt-6 font-mono font-black text-5xl sm:text-6xl md:text-7xl text-slate-900 dark:text-white">
                                    {activeMatch.score_a ?? 0}
                                </div>
                            </div>

                            {/* Versus Emblem */}
                            <div className="md:col-span-3 flex flex-col items-center justify-center py-2 sm:py-4">
                                <div className="relative w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white dark:bg-[#181D2E] border-2 border-rose-500/50 flex items-center justify-center shadow-lg dark:shadow-2xl">
                                    <Swords className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 animate-pulse" />
                                    <span className="absolute -bottom-2.5 px-2 sm:px-2.5 py-0.5 rounded-full bg-rose-600 text-white font-mono font-black text-[9px] sm:text-[10px] uppercase tracking-wider border border-white/20">
                                        VS
                                    </span>
                                </div>

                                <span className="text-[11px] sm:text-xs font-mono font-bold text-slate-500 dark:text-slate-400 mt-4 sm:mt-5 uppercase tracking-widest">
                                    Live Clash
                                </span>
                            </div>

                            {/* Team B (e.g. Mint) */}
                            <div className="md:col-span-4 flex flex-col items-center text-center p-4 sm:p-6 rounded-2xl bg-slate-50 dark:bg-[#121524]/90 border border-slate-200 dark:border-[#22283D] shadow-md dark:shadow-xl transition-all">
                                <div 
                                    className="relative w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-2xl sm:rounded-3xl flex items-center justify-center font-black text-3xl sm:text-4xl text-slate-950 shadow-lg mb-3 sm:mb-4 transition-transform hover:scale-105 overflow-hidden p-2"
                                    style={{ 
                                        backgroundColor: colorB + '22',
                                        borderColor: colorB,
                                        borderWidth: '2px',
                                        boxShadow: `0 0 30px ${colorB}44`
                                    }}
                                >
                                    {divB?.logo_path ? (
                                        <img 
                                            src={divB.logo_path} 
                                            alt={divB.name}
                                            className="w-full h-full object-contain filter drop-shadow-md"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                    ) : null}
                                    <div 
                                        className="w-full h-full rounded-xl sm:rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl text-slate-950"
                                        style={{ 
                                            backgroundColor: colorB,
                                            display: divB?.logo_path ? 'none' : 'flex'
                                        }}
                                    >
                                        {divB?.name ? divB.name.charAt(0) : '?'}
                                    </div>
                                </div>

                                <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-wide uppercase truncate max-w-full">
                                    {divB?.name || 'TBD Seed B'}
                                </h3>
                                <p className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-slate-500 dark:text-slate-400 mt-0.5">
                                    Division Faction
                                </p>

                                <div className="mt-3 sm:mt-4 px-3 sm:px-4 py-1.5 rounded-xl bg-white dark:bg-[#090C14] border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs font-mono text-slate-700 dark:text-slate-300 flex items-center gap-2 shadow-sm">
                                    <span className="text-slate-400 dark:text-slate-500">Standings:</span>
                                    <span className="font-bold text-slate-900 dark:text-white">{divB?.total_accumulated_points ?? 0} PTS</span>
                                </div>

                                {/* Score Display */}
                                <div className="mt-4 sm:mt-6 font-mono font-black text-5xl sm:text-6xl md:text-7xl text-slate-900 dark:text-white">
                                    {activeMatch.score_b ?? 0}
                                </div>
                            </div>
                        </div>

                        {/* MODERN ARENA STAGE MATCHUP SELECTOR */}
                        {sortedMatches.length > 1 && (
                            <div className="relative z-10 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-slate-200 dark:border-[#1F2538] space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                        <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-[11px] sm:text-xs">
                                            Select Arena Stage Matchup
                                        </span>
                                    </div>
                                    <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-white/[0.04] px-2 py-0.5 rounded-md border border-slate-200 dark:border-white/[0.05]">
                                        {sortedMatches.length} Fixtures
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                                    {sortedMatches.map((m) => {
                                        const isSelected = m.id === activeMatch.id;
                                        const divAItem = m.division_a || m.divisionA;
                                        const divBItem = m.division_b || m.divisionB;
                                        const nameA = divAItem?.name || 'TBD';
                                        const nameB = divBItem?.name || 'TBD';
                                        const colorItemA = divAItem?.color_hex || '#B784A7';
                                        const colorItemB = divBItem?.color_hex || '#98FF98';
                                        const isConcluded = Boolean(m.winner_id || m.status === 'finished');
                                        const isLive = m.status === 'live' && !isConcluded;

                                        return (
                                            <button
                                                key={m.id}
                                                type="button"
                                                onClick={() => setSelectedMatchId(m.id)}
                                                className={`p-2.5 sm:p-3 rounded-2xl text-left transition-all duration-200 flex flex-col justify-between relative cursor-pointer group ${
                                                    isSelected
                                                        ? 'bg-rose-500/10 dark:bg-rose-950/40 border-2 border-rose-500 ring-2 ring-rose-500/20 shadow-md'
                                                        : isConcluded
                                                        ? 'bg-slate-50/80 dark:bg-white/[0.02] border border-slate-200/80 dark:border-white/[0.04] hover:border-slate-300 dark:hover:border-white/[0.1] opacity-80'
                                                        : 'bg-white dark:bg-[#141824] border border-slate-200 dark:border-white/[0.06] hover:border-rose-400 dark:hover:border-rose-500/50 shadow-xs'
                                                }`}
                                            >
                                                {/* Header: Identifier + Status Tag */}
                                                <div className="flex items-center justify-between gap-1 mb-2">
                                                    <span className={`px-1.5 py-0.5 rounded-md font-mono text-[10px] font-black uppercase ${
                                                        isSelected
                                                            ? 'bg-rose-600 text-white shadow-xs'
                                                            : 'bg-slate-100 dark:bg-white/[0.06] text-slate-700 dark:text-slate-300'
                                                    }`}>
                                                        {m.match_identifier}
                                                    </span>

                                                    {isSelected ? (
                                                        <span className="text-[9px] font-black uppercase tracking-wider text-rose-600 dark:text-rose-400 font-mono flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                                                            On Stage
                                                        </span>
                                                    ) : isLive ? (
                                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                                                            Live
                                                        </span>
                                                    ) : isConcluded ? (
                                                        <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                                                            ✓ Done
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] font-mono text-slate-400">
                                                            Ready
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Matchup Teams Row */}
                                                <div className="space-y-1 my-1">
                                                    <div className="flex items-center justify-between gap-1.5 text-xs">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorItemA }} />
                                                            <span className={`truncate text-[11px] font-extrabold ${
                                                                m.winner_id === divAItem?.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                                                            }`}>
                                                                {nameA}
                                                            </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                                                            {m.score_a ?? 0}
                                                        </span>
                                                    </div>

                                                    <div className="flex items-center justify-between gap-1.5 text-xs">
                                                        <div className="flex items-center gap-1.5 min-w-0">
                                                            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colorItemB }} />
                                                            <span className={`truncate text-[11px] font-extrabold ${
                                                                m.winner_id === divBItem?.id ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-200'
                                                            }`}>
                                                                {nameB}
                                                            </span>
                                                        </div>
                                                        <span className="font-mono text-xs font-black text-slate-900 dark:text-white shrink-0">
                                                            {m.score_b ?? 0}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Footer Stage Name */}
                                                <div className="mt-1 pt-1.5 border-t border-slate-100 dark:border-white/[0.04] text-[9px] font-mono text-slate-400 truncate">
                                                    {getStageName(m.match_identifier)}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* 2. RIGHT COLUMN: LIVE ZOOM QR CARD + CURRENT STANDINGS - 4 Cols on desktop */}
                <div className="lg:col-span-4 flex flex-col justify-center space-y-4 sm:space-y-6 w-full">
                    {/* A. ZOOM LIVE SPECTATOR QR CODE CARD */}
                    <div className="relative rounded-3xl bg-white dark:bg-[#0D101A] border border-slate-200 dark:border-[#252B40] shadow-xl dark:shadow-2xl p-4 sm:p-6 overflow-hidden group transition-colors duration-200">
                        {/* Soft blue stage glow */}
                        <div className="absolute -top-16 -right-16 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

                        {/* QR Card Header */}
                        <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-slate-200 dark:border-[#1E2335]">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-blue-500/10 dark:bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                    <Smartphone className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                                        <span>Watch On Phone</span>
                                    </h3>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">Scan for Live Zoom Room</p>
                                </div>
                            </div>
                            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300 border border-blue-500/30 font-mono text-[10px] font-bold uppercase flex items-center gap-1.5 shadow-sm">
                                <Video className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse" />
                                Zoom Cast
                            </span>
                        </div>

                        {/* QR Presentation Layout */}
                        <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-center gap-4">
                            {/* Scannable White QR Canvas */}
                            <div 
                                onClick={() => setIsEnlargedQr(true)}
                                className="relative bg-white p-2.5 rounded-2xl shadow-md border border-slate-200 dark:border-transparent shrink-0 cursor-pointer group/qr transition-transform hover:scale-105"
                                title="Click to enlarge QR code for distant scanning"
                            >
                                {qrDataUrl ? (
                                    <img 
                                        src={qrDataUrl} 
                                        alt="Zoom Live QR Code" 
                                        className="w-28 h-28 sm:w-32 sm:h-32 rounded-xl object-contain"
                                    />
                                ) : (
                                    <div className="w-28 h-28 sm:w-32 sm:h-32 flex items-center justify-center bg-slate-100 rounded-xl">
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
                                    <span className="text-[11px] font-black uppercase text-slate-800 dark:text-slate-200 block">
                                        Arena Mobile Stream
                                    </span>
                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                        Point camera to join audio & video livestream directly on your phone.
                                    </p>
                                </div>

                                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#131724] border border-slate-200 dark:border-[#1E2335] text-[10px] font-mono space-y-1">
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                        <span>Meeting ID:</span>
                                        <strong className="text-slate-900 dark:text-white font-bold">{meetingId}</strong>
                                    </div>
                                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                                        <span>Passcode:</span>
                                        <strong className="text-amber-600 dark:text-amber-400 font-bold">{meetingPasscode}</strong>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1.5 pt-0.5">
                                    <a
                                        href={zoomUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-1.5 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[10px] text-center transition-all flex items-center justify-center gap-1 shadow-sm active:scale-95 cursor-pointer"
                                    >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>Join Zoom</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={handleCopyZoom}
                                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#181D2E] dark:hover:bg-[#20273D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                                        title="Copy Zoom Link"
                                    >
                                        {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setIsEditingZoom(!isEditingZoom)}
                                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-[#181D2E] dark:hover:bg-[#20273D] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                                        title="Edit Zoom Link"
                                    >
                                        <Edit2 className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Coordinator Edit Panel */}
                        {isEditingZoom && (
                            <div className="mt-3.5 pt-3 border-t border-slate-200 dark:border-[#1E2335] space-y-2 animate-fadeIn">
                                <label className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-mono block">
                                    Update Arena Zoom URL:
                                </label>
                                <input
                                    type="url"
                                    value={zoomUrl}
                                    onChange={(e) => setZoomUrl(e.target.value)}
                                    placeholder="https://zoom.us/j/..."
                                    className="w-full px-3 py-1.5 bg-slate-50 dark:bg-[#141724] text-xs text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 font-mono focus:outline-none focus:border-blue-500"
                                />
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <input
                                        type="text"
                                        value={meetingId}
                                        onChange={(e) => setMeetingId(e.target.value)}
                                        placeholder="Meeting ID"
                                        className="px-2.5 py-1 bg-slate-50 dark:bg-[#141724] text-[11px] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
                                    />
                                    <input
                                        type="text"
                                        value={meetingPasscode}
                                        onChange={(e) => setMeetingPasscode(e.target.value)}
                                        placeholder="Passcode"
                                        className="px-2.5 py-1 bg-slate-50 dark:bg-[#141724] text-[11px] text-slate-900 dark:text-white rounded-lg border border-slate-300 dark:border-slate-700 font-mono"
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] pt-1">
                                    <span className="text-slate-500 font-mono">QR code updates instantly</span>
                                    <button
                                        type="button"
                                        onClick={handleSaveArenaZoom}
                                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-[10px] shadow-sm transition-all cursor-pointer"
                                    >
                                        Save & Sync
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* B. CURRENT STANDINGS (DIVISION LEADERBOARD) */}
                    <div className="rounded-3xl bg-white dark:bg-[#0D101A] border border-slate-200 dark:border-[#252B40] shadow-xl dark:shadow-2xl p-4 sm:p-6 transition-colors duration-200">
                        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200 dark:border-[#1E2335]">
                            <div className="flex items-center gap-2.5">
                                <Trophy className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider">
                                    Current Standings
                                </h3>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-[#161B2B] px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 uppercase">
                                Season Rank
                            </span>
                        </div>

                        {/* Standings List */}
                        <div className="space-y-2">
                            {divisions.map((div, index) => {
                                const rank = index + 1;
                                const color = div.color_hex || '#B784A7';
                                const points = div.total_accumulated_points ?? 0;
                                const isCyan = div.name?.toLowerCase().includes('cyan');

                                return (
                                    <React.Fragment key={div.id}>
                                        {isCyan && (
                                            <div className="relative overflow-hidden rounded-2xl p-3 bg-gradient-to-b from-cyan-500/10 via-cyan-500/[0.04] to-transparent dark:from-cyan-950/40 dark:via-cyan-900/15 dark:to-transparent border border-cyan-400/30 dark:border-cyan-400/20 text-center flex flex-col items-center justify-center my-1 group">
                                                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500/20 via-yellow-400/25 to-cyan-400/20 border border-amber-400/40 flex items-center justify-center shadow-md mb-1.5">
                                                    <Trophy className="w-6 h-6 text-amber-500 dark:text-yellow-300 fill-amber-400/40" />
                                                </div>
                                                <h5 className="text-[11px] font-black uppercase text-slate-900 dark:text-white tracking-tight">
                                                    MLBB PalayOffs Cup 2026
                                                </h5>
                                                <p className="text-[9px] font-mono font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider">
                                                    Championship Cup
                                                </p>
                                            </div>
                                        )}
                                        <div 
                                            className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl bg-slate-50 dark:bg-[#121624] border border-slate-200 dark:border-[#20263B] shadow-sm transition-all"
                                        >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            {/* Rank Medal */}
                                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-black text-[11px] shrink-0 ${
                                                rank === 1
                                                    ? 'bg-gradient-to-br from-amber-400 to-yellow-600 text-slate-950 shadow-md shadow-amber-900/30'
                                                    : rank === 2
                                                    ? 'bg-gradient-to-br from-slate-200 to-slate-400 text-slate-950'
                                                    : rank === 3
                                                    ? 'bg-gradient-to-br from-amber-700 to-amber-900 text-amber-100'
                                                    : 'bg-slate-200 dark:bg-[#181D2E] text-slate-700 dark:text-slate-400'
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
                                                <h4 className="font-black text-slate-900 dark:text-white text-xs truncate">
                                                    {div.name} Division
                                                </h4>
                                                <p className="text-[9px] font-mono text-slate-500">
                                                    Rank #{rank} Faction
                                                </p>
                                            </div>
                                        </div>

                                        {/* Points Badge */}
                                        <div className="text-right shrink-0">
                                            <div className="font-mono font-black text-xs text-amber-600 dark:text-amber-400">
                                                {points} PTS
                                            </div>
                                        </div>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                        </div>

                        {/* Points Scheme Footnote */}
                        <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-[#1C2030] text-[9px] font-mono text-slate-500 flex items-center justify-between">
                            <span>1st (+25) · 2nd (+20)</span>
                            <span>3rd (+15) · 4th (+10)</span>
                        </div>
                    </div>
                </div>
            </main>

            {/* ENLARGED QR CODE MODAL FOR FAR AUDIENCE & STADIUM TV */}
            {isEnlargedQr && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
                    <div className="relative w-full max-w-sm bg-white dark:bg-[#0D101A] border-2 border-blue-500/50 rounded-3xl p-6 sm:p-8 text-center shadow-2xl transition-colors duration-200">
                        <button
                            onClick={() => setIsEnlargedQr(false)}
                            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center justify-center gap-2 mb-2 text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase">
                            <Video className="w-4 h-4" />
                            <span>Zoom Arena Stream</span>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase mb-1">
                            Scan to Watch Live
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-5">
                            Open phone camera · Instant access to live broadcast
                        </p>

                        <div className="inline-block bg-white p-4 rounded-3xl shadow-xl border border-slate-200 dark:border-transparent mb-4">
                            <img src={qrDataUrl} alt="Zoom QR Code" className="w-48 sm:w-56 h-48 sm:h-56 rounded-2xl object-contain mx-auto" />
                        </div>

                        <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#141724] border border-slate-200 dark:border-slate-800 text-xs font-mono space-y-1 mb-5">
                            <p className="text-slate-500 dark:text-slate-400">Meeting ID: <strong className="text-slate-900 dark:text-white">{meetingId}</strong></p>
                            <p className="text-slate-500 dark:text-slate-400">Passcode: <strong className="text-amber-600 dark:text-amber-400">{meetingPasscode}</strong></p>
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
            <footer className="h-9 sm:h-10 px-4 sm:px-6 bg-slate-200/90 dark:bg-[#090B12] border-t border-slate-300 dark:border-[#181C2B] flex items-center justify-between text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-mono shrink-0 transition-colors duration-200">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-slate-800 dark:text-slate-300 font-bold uppercase">Arena Stage Active</span>
                    <span className="text-slate-400 dark:text-slate-600">|</span>
                    <span className="text-slate-600 dark:text-slate-400 hidden sm:inline">PalayOffs Official Matchup Display</span>
                </div>
                <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-500">
                    <span>Scan QR code with phone camera to join Zoom live commentary</span>
                </div>
            </footer>
        </div>
    );
}

