import { beforeAll, describe, expect, inject, it } from "vitest";

// This app's core flow, per the crit spec ("the core flow persists across a
// reload — create something, and it's still there"): submit a readiness
// report on a course page, and it's still there after a fresh page load.
// Mirrors the starter's guestbook.test.ts pattern, against /api/reports and
// /courses/COMP6260/ instead of /api/messages and /.
const baseUrl = inject("baseUrl");
const COURSE_CODE = "COMP6260";
const coursePath = `/courses/${COURSE_CODE}/`;

describe("reports", () => {
  let nickname: string;

  beforeAll(() => {
    // an obviously-synthetic probe nickname — never mistakable for a real
    // submission, per CLAUDE.md's data-integrity rules
    nickname = `spec-probe-${process.hrtime.bigint()}`;
  });

  // Astro checks form POSTs carry a same-origin Origin header (CSRF
  // protection); browsers send it automatically, a bare fetch doesn't.
  const post = (body: URLSearchParams) =>
    fetch(new URL("/api/reports", baseUrl), {
      method: "POST",
      headers: { origin: baseUrl },
      body,
      redirect: "manual",
    });

  const validReport = (overrides: Record<string, string> = {}) =>
    new URLSearchParams({
      courseCode: COURSE_CODE,
      nickname,
      semesterTaken: "Semester 2 2025",
      difficulty: "4",
      hoursPerWeek: "12.5",
      background: "two prior maths courses",
      advice: "start the first assignment early",
      ...overrides,
    });

  it("accepts a valid report and redirects back to the course page", async () => {
    const res = await post(validReport());
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toBe(`/courses/${COURSE_CODE}/`);
  });

  it("persists the report: a fresh page load includes it", async () => {
    const res = await fetch(new URL(coursePath, baseUrl));
    const body = await res.text();
    expect(body).toContain(nickname);
    expect(body).toContain("start the first assignment early");
  });

  it.for([
    ["difficulty", "0"],
    ["difficulty", "3.5"],
    ["hoursPerWeek", "61"],
    ["nickname", ""],
  ] as const)("rejects an invalid %s value (%s)", async ([field, value]) => {
    // the marker lives in `advice`, a field never under test here, so it
    // uniquely identifies this attempt regardless of which field is invalid
    const marker = `spec-invalid-${process.hrtime.bigint()}`;
    const res = await post(validReport({ [field]: value, advice: marker }));
    expect(res.status).toBe(303);
    expect(res.headers.get("location")).toContain("error=");

    const page = await fetch(new URL(coursePath, baseUrl));
    expect(await page.text()).not.toContain(marker);
  });

  it("rejects an unknown course", async () => {
    const res = await post(validReport({ courseCode: "COMP9999" }));
    expect(res.status).toBe(400);
  });
});
