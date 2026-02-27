export type Pagination = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
};

export type PaginatedResponse<T> = {
    status: string;
    data: T[];
    pagination: Pagination;
};
