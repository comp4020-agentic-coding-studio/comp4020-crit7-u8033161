import { sql } from "drizzle-orm";
import { check, int, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

// The schema is the ground truth for the database. To change it: edit here,
// run `pnpm db:generate` to turn the diff into a migration under drizzle/,
// and commit both — the migration applies automatically when the server
// boots (see src/lib/db.ts). Never edit the database by hand: state on the
// deployed volume outlives every deploy, and the migration trail is what
// keeps old state and new code compatible.

// One row per course this app tracks. Seeded (idempotently, at boot — see
// src/lib/db.ts) from real ANU Programs & Courses pages; sourceUrl is the
// page an agent actually read the other fields from. officialWorkloadHours
// is nullable because a course could state no total — CLAUDE.md is clear
// that's a "leave it null" case, not a "guess" case.
export const courses = sqliteTable("courses", {
  id: int().primaryKey({ autoIncrement: true }),
  code: text().notNull().unique(),
  title: text().notNull(),
  semester: text().notNull(),
  officialWorkloadHours: int("official_workload_hours"),
  sourceUrl: text("source_url").notNull(),
});

export type Course = typeof courses.$inferSelect;

// One row per student-submitted readiness report. Real submissions only —
// see CLAUDE.md's data-integrity rules. difficulty and hoursPerWeek are
// constrained at the schema level so an invalid row can never reach SQLite
// regardless of which code path writes it.
export const reports = sqliteTable(
  "reports",
  {
    id: int().primaryKey({ autoIncrement: true }),
    courseId: int("course_id")
      .notNull()
      .references(() => courses.id),
    nickname: text().notNull(),
    semesterTaken: text("semester_taken").notNull(),
    difficulty: int().notNull(),
    hoursPerWeek: real("hours_per_week").notNull(),
    background: text().notNull(),
    advice: text().notNull(),
    createdAt: text("created_at")
      .notNull()
      .default(sql`(datetime('now'))`),
  },
  (table) => [
    check("difficulty_range", sql`${table.difficulty} between 1 and 5`),
    check("hours_per_week_range", sql`${table.hoursPerWeek} between 0 and 60`),
  ],
);

export type Report = typeof reports.$inferSelect;
