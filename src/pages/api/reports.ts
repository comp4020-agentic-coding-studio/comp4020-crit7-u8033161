import type { APIRoute } from "astro";
import { addReport, getCourseByCode } from "../../lib/db";
import { bus } from "../../lib/events";
import { validateReport } from "../../lib/validation";

// The write half of the readiness reference: a plain HTML form POSTs here,
// a valid report goes into SQLite, and the new row is broadcast to every
// open SSE connection. Invalid input is rejected here — the schema's
// check() constraints on difficulty/hoursPerWeek are the last line of
// defence, not the first (see CLAUDE.md's data-integrity rules).
export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const courseCode = String(form.get("courseCode") ?? "").trim();
  const course = courseCode ? getCourseByCode(courseCode) : undefined;
  if (!course) {
    return new Response("Unknown course.", { status: 400 });
  }

  const result = validateReport(form, course.id);
  if (!result.ok) {
    return redirect(`/courses/${course.code}/?error=${encodeURIComponent(result.error)}`, 303);
  }

  const report = addReport(result.report);
  bus.emit("report", report);

  return redirect(`/courses/${course.code}/`, 303);
};
