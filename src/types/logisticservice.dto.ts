import type { logisticservice } from '@prisma/client';

export interface LogisticServiceResponseDTO {
	idLogisticService: number;
	idRequest: number;
	professionalEmail: string;
}

export function toLogisticServiceDTO(service: logisticservice): LogisticServiceResponseDTO {
	return {
		idLogisticService: service.idLogisticService,
		idRequest: service.idRequest,
		professionalEmail: service.professionalEmail,
	};
}