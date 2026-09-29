# Process overview

## What I built

A course readiness reference for ANU computing courses. Each course page
puts the official Programs & Courses workload next to reports from
students who have taken it: difficulty, real hours per week, the
background they had, and what they wish they'd known in week 1.

## How I got here

I changed topic twice. A Canvas deadline board fell apart when I found
the Agenda view already lists only the things I need to submit. A
tutorial swap board fell apart when ANU's MyTimetable guide showed the
heart button is already "Request Swap". The third idea came from my own
electives: the COMP6261 page only says "130 hours", SELT only shows 1–5
scores, and StudentVIP has almost no postgrad reviews.

Before any code, I wrote my rules into CLAUDE.md [`a21b570`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-u8033161/commit/a21b570): no invented
student reports, every official figure links to its Programs & Courses
page, and nicknames only.

Then I corrected the agent's plan in three places. Its seed script would
only have filled my local database, so the courses are now seeded at
startup and reach Fly's volume [`73c4f97`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-u8033161/commit/73c4f97). The weekly hours figure is
labelled as my app's own estimate, because Programs & Courses only gives
a total [`1563286`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-u8033161/commit/1563286). And the form's error messages showed in Chinese on
my laptop, so I set fixed English messages [`c4c225b`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-u8033161/commit/c4c225b).

A spec test checks that a report survives a reload, and that the server
rejects bad input [`4411f0d`](https://github.com/comp4020-agentic-coding-studio/comp4020-crit7-u8033161/commit/4411f0d).

## Known limits

Anyone can post a report, so spam is possible. Filtering reports by the
courses someone took before is my next step.
