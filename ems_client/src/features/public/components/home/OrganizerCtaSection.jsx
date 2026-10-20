import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import * as THREE from 'three';
import { animate } from 'animejs';
import gsap from 'gsap';
import {
  Building2,
  Check,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Cpu,
  Globe2,
  Users2,
  Layers,
} from 'lucide-react';

export default function OrganizerCtaSection() {
  const mountRef = useRef(null);
  const containerRef = useRef(null);

  // Stats refs for Anime.js counter animations
  const stat1Ref = useRef(null);
  const stat2Ref = useRef(null);
  const stat3Ref = useRef(null);
  const statValues = useRef({ hackathons: 0, universities: 0, builders: 0 });

  // 1. Three.js Interactive 3D HackHub Network Sphere
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 450;
    const height = container.clientHeight || 450;

    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 7.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for mouse rotation
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Core Wireframe Icosahedron (HackHub Network Core)
    const icoGeometry = new THREE.IcosahedronGeometry(2.3, 2);
    const icoMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const icoMesh = new THREE.Mesh(icoGeometry, icoMaterial);
    globeGroup.add(icoMesh);

    // Inner Glowing Core Sphere
    const innerGeo = new THREE.SphereGeometry(1.4, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x059669,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const innerSphere = new THREE.Mesh(innerGeo, innerMat);
    globeGroup.add(innerSphere);

    // Outer Orbital Ring 1
    const ringGeo1 = new THREE.TorusGeometry(3.1, 0.015, 16, 100);
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
    });
    const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
    ring1.rotation.x = Math.PI / 3;
    ring1.rotation.y = Math.PI / 6;
    globeGroup.add(ring1);

    // Outer Orbital Ring 2
    const ringGeo2 = new THREE.TorusGeometry(3.3, 0.012, 16, 100);
    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x059669,
      transparent: true,
      opacity: 0.3,
    });
    const ring2 = new THREE.Mesh(ringGeo2, ringMat2);
    ring2.rotation.x = -Math.PI / 4;
    ring2.rotation.y = Math.PI / 3;
    globeGroup.add(ring2);

    // Network Node Vertices (Points representing Hackathon Hubs)
    const nodeCount = 50;
    const nodePositions = new Float32Array(nodeCount * 3);
    for (let i = 0; i < nodeCount; i++) {
      const phi = Math.acos(-1 + (2 * i) / nodeCount);
      const theta = Math.sqrt(nodeCount * Math.PI) * phi;
      const radius = 2.3;
      nodePositions[i * 3] = radius * Math.cos(theta) * Math.sin(phi);
      nodePositions[i * 3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
      nodePositions[i * 3 + 2] = radius * Math.cos(phi);
    }
    const nodeGeometry = new THREE.BufferGeometry();
    nodeGeometry.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
    const nodeMaterial = new THREE.PointsMaterial({
      color: 0x6ee7b7,
      size: 0.12,
      transparent: true,
      opacity: 0.9,
    });
    const nodePoints = new THREE.Points(nodeGeometry, nodeMaterial);
    globeGroup.add(nodePoints);

    // Floating Data Packets orbiting around
    const particleCount = 40;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const r = 2.8 + Math.random() * 0.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      particlePositions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      particlePositions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      particlePositions[i * 3 + 2] = r * Math.cos(phi);
    }
    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.08,
      transparent: true,
      opacity: 0.7,
    });
    const particles = new THREE.Points(particleGeo, particleMat);
    globeGroup.add(particles);

    // Mouse Interaction
    let targetRotX = 0;
    let targetRotY = 0;
    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = x * 0.8;
      targetRotX = -y * 0.6;
    };
    container.addEventListener('mousemove', handleMouseMove);

    // Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animateScene = () => {
      animationFrameId = requestAnimationFrame(animateScene);
      const elapsedTime = clock.getElapsedTime();

      // Idle Rotation
      globeGroup.rotation.y += 0.004;
      ring1.rotation.z += 0.005;
      ring2.rotation.z -= 0.004;
      innerSphere.rotation.y -= 0.006;

      // Smooth mouse follow interpolation
      globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.05;
      globeGroup.rotation.y += (targetRotY * 0.5 - (globeGroup.rotation.y % (Math.PI * 2))) * 0.02;

      renderer.render(scene, camera);
    };
    animateScene();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      container.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      icoGeometry.dispose();
      icoMaterial.dispose();
      innerGeo.dispose();
      innerMat.dispose();
      ringGeo1.dispose();
      ringMat1.dispose();
      ringGeo2.dispose();
      ringMat2.dispose();
      nodeGeometry.dispose();
      nodeMaterial.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // 2. Anime.js Stats Ticker Animation Function
  const triggerStats = () => {
    statValues.current = { hackathons: 0, universities: 0, builders: 0 };
    try {
      animate(statValues.current, {
        hackathons: 250,
        universities: 48,
        builders: 15400,
        duration: 2000,
        ease: 'outExpo',
        onUpdate: () => {
          if (stat1Ref.current) stat1Ref.current.innerText = `${Math.floor(statValues.current.hackathons)}+`;
          if (stat2Ref.current) stat2Ref.current.innerText = `${Math.floor(statValues.current.universities)}`;
          if (stat3Ref.current) stat3Ref.current.innerText = `${Math.floor(statValues.current.builders).toLocaleString()}+`;
        },
      });
    } catch (e) {
      if (stat1Ref.current) stat1Ref.current.innerText = '250+';
      if (stat2Ref.current) stat2Ref.current.innerText = '48';
      if (stat3Ref.current) stat3Ref.current.innerText = '15,400+';
    }
  };

  useEffect(() => {
    triggerStats();
  }, []);

  // 3. GSAP ScrollTrigger Scroll-Reveal & Button Hover
  const btnPrimaryRef = useRef(null);
  const btnSecondaryRef = useRef(null);
  const leftColRef = useRef(null);
  const rightColRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left column reveal (re-triggers whenever on screen)
      if (leftColRef.current) {
        gsap.from(leftColRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 88%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
            onEnter: triggerStats,
            onEnterBack: triggerStats,
          },
          y: 40,
          opacity: 0,
          duration: 0.85,
          ease: 'power3.out',
        });
      }

      // Right 3D globe reveal (re-triggers whenever on screen)
      if (rightColRef.current) {
        gsap.from(rightColRef.current, {
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 88%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
          },
          scale: 0.9,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
        });
      }
    }, containerRef);

    const btn1 = btnPrimaryRef.current;
    const btn2 = btnSecondaryRef.current;
    if (!btn1 || !btn2) return () => ctx.revert();

    const onEnter1 = () => gsap.to(btn1, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
    const onLeave1 = () => gsap.to(btn1, { scale: 1, duration: 0.25, ease: 'power2.out' });
    const onEnter2 = () => gsap.to(btn2, { scale: 1.03, duration: 0.25, ease: 'power2.out' });
    const onLeave2 = () => gsap.to(btn2, { scale: 1, duration: 0.25, ease: 'power2.out' });

    btn1.addEventListener('mouseenter', onEnter1);
    btn1.addEventListener('mouseleave', onLeave1);
    btn2.addEventListener('mouseenter', onEnter2);
    btn2.addEventListener('mouseleave', onLeave2);

    return () => {
      ctx.revert();
      btn1.removeEventListener('mouseenter', onEnter1);
      btn1.removeEventListener('mouseleave', onLeave1);
      btn2.removeEventListener('mouseenter', onEnter2);
      btn2.removeEventListener('mouseleave', onLeave2);
    };
  }, []);

  return (
    <section id="command" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      <div
        ref={containerRef}
        className="rounded-3xl bg-slate-950 dark:bg-black border border-slate-200 dark:border-zinc-800 p-8 sm:p-12 lg:p-16 overflow-hidden relative shadow-2xl"
      >
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center relative z-10">
          {/* Left Column: Text & Actions with ScrollReveal */}
          <div ref={leftColRef} className="lg:col-span-6 space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
              Host Your Hackathon on HackHub.
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed font-normal">
              An enterprise-grade operating system designed for student chapters, university departments, and tech communities. Organize registrations, coordinate campus stays, and streamline jury scoring with confidence.
            </p>

            <ul className="space-y-3 pt-2 text-xs sm:text-sm text-zinc-300">
              {[
                'Configurable registration windows and team quotas',
                'Integrated food coupons and hostel room allocations',
                'Transparent multi-round jury scoring criteria',
                'No platform fee for verified university student clubs',
              ].map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[2.5]" />
                  </div>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
              <Link
                ref={btnPrimaryRef}
                to="/admin/register"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all text-center cursor-pointer"
              >
                Register as Organizer
              </Link>
              <Link
                ref={btnSecondaryRef}
                to="/admin/login"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 font-semibold text-xs sm:text-sm border border-zinc-700 transition-all text-center cursor-pointer"
              >
                Organizer Sign In
              </Link>
            </div>

            {/* Anime.js Animated Platform Telemetry */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800/80">
              <div>
                <span
                  ref={stat1Ref}
                  className="block font-mono text-xl sm:text-2xl font-bold text-emerald-400"
                >
                  250+
                </span>
                <span className="text-[11px] text-zinc-400">Events Powered</span>
              </div>
              <div>
                <span
                  ref={stat2Ref}
                  className="block font-mono text-xl sm:text-2xl font-bold text-white"
                >
                  48
                </span>
                <span className="text-[11px] text-zinc-400">Host Campuses</span>
              </div>
              <div>
                <span
                  ref={stat3Ref}
                  className="block font-mono text-xl sm:text-2xl font-bold text-emerald-400"
                >
                  15,000+
                </span>
                <span className="text-[11px] text-zinc-400">Active Builders</span>
              </div>
            </div>
          </div>

          {/* Right Column: Three.js Interactive 3D HackHub Network Cluster with ScrollReveal */}
          <div ref={rightColRef} className="lg:col-span-6 relative flex flex-col items-center justify-center">
            <div className="relative w-full aspect-square max-w-[460px] flex items-center justify-center">
              {/* Three.js Canvas Container */}
              <div
                ref={mountRef}
                className="w-full h-full cursor-grab active:cursor-grabbing flex items-center justify-center"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
