import React, { useState } from 'react';
import { ManagementService } from '../../services/management.service';
import styles from './styles/ManagementModals.module.css';
import { LuX } from 'react-icons/lu';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    currentPrice: number;
    onSuccess: () => void;
}

export default function UpdatePriceModal({ isOpen, onClose, productId, currentPrice, onSuccess }: Props) {
    const [price, setPrice] = useState(currentPrice.toString());
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const numPrice = Number(price);
        if (isNaN(numPrice) || numPrice <= 0) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('warning', 'Ingresá un precio válido.');
            }
            return;
        }

        setLoading(true);
        const result = await ManagementService.updateProductPrice(productId, numPrice);
        setLoading(false);

        if (result.status === 'success') {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Precio actualizado correctamente.');
            }
            onSuccess();
        } else {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', result.message || 'Error al actualizar precio.');
            }
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Actualizar Precio</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <LuX size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label>Nuevo Precio (ARS)</label>
                        <input
                            type="number"
                            step="0.01"
                            min="0"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            required
                        />
                    </div>
                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.confirmButton} disabled={loading}>
                            {loading ? 'Guardando...' : 'Guardar Precio'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
