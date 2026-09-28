-- DropForeignKey
ALTER TABLE `logisticservice` DROP FOREIGN KEY `FK_ServiceLog_Demande`;

-- DropForeignKey
ALTER TABLE `submission` DROP FOREIGN KEY `FK_Soumettre_Demande`;

-- DropForeignKey
ALTER TABLE `submission` DROP FOREIGN KEY `FK_Soumettre_User`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `FK_User_Demande`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `FK_User_Equipement`;

-- DropForeignKey
ALTER TABLE `user` DROP FOREIGN KEY `FK_User_Panne`;

-- DropIndex
DROP INDEX `FK_User_Demande` ON `user`;

-- DropIndex
DROP INDEX `FK_User_Equipement` ON `user`;

-- DropIndex
DROP INDEX `FK_User_Panne` ON `user`;

-- AlterTable
ALTER TABLE `breakdown` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `idEquipment` INTEGER UNSIGNED NULL,
    ADD COLUMN `idUser` INTEGER UNSIGNED NULL,
    ADD COLUMN `resolvedAt` DATETIME(3) NULL,
    ADD COLUMN `status` ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `equipment` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `idUser` INTEGER UNSIGNED NULL,
    ADD COLUMN `status` ENUM('AVAILABLE', 'ASSIGNED', 'MAINTENANCE', 'RETIRED') NOT NULL DEFAULT 'AVAILABLE',
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `logisticservice` DROP COLUMN `password`,
    DROP COLUMN `professionalEmail`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `idLogistician` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `request` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `idUser` INTEGER UNSIGNED NOT NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `creationDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `submission` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `user` DROP COLUMN `idBreakdown`,
    DROP COLUMN `idEquipment`,
    DROP COLUMN `idRequest`,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `refreshToken` VARCHAR(255) NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `role` ENUM('Administrator', 'Director', 'Manager', 'Logistician', 'Employer') NOT NULL DEFAULT 'Employer';

-- CreateIndex
CREATE INDEX `FK_Breakdown_User` ON `breakdown`(`idUser`);

-- CreateIndex
CREATE INDEX `FK_Breakdown_Equipment` ON `breakdown`(`idEquipment`);

-- CreateIndex
CREATE INDEX `IDX_Breakdown_Status` ON `breakdown`(`status`);

-- CreateIndex
CREATE INDEX `FK_Equipment_User` ON `equipment`(`idUser`);

-- CreateIndex
CREATE INDEX `IDX_Equipment_Status` ON `equipment`(`status`);

-- CreateIndex
CREATE INDEX `FK_Assignment_Logistician` ON `logisticservice`(`idLogistician`);

-- CreateIndex
CREATE UNIQUE INDEX `UQ_Assignment_Request_Logistician` ON `logisticservice`(`idRequest`, `idLogistician`);

-- CreateIndex
CREATE INDEX `FK_Request_User` ON `request`(`idUser`);

-- CreateIndex
CREATE INDEX `IDX_Request_CreationDate` ON `request`(`creationDate`);

-- AddForeignKey
ALTER TABLE `equipment` ADD CONSTRAINT `FK_Equipment_User` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `breakdown` ADD CONSTRAINT `FK_Breakdown_User` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `breakdown` ADD CONSTRAINT `FK_Breakdown_Equipment` FOREIGN KEY (`idEquipment`) REFERENCES `equipment`(`idEquipment`) ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `request` ADD CONSTRAINT `FK_Request_User` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `logisticservice` ADD CONSTRAINT `FK_Assignment_Request` FOREIGN KEY (`idRequest`) REFERENCES `request`(`idRequest`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `logisticservice` ADD CONSTRAINT `FK_Assignment_Logistician` FOREIGN KEY (`idLogistician`) REFERENCES `user`(`idUser`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `FK_Submission_Request` FOREIGN KEY (`idRequest`) REFERENCES `request`(`idRequest`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE `submission` ADD CONSTRAINT `FK_Submission_User` FOREIGN KEY (`idUser`) REFERENCES `user`(`idUser`) ON DELETE CASCADE ON UPDATE RESTRICT;

-- Les index sont supprimes avant les cles etrangeres qui les supportent
-- MariaDB ne supporte pas "ALTER TABLE ... RENAME INDEX" : on recree les index renommes
DROP INDEX `FK_ServiceLog_Demande` ON `logisticservice`;

DROP INDEX `FK_Soumettre_Demande` ON `submission`;
