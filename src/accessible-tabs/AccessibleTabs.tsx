/**
 * Accessible Tabs (WAI-ARIA Tabs pattern)
 *
 * Build a tabbed interface following the WAI-ARIA Tabs design pattern,
 * where focus management and keyboard interaction follow the spec exactly.
 *
 * Requirements:
 * 1. Render a tab list with 5+ tabs and corresponding tab panels.
 *    Each tab has a label and each panel has rich content (text, links, buttons).
 * 2. Clicking a tab activates it and shows its panel. Only one panel is visible.
 * 3. ARIA attributes:
 *    - Tab list: role="tablist"
 *    - Each tab: role="tab", aria-selected, aria-controls (panel id)
 *    - Each panel: role="tabpanel", aria-labelledby (tab id), tabIndex={0}
 *    - Only the active tab has tabIndex={0}, all others have tabIndex={-1}.
 * 4. Keyboard navigation (roving tabindex pattern):
 *    - When a tab is focused, Arrow Left/Right moves focus to adjacent tabs.
 *    - Home moves focus to the first tab, End to the last tab.
 *    - Focus wraps: Right on the last tab goes to the first, Left on first goes to last.
 *    - The focused tab is activated immediately on arrow key press
 *      (this is "automatic activation" mode per WAI-ARIA).
 *    - Tab key moves focus OUT of the tab list into the active panel's content.
 *      Shift+Tab from the panel returns focus to the active tab.
 * 5. Roving tabIndex: when focus moves to a new tab, update tabIndex={0} on
 *    the new tab and tabIndex={-1} on the old one, then call .focus() on the
 *    new tab element. This ensures the correct tab receives focus when the
 *    user tabs back into the tab list from elsewhere on the page.
 * 6. Dynamic tabs: include an "Add Tab" button and a close button on each tab
 *    (minimum 2 tabs, can't close below that). When a tab is closed:
 *    - If it was the active tab, activate the next tab (or previous if it was last).
 *    - Focus the newly active tab.
 *    - If it was not active, just remove it and keep current selection.
 * 7. Panel content includes focusable elements (links, buttons). Pressing Tab
 *    from the tab list should land on the first focusable element inside the panel.
 *
 * Focus concepts:
 * - Roving tabIndex pattern (tabIndex 0 vs -1)
 * - Focus management on dynamic add/remove
 * - Programmatic .focus() after state changes
 * - Tab key crossing component boundaries (tab list -> panel content)
 * - ARIA roles and the relationship between tabs and panels
 *
 * Time target: 30 minutes.
 */

import "./AccessibleTabs.css";

export const AccessibleTabs = () => {
  return <div>Accessible Tabs</div>;
};
