# Course Readiness Reference

Before you enrol, ANU's Programs & Courses page gives you learning outcomes,
an assessment breakdown, and one blunt total-workload figure — for example
"130 hours" for a 6-unit course. It doesn't tell you what the course is
actually like: whether the workload is front-loaded or exam-heavy, what you
need to already know, or how many hours a week it really takes. SELT only
surfaces a 1–5 agreement score, and its comments aren't public. StudentVIP has
almost nothing for postgraduate courses. So every semester you're picking
courses half-blind, and the only way to find out is to sit through the first
two weeks and hope.

This app is the missing piece, not a replacement for Programs & Courses: it
sits next to the official numbers and adds what only a student who's actually
taken the course can tell you — how hard it felt, how many hours a week it
really took, what background you needed going in, and what you'd want to know
in week 1. The course list and each course's page show the official figures
and the student-reported figures side by side, never blended into one number.

## What good looks like here

**The official data is real, sourced, and never invented.** The four courses
seeded into this app — COMP6260, COMP6261, COMP6240, COMP8020, the courses the
author is actually enrolled in this semester — have their title, semester,
and total workload hours read directly from each course's own 2026 Programs &
Courses page, with that exact page linked from the course's own listing. If a
field isn't stated there, it's left blank rather than guessed.

**The official workload never gets silently turned into a claim it doesn't
make.** Programs & Courses states a total for the semester, not a weekly
figure. This app converts it (total ÷ 12 teaching weeks) so it's comparable to
what students report, but every place that estimate appears says exactly how
it was computed and that it's this app's estimate, not an official number.

**Every report is real.** The `reports` table starts empty and only ever
grows from the form on a course's own page — no seeded, fabricated, or
placeholder feedback exists anywhere in this repo, including in tests (which
post an obviously-synthetic probe report rather than anything that could be
mistaken for real feedback). Submissions are nickname-only: no real name,
student ID, or email is collected, and every page that shows feedback carries
a reminder not to name individual staff.

**Invalid data can't reach the database, from any code path.** Difficulty
(1–5) and hours/week (0–60) are constrained by the Drizzle schema itself
(`check()` in `src/lib/schema.ts`), not just by the form's server-side
validation in `src/lib/validation.ts` — the two are complementary, not
either/or.

**A fresh deploy needs no manual database step.** The four courses are seeded
idempotently at server boot (`src/lib/db.ts`, right after migrations run),
keyed on each course's unique code, so the SQLite file on Fly's volume always
has them without a one-off script to remember to run.

What's a judgement call, not a checked contract: whether the workload
comparison is laid out clearly enough to actually inform a decision, and
whether the copy reads as helpful rather than preachy. That's for a reader —
and the crit — to judge.

Images go in `public/` and are linked relatively — `![alt](public/before.png)`
— which renders on GitHub and at `/readme/` alike.
