/* Original hand-drawn style line art for the bakery motif (balloon whisk, wheat sprig).
 * Paths carry class "draw" so GSAP can draw them on. Decorative only. */

interface Props {
  className?: string;
  scrollDraw?: boolean;
}

export function WhiskLine({ className = "", scrollDraw = false }: Props) {
  return (
    <svg className={`line-art ${className}`} viewBox="0 0 200 300" fill="none" aria-hidden="true" focusable="false" data-scroll-draw={scrollDraw || undefined}>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path className="draw" d="M100 196 C 60 160, 52 60, 100 14 C 148 60, 140 160, 100 196" />
        <path className="draw" d="M100 196 C 76 160, 74 70, 100 22 C 126 70, 124 160, 100 196" />
        <path className="draw" d="M100 196 C 90 150, 90 80, 100 30 C 110 80, 110 150, 100 196" />
        <path className="draw" d="M100 196 C 38 166, 30 70, 100 8 C 170 70, 162 166, 100 196" />
        <path className="draw" d="M92 194 L 92 286 Q 100 294 108 286 L 108 194" />
        <path className="draw" d="M92 214 L 108 214" />
        <path className="draw" d="M100 278 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0" />
      </g>
    </svg>
  );
}

export function WheatLine({ className = "", scrollDraw = false }: Props) {
  const grains = [40, 70, 100, 130, 160];
  return (
    <svg className={`line-art ${className}`} viewBox="0 0 160 300" fill="none" aria-hidden="true" focusable="false" data-scroll-draw={scrollDraw || undefined}>
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path className="draw" d="M80 296 C 82 230, 78 120, 80 18" />
        {grains.map((y) => (
          <g key={y}>
            <path className="draw" d={`M80 ${y + 22} C 62 ${y + 14}, 52 ${y - 2}, 56 ${y - 16} C 72 ${y - 8}, 80 ${y + 6}, 80 ${y + 22}`} />
            <path className="draw" d={`M80 ${y + 22} C 98 ${y + 14}, 108 ${y - 2}, 104 ${y - 16} C 88 ${y - 8}, 80 ${y + 6}, 80 ${y + 22}`} />
          </g>
        ))}
        <path className="draw" d="M80 18 C 76 6, 72 0, 66 -4" />
        <path className="draw" d="M80 18 C 84 6, 88 0, 94 -4" />
        <path className="draw" d="M80 230 C 100 220, 118 222, 132 236" />
      </g>
    </svg>
  );
}
