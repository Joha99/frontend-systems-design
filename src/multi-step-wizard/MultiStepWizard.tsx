/**
 * Multi-Step Form Wizard
 *
 * Build a multi-step form that collects user information across multiple pages.
 * API: POST https://dummyjson.com/users/add
 * Request body: { firstName, lastName, email, age, address: { city, state }, company: { name, title } }
 *
 * Steps:
 * 1. Personal Info — First Name, Last Name, Age
 * 2. Contact — Email
 * 3. Address — City, State (only shown if age >= 18)
 * 4. Work — Company Name, Job Title
 * 5. Review — display all entered data, confirm and submit
 *
 * Requirements:
 * 1. Show one step at a time with Next / Back buttons.
 * 2. Validate each step before allowing Next — highlight invalid fields.
 * 3. Show a progress indicator (e.g. "Step 2 of 5" or a progress bar).
 * 4. Preserve form data when navigating back and forward.
 * 5. Step 3 (Address) is conditionally shown only if age >= 18 — skip it otherwise.
 * 6. On the Review step, show all entered data. On submit, POST to the API.
 * 7. Show loading, success, and error states on submission.
 *
 * Stretch:
 * - Animate step transitions.
 * - Save draft to localStorage so data survives a page refresh.
 * - Allow clicking the progress indicator to jump to a completed step.
 */

import styles from "./MultiStepWizard.module.css";

export const MultiStepWizard = () => {
  return (
    <div>
      <p>6. Build a multi-step form wizard with conditional steps.</p>
    </div>
  );
};
