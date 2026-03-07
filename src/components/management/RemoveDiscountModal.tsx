import React, { useState } from 'react';
import { LuInfo } from 'react-icons/lu';
import { ManagementService } from '../../services/management.service';
import styles from './styles/ManagementModals.module.css';

interface RemoveDiscountModalProps {
    isOpen: boolean; onClose: () => void;
    onSuccess: () => void;
    productId: string;
    discountId: string;
}

const RemoveDiscountModal: React.FC<RemoveDiscountModalProps> = ({ isOpen, onClose, onSuccess, productId, discountId }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const res = await ManagementService.removeDirectDiscount(productId, discountId);

        if (res.status === 'success') {
            onSuccess();
            onClose();
        } else {
            setError(res.message || 'Error al quitar el descuento');
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <div className={styles.modalHeader}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                        <LuInfo /> Quitar Descuento
                    </h2>
                    <button className={styles.closeButton} onClick={onClose}>
                        &times;
                    </button>
                </div>

                <form className={styles.modalForm} onSubmit={handleSubmit}>
                    <p style={{ color: 'var(--text-color)', fontSize: '0.95rem', lineHeight: '1.5' }}>
                        ¿Estás seguro que deseas quitar el descuento actual de este producto? El precio volverá a su valor original inmediatamente.
                    </p>

                    {error && (
                        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', fontSize: '0.9rem' }}>
                            {error}
                        </div>
                    )}

                    <div className={styles.modalActions}>
                        <button
                            type="button"
                            className={styles.cancelButton}
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className={styles.confirmButton}
                            disabled={isLoading}
                            style={{ background: '#ef4444', boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)' }}
                        >
                            {isLoading ? 'Quitando...' : 'Quitar Descuento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RemoveDiscountModal;
