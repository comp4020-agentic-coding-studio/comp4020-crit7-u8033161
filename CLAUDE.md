# Your harness

This app is a course-readiness reference for ANU course selection: official
Programs & Courses info side by side with real student-submitted feedback on
difficulty and actual weekly workload. `README.md` says what it's for and why;
this file is the rules an agent working in this repo must hold to.

## Data integrity — non-negotiable

1. **Never fabricate student feedback.** The `reports` table starts empty and
   stays that way until a real person submits through the form. Never write
   seed rows, fixtures, or "example" reports into migrations, seed scripts, or
   test setup that could be mistaken for real submissions. Spec tests may post
   a probe report to prove persistence works, but probes must be obviously
   synthetic (e.g. a random token as the nickname) and are fine to leave in the
   dev/test database — never in a way that could pass as genuine feedback in
   the UI's own listing during normal use.
2. **Official course data must come from a real Programs & Courses page an
   agent actually opened.** Every `courses` row's `sourceUrl` must resolve to
   the specific ANU Programs & Courses course page it was read from. If a
   field isn't stated on that page, leave it `null` — never guess or infer a
   plausible-sounding number.
3. **The initial course set is fixed**: COMP6260 (Foundations of Computing),
   COMP6261 (Information Theory), COMP6240 (Relational Databases), COMP8020
   (Agentic Coding Studio) — the courses the site owner is actually enrolled in
   this semester. Don't add other courses speculatively; if the set needs to
   change, that's the owner's call, not an agent's.
4. **Workload-hours-per-week is a computed estimate, never official data.**
   Programs & Courses only ever states a total workload in hours for the
   semester. Any per-week figure derived from it must be visibly labelled as
   an estimate, with the conversion basis stated on the page (this app divides
   by 12 teaching weeks) — never presented with the same visual weight as the
   official total.

## Privacy

5. **No real identity.** The site collects a nickname only — no real name,
   student ID, or email, anywhere, including in future fields. Every page that
   shows or collects feedback carries a visible reminder not to name or
   identify individual staff.

## Engineering

6. **The Drizzle schema in `src/lib/schema.ts` is the only ground truth for
   the database.** To change shape: edit the schema, run `pnpm db:generate`,
   commit the generated migration under `drizzle/`. Never hand-edit the SQLite
   file, and never hand-edit a generated migration to change shape — if
   Drizzle's schema builder can express a constraint (e.g. `check()`), express
   it there so the migration stays generated, not hand-authored. Only fall
   back to hand-editing a migration when the schema builder genuinely can't
   express the constraint, and say why in the commit message.
7. **Seed data for the four courses must be idempotent and run wherever
   migrations run** — at server boot, alongside `migrate()` in `src/lib/db.ts`
   — so the deployed app on Fly.io has the four courses without any one-off
   manual step. Keyed on `courses.code` (unique): insert if missing, never
   duplicate, never overwrite a row a real submission might reference.
8. **Don't touch `DATABASE_PATH`, `fly.toml`, or the volume mount.** All
   persistent state — courses and reports alike — lives in the one SQLite file
   on the existing Fly volume; that's what survives a reload and a redeploy.
9. **Keep `spec/invariants.test.ts` and `spec/readme.test.ts` green.** Add any
   new route to `spec/routes.ts` the moment it exists, or the invariants
   silently stop covering it. `spec/guestbook.test.ts` and
   `src/pages/api/messages.ts` describe the starter's guestbook, not this app
   — remove both once the reports flow replaces them, in the same commit.
10. **Small, working commits.** Commit each time a slice runs end to end, with
    a message that says what changed and why — the process record this course
    grades is the commit log plus `PROCESS.md` plus `reflections/crit-7.md`,
    not a document written after the fact.
