import { memo, useId, type ReactNode } from "react";
import type { ArtProp, ArtShape, ProductArt as ArtSpec } from "../data/types";

/*
 * Illustrative product "packshots" drawn in SVG. They are conceptual renders,
 * deliberately not photographs, so nothing implies these are the store's real
 * products or packaging. view 0 = packshot, 1 = detail crop, 2 = styled still life.
 */

function hex(c: string): [number, number, number] {
  const h = c.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
export function mix(a: string, b: string, t: number): string {
  const [r1, g1, b1] = hex(a);
  const [r2, g2, b2] = hex(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t).toString(16).padStart(2, "0");
  return `#${m(r1, r2)}${m(g1, g2)}${m(b1, b2)}`;
}
const shade = (c: string, t: number) => mix(c, "#000000", t);
const tint = (c: string, t: number) => mix(c, "#ffffff", t);
function isDark(c: string): boolean {
  const [r, g, b] = hex(c);
  return 0.299 * r + 0.587 * g + 0.114 * b < 110;
}

interface Ids {
  bg: string;
  light: string;
  cyl: string;
  flat: string;
  metal: string;
  glass: string;
  shadow: string;
  pearl: string;
  gold: string;
}

// Warm shadow tone: packaging shading leans cocoa rather than grey, like studio light on kraft and paper.
const warm = (c: string, t: number) => mix(c, "#3b2a20", t);

function Defs({ ids, art }: { ids: Ids; art: ArtSpec }) {
  const b = art.body;
  return (
    <defs>
      <linearGradient id={ids.bg} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor={tint(art.backdrop, isDark(art.backdrop) ? 0.08 : 0.25)} />
        <stop offset="0.68" stopColor={art.backdrop} />
        <stop offset="1" stopColor={shade(art.backdrop, 0.12)} />
      </linearGradient>
      <radialGradient id={ids.light} cx="0.3" cy="0.22" r="0.75">
        <stop offset="0" stopColor="#ffffff" stopOpacity={isDark(art.backdrop) ? 0.16 : 0.45} />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id={ids.cyl} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor={warm(b, 0.35)} />
        <stop offset="0.22" stopColor={tint(b, 0.18)} />
        <stop offset="0.45" stopColor={b} />
        <stop offset="0.85" stopColor={warm(b, 0.22)} />
        <stop offset="1" stopColor={warm(b, 0.4)} />
      </linearGradient>
      <linearGradient id={ids.flat} x1="0" y1="0" x2="1" y2="0.3">
        <stop offset="0" stopColor={warm(b, 0.14)} />
        <stop offset="0.35" stopColor={tint(b, 0.1)} />
        <stop offset="1" stopColor={warm(b, 0.18)} />
      </linearGradient>
      <linearGradient id={ids.metal} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#8d918f" />
        <stop offset="0.3" stopColor="#f2f3f1" />
        <stop offset="0.55" stopColor="#b7bbb8" />
        <stop offset="0.8" stopColor="#e6e8e5" />
        <stop offset="1" stopColor="#7c807e" />
      </linearGradient>
      <linearGradient id={ids.glass} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stopColor="#ffffff" stopOpacity="0.5" />
        <stop offset="0.15" stopColor="#ffffff" stopOpacity="0.08" />
        <stop offset="0.8" stopColor="#ffffff" stopOpacity="0.04" />
        <stop offset="1" stopColor="#ffffff" stopOpacity="0.35" />
      </linearGradient>
      <radialGradient id={ids.shadow} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stopColor="#000" stopOpacity={isDark(art.backdrop) ? 0.55 : 0.32} />
        <stop offset="1" stopColor="#000" stopOpacity="0" />
      </radialGradient>
      <radialGradient id={ids.pearl} cx="0.35" cy="0.3" r="0.7">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.6" stopColor={tint(art.accent, 0.55)} />
        <stop offset="1" stopColor={shade(art.accent, 0.1)} />
      </radialGradient>
      <linearGradient id={ids.gold} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#f3dca4" />
        <stop offset="0.45" stopColor="#c99a5b" />
        <stop offset="0.7" stopColor="#f0d394" />
        <stop offset="1" stopColor="#9a6c35" />
      </linearGradient>
    </defs>
  );
}

function Label({ x, y, w, h, art, dark = false }: { x: number; y: number; w: number; h: number; art: ArtSpec; dark?: boolean }) {
  const paper = dark ? shade(art.body, 0.15) : "#FBF7F0";
  const ink = dark ? art.accent : "#2a201c";
  const fs = Math.min(26, (w * 1.6) / Math.max(4, art.label.length));
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={paper} opacity={dark ? 0.9 : 0.96} />
      <rect x={x + 6} y={y + 6} width={w - 12} height={h - 12} fill="none" stroke={art.accent} strokeWidth="0.8" opacity="0.7" />
      <text x={x + w / 2} y={y + 24} textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif" fontSize={w < 116 ? 6.2 : 7.5} fontWeight="600" letterSpacing={w < 116 ? 1.4 : 2.6} fill={ink} opacity="0.75">
        FINE BAKING
      </text>
      <text x={x + w / 2} y={y + h / 2 + fs / 3 + 4} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize={fs} fontWeight="600" fill={ink} letterSpacing="1">
        {art.label}
      </text>
      <line x1={x + w / 2 - 14} x2={x + w / 2 + 14} y1={y + h - 20} y2={y + h - 20} stroke={art.accent} strokeWidth="1" />
    </g>
  );
}

