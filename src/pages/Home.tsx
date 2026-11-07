import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DESKTOP_MOTION, gsap, MOTION_OK, useGSAP } from "../anim/gsap";
import { useReveal } from "../anim/useReveal";
import { STORE_FACTS } from "../data/config";
import { CATEGORIES, PRODUCT_BY_ID, PRODUCTS, productsInCategory } from "../data/products";
import { formatRM } from "../lib/money";
import { href } from "../state/router";
import { HeroArt, StoryArt } from "../components/HomeArt";
import { ArtFrame } from "../components/ProductArt";
import { ProductCard } from "../components/ProductCard";
import { prefersReducedMotion } from "../anim/gsap";

export function Home() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return (
    <div ref={root}>
      <Hero />
      <Intro />
      <CollectionsGrid />
      <Featured />
      <Story />
      <LocalBand />
    </div>
  );
}

function Hero() {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(MOTION_OK, () => {
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.from(".h-glow", { autoAlpha: 0, scale: 0.8, transformOrigin: "50% 50%", duration: 1.6 }, 0)
          .from(".hero h1 .line > span", { yPercent: 110, duration: 1.1, stagger: 0.09 }, 0.15)
          .from(".hero .eyebrow", { autoAlpha: 0, y: 12, duration: 0.6 }, 0.1)
          .from(".h-slab", { y: 60, autoAlpha: 0, duration: 1.2 }, 0.25)
          .from(".h-shard", { y: -80, rotation: (i) => (i % 2 ? 24 : -24), autoAlpha: 0, transformOrigin: "50% 50%", stagger: 0.1, duration: 1.1 }, 0.45)
          .from(".h-callet", { y: -40, autoAlpha: 0, stagger: { each: 0.04, from: "random" }, duration: 0.7, ease: "back.out(2)" }, 0.6)
          .from([".h-pod", ".h-spoon"], { x: 40, autoAlpha: 0, stagger: 0.12, duration: 1 }, 0.55)
          .from(".h-dust", { autoAlpha: 0, scaleX: 0.6, transformOrigin: "50% 50%", duration: 1.4 }, 0.5)
          .from(".hero__lede, .hero__ctas, .hero__note", { autoAlpha: 0, y: 18, stagger: 0.1, duration: 0.8 }, 0.7);

        // Scroll parallax: art drifts slower than the page.
        gsap.to(".hero__art", {
          yPercent: 12,
          ease: "none",
          scrollTrigger: { trigger: ref.current, start: "top top", end: "bottom top", scrub: 0.6 },
        });
      });

      // Pointer depth only on precise pointers with motion allowed.
      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine) and (min-width: 901px)", () => {
        const layers = gsap.utils.toArray<SVGGElement>("[data-depth]", ref.current);
        const setters = layers.map((el) => ({
          depth: Number(el.dataset.depth ?? 0),
          x: gsap.quickTo(el, "x", { duration: 0.9, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 0.9, ease: "power3" }),
        }));
        const onMove = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => {
            s.x(nx * 18 * s.depth);
            s.y(ny * 12 * s.depth);
          });
        };
        window.addEventListener("pointermove", onMove, { passive: true });
        return () => window.removeEventListener("pointermove", onMove);
      });
    },
    { scope: ref },
  );

  const toStory = () => {
    const el = document.getElementById("story");
    el?.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
    window.setTimeout(() => document.getElementById("story-heading")?.focus({ preventScroll: true }), prefersReducedMotion() ? 0 : 700);
  };

  return (
    <section ref={ref} className="hero" aria-labelledby="page-title" data-testid="hero">
      <div className="container hero__inner">
        <div className="hero__copy">
          <p className="eyebrow">Taman Melawati · Concept storefront</p>
          <h1 id="page-title" tabIndex={-1}>
            <span className="line">
              <span>Every exceptional</span>
            </span>
            <span className="line">
              <span>creation <em>begins</em></span>
            </span>
            <span className="line">
              <span>with an ingredient.</span>
            </span>
          </h1>
          <p className="hero__lede">
            Couverture that tempers to a mirror shine. Flour milled for a feather-light crumb. Tools that steady the final flourish. A
            reimagined way to shop for baking, organised around how bakers actually work.
          </p>
          <div className="hero__ctas">
            <a className="btn btn--light" href="#shop" data-testid="cta-explore">
              Explore the collection <ArrowRight size={16} aria-hidden="true" />
            </a>
            <button type="button" className="btn btn--ghost-light" onClick={toStory}>
              Discover the craft
            </button>
          </div>
          <p className="hero__note">Illustrated products · Demonstration catalogue and prices</p>
        </div>
        <div className="hero__art">
          <HeroArt />
        </div>
      </div>
    </section>
  );
}

