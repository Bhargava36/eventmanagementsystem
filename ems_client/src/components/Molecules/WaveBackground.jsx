"use client";

import { useEffect, useRef, useContext } from "react";
import { ThemeContext } from "../../Contexts/ThemeContext";
import { motion } from "framer-motion";

export default function WaveBackground() {
  const canvasRef = useRef(null);
  const { theme } = useContext(ThemeContext); // 'dark' or 'light'

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = 0;
    let height = 0;

    const updateDimensions = () => {
      const rect = canvas.getBoundingClientRect();
      width = canvas.width = rect.width || window.innerWidth;
      height = canvas.height = rect.height || window.innerHeight;
    };

    updateDimensions();

    let time = 0;
    let animationId;

    // Mouse coordinates for interactive wave displacement
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
    };

    // emerald-500 for dark, emerald-700 for light
    const color =
      theme === "dark"
        ? "16, 185, 129" // emerald-500
        : "4, 120, 87";   // emerald-700

    const updateMousePos = (clientX, clientY) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = clientX - rect.left;
      mouse.targetY = clientY - rect.top;
    };

    const handleMouseMove = (e) => {
      updateMousePos(e.clientX, e.clientY);
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updateMousePos(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove);

    const handleResize = () => {
      updateDimensions();
    };
    window.addEventListener("resize", handleResize);

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse position interpolation (spring effect)
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      const spacingX = 18;
      const spacingY = 18;
      const cols = Math.ceil(width / spacingX) + 2;
      const rows = Math.ceil(height / spacingY) + 2;

      const maxRadius = 200; // Subtle interaction radius around cursor

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacingX;
          const baseY = j * spacingY;

          // Multiple sine waves layered for organic motion
          const wave1 = Math.sin(i * 0.12 + time * 0.02) * 48;
          const wave2 = Math.cos(j * 0.09 + time * 0.015) * 14;
          const wave3 = Math.sin((i + j) * 0.07 + time * 0.025) * 10;

          let x = baseX;
          let y = baseY + wave1 + wave2 + wave3;

          // Only draw in the lower portion for wave effect
          const heightThreshold = height * 0.55;
          if (baseY < heightThreshold) continue;

          // Gentle displacement relative to cursor
          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.hypot(dx, dy);

          let mouseEffect = 0;
          if (dist < maxRadius) {
            mouseEffect = (1 - dist / maxRadius);
            const angle = Math.atan2(dy, dx);
            const pushDist = Math.pow(mouseEffect, 2) * 50;
            x += Math.cos(angle) * pushDist;
            y += Math.sin(angle) * pushDist;
          }

          // Fade dots based on wave crest
          const distFromBottom = height - baseY;
          const maxDist = height - heightThreshold;
          const fade = Math.max(0, 0.85 - distFromBottom / maxDist);

          const waveIntensity = (Math.sin(i * 0.1 + time * 0.035) + 1) / 2;

          // Subtle interactive scaling for dot radius and opacity
          const baseRadius = 0.8 + waveIntensity * 1.2;
          const radius = baseRadius + mouseEffect * 0.9;

          const baseOpacity = Math.max(0, Math.min(1, fade * 0.75 + waveIntensity * 0.25));
          const opacity = Math.min(0.85, baseOpacity + mouseEffect * 0.18);

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${color}, ${opacity})`;
          ctx.fill();

          // Soft glow ring for points directly under cursor
          if (mouseEffect > 0.5) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 1.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${color}, ${mouseEffect * 0.08})`;
            ctx.fill();
          }
        }
      }

      // Ambient light aura trailing the mouse cursor exactly at mouse.x, mouse.y
      if (mouse.x > 0 && mouse.y > 0) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 130
        );
        gradient.addColorStop(0, `rgba(${color}, 0.05)`);
        gradient.addColorStop(0.5, `rgba(${color}, 0.015)`);
        gradient.addColorStop(1, `rgba(${color}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 130, 0, Math.PI * 2);
        ctx.fill();
      }

      time += 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [theme]);

  return (
    <motion.canvas
      initial={{ opacity: 1, y: 400 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 1, y: -400 }}
      transition={{ duration: 1, delay: 0.1, repeat: 0, ease: "easeInOut" }}
      ref={canvasRef}
      className="absolute inset-0 z-0 h-full w-full pointer-events-none"
    />
  );
}