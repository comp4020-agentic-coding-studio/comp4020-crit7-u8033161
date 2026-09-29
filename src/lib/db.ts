import { mkdirSync } from "node:fs";
import { dirname } from "node:path";
import Database from "better-sqlite3";
import { avg, count, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { type Course, type Report, courses, reports } from "./schema";

// One SQLite file is the app's whole persistent state. In production
// fly.toml points DATABASE_PATH at the machine's volume (/data), which is
// how state survives a reload and a redeploy; locally it defaults to an
// untracked file in .data/.
const path = process.env.DATABASE_PATH ?? "./.data/app.db";
mkdirSync(dirname(path), { recursive: true });

const client = new Database(path);
client.pragma("journal_mode = WAL");

export const db = drizzle(client);

// Migrations run at boot, on whatever machine holds the volume — the
// recommended shape for SQLite on Fly, where there's no separate machine to
// run them from. The flow: edit src/lib/schema.ts, `pnpm db:generate`,
// commit the migration it writes to drizzle/.
migrate(db, { migrationsFolder: "./drizzle" });

// The four courses this app tracks (see CLAUDE.md for why the set is fixed
// and where each field came from). Seeding runs at boot, right after
// migrations, so a fresh Fly volume gets these rows with no manual step —
// keyed on the unique `code`, so a rerun (or a redeploy) never duplicates or
// overwrites a row real reports may already reference.
const SEED_COURSES: Array<Omit<Course, "id">> = [
  {
    code: "COMP6260",
    title: "Foundations of Computing",
    semester: "Semester 2 2026",
    officialWorkloadHours: 130,
    sourceUrl: "https://programsandcourses.anu.edu.au/2026/course/comp6260",
  },
  {
    code: "COMP6261",
    title: "Information Theory",
    semester: "Semester 2 2026",
    officialWorkloadHours: 130,
    sourceUrl: "https://programsandcourses.anu.edu.au/2026/course/comp6261",
  },
  {
    code: "COMP6240",
    title: "Relational Databases",
    semester: "Semester 2 2026",
    officialWorkloadHours: 130,
    sourceUrl: "https://programsandcourses.anu.edu.au/2026/course/comp6240",
  },
  {
    code: "COMP8020",
    title: "Advanced Topics in Human-Centred and Creative Computing",
    semester: "Semester 2 2026",
    officialWorkloadHours: 130,
    sourceUrl: "https://programsandcourses.anu.edu.au/2026/course/comp8020",
  },
];

for (const course of SEED_COURSES) {
  db.insert(courses).values(course).onConflictDoNothing({ target: courses.code }).run();
}

export type { Course, Report };

// Programs & Courses only ever states a workload total for the semester;
// this is this app's own estimate, never official data (see CLAUDE.md) —
// callers must label it as such wherever it's shown.
export const TEACHING_WEEKS = 12;

export function listCourses(): Course[] {
  return db.select().from(courses).orderBy(courses.code).all();
}

export function getCourseByCode(code: string): Course | undefined {
  return db.select().from(courses).where(eq(courses.code, code)).get();
}

export interface CourseStats {
  reportCount: number;
  avgDifficulty: number | null;
  avgHoursPerWeek: number | null;
}

export function courseStats(courseId: number): CourseStats {
  const row = db
    .select({
      reportCount: count(reports.id),
      avgDifficulty: avg(reports.difficulty),
      avgHoursPerWeek: avg(reports.hoursPerWeek),
    })
    .from(reports)
    .where(eq(reports.courseId, courseId))
    .get();

  return {
    reportCount: row?.reportCount ?? 0,
    avgDifficulty: row?.avgDifficulty ? Number(row.avgDifficulty) : null,
    avgHoursPerWeek: row?.avgHoursPerWeek ? Number(row.avgHoursPerWeek) : null,
  };
}

export function listReportsForCourse(courseId: number): Report[] {
  return db
    .select()
    .from(reports)
    .where(eq(reports.courseId, courseId))
    .orderBy(reports.id)
    .all();
}

export interface NewReport {
  courseId: number;
  nickname: string;
  semesterTaken: string;
  difficulty: number;
  hoursPerWeek: number;
  background: string;
  advice: string;
}

export function addReport(input: NewReport): Report {
  return db.insert(reports).values(input).returning().get();
}
