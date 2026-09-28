import type { Prisma } from '@prisma/client';
import { prisma } from '../Config/Database.js';

const publicFields = {
	idLogisticService: true,
	idRequest: true,
	idLogistician: true,
	createdAt: true,
} as const;

class LogisticServiceRepository {
	create(data: Prisma.logisticserviceUncheckedCreateInput) {
		return prisma.logisticservice.create({ data, select: publicFields });
	}

	findById(idLogisticService: number) {
		return prisma.logisticservice.findUnique({ where: { idLogisticService }, select: publicFields });
	}

	findByPair(idRequest: number, idLogistician: number) {
		return prisma.logisticservice.findUnique({
			where: { idRequest_idLogistician: { idRequest, idLogistician } },
			select: publicFields,
		});
	}

	findMany(skip: number, take: number) {
		return prisma.logisticservice.findMany({
			select: publicFields,
			orderBy: { idLogisticService: 'asc' },
			skip,
			take,
		});
	}

	count() {
		return prisma.logisticservice.count();
	}

	delete(idLogisticService: number) {
		return prisma.logisticservice.delete({ where: { idLogisticService }, select: publicFields });
	}
}

export default new LogisticServiceRepository();
export { publicFields as assignmentPublicFields };
