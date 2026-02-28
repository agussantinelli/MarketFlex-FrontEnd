import { useState, useEffect } from 'react';
import type { AdminUser, PaginatedResponse } from '../../types/admin.types';
import { AdminService } from '../../services/admin.service';
import DataTable, { type Column } from './DataTable';
import { getImageUrl } from '../../lib/url';
import styles from './styles/SalesListView.module.css';


export default function UsersListView() {
    const [usersData, setUsersData] = useState<PaginatedResponse<AdminUser> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');

    const fetchUsers = async () => {
        setLoading(true);
        const data = await AdminService.getUsers(page, 10, search, sort);
        setUsersData(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, sort]);

    const handleEdit = (user: AdminUser) => {
        // Placeholder for edit functionality
        console.log('Edit user:', user.id);
        alert(`Editar usuario funcionalmente no implementado aún para el ID: ${user.id}`);
    };

    const handleDelete = (user: AdminUser) => {
        // Placeholder for delete functionality
        console.log('Delete user:', user.id);
        if (confirm(`¿Estás seguro que deseas eliminar al usuario ${user.nombre} ${user.apellido}?`)) {
            alert(`Eliminar usuario funcionalmente no implementado aún para el ID: ${user.id}`);
        }
    };

    const columns: Column<AdminUser>[] = [
        {
            header: 'Foto',
            accessor: (user: AdminUser) => (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', backgroundColor: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {user.foto ? (
                        <img
                            src={getImageUrl(user.foto)}
                            alt={`${user.nombre} ${user.apellido}`}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.parentElement!.innerHTML = '<span style="color: var(--text-muted); font-size: 1.2rem;">👤</span>';
                            }}
                        />
                    ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>👤</span>
                    )}
                </div>
            ),
        },
        {
            header: 'Nombre',
            accessor: (user: AdminUser) => <span style={{ fontWeight: 500, color: 'var(--text-main)' }}>{user.nombre} {user.apellido}</span>,
        },
        {
            header: 'Email',
            accessor: (user: AdminUser) => <span style={{ color: 'var(--text-muted)' }}>{user.email}</span>,
        },
        {
            header: 'Rol',
            accessor: (user: AdminUser) => (
                <span style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: user.rol === 'admin' ? 'rgba(0, 255, 136, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: user.rol === 'admin' ? 'var(--neon-green)' : 'var(--text-muted)',
                    border: user.rol === 'admin' ? '1px solid rgba(0, 255, 136, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {user.rol}
                </span>
            ),
        },
        {
            header: 'Registro',
            accessor: (user: AdminUser) => <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(user.creadoEn).toLocaleDateString()}</span>,
        },
    ];

    const sortOptions = [
        { label: 'Más Recientes', value: 'newest' },
        { label: 'Más Antiguos', value: 'oldest' },
        { label: 'Nombre (A-Z)', value: 'name_asc' },
        { label: 'Nombre (Z-A)', value: 'name_desc' },
    ];

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Gestión de Usuarios</h1>
                    <p>Controla las cuentas, roles y actividad de los usuarios</p>
                </div>
            </header>

            <DataTable
                title=""
                data={usersData?.data || []}
                columns={columns}
                loading={loading}
                searchPlaceholder="Buscar por nombre o email..."
                onSearch={(term) => {
                    setSearch(term);
                    setPage(1);
                }}
                customFilters={
                    <select
                        style={{
                            padding: '10px 16px',
                            paddingRight: '40px',
                            width: '210px',
                            background: '#1e293b url("data:image/svg+xml;charset=UTF-8,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%2300ff9d\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpolyline points=\'6 9 12 15 18 9\'%3E%3C/polyline%3E%3C/svg%3E") no-repeat right 16px center',
                            backgroundSize: '16px',
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            MozAppearance: 'none',
                            color: '#00ff9d',
                            border: '1px solid #00ff9d',
                            borderRadius: '8px',
                            outline: 'none',
                            cursor: 'pointer',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            boxShadow: '0 0 10px rgba(0, 255, 157, 0.1)'
                        }}
                        value={sort}
                        onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                        }}
                    >
                        {sortOptions.map(option => (
                            <option key={option.value} value={option.value}>{option.label}</option>
                        ))}
                    </select>
                }
                pagination={{
                    total: usersData?.pagination.total || 0,
                    page: page,
                    limit: 10,
                    onPageChange: setPage,
                }}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />
        </div>
    );
}
