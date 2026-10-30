import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import gsap from 'gsap';
import {
  BrainCircuit,
  Coins,
  Cpu,
  Shield,
  Layers,
  HeartPulse,
  ArrowRight,
} from 'lucide-react';

const TRACKS = [
  {
    id: 'ai-ml',
    title: 'Artificial Intelligence & ML',
    description:
      'LLM agents, autonomous workflows, computer vision, and predictive intelligence architectures.',
    icon: BrainCircuit,
    count: '18 Active Events',
  },
  {
    id: 'web3',
    title: 'Web3 & Decentralized Systems',
    description:
      'Smart contracts, zero-knowledge proofs, DeFi protocols, and decentralized governance networks.',
    icon: Coins,
    count: '12 Active Events',
  },
  {
    id: 'iot',
    title: 'IoT & Hardware Prototyping',
    description:
      'Embedded microcontrollers, smart robotics, edge sensors, and real-time telemetry systems.',
    icon: Cpu,
    count: '9 Active Events',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity & Defense',
    description:
      'Offensive security exercises, cryptography algorithms, secure authentication, and cloud defense.',
    icon: Shield,
    count: '8 Active Events',
  },
  {
    id: 'fullstack',
    title: 'Full-Stack & Cloud Native',
    description:
      'Distributed backend services, reactive user interfaces, serverless pipelines, and microservices.',
    icon: Layers,
    count: '24 Active Events',
  },
  {
    id: 'healthtech',
    title: 'HealthTech & BioInformatics',
    description:
      'Digital diagnostics, clinical triage workflows, wearable vitals monitoring, and genomic data tooling.',
    icon: HeartPulse,
    count: '7 Active Events',
  },
];

export default function TechTracksBentoSection() {
  const navigate = useNavigate();
  const threeMountRef = useRef(null);
  const cardsRef = useRef([]);

  // 1. Three.js Subtle 3D Ambient Node Particles in Background
  useEffect(() => {
    const mount = threeMountRef.current;
    if (!mount) return;

    const width = mount.clientWidth || 1000;
    const height = mount.clientHeight || 500;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 18;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    mount.innerHTML = '';
    mount.appendChild(renderer.domElement);

    // Create 3D floating geometric polyhedra representing domains
    const geometryGroup = new THREE.Group();
    scene.add(geometryGroup);

    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });

    const shapes = [
      new THREE.Mesh(new THREE.OctahedronGeometry(1.8), wireMat),
      new THREE.Mesh(new THREE.IcosahedronGeometry(2.0), wireMat),
      new THREE.Mesh(new THREE.TetrahedronGeometry(1.6), wireMat),
    ];

    shapes[0].position.set(-10, 3, -5);
    shapes[1].position.set(10, -2, -6);
    shapes[2].position.set(2, 6, -8);

    shapes.forEach((s) => geometryGroup.add(s));

    // Particle constellation
    const pCount = 60;
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 32;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 18;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 0.4,
    });
    const pMesh = new THREE.Points(pGeo, pMat);
    geometryGroup.add(pMesh);

    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      geometryGroup.rotation.y += 0.001;
      shapes[0].rotation.x += 0.003;
      shapes[0].rotation.y += 0.004;
      shapes[1].rotation.z += 0.002;
      shapes[2].rotation.x -= 0.003;
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mount) return;
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      wireMat.dispose();
      pGeo.dispose();
      pMat.dispose();
      if (mount.contains(renderer.domElement)) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, []);

  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const gridRef = useRef(null);

  // 2. GSAP ScrollTrigger Scroll-Reveal & 3D Interactive Card Tilt
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Header reveal (re-triggers whenever on screen)
      if (headerRef.current) {
        gsap.from(headerRef.current, {
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 88%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
          },
          y: 40,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
        });
      }

      // 6 Cards Stagger reveal (re-triggers whenever on screen)
      const cards = cardsRef.current.filter(Boolean);
      if (cards.length) {
        gsap.from(cards, {
          scrollTrigger: {
            trigger: gridRef.current || sectionRef.current,
            start: 'top 85%',
            end: 'bottom 12%',
            toggleActions: 'play reverse play reverse',
          },
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 0.85,
          stagger: 0.1,
          ease: 'power3.out',
        });
      }
    }, sectionRef);

    const cleanups = [];

    cardsRef.current.forEach((card) => {
      if (!card) return;

      const onMouseMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = -((y - centerY) / centerY) * 8;
        const rotateY = ((x - centerX) / centerX) * 8;

        gsap.to(card, {
          rotateX,
          rotateY,
          transformPerspective: 900,
          scale: 1.02,
          borderColor: '#10b981',
          duration: 0.2,
          ease: 'power1.out',
        });
      };

      const onMouseLeave = () => {
        gsap.to(card, {
          rotateX: 0,
          rotateY: 0,
          scale: 1,
          borderColor: 'var(--card-border, rgba(39, 39, 42, 1))',
          duration: 0.45,
          ease: 'power2.out',
        });
      };

      card.addEventListener('mousemove', onMouseMove);
      card.addEventListener('mouseleave', onMouseLeave);

      cleanups.push(() => {
        card.removeEventListener('mousemove', onMouseMove);
        card.removeEventListener('mouseleave', onMouseLeave);
      });
    });

    return () => {
      ctx.revert();
      cleanups.forEach((c) => c());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="domains"
      className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden scroll-mt-20"
    >
      {/* Three.js Ambient 3D Particle Layer */}
      <div
        ref={threeMountRef}
        className="absolute inset-0 pointer-events-none z-0 opacity-40"
      />

      {/* Header with ScrollReveal */}
      <div
        ref={headerRef}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16 relative z-10"
      >
        <div className="space-y-3 max-w-2xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Competitions by Technology Track
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-400 font-normal leading-relaxed">
            Find technical events focused on the domains, languages, and frameworks you want to build with.
          </p>
        </div>

        <Link
          to="/events"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-colors self-start md:self-auto group"
        >
          <span>Explore all tracks</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </div>

      {/* Grid of 6 interactive 3D Tilt cards with ScrollReveal */}
      <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
        {TRACKS.map((track, idx) => {
          const IconComp = track.icon;
          return (
            <div
              key={track.id}
              ref={(el) => (cardsRef.current[idx] = el)}
              onClick={() => navigate('/events')}
              style={{ transformStyle: 'preserve-3d' }}
              className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-zinc-800 transition-colors duration-200 cursor-pointer flex flex-col justify-between space-y-5 group shadow-sm hover:shadow-2xl"
            >
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-zinc-900 text-slate-900 dark:text-white flex items-center justify-center shrink-0 border border-slate-200/50 dark:border-zinc-800">
                  <IconComp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                  {track.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed font-normal">
                  {track.description}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-500 transition-colors">
                <span className="text-[11px] font-normal text-slate-500 dark:text-zinc-500">{track.count}</span>
                <span className="inline-flex items-center gap-1 text-xs">
                  <span>View challenges</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
