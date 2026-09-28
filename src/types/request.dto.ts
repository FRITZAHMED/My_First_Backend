import type { request } from '@prisma/client';

export interface RequestResponseDTO {
	idRequest: number;
	description: string | null;
	creationDate: Date | null;
}

export function toRequestDTO(requestData: request): RequestResponseDTO {
	return {
		idRequest: requestData.idRequest,
		description: requestData.description,
		creationDate: requestData.creationDate,
	};
}