import prisma from '../config/Database.js';
class EquipmentRepository {
    async create(equipmentData) {
        return prisma.equipment.create({
            data: equipmentData
        });
    }
    async findById(idEquipment) {
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
    async update(idEquipment, equipmentData) {
        return prisma.equipment.update({
            where: {
                idEquipment: Number(idEquipment)
            },
            data: equipmentData
        });
    }
    async delete(idEquipment) {
        return prisma.equipment.delete({
            where: {
                idEquipment: Number(idEquipment)
            }
        });
    }
}
export default new EquipmentRepository();
