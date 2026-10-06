import React, { useState, useEffect } from 'react';
import { Swords, Flame } from 'lucide-react';

export default function SwordsClashIntro({ onComplete }) {
    const [phase, setPhase] = useState('active'); // 'active' | 'dissolve' | 'done'

    useEffect(() => {
        // Lessened by 0.4s: 2.0s total duration (dissolve at 1.5s, done at 2.0s)
        const dissolveTimer = setTimeout(() => {
            setPhase('dissolve');
        }, 1500);

        const doneTimer = setTimeout(() => {
            setPhase('done');
            if (onComplete) onComplete();
        }, 2000);

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
            className="fixed inset-0 z-[999999] w-screen h-screen min-h-[100dvh] flex items-center justify-center bg-[#07090E] transition-opacity duration-400 pointer-events-auto select-none touch-none overflow-hidden"
            style={{ opacity: phase === 'dissolve' ? 0 : 1 }}
        >
            <style>{`
                @keyframes clashImpactPulse {
                    0% { transform: scale(0.3); opacity: 0; }
                    50% { transform: scale(1.15); opacity: 1; }
                    100% { transform: scale(1); opacity: 1; }
                }
                @keyframes titleRise {
                    0% { transform: translateY(12px); opacity: 0; }
                    40% { transform: translateY(12px); opacity: 0; }
                    100% { transform: translateY(0); opacity: 1; }
                }
            `}</style>

            <div className="relative flex flex-col items-center justify-center p-4 text-center max-w-md mx-auto">
                {/* 1. Epic Crossed Blades Icon - clean without card container */}
                <div 
                    className="relative z-10 flex items-center justify-center mb-3 text-rose-500"
                    style={{ animation: 'clashImpactPulse 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}
                >
                    <Swords className="w-12 h-12 sm:w-14 sm:h-14 text-rose-500" />
                </div>

                {/* 2. MLBB PALAYOFFS CUP 2026 - Clean bold typography without circular outline card */}
                <div 
                    className="relative z-10 space-y-1"
                    style={{ animation: 'titleRise 0.6s ease-out forwards' }}
                >
                    <h1 className="text-2xl sm:text-4xl font-black uppercase tracking-wider text-white flex items-center justify-center gap-2">
                        <span>PALAY</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-400">OFFS</span>
                    </h1>
                    <p className="text-xs sm:text-sm font-black tracking-widest text-slate-300 uppercase font-mono">
                        MLBB PalayOffs Cup 2026
                    </p>
                </div>
            </div>
        </div>
    );
}

