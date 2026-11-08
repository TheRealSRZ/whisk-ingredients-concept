import { expect, test, type Page } from "@playwright/test";

/*
 * End-to-end QA for the Whisk Ingredients concept (single-file build).
 * Each test maps to a scenario in the brief's QA section.
 */

const rm = (s: string | null) => Number((s ?? "").replace(/[^0-9.]/g, ""));

async function fresh(page: Page, hash = "") {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.goto(`/${hash}`);
  await page.waitForLoadState("domcontentloaded");
}

async function quickAdd(page: Page, productId: string) {
  await page.goto("/#shop");
  const card = page.locator(`[data-product-id="${productId}"]`).first();
  await card.scrollIntoViewIfNeeded();
  await card.locator(".card__quick").click();
}

test.describe("Journey A — collection to cart", () => {
  test("homepage → collection → product → variant → qty 2 → cart subtotal → continue shopping", async ({ page }) => {
    await fresh(page);
    await expect(page.getByTestId("hero")).toBeVisible();
    await page.getByTestId("collection-chocolate").click();
    await expect(page).toHaveURL(/#shop-chocolate$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Chocolate & Flavours");
    await expect(page.getByTestId("result-count")).toHaveText("Showing 6 of 26 products");

    await page.locator('[data-product-id="dark-couverture-callets"] .card__name').click();
    await expect(page).toHaveURL(/#product-dark-couverture-callets$/);
    await expect(page.getByTestId("pdp-price")).toHaveText("RM 79.90");

    await page.locator('label:has([data-testid="option-Size-2.5 kg"])').click();
    await expect(page.getByTestId("pdp-price")).toHaveText("RM 189.00");
    await expect(page.getByTestId("pdp-sku")).toHaveText("SKU CHO-DARK70-2KG5");

    await page.getByRole("button", { name: "Increase quantity" }).click();
    await expect(page.locator("#qty-dark-couverture-callets")).toHaveValue("2");
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("toast").first()).toContainText("Added 2 × Dark Couverture Callets 70% (2.5 kg)");
    await expect(page.getByTestId("cart-count")).toHaveText("2");

    await page.getByTestId("open-cart").click();
    await expect(page.getByRole("dialog", { name: /Your cart/ })).toBeVisible();
    await expect(page.getByTestId("subtotal")).toHaveText("RM 378.00");
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
    await page.getByRole("button", { name: "Continue shopping" }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/#product-dark-couverture-callets$/);
  });
});

test.describe("Journey B — search, filter, sort, wishlist, add, remove", () => {
  test("search + category filter + sort + wishlist + add + remove with consistent counts", async ({ page }) => {
    await fresh(page, "#shop");
    await page.getByTestId("shop-search").fill("callets");
    await expect(page.getByTestId("result-count")).toHaveText("Showing 3 of 26 products");
    await page.locator('label:has([data-testid="filter-cat-chocolate"])').click();
    await expect(page).toHaveURL(/#shop-chocolate$/);
    await expect(page.getByTestId("result-count")).toHaveText("Showing 3 of 26 products");

    await page.getByTestId("sort").selectOption("price-desc");
    const prices = await page.locator("[data-testid=product-card] .card__price").allTextContents();
    const nums = prices.map(rm);
    expect(nums).toEqual([...nums].sort((a, b) => b - a));
    await page.getByTestId("sort").selectOption("price-asc");
    const asc = (await page.locator("[data-testid=product-card] .card__price").allTextContents()).map(rm);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));

    const card = page.locator('[data-product-id="milk-couverture-callets"]');
    await card.getByRole("button", { name: /Save Milk Couverture/ }).click();
    await expect(page.getByTestId("wishlist-count")).toHaveText("1");
    await expect(card.getByRole("button", { name: /Remove Milk Couverture/ })).toHaveAttribute("aria-pressed", "true");

    await card.locator(".card__quick").click();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.getByTestId("open-cart").click();
    await expect(page.getByTestId("cart-line")).toHaveCount(1);
    await page.getByTestId("remove-line").click();
    await expect(page.getByTestId("cart-empty")).toBeVisible();
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Cart, 0 items" })).toBeAttached();
    await expect(page.getByTestId("wishlist-count")).toHaveText("1");

    await page.getByTestId("close-cart").click();
    await page.goto("/#wishlist");
    await expect(page.getByTestId("wishlist-grid").locator("[data-testid=product-card]")).toHaveCount(1);
  });

  test("price band filter, empty state and clear-all", async ({ page }) => {
    await fresh(page, "#shop");
    await page.locator('label:has([data-testid="filter-price-over-100"])').click();
    await expect(page.getByTestId("result-count")).toHaveText("Showing 1 of 26 products");
    await page.getByTestId("shop-search").fill("whisk sprinkles");
    await expect(page.getByTestId("empty-results")).toBeVisible();
    await page.getByTestId("clear-filters").click();
    await expect(page.getByTestId("result-count")).toHaveText("Showing 26 of 26 products");
  });
});

test.describe("Journey C — multi-item order with BAKE10 and pickup", () => {
  test("adds items, applies BAKE10, completes pickup checkout, confirmation matches cart", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour"); // RM 6.90
    await quickAdd(page, "vanilla-bean-paste"); // RM 32.90
    await quickAdd(page, "angled-offset-spatula"); // RM 18.90
    await expect(page.getByTestId("cart-count")).toHaveText("3");

    await page.getByTestId("open-cart").click();
    await expect(page.getByTestId("subtotal")).toHaveText("RM 58.70");
    await page.getByTestId("promo-input").fill("bake10");
    await page.getByTestId("promo-apply").click();
    await expect(page.getByTestId("promo-applied")).toBeVisible();
    await expect(page.getByTestId("discount")).toHaveText("−RM 5.87");
    await page.getByTestId("go-checkout").click();
    await expect(page).toHaveURL(/#checkout$/);
    await expect(page.getByTestId("sim-banner")).toBeVisible();
    await expect(page.getByTestId("demo-notice")).toBeVisible();

    await page.locator("#field-name").fill("Nur Aisyah binti Ahmad");
    await page.locator("#field-email").fill("aisyah@example.com");
    await page.locator("#field-phone").fill("012-345 6789");
    await page.getByTestId("step-next").click();

    await expect(page.getByTestId("step-2")).toBeVisible();
    await page.getByTestId("fulfil-pickup").check();
    await page.getByTestId("step-next").click();

    await expect(page.getByTestId("step-3")).toBeVisible();
    await page.getByTestId("pay-demo-banking").check();
    await page.getByTestId("ack").check();
    await page.getByTestId("step-next").click();

    await expect(page.getByTestId("step-4")).toBeVisible();
    await expect(page.getByTestId("review-items")).toContainText("Superfine Cake Flour");
    await expect(page.getByTestId("review-total")).toHaveText("RM 52.83");
    await expect(page.getByTestId("sum-total")).toHaveText("RM 52.83");
    await page.getByTestId("step-next").click();

    await expect(page.getByTestId("processing")).toBeVisible();
    await expect(page).toHaveURL(/#order-confirmed$/, { timeout: 10_000 });
    await expect(page.getByTestId("order-ref")).toHaveText(/^DEMO-[A-HJ-NP-Z2-9]{8}$/);
    await expect(page.getByTestId("confirm-total")).toHaveText("RM 52.83");
    await expect(page.getByTestId("confirm-lines").locator("li")).toHaveCount(3);
    await expect(page.getByTestId("confirmation")).toContainText("Nothing was sent");
    await expect(page.getByTestId("cart-count")).toHaveCount(0);
    await page.getByTestId("return-to-shop").click();
    await expect(page).toHaveURL(/#shop$/);
  });

  test("back navigation and editing fulfilment from review recalculates delivery", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    await quickAdd(page, "vanilla-bean-paste");
    await quickAdd(page, "angled-offset-spatula");
    await page.goto("/#checkout");
    await page.locator("#field-name").fill("Raj a/l Kumar");
    await page.locator("#field-email").fill("raj@example.com");
    await page.locator("#field-phone").fill("+60 3-4162 3300");
    await page.getByTestId("step-next").click();
    await page.getByTestId("fulfil-pickup").check();
    await page.getByTestId("step-next").click();
    await page.getByTestId("pay-demo-card").check();
    await page.getByTestId("ack").check();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("review-total")).toHaveText("RM 58.70");

    // Back button keeps entered data.
    await page.getByTestId("step-back").click();
    await expect(page.getByTestId("pay-demo-card")).toBeChecked();
    await page.getByTestId("step-back").click();
    await page.getByTestId("step-back").click();
    await expect(page.locator("#field-name")).toHaveValue("Raj a/l Kumar");
    await page.getByTestId("step-next").click();
    await page.getByTestId("step-next").click();
    await page.getByTestId("step-next").click();

    // Edit fulfilment from review → switch to delivery in Selangor.
    await page.getByTestId("edit-fulfilment").click();
    await expect(page.getByTestId("step-2")).toBeVisible();
    await page.getByTestId("fulfil-delivery").check();
    await page.locator("#field-address").fill("12, Jalan Melawati 3");
    await page.locator("#field-city").fill("Ampang");
    await page.locator("#field-state").selectOption("Selangor");
    await page.locator("#field-postcode").fill("68000");
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("pay-demo-card")).toBeChecked();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("review-total")).toHaveText("RM 70.70"); // 58.70 + 12.00 demo Klang Valley delivery
    await expect(page.getByTestId("step-4")).toContainText("Local delivery (demo) to 12, Jalan Melawati 3, 68000 Ampang, Selangor");
  });
});

