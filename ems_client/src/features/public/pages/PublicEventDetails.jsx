import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useTheme from '../../../Hooks/useTheme';
import FlipCountdown from '../../../components/Molecules/FlipCountdown';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Trophy,
  Award,
  Medal,
  CheckCircle2,
  Share2,
  Copy,
  Check,
  Monitor,
  Building2,
  Globe,
  Tag,
  AlertCircle,
  RefreshCw,
  Mail,
  Phone,
  FileText,
  ShieldCheck,
  ExternalLink,
  ChevronRight,
  Layers,
  Radio,
  Info
} from 'lucide-react';

function PrizePodiumStage({
  firstAmount,
  firstDesc,
  firstTrack,
  secondAmount,
  secondDesc,
  secondTrack,
  thirdAmount,
  thirdDesc,
  thirdTrack
}) {
  return (
    <div className="relative pt-4 sm:pt-8 pb-4 max-w-3xl mx-auto">
      <svg
        viewBox="0 0 900 590"
        className="w-full h-auto select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="podiumGroundBlur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          <filter id="centerDropShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.35" />
          </filter>

          <linearGradient id="amberPedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="30%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>

          <linearGradient id="greenPedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          <linearGradient id="bluePedestalGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="40%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#FACC15" />
            <stop offset="60%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="goldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>

          <linearGradient id="trophySilver" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="65%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="silverHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="trophyBronze" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFEDD5" />
            <stop offset="30%" stopColor="#FB923C" />
            <stop offset="70%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
          <linearGradient id="bronzeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        <motion.ellipse
          cx="450"
          cy="572"
          rx="380"
          ry="16"
          fill="rgba(0,0,0,0.22)"
          filter="url(#podiumGroundBlur)"
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        />

        <motion.g
          id="pedestal-left"
          initial={{ opacity: 0, y: 70 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <polygon points="110,360 340,360 355,390 110,390" fill="#F59E0B" />
          <polygon points="110,390 360,390 360,570 120,570" fill="url(#amberPedestalGrad)" />
        </motion.g>

        <motion.g
          id="pedestal-right"
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        >
          <polygon points="560,405 790,405 790,430 540,430" fill="#38BDF8" />
          <polygon points="540,430 790,430 780,570 540,570" fill="url(#bluePedestalGrad)" />
        </motion.g>

        <motion.g
          id="pedestal-center"
          initial={{ opacity: 0, y: 90 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1], delay: 0.0 }}
        >
          <polygon points="330,270 570,270 590,300 310,300" fill="#10B981" />
          <polygon points="310,300 590,300 575,570 325,570" fill="url(#greenPedestalGrad)" filter="url(#centerDropShadow)" />
        </motion.g>

        <motion.g
          id="silver-trophy-group"
          initial={{ opacity: 0, y: -70, scale: 0.75 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 170, damping: 12, mass: 0.8, delay: 0.38 }}
        >
          <rect x="185" y="340" width="80" height="20" rx="2" fill="#3E181D" stroke="#5C252B" strokeWidth="1.2" />
          <line x1="190" y1="342" x2="260" y2="342" stroke="#87353E" strokeWidth="1" />

          <rect x="204" y="333" width="42" height="7" rx="1.5" fill="url(#silverHighlight)" stroke="#475569" strokeWidth="1.2" />
          <path d="M 216 317 L 234 317 L 244 333 L 206 333 Z" fill="url(#trophySilver)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 218 318 L 223 318 L 214 331 L 209 331 Z" fill="#FFFFFF" fillOpacity="0.7" />

          <rect x="220" y="299" width="10" height="18" fill="url(#trophySilver)" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="225" cy="301" rx="6.5" ry="2" fill="#FFFFFF" />
          <ellipse cx="225" cy="317" rx="7.5" ry="2" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />

          <path d="M 197 238 C 163 238 158 270 182 292 C 190 298 197 295 198 290 C 194 288 188 284 185 275 C 179 263 183 251 198 249 Z" fill="url(#trophySilver)" stroke="#475569" strokeWidth="1.8" />
          <circle cx="197" cy="292" r="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />

          <path d="M 253 238 C 287 238 292 270 268 292 C 260 298 253 295 252 290 C 256 288 262 284 265 275 C 271 263 267 251 252 249 Z" fill="url(#trophySilver)" stroke="#475569" strokeWidth="1.8" />
          <circle cx="253" cy="292" r="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />

          <path d="M 194 234 L 256 234 L 252 268 C 250 286 240 299 225 299 C 210 299 200 286 198 268 Z" fill="url(#trophySilver)" stroke="#475569" strokeWidth="1.8" />
          <path d="M 199 237 L 212 237 L 209 268 C 207 281 204 289 200 292 C 199 287 197 277 198 268 Z" fill="#FFFFFF" fillOpacity="0.75" />

          <rect x="190" y="228" width="70" height="7" rx="2.5" fill="url(#silverHighlight)" stroke="#475569" strokeWidth="1.6" />
          <rect x="193" y="224" width="64" height="5" rx="1.5" fill="#FFFFFF" stroke="#475569" strokeWidth="1.2" />

          <circle cx="225" cy="266" r="14.5" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <circle cx="225" cy="266" r="11.5" fill="#475569" />
          <text x="225" y="271.5" textAnchor="middle" fontSize="15" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#FFFFFF">2</text>

          <motion.path
            d="M 242 240 Q 242 245 247 245 Q 242 245 242 250 Q 242 245 237 245 Q 242 245 242 240 Z"
            fill="#FFFFFF"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.9] }}
            viewport={{ once: true }}
            transition={{ delay: 0.85, duration: 0.5 }}
          />
        </motion.g>

        <motion.g
          id="gold-trophy-group"
          initial={{ opacity: 0, y: -90, scale: 0.7 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 180, damping: 11, mass: 0.8, delay: 0.25 }}
        >
          <rect x="400" y="246" width="100" height="24" rx="2" fill="#3E181D" stroke="#5C252B" strokeWidth="1.5" />
          <line x1="408" y1="248" x2="492" y2="248" stroke="#87353E" strokeWidth="1" />

          <rect x="424" y="238" width="52" height="8" rx="2" fill="url(#goldHighlight)" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 439 218 L 461 218 L 472 238 L 428 238 Z" fill="url(#trophyGold)" stroke="#B45309" strokeWidth="2" />
          <path d="M 441 220 L 447 220 L 437 236 L 430 236 Z" fill="#FEF08A" fillOpacity="0.6" />

          <rect x="444" y="196" width="12" height="22" fill="url(#trophyGold)" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="450" cy="198" rx="8" ry="2.5" fill="#FEF08A" />
          <ellipse cx="450" cy="218" rx="9" ry="2.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />

          <path d="M 416 122 C 374 122 368 162 398 188 C 408 196 416 192 418 186 C 413 184 406 178 402 168 C 394 153 399 138 418 136 Z" fill="url(#trophyGold)" stroke="#B45309" strokeWidth="2" />
          <circle cx="417" cy="188" r="3.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />

          <path d="M 484 122 C 526 122 532 162 502 188 C 492 196 484 192 482 186 C 487 184 494 178 498 168 C 506 153 501 138 482 136 Z" fill="url(#trophyGold)" stroke="#B45309" strokeWidth="2" />
          <circle cx="483" cy="188" r="3.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />

          <path d="M 412 118 L 488 118 L 483 158 C 480 180 468 196 450 196 C 432 196 420 180 417 158 Z" fill="url(#trophyGold)" stroke="#B45309" strokeWidth="2" />
          <path d="M 418 122 L 434 122 L 430 158 C 428 174 424 184 420 188 C 418 182 416 170 417 158 Z" fill="#FEF08A" fillOpacity="0.55" />

          <rect x="408" y="110" width="84" height="9" rx="3" fill="url(#goldHighlight)" stroke="#B45309" strokeWidth="2" />
          <rect x="412" y="105" width="76" height="6" rx="2" fill="#FEF9C3" stroke="#B45309" strokeWidth="1.5" />

          <circle cx="450" cy="156" r="18" fill="#FDE047" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="450" cy="156" r="14.5" fill="#D97706" />
          <text x="450" y="162.5" textAnchor="middle" fontSize="19" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#FFFFFF">1</text>

          <motion.path
            d="M 470 122 Q 470 128 476 128 Q 470 128 470 134 Q 470 128 464 128 Q 470 128 470 122 Z"
            fill="#FFFDE7"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.95] }}
            viewport={{ once: true }}
            transition={{ delay: 0.75, duration: 0.5 }}
          />
        </motion.g>

        <motion.g
          id="bronze-trophy-group"
          initial={{ opacity: 0, y: -60, scale: 0.75 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ type: "spring", stiffness: 170, damping: 12, mass: 0.8, delay: 0.48 }}
        >
          <rect x="638" y="387" width="74" height="18" rx="2" fill="#3E181D" stroke="#5C252B" strokeWidth="1.2" />
          <line x1="644" y1="389" x2="706" y2="389" stroke="#87353E" strokeWidth="1" />

          <rect x="655" y="380" width="40" height="7" rx="1.5" fill="url(#bronzeHighlight)" stroke="#7C2D12" strokeWidth="1.2" />
          <path d="M 666 364 L 684 364 L 693 380 L 657 380 Z" fill="url(#trophyBronze)" stroke="#7C2D12" strokeWidth="1.6" />
          <path d="M 668 365 L 673 365 L 664 378 L 660 378 Z" fill="#FED7AA" fillOpacity="0.6" />

          <rect x="670" y="347" width="10" height="17" fill="url(#trophyBronze)" stroke="#7C2D12" strokeWidth="1.5" />
          <ellipse cx="675" cy="349" rx="6" ry="2" fill="#FFEDD5" />
          <ellipse cx="675" cy="364" rx="7" ry="2" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.2" />

          <path d="M 649 292 C 618 292 613 322 635 342 C 642 347 648 344 649 340 C 646 338 640 334 638 326 C 632 315 636 304 650 302 Z" fill="url(#trophyBronze)" stroke="#7C2D12" strokeWidth="1.8" />
          <circle cx="649" cy="342" r="2.8" fill="#FDBA74" stroke="#7C2D12" strokeWidth="1.2" />

          <path d="M 701 292 C 732 292 737 322 715 342 C 708 347 702 344 701 340 C 704 338 710 334 712 326 C 718 315 714 304 700 302 Z" fill="url(#trophyBronze)" stroke="#7C2D12" strokeWidth="1.8" />
          <circle cx="701" cy="342" r="2.8" fill="#FDBA74" stroke="#7C2D12" strokeWidth="1.2" />

          <path d="M 646 288 L 704 288 L 700 319 C 698 335 689 347 675 347 C 661 347 652 335 650 319 Z" fill="url(#trophyBronze)" stroke="#7C2D12" strokeWidth="1.8" />
          <path d="M 651 291 L 663 291 L 660 319 C 658 331 655 338 652 341 C 651 336 649 327 650 319 Z" fill="#FED7AA" fillOpacity="0.65" />

          <rect x="642" y="282" width="66" height="7" rx="2.5" fill="url(#bronzeHighlight)" stroke="#7C2D12" strokeWidth="1.5" />
          <rect x="645" y="278" width="60" height="5" rx="1.5" fill="#FFEDD5" stroke="#7C2D12" strokeWidth="1.2" />

          <circle cx="675" cy="317" r="13.5" fill="#FDBA74" stroke="#7C2D12" strokeWidth="2" />
          <circle cx="675" cy="317" r="10.5" fill="#7C2D12" />
          <text x="675" y="322" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#FFFFFF">3</text>

          <motion.path
            d="M 692 294 Q 692 299 697 299 Q 692 299 692 304 Q 692 299 687 299 Q 692 299 692 294 Z"
            fill="#FFF7ED"
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: [0, 1.4, 1], opacity: [0, 1, 0.9] }}
            viewport={{ once: true }}
            transition={{ delay: 0.95, duration: 0.5 }}
          />
        </motion.g>

        <foreignObject x="115" y="405" width="220" height="155">
          <motion.div
            xmlns="http://www.w3.org/1999/xhtml"
            className="h-full flex flex-col items-center justify-start text-center text-white px-2 pt-1 select-none"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.5 }}
          >
            <div className="border border-white/90 rounded px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm mb-2">
              SECOND PRIZE
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight drop-shadow-sm mb-1">
              {secondAmount}
            </div>
            <p className="text-[10px] text-white/95 font-medium leading-relaxed max-w-[170px] line-clamp-2">
              {secondDesc}
            </p>
            {secondTrack && (
              <span className="mt-auto px-2 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white border border-white/30">
                {secondTrack} Track
              </span>
            )}
          </motion.div>
        </foreignObject>

        <foreignObject x="320" y="325" width="260" height="235">
          <motion.div
            xmlns="http://www.w3.org/1999/xhtml"
            className="h-full flex flex-col items-center justify-start text-center text-white px-3 pt-2 select-none"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <div className="border border-white/90 rounded-md px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-sm mb-2.5">
              FIRST PRIZE
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-sm mb-1.5">
              {firstAmount}
            </div>
            <p className="text-xs text-white/95 font-medium leading-relaxed max-w-[210px] line-clamp-3">
              {firstDesc}
            </p>
            {firstTrack && (
              <span className="mt-auto px-2.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white border border-white/30">
                {firstTrack} Track
              </span>
            )}
          </motion.div>
        </foreignObject>

        <foreignObject x="560" y="445" width="220" height="115">
          <motion.div
            xmlns="http://www.w3.org/1999/xhtml"
            className="h-full flex flex-col items-center justify-start text-center text-white px-2 pt-1 select-none"
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: 0.6 }}
          >
            <div className="border border-white/90 rounded px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-sm mb-1.5">
              THIRD PRIZE
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight drop-shadow-sm mb-1">
              {thirdAmount}
            </div>
            <p className="text-[10px] text-white/95 font-medium leading-relaxed max-w-[170px] line-clamp-2">
              {thirdDesc}
            </p>
            {thirdTrack && (
              <span className="mt-auto px-2 py-0.5 rounded text-[9px] font-bold bg-white/20 text-white border border-white/30">
                {thirdTrack} Track
              </span>
            )}
          </motion.div>
        </foreignObject>
      </svg>
    </div>
  );
}

function PublicEventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [event, setEvent] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [coreTeam, setCoreTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTrackTab, setActiveTrackTab] = useState('physical');
  const [copiedLink, setCopiedLink] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    window.scrollTo(0, 0);
    if (id) {
      loadEventData();
    }
  }, [id]);

  const loadEventData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [eventRes, prizesRes, teamRes] = await Promise.allSettled([
        fetch(`http://localhost:3000/api/events/${id}`),
        fetch(`http://localhost:3000/api/event_prizes/event/${id}`),
        fetch(`http://localhost:3000/api/core_team/event/${id}`)
      ]);

      if (eventRes.status === 'fulfilled' && eventRes.value.ok) {
        const evData = await eventRes.value.json();
        setEvent(evData.event || null);

        const mode = (evData.event?.HackathonMode || '').toLowerCase();
        if (mode === 'virtual') {
          setActiveTrackTab('virtual');
        } else {
          setActiveTrackTab('physical');
        }
      } else {
        throw new Error('Event could not be loaded');
      }

      if (prizesRes.status === 'fulfilled' && prizesRes.value.ok) {
        const pzData = await prizesRes.value.json();
        setPrizes(pzData.prizes || []);
      }

      if (teamRes.status === 'fulfilled' && teamRes.value.ok) {
        const tmData = await teamRes.value.json();
        setCoreTeam(tmData.members || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!event) return;

    const targetDateStr = event.RegistrationEnd || event.StartDate;
    if (!targetDateStr) return;

    const calculateTimeLeft = () => {
      const target = new Date(targetDateStr).getTime();
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000)
      });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [event]);

  const handleRegisterClick = () => {
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const parsed = JSON.parse(rawUser);
        if (parsed?.role === 'user' || parsed?.Role === 'user' || parsed?.Id || parsed?.id) {
          navigate(`/user/events/${id}`);
          return;
        }
      } catch (e) {
      }
    }
    navigate('/user/login', { state: { redirectTo: `/user/events/${id}` } });
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return dateString;
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getPoster = () => {
    if (!event || !event.Posters) return null;
    if (Array.isArray(event.Posters) && event.Posters.length > 0) {
      return typeof event.Posters[0] === 'string' ? event.Posters[0] : event.Posters[0]?.url || null;
    }
    if (typeof event.Posters === 'string') {
      try {
        const parsed = JSON.parse(event.Posters);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0];
      } catch {
        return event.Posters;
      }
    }
    return null;
  };

  const isRegistrationClosed = useMemo(() => {
    if (!event) return false;
    const s = (event.EventStatus || '').toLowerCase();
    if (s === 'completed') return true;
    if (event.RegistrationEnd) {
      const end = new Date(event.RegistrationEnd).getTime();
      return new Date().getTime() > end;
    }
    return false;
  }, [event]);

  const splitFacilities = (text) => {
    if (!text) return [];
    return text
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-28 sm:pt-32 pb-24 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-pulse">
          <div className="h-6 w-36 rounded-lg bg-slate-200 dark:bg-zinc-900" />
          <div className="h-96 rounded-3xl bg-slate-200 dark:bg-zinc-900" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-48 rounded-2xl bg-slate-200 dark:bg-zinc-900" />
              <div className="h-64 rounded-2xl bg-slate-200 dark:bg-zinc-900" />
            </div>
            <div className="h-96 rounded-2xl bg-slate-200 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-32 pb-24 flex items-center justify-center px-4">
        <div className="max-w-md w-full p-8 rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Event Not Found</h2>
          <p className="text-sm text-slate-600 dark:text-zinc-400">
            {error || "The event you are looking for doesn't exist or is currently unavailable."}
          </p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/events"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-zinc-900 hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-900 dark:text-white text-xs font-semibold transition-all"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Explore
            </Link>
            <button
              onClick={loadEventData}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const posterImg = getPoster();
  const primaryBg = event.PrimaryColor || '#059669';
  const hasBothTracks =
    (event.HackathonMode || '').toLowerCase() === 'both' ||
    (event.HackathonMode || '').toLowerCase() === 'virtual and physical' ||
    (event.VirtualFacilities && event.PhysicalFacilities);

  const virtualFacList = splitFacilities(event.VirtualFacilities || (!event.PhysicalFacilities ? event.Facilities : ''));
  const virtualReqList = splitFacilities(event.VirtualRequirements || (!event.PhysicalRequirements ? event.Requirements : ''));
  const physicalFacList = splitFacilities(event.PhysicalFacilities || (!event.VirtualFacilities ? event.Facilities : ''));
  const physicalReqList = splitFacilities(event.PhysicalRequirements || (!event.VirtualRequirements ? event.Requirements : ''));

  const formatPrizeText = (val, fallback) => {
    if (!val) return fallback;
    const str = String(val).trim();
    const num = Number(str.replace(/[^0-9.-]+/g, ''));
    if (!isNaN(num) && num > 0) {
      return `₹${num.toLocaleString('en-IN')}`;
    }
    return str;
  };

  const physicalPrizesList = prizes.filter((p) => (p.Track || '').toLowerCase() === 'physical');
  const virtualPrizesList = prizes.filter((p) => (p.Track || '').toLowerCase() === 'virtual');
  const overallPrizesList = prizes.filter((p) => (p.Track || '').toLowerCase() === 'overall' || !p.Track);

  const hasSeparateTrackPrizes = physicalPrizesList.length > 0 || virtualPrizesList.length > 0;
  const isDualTrackEvent = hasBothTracks || (event.HackathonMode === 'Both' || event.HackathonMode === 'Virtual and Physical') || hasSeparateTrackPrizes;

  const currentTrackPrizes = isDualTrackEvent
    ? (activeTrackTab === 'virtual'
        ? (virtualPrizesList.length > 0 ? virtualPrizesList : overallPrizesList)
        : (physicalPrizesList.length > 0 ? physicalPrizesList : overallPrizesList))
    : prizes;

  const firstPrizeObj = currentTrackPrizes.find((p) => p.PrizeRank === 1) || (currentTrackPrizes.length > 0 ? currentTrackPrizes[0] : null);
  const secondPrizeObj = currentTrackPrizes.find((p) => p.PrizeRank === 2) || (currentTrackPrizes.length > 1 && currentTrackPrizes[1] !== firstPrizeObj ? currentTrackPrizes[1] : null);
  const thirdPrizeObj = currentTrackPrizes.find((p) => p.PrizeRank === 3) || (currentTrackPrizes.length > 2 && currentTrackPrizes[2] !== firstPrizeObj && currentTrackPrizes[2] !== secondPrizeObj ? currentTrackPrizes[2] : null);

  const activeTrackFallbackPool = isDualTrackEvent
    ? (activeTrackTab === 'virtual' ? (event.VirtualPrizeMoney || event.PrizeMoney) : (event.PhysicalPrizeMoney || event.PrizeMoney))
    : event.PrizeMoney;

  const firstPrizeAmount = formatPrizeText(firstPrizeObj?.Prize || (currentTrackPrizes.length === 0 ? activeTrackFallbackPool : null), activeTrackTab === 'virtual' && isDualTrackEvent ? 'Virtual Champion' : 'Grand Champion');
  const secondPrizeAmount = formatPrizeText(secondPrizeObj?.Prize, 'Runner Up');
  const thirdPrizeAmount = formatPrizeText(thirdPrizeObj?.Prize, 'Second Runner Up');

  const firstPrizeDesc = isDualTrackEvent && activeTrackTab === 'virtual'
    ? 'Virtual Grand Champion • Gold Trophy & Direct Global Incubation'
    : 'On-Campus Grand Champion • Gold Trophy & Direct Incubation Entry';

  const secondPrizeDesc = isDualTrackEvent && activeTrackTab === 'virtual'
    ? 'Virtual First Runner Up • Silver Trophy & Cloud Infrastructure Credits'
    : 'On-Campus First Runner Up • Silver Trophy & Mentorship Fast-Track';

  const thirdPrizeDesc = isDualTrackEvent && activeTrackTab === 'virtual'
    ? 'Virtual Second Runner Up • Bronze Shield & Digital Certificates'
    : 'On-Campus Second Runner Up • Bronze Shield & Hardware Swag Kits';

  const firstPrizeTrack = isDualTrackEvent ? (activeTrackTab === 'virtual' ? 'Virtual' : 'Physical') : (firstPrizeObj?.Track && firstPrizeObj.Track !== 'Overall' ? firstPrizeObj.Track : null);
  const secondPrizeTrack = isDualTrackEvent ? (activeTrackTab === 'virtual' ? 'Virtual' : 'Physical') : (secondPrizeObj?.Track && secondPrizeObj.Track !== 'Overall' ? secondPrizeObj.Track : null);
  const thirdPrizeTrack = isDualTrackEvent ? (activeTrackTab === 'virtual' ? 'Virtual' : 'Physical') : (thirdPrizeObj?.Track && thirdPrizeObj.Track !== 'Overall' ? thirdPrizeObj.Track : null);

  const additionalPrizes = currentTrackPrizes.filter((p) => p !== firstPrizeObj && p !== secondPrizeObj && p !== thirdPrizeObj);

  const showPrizesSection = Boolean(
    prizes.length > 0 ||
    event.PrizeMoney ||
    event.PhysicalPrizeMoney ||
    event.VirtualPrizeMoney ||
    activeTrackFallbackPool
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white pt-28 sm:pt-32 pb-24 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 dark:text-zinc-400">
            <Link
              to="/events"
              className="inline-flex items-center gap-1.5 font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Explore Events
            </Link>
            <span>/</span>
            <span className="text-slate-800 dark:text-zinc-200 font-semibold truncate max-w-[240px] sm:max-w-md">
              {event.EventName}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all shadow-sm"
            >
              {copiedLink ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="h-3.5 w-3.5" />
                  <span>Share Event</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative overflow-hidden rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-xl"
        >
          <div className="p-6 sm:p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  {(event.EventStatus || '').toLowerCase() === 'ongoing' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                      Live Ongoing
                    </span>
                  ) : (event.EventStatus || '').toLowerCase() === 'completed' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/30">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Event Concluded
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Clock className="h-3.5 w-3.5" />
                      Registrations Open
                    </span>
                  )}

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                    <Tag className="h-3 w-3 text-emerald-500" />
                    {event.EventType || 'Hackathon'}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                    {(() => {
                      const m = (event.HackathonMode || '').toLowerCase();
                      if (m === 'virtual') return <Monitor className="h-3 w-3 text-emerald-500" />;
                      if (m === 'physical') return <Building2 className="h-3 w-3 text-emerald-500" />;
                      if (m === 'virtual and physical' || m === 'both') return <Layers className="h-3 w-3 text-emerald-500" />;
                      if (m === 'hybrid') return <Radio className="h-3 w-3 text-emerald-500" />;
                      return <Globe className="h-3 w-3 text-emerald-500" />;
                    })()}
                    {event.HackathonMode ? `${event.HackathonMode} Mode` : 'Standard Track'}
                  </span>
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] text-slate-900 dark:text-white">
                    {event.EventName}
                  </h1>

                  {event.Description && (
                    <p className="text-sm sm:text-base text-slate-600 dark:text-zinc-300 line-clamp-3 font-normal leading-relaxed">
                      {event.Description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                    <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                        Event Dates
                      </span>
                      <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                        {formatDate(event.StartDate)} – {formatDate(event.EndDate)}
                      </span>
                    </div>
                  </div>

                  {event.Location && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                          Venue Location
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                          {event.Location}
                        </span>
                      </div>
                    </div>
                  )}

                  {event.TeamSize && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
                          Team Formation
                        </span>
                        <span className="block text-xs font-semibold text-slate-800 dark:text-zinc-200 truncate">
                          {event.TeamSize} Members per Team
                        </span>
                      </div>
                    </div>
                  )}

                  {(event.PrizeMoney || event.PhysicalPrizeMoney || event.VirtualPrizeMoney) && (
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20">
                      <div className="p-2 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                        <Trophy className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-amber-600/80 dark:text-amber-400/80">
                          Prize Bounty
                        </span>
                        <span className="block text-xs font-black text-amber-700 dark:text-amber-300 truncate">
                          {event.PrizeMoney || `${event.PhysicalPrizeMoney || ''} ${event.VirtualPrizeMoney ? `/ ${event.VirtualPrizeMoney}` : ''}`}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-zinc-800 shadow-lg group bg-slate-100 dark:bg-zinc-900 aspect-[16/10] sm:aspect-[16/9] lg:aspect-[4/3] w-full flex items-center justify-center">
                  {posterImg ? (
                    <img
                      src={posterImg}
                      alt={event.EventName}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex flex-col items-center justify-center p-6 text-center"
                      style={{
                        background:
                          theme === 'dark'
                            ? `linear-gradient(135deg, ${primaryBg}33 0%, #09090b 80%)`
                            : `linear-gradient(135deg, ${primaryBg}20 0%, #f1f5f9 80%)`
                      }}
                    >
                      <div className="w-16 h-16 rounded-2xl bg-white/20 dark:bg-white/10 backdrop-blur-md flex items-center justify-center shadow-inner mb-3">
                        <Trophy className="h-8 w-8 text-emerald-500" />
                      </div>
                      <span className="text-base font-bold text-slate-800 dark:text-white">
                        {event.EventName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                        {event.EventType || 'Hackathon'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 py-5 sm:px-8 lg:px-10 bg-slate-50/80 dark:bg-zinc-900/90 backdrop-blur-md border-t border-slate-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-5">
            <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-4 w-full md:w-auto">
              <div className="flex flex-col items-center sm:items-start gap-2.5">
                <div className="flex items-center gap-2">
                  {!isRegistrationClosed ? (
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-500"></span>
                  )}
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {isRegistrationClosed ? 'Registration Status' : 'Registration Window Closes In'}
                  </span>
                </div>

                {isRegistrationClosed ? (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-bold">
                    Registration has ended
                  </div>
                ) : (
                  <FlipCountdown timeLeft={timeLeft} />
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handleRegisterClick}
                disabled={isRegistrationClosed}
                className="w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
              >
                <span>{isRegistrationClosed ? 'Registrations Closed' : 'Register for Event'}</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

          <div className="lg:col-span-2 space-y-8">

            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                <FileText className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                  About the Challenge
                </h2>
              </div>
              <div className="text-slate-700 dark:text-zinc-300 text-sm sm:text-base leading-relaxed whitespace-pre-line space-y-3">
                {event.Description || 'No description provided.'}
              </div>
            </div>

            <div className="space-y-0">
              {hasBothTracks && (
                <div className="flex items-end gap-2 px-4 sm:px-6 relative z-10 -mb-px">
                  {[
                    { key: 'virtual', label: 'Virtual Track', icon: Monitor },
                    { key: 'physical', label: 'On-Campus Track', icon: Building2 },
                  ].map((tab) => {
                    const isActive = activeTrackTab === tab.key;
                    const IconComp = tab.icon;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setActiveTrackTab(tab.key)}
                        className="relative h-12 px-6 sm:px-8 rounded-t-2xl font-bold text-xs sm:text-sm tracking-wide flex items-center gap-2.5 transition-colors duration-200 outline-none"
                      >
                        {isActive ? (
                          <motion.div
                            layoutId="folderTabActivePill"
                            className="absolute inset-0 rounded-t-2xl bg-white dark:bg-zinc-950 border-t border-x border-b-0 border-slate-200 dark:border-zinc-800 z-10 shadow-[0_-2px_12px_rgba(0,0,0,0.03)]"
                            transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                          />
                        ) : (
                          <div className="absolute inset-0 rounded-t-2xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 z-0" />
                        )}

                        <span className={`relative z-20 flex items-center gap-2.5 ${
                          isActive
                            ? 'text-slate-900 dark:text-white'
                            : 'text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200'
                        }`}>
                          <IconComp className="h-4 w-4" />
                          <span>{tab.label}</span>
                          {isActive && (
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          )}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6 relative z-0">
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                        {activeTrackTab === 'virtual' ? 'Virtual Track Specifications & Prizes' : 'On-Campus Venue Specifications & Prizes'}
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        {activeTrackTab === 'virtual'
                          ? 'Global cloud submissions, mentor sessions, digital evaluations & track prizes'
                          : 'Physical stage pitching, lab workstations, campus food, lodging & track prizes'}
                      </p>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {activeTrackTab === 'virtual' ? (
                    <motion.div
                      key="virtual-track-specs"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {(event.VirtualStartDate || event.VirtualRegistrationStart) && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="space-y-1">
                            <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                              Virtual Registration Window
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {formatDate(event.VirtualRegistrationStart)} – {formatDate(event.VirtualRegistrationEnd)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                              Virtual Competition Timeline
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {formatDate(event.VirtualStartDate)} – {formatDate(event.VirtualEndDate)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Digital Infrastructure Provided</span>
                          </div>
                          {virtualFacList.length > 0 ? (
                            <ul className="space-y-2.5">
                              {virtualFacList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Cloud collaboration platform, discord coordination, and mentor office hours provided.
                            </p>
                          )}
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <span>Virtual Track Requirements</span>
                          </div>
                          {virtualReqList.length > 0 ? (
                            <ul className="space-y-2.5">
                              {virtualReqList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Stable internet connection, valid college ID, and GitHub / Git repository setup.
                            </p>
                          )}
                        </div>
                      </div>

                      {showPrizesSection && (
                        <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400">
                                <Trophy className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                  Virtual Track Prizes & Recognitions
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                  Cash bounties, trophies and global incubation for online innovators
                                </p>
                              </div>
                            </div>

                            {event.VirtualPrizeMoney && (
                              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20 text-xs font-black self-start sm:self-auto">
                                <Trophy className="h-3.5 w-3.5 text-cyan-500" />
                                <span>Track Pool: {event.VirtualPrizeMoney}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <PrizePodiumStage
                              key="virtual"
                              firstAmount={firstPrizeAmount}
                              firstDesc={firstPrizeDesc}
                              firstTrack={firstPrizeTrack}
                              secondAmount={secondPrizeAmount}
                              secondDesc={secondPrizeDesc}
                              secondTrack={secondPrizeTrack}
                              thirdAmount={thirdPrizeAmount}
                              thirdDesc={thirdPrizeDesc}
                              thirdTrack={thirdPrizeTrack}
                            />

                            {additionalPrizes.length > 0 && (
                              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                                  Special Recognitions & Track Awards
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {additionalPrizes.map((pz, idx) => (
                                    <div
                                      key={pz.Id || idx}
                                      className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                          <Medal className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                            {pz.PrizeRank ? `Rank ${pz.PrizeRank}` : 'Special Award'}
                                          </div>
                                          {pz.Track && (
                                            <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                                              {pz.Track} Track
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                                        {formatPrizeText(pz.Prize, pz.Prize)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="physical-track-specs"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-6"
                    >
                      {(event.PhysicalStartDate || event.PhysicalRegistrationStart) && (
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                          <div className="space-y-1">
                            <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                              Campus Registration Window
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {formatDate(event.PhysicalRegistrationStart)} – {formatDate(event.PhysicalRegistrationEnd)}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-slate-400 dark:text-zinc-500 font-bold uppercase tracking-wider text-[10px] block">
                              In-Person Hackathon Window
                            </span>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {formatDate(event.PhysicalStartDate)} – {formatDate(event.PhysicalEndDate)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4" />
                            <span>Campus Amenities & Lab Facilities</span>
                          </div>
                          {physicalFacList.length > 0 ? (
                            <ul className="space-y-2.5">
                              {physicalFacList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-2 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              High-speed campus Wi-Fi, power workstations, overnight lodging, meals & snacks provided.
                            </p>
                          )}
                        </div>

                        <div className="p-5 rounded-2xl bg-slate-50/70 dark:bg-zinc-900/40 border border-slate-200 dark:border-zinc-800 space-y-3">
                          <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4" />
                            <span>On-Campus Prerequisites</span>
                          </div>
                          {physicalReqList.length > 0 ? (
                            <ul className="space-y-2.5">
                              {physicalReqList.map((item, idx) => (
                                <li key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-zinc-300">
                                  <span className="h-1.5 w-1.5 rounded-full bg-teal-500 mt-2 shrink-0" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-slate-500 dark:text-zinc-400">
                              Original college ID card, personal laptop with development environment, and approval letter.
                            </p>
                          )}
                        </div>
                      </div>

                      {showPrizesSection && (
                        <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80 space-y-6">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                <Trophy className="h-5 w-5" />
                              </div>
                              <div>
                                <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                                  On-Campus Track Prizes & Recognitions
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                                  Cash bounties, trophies and incubation fast-track for campus participants
                                </p>
                              </div>
                            </div>

                            {event.PhysicalPrizeMoney && (
                              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-xs font-black self-start sm:self-auto">
                                <Trophy className="h-3.5 w-3.5 text-amber-500" />
                                <span>Track Pool: {event.PhysicalPrizeMoney}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <PrizePodiumStage
                              key="physical"
                              firstAmount={firstPrizeAmount}
                              firstDesc={firstPrizeDesc}
                              firstTrack={firstPrizeTrack}
                              secondAmount={secondPrizeAmount}
                              secondDesc={secondPrizeDesc}
                              secondTrack={secondPrizeTrack}
                              thirdAmount={thirdPrizeAmount}
                              thirdDesc={thirdPrizeDesc}
                              thirdTrack={thirdPrizeTrack}
                            />

                            {additionalPrizes.length > 0 && (
                              <div className="pt-6 border-t border-slate-100 dark:border-zinc-800/80">
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400 mb-3">
                                  Special Recognitions & Track Awards
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                                  {additionalPrizes.map((pz, idx) => (
                                    <div
                                      key={pz.Id || idx}
                                      className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 flex items-center justify-between gap-3"
                                    >
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-slate-200/80 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300">
                                          <Medal className="h-4 w-4" />
                                        </div>
                                        <div>
                                          <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                                            {pz.PrizeRank ? `Rank ${pz.PrizeRank}` : 'Special Award'}
                                          </div>
                                          {pz.Track && (
                                            <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                                              {pz.Track} Track
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                      <div className="text-sm font-black font-mono text-slate-900 dark:text-white">
                                        {formatPrizeText(pz.Prize, pz.Prize)}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {coreTeam.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-6">
                <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-zinc-800/80">
                  <Users className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                    Organizing Committee & Leads
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {coreTeam.map((member, idx) => (
                    <div
                      key={member.Id || idx}
                      className="p-4 rounded-2xl bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center gap-3.5"
                    >
                      {member.Photo ? (
                        <img
                          src={member.Photo}
                          alt={member.Name}
                          className="w-12 h-12 rounded-xl object-cover border border-emerald-500/20 shrink-0"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-emerald-600/10 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold text-sm shrink-0">
                          {(member.Name || 'U').charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {member.Name}
                        </h4>
                        <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          {member.Role}
                        </p>
                        {member.Department && (
                          <p className="text-[11px] text-slate-500 dark:text-zinc-400 truncate">
                            {member.Department}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6 sticky top-24">

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-md space-y-6">
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                  Participation Details
                </span>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                  Ready to Build?
                </h3>
              </div>

              <div className="space-y-3.5 text-xs text-slate-700 dark:text-zinc-300">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Allowed Team Size</span>
                  <span className="font-bold text-slate-900 dark:text-white">{event.TeamSize || 'Flexible'} Members</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Registration Begins</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(event.RegistrationStart)}</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Registration Closes</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(event.RegistrationEnd)}</span>
                </div>

                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-zinc-800">
                  <span className="text-slate-500 dark:text-zinc-400">Hackathon Dates</span>
                  <span className="font-bold text-slate-900 dark:text-white">{formatDate(event.StartDate)}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-zinc-400">Format</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{event.HackathonMode || 'Online & Campus'}</span>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleRegisterClick}
                  disabled={isRegistrationClosed}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm tracking-wide shadow-md shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
                >
                  <span>{isRegistrationClosed ? 'Registration Concluded' : 'Register Now'}</span>
                  <ChevronRight className="h-4 w-4" />
                </button>

                <p className="text-[11px] text-center text-slate-500 dark:text-zinc-400">
                  Free student entry. Sign in or create an account to submit your team details.
                </p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-sm space-y-4">
              <div className="flex items-center gap-2.5 text-slate-900 dark:text-white font-bold text-sm">
                <MapPin className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>Host Location & Venue</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                {event.Location || 'Campus Main Auditorium & Department Innovation Lab. Directions will be shared with shortlisted teams.'}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-100/60 dark:bg-zinc-900/40 border border-slate-200/80 dark:border-zinc-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
                <Info className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Need Assistance?</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-zinc-400 leading-relaxed">
                Have questions regarding guidelines, hardware requirements, or accommodation? Contact event leads through your student dashboard.
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

export default PublicEventDetails;
