# Shared Site Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Display the same five-link related-links footer at the bottom of every production interface in the site.

**Architecture:** A single deferred JavaScript component replaces each page's existing footer after parsing, while a dedicated stylesheet owns all desktop, tablet, and mobile layout. Every production HTML entry point loads the same root-relative assets, so future footer changes happen in one place.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, GitHub Pages.

## Global Constraints

- Include exactly five links: 崇德佛堂、Facebook、崇德仁義講堂 YouTube、台中中興書城、台大藏書。
- Do not include 聯絡我們, editor name, email, phone, or 藏經閣.
- Footer must remain the last visible page region on desktop, tablet, and mobile.
- Browser-test HTML files must not load the production footer.
- Electronic-book and PDF reader pages must not load the production footer.

---

### Task 1: Shared footer component

**Files:**
- Create: `shared/site-footer.js`
- Create: `shared/site-footer.css`
- Test: `shared/site-footer.browser-test.html`

**Interfaces:**
- Produces: a deferred script that replaces the first existing `footer` or appends a new footer to `body`.
- Produces: isolated `.site-related-footer` styles with three, two, and one-column responsive layouts.

- [x] **Step 1: Write a browser test page that loads the component and asserts five links, excluded text, and footer-last placement.**
- [x] **Step 2: Open the browser test and verify it fails because the component does not exist.**
- [x] **Step 3: Implement the shared markup and responsive stylesheet.**
- [x] **Step 4: Run the browser test and verify it passes.**

### Task 2: Apply the shared component to every production page

**Files:**
- Modify: `index.html`
- Modify: `blessing/index.html`
- Modify: `fortune/index.html`
- Modify: `photos/index.html`
- Modify: `library/index.html`
- Modify: `library/renyi-daxian.html`
- Modify: `teachings/renyi-daxian.html`

**Interfaces:**
- Consumes: `/shared/site-footer.js?v=1` and `/shared/site-footer.css?v=1`.
- Produces: one consistent footer at the end of every production interface.

- [x] **Step 1: Add the shared stylesheet and deferred script to each production page.**
- [x] **Step 2: Verify every production page references both assets exactly once.**
- [x] **Step 3: Verify browser-test and electronic-book reader pages do not reference the component.**

### Task 3: Cross-page responsive verification

**Files:**
- Test: all production HTML entry points listed in Task 2.

**Interfaces:**
- Consumes: local server at `http://localhost:8080/`.
- Produces: evidence that the footer is present on all seven general interfaces, last in the body, contains five links, and remains statically positioned.

- [x] **Step 1: Run static HTML and diff checks.**
- [x] **Step 2: Visit all seven general interfaces at desktop size and assert footer/link structure.**
- [x] **Step 3: Visit the primary interfaces at 390px width and assert static bottom placement and one-column links.**
