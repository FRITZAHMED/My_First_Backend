import { user_role, user } from '@prisma/client';
 
export interface UserResponseDTO {
  id: number;
  email: string;
  name: string;
  role: user_role;
  createdAt: Date;
  updatedAt: Date;
}
 
export interface AuthTokensDTO {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}
 
export function toUserDTO(user: user): UserResponseDTO {
  return {
    id: user.idUser,
    email: user.professionalEmail,
    role: user.role,
  };
}