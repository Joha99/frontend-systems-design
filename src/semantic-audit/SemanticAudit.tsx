/**
 * Semantic HTML Audit
 *
 * Tesla has asked: "Given a webpage, replace div's with appropriate
 * HTML5 tags." This problem tests your knowledge of semantic HTML.
 *
 * Requirements:
 * 1. Render a "bad" webpage built entirely with <div> elements
 *    and class names hinting at their purpose (e.g., div.header,
 *    div.nav, div.main-content, div.article, div.sidebar, div.footer).
 * 2. Below the preview, show the HTML source in an editable textarea.
 * 3. User replaces <div class="header"> with <header>, etc.
 * 4. A "Check" button scores the submission:
 *    - Correct tag replacements (header, nav, main, article, section,
 *      aside, footer, figure, figcaption, time).
 *    - Show which ones are correct / incorrect / missed.
 * 5. "Show Answer" reveals the ideal semantic markup.
 *
 * Key HTML5 semantic elements to know:
 * - <header>  — introductory content or navigational aids
 * - <nav>     — navigation links
 * - <main>    — dominant content of the body (one per page)
 * - <article> — self-contained composition (blog post, comment)
 * - <section> — thematic grouping with a heading
 * - <aside>   — tangentially related content (sidebar)
 * - <footer>  — footer for its nearest sectioning content
 * - <figure> / <figcaption> — self-contained media with caption
 * - <time>    — machine-readable date/time
 *
 * Algorithm focus:
 * - String parsing: identify <div class="X"> patterns.
 * - Mapping class names to semantic tags.
 *
 * Time target: 20 minutes.
 */

import styles from "./SemanticAudit.module.css";

export const SemanticAudit = () => {
  return <div>Semantic HTML Audit</div>;
};