function Shape({ shape, art, ids }: { shape: ArtShape; art: ArtSpec; ids: Ids }): ReactNode {
  const b = art.body;
  const a = art.accent;
  switch (shape) {
    case "bag":
      return (
        <g>
          <path d="M118 168 L282 168 L290 418 L110 418 Z" fill={`url(#${ids.flat})`} />
          <path d="M118 168 L140 168 L134 418 L110 418 Z" fill={shade(b, 0.12)} opacity="0.5" />
          <path d="M118 168 L132 152 L146 168 L160 152 L174 168 L188 152 L202 168 L216 152 L230 168 L244 152 L258 168 L272 152 L282 168 Z" fill={shade(b, 0.06)} />
          <rect x="118" y="168" width="164" height="16" fill={shade(b, 0.1)} />
          <path d="M110 418 L290 418 L286 404 L114 404 Z" fill={shade(b, 0.18)} />
          <path d="M140 190 L146 404" stroke={shade(b, 0.12)} strokeWidth="1" opacity="0.6" />
          <Label x={142} y={238} w={116} h={118} art={art} />
        </g>
      );
    case "pouch": {
      const dark = isDark(b);
      return (
        <g>
          <path d="M122 132 L278 132 L288 396 Q288 420 264 420 L136 420 Q112 420 112 396 Z" fill={`url(#${ids.cyl})`} />
          <rect x="122" y="132" width="156" height="22" fill={shade(b, 0.12)} />
          <line x1="122" x2="278" y1="164" y2="164" stroke={shade(b, 0.3)} strokeWidth="2" strokeDasharray="1 3" />
          <circle cx="132" cy="143" r="3" fill={art.backdrop} />
          <path d="M112 396 Q200 386 288 396" stroke={shade(b, 0.25)} strokeWidth="1.5" fill="none" />
          <Label x={140} y={206} w={120} h={124} art={art} dark={dark} />
          {art.prop === "callets" && (
            <g>
              <circle cx="200" cy="364" r="20" fill={shade(b, 0.25)} stroke={a} strokeWidth="1" />
              {[[192, 360], [206, 356], [200, 370], [210, 368], [190, 371]].map(([x, y], i) => (
                <ellipse key={i} cx={x} cy={y} rx="5" ry="3.6" fill={tint(b, 0.08)} stroke={shade(b, 0.4)} strokeWidth="0.6" />
              ))}
            </g>
          )}
        </g>
      );
    }
    case "tin":
      return (
        <g>
          <rect x="134" y="214" width="132" height="200" fill={`url(#${ids.cyl})`} />
          <ellipse cx="200" cy="414" rx="66" ry="12" fill={shade(b, 0.35)} />
          <rect x="130" y="196" width="140" height="26" fill={a} />
          <rect x="130" y="196" width="140" height="26" fill={`url(#${ids.glass})`} />
          <ellipse cx="200" cy="196" rx="70" ry="14" fill={tint(a, 0.15)} />
          <ellipse cx="200" cy="196" rx="58" ry="10" fill="none" stroke={shade(a, 0.15)} strokeWidth="1" />
          <rect x="134" y="262" width="132" height="96" fill={isDark(b) ? shade(b, 0.2) : "#FBF7F0"} opacity="0.92" />
          <text x="200" y="285" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif" fontSize="7" fontWeight="600" letterSpacing="3" fill={isDark(b) ? a : "#2a201c"}>FINE BAKING</text>
          <text x="200" y="324" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize={Math.min(28, 190 / Math.max(4, art.label.length))} fontWeight="600" fill={isDark(b) ? a : "#2a201c"} letterSpacing="1">
            {art.label}
          </text>
          <line x1="186" x2="214" y1="340" y2="340" stroke={a} />
        </g>
      );
    case "jar":
    case "leaf": {
      const short = shape === "leaf";
      const top = short ? 290 : 214;
      const contents = art.prop;
      return (
        <g>
          <rect x={short ? 150 : 130} y={top} width={short ? 100 : 140} height={418 - top} rx="14" fill={short ? "#1b1513" : tint(b, 0.2)} opacity={short ? 0.85 : 0.9} />
          {/* contents */}
          <g clipPath="none">
            {contents === "pearls" &&
              Array.from({ length: 34 }, (_, i) => (
                <circle key={i} cx={142 + ((i * 37) % 116)} cy={300 + ((i * 53) % 108)} r={6} fill={`url(#${ids.pearl})`} />
              ))}
            {contents === "sprinkles" &&
              Array.from({ length: 70 }, (_, i) => {
                const palette = ["#E9B7B0", "#B9C9A8", "#F2D7A0", "#A9C2D6", "#D8A0B9", "#F5F0E8"];
                const x = 140 + ((i * 41) % 120);
                const y = 296 + ((i * 29) % 112);
                return <rect key={i} x={x} y={y} width="9" height="3.4" rx="1.7" fill={palette[i % palette.length]} transform={`rotate(${(i * 47) % 180} ${x} ${y})`} />;
              })}
            {contents === "leaf" &&
              Array.from({ length: 14 }, (_, i) => {
                const x = 160 + ((i * 29) % 80);
                const y = 320 + ((i * 41) % 84);
                return <path key={i} d={`M${x} ${y} l9 -4 l5 7 l-8 6 z`} fill={`url(#${ids.gold})`} transform={`rotate(${(i * 61) % 360} ${x} ${y})`} />;
              })}
          </g>
          <rect x={short ? 150 : 130} y={top} width={short ? 100 : 140} height={418 - top} rx="14" fill={`url(#${ids.glass})`} />
          <rect x={short ? 146 : 136} y={top - 34} width={short ? 108 : 128} height="38" rx="5" fill={short ? "#2a201c" : a} />
          {Array.from({ length: short ? 10 : 12 }, (_, i) => (
            <line key={i} x1={(short ? 152 : 142) + i * 10} x2={(short ? 152 : 142) + i * 10} y1={top - 30} y2={top} stroke={shade(short ? "#2a201c" : a, 0.25)} strokeWidth="1" />
          ))}
          {!short && <Label x={146} y={250} w={108} h={84} art={art} />}
          {short && (
            <text x="200" y={top - 10} textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize="15" fontWeight="600" letterSpacing="3" fill={a}>
              GOLD
            </text>
          )}
          <path d={`M${short ? 160 : 142} ${top + 14} L${short ? 160 : 142} 404`} stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.35" />
        </g>
      );
    }
    case "bottle":
      return (
        <g>
          <path d="M156 252 Q156 222 186 212 L186 188 L214 188 L214 212 Q244 222 244 252 L244 406 Q244 418 232 418 L168 418 Q156 418 156 406 Z" fill={`url(#${ids.cyl})`} />
          <path d="M156 252 Q156 222 186 212 L186 188 L214 188 L214 212 Q244 222 244 252 L244 406 Q244 418 232 418 L168 418 Q156 418 156 406 Z" fill={`url(#${ids.glass})`} />
          <rect x="180" y="146" width="40" height="46" rx="4" fill={a === "#F5F0E8" ? "#2a201c" : a} />
          {Array.from({ length: 7 }, (_, i) => (
            <line key={i} x1={184 + i * 5.5} x2={184 + i * 5.5} y1="150" y2="188" stroke="#000" strokeOpacity="0.25" />
          ))}
          <rect x="164" y="282" width="72" height="92" fill="#FBF7F0" opacity="0.95" />
          <text x="200" y="300" textAnchor="middle" fontFamily="Inter Variable, Inter, sans-serif" fontSize="5.5" fontWeight="600" letterSpacing="2" fill="#2a201c">FINE BAKING</text>
          <text x="200" y="333" textAnchor="middle" fontFamily="Cormorant Garamond, serif" fontSize={Math.min(20, 110 / Math.max(3, art.label.length))} fontWeight="600" fill="#2a201c">
            {art.label}
          </text>
          <line x1="190" x2="210" y1="352" y2="352" stroke={shade(b, 0.1)} />
          <path d="M166 258 L166 400" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.3" />
        </g>
      );
    case "bar":
      return <Slab body={b} accent={a} />;
    case "spatula":
      return (
        <g transform="rotate(-32 200 270)">
          <rect x="186" y="58" width="28" height="250" rx="14" fill={`url(#${ids.metal})`} />
          <path d="M190 300 L210 300 L214 336 L194 336 Z" fill="#9ea2a0" />
          <rect x="186" y="334" width="34" height="132" rx="10" fill={art.accent} />
          <rect x="186" y="334" width="34" height="132" rx="10" fill={`url(#${ids.cyl})`} opacity="0.35" />
          <circle cx="203" cy="366" r="3.5" fill="#d9dcda" />
          <circle cx="203" cy="430" r="3.5" fill="#d9dcda" />
        </g>
      );
    case "whisk":
      return (
        <g transform="rotate(-18 200 260)">
          {[16, 32, 48, 62, 74].map((w, i) => (
            <path key={w} d={`M200 312 C${200 - w} 270 ${200 - w} 96 200 84 C${200 + w} 96 ${200 + w} 270 200 312`} fill="none" stroke={i % 2 ? "#c9ccca" : "#eef0ee"} strokeWidth="3" />
          ))}
          <path d="M200 312 C188 270 188 96 200 84" fill="none" stroke="#9fa3a1" strokeWidth="2.5" />
          <rect x="186" y="300" width="28" height="150" rx="12" fill={`url(#${ids.metal})`} />
          <rect x="190" y="300" width="20" height="18" rx="4" fill="#8d918f" />
          <circle cx="200" cy="438" r="5" fill="none" stroke="#8d918f" strokeWidth="2" />
        </g>
      );
    case "mould":
      return (
        <g>
          <path d="M70 330 L250 262 Q262 258 272 266 L340 330 Q348 340 336 346 L156 414 Q144 418 136 410 L64 342 Q58 334 70 330 Z" fill={b} />
          <path d="M64 342 L136 410 Q144 418 156 414 L336 346 L336 356 L156 424 Q144 428 134 420 L64 352 Z" fill={shade(b, 0.35)} />
          {[
            [140, 344],
            [196, 323],
            [252, 302],
            [176, 378],
            [232, 357],
            [288, 336],
          ].map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="30" ry="15" fill={shade(b, 0.45)} />
              <ellipse cx={x} cy={(y ?? 0) + 3} rx="24" ry="10" fill={shade(b, 0.6)} />
              <path d={`M${(x ?? 0) - 22} ${(y ?? 0) + 6} Q${x} ${(y ?? 0) + 16} ${(x ?? 0) + 22} ${(y ?? 0) + 6}`} stroke={tint(b, 0.25)} strokeWidth="1.5" fill="none" />
            </g>
          ))}
        </g>
      );
    case "turntable":
      return (
        <g>
          <path d="M160 412 L240 412 L224 300 L176 300 Z" fill={`url(#${ids.metal})`} />
          <ellipse cx="200" cy="412" rx="70" ry="12" fill="#8d918f" />
          <rect x="188" y="262" width="24" height="44" fill="#a7abaa" />
          <ellipse cx="200" cy="262" rx="150" ry="36" fill="#a7abaa" />
          <path d="M50 250 L50 262 A150 36 0 0 0 350 262 L350 250 Z" fill="#9b9f9d" />
          <ellipse cx="200" cy="250" rx="150" ry="36" fill={`url(#${ids.metal})`} />
          {[110, 70, 30].map((r) => (
            <ellipse key={r} cx="200" cy="250" rx={r} ry={r * 0.24} fill="none" stroke="#8d918f" strokeWidth="0.8" opacity="0.6" />
          ))}
        </g>
      );
    case "scale":
      return (
        <g>
          <path d="M80 300 L248 250 L340 300 L172 360 Z" fill={tint(b, 0.12)} />
          <path d="M80 300 L172 360 L172 380 L80 320 Z" fill={shade(b, 0.2)} />
          <path d="M172 360 L340 300 L340 320 L172 380 Z" fill={shade(b, 0.35)} />
          <path d="M96 300 L248 256 L324 300 L172 352 Z" fill={`url(#${ids.glass})`} />
          <path d="M250 335 L310 313.6 L310 326 L250 347.4 Z" fill="#d7e1c9" opacity="0.92" />
          <text x="282" y="335" textAnchor="middle" transform="rotate(-19.6 282 335)" fontFamily="Inter Variable, Inter, sans-serif" fontSize="9" fontWeight="700" fill="#2a3326">0 g</text>
        </g>
      );
    case "board":
      return (
        <g>
          {[0, 1, 2].map((i) => {
            const y = 380 - i * 22;
            return (
              <g key={i}>
                <path d={`M50 ${y} L50 ${y + 8} A150 42 0 0 0 350 ${y + 8} L350 ${y} Z`} fill={shade(b, 0.35)} />
                <ellipse cx="200" cy={y} rx="150" ry="42" fill={`url(#${ids.gold})`} />
              </g>
            );
          })}
          <ellipse cx="200" cy="336" rx="118" ry="31" fill="none" stroke={tint(b, 0.4)} strokeWidth="1" opacity="0.6" />
          <ellipse cx="170" cy="324" rx="60" ry="10" fill="#fff" opacity="0.18" />
        </g>
      );
    case "box":
      return (
        <g>
          <path d="M110 230 L240 200 L310 238 L180 270 Z" fill={tint(b, 0.18)} />
          <path d="M110 230 L180 270 L180 420 L110 380 Z" fill={shade(b, 0.18)} />
          <path d="M180 270 L310 238 L310 388 L180 420 Z" fill={b} />
          <path d="M200 296 L290 274 L290 368 L200 392 Z" fill="#f4ede3" opacity="0.55" />
          <path d="M210 300 L240 292 L222 384 L206 388 Z" fill="#fff" opacity="0.35" />
          <path d="M110 230 L180 270 L310 238" fill="none" stroke={shade(b, 0.3)} strokeWidth="1" />
          <text x="246" y="408" textAnchor="middle" transform="rotate(-13.5 246 408)" fontFamily="Cormorant Garamond, serif" fontStyle="italic" fontSize="15" fill={shade(b, 0.55)}>
            Patisserie
          </text>
        </g>
      );
    case "cup":
      return (
        <g>
          <path d="M138 226 L262 226 L246 416 L154 416 Z" fill="#fff" opacity="0.25" />
          <path d="M152 392 L248 392 L246 416 L154 416 Z" fill="#c9a77d" />
          <path d="M147 330 L253 330 L248 392 L152 392 Z" fill="#3a2419" />
          <path d="M143 290 L257 290 L253 330 L147 330 Z" fill="#f4ede3" />
          <path d="M141 266 L259 266 L257 290 L143 290 Z" fill="#7a5236" />
          <path d="M140 262 Q170 250 200 262 Q230 274 260 262 L259 268 L141 268 Z" fill="#f4ede3" />
          <path d="M138 226 L262 226 L246 416 L154 416 Z" fill={`url(#${ids.glass})`} stroke="#fff" strokeOpacity="0.6" />
          <ellipse cx="200" cy="226" rx="66" ry="12" fill="#fff" opacity="0.45" stroke="#fff" strokeOpacity="0.8" />
          <path d="M140 222 Q200 186 260 222" fill="#fff" opacity="0.3" stroke="#fff" strokeOpacity="0.7" />
          <path d="M152 236 L162 404" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.45" />
        </g>
      );
    case "ribbon":
      return (
        <g>
          <path d="M228 330 C300 340 330 390 300 420 C280 440 240 420 262 400" fill="none" stroke={shade(b, 0.1)} strokeWidth="16" strokeLinecap="round" />
          <ellipse cx="190" cy="382" rx="104" ry="34" fill={shade(a, 0.3)} />
          <rect x="86" y="300" width="208" height="82" fill={`url(#${ids.cyl})`} />
          {Array.from({ length: 9 }, (_, i) => (
            <line key={i} x1="86" x2="294" y1={308 + i * 8.5} y2={308 + i * 8.5} stroke={shade(b, 0.2)} strokeOpacity="0.35" />
          ))}
          <ellipse cx="190" cy="300" rx="104" ry="34" fill={tint(a, 0.15)} />
          <ellipse cx="190" cy="300" rx="70" ry="22" fill={b} />
          <ellipse cx="190" cy="300" rx="22" ry="7" fill={shade(a, 0.4)} />
        </g>
      );
    case "block":
      return (
        <g>
          <path d="M100 286 L236 256 L310 290 L174 322 Z" fill={tint(b, 0.4)} />
          <path d="M100 286 L174 322 L174 420 L100 388 Z" fill={shade(b, 0.1)} />
          <path d="M174 322 L310 290 L310 386 L174 420 Z" fill={b} />
          <path d="M188 340 L296 314 L296 378 L188 404 Z" fill={art.accent} opacity="0.92" />
          <text x="242" y="364" textAnchor="middle" transform="rotate(-13 242 364)" fontFamily="Cormorant Garamond, serif" fontSize="17" fontWeight="600" letterSpacing="2" fill="#F5F0E8">
            {art.label}
          </text>
          <path d="M100 286 L236 256 L310 290" fill="none" stroke="#fff" strokeOpacity="0.7" />
        </g>
      );
  }
}

