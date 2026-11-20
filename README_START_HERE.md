# UPFOREX — Premium Animated Homepage (Standalone HTML / CSS / JS)

This is a **new homepage concept only**. It does not replace or modify the Angular project.
The original UPFOREX brand palette remains **black / navy, neon green `#3cff19`, blue globe accents, and white text**.

## Open on Windows

1. Extract `UPFOREX_PREMIUM_HOMEPAGE_HTML_CSS_JS.zip` completely.
2. Open `UPFOREX_PREMIUM_HOMEPAGE_HTML_CSS_JS/`.
3. Double-click **`index.html`** in Chrome or Edge. Keep the `assets/` folder next to it.
4. For local development, use VS Code **Live Server**, or from the extracted folder run:
   ```powershell
   py -m http.server 8000
   ```
   and open `http://localhost:8000/`.

**No `npm install`, Angular, API key, internet access, or third-party JS library is needed for the homepage preview.** External account and product links obviously require internet access.

## Files

- `index.html` — homepage structure, section copy, navigation, footer, and local asset references.
- `style.css` — complete design system, transitions, responsive layout, and reduced-motion rules.
- `script.js` — animations, geographic globe, interactions, video, and slider.
- `assets/` — original UPFOREX assets repurposed/optimized for the standalone homepage, including the local video. The horizontal brand mark is composed from the original UPFOREX logo artwork, with the same colours.

## Homepage sections

1. Hero with animated blue geographic globe and CTA.
2. Welcome to UPFOREX and resource cards.
3. Trade with Confidence / trading conditions.
4. Global Assets — all 6 market categories and interactive cards.
5. ECN Connectivity — embedded local trading video with play/pause and mute.
6. Smart Trading Features — four feature cards.
7. MetaTrader 5 — slide carousel and download links.
8. Final Join/Account CTA.
9. Footer, social links and risk information.

The slim scrolling market ribbon is a visual enhancement between the hero and welcome sections.

## Animation and accessibility

- Coordinated one-time scroll entrances (~0.8–1.3 sec).
- Cursor-controlled 3D card lift and gentle hover shine on desktops.
- Slowly rotating blue canvas globe, with no WebGL dependency.
- Smooth CTA micro-interactions and subtle market ribbon motion.
- Functional responsive mobile menu, sticky navigation, back-to-top, scroll progress.
- Functional MT5 image carousel that pauses on hover/focus and when offscreen.
- Video plays only after a user action and pauses when out of view.
- `prefers-reduced-motion` disables nonessential movement.
- No other pages, APIs, forms, databases, or Angular routing are included; this is a **standalone homepage**.

## Before publishing

- Verify current legal/compliance copy with the company/compliance team.
- Check all outbound URLs against your real routes and CRM. **Both the “Open account” and “Try free demo” links currently lead to the registration URL supplied with the original project**, since no separate demo URL was verified.
- Replace/remove any marketing phrases that are not approved for your jurisdiction.
- If integrating with the live Angular app, first migrate the approved HTML/CSS/JS into its existing components and verify routes, translations, SEO, and disclosures. Do not publish this standalone page over the app without integration work.

## Testing recorded

Validated with a Chromium-based browser renderer using an in-memory copy with local assets embedded because this test environment blocks local URL navigation:

- Desktop **1440px**, mobile **390px**, reduced-motion mode.
- All **8 homepage sections** and **6 market cards** present.
- **47 scroll-reveal elements** became visible.
- Mobile menu open/close, MT5 slider forward, video play and mute toggling.
- No horizontal overflow at 390px; JavaScript produced **no uncaught errors**.
- `node --check script.js` syntax check.

Actual deployment to the user's hosting / Angular environment has not been performed or verified.
