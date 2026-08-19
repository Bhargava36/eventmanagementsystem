"use client";

import { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../Contexts/ThemeContext";

export default function WaveBackground() {
  const canvasRef = useRef(null);
  const { theme } = useContext(ThemeContext); // 'dark' or 'light'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);
    let time = 0;
    let animationId;

    // emerald-500 for dark, emerald-700 for light
    const color =
      theme === "dark"
        ? "16, 185, 129" // emerald-500
        : "4, 120, 87";   // emerald-700

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const spacingX = 20;
      const spacingY = 20;
      const cols = Math.ceil(width / spacingX);
      const rows = Math.ceil(height / spacingY);

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacingX;
          const baseY = j * spacingY;

          // Multiple sine waves layered for organic motion
          const wave1 = Math.sin(i * 0.15 + time * 0.02) * 20;
          const wave2 = Math.cos(j * 0.1 + time * 0.015) * 15;
          const wave3 = Math.sin((i + j) * 0.08 + time * 0.025) * 10;

          const y = baseY + wave1 + wave2 + wave3;

          // Only draw in the lower portion for wave effect
          const heightThreshold = height * 0.55;
          if (baseY < heightThreshold) continue;

          // Fade dots based on wave crest
          const distFromBottom = height - baseY;
          const maxDist = height - heightThreshold;
          const fade = 0.8 - distFromBottom / maxDist;

          const waveIntensity =
            (Math.sin(i * 0.12 + time * 0.03) + 1) / 2;
          const opacity =
            Math.max(0, Math.min(1, fade * 0.8 + waveIntensity * 0.3));

          const radius = 0.8 + waveIntensity * 1.2;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${opacity})`;
          ctx.fill();
        }
      }

      time += 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}