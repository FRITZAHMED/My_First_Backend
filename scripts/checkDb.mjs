import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'node:fs';
import 'dotenv/config';

const line = readFileSync('.env', 'utf8').split(/\r?\n/).find((l) => l.startsWith('DATABASE_URL'));
const url = line.slice(line.indexOf('=') + 1).trim();
const db = url.match(/\/([^/?]+)/)?.[1];

console.log('Base cible :', db);

const prisma = new PrismaClient();

try {
	const info = await prisma.$queryRawUnsafe('SELECT VERSION() AS version');
	console.log('MySQL/MariaDB joignable :', info[0].version);

	const tables = await prisma.$queryRawUnsafe('SHOW TABLES');
	console.log('Tables :', tables.map((t) => Object.values(t)[0]).join(', '));

	const users = await prisma.user.count();
	console.log('Utilisateurs en base :', users);
} catch (error) {
	console.error('ECHEC :', String(error).split('\n')[0]);
	process.exitCode = 1;
} finally {
	await prisma.$disconnect();
}