test.describe("Failure scenarios", () => {
  test("invalid coupon shows an error and no discount", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    await page.getByTestId("open-cart").click();
    await page.getByTestId("promo-input").fill("FREECAKE");
    await page.getByTestId("promo-apply").click();
    await expect(page.getByTestId("promo-error")).toHaveText(/isn't valid/);
    await expect(page.getByTestId("promo-input")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("discount")).toHaveCount(0);
    await expect(page.getByTestId("grand-total")).toHaveText("RM 18.90"); // 6.90 + 12.00 estimate
  });

  test("checkout with an empty cart shows a usable empty state", async ({ page }) => {
    await fresh(page, "#checkout");
    await expect(page.getByTestId("checkout-empty")).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse the shop" })).toBeVisible();
  });

  test("invalid customer information is reported clearly", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    await page.goto("/#checkout");
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("error-summary")).toContainText("There are 3 problems");
    await expect(page.locator("#field-name")).toHaveAttribute("aria-invalid", "true");
    await page.locator("#field-name").fill("Siti");
    await page.locator("#field-email").fill("siti@");
    await page.locator("#field-phone").fill("12345");
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("error-summary")).toContainText("Enter an email like name@example.com");
    await expect(page.getByTestId("error-summary")).toContainText("Enter a Malaysian number");
    await expect(page.getByTestId("step-1")).toBeVisible();
    // Error summary links move focus to the field.
    await page.getByTestId("error-summary").getByRole("link", { name: /Email/ }).click();
    await expect(page.locator("#field-email")).toBeFocused();
  });

  test("invalid delivery information is reported clearly", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    await page.goto("/#checkout");
    await page.locator("#field-name").fill("Tan Mei Ling");
    await page.locator("#field-email").fill("mei@example.com");
    await page.locator("#field-phone").fill("019-338 0049");
    await page.getByTestId("step-next").click();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("error-summary")).toContainText("Choose store pickup or local delivery");
    await page.getByTestId("fulfil-delivery").check();
    await page.locator("#field-postcode").fill("531");
    await page.getByTestId("step-next").click();
    const summary = page.getByTestId("error-summary");
    await expect(summary).toContainText("Enter your street address");
    await expect(summary).toContainText("Choose your state");
    await expect(summary).toContainText("Postcodes in Malaysia have 5 digits");
    await expect(page.getByTestId("step-2")).toBeVisible();
  });

  test("payment step cannot be passed incomplete, and placing an order re-validates every step", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    await page.goto("/#checkout");
    await page.locator("#field-name").fill("Lim Wei");
    await page.locator("#field-email").fill("lim@example.com");
    await page.locator("#field-phone").fill("0123456789");
    await page.getByTestId("step-next").click();
    await page.getByTestId("fulfil-pickup").check();
    await page.getByTestId("step-next").click();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("error-summary")).toContainText("Choose a demo payment method");
    await expect(page.getByTestId("error-summary")).toContainText("Confirm that you understand");
    await page.getByTestId("pay-demo-banking").check();
    await page.getByTestId("ack").check();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("step-4")).toBeVisible();

    // Break step 1 after reaching review, jump back to review, try to place the order.
    await page.getByRole("button", { name: "Details" }).click();
    await page.locator("#field-email").fill("not-an-email");
    await page.getByRole("button", { name: "Review" }).click();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("step-1")).toBeVisible();
    await expect(page.getByTestId("error-summary")).toContainText("Enter an email like name@example.com");
    await expect(page).toHaveURL(/#checkout$/);
  });

  test("leaving checkout during the simulated payment cancels it and keeps the cart", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    await page.goto("/#checkout");
    await page.locator("#field-name").fill("Cancel Test");
    await page.locator("#field-email").fill("c@example.com");
    await page.locator("#field-phone").fill("0123456789");
    await page.getByTestId("step-next").click();
    await page.getByTestId("fulfil-pickup").check();
    await page.getByTestId("step-next").click();
    await page.getByTestId("pay-demo-banking").check();
    await page.getByTestId("ack").check();
    await page.getByTestId("step-next").click();
    await page.getByTestId("step-next").click();
    await expect(page.getByTestId("processing")).toBeVisible();
    await page.goto("/#shop");
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/#shop$/);
    await expect(page.getByTestId("cart-count")).toHaveText("1");
  });

  test("typing a non-integer quantity reverts instead of guessing", async ({ page }) => {
    await fresh(page, "#product-superfine-cake-flour");
    const qty = page.locator("#qty-superfine-cake-flour");
    await qty.fill("1.5");
    await qty.press("Enter");
    await expect(qty).toHaveValue("1");
    await qty.fill("3");
    await qty.press("Enter");
    await expect(qty).toHaveValue("3");
  });

  test("quantity above demo stock is clamped and further adds are blocked", async ({ page }) => {
    await fresh(page, "#product-double-acting-baking-powder");
    await page.locator('label:has([data-testid="option-Size-500 g"])').click();
    await expect(page.getByTestId("stock")).toHaveText("Only 4 left in demo stock");
    const qty = page.locator("#qty-double-acting-baking-powder");
    await qty.fill("10");
    await qty.press("Enter");
    await expect(qty).toHaveValue("4");
    await page.getByTestId("add-to-cart").click();
    await expect(page.getByTestId("cart-count")).toHaveText("4");
    await expect(page.getByTestId("add-to-cart")).toBeDisabled();
    await expect(page.getByTestId("stock")).toContainText("already in your cart");
    await page.getByTestId("open-cart").click();
    await expect(page.getByRole("button", { name: /Increase quantity for Double-Acting/ })).toBeDisabled();
    await expect(page.getByTestId("cart-line")).toContainText("Maximum demo stock reached");
  });

  test("out-of-stock variant cannot be added", async ({ page }) => {
    await fresh(page, "#product-white-couverture-callets");
    await expect(page.getByTestId("stock")).toHaveText("Out of stock (demo)");
    await expect(page.getByTestId("add-to-cart")).toBeDisabled();
  });

  test("cart and wishlist persist across a refresh; checkout details do not", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "dutch-cocoa-powder");
    await page.locator('[data-product-id="sugar-pearls"]').getByRole("button", { name: /Save Sugar Pearls/ }).click();
    await page.goto("/#checkout");
    await page.locator("#field-name").fill("Persist Test");
    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await expect(page.getByTestId("wishlist-count")).toHaveText("1");
    await expect(page.locator("#field-name")).toHaveValue("");
    const stored = await page.evaluate(() => localStorage.getItem("whisk-concept:v1") ?? "");
    expect(stored).not.toContain("Persist Test");
  });

  test("tampered localStorage is sanitised safely", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() =>
      localStorage.setItem(
        "whisk-concept:v1",
        JSON.stringify({ cart: { lines: [{ sku: "ESS-BKPWD-500G", qty: 999 }, { sku: "<img src=x onerror=alert(1)>", qty: 1 }], promoCode: "BAKE10" }, wishlist: ["nope", "sugar-pearls"] }),
      ),
    );
    await page.reload();
    await expect(page.getByTestId("cart-count")).toHaveText("4");
    await expect(page.getByTestId("wishlist-count")).toHaveText("1");
  });
});

