import { useState, useEffect } from 'react';
import type { AdminUser, PaginatedResponse } from '../../types/admin.types';
import { AdminService } from '../../services/admin.service';
import { LuUser, LuPlus, LuPackage } from 'react-icons/lu';
import DataTable, { type Column } from './DataTable';
import UserPurchasesModal from './UserPurchasesModal';
import { getImageUrl } from '../../lib/url';
import styles from './styles/SalesListView.module.css';
import dashboardStyles from './styles/dashboard.module.css';




export default function UsersListView() {
    const [usersData, setUsersData] = useState<PaginatedResponse<AdminUser> | null>(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('newest');
    const [selectedUserForPurchases, setSelectedUserForPurchases] = useState<AdminUser | null>(null);

    const fetchUsers = async () => {
        if ((window as any).showAdminLoader) (window as any).showAdminLoader();
        setLoading(true);
        const data = await AdminService.getUsers(page, 10, search, sort);
        if (!data) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al cargar los usuarios');
            }
        }
        setUsersData(data);
        setLoading(false);
        if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
    };

    useEffect(() => {
        fetchUsers();
    }, [page, search, sort]);

    const handleEdit = (user: AdminUser) => {
        window.location.href = `/admin/users/${user.id}`;
    };

    const handleDelete = (user: AdminUser) => {
        // Placeholder for delete functionality
        console.log('Delete user:', user.id);
        if ((window as any).triggerSileo) {
            (window as any).triggerSileo('error', `Eliminar usuario funcionalmente no implementado aún para el ID: ${user.id}`);
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
                                e.currentTarget.parentElement!.innerHTML = '<div style="color: var(--text-muted); font-size: 1.2rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%;"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg></div>';
                            }}
                        />
                    ) : (
                        <LuUser style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }} />
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
                    backgroundColor: user.rol === 'admin' ? 'rgba(0, 255, 136, 0.1)' : user.rol === 'seller' ? 'rgba(168, 85, 247, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                    color: user.rol === 'admin' ? 'var(--neon-green)' : user.rol === 'seller' ? '#a855f7' : 'var(--text-muted)',
                    border: user.rol === 'admin' ? '1px solid rgba(0, 255, 136, 0.2)' : user.rol === 'seller' ? '1px solid rgba(168, 85, 247, 0.2)' : '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                    {user.rol === 'admin' ? 'Administrador' : user.rol === 'seller' ? 'Vendedor' : 'Cliente'}
                </span>
            ),
        },
        {
            header: 'Registro',
            accessor: (user: AdminUser) => <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{new Date(user.creadoEn).toLocaleDateString()}</span>,
        },
        {
            header: 'Compras',
            accessor: (user: AdminUser) => (
                <button
                    onClick={() => setSelectedUserForPurchases(user)}
                    style={{
                        background: 'rgba(0, 255, 136, 0.1)',
                        color: 'var(--neon-green)',
                        border: '1px solid rgba(0, 255, 136, 0.2)',
                        padding: '6px 12px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.2)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0, 255, 136, 0.1)';
                        e.currentTarget.style.transform = 'translateY(0)';
                    }}
                >
                    <LuPackage size={14} />
                    Ver
                </button>
            ),
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
                    <div className={dashboardStyles.dashboardHeader}>
                        <h1>Gestión de Usuarios</h1>
                        <a href="/admin/users/new" className={dashboardStyles.createButton} style={{ textDecoration: 'none' }}>
                            <LuPlus /> Nuevo Usuario
                        </a>
                    </div>
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
                        className={styles.sortSelect}
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

            {selectedUserForPurchases && (
                <UserPurchasesModal
                    userId={selectedUserForPurchases.id}
                    userName={`${selectedUserForPurchases.nombre} ${selectedUserForPurchases.apellido}`}
                    onClose={() => setSelectedUserForPurchases(null)}
                />
            )}
        </div>
    );
}
