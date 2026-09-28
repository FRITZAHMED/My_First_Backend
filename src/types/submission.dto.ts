import type { submission } from '@prisma/client';

export interface SubmissionResponseDTO {
	idUser: number;
	idRequest: number;
}

export function toSubmissionDTO(submissionData: submission): SubmissionResponseDTO {
	return {
		idUser: submissionData.idUser,
		idRequest: submissionData.idRequest,
	};
}