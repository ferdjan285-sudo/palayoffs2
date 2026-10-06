import React, { useState, useEffect } from 'react';
import { Swords, Sparkles } from 'lucide-react';

export default function SwordsClashIntro({ onComplete }) {
    const [phase, setPhase] = useState('active'); // 'active' | 'dissolve' | 'done'

    useEffect(() => {
        // Snappy 0.8s Total Timeline:
        // 0.0s - 0.25s: Fast snappy sword strike and impact spark
        // 0.25s - 0.55s: Clean clash hold
        // 0.55s - 0.85s: Quick smooth dissolve
        // 0.85s+: Unmount
        const dissolveTimer = setTimeout(() => {
            setPhase('dissolve');
        }, 550);

        const doneTimer = setTimeout(() => {
            setPhase('done');
            if (onComplete) onComplete();
        }, 850);

        return () => {
            clearTimeout(dissolveTimer);
            clearTimeout(doneTimer);
        };
    }, [onComplete]);

    if (phase === 'done') return null;

    return (
        <div 
            onClick={() => {
                setPhase('done');
                if (onComplete) onComplete();
            }}
            className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-md transition-opacity duration-300 pointer-events-none select-none ${
                phase === 'dissolve' ? 'opacity-0' : 'opacity-100'
            }`}
        >
            <div className="relative flex flex-col items-center justify-center scale-90 sm:scale-100">
                {/* Clash Shockwave Flash */}
                <div className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-amber-400/30 blur-xl animate-clash-shockwave pointer-events-none" />
                <div className="absolute w-12 h-12 rounded-full bg-white animate-clash-spark pointer-events-none" />

                {/* Minimalist Dual Crossed Blades Icon & Strike Effect */}
                <div className="relative z-10 flex items-center justify-center mb-2">
                    {/* Left Sword */}
                    <div className="animate-sword-left text-rose-500 filter drop-shadow-[0_0_12px_rgba(244,63,94,0.8)]">
                        <Swords className="w-16 h-16 sm:w-20 sm:h-20" />
                    </div>
                </div>

                {/* Snappy Clean Title (Minimal, No clutter) */}
                <div className="relative z-10 text-center animate-emblem-reveal">
                    <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-1.5 drop-shadow-md">
                        <span>PALAY</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">OFFS</span>
                    </h2>
                    <span className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase block mt-0.5">
                        MLBB 2026
                    </span>
                </div>
            </div>
        </div>
    );
}
