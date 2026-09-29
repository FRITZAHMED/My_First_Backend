import type { breakdown_status, Prisma } from '@prisma/client';
import { prisma } from '../Config/Database.js';

const publicFields = {
	idBreakdown: true,
	label: true,
	description: true,
	severity: true,
	status: true,
	idUser: true,
	idEquipment: true,
	resolvedAt: true,
	createdAt: true,
	updatedAt: true,
} as const;

class BreakdownRepository {
	create(data: Prisma.breakdownUncheckedCreateInput) {
		return prisma.breakdown.create({ data, select: publicFields });
	}

	findById(idBreakdown: number) {
		return prisma.breakdown.findUnique({ where: { idBreakdown }, select: publicFields });
	}

	findMany(skip: number, take: number, filters: { status?: breakdown_status } = {}) {
		return prisma.breakdown.findMany({
			where: filters.status ? { status: filters.status } : undefined,
			select: publicFields,
			orderBy: { idBreakdown: 'desc' },
			skip,
			take,
		});
	}

	count(filters: { status?: breakdown_status } = {}) {
		return prisma.breakdown.count({ where: filters.status ? { status: filters.status } : undefined });
	}

	update(idBreakdown: number, data: Prisma.breakdownUncheckedUpdateInput) {
		return prisma.breakdown.update({ where: { idBreakdown }, data, select: publicFields });
	}

	delete(idBreakdown: number) {
		return prisma.breakdown.delete({ where: { idBreakdown }, select: publicFields });
	}
}

export default new BreakdownRepository();
export { publicFields as breakdownPublicFields };
