import { ArrowRight } from "lucide-react";
import { useRef } from "react";
import { useReveal } from "../anim/useReveal";
import { useFrames } from "../anim/useFrames";
import { CATEGORIES, hasPriceRange, lowestPrice, productsInCategory } from "../data/products";
import { formatRM } from "../lib/money";
import { href } from "../state/router";
import { ArtFrame } from "../components/ProductArt";

export function Collections() {
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  useFrames(root);
  return (
    <div ref={root}>
      <div className="container page-head">
        <span className="eyebrow">Collections</span>
        <h1 id="page-title" tabIndex={-1}>
          Curated by stage of the bake.
        </h1>
        <p className="lede">
          Five collections that follow a recipe from first weigh-out to final presentation. Product lists and prices are demonstration
          data.
        </p>
      </div>
      <div className="container">
        {CATEGORIES.map((c, i) => {
          const items = productsInCategory(c.id);
          const featured = [...items].sort((a, b) => Number(b.featured) - Number(a.featured)).slice(0, 4);
          return (
            <article key={c.id} className="collection-row" aria-labelledby={`col-${c.id}`} data-testid={`collection-row-${c.id}`}>
              <div className="collection-row__art">
                <div className={`frame ${i % 2 === 0 ? "frame--arch" : ""}`} data-frame={i % 2 === 0 ? "arch" : "round"}>
                  <div className="frame__inner" data-frame-inner>
                    <ArtFrame art={c.art} view={i % 2 === 0 ? 0 : 2} title={`Illustration for ${c.name}`} />
                  </div>
                </div>
              </div>
              <div data-reveal>
                <span className="eyebrow">
                  {String(i + 1).padStart(2, "0")} · {items.length} products
                </span>
                <h2 id={`col-${c.id}`}>{c.name}</h2>
                <p className="lede">{c.intro}</p>
                <ul className="collection-row__mini">
                  {featured.map((p) => (
                    <li key={p.id}>
                      <a href={href({ name: "product", id: p.id })}>
                        <span>{p.name}</span>
                        <span className="price">
                          {hasPriceRange(p) ? "from " : ""}
                          {formatRM(lowestPrice(p))}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
                <a className="btn" href={href({ name: "shop", category: c.id })}>
                  Shop {c.short} <ArrowRight size={16} aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
