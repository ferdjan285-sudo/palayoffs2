import React, { useState, useEffect } from 'react';
import { Swords, Flame, Sparkles } from 'lucide-react';

export default function SwordsClashIntro({ onComplete }) {
    const [phase, setPhase] = useState('active'); // 'active' | 'dissolve' | 'done'

    useEffect(() => {
        // Satisfying 2.4s esports crossed blades animation:
        // 0.0s - 0.5s: dramatic dual blade strike impact & shockwave flash
        // 0.5s - 1.9s: holding sparks, glow aura & title reveal
        // 1.9s - 2.4s: smooth dissolve transition
        // 2.4s+: unmount
        const dissolveTimer = setTimeout(() => {
            setPhase('dissolve');
        }, 1900);

        const doneTimer = setTimeout(() => {
            setPhase('done');
            if (onComplete) onComplete();
        }, 2400);

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
            className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center bg-[#07090E] transition-opacity duration-500 pointer-events-auto select-none touch-none overflow-hidden"
            style={{ opacity: phase === 'dissolve' ? 0 : 1 }}
        >
            {/* Inline Self-Contained Keyframe Styles (Zero external dependencies) */}
            <style>{`
                @keyframes clashImpactPulse {
                    0% { transform: scale(0.2); opacity: 0; }
                    40% { transform: scale(1.4); opacity: 1; filter: drop-shadow(0 0 35px #f43f5e); }
                    60% { transform: scale(0.95); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes sparkFlash {
                    0% { transform: scale(0); opacity: 0; }
                    30% { transform: scale(2.2); opacity: 1; }
                    100% { transform: scale(3.5); opacity: 0; }
                }
                
                @keyframes titleRise {
                    0% { transform: translateY(16px); opacity: 0; }
                    40% { transform: translateY(16px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div className="relative flex flex-col items-center justify-center p-6 text-center max-w-sm mx-auto">


                {/* 2. Central Spark Explosion Glow */}
                <div 
                    className="absolute w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-400 to-rose-500 blur-2xl pointer-events-none opacity-80"
                    style={{ animation: 'sparkFlash 0.8s ease-out forwards' }}
                />

                {/* 3. Epic Crossed Blades Icon */}
                <div 
                    className="relative z-10 flex items-center justify-center mb-3"
                    style={{ animation: 'clashImpactPulse 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 p-1 shadow-2xl flex items-center justify-center">
                        <div className="w-full h-full rounded-[22px] bg-[#0B0E17] flex items-center justify-center">
                            <Swords className="w-10 h-10 sm:w-12 sm:h-12 text-rose-500 filter drop-shadow-[0_0_15px_rgba(244,63,94,0.9)]" />
                        </div>
                    </div>
                </div>

                {/* 4. Official Tournament Logo & Badge */}
                <div 
                    className="relative z-10 space-y-1.5"
                    style={{ animation: 'titleRise 0.7s ease-out forwards' }}
                >
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-wider text-white flex items-center justify-center gap-1.5 drop-shadow-lg">
                        <span>PALAY</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">OFFS</span>
                    </h1>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10px] sm:text-xs font-mono font-bold tracking-widest text-slate-300 uppercase">
                        <Flame className="w-3 h-3 text-rose-500" />
                        <span>MLBB PalayOffs Cup 2026</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