/** Chocolate slab in three-quarter view; shared with the hero. */
export function Slab({ body = "#3A2419", accent = "#A77953", cols = 4, rows = 3 }: { body?: string; accent?: string; cols?: number; rows?: number }) {
  // Top-face corners (parallelogram).
  const A = [92, 298];
  const B = [248, 236];
  const C = [330, 298];
  const D = [174, 360];
  const lerp = (p: number[], q: number[], t: number) => [p[0]! + (q[0]! - p[0]!) * t, p[1]! + (q[1]! - p[1]!) * t];
  const cells: ReactNode[] = [];
  for (let r = 0; r < rows; r += 1)
    for (let c = 0; c < cols; c += 1) {
      const pt = (u: number, v: number) => {
        const top = lerp(A, B, u);
        const bot = lerp(D, C, u);
        return lerp(top, bot, v);
      };
      const g = 0.06;
      const u0 = c / cols + g / cols;
      const u1 = (c + 1) / cols - g / cols;
      const v0 = r / rows + g / rows;
      const v1 = (r + 1) / rows - g / rows;
      const p = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)];
      cells.push(
        <g key={`${r}-${c}`}>
          <path d={`M${p.map((q) => q.join(" ")).join(" L")} Z`} fill={tint(body, 0.06)} />
          <path d={`M${p[0]!.join(" ")} L${p[1]!.join(" ")} L${p[2]!.join(" ")}`} fill="none" stroke={tint(body, 0.28)} strokeWidth="1.2" opacity="0.7" />
          <path d={`M${p[2]!.join(" ")} L${p[3]!.join(" ")} L${p[0]!.join(" ")}`} fill="none" stroke={shade(body, 0.45)} strokeWidth="1.2" />
        </g>,
      );
    }
  return (
    <g>
      <path d={`M${A.join(" ")} L${D.join(" ")} L${D[0]} ${D[1]! + 18} L${A[0]} ${A[1]! + 18} Z`} fill={shade(body, 0.35)} />
      <path d={`M${D.join(" ")} L${C.join(" ")} L${C[0]} ${C[1]! + 18} L${D[0]} ${D[1]! + 18} Z`} fill={shade(body, 0.2)} />
      <path d={`M${A.join(" ")} L${B.join(" ")} L${C.join(" ")} L${D.join(" ")} Z`} fill={shade(body, 0.12)} />
      {cells}
      <path d={`M${A.join(" ")} L${B.join(" ")}`} stroke={accent} strokeOpacity="0.35" />
    </g>
  );
}

