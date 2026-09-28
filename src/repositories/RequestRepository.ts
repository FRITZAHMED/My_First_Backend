import type { Prisma } from '@prisma/client';
import { prisma } from '../Config/Database.js';

const publicFields = {
	idRequest: true,
	description: true,
	creationDate: true,
	idUser: true,
	createdAt: true,
	updatedAt: true,
} as const;

class RequestRepository {
	create(data: Prisma.requestUncheckedCreateInput) {
		return prisma.request.create({ data, select: publicFields });
	}

	findById(idRequest: number) {
		return prisma.request.findUnique({ where: { idRequest }, select: publicFields });
	}

	findManyByAuthor(idUser: number, skip: number, take: number) {
		return prisma.request.findMany({
			where: { idUser },
			select: publicFields,
			orderBy: { creationDate: 'desc' },
			skip,
			take,
		});
	}

	findMany(skip: number, take: number) {
		return prisma.request.findMany({
			select: publicFields,
			orderBy: { creationDate: 'desc' },
			skip,
			take,
		});
	}

	countByAuthor(idUser: number) {
		return prisma.request.count({ where: { idUser } });
	}

	count() {
		return prisma.request.count();
	}

	update(idRequest: number, data: Prisma.requestUpdateInput) {
		return prisma.request.update({ where: { idRequest }, data, select: publicFields });
	}

	delete(idRequest: number) {
		return prisma.request.delete({ where: { idRequest }, select: publicFields });
	}
}

export default new RequestRepository();
export { publicFields as requestPublicFields };
