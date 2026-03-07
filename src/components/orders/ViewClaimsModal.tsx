import styles from './styles/ViewClaimsModal.module.css';
import { LuX, LuInfo, LuCheck, LuClock } from 'react-icons/lu';

interface Claim {
    nroReclamo: number;
    motivo: string;
    descripcion: string;
    respuesta: string | null;
    estado: string;
    fecha: string | null;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    claims: Claim[];
    purchaseDate: string;
}

export default function ViewClaimsModal({ isOpen, onClose, claims, purchaseDate }: Props) {
    if (!isOpen) return null;

    const purchaseDateObj = new Date(purchaseDate);
    const now = new Date();
    const hoursDiff = (now.getTime() - purchaseDateObj.getTime()) / (1000 * 60 * 60);
    const isUnder72h = hoursDiff < 72;
    const remainingHours = Math.ceil(72 - hoursDiff);

    const getStatusIcon = (estado: string) => {
        switch (estado.toUpperCase()) {
            case 'PENDIENTE': return <LuClock className={styles.statusIconPending} />;
            case 'RESUELTO': return <LuCheck className={styles.statusIconSuccess} />;
            default: return <LuInfo className={styles.statusIconInfo} />;
        }
    };

    return (
        <div className={styles.modalOverlay} data-testid="view-claims-modal">
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Tus Reclamos</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <LuX size={20} />
                    </button>
                </div>

                <div className={styles.modalBody}>
                    <p className={styles.introText}>
                        Aquí podés ver el seguimiento de tus reclamos para esta compra.
                    </p>

                    {isUnder72h && (
                        <div className={styles.infoBox}>
                            <LuInfo size={18} />
                            <span>
                                <strong>Nota:</strong> Deben pasar 72hs desde la compra para iniciar nuevos reclamos.
                                (Restan {remainingHours}hs aprox.)
                            </span>
                        </div>
                    )}

                    <div className={styles.claimsList}>
                        {claims.map((claim) => (
                            <div key={claim.nroReclamo} className={styles.claimCard}>
                                <div className={styles.claimCardHeader}>
                                    <div className={styles.claimIdentify}>
                                        <span className={styles.claimNro}>Reclamo #{claim.nroReclamo}</span>
                                        <span className={`${styles.statusBadge} ${styles[claim.estado.toLowerCase()] || ''}`}>
                                            {getStatusIcon(claim.estado)}
                                            {claim.estado}
                                        </span>
                                    </div>
                                    {claim.fecha && (
                                        <span className={styles.claimDate}>
                                            {new Date(claim.fecha).toLocaleDateString()}
                                        </span>
                                    )}
                                </div>
                                <div className={styles.claimDetails}>
                                    <p><strong>Motivo:</strong> {claim.motivo}</p>
                                    <p className={styles.claimDesc}>{claim.descripcion}</p>
                                </div>
                                {claim.respuesta && (
                                    <div className={styles.adminResponse}>
                                        <strong>Respuesta del equipo:</strong>
                                        <p>{claim.respuesta}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.modalActions}>
                    <button onClick={onClose} className={styles.closeActionBtn}>
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
