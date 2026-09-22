import equipmentRepository from '../repositories/EquipmentRepository.js';

class EquipmentService {

    async createEquipment(equipmentData) {
        return equipmentRepository.create(equipmentData);
    }

    async getEquipmentById(idEquipment) {
        const equipment = await equipmentRepository.findById(idEquipment);

        if (!equipment) {
            throw new Error("Équipement introuvable");
        }

        return equipment;
    }

    async getAllEquipment() {
        return equipmentRepository.findAll();
    }

    async updateEquipment(idEquipment, equipmentData) {
        const equipment = await equipmentRepository.findById(idEquipment);

        if (!equipment) {
            throw new Error("Équipement introuvable");
        }

        return equipmentRepository.update(idEquipment, equipmentData);
    }

    async deleteEquipment(idEquipment) {
        const equipment = await equipmentRepository.findById(idEquipment);

        if (!equipment) {
            throw new Error("Équipement introuvable");
        }

        return equipmentRepository.delete(idEquipment);
    }
}

export default new EquipmentService();
