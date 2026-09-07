CREATE TABLE `quiz_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`durationMinutes` int NOT NULL DEFAULT 30,
	`questionCount` int NOT NULL DEFAULT 25,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quiz_settings_id` PRIMARY KEY(`id`)
);
