import { Slab } from "./ProductArt";

/* Hero and story still-lifes. Pure illustration; layers carry classes for GSAP. */

const CALLETS: [number, number, number][] = [
  [118, 512, -12],
  [150, 540, 18],
  [430, 520, 8],
  [468, 548, -20],
  [500, 506, 30],
  [392, 556, -6],
  [84, 548, 22],
  [196, 566, -14],
  [540, 560, 12],
  [352, 532, 26],
];

function Callet({ x, y, r }: { x: number; y: number; r: number }) {
  return (
    <g transform={`rotate(${r} ${x} ${y})`}>
      <ellipse cx={x} cy={y + 3} rx="17" ry="9" fill="#120c0a" opacity="0.5" />
      <ellipse cx={x} cy={y} rx="16" ry="10.5" fill="#2a1912" />
      <ellipse cx={x - 3} cy={y - 3} rx="10" ry="5" fill="#4a2e1f" />
      <ellipse cx={x - 6} cy={y - 5} rx="4" ry="1.6" fill="#b78a66" opacity="0.6" />
    </g>
  );
}

function Shard({ d, x, y, r }: { d: string; x: number; y: number; r: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${r})`}>
      <path d={d} fill="#2b1a12" transform="translate(4 7)" opacity="0.6" />
      <path d={d} fill="#3a2419" />
      <path d={d} fill="none" stroke="#5c3b29" strokeWidth="1.2" />
      <path d="M-30 -4 L34 -10" stroke="#1d110c" strokeWidth="1.6" />
      <path d="M2 -26 L6 26" stroke="#1d110c" strokeWidth="1.6" />
    </g>
  );
}

export function HeroArt() {
  return (
    <svg viewBox="0 0 600 620" role="img" aria-labelledby="hero-art-title" focusable="false">
      <title id="hero-art-title">Illustration: a slab of dark chocolate with broken shards, couverture drops, a vanilla pod and a copper spoon of cocoa</title>
      <defs>
        <radialGradient id="hero-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#a77953" stopOpacity="0.55" />
          <stop offset="1" stopColor="#a77953" stopOpacity="0" />
        </radialGradient>
        <filter id="hero-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="4" />
          <feColorMatrix values="0 0 0 0 0.42  0 0 0 0 0.27  0 0 0 0 0.19  0 0 0 1.1 -0.35" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="dust-fall" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#6b4632" stopOpacity="0.9" />
          <stop offset="1" stopColor="#6b4632" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e2b88f" />
          <stop offset="0.5" stopColor="#a77953" />
          <stop offset="1" stopColor="#6e4a30" />
        </linearGradient>
      </defs>
      <ellipse className="h-glow" cx="320" cy="300" rx="300" ry="260" fill="url(#hero-glow)" />
      <g className="h-dust" data-depth="0.25">
        <ellipse cx="300" cy="560" rx="260" ry="40" fill="url(#dust-fall)" opacity="0.7" />
        <ellipse cx="300" cy="560" rx="250" ry="38" fill="#6b4632" filter="url(#hero-noise)" opacity="0.8" />
      </g>
      <g className="h-slab" data-depth="0.5">
        <g transform="translate(-40 40) scale(1.45)">
          <ellipse cx="210" cy="345" rx="150" ry="30" fill="#000" opacity="0.35" />
          <Slab cols={4} rows={3} />
        </g>
      </g>
      <g className="h-pod" data-depth="0.7">
        <path d="M60 470 C180 430 320 450 520 404" stroke="#1d110c" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M60 470 C180 430 320 450 520 404" stroke="#4a2e1f" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.9" />
        <path d="M120 452 C200 432 300 440 420 418" stroke="#7a5236" strokeWidth="1" fill="none" opacity="0.8" />
      </g>
      <g className="h-spoon" data-depth="0.9">
        <path d="M420 300 L560 220" stroke="url(#copper)" strokeWidth="9" strokeLinecap="round" />
        <ellipse cx="400" cy="314" rx="54" ry="30" fill="url(#copper)" transform="rotate(-24 400 314)" />
        <ellipse cx="400" cy="308" rx="44" ry="20" fill="#5a3a26" transform="rotate(-24 400 308)" />
        <ellipse cx="400" cy="306" rx="44" ry="20" fill="#6b4632" filter="url(#hero-noise)" transform="rotate(-24 400 306)" />
      </g>
      <g className="h-shards" data-depth="1.1">
        <g className="h-shard">
          <Shard d="M-46 -30 L40 -40 L54 18 L8 44 L-50 30 Z" x={150} y={170} r={-18} />
        </g>
        <g className="h-shard">
          <Shard d="M-34 -26 L38 -20 L30 30 L-40 22 Z" x={470} y={150} r={22} />
        </g>
        <g className="h-shard">
          <Shard d="M-30 -20 L26 -30 L36 14 L-20 28 Z" x={520} y={430} r={-8} />
        </g>
      </g>
      <g className="h-callets" data-depth="1.3">
        {CALLETS.map(([x, y, r], i) => (
          <g key={i} className="h-callet">
            <Callet x={x} y={y} r={r} />
          </g>
        ))}
      </g>
    </svg>
  );
}

export function StoryArt() {
  return (
    <svg viewBox="0 0 600 600" role="img" aria-labelledby="story-art-title" focusable="false">
      <title id="story-art-title">Illustration: cocoa texture close-up, a tempered chocolate slab and falling couverture drops</title>
      <defs>
        <filter id="story-noise" x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.55" numOctaves="3" seed="9" />
          <feColorMatrix values="0 0 0 0 0.45  0 0 0 0 0.29  0 0 0 0 0.2  0 0 0 1.4 -0.45" />
          <feComposite in2="SourceGraphic" operator="in" />
        </filter>
        <radialGradient id="macro-vignette" cx="0.5" cy="0.45" r="0.55">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#000" stopOpacity="0.65" />
        </radialGradient>
        <clipPath id="slab-top">
          <path d="M92 298 L248 236 L330 298 L174 360 Z" />
        </clipPath>
        <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.38" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <g className="st-macro">
        <circle cx="300" cy="290" r="230" fill="#3b2619" />
        <circle cx="300" cy="290" r="230" fill="#6b4632" filter="url(#story-noise)" />
        <circle cx="300" cy="290" r="230" fill="url(#macro-vignette)" />
        <circle cx="300" cy="290" r="230" fill="none" stroke="#a77953" strokeOpacity="0.35" />
      </g>
      <g className="st-slab">
        <g transform="translate(60 -40) scale(1.25)">
          <ellipse cx="210" cy="350" rx="160" ry="30" fill="#000" opacity="0.4" />
          <Slab cols={4} rows={3} />
        </g>
        <g clipPath="url(#slab-top)" transform="translate(60 -40) scale(1.25)" style={{ mixBlendMode: "screen" }}>
          <rect className="st-sheen" x="-80" y="200" width="90" height="300" fill="url(#sheen)" transform="rotate(18 0 300)" />
        </g>
      </g>
      <g className="st-callets">
        {[
          [120, 500, 10],
          [170, 530, -14],
          [430, 510, 20],
          [480, 540, -8],
          [380, 560, 14],
          [230, 556, -22],
        ].map(([x, y, r], i) => (
          <g key={i} className="st-callet">
            <Callet x={x!} y={y!} r={r!} />
          </g>
        ))}
      </g>
    </svg>
  );
}
