import { NotFoundError } from '../Utils/AppError.js';
import type { CreateEquipmentInput, ListEquipmentQuery, UpdateEquipmentInput } from '../Validators/equipment.validator.js';
import { buildMeta, toSkipTake } from '../Utils/pagination.js';
import EquipmentRepository from '../repositories/EquipmentRepository.js';
import UserRepository from '../repositories/UserRepository.js';

class EquipmentService {
	async createEquipment(data: CreateEquipmentInput) {
		if (data.idUser) {
			await this.assertUserExists(data.idUser);
		}

		return EquipmentRepository.create(data);
	}

	async getEquipmentById(idEquipment: number) {
		const equipment = await EquipmentRepository.findById(idEquipment);

		if (!equipment) {
			throw new NotFoundError('Equipement');
		}

		return equipment;
	}

	async listEquipment(query: ListEquipmentQuery) {
		const { skip, take } = toSkipTake(query);
		const filters = { status: query.status };

		const [equipment, total] = await Promise.all([
			EquipmentRepository.findMany(skip, take, filters),
			EquipmentRepository.count(filters),
		]);

		return { equipment, meta: buildMeta(query, total) };
	}

	async updateEquipment(idEquipment: number, data: UpdateEquipmentInput) {
		await this.getEquipmentById(idEquipment);

		if (data.idUser) {
			await this.assertUserExists(data.idUser);
		}

		return EquipmentRepository.update(idEquipment, data);
	}

	async deleteEquipment(idEquipment: number) {
		await this.getEquipmentById(idEquipment);
		return EquipmentRepository.delete(idEquipment);
	}

	private async assertUserExists(idUser: number) {
		const user = await UserRepository.findById(idUser);

		if (!user) {
			throw new NotFoundError('Utilisateur');
		}
	}
}

export default new EquipmentService();
