# Sticker Quest: Product Requirements Document

**Version:** 0.1 (draft)
**Date:** 2026-10-28
**Owner:** Feroz (parent)
**Status:** Prototype built; ready for review before commercial or public release

---

## 1. Summary

Sticker Quest is a short, playful practice app for 3rd-grade children. It covers three skills from a Grade 3 worksheet set:

1. **Fact families:** multiplication and division facts that share three numbers.
2. **Equal groups:** division word problems solved by drawing equal groups.
3. **Reading:** narrative nonfiction comprehension and a one-minute read-aloud fluency check.

Each correct answer earns a sticker, which the child collects in a sticker book. The app is meant to build confidence through specific, positive feedback rather than through points or timers that create pressure.

## 2. Goals

- Help a 3rd grader practice the skills above with immediate, kind feedback.
- Keep the experience calm and encouraging. Wrong answers lead to a hint, never a penalty.
- Give parents a simple, trustworthy tool that collects no personal information about children.

## 3. Non-goals (v1)

- No user accounts, logins, or cloud sync.
- No ads, in-app purchases, or third-party analytics.
- No chat, social features, or sharing between children.
- No adaptive difficulty engine. Content is fixed in v1.
- No grading or reporting for teachers (possible in a later version).

## 4. Target users

- **Primary:** a 3rd-grade child (age 8 to 9), reading independently or with a parent nearby.
- **Secondary:** a parent who sets up the app, supervises practice, and reads the progress summary.

## 5. Scope and features

### 5.1 Home and navigation
- Three activity tabs: Fact Families, Equal Groups, Reading.
- Sticker book always visible at the bottom of the page.
- Large touch targets (at least 48px) for small hands.

### 5.2 Fact Families
- Three number families at launch: (7, 6, 42), (8, 9, 72), (9, 10, 90).
- Child fills in four equations: a × b = p, b × a = p, p ÷ a = b, p ÷ b = a.
- "Check my answers" marks each box green or red.
- Completing a family earns a sticker. "Next family" cycles through the list.

### 5.3 Equal Groups
- Word problems with a total and a context (clips into bags, stickers onto cards, desks into rows).
- Child types the number of equal groups. The app draws the groups and states the division.
- Non-even splits are rejected with a hint to try a number that divides evenly.
- Each new valid group count earns a sticker. Finding three different ways unlocks "Next problem."

### 5.4 Reading
- A short narrative nonfiction passage with three multiple-choice questions.
- Correct answers are marked green. Wrong answers show the right answer in green.
- One-minute read-aloud timer. The parent or child enters words read and mistakes, and the app computes words correct.

### 5.5 Sticker book and rewards
- Stickers are earned for completed tasks, not for speed.
- Sticker book shows earned stickers and empty slots.
- Stickers are emoji for v1. Custom sticker art is a v2 option.

### 5.6 Parent view (v2, proposed)
- A simple summary: activities completed, sticker count, and skills needing more practice.
- Stored only on the device, behind a parent PIN or gate.

## 6. Functional requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | Fact family checks compare typed numbers to the correct answers. | Must |
| FR-2 | Equal groups rejects totals that do not divide evenly and explains why. | Must |
| FR-3 | Reading answers can be checked in any order and show the correct answer after a wrong pick. | Must |
| FR-4 | Stickers are awarded once per completed item, not repeatedly. | Must |
| FR-5 | Sticker book and completed items persist across page reloads on the same device. | Must (not yet built) |
| FR-6 | Works offline after first load. | Should |
| FR-7 | Works on phones (about 400px width) and tablets without horizontal scrolling. | Must |
| FR-8 | Respects reduced-motion settings. | Should |
| FR-9 | Parent can reset all progress with one confirmed action. | Must (not yet built) |
| FR-10 | Content is readable at grade-3 level, with text that can be read aloud by a parent. | Must |

Note on FR-5: the current prototype keeps the sticker book in memory only. Progress is lost on reload. This must be fixed before release.

## 7. Content

- Math items are generated from fixed, hand-checked facts. Every answer key must be verified by a second person before release.
- Reading passage: the current prototype uses a short passage written for this app, based on facts from the source worksheet (born 1942, grew up in New York mountains, grandfather taught fishing, grandparents' store, storybooks). The questions are original.
- **Licensing:** the source worksheet is copyrighted material (McGraw Hill). Before any commercial release, replace the passage with original text or licensed content, and do not reproduce the worksheet directly.
- Content must be reviewed for age-appropriateness and accuracy.

## 8. Privacy, safety, and compliance

This app is for children, so privacy is a core requirement, not an afterthought.

- **No personal data collection.** The app asks for no name, age, email, or location.
- **No third-party trackers or analytics** in v1.
- **Fonts:** the prototype loads Google Fonts from Google's servers. For a release, self-host the font files so no request goes to a third party, which keeps the app consistent with the no-tracking promise.
- **Emoji stickers** are standard system characters, but check how they render on older Android devices.
- **Storage:** progress is stored only in the browser's local storage on the device. Nothing is sent to a server.
- **Legal review:** if this is distributed commercially, review against COPPA (US), GDPR-K (EU/UK), and any applicable state children's privacy law, plus App Store and Google Play "Families" policies.
- **No external links** that let a child leave the app without a parent gate.
- **No user-generated content** and no chat.

## 9. Accessibility

- Color is never the only signal. Correct and wrong states also use icons or text.
- Full keyboard support and visible focus outlines.
- Text meets WCAG AA contrast on the cream background.
- Read-aloud and text-to-speech for the passage and questions is a recommended v2 feature.

## 10. Technical approach

- Prototype: a single self-contained HTML file (`index.html`) with inline CSS and JavaScript. No build step.
- Production option: move to a small React or plain-JS PWA, with content in a separate JSON file so new worksheets can be added without code changes.
- Data: localStorage for progress (v1). Schema: `{ stickers: [], completed: { facts: [], groups: [], reading: false } }`.
- Hosting: any static host. No backend in v1.

## 11. Success metrics

- A child completes at least one activity per session.
- Parent reports the child can explain how a fact family links multiplication and division (validated by a short parent survey).
- Zero personal data stored or transmitted (verified by a network check before each release).

## 12. Open questions

1. Should the app be free, paid once, or subscription?
2. Which grade levels and worksheets come next?
3. Is text-to-speech needed for children who read below grade level?
4. Should the parent view be in v1?
5. Which languages? (The family context may call for Tamil and English.)

## 13. Milestones

| Phase | Deliverable |
|-------|-------------|
| M0 | Working prototype (done) |
| M1 | Persistence, parent reset, self-hosted fonts, content fixes |
| M2 | Accessibility pass, device testing on phones and tablets |
| M3 | Privacy review and store policy check |
| M4 | Pilot with the child and one or two families, then release |

## 14. Known issues in the prototype

- Sticker book and progress reset on reload (FR-5).
- Read-aloud timer has no automatic word count.
- Reading passage and questions have not been reviewed by a teacher.
- Google Fonts request goes to a third party (see section 8).
