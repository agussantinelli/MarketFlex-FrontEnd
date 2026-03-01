import { useState, useEffect } from 'react';
import {
    LuTriangleAlert,
    LuCalendar,
    LuUser,
    LuShoppingBag,
    LuChevronRight,
    LuClock,
    LuCircleCheck,
    LuInbox,
    LuMessageSquare,
    LuSearch,
    LuFilter
} from 'react-icons/lu';
import { claimsService } from '../../services/claims.service';
import type { Claim } from '../../types/claims.types';
import styles from './styles/ClaimsListView.module.css';

const ClaimCard = ({ claim }: { claim: Claim }) => {
    const getStatusStyle = (estado: string) => {
        switch (estado.toUpperCase()) {
            case 'PENDIENTE': return styles.statusPending;
            case 'EN_PROCESO': return styles.statusProcessing;
            case 'RESUELTO': return styles.statusResolved;
            default: return styles.statusDefault;
        }
    };

    const getStatusIcon = (estado: string) => {
        switch (estado.toUpperCase()) {
            case 'PENDIENTE': return <LuClock size={16} />;
            case 'EN_PROCESO': return <LuMessageSquare size={16} />;
            case 'RESUELTO': return <LuCircleCheck size={16} />;
            default: return <LuInbox size={16} />;
        }
    };

    return (
        <div className={styles.claimCard}>
            <div className={styles.cardHeader}>
                <div className={`${styles.statusBadge} ${getStatusStyle(claim.estado)}`}>
                    {getStatusIcon(claim.estado)}
                    <span>{claim.estado}</span>
                </div>
                <span className={styles.claimDate}>
                    <LuCalendar size={14} />
                    {new Date(claim.fecha).toLocaleDateString()}
                </span>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.motivo}>{claim.motivo}</h3>
                <p className={styles.descripcion}>{claim.descripcion}</p>

                {claim.respuesta && (
                    <div className={styles.respuestaSection}>
                        <div className={styles.respuestaLabel}>
                            <LuMessageSquare size={14} />
                            <span>Respuesta Administrador</span>
                        </div>
                        <p className={styles.respuestaText}>{claim.respuesta}</p>
                    </div>
                )}
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.userInfo}>
                    <LuUser size={16} />
                    <span>{claim.usuarioNombre}</span>
                </div>
                <div className={styles.purchaseLink}>
                    <LuShoppingBag size={16} />
                    <span>#{claim.compraId.substring(0, 8).toUpperCase()}</span>
                </div>
            </div>

            <button className={styles.detailsButton}>
                Ver detalles completas
                <LuChevronRight size={18} />
            </button>
        </div>
    );
};

const ClaimsListView = () => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                const data = await claimsService.getAll();
                setClaims(data);
            } catch (error) {
                console.error('Error fetching claims:', error);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'No se pudieron cargar los reclamos');
                }
            } finally {
                setLoading(false);
                if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
            }
        };

        fetchClaims();
    }, []);

    const filteredClaims = claims.filter(claim => {
        const matchesSearch =
            claim.motivo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            claim.usuarioNombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterStatus === 'ALL' || claim.estado.toUpperCase() === filterStatus;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <LuTriangleAlert className={styles.titleIcon} size={40} />
                    <div>
                        <h1>Gestión de Reclamos</h1>
                        <p>Supervisá y resolvé las incidencias de los clientes en tiempo real.</p>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <LuSearch className={styles.searchIcon} size={22} />
                    <input
                        type="text"
                        placeholder="Motivo, cliente o nro de compra..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterWrapper}>
                    <LuFilter className={styles.filterIcon} size={22} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="ALL">Cualquier estado</option>
                        <option value="PENDIENTE">Pendientes</option>
                        <option value="EN_PROCESO">En Proceso</option>
                        <option value="RESUELTO">Resueltos</option>
                    </select>
                </div>
            </div>

            <div className={styles.grid}>
                {filteredClaims.length > 0 ? (
                    filteredClaims.map((claim) => (
                        <ClaimCard key={`${claim.compraId}-${claim.nroReclamo}`} claim={claim} />
                    ))
                ) : !loading && (
                    <div className={styles.emptyState}>
                        <LuInbox size={80} style={{ opacity: 0.2 }} />
                        <p>No se encontraron reclamos que coincidan con los criterios.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClaimsListView;
