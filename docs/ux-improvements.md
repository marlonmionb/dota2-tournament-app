# UX Improvements — Vex's Review

> Review conducted by Vex (UX Designer agent) on the home page. March 26, 2026.

---

## Home Page

### ✅ [Critical] Replace blue with Dota 2 brand colors

- **Files**: `src/app/page.tsx`, `src/components/navbar.tsx`
- **What**: Primary CTA and navbar sign-in button use `bg-blue-600` / `hover:bg-blue-700`, which is off-brand.
- **Why**: Dota 2's visual identity is built around deep reds, amber/gold, and dark navy — not blue. Blue reads as a generic SaaS product.
- **How**: Replace `bg-blue-600` / `hover:bg-blue-700` with `bg-red-600` / `hover:bg-red-700` (Dota red) or `bg-yellow-500` / `hover:bg-yellow-400` (gold). Apply consistently across both files.

---

### ✅ [Critical] Add atmosphere to the hero section

- **File**: `src/app/page.tsx`
- **What**: The hero is centered text on a black void. The `min-h-[70vh]` block is mostly dead space.
- **Why**: The page needs to convey the energy of competition. A pure black background with no texture feels like a placeholder.
- **How**: Add a subtle background — either a dark overlay image (Dota map, Radiant/Dire motif) using `bg-[url(...)] bg-cover bg-center` with a dark opacity layer, or a radial gradient such as `bg-gradient-radial from-red-950/30 via-transparent to-black`.

---

### ✅ [High]  Increase subtitle text contrast

- **File**: `src/app/page.tsx`
- **What**: Subtitle uses `text-gray-500` on a `#0a0a0a` background — contrast barely passes WCAG AA.
- **Why**: Hard to read in typical late-night gaming conditions (dark room, laptop screen).
- **How**: Change to `text-gray-300` or `text-gray-400`.

---

### ✅ [High] Fix navbar — make it sticky and visible

- **File**: `src/components/navbar.tsx`
- **What**: The `<nav>` has no background color, so it blends into page content. It also isn't sticky.
- **Why**: Navigation must establish clear visual hierarchy and remain accessible while scrolling.
- **How**: Add `bg-black/80 backdrop-blur-sm sticky top-0 z-50` to the `<nav>` element.

---

### ✅ [High] Fix CTA button hierarchy

- **File**: `src/app/page.tsx`
- **What**: "Browse Tournaments" and "Create Tournament" have nearly identical visual weight.
- **Why**: Most visitors are players wanting to browse, not organizers. The primary action should dominate visually.
- **How**: Make "Browse Tournaments" clearly primary (larger, brand-colored, filled). Style "Create Tournament" as a ghost/secondary button, or restrict it to authenticated users only (move it to the navbar).

---

### ✅ [Nice to have] Add a brand icon to the navbar logo

- **File**: `src/components/navbar.tsx`
- **What**: The logo is plain text — "Dota 2 Tournaments".
- **Why**: A small icon adds personality and brand identity instantly.
- **How**: Add a `Sword` or `Shield` icon from `lucide-react` (already bundled with shadcn/ui) next to the wordmark.

---

### ✅ [Nice to have] Fill the empty space below the hero

- **File**: `src/app/page.tsx`
- **What**: ~30vh of black nothing sits below the CTA buttons.
- **Why**: Wasted real estate that increases bounce rate.
- **How**: Add a "How it works" section with three shadcn/ui `Card` components in a `grid grid-cols-3` layout, describing the three steps: **Create → Register → Play**.

---

## Global / CSS

### ✅ [Critical] Lock in a dark theme — don't rely on `prefers-color-scheme`

- **File**: `src/app/globals.css`
- **What**: Dark background (`#0a0a0a`) is currently applied only via a `@media (prefers-color-scheme: dark)` query. Users on light OS themes see a white background.
- **Why**: A Dota 2 tournament platform should always be dark. There's no use case for a light mode here.
- **How**: Move the dark background/foreground variables out of the media query and set them as the default `:root` values.

---

## Light Theme Enhancements

### ✅ [High] Add a warm base layer (avoid pure white everywhere)

- **Files**: `src/app/globals.css`
- **What**: The app uses mostly pure white backgrounds, making the UI feel flat.
- **Why**: Light themes need subtle tonal variation to create depth and avoid a sterile look.
- **How**: Set app background to a very light warm tone (for example `#f7f5f3`) and keep main surfaces/cards white.

---

### ✅ [High] Introduce a secondary accent color

- **Files**: `src/app/**/*.tsx`, `src/components/**/*.tsx`
- **What**: The palette currently relies almost entirely on red + grayscale.
- **Why**: A secondary accent improves visual hierarchy and reduces monotony.
- **How**: Keep red for primary actions, introduce amber for highlights/status emphasis, and use slate/ink tones for structure.

---

### ✅ [High] Add tonal separation between sections

- **File**: `src/app/page.tsx`
- **What**: Hero and "How it works" sections are close in tone.
- **Why**: In light UIs, section contrast is essential for rhythm and scanability.
- **How**: Use soft section backgrounds, for example:
	- Hero: `#fff4f4`
	- How it works: `#fafafa`
	- Dividers/borders: `#e6e1dc`

---

### ✅ [Medium] Expand semantic status colors for scannability

- **File**: `src/app/tournaments/page.tsx`
- **What**: Status styling should consistently encode meaning at a glance.
- **Why**: Organizers and players scan statuses quickly in list views.
- **How**: Use a semantic palette:
	- Draft: gray
	- Registration Open: green
	- Registration Closed: amber
	- In Progress: red
	- Completed: violet or slate

---

### ✅ [Medium] Add one subtle recurring visual motif

- **File**: `src/app/page.tsx`
- **What**: The page still lacks a signature visual texture.
- **Why**: A small motif gives identity without clutter.
- **How**: Add a low-opacity decorative layer (soft diagonal texture or map-like radial overlay) using red/amber tints.