function Props({ prop, art, ids, dense = false }: { prop: ArtProp; art: ArtSpec; ids: Ids; dense?: boolean }) {
  const n = dense ? 1.6 : 1;
  switch (prop) {
    case "callets": {
      const choc = isDark(art.body) ? art.body : "#4a2e1f";
      const spots = [[96, 432], [118, 446], [300, 438], [322, 452], [284, 458], [140, 458], [338, 430], [70, 450]].slice(0, Math.round(5 * n));
      return (
        <g>
          {spots.map(([x, y], i) => (
            <g key={i}>
              <ellipse cx={x} cy={y} rx="11" ry="7.5" fill={shade(choc, 0.15)} />
              <ellipse cx={(x ?? 0) - 2} cy={(y ?? 0) - 2} rx="7" ry="3.5" fill={tint(choc, 0.15)} opacity="0.7" />
            </g>
          ))}
        </g>
      );
    }
    case "dust": {
      const c = isDark(art.body) ? tint(art.body, 0.15) : tint(art.body, 0.3);
      return (
        <g>
          <ellipse cx="300" cy="440" rx={46 * n} ry={10 * n} fill={c} opacity="0.85" />
          {Array.from({ length: Math.round(40 * n) }, (_, i) => (
            <circle key={i} cx={240 + ((i * 37) % 130)} cy={428 + ((i * 17) % 34)} r={0.9 + (i % 3) * 0.5} fill={c} opacity={0.5 + (i % 4) * 0.1} />
          ))}
        </g>
      );
    }
    case "sprinkles":
      return (
        <g>
          {Array.from({ length: Math.round(18 * n) }, (_, i) => {
            const palette = ["#E9B7B0", "#B9C9A8", "#F2D7A0", "#A9C2D6", "#D8A0B9"];
            const x = 70 + ((i * 53) % 280);
            const y = 430 + ((i * 23) % 40);
            return <rect key={i} x={x} y={y} width="10" height="3.6" rx="1.8" fill={palette[i % palette.length]} transform={`rotate(${(i * 67) % 180} ${x} ${y})`} />;
          })}
        </g>
      );
    case "pearls":
      return (
        <g>
          {Array.from({ length: Math.round(9 * n) }, (_, i) => (
            <circle key={i} cx={80 + ((i * 71) % 250)} cy={436 + ((i * 19) % 30)} r={5 + (i % 2)} fill={`url(#${ids.pearl})`} />
          ))}
        </g>
      );
    case "pod":
      return (
        <g>
          <path d="M70 452 C150 430 250 440 340 418" stroke="#2a1a12" strokeWidth="7" strokeLinecap="round" fill="none" />
          <path d="M70 452 C150 430 250 440 340 418" stroke="#5a3a22" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      );
    case "leaf":
      return (
        <g>
          {Array.from({ length: Math.round(7 * n) }, (_, i) => {
            const x = 90 + ((i * 59) % 240);
            const y = 430 + ((i * 13) % 32);
            return <path key={i} d={`M${x} ${y} l14 -6 l7 10 l-12 8 z`} fill={`url(#${ids.gold})`} transform={`rotate(${(i * 51) % 360} ${x} ${y})`} />;
          })}
        </g>
      );
    default:
      return null;
  }
}

