/**
 * Accessible Modal System
 *
 * Build a reusable modal component with proper accessibility and a compound component API.
 *
 * Requirements:
 * 1. Create a compound component API: <Modal>, <Modal.Trigger>, <Modal.Content>, <Modal.Close>.
 * 2. Modal.Trigger opens the modal. Modal.Close and pressing Escape close it.
 * 3. Render Modal.Content in a React portal (appended to document.body).
 * 4. Trap focus inside the modal while open -- Tab cycles through focusable elements,
 *    not the page behind. Shift+Tab cycles backwards.
 * 5. Lock body scroll while the modal is open.
 * 6. Show a backdrop overlay. Clicking the backdrop closes the modal.
 * 7. On close, return focus to the element that triggered the modal.
 * 8. The modal content is a paginated list of items (fetched from
 *    https://dummyjson.com/products?limit=10&skip=0). Show 5 items per page inside the
 *    modal with Prev/Next controls. Display "Showing X-Y of Z" with correct math.
 *    Fetch the next batch when navigating past your current data (offset pagination).
 *
 * Accessibility:
 * - Modal container has role="dialog" and aria-modal="true".
 * - Modal has an aria-labelledby pointing to a heading inside it.
 * - Focus moves to the first focusable element inside the modal on open.
 *
 * Math focus:
 * - Focus trapping: find all focusable elements, mod arithmetic to wrap Tab at boundaries
 * - Pagination offset: skip = (page - 1) * pageSize, "Showing {skip+1}-{skip+items} of {total}"
 * - Deciding when to fetch: do you have data for the requested page already?
 *
 * Time target: 25 minutes.
 */

import "./Modal.css";

export const Modal = () => {
  return <div>Modal</div>;
};
