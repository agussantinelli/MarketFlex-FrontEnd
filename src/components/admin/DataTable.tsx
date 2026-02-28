import React from 'react';
import { LuPencil, LuTrash2, LuChevronLeft, LuChevronRight, LuSearch, LuPlus } from 'react-icons/lu';
import styles from './styles/DataTable.module.css';
import LoadingSpinner from '../common/LoadingSpinner';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    width?: string;
}

interface Pagination {
    total: number;
    page: number;
    limit: number;
    onPageChange: (page: number) => void;
}

interface DataTableProps<T> {
    title?: string;
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onAdd?: () => void;
    pagination?: Pagination;
    searchPlaceholder?: string;
    onSearch?: (term: string) => void;
    searchTerm?: string;
    customFilters?: React.ReactNode;
}

function DataTable<T extends { id: string | number }>({
    title,
    data,
    columns,
    loading = false,
    onEdit,
    onDelete,
    onAdd,
    pagination,
    searchPlaceholder = 'Buscar...',
    onSearch,
    searchTerm = '',
    customFilters
}: DataTableProps<T>) {

    const totalPages = pagination ? Math.ceil(pagination.total / pagination.limit) : 0;

    return (
        <div className={styles.tableWrapper}>
            <div className={styles.tableHeader}>
                <div className={styles.headerLeft}>
                    {title && <h2>{title}</h2>}
                    {onSearch && (
                        <div className={styles.searchBar}>
                            <LuSearch className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder={searchPlaceholder}
                                value={searchTerm}
                                onChange={(e) => onSearch(e.target.value)}
                            />
                        </div>
                    )}
                    {customFilters}
                </div>
                {onAdd && (
                    <button
                        className={styles.addBtn}
                        onClick={onAdd}
                        style={{
                            border: '1px solid var(--neon-green)',
                            background: 'rgba(0, 255, 157, 0.05)',
                            color: 'var(--neon-green)',
                            padding: '10px 16px',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontWeight: '600',
                            fontSize: '0.95rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            boxShadow: '0 0 10px rgba(0, 255, 157, 0.1)'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.15)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.05)';
                            e.currentTarget.style.transform = 'translateY(0)';
                        }}
                    >
                        <LuPlus />
                        <span>Nuevo</span>
                    </button>
                )}
            </div>

            <div className={styles.tableContainer}>
                {loading && (
                    <div className={styles.loadingOverlay}>
                        <LoadingSpinner />
                    </div>
                )}

                <table className={styles.table}>
                    <thead>
                        <tr>
                            {columns.map((col, idx) => (
                                <th key={idx} style={{ width: col.width }}>
                                    {col.header}
                                </th>
                            ))}
                            {(onEdit || onDelete) && <th className={styles.actionsHeader}>Acciones</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.length === 0 && !loading ? (
                            <tr>
                                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className={styles.emptyCell}>
                                    No se encontraron resultados
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id}>
                                    {columns.map((col, idx) => (
                                        <td key={idx} className={col.className}>
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : (item[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className={styles.actionsCell}>
                                            <div className={styles.actionsWrapper}>
                                                {onEdit && (
                                                    <button
                                                        className={styles.editBtn}
                                                        onClick={() => onEdit(item)}
                                                        title="Editar"
                                                    >
                                                        <LuPencil />
                                                    </button>
                                                )}
                                                {onDelete && (
                                                    <button
                                                        className={styles.deleteBtn}
                                                        onClick={() => onDelete(item)}
                                                        title="Eliminar"
                                                    >
                                                        <LuTrash2 />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {pagination && pagination.total > pagination.limit && (
                <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                        Mostrando <b>{Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)}</b> a <b>{Math.min(pagination.page * pagination.limit, pagination.total)}</b> de <b>{pagination.total}</b>
                    </div>
                    <div className={styles.paginationControls}>
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => pagination.onPageChange(pagination.page - 1)}
                        >
                            <LuChevronLeft />
                        </button>
                        <span className={styles.pageNum}>Página {pagination.page} de {totalPages}</span>
                        <button
                            disabled={pagination.page >= totalPages}
                            onClick={() => pagination.onPageChange(pagination.page + 1)}
                        >
                            <LuChevronRight />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DataTable;
