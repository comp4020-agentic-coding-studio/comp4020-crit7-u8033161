CREATE TABLE `courses` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`code` text NOT NULL,
	`title` text NOT NULL,
	`semester` text NOT NULL,
	`official_workload_hours` integer,
	`source_url` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `courses_code_unique` ON `courses` (`code`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`course_id` integer NOT NULL,
	`nickname` text NOT NULL,
	`semester_taken` text NOT NULL,
	`difficulty` integer NOT NULL,
	`hours_per_week` real NOT NULL,
	`background` text NOT NULL,
	`advice` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "difficulty_range" CHECK("reports"."difficulty" between 1 and 5),
	CONSTRAINT "hours_per_week_range" CHECK("reports"."hours_per_week" between 0 and 60)
);
