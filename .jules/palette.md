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

## 2026-05-27 - Ambient Canvas Sizing for Structural Layouts
**Learning:** Injecting fixed, absolute ambient layers (like WebGL canvases) behind structural layouts requires decoupling layer controls. Merely assigning a global z-index works, but applying a translucent backdrop layer specifically on surrounding semantic `<main>` and `<aside>` container divs using `backdrop-blur-md` allows full-screen immersive shader layouts without losing necessary interactive state hierarchy for core content flows.
**Action:** Use unified layer opacity configuration `bg-black/30 backdrop-blur-md border-white/5 z-10 relative` for root content structural groups when introducing screen-wide global composite shader logic on `z-0` beneath them.

## 2026-05-28 - CSS Variables in Physics Interception Loops
**Learning:** Using React hooks to modify styles via DOM variables (`--slider-pos` and `clip-path: inset(...)`) allows smooth component transitions without triggering heavy paint or layout reflows common to standard DOM `left` mutators.
**Action:** When working with spring loops and complex elements, utilize `translate3d` and GPU-composited variables bound directly through React inline variables (`style={{ '--var': pos }}`).

## 2026-05-29 - Framer Motion State Visibility
**Learning:** Hidden structures undergoing spring closure must explicitly toggle their visibility and aria-hidden attributes to true only after the spring reaches absolute rest.
**Action:** Always ensure components running layout transitions use Framer Motion's layoutId properly without changing basic HTML rendering blocks, and apply explicit visibility toggles after the rest delta is hit.

## 2026-05-28 - Tabular Numerical Bounds & Typography Isolation
**Learning:** Using `tabular-nums` directly on text nodes that display dynamically changing numerical values prevents the layout string dimension shifts. Managing customized monospace fonts (`font-mono`) with containment attributes like `display=block` protects the rendering engine from undergoing a layout snap when styles load.
**Action:** Always inject `tabular-nums` class on elements rendering real-time or variable financial data in transaction rows and statistical readout cards to ensure layout continuity. Additionally, apply `display=block` on customized web font imports to stabilize pre-loaded numeric matrices.

## 2026-05-29 - Missing ARIA Relationships in Form Tabs
**Learning:** Found navigation tab buttons in `CSVImportWizard.tsx` acting visually as tabs but lacking `role="tab"`, `role="tablist"`, `aria-selected`, `aria-controls`, and `role="tabpanel"`. These structural ARIA attributes are required for custom tab interfaces to convey their relationship and state to screen readers.
**Action:** When implementing custom tab interfaces (`role="tab"`), always verify that `role="tablist"` is applied to the container, and `aria-controls` on the tab buttons matches the `id` of the corresponding `role="tabpanel"`.

## 2026-05-29 - Pre-Allocated Layout Footprints
**Learning:** Switching tabs containing asynchronous streams or list items without strict bounding parameters causes layout jumping. Applying strict boundaries (like `min-h-[400px]`) prevents the layout above or below from snapping upward or shifting out of place during content hydration loops.
**Action:** When implementing tabs or containers that load dynamically or transition empty states, always use pre-allocated boundary styles on the container rather than allowing variable content heights to thrash the layout structure.

## 2026-05-30 - Custom Physics Sliders & Hardware Acceleration
**Learning:** When building highly interactive custom controls like spring-physics sliders that update constantly on pointer drag, relying on React's `useState` for visual position tracking forces complete re-renders at up to 60fps, severely degrading performance and making the interaction feel sluggish. Furthermore, naive pointer event tracking (`onPointerMove`, `onPointerUp`) often breaks if the user's cursor leaves the exact boundary of the track while dragging.
**Action:** Always bypass React state for high-frequency position updates. Use `useRef` to store the target DOM element and apply changes via direct DOM mutation (e.g., `elementRef.current.style.transform = 'translate3d(X, Y, Z)'`) to guarantee GPU hardware acceleration. Additionally, bind `setPointerCapture` on `onPointerDown` (and release it on `onPointerUp`) to ensure drag events continue firing smoothly even if the user's mouse drifts outside the element's bounding box.

## 2026-05-30 - Playwright Frontend Verification for Secured Routes
**Learning:** Writing Playwright scripts to visually verify frontend changes on secured routes can be incredibly brittle if they rely on UI clicks to navigate complex onboarding flows, password setups, and dashboard navigations just to reach a deep view. These scripts often time out due to unexpected animations, missing locators, or changed DOM structures in the auth layer.
**Action:** When writing Playwright scripts to visually verify frontend changes on internal routes, avoid relying on brittle UI clicks to bypass the onboarding flow. Instead, directly inject the required state by evaluating JavaScript on the page: `page.evaluate("localStorage.setItem('vellor-store', JSON.stringify({ state: { settings: { hasCompletedOnboarding: true, userName: 'Test User', theme: 'light', currencySymbol: '$' } } }))")`. Then, use direct URL navigation (e.g., `page.goto("http://localhost:5173/#/students")` if using hash routing) to immediately land on the relevant view, drastically reducing test execution time and flakiness.

