import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function ParallaxStoryBackdrop() {
  const containerRef = useRef(null);
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const layer3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Parallax Layer 1: Slow subtle background drift
      if (layer1Ref.current) {
        gsap.to(layer1Ref.current, {
          y: -140,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.2,
          },
        });
      }

      // Parallax Layer 2: Medium depth telemetry nodes
      if (layer2Ref.current) {
        gsap.to(layer2Ref.current, {
          y: -280,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 0.8,
          },
        });
      }

      // Parallax Layer 3: Ambient geometric depth rings
      if (layer3Ref.current) {
        gsap.to(layer3Ref.current, {
          y: -420,
          rotate: 45,
          ease: 'none',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1.5,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* Parallax Layer 1: Faint Coordinates */}
      <div
        ref={layer1Ref}
        className="absolute inset-0 flex flex-col justify-between py-40 px-12 text-slate-300/40 dark:text-zinc-800/40 font-mono text-[10px] space-y-96"
      >
        <div className="flex justify-between">
          <span>// LAT 17.6868° N • LON 83.2185° E</span>
          <span>CLUSTER.STAMP // 0x484B48</span>
        </div>
        <div className="flex justify-between">
          <span>PIPELINE.PROTOCOL // RUNTIME-V4</span>
          <span>CONSENSUS.NODE // ACTIVE</span>
        </div>
        <div className="flex justify-between">
          <span>TELEMETRY.SYNC // ENCRYPTED</span>
          <span>BOUNTY.VERIFICATION // AUTOMATED</span>
        </div>
      </div>

      {/* Parallax Layer 2: Ambient Glowing Energy Nodes */}
      <div ref={layer2Ref} className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-80 h-80 rounded-full bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-2/3 -right-20 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl" />
      </div>

      {/* Parallax Layer 3: Faint Geometric Axis */}
      <div ref={layer3Ref} className="absolute right-10 top-1/2 opacity-20 dark:opacity-10">
        <svg width="240" height="240" viewBox="0 0 240 240" fill="none">
          <circle cx="120" cy="120" r="100" stroke="#10b981" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="120" cy="120" r="60" stroke="#10b981" strokeWidth="1" />
          <line x1="120" y1="10" x2="120" y2="230" stroke="#10b981" strokeWidth="0.5" />
          <line x1="10" y1="120" x2="230" y2="120" stroke="#10b981" strokeWidth="0.5" />
        </svg>
      </div>
    </div>
  );
}
