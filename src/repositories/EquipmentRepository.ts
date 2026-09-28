import type { equipment_status, Prisma } from '@prisma/client';
import { prisma } from '../Config/Database.js';

const publicFields = {
	idEquipment: true,
	description: true,
	serialNumber: true,
	status: true,
	idUser: true,
	createdAt: true,
	updatedAt: true,
} as const;

class EquipmentRepository {
	create(data: Prisma.equipmentUncheckedCreateInput) {
		return prisma.equipment.create({ data, select: publicFields });
	}

	findById(idEquipment: number) {
		return prisma.equipment.findUnique({ where: { idEquipment }, select: publicFields });
	}

	findMany(skip: number, take: number, filters: { status?: equipment_status } = {}) {
		return prisma.equipment.findMany({
			where: filters.status ? { status: filters.status } : undefined,
			select: publicFields,
			orderBy: { idEquipment: 'asc' },
			skip,
			take,
		});
	}

	count(filters: { status?: equipment_status } = {}) {
		return prisma.equipment.count({ where: filters.status ? { status: filters.status } : undefined });
	}

	update(idEquipment: number, data: Prisma.equipmentUncheckedUpdateInput) {
		return prisma.equipment.update({ where: { idEquipment }, data, select: publicFields });
	}

	delete(idEquipment: number) {
		return prisma.equipment.delete({ where: { idEquipment }, select: publicFields });
	}
}

export default new EquipmentRepository();
export { publicFields as equipmentPublicFields };
