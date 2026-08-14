# Fortune Shaker Redesign Implementation Plan

**Goal:** Replace the form-first flow with an interactive 3D fortune-stick cylinder, user-triggered three-Sheng-Jiao confirmation, and a simpler result hierarchy while retaining category references.

**Architecture:** Keep the existing static ES-module structure. `index.html` owns screens and semantic content, `style.css` owns the 3D cylinder/stick/jiaobei animation, `app.js` owns screen state and bilingual rendering, `logic.js` keeps deterministic drawing and confirmation rules, and `fortunes.js` remains the 60-lot content store.

**Tech Stack:** HTML5, CSS3 animations/transforms, vanilla JavaScript ES modules, Node test runner.

## Tasks
- Remove question/category form state and replace intro with interactive cylinder.
- Animate cylinder and individual sticks; raise one selected stick during draw.
- Keep jiaobei as explicit click-per-cast, three consecutive Sheng Jiao required.
- Reorganize result content to original poem, full meaning, explanation reference, then life-area references.
- Update bilingual strings and copy-result output.
- Run Node tests and static selector/module syntax checks.
