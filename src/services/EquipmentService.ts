import equipmentRepository from '../repositories/EquipmentRepository.js';

type EquipmentInput = {
    description: string ;
    serialNumber: string ;
};

type EquipmentUpdateInput = Partial<EquipmentInput>;

class EquipmentService {

    async createEquipment(equipmentData: EquipmentInput) {
        return equipmentRepository.create(equipmentData);
    }

    async getEquipmentById(idEquipment: number) {
        const equipment = await equipmentRepository.findById(idEquipment);

        if (!equipment) {
            throw new Error("Équipement introuvable");
        }

        return equipment;
    }

    async getAllEquipment() {
        return equipmentRepository.findAll();
    }

    async updateEquipment(idEquipment: number, equipmentData: EquipmentUpdateInput) {
        const equipment = await equipmentRepository.findById(idEquipment);

        if (!equipment) {
            throw new Error("Équipement introuvable");
        }

        return equipmentRepository.update(idEquipment, equipmentData);
    }

    async deleteEquipment(idEquipment: number) {
        const equipment = await equipmentRepository.findById(idEquipment);

        if (!equipment) {
            throw new Error("Équipement introuvable");
        }

        return equipmentRepository.delete(idEquipment);
    }
}

export default new EquipmentService();
