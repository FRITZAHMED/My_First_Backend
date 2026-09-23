import { z } from "zod";
const Employer = z.object({
    Id_Employer: z.number(),
    Name: z.string(),
    Professional_email: z.string(),
    Password: z.string().max(8),
});
const Supervisor = z.object({
    Id_Supervisor: z.number(),
    Name: z.string(),
    Professional_email: z.string(),
    Password: z.string()
});
const LogistDepartement = z.object({
    Id_LogistiqueDepartement: z.number(),
    Name: z.string(),
    Professional_email: z.string(),
    Password: z.string()
});
const Manager = z.object({
    Id_Manager: z.number(),
    Name: z.string(),
    Professional_email: z.string(),
    Password: z.string()
});
const AdministrationDepartement = z.object({
    Id_AdministrationDepartement: z.number(),
    Name: z.string(),
    Professional_email: z.string(),
    Password: z.string()
});
const Breakdown = z.object({
    Id_Breakdown: z.number(),
    Name: z.string()
});
