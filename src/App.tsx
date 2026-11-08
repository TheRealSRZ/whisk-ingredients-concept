import { useEffect, useRef } from "react";
import { d, gsap, ScrollTrigger, useGSAP } from "./anim/gsap";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Toasts } from "./components/Toasts";
import { PRODUCT_BY_ID } from "./data/products";
import { CATEGORY_BY_ID } from "./data/products";
import { Visit } from "./pages/Visit";
import { Checkout } from "./pages/Checkout";
import { Collections } from "./pages/Collections";
import { Confirmation } from "./pages/Confirmation";
import { Home } from "./pages/Home";
import { NotFound, Policies, Wishlist } from "./pages/Misc";
import { Product } from "./pages/Product";
import { Shop } from "./pages/Shop";
import { useRoute, type Route } from "./state/router";
import { StoreProvider } from "./state/store";

function titleFor(route: Route): string {
  const base = "Whisk Ingredients Concept Store";
  switch (route.name) {
    case "home":
      return base;
    case "shop":
      return `${route.category === "all" ? "Shop" : CATEGORY_BY_ID.get(route.category)?.name} · ${base}`;
    case "product":
      return `${PRODUCT_BY_ID.get(route.id)?.name} · ${base}`;
    case "collections":
      return `Collections · ${base}`;
    case "visit":
      return `Visit the shop · ${base}`;
    case "wishlist":
      return `Wishlist · ${base}`;
    case "checkout":
      return `Demo checkout · ${base}`;
    case "order":
      return `Demo order confirmed · ${base}`;
    case "policies":
      return `Policies (placeholder) · ${base}`;
    default:
      return `Not found · ${base}`;
  }
}

function routeKey(route: Route): string {
  if (route.name === "product") return `product-${route.id}`;
  if (route.name === "shop") return "shop"; // category changes keep the shop mounted
  return route.name;
}

function Page({ route }: { route: Route }) {
  switch (route.name) {
    case "home":
      return <Home />;
    case "shop":
      return <Shop category={route.category} />;
    case "product":
      return <Product id={route.id} />;
    case "collections":
      return <Collections />;
    case "visit":
      return <Visit />;
    case "wishlist":
      return <Wishlist />;
    case "checkout":
      return <Checkout />;
    case "order":
      return <Confirmation />;
    case "policies":
      return <Policies />;
    default:
      return <NotFound />;
  }
}

function Shell() {
  const route = useRoute();
  const key = routeKey(route);
  const mainRef = useRef<HTMLElement>(null);
  const firstLoad = useRef(true);
  const firstEntrance = useRef(true);

  // On route change: reset scroll, move focus to the page heading, update the title.
  useEffect(() => {
    document.title = titleFor(route);
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "auto" });
    const t = window.setTimeout(() => {
      document.getElementById("page-title")?.focus({ preventScroll: true });
      ScrollTrigger.refresh();
    }, 60);
    return () => window.clearTimeout(t);
  }, [route]);

  // Gentle page entrance. Pages are fully readable even if this never runs.
  useGSAP(
    () => {
      if (!mainRef.current) return;
      if (firstEntrance.current) {
        firstEntrance.current = false;
        return;
      }
      // Opacity only: a transform on <main> would break ScrollTrigger pinning inside it.
      gsap.fromTo(mainRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: d(0.45), clearProps: "opacity,visibility" });
    },
    { dependencies: [key], scope: mainRef },
  );

  // Recalculate scroll positions once web fonts settle.
  useEffect(() => {
    document.fonts?.ready.then(() => ScrollTrigger.refresh()).catch(() => undefined);
  }, []);

  return (
    <>
      <a className="skip-link" href="#main-content" onClick={(e) => {
        e.preventDefault();
        document.getElementById("page-title")?.focus();
      }}>
        Skip to content
      </a>
      <Header route={route} />
      <main id="main-content" ref={mainRef} className={route.name === "home" ? "has-hero" : ""} tabIndex={-1} style={{ outline: "none" }}>
        <Page key={key} route={route} />
      </main>
      <Footer />
      <CartDrawer />
      <Toasts />
    </>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
