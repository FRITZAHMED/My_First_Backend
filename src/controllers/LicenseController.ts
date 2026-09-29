import type { Request, Response } from 'express';
import LicenseService from '../services/LicenseService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';
import type {CreateLicenseInput,ListLicensesQuery,UpdateLicenseInput} from '../Validators/license.validator.js';

class LicenseController {
	create = asyncHandler(async (req: Request, res: Response) => {
		const license = await LicenseService.create(req.body as CreateLicenseInput);
		res.status(201).json({ success: true, message: 'Licence créée', data: license });
	});

	getAll = asyncHandler(async (req: Request, res: Response) => {
		const { data, meta } = await LicenseService.getAll(req.query as unknown as ListLicensesQuery);
		res.status(200).json({ success: true, data, meta });
	});

	getById = asyncHandler(async (req: Request, res: Response) => {
		const license = await LicenseService.getById(Number(req.params.idLicense));
		res.status(200).json({ success: true, data: license });
	});

	update = asyncHandler(async (req: Request, res: Response) => {
		const license = await LicenseService.update(Number(req.params.idLicense), req.body as UpdateLicenseInput);
		res.status(200).json({ success: true, message: 'Licence mise à jour', data: license });
	});

	delete = asyncHandler(async (req: Request, res: Response) => {
		await LicenseService.delete(Number(req.params.idLicense));
		res.status(200).json({ success: true, message: 'Licence supprimée' });
	});

	getStats = asyncHandler(async (_req: Request, res: Response) => {
		const stats = await LicenseService.getStats();
		res.status(200).json({ success: true, data: stats });
	});
}

export default new LicenseController();