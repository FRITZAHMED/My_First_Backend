import type { Request, Response } from 'express';
import LicenseService from '../services/LicenseService.js';
import { asyncHandler } from '../Utils/asyncHandler.js';

class LicenseController {
  getAll = asyncHandler(
    async (req: Request, res: Response) => {
    const result = await LicenseService.getAll(req.query as any);
    res.status(200).json({ success: true, ...result });
  });

  getById = asyncHandler(
    async (req: Request, res: Response) => {
    const idLicense = Number(req.params.idLicense);
    const license = await LicenseService.getById(idLicense);
    res.status(200).json({ success: true, data: license });
  });

  create = asyncHandler(
    async (req: Request, res: Response) => {
    const license = await LicenseService.create(req.body);
    res.status(201).json({ success: true, message: 'Licence créée avec succès', data: license });
  });

  update = asyncHandler(
    async (req: Request, res: Response) => {
    const idLicense = Number(req.params.idLicense);
    const license = await LicenseService.update(idLicense, req.body);
    res.status(200).json({ success: true, message: 'Licence modifiée avec succès', data: license });
  });

  delete = asyncHandler(
    async (req: Request, res: Response) => {
    const idLicense = Number(req.params.idLicense);
    await LicenseService.delete(idLicense);
    res.status(200).json({ success: true, message: 'Licence supprimée avec succès' });
  });

  getStats = asyncHandler(
    async (req: Request, res: Response) => {
    const stats = await LicenseService.getStats();
    res.status(200).json({ success: true, data: stats });
  });
}

export default new LicenseController();