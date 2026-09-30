import { prisma } from '../Config/Database.js';
import type { license_status, Prisma } from '@prisma/client';

export type LicenseWithEquipment = Prisma.licenseGetPayload<{
	include: { equipment: true };
}>;

export type LicenseCreateInput = Prisma.licenseUncheckedCreateInput;
export type LicenseUpdateInput = Prisma.licenseUncheckedUpdateInput;

class LicenseRepository {
	async findAll(params: { page?: number; limit?: number; status?: license_status; equipmentId?: number } = {}) {
		const { page = 1, limit = 20, status, equipmentId } = params;
		const skip = (page - 1) * limit;
		const take = Math.min(limit, 100);

		const where: Prisma.licenseWhereInput = {};
		if (status) where.status = status;
		if (equipmentId) where.idEquipment = equipmentId;

		const [data, total] = await Promise.all([
			prisma.license.findMany({ where, skip, take, orderBy: { createdAt: 'desc' }, include: { equipment: true } }),
			prisma.license.count({ where }),
		]);

		return { data, meta: { total, page, limit: take, totalPages: Math.ceil(total / take) } };
	}

	async findById(idLicense: number): Promise<LicenseWithEquipment | null> {
		return prisma.license.findUnique({ where: { idLicense }, include: { equipment: true } });
	}

	async findByLicenseNumber(licenseNumber: string) {
		return prisma.license.findUnique({ where: { licenseNumber }, include: { equipment: true } });
	}

	async findByEquipmentId(idEquipment: number) {
		return prisma.license.findUnique({ where: { idEquipment }, include: { equipment: true } });
	}

	async create(data: LicenseCreateInput) {
		return prisma.license.create({ data, include: { equipment: true } });
	}

	async update(idLicense: number, data: LicenseUpdateInput) {
		return prisma.license.update({ where: { idLicense }, data, include: { equipment: true } });
	}

	async delete(idLicense: number) {
		return prisma.license.delete({ where: { idLicense } });
	}

	async countByStatus() {
		return prisma.license.groupBy({ by: ['status'], _count: { status: true } });
	}
}

export default new LicenseRepository();