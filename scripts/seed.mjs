import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const users = [
	{ professionalEmail: 'admin@rhopenlabs.com', role: 'Administrator', password: 'Admin@2026' },
	{ professionalEmail: 'directeur@rhopenlabs.com', role: 'Director', password: 'Director@2026' },
	{ professionalEmail: 'manager@rhopenlabs.com', role: 'Manager', password: 'Manager@2026' },
	{ professionalEmail: 'logisticien@rhopenlabs.com', role: 'Logistician', password: 'Logistic@2026' },
	{ professionalEmail: 'employe@rhopenlabs.com', role: 'Employer', password: 'Employe@2026' },
];

async function main() {
	for (const user of users) {
		const password = await bcrypt.hash(user.password, 12);

		await prisma.user.upsert({
			where: { professionalEmail: user.professionalEmail },
			update: { role: user.role, password, isActive: true },
			create: {
				professionalEmail: user.professionalEmail,
				role: user.role,
				password,
				isActive: true,
			},
		});

		console.log(`  - ${user.professionalEmail} (${user.role})`);
	}

	const laptop = await prisma.equipment.upsert({
		where: { serialNumber: 'RH-LAPTOP-0001' },
		update: {},
		create: {
			serialNumber: 'RH-LAPTOP-0001',
			description: 'Ordinateur portable Lenovo T14',
			status: 'AVAILABLE',
		},
	});

	await prisma.equipment.upsert({
		where: { serialNumber: 'RH-DESKTOP-0001' },
		update: {},
		create: {
			serialNumber: 'RH-DESKTOP-0001',
			description: 'Poste fixe HP EliteDesk',
			status: 'AVAILABLE',
		},
	});

	await prisma.breakdown.create({
		data: {
			label: 'Ecran casse',
			description: 'Ecrat fendu apres une chute, remplacement necessaire',
			idEquipment: laptop.idEquipment,
		},
	});

	const employe = await prisma.user.findUnique({ where: { professionalEmail: 'employe@rhopenlabs.com' } });

	if (employe) {
		await prisma.request.create({
			data: {
				description: 'Remplacement de mon ecran casse (demande de test)',
				idUser: employe.idUser,
			},
		});
	}

	console.log('\nSeed termine. Comptes de test :');
	for (const user of users) {
		console.log(`  ${user.role.padEnd(14)} ${user.professionalEmail} / ${user.password}`);
	}
}

main()
	.catch((error) => {
		console.error('Echec du seed :', error);
		process.exitCode = 1;
	})
	.finally(() => prisma.$disconnect());
