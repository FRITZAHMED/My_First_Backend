import { Prisma, user } from "@prisma/client";

export interface BreakdownResponseDTO{
    label:string,
    Description:string,
    user:user[]
}

export function toBreakdown(Breakdown: Prisma.breakdownGetPayload<{ include: { user: true } }>): BreakdownResponseDTO {
    return {
        label: Breakdown.label ?? "",
        Description: Breakdown.description ?? "",
        user: Breakdown.user
    };

}