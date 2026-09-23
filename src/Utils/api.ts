import type { PaginationMeta } from '../Utils/pagination.ts';
 
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: Array<{ field: string; message: string }>;
}