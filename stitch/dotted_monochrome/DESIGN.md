# Design System Strategy

## 1. Overview & Creative North Star: "The Precision Canvas"

This design system is built upon the **Creative North Star of "The Precision Canvas."** It moves away from the cluttered, gamified aesthetic typical of quiz platforms and instead embraces a high-end editorial feel rooted in technical elegance. The "Dotted Surface" isn't just a background; it represents a rhythmic, mathematical foundation for information.

The layout strategy breaks the "standard template" look through **intentional asymmetry** and **breathing room**. Instead of centering everything, we use a wide-margin approach where content might sit slightly off-axis to create visual tension and sophistication. By leveraging high-contrast typography and expansive white space, we ensure that every quiz question feels like a curated piece of content rather than a form field.

---

## 2. Colors

The palette is a sophisticated monochrome spectrum, designed to let the "Dotted Surface" texture and the user's content provide the primary visual interest.

*   **Primary (#101519):** Used for high-impact elements. It is an "off-black" that feels more premium and less harsh than pure black.
*   **Surface Hierarchy & Nesting:** We define depth through tonal shifts rather than lines.
    *   `surface` (#f9f9f9): The base layer.
    *   `surface_container_low` (#f3f3f3): Used for secondary content areas.
    *   `surface_container_highest` (#e2e2e2): Used for interactive parent containers.
*   **The "No-Line" Rule:** To maintain an editorial, high-end look, **1px solid borders are prohibited for sectioning.** Boundaries must be defined solely through color shifts. For example, a quiz progress bar area should be defined by a `surface_container_low` background sitting against a `surface` page, not by a stroke.
*   **Signature Textures:** For main CTAs and hero states, utilize a subtle gradient transition from `primary` (#101519) to `primary_container` (#24292e). This provides a "soulful" depth that flat hex codes cannot achieve, mimicking the look of premium ink or dark carbon.
*   **The Glass Rule:** Floating interaction elements (like a "Finish Quiz" FAB) should use `surface_container_lowest` (#ffffff) at 80% opacity with a `24px` backdrop-blur to create a "frosted glass" effect that allows the dotted wave background to subtly bleed through.

---

## 3. Typography

The typographic system utilizes a "High-Contrast Scale" to drive authority and readability.

*   **Display & Headlines (Space Grotesk):** These are our "Statement" fonts. `display-lg` (3.5rem) should be used for score totals or quiz titles, providing a technical, sleek professional edge. The geometric nature of Space Grotesk echoes the precision of the dotted grid.
*   **Body & Labels (Inter):** Inter handles the "Workhorse" duties. Its neutral, clean structure ensures that even long-form quiz questions remain legible at `body-lg` (1rem).
*   **Monospaced Accents:** In reference to GeistMono from the brand profile, use monospaced styling for metadata (e.g., "Question 04/10" or "Timer: 00:45") using `label-md` to reinforce the technical, precision-driven theme.

---

## 4. Elevation & Depth

In this design system, we do not "drop shadows" in the traditional sense. We layer light.

*   **The Layering Principle:** Place a `surface_container_lowest` (#ffffff) card on a `surface_container_low` (#f3f3f3) section to create a soft, natural lift. The contrast in lightness provides all the "elevation" needed.
*   **Ambient Shadows:** If a floating state is required (e.g., a modal or a floating action menu), use an extra-diffused shadow: `box-shadow: 0 20px 40px rgba(26, 28, 28, 0.06)`. This mimics ambient light rather than a harsh digital shadow.
*   **The "Ghost Border" Fallback:** If a container must be defined against an identical background for accessibility, use a "Ghost Border": the `outline_variant` token at **15% opacity**. Never use a 100% opaque stroke.
*   **Glassmorphism:** Use semi-transparent white backgrounds with backdrop filters for any element that sits directly over the "Dotted Wave." This creates a sense of physical layers—like a sheet of vellum paper resting on a technical drawing.

---

## 5. Components

### Buttons
*   **Primary:** `primary` (#101519) background with `on_primary` (#ffffff) text. Use `xl` (0.75rem) roundedness. No border.
*   **Secondary:** `surface_container_highest` (#e2e2e2) background. Interaction is signaled by a subtle shift to `outline_variant`.
*   **Tertiary:** Text-only with GeistMono-style `label-md` styling and a `0.125rem` underline offset.

### Quiz Choice Chips
*   **Unselected:** `surface_container_low` background, no border.
*   **Selected:** `primary` background with `on_primary` text. Use a subtle `0.375rem` (md) corner radius to make them feel "clickable" and tactile.
*   **Feedback States:** Correct answers should use a subtle `on_tertiary_container` (#498dff) tint rather than a bright, distracting green to maintain the monochrome sophistication.

### Progress Indicators
*   Avoid standard "loading bars." Use a series of dots that mirror the "Dotted Surface" aesthetic. As the user progresses, dots transition from `outline_variant` to `primary`.

### Input Fields
*   **Design:** A single bottom-aligned "Ghost Border" (15% opacity `outline_variant`) rather than a box. This maintains the editorial, "open" feel of the page.

---

## 6. Do's and Don'ts

### Do
*   **Do** use asymmetrical margins. If the quiz question is on the left, let the "Dotted Surface" wave take up the right 40% of the viewport.
*   **Do** prioritize vertical white space. Use the Spacing Scale to separate questions by at least `48px` to `64px`.
*   **Do** use GeistMono for technical data (scores, times, percentages) to lean into the "Precision" theme.

### Don't
*   **Don't** use 1px solid black borders. It breaks the "Precision Canvas" illusion and makes the UI feel like a generic wireframe.
*   **Don't** use heavy "drop shadows." They feel dated. Use tonal layering (`surface` on `surface_container`) instead.
*   **Don't** use "Gamified" colors (bright yellows, oranges). Stick to the monochrome palette with high-contrast `primary` accents to ensure the platform feels premium and professional.
*   **Don't** use divider lines between list items. Use `16px` of white space and a `surface` color shift to denote separate items.