import LicenseRepository from '../repositories/LicenseRepository.js';
import { NotFoundError, ConflictError } from '../Utils/AppError.js';
import type { license_status, Prisma } from '@prisma/client';

type LicenseCreateInput = Prisma.licenseCreateInput;
type LicenseUpdateInput = Prisma.licenseUpdateInput;

class LicenseService {
  async getAll(params: {
    page?: number;
    limit?: number;
    status?: license_status;
    equipmentId?: number;
  } = {}) {
    return LicenseRepository.findAll(params);
  }

  async getById(idLicense: number) {
    const license = await LicenseRepository.findById(idLicense);
    if (!license) throw new NotFoundError('Licence');
    return license;
  }

  async create(data: LicenseCreateInput) {
    const existing = await LicenseRepository.findByLicenseNumber(data.licenseNumber);
    if (existing) throw new ConflictError('Ce numéro de licence est déjà utilisé');

    const equipmentLicense = await LicenseRepository.findByEquipmentId(data.idEquipment);
    if (equipmentLicense) throw new ConflictError('Cet équipement a déjà une licence');

    return LicenseRepository.create(data);
  }

  async update(idLicense: number, data: LicenseUpdateInput) {
    await this.getById(idLicense);

    if (data.licenseNumber) {
      const existing = await LicenseRepository.findByLicenseNumber(data.licenseNumber);
      if (existing && existing.idLicense !== idLicense) {
        throw new ConflictError('Ce numéro de licence est déjà utilisé');
      }
    }

    if (data.idEquipment) {
      const existing = await LicenseRepository.findByEquipmentId(data.idEquipment);
      if (existing && existing.idLicense !== idLicense) {
        throw new ConflictError('Cet équipement a déjà une licence');
      }
    }

    return LicenseRepository.update(idLicense, data);
  }

  async delete(idLicense: number) {
    await this.getById(idLicense);
    return LicenseRepository.delete(idLicense);
  }

  async getStats() {
    return LicenseRepository.countByStatus();
  }
}

export default new LicenseService();