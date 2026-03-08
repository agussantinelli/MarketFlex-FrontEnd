import React, { useState } from 'react';
import { claimsService } from '../../services/claims.service';
import styles from './styles/ClaimModal.module.css';
import { LuX } from 'react-icons/lu';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    purchaseId: string;
    purchaseDate: string;
    claims?: any[];
    onSuccess: () => void;
}

export default function ClaimModal({ isOpen, onClose, purchaseId, purchaseDate, claims = [], onSuccess }: Props) {
    const [motivo, setMotivo] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [loading, setLoading] = useState(false);

    const getLatestClaimDate = () => {
        if (!claims || claims.length === 0) return null;
        return claims.reduce((latest, current) => {
            if (!current.fecha) return latest;
            const currentDate = new Date(current.fecha);
            if (!latest || isNaN(latest.getTime())) return currentDate;
            return currentDate > latest ? currentDate : latest;
        }, null as Date | null);
    };

    const latestClaimDate = getLatestClaimDate();
    const isFromPurchase = !latestClaimDate;
    const lastDate = latestClaimDate || new Date(purchaseDate);
    const now = new Date();

    // Absolute UTC-to-UTC comparison
    const nowMs = now.getTime();
    const lastDateMs = lastDate ? lastDate.getTime() : 0;
    const diffMs = nowMs - lastDateMs;
    const hoursDiff = diffMs / (1000 * 60 * 60);

    // Restriction applies if there are claims (72h between claims) OR since purchase
    const isTimeRestricted = lastDate && !isNaN(lastDateMs) && hoursDiff < 72;
    const remainingHours = lastDate ? Math.max(0, Math.ceil(72 - hoursDiff)) : 0;

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (motivo.length < 3 || descripcion.length < 10) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('warning', 'Completá todos los campos correctamente (Motivo min. 3, Descripción min. 10 chars).');
            }
            return;
        }

        setLoading(true);
        try {
            await claimsService.create({
                compraId: purchaseId,
                motivo,
                descripcion
            });

            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Reclamo registrado exitosamente. El equipo de soporte lo revisará pronto.');
            }
            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error creating claim:", error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al registrar el reclamo. Intentá de nuevo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Realizar Reclamo</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <LuX size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <p className={styles.modalIntro}>
                        Lamentamos que tengas inconvenientes con tu compra. Contanos qué pasó para poder ayudarte.
                    </p>

                    {isTimeRestricted && (
                        <div className={styles.warningBox} style={{
                            backgroundColor: 'rgba(255, 193, 7, 0.1)',
                            borderLeft: '4px solid #ffc107',
                            padding: '12px',
                            marginBottom: '20px',
                            fontSize: '0.9rem',
                            color: '#ffc107',
                            borderRadius: '4px'
                        }}>
                            <strong>¡Atención!</strong> Deben pasar al menos 72 horas desde {isFromPurchase ? 'la compra' : 'tu último reclamo'} para realizar uno nuevo.
                            Faltan aproximadamente {remainingHours} horas.
                        </div>
                    )}

                    <div className={styles.formGroup}>
                        <label htmlFor="motivo">Motivo del Reclamo</label>
                        <input
                            id="motivo"
                            type="text"
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            placeholder="Ej: Producto dañado, Faltante, etc."
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label htmlFor="descripcion">Descripción Detallada</label>
                        <textarea
                            id="descripcion"
                            value={descripcion}
                            onChange={(e) => setDescripcion(e.target.value)}
                            placeholder="Contanos más detalles sobre el problema..."
                            rows={4}
                            className={styles.textarea}
                        />
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.confirmButton}
                            disabled={loading || isTimeRestricted}
                            title={isTimeRestricted ? `Faltan ${remainingHours} horas para poder iniciar un reclamo` : ''}
                        >
                            {loading ? 'Enviando...' : 'Enviar Reclamo'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
