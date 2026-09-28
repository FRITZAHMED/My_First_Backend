import { PrismaClient } from "@prisma/client";
import { CreateBreakdownInput } from "../Validators/breakdownValidator.js";

export type BreakdownCreateInput = {
    label: string;
    Description: string;
};

export type BreakdownUpdateInput = Partial<BreakdownCreateInput>;

class BreakdownRepository {
    private prisma = new PrismaClient();

    async create(BreakdownData: BreakdownCreateInput) {
        return this.prisma.breakdown.create({ data: BreakdownData });
    }

    async findById(idBreakdown:number){
        return this.prisma.breakdown.findUnique({
            where:{
                idBreakdown: Number(idBreakdown)
            }
        });
    }

    async findAll(){
        return this.prisma.breakdown.findMany({
            orderBy:{
                idBreakdown:'asc'
            }
        });
    }

    async Update(idBreakdown: number,BreakdownData:CreateBreakdownInput){
        return this.prisma.breakdown.update({
            where: {
                idBreakdown: Number(idBreakdown)
            },
            data:BreakdownData
        });
    }

    async Delete(idBreakdown: Number){
        return this.prisma.breakdown.delete({
            where:{
                idBreakdown: Number(idBreakdown)
            }
        });

    }
}

export default new BreakdownRepository();