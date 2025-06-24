-- AlterTable
ALTER TABLE `complaints` MODIFY `status` ENUM('new', 'received', 'discussing', 'processing', 'resolved', 'archived') NOT NULL DEFAULT 'new';