function Intro() {
  const flour = PRODUCT_BY_ID.get("superfine-cake-flour")!;
  const whisk = PRODUCT_BY_ID.get("balloon-whisk")!;
  return (
    <section className="section" aria-labelledby="intro-title">
      <div className="container intro">
        <div className="intro__art" data-reveal>
          <ArtFrame art={flour.art} title="Illustration: a paper bag of cake flour on a sand-coloured plate" view={2} />
          <ArtFrame art={whisk.art} title="Illustration: a stainless balloon whisk" className="art--offset" decorative />
        </div>
        <div data-reveal>
          <p className="eyebrow">A better way to stock your kitchen</p>
          <h2 id="intro-title" style={{ marginTop: 16 }}>
            Find the right ingredient faster, and bake with <em className="serif-italic">more certainty</em>.
          </h2>
          <p className="lede">
            A great baking shop already holds the answers: which flour for chiffon, which couverture tempers cleanly, which board fits a
            20 cm cake. This concept brings that knowledge online with clear sizes, honest stock levels and calm, beautiful browsing.
          </p>
          <ol className="pillars">
            <li>
              <h3>Shop by stage</h3>
              <p>Collections follow the bake: essentials, flavour, decorating, tools and presentation.</p>
            </li>
            <li>
              <h3>Compare sizes</h3>
              <p>Every variant shows its own price and demo stock before it reaches your cart.</p>
            </li>
            <li>
              <h3>Collect locally</h3>
              <p>A concept for reserving online and collecting in Taman Melawati.</p>
            </li>
          </ol>
        </div>
      </div>
    </section>
  );
}

