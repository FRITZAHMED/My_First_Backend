import type { Prisma, user_role } from '@prisma/client';
import { prisma } from '../Config/Database.js';

/**
 * Selection explicite : le champ `password` n'est jamais demande a Prisma,
 * il ne peut donc pas se retrouver dans une reponse HTTP.
 */
const publicFields = {
	idUser: true,
	professionalEmail: true,
	role: true,
	isActive: true,
	createdAt: true,
	updatedAt: true,
} as const;

export interface UserFilters {
	role?: user_role;
	search?: string;
}

export interface UserCreateData {
	professionalEmail: string;
	password: string;
	role: user_role;
}

export interface UserUpdateData {
	professionalEmail?: string;
	password?: string;
	role?: user_role;
	isActive?: boolean;
}

function buildWhere(filters: UserFilters): Prisma.userWhereInput {
	const where: Prisma.userWhereInput = {};

	if (filters.role) where.role = filters.role;
	if (filters.search) {
		where.professionalEmail = { contains: filters.search.toLowerCase() };
	}

	return where;
}

class UserRepository {
	create(data: UserCreateData) {
		return prisma.user.create({ data, select: publicFields });
	}

	findById(idUser: number) {
		return prisma.user.findUnique({ where: { idUser }, select: publicFields });
	}

	/** Version complete (avec le hash) : reservee a l'authentification. */
	findByEmailWithPassword(professionalEmail: string) {
		return prisma.user.findUnique({ where: { professionalEmail } });
	}

	/** Version complete (avec le hash) : reservee a l'authentification. */
	findByIdWithPassword(idUser: number) {
		return prisma.user.findUnique({ where: { idUser } });
	}

	findByEmail(professionalEmail: string) {
		return prisma.user.findUnique({ where: { professionalEmail }, select: publicFields });
	}

	findMany(skip: number, take: number, filters: UserFilters = {}) {
		return prisma.user.findMany({
			where: buildWhere(filters),
			select: publicFields,
			orderBy: { idUser: 'asc' },
			skip,
			take,
		});
	}

	count(filters: UserFilters = {}) {
		return prisma.user.count({ where: buildWhere(filters) });
	}

	update(idUser: number, data: UserUpdateData) {
		return prisma.user.update({ where: { idUser }, data, select: publicFields });
	}

	setRefreshToken(idUser: number, refreshToken: string | null) {
		return prisma.user.update({ where: { idUser }, data: { refreshToken }, select: { idUser: true } });
	}

	delete(idUser: number) {
		return prisma.user.delete({ where: { idUser }, select: publicFields });
	}
}

export default new UserRepository();
export { publicFields as userPublicFields };
