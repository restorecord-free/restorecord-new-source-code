-- CreateTable
CREATE TABLE `accounts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `role` VARCHAR(191) NULL DEFAULT 'free',
    `pfp` VARCHAR(191) NOT NULL DEFAULT 'https://i.imgur.com/w65Dpnw.png',
    `banned` BOOLEAN NOT NULL DEFAULT false,
    `twoFactor` BOOLEAN NOT NULL DEFAULT false,
    `googleAuthCode` VARCHAR(191) NULL,
    `darkmode` BOOLEAN NOT NULL DEFAULT true,
    `expiry` DATETIME(3) NULL,
    `admin` BOOLEAN NOT NULL DEFAULT false,
    `lastIp` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` BIGINT NULL,

    UNIQUE INDEX `accounts_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `servers` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `ownerId` INTEGER NOT NULL,
    `guildId` BIGINT NOT NULL,
    `roleId` BIGINT NOT NULL,
    `redirectUrl` VARCHAR(191) NULL,
    `picture` VARCHAR(191) NULL DEFAULT 'https://i.imgur.com/w65Dpnw.png',
    `vpncheck` BOOLEAN NOT NULL DEFAULT false,
    `webhook` VARCHAR(191) NULL,
    `bgImage` VARCHAR(191) NULL,
    `description` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `customBotId` INTEGER NOT NULL,

    UNIQUE INDEX `servers_name_key`(`name`),
    UNIQUE INDEX `servers_guildId_key`(`guildId`),
    UNIQUE INDEX `servers_roleId_key`(`roleId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `members` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `guildId` BIGINT NOT NULL,
    `accessToken` VARCHAR(191) NOT NULL,
    `refreshToken` VARCHAR(191) NOT NULL,
    `ip` VARCHAR(191) NULL,
    `username` VARCHAR(191) NOT NULL,
    `avatar` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `members_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customBots` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `clientId` BIGINT NOT NULL,
    `botToken` VARCHAR(191) NOT NULL,
    `botSecret` VARCHAR(191) NOT NULL,
    `ownerId` INTEGER NOT NULL,

    UNIQUE INDEX `customBots_clientId_key`(`clientId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `servers` ADD CONSTRAINT `servers_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `servers` ADD CONSTRAINT `servers_customBotId_fkey` FOREIGN KEY (`customBotId`) REFERENCES `customBots`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `members` ADD CONSTRAINT `members_guildId_fkey` FOREIGN KEY (`guildId`) REFERENCES `servers`(`guildId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `customBots` ADD CONSTRAINT `customBots_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `accounts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
