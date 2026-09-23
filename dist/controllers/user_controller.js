const userService = require('../services/user.service');
class UserController {
    async register(req, res, next) {
        try {
            const newUser = await userService.registerUser(req.body);
            res.status(201).json({
                success: true,
                message: 'Utilisateur créé avec succès',
                data: newUser
            });
        }
        catch (error) {
            next(error);
        }
    }
    async getUser(req, res, next) {
        try {
            const user = await userService.getUserById(req.params.id);
            res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            next(error);
        }
    }
}
module.exports = new UserController();
export {};
