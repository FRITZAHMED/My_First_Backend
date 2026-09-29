import { NotFoundError } from '../Utils/AppError.js';
import type {
	CreateBreakdownInput,
	ListBreakdownQuery,
	UpdateBreakdownInput,
} from '../Validators/breakdown.validator.js';
import { buildMeta, toSkipTake } from '../Utils/pagination.js';
import BreakdownRepository from '../repositories/BreakdownRepository.js';
import EquipmentRepository from '../repositories/EquipmentRepository.js';

const CLOSED_STATUSES = ['RESOLVED', 'CLOSED'] as const;

class BreakdownService {
	async createBreakdown(data: CreateBreakdownInput, reporterId: number) {
		if (data.idEquipment) {
			await this.assertEquipmentExists(data.idEquipment);
		}

		return BreakdownRepository.create({
			label: data.label,
			description: data.description ?? null,
			severity: data.severity,
			idEquipment: data.idEquipment ?? null,
			idUser: reporterId,
		});
	}

	async getBreakdownById(idBreakdown: number) {
		const breakdown = await BreakdownRepository.findById(idBreakdown);

		if (!breakdown) {
			throw new NotFoundError('Panne');
		}

		return breakdown;
	}

	async listBreakdowns(query: ListBreakdownQuery) {
		const { skip, take } = toSkipTake(query);
		const filters = { status: query.status };

		const [breakdowns, total] = await Promise.all([
			BreakdownRepository.findMany(skip, take, filters),
			BreakdownRepository.count(filters),
		]);

		return { breakdowns, meta: buildMeta(query, total) };
	}

	async updateBreakdown(idBreakdown: number, data: UpdateBreakdownInput) {
		await this.getBreakdownById(idBreakdown);

		if (data.idEquipment) {
			await this.assertEquipmentExists(data.idEquipment);
		}

		const becomesClosed =
			data.status !== undefined && CLOSED_STATUSES.includes(data.status as (typeof CLOSED_STATUSES)[number]);

		return BreakdownRepository.update(idBreakdown, {
			...(data.label !== undefined && { label: data.label }),
			...(data.description !== undefined && { description: data.description }),
			...(data.idEquipment !== undefined && { idEquipment: data.idEquipment }),
			...(data.status !== undefined && { status: data.status }),
			// resolvedAt est pose automatiquement a la cloture, efface a la reouverture.
			...(becomesClosed
				? { resolvedAt: data.resolvedAt ?? new Date() }
				: data.status !== undefined
					? { resolvedAt: null }
					: {}),
		});
	}

	async deleteBreakdown(idBreakdown: number) {
		await this.getBreakdownById(idBreakdown);
		return BreakdownRepository.delete(idBreakdown);
	}

	private async assertEquipmentExists(idEquipment: number) {
		const equipment = await EquipmentRepository.findById(idEquipment);

		if (!equipment) {
			throw new NotFoundError('Equipement');
		}
	}
}

export default new BreakdownService();
