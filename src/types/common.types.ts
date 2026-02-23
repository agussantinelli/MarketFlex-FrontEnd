export interface Pagination {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface PaginatedResponse<T> {
    status: string;
    data: T[];
    pagination: Pagination;
}
