# Fortune Mobile Shaker Label Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep 「六十甲子籤」inside the shaker's gold frame on phones and tablets without changing desktop styling.

**Architecture:** Add one responsive override to the existing `max-width: 900px` media query. Verify the computed SVG text style and its bounding box at phone, tablet, and desktop widths through the localhost browser preview.

**Tech Stack:** Static HTML, CSS media queries, inline SVG, browser computed-style and geometry checks.

## Global Constraints

- Phone and tablet widths at or below 900px use `22px` font size and `.01em` letter spacing.
- Desktop widths above 900px retain `27px` font size and `.03em` letter spacing.
- Do not change SVG coordinates, shaker dimensions, animation, draw logic, or other text.
- Verify 390px phone, 820px tablet, and 1440px desktop layouts without horizontal overflow.

---

### Task 1: Responsive shaker label

**Files:**
- Modify: `fortune/style.css:1465-1520`

**Interfaces:**
- Consumes: existing `.gold-frame-text` SVG class and `@media (max-width: 900px)` breakpoint.
- Produces: responsive computed font size and letter spacing for the shaker label.

- [ ] **Step 1: Record the failing responsive behavior**

Open `/fortune/` at 390px and 820px widths and read `getComputedStyle(document.querySelector('.gold-frame-text'))`. Confirm both currently report `font-size: 27px`, which violates the required `22px` mobile/tablet value. Record the label and gold-frame SVG bounding boxes to confirm the existing overflow condition.

- [ ] **Step 2: Add the minimal responsive override**

Inside the existing `@media (max-width: 900px)` block in `fortune/style.css`, add:

```css
.gold-frame-text {
  font-size: 22px;
  letter-spacing: .01em;
}
```

- [ ] **Step 3: Verify phone behavior**

Reload `/fortune/` at 390×844. Confirm computed font size is `22px`, computed letter spacing reflects `.01em`, the label bounding box stays inside the gold frame, and `document.body.scrollWidth <= document.documentElement.clientWidth`.

- [ ] **Step 4: Verify tablet behavior**

Reload `/fortune/` at 820×1180. Confirm the same `22px` responsive values, containment inside the gold frame, and no horizontal overflow.

- [ ] **Step 5: Verify desktop remains unchanged**

Reload `/fortune/` at 1440×900. Confirm computed font size remains `27px`, computed letter spacing remains `.03em`, the label remains inside the frame, and no horizontal overflow is introduced.

- [ ] **Step 6: Check and commit**

Run:

```powershell
git diff --check
git add -- fortune/style.css
git commit -m "fix: fit fortune shaker label on mobile"
```

Expected: diff check exits successfully and the commit contains only the responsive Fortune CSS change.
