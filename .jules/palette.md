## 2024-03-20 - Adding Confirmation to Destructive Actions
**Learning:** Instantly executing destructive actions like "Clear All Activity" can lead to accidental data loss. Providing a confirmation modal before proceeding creates a safer and more confident user experience.
**Action:** Whenever implementing a button that deletes multiple items or clears history, introduce a confirmation modal using the `ConfirmationModal` component to explicitly ask the user for confirmation.
## 2024-06-25 - Contextual Accessibility in Complex Dashboards
**Learning:** Reusable input components (`Input.tsx`) might correctly label standard inputs, but customized or inline inputs (like the inline Monthly Target edit field on the Dashboard) and icon/text tabs (like the Chart view options) often slip through generic a11y checks because they omit `id`/`htmlFor` associations or lack `aria-label`s for screen readers when contextual clues aren't programmatically linked.
**Action:** When auditing custom or inline dashboard controls for accessibility, proactively search for unlabelled `<input>` elements, `<button role="tab">` elements without `aria-label`s, and ensure that custom form implementations fully associate `<label>` with `<input>` using matching `htmlFor` and `id` tags.

## 2024-04-06 - Fixing Keyboard Traps in Hover-Only UI Elements
**Learning:** In this application, elements using `opacity-0 group-hover:opacity-100` (like the 'Delete Activity' button on the dashboard) become effectively invisible traps for keyboard users because they do not become visible on focus.
**Action:** When adding keyboard focus indicators (`focus-visible:ring-*`), always ensure hover-only UI elements also include `focus-visible:opacity-100` so screen reader or keyboard navigators can actually see the focused action.
## 2024-10-24 - Accessible Checkboxes and Hover-Only UI Traps
**Learning:** Reusing `div`s with `onClick` handlers for checkboxes (like the bulk selection in Student Lists) breaks accessibility because they are not keyboard-focusable and lack semantic meaning. Further, applying hover-only visibility classes (e.g. `opacity-0 group-hover:opacity-100`) creates a trap where keyboard users can tab to the item but cannot visually see their focus state.
**Action:** Always replace non-semantic clickable `div`s with actual `<button type="button">` elements. When using `group-hover:opacity-100` to hide UI elements until hovered, *always* pair it with `focus-visible:opacity-100` and `focus-visible:ring-*` classes so keyboard users can see what they are about to interact with.
## 2024-10-25 - Fixing Accessibility for Hidden Inputs inside Custom Toggles
**Learning:** When fixing accessibility for custom UI toggles or checkboxes that hide the actual `<input className="sr-only">` inside a wrapper, do not change the wrapper `<label>` to a `<div>` or `<h*>`. The wrapper must remain a `<label>` to proxy clicks to the hidden input.
**Action:** Enhance accessibility in these scenarios by applying an `id` to the heading text and an `aria-labelledby` attribute pointing to that heading on the hidden input, keeping the label wrapper intact.
