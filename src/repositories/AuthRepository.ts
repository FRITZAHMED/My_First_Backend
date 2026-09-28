import { Prisma, PrismaClient } from "@prisma/client";
import { ValidateLogin } from "../Validators/Auth_validator.js";

export type Auth_validator = {
    professionalEmail:string,
    password:string
};

export type Auth_validatorUpdateInput = Partial<Auth_validator>;

class AuthRepository{
    private prisma = new PrismaClient();
}