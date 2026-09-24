import { prisma } from "../Config/Database.js";


export type UserCreateInput = {
	idRequest?: number;
	idEquipment?: number;
	idBreakdown?: number;
	professionalEmail: string;
	password: string;
	role: 'Employer' | 'Manager' | 'Administrator' | 'Director' | 'Logistician';
};

export type UserUpdateInput = Partial<UserCreateInput>;

class UserRepository {
	async create(userData: UserCreateInput) {
    return prisma.user.create({
        data: userData
    });
}

	async findById(idUser: number) {
    return prisma.user.findUnique({
        where: { idUser: Number(idUser) }
    });
}


	async findByEmail(email:string) {
		return prisma.user.findUnique({
			where: { professionalEmail: email },
		});
	}

	async findAll() {
		return prisma.user.findMany({
			orderBy: { idUser: 'asc' },
		});
	}
async update(idUser: number, userData: UserUpdateInput) {
    return prisma.user.update({
        where: { idUser: Number(idUser) },
        data: userData
    });
}


	async delete(idUser: number) {
		return prisma.user.delete({
			where: { idUser: Number(idUser) },
		});
	}
}

export default new UserRepository();