function CollectionsGrid() {
  const order = ["chocolate", "essentials", "decorating", "tools", "packaging"] as const;
  return (
    <section className="section band--cream" aria-labelledby="collections-title">
      <div className="container">
        <div className="section-head">
          <div>
            <span className="eyebrow">Collections</span>
            <h2 id="collections-title">Five ways into the pantry.</h2>
          </div>
          <a className="text-link" href="#collections">
            All collections <ArrowRight size={14} aria-hidden="true" />
          </a>
        </div>
        <div className="collections-grid">
          {order.map((id) => {
            const c = CATEGORIES.find((x) => x.id === id)!;
            return (
              <a key={c.id} className="collection-tile" href={href({ name: "shop", category: c.id })} data-reveal data-testid={`collection-${c.id}`}>
                <ArtFrame art={c.art} title="" decorative />
                <span className="collection-tile__caption">
                  <span>
                    <h3>{c.name}</h3>
                    <span className="collection-tile__count">{productsInCategory(c.id).length} products</span>
                  </span>
                  <span className="collection-tile__arrow" aria-hidden="true">
                    <ArrowRight size={18} />
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Featured() {
  const featured = PRODUCTS.filter((p) => p.featured);
  const track = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const update = () => setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  const scroll = (dir: 1 | -1) =>
    track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: prefersReducedMotion() ? "auto" : "smooth" });

  return (
    <section className="section" aria-labelledby="featured-title">
      <div className="container section-head">
        <div>
          <span className="eyebrow">Featured</span>
          <h2 id="featured-title">Considered picks for this season.</h2>
          <p className="small muted" style={{ marginTop: 12 }}>
            A curated demo selection. Prices are illustrative.
          </p>
        </div>
        <div className="carousel__controls">
          <button type="button" className="round-btn" aria-label="Previous products" onClick={() => scroll(-1)} disabled={edges.start}>
            <ArrowLeft size={18} aria-hidden="true" />
          </button>
          <button type="button" className="round-btn" aria-label="Next products" onClick={() => scroll(1)} disabled={edges.end}>
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <div className="carousel" style={{ maxWidth: "var(--maxw)", marginInline: "auto" }}>
        <ul ref={track} className="carousel__track" aria-label="Featured products" tabIndex={0}>
          {featured.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Story() {
  const ref = useRef<HTMLElement>(null);
  const product = PRODUCT_BY_ID.get("dark-couverture-callets")!;

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(DESKTOP_MOTION, () => {
        const section = ref.current!;
        section.classList.add("is-animated");
        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut", duration: 1 },
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: "+=2400",
            pin: section.querySelector<HTMLElement>(".story__pin")!,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });
        tl.addLabel("texture")
          .fromTo(".st-macro", { scale: 0.55, rotation: -20, autoAlpha: 0.2, transformOrigin: "50% 50%" }, { scale: 1, rotation: 0, autoAlpha: 1 }, "texture")
          .fromTo(".story__step:nth-child(1)", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0 }, "texture")
          .addLabel("temper", "+=0.4")
          .to(".story__step:nth-child(1)", { autoAlpha: 0, y: -40, duration: 0.5 }, "temper")
          .to(".st-macro", { scale: 1.35, autoAlpha: 0.18 }, "temper")
          .fromTo(".st-slab", { y: 120, autoAlpha: 0 }, { y: 0, autoAlpha: 1 }, "temper")
          .fromTo(".story__step:nth-child(2)", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "temper+=0.5")
          .fromTo(".st-sheen", { x: -120 }, { x: 520, duration: 1.4, ease: "none" }, "temper+=0.5")
          .addLabel("set", "+=0.2")
          .to(".story__step:nth-child(2)", { autoAlpha: 0, y: -40, duration: 0.5 }, "set")
          .fromTo(".story__step:nth-child(3)", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, "set+=0.5")
          .fromTo(".st-callet", { y: -260, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: 0.12, ease: "power2.in" }, "set")
          .fromTo(".story__headline .word", { yPercent: 60, autoAlpha: 0 }, { yPercent: 0, autoAlpha: 1, stagger: 0.18 }, "set+=0.4")
          .addLabel("product", "+=0.2")
          .fromTo(".story__product", { x: 80, autoAlpha: 0, rotation: 4 }, { x: 0, autoAlpha: 1, rotation: 0 }, "product")
          .fromTo(".story__cta", { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0 }, "product+=0.3")
          .to({}, { duration: 0.6 });
        tl.fromTo(".story__progress-bar", { scaleX: 0 }, { scaleX: 1, ease: "none", duration: tl.duration() }, 0);
        return () => section.classList.remove("is-animated");
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} id="story" className="story" aria-labelledby="story-heading" data-testid="story">
      <div className="container story__pin">
        <div className="story__visual">
          <StoryArt />
          <a className="story__product" href={href({ name: "product", id: product.id })} aria-label={`${product.name}, from ${formatRM(product.variants[0]!.price)}`}>
            <ArtFrame art={product.art} title="" decorative />
            <span className="story__product-name">{product.name}</span>
            <br />
            <span className="story__product-price">From {formatRM(product.variants[0]!.price)}</span>
          </a>
        </div>
        <div className="story__copy">
          <span className="eyebrow">The craft · Chocolate</span>
          <h2 id="story-heading" className="story__headline" tabIndex={-1}>
            {["Melt.", "Temper.", "Set."].map((w) => (
              <span key={w} className="word">
                {w}
              </span>
            ))}
          </h2>
          <div className="story__progress" aria-hidden="true">
            <div className="story__progress-bar" />
          </div>
          <ol className="story__steps">
            <li className="story__step">
              <h3>
                <span>01</span>Texture
              </h3>
              <p>Look closely. Fine cocoa, glossy drops and silky powders each behave differently in the bowl.</p>
            </li>
            <li className="story__step">
              <h3>
                <span>02</span>Temper
              </h3>
              <p>Melt, cool and rework couverture along the right curve for a clean snap and a mirror shine.</p>
            </li>
            <li className="story__step">
              <h3>
                <span>03</span>Set
              </h3>
              <p>Pour into moulds, tap out the air, and let the structure take hold.</p>
            </li>
          </ol>
          <div className="story__cta">
            <a className="btn btn--light" href={href({ name: "shop", category: "chocolate" })}>
              Shop Chocolate &amp; Flavours <ArrowRight size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function LocalBand() {
  return (
    <section className="section band--cream" aria-labelledby="local-title">
      <div className="container local-band">
        <div data-reveal>
          <span className="eyebrow">Concept feature</span>
          <h2 id="local-title">Reserve online. Collect in Taman Melawati.</h2>
          <p className="lede">
            In this concept, bakers check stock, reserve and pay online, then pick up at the shop. Here pickup and payment are simulated; a
            real service would follow the business's own process.
          </p>
          <div className="row" style={{ marginTop: 24 }}>
            <a className="btn" href="#shop">
              Try the demo checkout
            </a>
            <a className="text-link" href="#approach">
              What's real, what's demo <ArrowRight size={14} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="local-card" data-reveal>
          <dl>
            <div>
              <dt>Shop</dt>
              <dd>{STORE_FACTS.name}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{STORE_FACTS.addressLines.join(", ")}</dd>
            </div>
            <div>
              <dt>Telephone</dt>
              <dd>{STORE_FACTS.phoneDisplay}</dd>
            </div>
            <div>
              <dt>Hours</dt>
              <dd>{STORE_FACTS.hoursNote}</dd>
            </div>
          </dl>
          <p className="source-note">Sources: research spreadsheet and public map / directory listings. Not confirmed by the business.</p>
        </div>
      </div>
    </section>
  );
}
