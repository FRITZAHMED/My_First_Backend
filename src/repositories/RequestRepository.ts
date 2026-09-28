import { prisma } from '../Config/Database.js';

export type RequestCreateInput = {
	description?: string | null;
	creationDate?: Date | null;
};

export type RequestUpdateInput = Partial<RequestCreateInput>;

class RequestRepository {
	async create(requestData: RequestCreateInput) {
		return prisma.request.create({ data: requestData });
	}

	async findById(idRequest: number) {
		return prisma.request.findUnique({ where: { idRequest } });
	}

	async findAll() {
		return prisma.request.findMany({ orderBy: { idRequest: 'asc' } });
	}

	async update(idRequest: number, requestData: RequestUpdateInput) {
		return prisma.request.update({ where: { idRequest }, data: requestData });
	}

	async delete(idRequest: number) {
		return prisma.request.delete({ where: { idRequest } });
	}
}

export default new RequestRepository();