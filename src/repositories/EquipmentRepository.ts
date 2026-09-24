import { prisma } from '../Config/Database.js';

export type EquipmentCreateInput = {
    description: string;
    serialNumber: string;
};

export type EquipmentUpdateInput = Partial<EquipmentCreateInput>;

class EquipmentRepository {

    async create(equipmentData: EquipmentCreateInput) {
        return prisma.equipment.create({
            data: equipmentData
        });
    }

    async findById(idEquipment: number) {
        return prisma.equipment.findUnique({
            where: {
                idEquipment: Number(idEquipment)
            }
        });
    }

    async findAll() {
        return prisma.equipment.findMany({
            orderBy: {
                idEquipment: 'asc'
            }
        });
    }

    async update(idEquipment: number, equipmentData: EquipmentUpdateInput) {
        return prisma.equipment.update({
            where: {
                idEquipment: Number(idEquipment)
            },
            data: equipmentData
        });
    }

    async delete(idEquipment: number) {
        return prisma.equipment.delete({
            where: {
                idEquipment: Number(idEquipment)
            }
        });
    }
}

export default new EquipmentRepository();
