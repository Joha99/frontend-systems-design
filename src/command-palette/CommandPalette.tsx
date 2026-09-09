/**
 * Command Palette (VS Code / Cmd+K style)
 *
 * Build a command palette overlay that opens with a keyboard shortcut,
 * searches through a list of commands, and executes the selected one.
 *
 * Requirements:
 * 1. Pressing Cmd+K (Mac) or Ctrl+K (Windows) opens the palette overlay.
 *    Pressing Escape or clicking outside closes it.
 *    The listener must be on `document` -- think about when to add/remove it
 *    and whether you need capturing vs bubbling phase.
 * 2. The palette is a modal-like overlay with a search input that auto-focuses on open.
 *    Render it in a portal. When it closes, return focus to the element that was
 *    focused before it opened (save `document.activeElement` on open).
 * 3. Provide a list of 50+ commands (generate them or hardcode). Each command has
 *    a name, category, and shortcut string (e.g. "Save File", "Editor", "Cmd+S").
 * 4. As the user types, filter commands by prefix match on the name (case-insensitive).
 *    Show "X results" count.
 * 5. Keyboard navigation:
 *    - Arrow Up/Down moves a highlighted index through the filtered results.
 *    - The highlighted item must always be visible: if it moves out of the
 *      visible scroll area, scroll it into view. Use a ref callback or
 *      `scrollIntoView()` on the highlighted element after render.
 *    - Enter executes the highlighted command (log it to console) and closes.
 *    - Tab cycles through result categories (filter to next category).
 * 6. Focus trapping: while the palette is open, Tab and Shift+Tab must NOT
 *    leave the palette. All focus stays within the search input and result list.
 * 7. The search input keeps focus while Arrow Up/Down navigates the list.
 *    This means the input handles ALL keyboard events (arrows, enter, escape)
 *    and the list items are NOT focusable -- they're highlighted via state only,
 *    not via DOM focus. This is a different pattern from the searchable dropdown.
 *
 * Focus concepts:
 * - document-level keydown listener (Cmd+K) with capturing vs bubbling
 * - Saving and restoring focus (document.activeElement)
 * - Focus trapping (preventDefault on Tab)
 * - "Roving highlight" without moving DOM focus (input keeps focus,
 *   highlighted index is purely visual via state + scrollIntoView)
 * - Portal rendering to escape parent overflow/z-index
 *
 * Time target: 30 minutes.
 */

import "./CommandPalette.css";

export const CommandPalette = () => {
  return <div>Command Palette</div>;
};
