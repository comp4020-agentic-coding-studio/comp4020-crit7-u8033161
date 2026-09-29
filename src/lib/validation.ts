import type { NewReport } from "./db";

// Server-side validation for a submitted report: the schema's check()
// constraints are the last line of defence, but rejecting here gives a real
// error message instead of a raw SQLite constraint failure.
export const NICKNAME_MAX = 60;
export const SEMESTER_MAX = 40;
export const TEXT_MAX = 1000;

export function validateReport(
  form: FormData,
  courseId: number,
): { ok: true; report: NewReport } | { ok: false; error: string } {
  const nickname = String(form.get("nickname") ?? "").trim();
  const semesterTaken = String(form.get("semesterTaken") ?? "").trim();
  const difficultyRaw = String(form.get("difficulty") ?? "").trim();
  const hoursPerWeekRaw = String(form.get("hoursPerWeek") ?? "").trim();
  const background = String(form.get("background") ?? "").trim();
  const advice = String(form.get("advice") ?? "").trim();

  if (!nickname || nickname.length > NICKNAME_MAX) {
    return { ok: false, error: `Nickname is required (max ${NICKNAME_MAX} characters).` };
  }
  if (!semesterTaken || semesterTaken.length > SEMESTER_MAX) {
    return { ok: false, error: `Semester taken is required (max ${SEMESTER_MAX} characters).` };
  }

  const difficulty = Number(difficultyRaw);
  if (!Number.isInteger(difficulty) || difficulty < 1 || difficulty > 5) {
    return { ok: false, error: "Difficulty must be a whole number from 1 to 5." };
  }

  const hoursPerWeek = Number(hoursPerWeekRaw);
  if (!Number.isFinite(hoursPerWeek) || hoursPerWeek < 0 || hoursPerWeek > 60) {
    return { ok: false, error: "Hours per week must be a number from 0 to 60." };
  }

  if (!background || background.length > TEXT_MAX) {
    return { ok: false, error: `"What you had going in" is required (max ${TEXT_MAX} characters).` };
  }
  if (!advice || advice.length > TEXT_MAX) {
    return {
      ok: false,
      error: `"What you wish someone had told you in week 1" is required (max ${TEXT_MAX} characters).`,
    };
  }

  return {
    ok: true,
    report: { courseId, nickname, semesterTaken, difficulty, hoursPerWeek, background, advice },
  };
}