## 2026-06-01 - Accessible Tab Navigation
**Learning:** When adding ARIA attributes or custom HTML props to Framer Motion components (e.g., `motion.div`) in the Vellor project, be aware that existing `framer-motion` mocks in Vitest (like in `StudentDetailView.test.tsx`) may drop these attributes by only forwarding `className`, `onClick`, and `children`. You must update the mock to spread `...props` if your tests rely on querying these elements by their ARIA roles.
**Action:** When working on accessibility for animated elements, check the component's test file to ensure the `framer-motion` mock properly spreads rest parameters (`...props`) so that ARIA roles and labels are passed to the DOM in test environments.

## 2026-06-01 - 100% Branch Coverage for crypto.ts
**Learning:** In order to achieve 100% branch coverage for `crypto.ts`, all logical execution paths inside `try/catch` block or conditionally checked parameters such as `schema ? schema.parse(...) : ...` must be explicitly verified.
**Action:** When working on missing test coverage, use the coverage output tool (like Vitest's coverage-final.json) to precisely identify missing branch evaluations, and supply inputs to test files that hit edge cases.

## 2026-06-06 - Modal Close Button Accessibility
**Learning:** In the Vellor app, raw HTML `<button>` elements often lack built-in focus visibility for keyboard navigation compared to the custom `<Button>` component. When working with raw `<button>` elements, always explicitly include focus-visibility utility classes (e.g., `focus:outline-none focus-visible:ring-2 focus-visible:ring-accent`) to maintain accessibility.
**Action:** When creating or modifying close buttons or icon buttons, ensure they have explicit `focus-visible` styling or use the custom `Button` component which provides these out-of-the-box.

## 2026-06-10 - Button Loading State Accessibility
**Learning:** When implementing loading states on custom button components (e.g., `<Button isLoading>`), failing to explicitly mark the element as busy can leave screen reader users unaware that an async operation has started. Furthermore, purely visual loading indicators (like a spinning SVG) may confuse assistive technologies if not explicitly hidden.
**Action:** When implementing loading states on custom button components, always ensure accessibility by applying `aria-busy={isLoading}` to the root `<button>` element, and apply `aria-hidden="true"` to any purely visual loading spinner SVGs to prevent screen readers from parsing them.

## 2026-06-14 - ARIA Expanded for Accordions
**Learning:** Found an accordion-like collapsible section ("Read the full story" / "Show less" toggle) that visually expanded/collapsed content but lacked the necessary ARIA attributes. Screen readers rely on `aria-expanded` and `aria-controls` to understand that a button controls the visibility of another section and to announce its current state.
**Action:** When implementing accordion-like UI elements or "Read more/less" toggles, always ensure the toggle button includes `aria-expanded` reflecting the current state, and `aria-controls` pointing to the ID of the collapsible content container.

## 2026-06-15 - ARIA Roles for Custom Switches
**Learning:** In React applications, custom toggles or switches implemented using an `<input type="checkbox">` and visually styled with CSS (e.g. Tailwind) must have `role="switch"` and `aria-checked` attributes to properly convey their functionality to screen reader users as a toggle rather than a simple checkbox.
**Action:** Always include `role="switch"` and `aria-checked={isChecked}` on checkbox inputs that function visually and logically as a toggle switch.

## 2026-06-18 - Custom Switch Checkbox Role Accessibility
**Learning:** React standard `<input type="checkbox">` toggles disguised as switches need explicitly defined `role="switch"` and `aria-checked` bindings for screen reader support, as native styling obscures their default checkbox function.
**Action:** When implementing toggles via checkboxes in Gamification or Settings UI, explicitly bind `role="switch"` and assign `aria-checked` to the backing state value instead of simply binding `checked`.

## 2026-06-19 - Add focus rings to modal close buttons
**Learning:** Native `<button>` elements in Vellor's marketing pages lacked focus-visible states, making keyboard navigation of modals difficult for screen reader or keyboard-only users. Custom button abstractions usually handle this, but ad-hoc HTML buttons need explicit utility classes.
**Action:** When adding or modifying raw `<button>` elements that act as generic UI toggles or close buttons, explicitly append `focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 dark:focus-visible:ring-offset-primary` to ensure keyboard accessibility matches the design system.
