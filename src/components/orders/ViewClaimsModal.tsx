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

export default function ViewClaimsModal({ isOpen, onClose, claims }: Props) {
    if (!isOpen) return null;

    const getLatestClaimDate = () => {
        if (!claims || claims.length === 0) return null;
        return claims.reduce((latest, current) => {
            if (!current.fecha) return latest;
            const currentDate = new Date(current.fecha);
            if (!latest || isNaN(latest.getTime())) return currentDate;
            return currentDate > latest ? currentDate : latest;
        }, null as Date | null);
    };

    const lastClaimDate = getLatestClaimDate();
    const now = new Date();

    // UTC-to-UTC comparison in absolute milliseconds
    const nowMs = now.getTime();
    const lastClaimMs = lastClaimDate ? lastClaimDate.getTime() : 0;
    const diffMs = nowMs - lastClaimMs;
    const hoursDiff = diffMs / (1000 * 60 * 60);

    // 72h cool-down period between claims
    const isUnder72h = lastClaimDate && !isNaN(lastClaimMs) && hoursDiff < 72;
    const remainingHours = lastClaimDate ? Math.max(0, Math.ceil(72 - hoursDiff)) : 0;

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
                                <strong>Nota:</strong> Deben pasar 72hs desde tu último reclamo para iniciar uno nuevo.
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
