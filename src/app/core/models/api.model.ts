/** Envelope de paginacao padrao (secao 1.3 do API_SPEC.md). */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Formato de erro padrao (secao 1.2 do API_SPEC.md). */
export interface ApiErrorDetail {
  field: string;
  message: string;
}

export interface ApiErrorBody {
  statusCode: number;
  error: string;
  message: string;
  details?: ApiErrorDetail[];
}