interface Props {
  art: ArtSpec;
  view?: 0 | 1 | 2;
  title: string;
  className?: string;
  decorative?: boolean;
}

function ProductArtImpl({ art, view = 0, title, className, decorative = false }: Props) {
  const raw = useId().replace(/[^a-zA-Z0-9]/g, "");
  const ids: Ids = {
    bg: `bg${raw}`,
    light: `lt${raw}`,
    cyl: `cy${raw}`,
    flat: `fl${raw}`,
    metal: `mt${raw}`,
    glass: `gl${raw}`,
    shadow: `sh${raw}`,
    pearl: `pr${raw}`,
    gold: `gd${raw}`,
  };
  // Still-life view swaps to a contrasting plate for variety.
  const plate = view === 2 ? { ...art, backdrop: isDark(art.backdrop) ? "#E4D7C5" : mix(art.backdrop, "#3B2C25", 0.12) } : art;
  const productTransform =
    view === 1 ? "translate(-200 -330) scale(2)" : view === 2 ? "translate(-36 34) scale(0.82)" : undefined;
  const titleId = `t${raw}`;

  return (
    <svg
      viewBox="0 0 400 500"
      role={decorative ? undefined : "img"}
      aria-hidden={decorative ? true : undefined}
      aria-labelledby={decorative ? undefined : titleId}
      className={className}
      preserveAspectRatio="xMidYMid slice"
      focusable="false"
    >
      {!decorative && <title id={titleId}>{title}</title>}
      <Defs ids={ids} art={plate} />
      <rect width="400" height="500" fill={`url(#${ids.bg})`} />
      <rect width="400" height="500" fill={`url(#${ids.light})`} />
      {view === 2 && (
        <g>
          <rect x="-10" y="400" width="420" height="110" fill={isDark(plate.backdrop) ? "#3a2c26" : "#f3ece2"} />
          {Array.from({ length: 6 }, (_, i) => (
            <line key={i} x1="-10" x2="410" y1={412 + i * 16} y2={412 + i * 16} stroke={art.accent} strokeOpacity="0.18" />
          ))}
          <ellipse cx="318" cy="430" rx="64" ry="18" fill={`url(#${ids.shadow})`} />
          <path d="M262 404 Q318 452 374 404 Z" fill={tint(plate.backdrop, 0.5)} />
          <ellipse cx="318" cy="404" rx="56" ry="13" fill={shade(plate.backdrop, 0.08)} />
          <ellipse cx="318" cy="401" rx="44" ry="8" fill={art.prop === "callets" || art.prop === "dust" ? (isDark(art.body) ? art.body : tint(art.body, 0.1)) : art.accent} opacity="0.95" />
        </g>
      )}
      <g transform={productTransform}>
        <ellipse cx="200" cy="420" rx="140" ry="20" fill={`url(#${ids.shadow})`} />
        <Shape shape={art.shape} art={art} ids={ids} />
        <Props prop={art.prop} art={art} ids={ids} dense={view === 2} />
      </g>
    </svg>
  );
}

export const ProductArt = memo(ProductArtImpl);

export function ArtFrame({ art, view = 0, title, decorative, className = "" }: Props) {
  return (
    <div className={`art ${className}`} style={{ background: art.backdrop }}>
      <ProductArt art={art} view={view} title={title} decorative={decorative} />
    </div>
  );
}
