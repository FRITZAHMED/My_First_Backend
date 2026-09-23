-- CreateTable
CREATE TABLE `breakdown` (
    `idBreakdown` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(100) NOT NULL,
    `description` TEXT NULL,

    PRIMARY KEY (`idBreakdown`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `equipment` (
    `idEquipment` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `description` VARCHAR(255) NULL,
    `serialNumber` VARCHAR(100) NULL,

    UNIQUE INDEX `serialNumber`(`serialNumber`),
    PRIMARY KEY (`idEquipment`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `logisticservice` (
    `idLogisticService` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idRequest` INTEGER UNSIGNED NOT NULL,
    `professionalEmail` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,

    INDEX `FK_ServiceLog_Demande`(`idRequest`),
    PRIMARY KEY (`idLogisticService`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `request` (
    `idRequest` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `description` TEXT NULL,
    `creationDate` DATETIME(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    PRIMARY KEY (`idRequest`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `submission` (
    `idUser` INTEGER UNSIGNED NOT NULL,
    `idRequest` INTEGER UNSIGNED NOT NULL,

    INDEX `FK_Soumettre_Demande`(`idRequest`),
    PRIMARY KEY (`idUser`, `idRequest`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user` (
    `idUser` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idRequest` INTEGER UNSIGNED NULL,
    `idEquipment` INTEGER UNSIGNED NULL,
    `idBreakdown` INTEGER UNSIGNED NULL,
    `professionalEmail` VARCHAR(150) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('Employer', 'Manager', 'Administrator', 'Director', 'Logistician') NOT NULL,

    UNIQUE INDEX `professionalEmail`(`professionalEmail`),
    INDEX `FK_User_Demande`(`idRequest`),
    INDEX `FK_User_Equipement`(`idEquipment`),
    INDEX `FK_User_Panne`(`idBreakdown`),
    PRIMARY KEY (`idUser`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `logisticservice` ADD CONSTRAINT `FK_ServiceLog_Demande` FOREIGN KEY (`idRequest`) REFERENCES `request`(`idRequest`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `FK_Soumettre_Demande` FOREIGN KEY (`idRequest`) REFERENCES `request`(`idRequest`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `FK_Soumettre_User` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `FK_User_Demande` FOREIGN KEY (`idRequest`) REFERENCES `request`(`idRequest`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `FK_User_Equipement` FOREIGN KEY (`idEquipment`) REFERENCES `equipment`(`idEquipment`) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `user` ADD CONSTRAINT `FK_User_Panne` FOREIGN KEY (`idBreakdown`) REFERENCES `breakdown`(`idBreakdown`) ON DELETE RESTRICT ON UPDATE RESTRICT;
