import userRepository from '../repositories/UserRepository.js';

class UserService {

    async updateUser(idUser, userData) {
        const user = await userRepository.findById(idUser);

        if (!user) {
            throw new Error("Utilisateur introuvable");
        }

        return userRepository.update(idUser, userData);
    }
}

export default new UserService();
