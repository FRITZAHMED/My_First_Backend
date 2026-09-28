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
	role?: import('@prisma/client').user_role;
	search?: string;
}

class UserRepository {
	create(data: { professionalEmail: string; password: string; role: import('@prisma/client').user_role }) {
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
		const where: import('@prisma/client').Prisma.userWhereInput = {};

		if (filters.role) where.role = filters.role;
		if (filters.search) {
			where.professionalEmail = { contains: filters.search.toLowerCase() };
		}

		return prisma.user.findMany({
			where,
			select: publicFields,
			orderBy: { idUser: 'asc' },
			skip,
			take,
		});
	}

	count(filters: UserFilters = {}) {
		const where: import('@prisma/client').Prisma.userWhereInput = {};

		if (filters.role) where.role = filters.role;
		if (filters.search) {
			where.professionalEmail = { contains: filters.search.toLowerCase() };
		}

		return prisma.user.count({ where });
	}

	update(idUser: number, data: { professionalEmail?: string; password?: string; role?: import('@prisma/client').user_role; isActive?: boolean }) {
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
