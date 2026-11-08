import { Bus, Car, Check, Clock, Copy, CreditCard, ExternalLink, MapPin, Navigation, Phone, Snowflake, Store } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReveal } from "../anim/useReveal";
import { useFrames } from "../anim/useFrames";
import { WheatLine } from "../components/LineArt";
import { openStatus, STORE_FACTS } from "../data/config";

/*
 * Visit page. Every fact here comes from public listings (Waze, CariCari,
 * Wikipedia, The Star). The business has not confirmed them, and the page says so.
 */

export function Visit() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  useFrames(root);
  const [status, setStatus] = useState(() => openStatus());
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = window.setInterval(() => setStatus(openStatus()), 60_000);
    return () => window.clearInterval(t);
  }, []);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(`${STORE_FACTS.name}, ${STORE_FACTS.addressShort}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div ref={root}>
      <div className="container page-head">
        <span className="eyebrow">Visit the shop</span>
        <h1 id="page-title" tabIndex={-1}>
          Find us in Taman Melawati.
        </h1>
        <p className="lede">
          The real {STORE_FACTS.name} is a walk-in baking-supply shop in the Taman Melawati town centre. Here's how to get there.
        </p>
      </div>

      <section className="container visit" aria-label="Location and opening hours">
        <div className="visit-card" data-testid="visit-card">
          <div className="visit-card__art" aria-hidden="true">
            <LocatorArt />
          </div>
          <div className="visit-card__body">
            <span className={`open-pill ${status.open ? "is-open" : ""}`} data-testid="open-status">
              <span className="open-pill__dot" aria-hidden="true" />
              {status.label}
            </span>
            <h2 className="visit-card__name">{STORE_FACTS.name}</h2>
            <address className="visit-card__address" data-testid="visit-address">
              {STORE_FACTS.addressLines.map((l) => (
                <span key={l}>
                  {l}
                  <br />
                </span>
              ))}
            </address>
            <div className="visit-actions">
              <a className="btn btn--light" href={STORE_FACTS.maps.search} target="_blank" rel="noopener noreferrer" data-testid="maps-link">
                <MapPin size={16} aria-hidden="true" /> Open in Google Maps
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
              <a className="btn btn--ghost-light" href={STORE_FACTS.maps.directions} target="_blank" rel="noopener noreferrer" data-testid="directions-link">
                <Navigation size={16} aria-hidden="true" /> Get directions
                <span className="visually-hidden"> in Google Maps (opens in a new tab)</span>
              </a>
            </div>
            <div className="visit-links">
              <a href={STORE_FACTS.maps.waze} target="_blank" rel="noopener noreferrer">
                Open in Waze <ExternalLink size={12} aria-hidden="true" />
              </a>
              <button type="button" className="linkish" onClick={copyAddress} data-testid="copy-address">
                {copied ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />} {copied ? "Address copied" : "Copy address"}
              </button>
            </div>
          </div>
        </div>

        <div className="visit-details">
          <section aria-labelledby="hours-title">
            <h2 id="hours-title" className="visit-h">
              <Clock size={16} aria-hidden="true" /> Opening hours
            </h2>
            <table className="hours" data-testid="hours">
              <caption className="visually-hidden">Opening hours, Malaysia time</caption>
              <tbody>
                {STORE_FACTS.hours.map((h) => {
                  const today = (h.dayIdx as readonly number[]).includes(status.todayIdx);
                  return (
                    <tr key={h.days} className={today ? "is-today" : undefined} aria-current={today ? "date" : undefined}>
                      <th scope="row">
                        {h.days}
                        {today && <span className="today-tag">Today</span>}
                      </th>
                      <td className="tnum">
                        {to12(h.open)} – {to12(h.close)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <p className="source-note">Hours from a crowd-sourced listing. Public holidays may differ; call ahead to confirm.</p>
          </section>

          <section aria-labelledby="contact-title">
            <h2 id="contact-title" className="visit-h">
              <Phone size={16} aria-hidden="true" /> Contact
            </h2>
            <p className="visit-phone tnum">{STORE_FACTS.phoneDisplay}</p>
            <ul className="amenities">
              <li>
                <Store size={15} aria-hidden="true" /> Walk-in retail and wholesale
              </li>
              {STORE_FACTS.amenities.map((a) => (
                <li key={a}>
                  {a.startsWith("Credit") ? <CreditCard size={15} aria-hidden="true" /> : <Snowflake size={15} aria-hidden="true" />} {a}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      <section className="section band--cream getting-band" aria-labelledby="getting-title">
        <WheatLine className="getting-band__art" scrollDraw />
        <div className="container">
          <div className="section-head">
            <div>
              <span className="eyebrow">Getting there</span>
              <h2 id="getting-title">In the heart of Pusat Bandar Melawati.</h2>
            </div>
          </div>
          <ul className="getting">
            <li data-reveal>
              <Car size={22} aria-hidden="true" />
              <h3>By car</h3>
              <p>
                Taman Melawati sits along the Middle Ring Road 2 (MRR2). Head for the town-centre shop lots on Jalan Bandar 12, or tap "Get
                directions" for live routing.
              </p>
            </li>
            <li data-reveal>
              <Bus size={22} aria-hidden="true" />
              <h3>By public transport</h3>
              <p>
                Take the LRT Kelana Jaya Line to Sri Rampai, then a Rapid KL feeder bus to Taman Melawati (about 15 minutes). Check the latest
                route on the myRapid app.
              </p>
            </li>
            <li data-reveal>
              <MapPin size={22} aria-hidden="true" />
              <h3>Nearby</h3>
              <p>
                The shop is in the same town-centre district as Melawati Mall. The 53100 postcode gives it a Kuala Lumpur address, though the
                area falls under Ampang Jaya Municipal Council in Selangor.
              </p>
            </li>
          </ul>
          <p className="source-note" style={{ marginTop: 32 }}>
            Sources: Waze and CariCari listings for the address, phone and hours; Wikipedia and The Star for area and transport details. Not yet
            confirmed by the business.
          </p>
        </div>
      </section>
    </div>
  );
}

function to12(hhmm: string): string {
  const h = Number(hhmm.slice(0, 2));
  const m = hhmm.slice(3);
  return `${h % 12 || 12}${m === "00" ? "" : `:${m}`} ${h < 12 ? "am" : "pm"}`;
}

/** Decorative locator: contour rings and a pin. Not a map; nothing here is to scale. */
function LocatorArt() {
  return (
    <svg viewBox="0 0 400 400" focusable="false">
      <defs>
        <radialGradient id="loc-glow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#a77953" stopOpacity="0.45" />
          <stop offset="1" stopColor="#a77953" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#loc-glow)" />
      {[40, 75, 110, 145, 180].map((r, i) => (
        <circle key={r} cx="200" cy="200" r={r} fill="none" stroke="#c49a72" strokeOpacity={0.5 - i * 0.08} strokeDasharray={i % 2 ? "2 6" : undefined} />
      ))}
      <path d="M20 250 C120 230 260 260 380 210" stroke="#f5f0e8" strokeOpacity="0.18" strokeWidth="10" fill="none" />
      <path d="M150 20 C170 140 230 260 210 380" stroke="#f5f0e8" strokeOpacity="0.12" strokeWidth="6" fill="none" />
      <g transform="translate(200 196)">
        <ellipse cx="0" cy="34" rx="22" ry="6" fill="#000" opacity="0.35" />
        <path d="M0 32 C-8 18 -30 2 -30 -18 A30 30 0 0 1 30 -18 C30 2 8 18 0 32 Z" fill="#c49a72" />
        <circle cx="0" cy="-18" r="11" fill="#241b18" />
      </g>
    </svg>
  );
}
