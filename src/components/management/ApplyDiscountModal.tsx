import React, { useState } from 'react';
import { ManagementService } from '../../services/management.service';
import styles from './styles/ManagementModals.module.css';
import { LuX } from 'react-icons/lu';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    productId: string;
    onSuccess: () => void;
}

export default function ApplyDiscountModal({ isOpen, onClose, productId, onSuccess }: Props) {
    const [nombre, setNombre] = useState('');
    const [tipo, setTipo] = useState<'PORCENTAJE' | 'MONTO_FIJO'>('PORCENTAJE');
    const [valor, setValor] = useState('');
    const [fechaInicio, setFechaInicio] = useState('');
    const [fechaFin, setFechaFin] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const numValor = Number(valor);
        if (!nombre || isNaN(numValor) || numValor <= 0 || !fechaInicio || !fechaFin) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('warning', 'Completá todos los campos correctamente.');
            }
            return;
        }

        if (new Date(fechaInicio) >= new Date(fechaFin)) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('warning', 'La fecha de fin debe ser posterior a la de inicio.');
            }
            return;
        }

        setLoading(true);
        const result = await ManagementService.applyDirectDiscount(productId, {
            nombre,
            tipo,
            valor: numValor,
            // Format to basic ISO 8601 UTC
            fechaInicio: new Date(fechaInicio).toISOString(),
            fechaFin: new Date(fechaFin).toISOString()
        });
        setLoading(false);

        if (result.status === 'success') {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Descuento aplicado correctamente.');
            }
            onSuccess();
        } else {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', result.message || 'Error al aplicar descuento.');
            }
        }
    };

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <div className={styles.modalHeader}>
                    <h2>Aplicar Descuento Directo</h2>
                    <button onClick={onClose} className={styles.closeButton}>
                        <LuX size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className={styles.modalForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="offerName">Nombre de la Oferta</label>
                        <input
                            id="offerName"
                            type="text"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            placeholder="Ej: Hot Sale 2026"
                            maxLength={100}
                        />
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="discountType">Tipo</label>
                            <select id="discountType" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
                                <option value="PORCENTAJE">Porcentaje (%)</option>
                                <option value="MONTO_FIJO">Monto Fijo ($)</option>
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="discountValue">Valor</label>
                            <input
                                id="discountValue"
                                type="number"
                                step={tipo === 'PORCENTAJE' ? '1' : '0.01'}
                                value={valor}
                                onChange={(e) => setValor(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.formRow}>
                        <div className={styles.formGroup}>
                            <label htmlFor="startDate">Fecha de Inicio</label>
                            <input
                                id="startDate"
                                type="datetime-local"
                                value={fechaInicio}
                                onChange={(e) => setFechaInicio(e.target.value)}
                            />
                        </div>
                        <div className={styles.formGroup}>
                            <label htmlFor="endDate">Fecha de Fin</label>
                            <input
                                id="endDate"
                                type="datetime-local"
                                value={fechaFin}
                                onChange={(e) => setFechaFin(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className={styles.modalActions}>
                        <button type="button" onClick={onClose} className={styles.cancelButton} disabled={loading}>
                            Cancelar
                        </button>
                        <button type="submit" className={styles.confirmButton} disabled={loading}>
                            {loading ? 'Aplicando...' : 'Aplicar Descuento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
