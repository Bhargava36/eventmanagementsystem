import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import useTheme from '../../Hooks/useTheme';

/**
 * ThreePreloader
 * Official 4-dots brand preloader:
 * - Premium Title Style: Ayojan with radiant emerald underscore and accent lines.
 * - Full Theme Support: Dynamic Light & Dark Mode styling.
 * - 4 balls bounce in dynamically from 4 screen corners to top diamond.
 * - 4 balls rotate 360 degrees and smoothly stop.
 * - Letters appear one by one below in display title typography.
 * - 1 full second pause once everything appears before opening website.
 * - Website loads only after preloader finishes.
 */
export default function ThreePreloader({ onComplete }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const mountRef = useRef(null);
  const containerRef = useRef(null);
  const lettersRef = useRef([]);
  const subRef = useRef(null);
  const [isDone, setIsDone] = useState(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Luxury Brand Title Letters with Emerald Underscore accent
  const BRAND_LETTERS = [
    { char: 'A', isAccent: true },
    { char: 'Y', isAccent: false },
    { char: 'O', isAccent: false },
    { char: 'J', isAccent: false },
    { char: 'A', isAccent: true },
    { char: 'N', isAccent: false },
  ];

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    // 1. Scene & Camera Setup (Full Viewport)
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 6.2;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Compute exact viewport corner boundaries at z = 0
    const dist = camera.position.z;
    const vFov = (camera.fov * Math.PI) / 180;
    const visibleHeight = 2 * Math.tan(vFov / 2) * dist;
    const visibleWidth = visibleHeight * (width / height);

    // Starting corner positions (outside screen edges)
    const cornerX = visibleWidth / 2 + 0.8;
    const cornerY = visibleHeight / 2 + 0.8;

    // Group for the 4 dots centered at Y = 0.55 (TOP placement)
    const centerY = 0.55;
    const radius = 0.38;

    const dotsGroup = new THREE.Group();
    dotsGroup.position.set(0, centerY, 0);
    scene.add(dotsGroup);

    // 2. Theme-Aware Lighting (Balanced so colors don't wash out)
    const ambientLight = new THREE.AmbientLight(0xffffff, isDark ? 1.4 : 1.2);
    scene.add(ambientLight);

    const frontLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.8 : 1.5);
    frontLight.position.set(0, 3, 6);
    scene.add(frontLight);

    const pointLight = new THREE.PointLight(
      0x10b981,
      isDark ? 1.4 : 1.0,
      12
    );
    pointLight.position.set(0, centerY, 3.5);
    scene.add(pointLight);

    // 3. Theme-Aware Materials
    // Top & Bottom: Authentic Website Brand Emerald Green (#10b981 / #059669)
    const emeraldMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x10b981 : 0x059669,
      roughness: 0.22,
      metalness: 0.08,
      emissive: isDark ? 0x059669 : 0x047857,
      emissiveIntensity: isDark ? 0.45 : 0.3,
    });

    // Left & Right: Radiant Clean Pure White (Dark Mode) / Deep Slate-Black (Light Mode)
    const contrastMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0xffffff : 0x1e293b,
      roughness: 0.15,
      metalness: 0.08,
      emissive: isDark ? 0xffffff : 0x0f172a,
      emissiveIntensity: isDark ? 0.35 : 0.15,
    });

    // Sleek, refined Sphere Geometry
    const sphereGeo = new THREE.SphereGeometry(0.09, 48, 48);

    // Local coordinates inside dotsGroup:
    const DOT_CONFIGS = [
      { id: 'top', startX: cornerX * 0.9, startY: cornerY - centerY, endX: 0, endY: radius, mat: emeraldMat },
      { id: 'bottom', startX: -cornerX * 0.9, startY: -cornerY - centerY, endX: 0, endY: -radius, mat: emeraldMat },
      { id: 'left', startX: -cornerX, startY: cornerY * 0.8 - centerY, endX: -radius, endY: 0, mat: contrastMat },
      { id: 'right', startX: cornerX, startY: -cornerY * 0.8 - centerY, endX: radius, endY: 0, mat: contrastMat },
    ];

    // Create the 4 meshes inside dotsGroup
    const meshes = DOT_CONFIGS.map((cfg) => {
      const mesh = new THREE.Mesh(sphereGeo, cfg.mat);
      mesh.position.set(cfg.startX, cfg.startY, 0);
      mesh.scale.set(0.3, 0.3, 0.3);
      dotsGroup.add(mesh);
      return mesh;
    });

    // Handle screen resize
    const handleResize = () => {
      if (!renderer || !camera) return;
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Continuous Render Loop
    let animId;
    const render = () => {
      animId = requestAnimationFrame(render);
      renderer.render(scene, camera);
    };
    render();

    // 4. GSAP Master Timeline
    const tl = gsap.timeline();

    // --- PHASE 1: 4 balls bounce in from 4 corners to center diamond (0.0s - 1.05s) ---
    DOT_CONFIGS.forEach((cfg, i) => {
      tl.to(
        meshes[i].position,
        {
          x: cfg.endX,
          y: cfg.endY,
          duration: 1.05,
          ease: 'bounce.out',
        },
        0.04 * i
      );

      tl.fromTo(
        meshes[i].scale,
        { x: 0.2, y: 0.2, z: 0.2 },
        {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.05,
          ease: 'bounce.out',
        },
        0.04 * i
      );
    });

    // --- PHASE 2: Balls rotate 360 degrees and smoothly stop ("rotate ayyi aagali") ---
    tl.to(
      dotsGroup.rotation,
      {
        z: Math.PI * 2,
        duration: 0.95,
        ease: 'power2.inOut',
      },
      1.1
    );

    // Single smooth settle on scale
    tl.to(
      dotsGroup.scale,
      {
        x: 1.08,
        y: 1.08,
        duration: 0.45,
        yoyo: true,
        repeat: 0,
        ease: 'power1.out',
      },
      1.1
    );

    // --- PHASE 3: Right as rotation completes & stops, Ayojan letters appear in Title Style ---
    tl.to(
      lettersRef.current,
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.26,
        stagger: 0.08,
        ease: 'back.out(2)',
      },
      2.05
    );

    // Subtitle badge appears right after the letters finish
    if (subRef.current) {
      tl.to(
        subRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: 'power2.out',
        },
        2.75
      );
    }

    // --- PHASE 4: EXACTLY 1 SECOND PAUSE after everything appears ("antha occhaka 1 sec aagi") ---
    tl.to({}, { duration: 1.0 }, 3.05);

    // --- PHASE 5: Open website & dissolve preloader (starts at 4.05s) ---
    tl.call(
      () => {
        if (onCompleteRef.current) onCompleteRef.current();
      },
      null,
      4.05
    );

    tl.to(
      containerRef.current,
      {
        opacity: 0,
        scale: 1.03,
        duration: 0.55,
        ease: 'power3.inOut',
        onComplete: () => {
          setIsDone(true);
        },
      },
      4.05
    );

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      tl.kill();
      renderer.dispose();
      sphereGeo.dispose();
      emeraldMat.dispose();
      contrastMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [isDark]);

  if (isDone) return null;

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 z-[99999] ${
        isDark ? 'bg-black text-white' : 'bg-white text-black'
      } flex flex-col items-center justify-center select-none overflow-hidden transition-colors duration-300`}
    >
      {/* Radial Background matching Luxury Platform Aesthetics */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isDark
            ? 'bg-[radial-gradient(circle_at_center,_rgba(0,0,0,0.85)_0%,_rgba(0,0,0,0.98)_100%)]'
            : 'bg-[radial-gradient(circle_at_center,_rgba(255,255,255,0.85)_0%,_rgba(255,255,255,0.98)_100%)]'
        }`}
      />

      {/* Central Soft Optical Core Glow behind the logo */}
      <div
        className={`absolute top-[32%] w-72 h-72 rounded-full blur-3xl pointer-events-none ${
          isDark ? 'bg-emerald-500/[0.08]' : 'bg-emerald-500/[0.06]'
        }`}
      />

      {/* 3D 4-Dots Canvas (Logo sits on top) */}
      <div ref={mountRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Display Title Typography Placed Cleanly BELOW the Logo */}
      <div className="relative z-10 flex flex-col items-center space-y-3 mt-48 pointer-events-none">
        {/* Title-style AYOJAN with emerald underscore */}
        <div className="flex items-center tracking-[0.2em] sm:tracking-[0.25em] pl-[0.2em]">
          {BRAND_LETTERS.map((item, i) => (
            <span
              key={i}
              ref={(el) => (lettersRef.current[i] = el)}
              className={`inline-block text-4xl sm:text-5xl md:text-6xl font-black ${
                item.isAccent
                  ? 'text-emerald-500 dark:text-emerald-400 drop-shadow-[0_0_20px_rgba(16,185,129,0.8)]'
                  : isDark
                  ? 'text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.35)]'
                  : 'text-zinc-900 drop-shadow-[0_4px_14px_rgba(0,0,0,0.12)]'
              } opacity-0`}
              style={{ transform: 'translateY(16px) scale(0.85)' }}
            >
              {item.char}
            </span>
          ))}
        </div>

          <div className='text-emerald-600'>
            <span
              ref={subRef}
              className={`inline-block text-sm sm:text-base md:text-lg  font-semibold opacity-0`}
              style={{ transform: 'translateY(12px)' }}
            >
              PLAN. ORGANIZE. CELEBRATE.
            </span>
          </div>
        {/* Title Tagline with flanking geometric lines */}
        
      </div>
    </div>
  );
}
