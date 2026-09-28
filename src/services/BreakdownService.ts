import { breakdown } from "@prisma/client";
import BreakdownRepository from "../repositories/BreakdownRepository.js";

type BreakdownInput = {
    label:string,
    Description:string
};

type BreakdownUpdateInput = Partial<BreakdownInput>;

class BreakdownService {

    async createBreakdown(BreakdownData:BreakdownInput){
      return BreakdownRepository.create(BreakdownData);
    }

    async getBreakdownById(idBreakdown:number){
       const Breakdown = await BreakdownRepository.findById(idBreakdown);

       if(!Breakdown){
         throw new Error("Panne Detecter");
       }

       return Breakdown;
    }

    async getAllBreakdown(){
        return BreakdownRepository.findAll();
    }

    async UpdateBreakdown(idBreakdown:number,BreakdownData:BreakdownUpdateInput){
        const UpdateBreakdown = await BreakdownRepository.findById(idBreakdown);

        if(!UpdateBreakdown){
            throw new Error("Panne introuvable");
        }

        return BreakdownRepository.Update(idBreakdown,BreakdownData);
    }

    async DeleteBreakdown(idBreakdown:number){
        const DeleteBreakdown = await BreakdownRepository.Delete(idBreakdown);

        if(!DeleteBreakdown){
            throw new Error("Panne Introuvable");
        }

        return BreakdownRepository.Delete(idBreakdown);
    }
}

export default new BreakdownService();