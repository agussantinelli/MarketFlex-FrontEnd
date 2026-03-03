import React, { useState } from 'react';
import styles from './styles/RegisterSaleView.module.css';
import dashboardStyles from './styles/dashboard.module.css';
import { LuChevronLeft, LuChevronRight, LuCheck, LuArrowLeft, LuPlus } from 'react-icons/lu';
import { api } from '../../lib/api';
import { AdminService } from '../../services/admin.service';

// Types
export interface SelectedProduct {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    stock: number;
}

const RegisterSaleView: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cash' | 'transfer'>('cash');
    const [isPhysicalSale, setIsPhysicalSale] = useState(true);

    const steps = [
        { id: 1, label: 'Seleccionar Productos' },
        { id: 2, label: 'Detalles de Venta' },
        { id: 3, label: 'Confirmación' }
    ];

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(currentStep + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(currentStep - 1);
    };

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searching, setSearching] = useState(false);

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }
        setSearching(true);
        // Simulate search for now, will integrate with product.service later
        const results = await AdminService.searchProducts(query);
        setSearchResults(results || []);
        setSearching(false);
    };

    const addProduct = (product: any) => {
        const existing = selectedProducts.find(p => p.id === product.id);
        if (existing) {
            setSelectedProducts(selectedProducts.map(p =>
                p.id === product.id ? { ...p, cantidad: p.cantidad + 1 } : p
            ));
        } else {
            setSelectedProducts([...selectedProducts, {
                id: product.id,
                nombre: product.nombre,
                precio: parseFloat(product.precioActual),
                cantidad: 1,
                stock: product.stock
            }]);
        }
    };

    const removeProduct = (productId: string) => {
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
    };

    const updateQuantity = (productId: string, delta: number) => {
        setSelectedProducts(selectedProducts.map(p => {
            if (p.id === productId) {
                const newQty = Math.max(1, Math.min(p.stock, p.cantidad + delta));
                return { ...p, cantidad: newQty };
            }
            return p;
        }));
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.searchSection}>
                            <input
                                type="text"
                                placeholder="Buscar productos por nombre..."
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                className={dashboardStyles.toggleBtn}
                                style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '1rem' }}
                            />
                            {searching && <div className={styles.searching}>Buscando...</div>}
                            {searchResults.length > 0 && (
                                <div className={styles.searchResults}>
                                    {searchResults.map(p => (
                                        <div key={p.id} className={styles.resultItem} onClick={() => addProduct(p)}>
                                            <span>{p.nombre}</span>
                                            <span className={styles.resultPrice}>${p.precioActual}</span>
                                            <button className={dashboardStyles.btnPrimary} style={{ padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                                                <LuPlus />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.selectedSection}>
                            <h4 className={styles.sectionLabel}>Productos Seleccionados</h4>
                            {selectedProducts.length === 0 ? (
                                <div className={styles.emptyState}>No hay productos seleccionados.</div>
                            ) : (
                                <div className={styles.selectedList}>
                                    {selectedProducts.map(p => (
                                        <div key={p.id} className={styles.selectedItem}>
                                            <div className={styles.itemInfo}>
                                                <span className={styles.itemName}>{p.nombre}</span>
                                                <span className={styles.itemPrice}>${p.precio} c/u</span>
                                            </div>
                                            <div className={styles.itemActions}>
                                                <div className={styles.qtyControls}>
                                                    <button onClick={() => updateQuantity(p.id, -1)}>-</button>
                                                    <span>{p.cantidad}</span>
                                                    <button onClick={() => updateQuantity(p.id, 1)}>+</button>
                                                </div>
                                                <button onClick={() => removeProduct(p.id)} className={styles.removeBtn}>Eliminar</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.formGrid}>
                            <div className={styles.formGroup}>
                                <label>Método de Pago</label>
                                <div className={styles.radioGroup}>
                                    {['cash', 'card', 'transfer'].map(method => (
                                        <label key={method} className={styles.radioItem}>
                                            <input
                                                type="radio"
                                                name="paymentMethod"
                                                checked={paymentMethod === method}
                                                onChange={() => setPaymentMethod(method as any)}
                                            />
                                            <span className={styles.radioLabel}>
                                                {method === 'cash' ? 'Efectivo' : method === 'card' ? 'Tarjeta' : 'Transferencia'}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.formGroup}>
                                <label>Tipo de Venta</label>
                                <div className={styles.toggleWrapper}>
                                    <span>Venta en físico (al local)</span>
                                    <label className={styles.switch}>
                                        <input
                                            type="checkbox"
                                            checked={isPhysicalSale}
                                            onChange={(e) => setIsPhysicalSale(e.target.checked)}
                                        />
                                        <span className={`${styles.slider} ${styles.round}`}></span>
                                    </label>
                                </div>
                                <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>
                                    {isPhysicalSale
                                        ? 'No se requieren datos de envío. Se registrará como "Consumidor Final".'
                                        : 'Se requerirán datos de envío del cliente.'}
                                </p>
                            </div>
                        </div>

                        <div className={styles.summarySection} style={{ marginTop: '3rem' }}>
                            <div className={styles.summaryRow}>
                                <span>Cant. de Productos:</span>
                                <span>{selectedProducts.reduce((acc, p) => acc + p.cantidad, 0)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Total:</span>
                                <span className={styles.summaryTotal}>
                                    ${selectedProducts.reduce((acc, p) => acc + (p.precio * p.cantidad), 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                const total = selectedProducts.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Resumen de la Venta</h4>
                        <div className={styles.confirmDetails}>
                            <div className={styles.summaryRow}>
                                <span>Método de Pago:</span>
                                <span style={{ fontWeight: 600, color: 'var(--neon-green)' }}>
                                    {paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                                </span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span>Tipo de Venta:</span>
                                <span>{isPhysicalSale ? 'Física (Al Local)' : 'Online (Con Envío)'}</span>
                            </div>
                        </div>

                        <div className={styles.confirmList}>
                            {selectedProducts.map(p => (
                                <div key={p.id} className={styles.confirmItem}>
                                    <span>{p.cantidad}x {p.nombre}</span>
                                    <span>${(p.precio * p.cantidad).toFixed(2)}</span>
                                </div>
                            ))}
                            <div className={styles.confirmItem} style={{ borderTop: '2px solid var(--neon-green)', marginTop: '1rem', paddingTop: '1rem' }}>
                                <span style={{ fontWeight: 800 }}>TOTAL</span>
                                <span style={{ fontWeight: 800, color: 'var(--neon-green)', fontSize: '1.2rem' }}>${total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    const handleSubmit = async () => {
        try {
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();

            // Prepare the data for the backend
            const saleData = {
                items: selectedProducts.map(p => ({
                    productoId: p.id,
                    cantidad: p.cantidad
                })),
                metodoPago: paymentMethod,
                ventaEnFisico: isPhysicalSale,
                // If it's physical, we don't send shipping details
                envio: isPhysicalSale ? undefined : {
                    direccion: "Venta al local",
                    ciudad: "Venta al local",
                    provincia: "Venta al local",
                    codigoPostal: "0000",
                    telefono: "00000000"
                }
            };

            const response = await api.post('purchases', { json: saleData }).json<any>();

            if (response.status === 'success') {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', '¡Venta registrada con éxito!');
                }
                setTimeout(() => {
                    window.location.href = '/admin/sales';
                }, 1500);
            } else {
                throw new Error(response.message || 'Error al registrar la venta');
            }

        } catch (error: any) {
            console.error('Error submitting sale:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', error.message || 'Error crítico al registrar la venta');
            }
        } finally {
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    return (
        <div className={dashboardStyles.dashboardContainer} style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 2rem' }}>
            <header className={dashboardStyles.header} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <a
                        href="/admin/sales"
                        className={dashboardStyles.actionBtn}
                        title="Volver a Ventas"
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--neon-green)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <LuArrowLeft size={20} />
                    </a>
                    <h1 style={{
                        margin: 0,
                        fontSize: '2.5rem',
                        fontWeight: '800',
                        color: 'var(--neon-green)',
                        letterSpacing: '-1px'
                    }}>
                        Registrar Venta
                    </h1>
                </div>
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--green-cream)',
                    opacity: 0.7,
                    marginLeft: '3.75rem'
                }}>
                    Sigue los pasos para registrar una nueva venta manual en el sistema.
                </p>
            </header>

            <div className={styles.viewContainer}>
                <div className={styles.stepper}>
                    {steps.map((step) => (
                        <div
                            key={step.id}
                            className={`${styles.step} ${currentStep === step.id ? styles.active : ''} ${currentStep > step.id ? styles.completed : ''}`}
                        >
                            <div className={styles.stepCircle}>
                                {currentStep > step.id ? <LuCheck /> : step.id}
                            </div>
                            <div className={styles.stepLabelContainer}>
                                <span className={styles.stepNumber}>0{step.id}</span>
                                <span className={styles.stepLabel}>{step.label}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className={styles.divider} />

                {renderStep()}

                <div className={styles.actions}>
                    {currentStep > 1 && (
                        <button onClick={prevStep} className={dashboardStyles.btnSecondary}>
                            <LuChevronLeft /> Anterior
                        </button>
                    )}
                    <div style={{ marginLeft: 'auto' }}>
                        {currentStep < 3 ? (
                            <button
                                onClick={nextStep}
                                className={dashboardStyles.btnPrimary}
                                disabled={currentStep === 1 && selectedProducts.length === 0}
                            >
                                Siguiente <LuChevronRight />
                            </button>
                        ) : (
                            <button onClick={handleSubmit} className={dashboardStyles.btnPrimary}>
                                <LuCheck /> Confirmar Venta
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterSaleView;
