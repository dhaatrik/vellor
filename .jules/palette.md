## 2026-04-15 - Playwright Verification Flow
**Learning:** When using Playwright to verify internal UI components (like modals or specific routes), scripts must account for and successfully bypass the application's complex first-time onboarding flow, which includes master password creation, recovery key generation, profile setup, and tutorial overlays.
**Action:** Before writing assertions for internal components, verify if the application uses a strict onboarding gate and implement a robust helper function in the Playwright script to navigate through it consistently.

## 2026-04-19 - Raw Button Focus Visibility
**Learning:** Raw HTML `<button>` elements in this application often lack built-in focus visibility for keyboard navigation, as opposed to the custom `Button` component.
**Action:** When working with raw `<button>` elements, always explicitly include `focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2` (and dark mode variants) to ensure keyboard accessibility.

## 2026-04-20 - Interactive List Items Keyboard Accessibility
**Learning:** Interactive custom components (like `<Card>`) used as clickable list items must have explicit keyboard accessibility attributes (e.g., `role="button"`, `tabIndex={0}`, `onKeyDown`) and visible focus styles to ensure they are accessible to keyboard users.
**Action:** When adding `onClick` to non-button components or creating clickable cards, always include `role="button"`, `tabIndex={0}`, `onKeyDown` handlers for 'Enter' and 'Space', and Tailwind focus classes (`focus:outline-none focus-visible:ring-2 ...`).

## 2026-04-23 - Visual Feedback for Clipboard Operations
**Learning:** Users often copy important links or details (like Portal links or Contact cards) using navigator.clipboard.writeText, but the action happens silently without visual feedback. This leaves users unsure if the copy succeeded.
**Action:** Always pair clipboard copy actions with temporary visual feedback, such as changing the button icon to a checkmark and displaying 'Copied!' for a few seconds.

## 2026-04-25 - Tooltips for icon-only buttons
**Learning:** Found some icon-only buttons missing tooltips on hover (only having `aria-label`s for screen readers).
**Action:** Consistently ensure that all icon-only buttons have a `title` attribute so sighted users can understand the button's action without a text label.

## 2026-04-27 - Input Accessibility Attributes
**Learning:** Some custom input components and form fields in the auth flow lacked proper ARIA labels or id-htmlFor linkages, which impacts screen reader users and click-to-focus behavior.
**Action:** When creating or modifying custom input components, ensure that labels are explicitly linked to inputs using `htmlFor` and `id`, or that inputs have `aria-label`s if visual labels are omitted.

## 2026-04-30 - Crypto Loading States
**Learning:** Cryptographic operations (like deriving PBKDF2 keys) block the main thread and can take a noticeable amount of time, causing the UI to feel "frozen" to the user without visual feedback. While the sandbox hardware might be fast, real-world low-end devices will struggle.
**Action:** When implementing authentication or cryptography features, always provide an explicit `isLoading` state (e.g., using our `<Button>` component) to reassure the user that the application is processing their request.

## 2026-05-02 - Incomplete Focus Styles
**Learning:** Some elements in the codebase use `focus-visible:ring-2` but omit the actual ring color and offset, leading to an incomplete/invisible focus state.
**Action:** Always ensure that when `focus-visible:ring-2` is present, it is accompanied by the corresponding ring color (`focus-visible:ring-accent`) and offsets (`focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary`).

## 2026-05-06 - Password Visibility Toggle
**Learning:** Adding a show/hide password toggle to the SetupEncryption component was a highly effective micro-UX enhancement that prevents critical typos during master password creation without breaking the existing design system or requiring large re-writes.
**Action:** Always check if crucial, unrecoverable inputs (like master passwords or encryption keys) provide a way for the user to visually verify their entry before submission.

## 2026-05-08 - Accessibility Anti-Pattern: Redundant ARIA Labels
**Learning:** Adding an `aria-label` that exactly matches the visible text content of an element (e.g., `<button aria-label="About">About</button>`) is an accessibility anti-pattern. Redundant ARIA labels do not improve the experience and can interfere with translation tools.
**Action:** Only add `aria-label` to interactive elements lacking descriptive text, like icon-only buttons. Purely decorative elements should instead receive `aria-hidden="true"`.

## 2026-05-10 - Playwright Marketing Page & Profile Bypasses
**Learning:** When using Playwright to visually verify frontend changes on internal routes, the script must account for being initially redirected to the marketing page. It must explicitly click "Get Started" to reach the auth flow, complete the Master Password setup or unlock, and then explicitly complete or skip the 'Welcome to Vellor' profile setup form before reaching the target dashboard components.
**Action:** Always include robust conditional bypass blocks in Playwright scripts for "Get Started", Master Password setup/unlock, and the "Welcome to Vellor" profile setup.

## 2026-05-14 - ARIA Roles in Framer Motion Components Break Tests
**Learning:** Adding explicit ARIA roles (like `role="menuitem"`) to components inside Framer Motion's `<AnimatePresence>` can break existing React Testing Library tests that expect the default element roles (like `getByRole('button')`).
**Action:** When modifying semantic HTML elements or ARIA roles for accessibility, always update the corresponding React Testing Library queries in the associated `.test.tsx` files to prevent test suite regressions.

