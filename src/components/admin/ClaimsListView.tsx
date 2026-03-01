import { useState, useEffect } from 'react';
import {
    AlertCircle,
    Calendar,
    User,
    ShoppingBag,
    ChevronRight,
    Clock,
    CheckCircle2,
    Inbox,
    MessageSquare,
    Search,
    Filter
} from 'lucide-react';
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
            case 'PENDIENTE': return <Clock size={14} />;
            case 'EN_PROCESO': return <MessageSquare size={14} />;
            case 'RESUELTO': return <CheckCircle2 size={14} />;
            default: return <Inbox size={14} />;
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
                    <Calendar size={14} />
                    {new Date(claim.fecha).toLocaleDateString()}
                </span>
            </div>

            <div className={styles.cardBody}>
                <h3 className={styles.motivo}>{claim.motivo}</h3>
                <p className={styles.descripcion}>{claim.descripcion}</p>

                {claim.respuesta && (
                    <div className={styles.respuestaSection}>
                        <div className={styles.respuestaLabel}>
                            <MessageSquare size={14} />
                            <span>Respuesta Administrador</span>
                        </div>
                        <p className={styles.respuestaText}>{claim.respuesta}</p>
                    </div>
                )}
            </div>

            <div className={styles.cardFooter}>
                <div className={styles.userInfo}>
                    <User size={14} />
                    <span>{claim.usuarioNombre}</span>
                </div>
                <div className={styles.purchaseLink}>
                    <ShoppingBag size={14} />
                    <span>Nro Compra: {claim.compraId.substring(0, 8)}...</span>
                </div>
            </div>

            <button className={styles.detailsButton}>
                Ver detalles
                <ChevronRight size={16} />
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
                const data = await claimsService.getAll();
                setClaims(data);
            } catch (error) {
                console.error('Error fetching claims:', error);
            } finally {
                setLoading(false);
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

    if (loading) {
        return <div className={styles.loading}>Cargando reclamos...</div>;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.titleInfo}>
                    <AlertCircle className={styles.titleIcon} size={32} />
                    <div>
                        <h1>Gestión de Reclamos</h1>
                        <p>Visualiza y gestiona las incidencias reportadas por los clientes.</p>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <div className={styles.searchWrapper}>
                    <Search className={styles.searchIcon} size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por motivo o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                </div>

                <div className={styles.filterWrapper}>
                    <Filter className={styles.filterIcon} size={20} />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className={styles.filterSelect}
                    >
                        <option value="ALL">Todos los estados</option>
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
                ) : (
                    <div className={styles.emptyState}>
                        <Inbox size={48} />
                        <p>No se encontraron reclamos que coincidan con la búsqueda.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ClaimsListView;
