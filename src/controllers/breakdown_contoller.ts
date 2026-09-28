import type { NextFunction, Request, Response } from 'express';
import BreakdownService from '../services/BreakdownService.js';
import { toBreakdown } from '../types/Breakdown.dto.js';
import { date, success } from 'zod';


class BreakdownController {
    async RegisterBreakdown( Req:Request,Res:Response,Next:NextFunction): Promise<void>{
        try{
            const NewBreakdown = await BreakdownService.createBreakdown(Req.body);

            Res.status(201).json({
                success:true,
                message:"Creation de la Panne",
                data: toBreakdown(NewBreakdown),
            });
        }catch(error){
          Next(error);
        }
    }

    async GetBreakdown( Req:Request,Res:Response,Next:NextFunction): Promise<void>{
        try{
            const AllBreakdown = await BreakdownService.getBreakdownById(Number(Req.params.id));

            Res.status(200).json({
                success:true,
                data:toBreakdown(AllBreakdown),
            });
        }catch(error){
            Next(error);
        }
    }
}

export default new BreakdownController();