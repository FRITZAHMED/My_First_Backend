import prisma from '../config/Database.js';

class UserRepository {
	async create(userData) {
    return prisma.user.create({
        data: userData
    });
}

	async findById(idUser) {
    return prisma.user.findUnique({
        where: { idUser: Number(idUser) }
    });
}


	async findByEmail(email) {
		return prisma.user.findUnique({
			where: { professionalEmail: email },
		});
	}

	async findAll() {
		return prisma.user.findMany({
			orderBy: { idUser: 'asc' },
		});
	}
async update(idUser, userData) {
    return prisma.user.update({
        where: { idUser: Number(idUser) },
        data: userData
    });
}


	async delete(idUser) {
		return prisma.user.delete({
			where: { idUser: Number(idUser) },
		});
	}
}

export default new UserRepository();