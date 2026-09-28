import { prisma } from '../Config/Database.js';

export type LogisticServiceCreateInput = {
	idRequest: number;
	professionalEmail: string;
	password: string;
};

export type LogisticServiceUpdateInput = Partial<LogisticServiceCreateInput>;

class LogisticServiceRepository {
	async create(serviceData: LogisticServiceCreateInput) {
		return prisma.logisticservice.create({ data: serviceData });
	}

	async findById(idLogisticService: number) {
		return prisma.logisticservice.findUnique({ where: { idLogisticService } });
	}

	async findAll() {
		return prisma.logisticservice.findMany({ orderBy: { idLogisticService: 'asc' } });
	}

	async update(idLogisticService: number, serviceData: LogisticServiceUpdateInput) {
		return prisma.logisticservice.update({ where: { idLogisticService }, data: serviceData });
	}

	async delete(idLogisticService: number) {
		return prisma.logisticservice.delete({ where: { idLogisticService } });
	}
}

export default new LogisticServiceRepository();