CREATE TABLE `creditTransactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`revendedorId` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`type` enum('debit','credit') NOT NULL,
	`description` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditTransactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `keys` (
	`id` int AUTO_INCREMENT NOT NULL,
	`keyCode` varchar(32) NOT NULL,
	`revendedorId` int NOT NULL,
	`planDays` int NOT NULL,
	`status` enum('ativo','pausado','banido','expirado') NOT NULL DEFAULT 'ativo',
	`isActivated` boolean NOT NULL DEFAULT false,
	`activatedAt` timestamp,
	`expiresAt` timestamp,
	`deviceId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `keys_id` PRIMARY KEY(`id`),
	CONSTRAINT `keys_keyCode_unique` UNIQUE(`keyCode`)
);
--> statement-breakpoint
CREATE TABLE `revendedores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`creditBalance` decimal(10,2) NOT NULL DEFAULT '0',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `revendedores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` DROP INDEX `users_openId_unique`;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('admin','revendedor') NOT NULL DEFAULT 'revendedor';--> statement-breakpoint
ALTER TABLE `users` ADD `username` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `passwordHash` text NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_username_unique` UNIQUE(`username`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `openId`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `name`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `email`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `loginMethod`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `lastSignedIn`;