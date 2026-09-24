import userRepository from '../repositories/UserRepository.js';
import { AppError } from '../Utils/AppError.js';
import { hashPassword } from '../Utils/password.js';
import type { UserCreateInput, UserUpdateInput } from '../repositories/UserRepository.js';

class UserService {
    async registerUser(userData: UserCreateInput) {
        const existingUser = await userRepository.findByEmail(userData.professionalEmail);

        if (existingUser) {
            throw new AppError('Cette adresse email est déjà utilisée', 409);
        }

        return userRepository.create({
            ...userData,
            password: await hashPassword(userData.password),
        });
    }

    async getUserById(idUser: number) {
        const user = await userRepository.findById(idUser);

        if (!user) {
            throw new AppError('Utilisateur introuvable', 404);
        }

        return user;
    }

    async updateUser(idUser: number, userData: UserUpdateInput) {
        const user = await userRepository.findById(idUser);

        if (!user) {
            throw new AppError('Utilisateur introuvable', 404);
        }

        return userRepository.update(idUser, userData);
    }
}

export default new UserService();
