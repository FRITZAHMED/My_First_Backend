import { z } from 'zod';

export const paginationQuerySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export interface PaginationMeta {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
}

export function toSkipTake({ page, limit }: PaginationQuery): { skip: number; take: number } {
	return { skip: (page - 1) * limit, take: limit };
}

export function buildMeta({ page, limit }: PaginationQuery, total: number): PaginationMeta {
	const totalPages = Math.max(1, Math.ceil(total / limit));

	return {
		page,
		limit,
		total,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
	};
}
