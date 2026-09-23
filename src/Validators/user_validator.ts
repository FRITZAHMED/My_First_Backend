import {z} from "zod";

const Employer =z.object({
    Id_Employer:z.number(),
    Name:z.string(),
    Professional_email:z.string(),
    Password:z.string().max(8),
});

type ResgisterEmployer = z.infer<typeof Employer>;

const Supervisor =z.object({
    Id_Supervisor:z.number(),
    Name:z.string(),
    Professional_email:z.string(),
    Password:z.string()
});

type RegisterSupervisor = z.infer<typeof Supervisor>;

const LogistDepartement = z.object({
    Id_LogistiqueDepartement:z.number(),
    Name:z.string(),
    Professional_email:z.string(),
    Password:z.string()
})

type RegisterLogistDepartement = z.infer<typeof LogistDepartement>;

const Manager = z.object({
    Id_Manager:z.number(),
    Name:z.string(),
    Professional_email:z.string(),
    Password:z.string()
});

type RegisterManager = z.infer<typeof Manager>;

const AdministrationDepartement = z.object({
    Id_AdministrationDepartement:z.number(),
    Name:z.string(),
    Professional_email:z.string(),
    Password:z.string()
});

type RegisterAdministrationDepartemment = z.infer<typeof AdministrationDepartement>;




const Breakdown = z.object({
    Id_Breakdown:z.number(),
    Name:z.string()
})


type RegisterBreakdown = z.infer<typeof Breakdown>;
