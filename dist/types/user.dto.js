export function toUserDTO(user) {
    return {
        id: user.idUser,
        email: user.professionalEmail,
        role: user.role,
    };
}
