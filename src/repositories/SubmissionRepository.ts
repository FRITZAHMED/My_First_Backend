import { prisma } from '../Config/Database.js';

const publicFields = {
	idUser: true,
	idRequest: true,
	createdAt: true,
} as const;

class SubmissionRepository {
	create(data: { idUser: number; idRequest: number }) {
		return prisma.submission.create({ data, select: publicFields });
	}

	findById(idUser: number, idRequest: number) {
		return prisma.submission.findUnique({
			where: { idUser_idRequest: { idUser, idRequest } },
			select: publicFields,
		});
	}

	findMany(skip: number, take: number, filters: { idRequest?: number; idUser?: number } = {}) {
		return prisma.submission.findMany({
			where: {
				...(filters.idRequest !== undefined && { idRequest: filters.idRequest }),
				...(filters.idUser !== undefined && { idUser: filters.idUser }),
			},
			select: publicFields,
			orderBy: [{ idRequest: 'asc' }, { idUser: 'asc' }],
			skip,
			take,
		});
	}

	count(filters: { idRequest?: number; idUser?: number } = {}) {
		return prisma.submission.count({
			where: {
				...(filters.idRequest !== undefined && { idRequest: filters.idRequest }),
				...(filters.idUser !== undefined && { idUser: filters.idUser }),
			},
		});
	}

	delete(idUser: number, idRequest: number) {
		return prisma.submission.delete({
			where: { idUser_idRequest: { idUser, idRequest } },
			select: publicFields,
		});
	}
}

export default new SubmissionRepository();
export { publicFields as submissionPublicFields };
