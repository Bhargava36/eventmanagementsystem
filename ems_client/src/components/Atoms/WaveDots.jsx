import React from 'react';
import { motion } from 'framer-motion';

const WaveDots = ({
  className = '',
  dotColor = 'rgba(16, 185, 129, 0.7)',
  dotSize = 1.5,
  gap = 15,
  glow = true,
  glowColor = 'bg-emerald-500/25 dark:bg-emerald-400/20'
}) => {
  const step = gap * 2;

  return (
    <div className={`pointer-events-none select-none overflow-hidden rounded-r-3xl z-0 ${className}`}>
      <motion.div
        animate={{
          backgroundPosition: ['0px 0px', `-${step}px ${step}px`],
          opacity: [0.3, 0.65, 0.3]
        }}
        transition={{
          backgroundPosition: { duration: 7, repeat: Infinity, ease: 'linear' },
          opacity: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }}
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle, ${dotColor} ${dotSize}px, transparent ${dotSize}px)`,
          backgroundSize: `${gap}px ${gap}px`,
          maskImage: 'radial-gradient(ellipse at 100% 50%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 100% 50%, black 20%, transparent 80%)'
        }}
      />

      {glow && (
        <motion.div
          animate={{
            scale: [0.95, 1.25, 0.95],
            opacity: [0.15, 0.35, 0.15],
            x: [0, 6, 0],
            y: [0, -6, 0]
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className={`absolute -right-8 top-1/2 -translate-y-1/2 w-56 h-56 ${glowColor} rounded-full blur-3xl pointer-events-none`}
        />
      )}
    </div>
  );
};

export default WaveDots;
