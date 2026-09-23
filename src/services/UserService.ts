import userRepository from '../repositories/UserRepository.js';

type UserUpdateInput = {
    idRequest?: number;
    idEquipment?: number;
    idBreakdown?: number;
    professionalEmail?:string;
    password?: string;
    role?: 'Employer' | 'Manager' | 'Administrator' | 'Director' | 'Logistician';
};

class UserService {

    async updateUser(idUser: number, userData: UserUpdateInput) {
        const user = await userRepository.findById(idUser);

        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        return userRepository.update(idUser, userData);
    }
}

export default new UserService();