test.describe("Keyboard, motion and environment", () => {
  test("keyboard only: skip link, cart dialog focus trap, Escape restores focus", async ({ page }) => {
    await fresh(page, "#shop");
    await page.reload(); // start from a full page load, as a keyboard user arriving would
    await expect(page.getByTestId("result-count")).toBeVisible();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#page-title")).toBeFocused();

    const cartBtn = page.getByTestId("open-cart");
    await cartBtn.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("close-cart")).toBeFocused();
    for (let i = 0; i < 6; i += 1) await page.keyboard.press("Tab");
    const inside = await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
    expect(inside).toBe(true);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(cartBtn).toBeFocused();

    // Add a product using only the keyboard.
    const quick = page.locator('[data-product-id="superfine-cake-flour"] .card__quick');
    await quick.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    // Visible focus indicator exists.
    const outline = await quick.evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).not.toBe("none");
  });

  test("GSAP and ScrollTrigger run in the preview (desktop, motion allowed)", async ({ page }) => {
    await fresh(page);
    await page.waitForTimeout(400);
    const transform = await page.locator(".hero h1 .line > span").first().evaluate((el) => (el as HTMLElement).style.transform);
    expect(transform).toContain("translate");
    await expect(page.getByTestId("story")).toHaveClass(/is-animated/);
    await expect(page.locator(".pin-spacer")).toHaveCount(1);
    await page.waitForTimeout(1600);
    const opacity = await page.locator(".hero h1 .line > span").first().evaluate((el) => getComputedStyle(el).transform);
    expect(opacity === "none" || opacity.includes("matrix(1, 0, 0, 1, 0, 0)")).toBe(true);
  });

  test("reduced motion: no pinned story, content visible immediately", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto("/");
    await expect(page.getByTestId("story")).not.toHaveClass(/is-animated/);
    await expect(page.locator(".pin-spacer")).toHaveCount(0);
    const style = await page.locator(".hero h1 .line > span").first().evaluate((el) => (el as HTMLElement).style.transform);
    expect(style).toBe("");
    await page.locator(".story__step").first().scrollIntoViewIfNeeded();
    await expect(page.locator(".story__step")).toHaveCount(3);
    for (const step of await page.locator(".story__step").all()) await expect(step).toBeVisible();
    await page.getByTestId("open-cart").click();
    await expect(page.getByTestId("close-cart")).toBeVisible();
    await ctx.close();
  });

  test("mobile: menu navigation and a complete checkout at 390px", async ({ browser }) => {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    const page = await ctx.newPage();
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog", { name: "Menu" })).toBeVisible();
    await page.getByRole("dialog", { name: "Menu" }).getByRole("link", { name: "Shop" }).click();
    await expect(page).toHaveURL(/#shop$/);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.getByRole("button", { name: "Show filters" }).click();
    await page.locator('label:has([data-testid="filter-cat-tools"])').click();
    await expect(page.getByTestId("result-count")).toHaveText("Showing 5 of 26 products");
    await page.locator('[data-product-id="balloon-whisk"] .card__quick').tap();
    await expect(page.getByTestId("cart-count")).toHaveText("1");
    await page.getByTestId("open-cart").tap();
    await page.getByTestId("go-checkout").tap();
    await page.locator("#field-name").fill("Aiman");
    await page.locator("#field-email").fill("aiman@example.my");
    await page.locator("#field-phone").fill("011-1114 8332");
    await page.getByTestId("step-next").tap();
    await page.getByTestId("fulfil-pickup").check();
    await page.getByTestId("step-next").tap();
    await page.getByTestId("pay-demo-banking").check();
    await page.getByTestId("ack").check();
    await page.getByTestId("step-next").tap();
    await page.getByTestId("step-next").tap();
    await expect(page.getByTestId("order-ref")).toBeVisible({ timeout: 10_000 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await ctx.close();
  });

  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`no horizontal overflow at ${width}px on key pages`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width, height: 900 } });
      const page = await ctx.newPage();
      for (const hash of ["", "#shop", "#product-sprinkle-medley", "#collections", "#visit", "#wishlist", "#policies"]) {
        await page.goto(`/${hash}`);
        await page.waitForTimeout(250);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${hash || "#home"} at ${width}px`).toBeLessThanOrEqual(0);
      }
      await ctx.close();
    });
  }

  test("no external network requests, no console errors, no card fields", async ({ page }) => {
    const external: string[] = [];
    const errors: string[] = [];
    page.on("request", (r) => {
      const u = r.url();
      if (!u.startsWith("http://127.0.0.1") && !u.startsWith("data:") && !u.startsWith("blob:")) external.push(u);
    });
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    for (const hash of ["#home", "#collections", "#visit", "#product-vanilla-bean-paste", "#checkout"]) {
      await page.goto(`/${hash}`);
      await page.waitForTimeout(200);
    }
    await page.locator("#field-name").fill("Card Check");
    await page.locator("#field-email").fill("c@example.com");
    await page.locator("#field-phone").fill("0123456789");
    await page.getByTestId("step-next").click();
    await page.getByTestId("fulfil-pickup").check();
    await page.getByTestId("step-next").click();
    const cardInputs = await page.locator('input[autocomplete^="cc-"], input[name*="card" i], input[id*="cvv" i], input[type="password"]').count();
    expect(cardInputs).toBe(0);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
  });

  test("visit page shows location, hours and official Google Maps links; Approach page is gone", async ({ page }) => {
    await page.goto("/#visit");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Find us in Taman Melawati.");
    await expect(page.getByTestId("visit-address")).toContainText("268–269, Jalan Bandar 12");
    await expect(page.getByTestId("visit-address")).toContainText("53100 Kuala Lumpur");
    await expect(page.getByTestId("open-status")).toHaveText(/Open now|Closed/);
    await expect(page.getByTestId("hours")).toContainText("Monday – Saturday");
    const maps = page.getByTestId("maps-link");
    await expect(maps).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=Whisk%20Ingredients/);
    await expect(maps).toHaveAttribute("target", "_blank");
    await expect(page.getByTestId("directions-link")).toHaveAttribute("href", /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&destination=/);
    await expect(page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Visit" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("link", { name: /Our Approach/i })).toHaveCount(0);
    await page.goto("/#approach");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn't exist");
  });

  test("'concept' and 'prototype' appear only in the header and footer", async ({ page }) => {
    await fresh(page);
    await quickAdd(page, "superfine-cake-flour");
    for (const hash of ["#home", "#shop", "#product-sprinkle-medley", "#collections", "#visit", "#wishlist", "#checkout", "#policies", "#nope"]) {
      await page.goto(`/${hash}`);
      await page.waitForTimeout(150);
      const text = await page.locator("main").innerText();
      expect(text, hash).not.toMatch(/concept|prototype/i);
    }
  });

  test("unknown routes show a recoverable not-found page", async ({ page }) => {
    await page.goto("/#product-does-not-exist");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("doesn't exist");
    await page.getByRole("link", { name: "Go to the shop" }).click();
    await expect(page).toHaveURL(/#shop$/);
  });
});
