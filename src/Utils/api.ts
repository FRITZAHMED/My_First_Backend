import type { PaginationMeta } from './pagination.js';

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	meta?: PaginationMeta;
	errors?: Array<{ field: string; message: string }>;
}

export function ok<T>(data: T, message?: string): ApiResponse<T> {
	return message === undefined ? { success: true, data } : { success: true, message, data };
}

export function created<T>(data: T, message?: string): ApiResponse<T> {
	return message === undefined ? { success: true, data } : { success: true, message, data };
}

export function paginated<T>(data: T[], meta: PaginationMeta): ApiResponse<T[]> {
	return { success: true, data, meta };
}
