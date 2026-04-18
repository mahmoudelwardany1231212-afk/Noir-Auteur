# Design System Documentation: The Noir Auteur

## 1. Overview & Creative North Star

This design system is built upon the concept of **"The Noir Auteur."** It seeks to bridge the gap between the golden age of Hollywood and modern cinematic blockbusters. Our goal is to transform the digital interface into a stage where content is the star, and the UI acts as the lighting director—guiding the eye through dramatic contrast, high-end editorial typography, and atmospheric depth.

To move beyond "template" design, we utilize **intentional asymmetry** and **high-contrast scale**. Large, serif display titles should feel like opening credits, while the functional UI remains whisper-quiet in clean sans-serif. We avoid the "flatness" of modern SaaS by embracing "The Spotlight"—a technique where key actions are bathed in rich gold (`primary`) against a backdrop of deep, textured blacks.

---

## 2. Colors & The Cinematic Palette

The palette is rooted in a "Low-Key" lighting style. We use deep neutrals to create a sense of infinite space, punctuated by gold highlights that signify importance and prestige.

### The Color Tokens
*   **Background (`#131313`):** The stage. Everything begins in the shadows.
*   **Primary (`#f2ca50`):** The "Gold Statuette." Reserved for critical actions and high-brand moments.
*   **Primary Container (`#d4af37`):** A burnished gold for secondary emphasis.
*   **Surface Tiers:** Use `surface_container_lowest` (`#0e0e0e`) through `highest` (`#353534`) to build depth.

### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section off content. 
In this design system, boundaries are defined by light and shadow, not lines. To separate a section, shift the background color. For example, a `surface_container_low` section should sit on a `surface` background to create a soft, architectural transition. Lines feel "digital"; tonal shifts feel "cinematic."

### The "Glass & Gradient" Rule
To prevent the UI from feeling "heavy," use Glassmorphism for floating elements (modals, navigation bars). 
*   **Implementation:** Apply `surface_container` with a `backdrop-filter: blur(12px)` and 80% opacity. 
*   **Signature Textures:** Use a subtle radial gradient on Hero sections, transitioning from `primary` to `primary_container` at a 15% opacity to mimic a lens flare or spotlight.

---

## 3. Typography: The Script and The Screen

We pair a high-fashion serif with a utilitarian sans-serif to create an editorial rhythm.

*   **The Display & Headline (`notoSerif`):** This is our "Title Card" font. It should be used sparingly but with high impact. Use `display-lg` (3.5rem) for hero moments to evoke the feeling of a film's opening credits.
*   **The Title & Body (`manrope`):** Our "Script" font. It is clean, technical, and provides the necessary legibility for functional UI. It ensures that while the system looks like art, it functions like a tool.

**Hierarchy Tip:** Always lean into extreme scale. If a headline is large, make the supporting label `label-sm` (0.6875rem) with increased letter-spacing to create a "Director’s Cut" aesthetic.

---

## 4. Elevation & Depth: Tonal Layering

We abandon traditional drop shadows in favor of **Tonal Layering**. Depth is achieved by "stacking" surface tiers like physical sheets of film.

*   **The Layering Principle:** 
    *   Level 0 (Base): `surface`
    *   Level 1 (Cards): `surface_container_low`
    *   Level 2 (Active Elements): `surface_container_high`
*   **Ambient Shadows:** When a floating effect is required (e.g., a primary CTA button), use an extra-diffused shadow. 
    *   *Blur:* 24px-40px. 
    *   *Opacity:* 6%. 
    *   *Color:* Use a tinted version of `on_surface` (a warm grey) rather than pure black to simulate natural ambient occlusion.
*   **The "Ghost Border" Fallback:** If a container requires a border for accessibility, use the `outline_variant` token at **20% opacity**. It should be felt, not seen.

---

## 5. Components

### Buttons
*   **Primary:** Solid `primary` (`#f2ca50`) with `on_primary` text. Use `rounded-md` (0.375rem). This is your "Main Feature."
*   **Secondary:** `surface_container_highest` background with `primary` text. No border.
*   **Tertiary:** Transparent background, `on_surface_variant` text. Use for low-emphasis actions.

### Cards & Lists
*   **No Dividers:** Forbid the use of hairline dividers between list items. Use 16px–24px of vertical whitespace or a subtle background shift to `surface_container_low` on hover.
*   **Cinematic Ratios:** When using imagery within cards, stick to 16:9 or 2.39:1 (Anamorphic) aspect ratios to reinforce the film aesthetic.

### Input Fields
*   **Styling:** Use a "Bottom-Line Only" approach or a soft-filled `surface_container_lowest` box.
*   **Focus State:** The label should transition to `primary` gold, and the bottom highlight should expand slightly. Avoid thick glowing outlines.

### Chips & Tags
*   **Selection Chips:** Use `secondary_container` with a `primary` dot indicator. Keep edges `rounded-full` for a modern, sleek feel that contrasts against the sharp serif titles.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use extreme white space. Cinematic frames often use "negative space" to create tension; your UI should do the same.
*   **Do** use `notoSerif` for numbers in a data-heavy environment to make them feel like "Box Office" stats.
*   **Do** apply `backdrop-blur` to any element that overlaps an image.

### Don’t:
*   **Don’t** use high-saturation "Tinder-style" gradients. Our gradients must be tonal (gold to dark gold, or dark grey to black).
*   **Don’t** use pure `#000000` for backgrounds. Use `surface` (`#131313`) to allow for subtle shadow depth.
*   **Don’t** use standard 1px borders. If you feel the need to draw a line, try using a 40px gap instead.

### Accessibility Note:
While we embrace a "moody" aesthetic, ensure that all `on_surface` text meets AA contrast requirements against our `surface` containers. Use the `primary` gold specifically for interactive elements to ensure the user’s "path of travel" is always illuminated.