import { PrismaClient } from '@prisma/client';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';

const MIGRATIONS_DIR = join(process.cwd(), 'Prisma', 'migrations');

const prisma = new PrismaClient();

function splitStatements(sql) {
	return sql
		.split('\n')
		.filter((line) => !line.trim().startsWith('--'))
		.join('\n')
		.split(';')
		.map((statement) => statement.trim())
		.filter(Boolean);
}

await prisma.$executeRawUnsafe(
	'CREATE TABLE IF NOT EXISTS `_prisma_migrations` (id VARCHAR(36) NOT NULL, checksum VARCHAR(64) NOT NULL, finished_at DATETIME(3) NULL, migration_name VARCHAR(255) NOT NULL, logs TEXT NULL, rolled_back_at DATETIME(3) NULL, started_at DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), CONSTRAINT `_prisma_migrations_pkey` PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci',
);

const applied = new Set(
	(
		await prisma.$queryRawUnsafe('SELECT migration_name FROM `_prisma_migrations` WHERE finished_at IS NOT NULL')
	).map((row) => row.migration_name),
);

const folders = readdirSync(MIGRATIONS_DIR, { withFileTypes: true })
	.filter((entry) => entry.isDirectory())
	.map((entry) => entry.name)
	.sort();

for (const name of folders) {
	if (applied.has(name)) {
		console.log(`= deja appliquee : ${name}`);
		continue;
	}

	const statements = splitStatements(readFileSync(join(MIGRATIONS_DIR, name, 'migration.sql'), 'utf8'));
	const id = randomUUID();
	const startedAt = new Date();

	await prisma.$executeRawUnsafe(
		'INSERT INTO `_prisma_migrations` (id, checksum, migration_name, started_at) VALUES (?, ?, ?, ?)',
		id,
		'manual',
		name,
		startedAt,
	);

	try {
		for (const statement of statements) {
			await prisma.$executeRawUnsafe(statement);
		}
		await prisma.$executeRawUnsafe('UPDATE `_prisma_migrations` SET finished_at = ? WHERE id = ?', new Date(), id);
	} catch (error) {
		await prisma.$executeRawUnsafe(
			'UPDATE `_prisma_migrations` SET rolled_back_at = ?, logs = ? WHERE id = ?',
			new Date(),
			String(error),
			id,
		);
		throw new Error(`Migration ${name} echouee : ${String(error)}`);
	}

	console.log(`+ appliquee : ${name} (${statements.length} requetes)`);
}

await prisma.$disconnect();
console.log('Toutes les migrations sont a jour.');