## 2026-05-14 - Empty States in Search Interfaces
**Learning:** Providing a dead-end, text-only empty state (e.g., 'No results found') in interactive components like search palettes is a missed opportunity to guide the user. Polishing these with a standard visual hierarchy (icon, clear title, descriptive subtext) improves the user experience and aligns with the app's overall design system.
**Action:** When implementing or refactoring search or filter components, always replace plain text empty states with polished, structured UI components to provide better visual feedback and guidance.

## 2026-05-19 - Missing ARIA Labels on Navigation Tab Buttons
**Learning:** Found custom chart navigation buttons in `DashboardCharts.tsx` utilizing `role="tab"` but missing `aria-controls` to link them to their respective tab panels. Tab components must be properly linked to their controlled elements for screen reader usability.
**Action:** Always verify `aria-controls` is present when implementing custom tab interfaces (`role="tab"`).

## 2026-05-20 - Chart Visual Overhaul
**Learning:** Overhauled Recharts dashboard representation using terminal/oscilloscope styling while maintaining 100% of underlying heavy compute logics and Vite testing functionality. Monospaced UI components and strict flat colors provide a raw data visual aesthetic.
**Action:** Always decouple pure visual modifications in chart wrappers (`defs`, `Tooltip`, `Area`, `XAxis`/`YAxis`) from data-processing functions (`useMemo` heavy array traversals) to guarantee computational integrity and zero regression in performance when modifying appearance.

## 2026-05-21 - Dashboard Telemetry Refactor
**Learning:** Successfully stripped out rounded corners and soft dropshadows to apply a clinical compute telemetry design, strictly following visual constraints while maintaining component logic.
**Action:** Consistently replace micro-interaction cards with flat layout containers bordered by thin neon accents on a pitch-black canvas background when performing system telemetry aesthetic updates.

## 2026-05-22 - Cybertext Cipher Effect
**Learning:** Adding a cryptographic scramble effect to headings in authentication flows provides visceral feedback that data is encrypted, but calculating random strings on every frame inside React state can cause performance stuttering and GC pauses on low-end devices.
**Action:** When creating high-frequency text animation effects like ciphers, avoid intermediate array allocation and use `requestAnimationFrame` with standard bounded `for` loops inside the animation loop to ensure buttery 60fps renders even on older mobile devices.

## 2026-05-23 - Sequential Telemetry Terminal Logs
**Learning:** Replaced standard styled card elements for progress logs with an unstyled, monospaced canvas using lightweight stagger animations to mimic a sequential telemetry log stream, ensuring non-standard ARIA roles aren't applied onto motion elements.
**Action:** When implementing terminal log aesthetics for list items, use monospaced fonts (`font-mono`) over dark transparent backgrounds with raw staggered layout fade-ins using Framer Motion, while ensuring clean string construction prior to render elements.

## 2026-05-24 - Lock Theme to Dark Mode
**Learning:** For a permanent hardware terminal aesthetic, remove Theme toggles from the store and UI rather than just hiding them to prevent state inconsistencies, and replace the unused UI real-estate with immersive indicators (like 'SYS_SECURE').
**Action:** When locking themes, update the initial state of the store, remove any `toggleTheme` actions, remove test suites checking for theme switching, and use a static indicator.

## 2026-05-25 - CRT Scanline Hardware Effect in Recharts
**Learning:** Recharts `<Area>` elements support custom SVG pattern fills like scanlines. Using an SVG `<pattern>` def with a `<rect>` height of 1px and a low opacity color creates an authentic hardware effect without altering data performance or requiring external assets. Make sure `fillOpacity={1}` on the `<Area>` when using a pattern to ensure the pattern renders correctly.
**Action:** Use inline `<pattern>` defs referenced by `fill="url(#id)"` to add visual texture to Recharts components.
## 2024-05-26 - Kinetic Digital Mesh
**Learning:** For a clinical, technical vibe on screens, animating GLSL grid fracts using native device timestamps provides completely fluid GPU motion without main thread JS blocking. Modulating alpha using a very specific minimal green code allows visual scale.
**Action:** When designing technical components, rely on precision vector fields over DOM manipulation for large ambient textures.
## 2026-05-31 - Ambient Canvas Sizing for Structural Layouts
**Learning:** Injecting fixed, absolute ambient layers (like WebGL canvases) behind structural layouts requires decoupling layer controls. Merely assigning a global z-index works, but applying a translucent backdrop layer specifically on surrounding semantic `<main>` and `<aside>` container divs using `backdrop-blur-md` allows full-screen immersive shader layouts without losing necessary interactive state hierarchy for core content flows.
**Action:** Use unified layer opacity configuration `bg-black/30 backdrop-blur-md border-white/5 z-10 relative` for root content structural groups when introducing screen-wide global composite shader logic on `z-0` beneath them.
