import { prisma } from '../Config/Database.js';

export type SubmissionCreateInput = {
	idUser: number;
	idRequest: number;
};

class SubmissionRepository {
	async create(submissionData: SubmissionCreateInput) {
		return prisma.submission.create({ data: submissionData });
	}

	async findById(idUser: number, idRequest: number) {
		return prisma.submission.findUnique({
			where: { idUser_idRequest: { idUser, idRequest } },
		});
	}

	async findAll() {
		return prisma.submission.findMany({
			orderBy: [{ idRequest: 'asc' }, { idUser: 'asc' }],
		});
	}

	async delete(idUser: number, idRequest: number) {
		return prisma.submission.delete({
			where: { idUser_idRequest: { idUser, idRequest } },
		});
	}
}

export default new SubmissionRepository();