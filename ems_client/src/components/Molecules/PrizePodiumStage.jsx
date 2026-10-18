import React from 'react';
import { motion } from 'framer-motion';

export default function PrizePodiumStage({
  firstAmount = '—',
  firstDesc = 'Grand Champion',
  firstTrack,
  secondAmount = '—',
  secondDesc = 'First Runner Up',
  secondTrack,
  thirdAmount = '—',
  thirdDesc = 'Second Runner Up',
  thirdTrack
}) {
  return (
    <div className="relative pt-4 sm:pt-6 pb-2 max-w-3xl mx-auto">
      <svg
        viewBox="0 0 900 590"
        className="w-full h-auto select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="podiumGroundBlurShared" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>

          <filter id="centerDropShadowShared" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#000000" floodOpacity="0.35" />
          </filter>

          <linearGradient id="amberPedestalGradShared" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EA580C" />
            <stop offset="30%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#9A3412" />
          </linearGradient>

          <linearGradient id="greenPedestalGradShared" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="40%" stopColor="#047857" />
            <stop offset="100%" stopColor="#064E3B" />
          </linearGradient>

          <linearGradient id="bluePedestalGradShared" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0284C7" />
            <stop offset="40%" stopColor="#0369A1" />
            <stop offset="100%" stopColor="#075985" />
          </linearGradient>

          <linearGradient id="trophyGoldShared" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="25%" stopColor="#FACC15" />
            <stop offset="60%" stopColor="#EAB308" />
            <stop offset="100%" stopColor="#CA8A04" />
          </linearGradient>
          <linearGradient id="goldHighlightShared" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FEF9C3" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>

          <linearGradient id="trophySilverShared" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="30%" stopColor="#E2E8F0" />
            <stop offset="65%" stopColor="#94A3B8" />
            <stop offset="100%" stopColor="#64748B" />
          </linearGradient>
          <linearGradient id="silverHighlightShared" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#CBD5E1" />
          </linearGradient>

          <linearGradient id="trophyBronzeShared" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFEDD5" />
            <stop offset="30%" stopColor="#FB923C" />
            <stop offset="70%" stopColor="#C2410C" />
            <stop offset="100%" stopColor="#7C2D12" />
          </linearGradient>
          <linearGradient id="bronzeHighlightShared" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FED7AA" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        <ellipse
          cx="450"
          cy="572"
          rx="380"
          ry="16"
          fill="rgba(0,0,0,0.22)"
          filter="url(#podiumGroundBlurShared)"
        />

        {/* Silver Pedestal (2nd place - left) */}
        <g id="pedestal-left">
          <polygon points="110,360 340,360 355,390 110,390" fill="#F59E0B" />
          <polygon points="110,390 360,390 360,570 120,570" fill="url(#amberPedestalGradShared)" />
        </g>

        {/* Bronze Pedestal (3rd place - right) */}
        <g id="pedestal-right">
          <polygon points="560,405 790,405 790,430 540,430" fill="#38BDF8" />
          <polygon points="540,430 790,430 780,570 540,570" fill="url(#bluePedestalGradShared)" />
        </g>

        {/* Gold Pedestal (1st place - center) */}
        <g id="pedestal-center">
          <polygon points="330,270 570,270 590,300 310,300" fill="#10B981" />
          <polygon points="310,300 590,300 575,570 325,570" fill="url(#greenPedestalGradShared)" filter="url(#centerDropShadowShared)" />
        </g>

        {/* Silver Trophy Group (2nd) */}
        <g id="silver-trophy-group">
          <rect x="185" y="340" width="80" height="20" rx="2" fill="#3E181D" stroke="#5C252B" strokeWidth="1.2" />
          <line x1="190" y1="342" x2="260" y2="342" stroke="#87353E" strokeWidth="1" />
          <rect x="204" y="333" width="42" height="7" rx="1.5" fill="url(#silverHighlightShared)" stroke="#475569" strokeWidth="1.2" />
          <path d="M 216 317 L 234 317 L 244 333 L 206 333 Z" fill="url(#trophySilverShared)" stroke="#475569" strokeWidth="1.5" />
          <path d="M 218 318 L 223 318 L 214 331 L 209 331 Z" fill="#FFFFFF" fillOpacity="0.7" />
          <rect x="220" y="299" width="10" height="18" fill="url(#trophySilverShared)" stroke="#475569" strokeWidth="1.5" />
          <ellipse cx="225" cy="301" rx="6.5" ry="2" fill="#FFFFFF" />
          <ellipse cx="225" cy="317" rx="7.5" ry="2" fill="#94A3B8" stroke="#475569" strokeWidth="1.2" />
          <path d="M 197 238 C 163 238 158 270 182 292 C 190 298 197 295 198 290 C 194 288 188 284 185 275 C 179 263 183 251 198 249 Z" fill="url(#trophySilverShared)" stroke="#475569" strokeWidth="1.8" />
          <circle cx="197" cy="292" r="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
          <path d="M 253 238 C 287 238 292 270 268 292 C 260 298 253 295 252 290 C 256 288 262 284 265 275 C 271 263 267 251 252 249 Z" fill="url(#trophySilverShared)" stroke="#475569" strokeWidth="1.8" />
          <circle cx="253" cy="292" r="3" fill="#CBD5E1" stroke="#475569" strokeWidth="1.2" />
          <path d="M 194 234 L 256 234 L 252 268 C 250 286 240 299 225 299 C 210 299 200 286 198 268 Z" fill="url(#trophySilverShared)" stroke="#475569" strokeWidth="1.8" />
          <path d="M 199 237 L 212 237 L 209 268 C 207 281 204 289 200 292 C 199 287 197 277 198 268 Z" fill="#FFFFFF" fillOpacity="0.75" />
          <rect x="190" y="228" width="70" height="7" rx="2.5" fill="url(#silverHighlightShared)" stroke="#475569" strokeWidth="1.6" />
          <rect x="193" y="224" width="64" height="5" rx="1.5" fill="#FFFFFF" stroke="#475569" strokeWidth="1.2" />
          <circle cx="225" cy="266" r="14.5" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <circle cx="225" cy="266" r="11.5" fill="#475569" />
          <text x="225" y="271.5" textAnchor="middle" fontSize="15" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#FFFFFF">2</text>
        </g>

        {/* Gold Trophy Group (1st) */}
        <g id="gold-trophy-group">
          <rect x="400" y="246" width="100" height="24" rx="2" fill="#3E181D" stroke="#5C252B" strokeWidth="1.5" />
          <line x1="408" y1="248" x2="492" y2="248" stroke="#87353E" strokeWidth="1" />
          <rect x="424" y="238" width="52" height="8" rx="2" fill="url(#goldHighlightShared)" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 439 218 L 461 218 L 472 238 L 428 238 Z" fill="url(#trophyGoldShared)" stroke="#B45309" strokeWidth="2" />
          <path d="M 441 220 L 447 220 L 437 236 L 430 236 Z" fill="#FEF08A" fillOpacity="0.6" />
          <rect x="444" y="196" width="12" height="22" fill="url(#trophyGoldShared)" stroke="#B45309" strokeWidth="1.8" />
          <ellipse cx="450" cy="198" rx="8" ry="2.5" fill="#FEF08A" />
          <ellipse cx="450" cy="218" rx="9" ry="2.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 416 122 C 374 122 368 162 398 188 C 408 196 416 192 418 186 C 413 184 406 178 402 168 C 394 153 399 138 418 136 Z" fill="url(#trophyGoldShared)" stroke="#B45309" strokeWidth="2" />
          <circle cx="417" cy="188" r="3.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 484 122 C 526 122 532 162 502 188 C 492 196 484 192 482 186 C 487 184 494 178 498 168 C 506 153 501 138 482 136 Z" fill="url(#trophyGoldShared)" stroke="#B45309" strokeWidth="2" />
          <circle cx="483" cy="188" r="3.5" fill="#FACC15" stroke="#B45309" strokeWidth="1.5" />
          <path d="M 412 118 L 488 118 L 483 158 C 480 180 468 196 450 196 C 432 196 420 180 417 158 Z" fill="url(#trophyGoldShared)" stroke="#B45309" strokeWidth="2" />
          <path d="M 418 122 L 434 122 L 430 158 C 428 174 424 184 420 188 C 418 182 416 170 417 158 Z" fill="#FEF08A" fillOpacity="0.55" />
          <rect x="408" y="110" width="84" height="9" rx="3" fill="url(#goldHighlightShared)" stroke="#B45309" strokeWidth="2" />
          <rect x="412" y="105" width="76" height="6" rx="2" fill="#FEF9C3" stroke="#B45309" strokeWidth="1.5" />
          <circle cx="450" cy="156" r="18" fill="#FDE047" stroke="#B45309" strokeWidth="2.5" />
          <circle cx="450" cy="156" r="14.5" fill="#D97706" />
          <text x="450" y="162.5" textAnchor="middle" fontSize="19" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#FFFFFF">1</text>
        </g>

        {/* Bronze Trophy Group (3rd) */}
        <g id="bronze-trophy-group">
          <rect x="638" y="387" width="74" height="18" rx="2" fill="#3E181D" stroke="#5C252B" strokeWidth="1.2" />
          <line x1="644" y1="389" x2="706" y2="389" stroke="#87353E" strokeWidth="1" />
          <rect x="655" y="380" width="40" height="7" rx="1.5" fill="url(#bronzeHighlightShared)" stroke="#7C2D12" strokeWidth="1.2" />
          <path d="M 666 364 L 684 364 L 693 380 L 657 380 Z" fill="url(#trophyBronzeShared)" stroke="#7C2D12" strokeWidth="1.6" />
          <path d="M 668 365 L 673 365 L 664 378 L 660 378 Z" fill="#FED7AA" fillOpacity="0.6" />
          <rect x="670" y="347" width="10" height="17" fill="url(#trophyBronzeShared)" stroke="#7C2D12" strokeWidth="1.5" />
          <ellipse cx="675" cy="349" rx="6" ry="2" fill="#FFEDD5" />
          <ellipse cx="675" cy="364" rx="7" ry="2" fill="#EA580C" stroke="#7C2D12" strokeWidth="1.2" />
          <path d="M 649 292 C 618 292 613 322 635 342 C 642 347 648 344 649 340 C 646 338 640 334 638 326 C 632 315 636 304 650 302 Z" fill="url(#trophyBronzeShared)" stroke="#7C2D12" strokeWidth="1.8" />
          <circle cx="649" cy="342" r="2.8" fill="#FDBA74" stroke="#7C2D12" strokeWidth="1.2" />
          <path d="M 701 292 C 732 292 737 322 715 342 C 708 347 702 344 701 340 C 704 338 710 334 712 326 C 718 315 714 304 700 302 Z" fill="url(#trophyBronzeShared)" stroke="#7C2D12" strokeWidth="1.8" />
          <circle cx="701" cy="342" r="2.8" fill="#FDBA74" stroke="#7C2D12" strokeWidth="1.2" />
          <path d="M 646 288 L 704 288 L 700 319 C 698 335 689 347 675 347 C 661 347 652 335 650 319 Z" fill="url(#trophyBronzeShared)" stroke="#7C2D12" strokeWidth="1.8" />
          <path d="M 651 291 L 663 291 L 660 319 C 658 331 655 338 652 341 C 651 336 649 327 650 319 Z" fill="#FED7AA" fillOpacity="0.65" />
          <rect x="642" y="282" width="66" height="7" rx="2.5" fill="url(#bronzeHighlightShared)" stroke="#7C2D12" strokeWidth="1.5" />
          <rect x="645" y="278" width="60" height="5" rx="1.5" fill="#FFEDD5" stroke="#7C2D12" strokeWidth="1.2" />
          <circle cx="675" cy="317" r="13.5" fill="#FDBA74" stroke="#7C2D12" strokeWidth="2" />
          <circle cx="675" cy="317" r="10.5" fill="#7C2D12" />
          <text x="675" y="322" textAnchor="middle" fontSize="14" fontWeight="900" fontFamily="system-ui, sans-serif" fill="#FFFFFF">3</text>
        </g>

        {/* Text Cards on Pedestals */}
        <foreignObject x="115" y="405" width="220" height="155">
          <div className="h-full flex flex-col items-center justify-start text-center text-white px-2 pt-1 select-none">
            <div className="border border-white/90 rounded px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-xs mb-2">
              SECOND PRIZE
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight drop-shadow-xs mb-1">
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
          </div>
        </foreignObject>

        <foreignObject x="320" y="325" width="260" height="235">
          <div className="h-full flex flex-col items-center justify-start text-center text-white px-3 pt-2 select-none">
            <div className="border border-white/90 rounded-md px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs mb-2.5">
              FIRST PRIZE
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight drop-shadow-xs mb-1.5">
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
          </div>
        </foreignObject>

        <foreignObject x="560" y="445" width="220" height="115">
          <div className="h-full flex flex-col items-center justify-start text-center text-white px-2 pt-1 select-none">
            <div className="border border-white/90 rounded px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-white shadow-xs mb-1.5">
              THIRD PRIZE
            </div>
            <div className="text-xl sm:text-2xl font-black text-white font-mono tracking-tight drop-shadow-xs mb-1">
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
          </div>
        </foreignObject>
      </svg>
    </div>
  );
}
