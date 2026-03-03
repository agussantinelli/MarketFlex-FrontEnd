import React, { useState } from 'react';
import styles from './styles/RegisterSaleView.module.css';
import dashboardStyles from './styles/dashboard.module.css';
import { LuChevronLeft, LuChevronRight, LuCheck, LuArrowLeft, LuPlus, LuPackage, LuMinus, LuTrash2, LuDollarSign, LuCreditCard, LuRepeat, LuStore, LuTruck } from 'react-icons/lu';
import { api } from '../../lib/api';
import { AdminService } from '../../services/admin.service';
import { getImageUrl } from '../../lib/url';

// Types
export interface SelectedProduct {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    stock: number;
    foto: string | null;
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
        try {
            const results = await AdminService.searchProducts(query);
            setSearchResults(results || []);
        } catch (error) {
            console.error('Search error:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al buscar productos');
            }
        } finally {
            setSearching(false);
        }
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
                stock: product.stock,
                foto: product.foto
            }]);
        }

        if ((window as any).triggerSileo) {
            (window as any).triggerSileo('info', `¡${product.nombre} añadido!`);
        }
    };

    const removeProduct = (productId: string) => {
        const product = selectedProducts.find(p => p.id === productId);
        setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
        if (product && (window as any).triggerSileo) {
            (window as any).triggerSileo('info', `Producto eliminado: ${product.nombre}`);
        }
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
                                        <div key={p.id} className={styles.productCard}>
                                            <div className={styles.productImage}>
                                                {p.foto ? (
                                                    <img src={getImageUrl(p.foto)} alt={p.nombre} />
                                                ) : (
                                                    <div className={styles.productImagePlaceholder}>
                                                        <LuPackage size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.productInfo}>
                                                <span className={styles.productName}>{p.nombre}</span>
                                                <span className={styles.productPrice}>${p.precioActual.toLocaleString()}</span>
                                            </div>
                                            <button
                                                onClick={() => addProduct(p)}
                                                className={styles.smallActionBtn}
                                                title="Agregar a la venta"
                                                aria-label="Agregar producto"
                                            >
                                                <LuPlus size={18} />
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
                                        <div key={p.id} className={styles.productCard}>
                                            <div className={styles.productImage}>
                                                {p.foto ? (
                                                    <img src={getImageUrl(p.foto)} alt={p.nombre} />
                                                ) : (
                                                    <div className={styles.productImagePlaceholder}>
                                                        <LuPackage size={20} />
                                                    </div>
                                                )}
                                            </div>
                                            <div className={styles.productInfo}>
                                                <span className={styles.productName}>{p.nombre}</span>
                                                <span className={styles.productPrice}>${p.precio.toLocaleString()} × {p.cantidad}</span>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ display: 'flex', gap: '4px' }}>
                                                    <button
                                                        onClick={() => updateQuantity(p.id, -1)}
                                                        className={styles.smallActionBtn}
                                                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                                        aria-label="Disminuir cantidad"
                                                    >
                                                        <LuMinus size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => updateQuantity(p.id, 1)}
                                                        className={styles.smallActionBtn}
                                                        style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
                                                        aria-label="Aumentar cantidad"
                                                    >
                                                        <LuPlus size={14} />
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => removeProduct(p.id)}
                                                    className={styles.smallActionBtn}
                                                    style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444' }}
                                                    title="Eliminar producto"
                                                >
                                                    <LuTrash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 2:
                const subtotal = selectedProducts.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <h4 className={styles.sectionLabel}>Método de Pago</h4>
                            <div className={styles.selectionGrid}>
                                <div
                                    className={`${styles.selectionTile} ${paymentMethod === 'cash' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('cash')}
                                >
                                    <LuDollarSign className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Efectivo</span>
                                    {paymentMethod === 'cash' && <LuCheck className={styles.activeCheck} />}
                                </div>
                                <div
                                    className={`${styles.selectionTile} ${paymentMethod === 'card' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('card')}
                                >
                                    <LuCreditCard className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Tarjeta</span>
                                    {paymentMethod === 'card' && <LuCheck className={styles.activeCheck} />}
                                </div>
                                <div
                                    className={`${styles.selectionTile} ${paymentMethod === 'transfer' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('transfer')}
                                >
                                    <LuRepeat className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Transferencia</span>
                                    {paymentMethod === 'transfer' && <LuCheck className={styles.activeCheck} />}
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: '3rem' }}>
                            <h4 className={styles.sectionLabel}>Tipo de Venta</h4>
                            <div className={styles.selectionGrid}>
                                <div
                                    className={`${styles.selectionTile} ${isPhysicalSale ? styles.active : ''}`}
                                    onClick={() => setIsPhysicalSale(true)}
                                >
                                    <LuStore className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Venta en Físico</span>
                                </div>
                                <div
                                    className={`${styles.selectionTile} ${!isPhysicalSale ? styles.active : ''}`}
                                    onClick={() => setIsPhysicalSale(false)}
                                >
                                    <LuTruck className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Envio / Remoto</span>
                                </div>
                            </div>
                            <div style={{
                                marginTop: '1.5rem',
                                padding: '1rem',
                                background: 'rgba(0, 255, 136, 0.05)',
                                borderRadius: '12px',
                                border: '1px solid rgba(0, 255, 136, 0.1)',
                                color: 'var(--green-cream)',
                                fontSize: '0.9rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem'
                            }}>
                                <LuCheck style={{ color: 'var(--neon-green)' }} />
                                {isPhysicalSale
                                    ? 'Se registrará como entrega inmediata en el local para Consumidor Final.'
                                    : 'Se habilitarán los campos de dirección de envío en el siguiente paso.'}
                            </div>
                        </div>

                        <div className={styles.summaryCard}>
                            <h4 style={{
                                color: 'var(--neon-green)',
                                fontSize: '0.8rem',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '1rem',
                                opacity: 0.8
                            }}>Resumen Parcial</h4>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Items Seleccionados</span>
                                <span className={styles.summaryValue}>{selectedProducts.reduce((acc, p) => acc + p.cantidad, 0)}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Subtotal</span>
                                <span className={styles.summaryValue}>${subtotal.toLocaleString()}</span>
                            </div>
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total a Pagar</span>
                                <span className={styles.summaryTotal}>${subtotal.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                const total = selectedProducts.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Resumen de la Venta</h4>

                        <div className={styles.summaryCard} style={{ marginTop: '0', marginBottom: '2rem' }}>
                            <div className={styles.summaryRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {paymentMethod === 'cash' ? <LuDollarSign style={{ color: 'var(--neon-green)' }} /> :
                                        paymentMethod === 'card' ? <LuCreditCard style={{ color: 'var(--neon-green)' }} /> :
                                            <LuRepeat style={{ color: 'var(--neon-green)' }} />}
                                    <span className={styles.summaryLabel}>Método de Pago</span>
                                </div>
                                <span className={styles.summaryValue} style={{ color: 'var(--neon-green)' }}>
                                    {paymentMethod === 'cash' ? 'Efectivo' : paymentMethod === 'card' ? 'Tarjeta' : 'Transferencia'}
                                </span>
                            </div>
                            <div className={styles.summaryRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {isPhysicalSale ? <LuStore style={{ color: 'var(--neon-green)' }} /> : <LuTruck style={{ color: 'var(--neon-green)' }} />}
                                    <span className={styles.summaryLabel}>Tipo de Venta</span>
                                </div>
                                <span className={styles.summaryValue}>{isPhysicalSale ? 'Presencial (Local)' : 'Remota (Envío)'}</span>
                            </div>
                        </div>

                        <h4 className={styles.sectionLabel} style={{ fontSize: '0.9rem', opacity: 0.7 }}>Items a Registrar</h4>
                        <div className={styles.selectedList} style={{ gap: '0.5rem' }}>
                            {selectedProducts.map(p => (
                                <div key={p.id} className={styles.productCard} style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.01)' }}>
                                    <div className={styles.productImage} style={{ width: '40px', height: '40px' }}>
                                        {p.foto ? (
                                            <img src={getImageUrl(p.foto)} alt={p.nombre} />
                                        ) : (
                                            <div className={styles.productImagePlaceholder}>
                                                <LuPackage size={16} />
                                            </div>
                                        )}
                                    </div>
                                    <div className={styles.productInfo}>
                                        <span className={styles.productName} style={{ fontSize: '0.85rem' }}>{p.nombre}</span>
                                        <span className={styles.productPrice} style={{ fontSize: '0.75rem', opacity: 0.6 }}>${p.precio.toLocaleString()} c/u</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ color: 'var(--neon-green)', fontWeight: 700, fontSize: '0.9rem' }}>
                                            ${(p.precio * p.cantidad).toLocaleString()}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', opacity: 0.5 }}>Cant: {p.cantidad}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className={styles.summaryCard} style={{ marginTop: '2rem', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            <div className={styles.summaryRow} style={{ borderBottom: 'none', padding: '0' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-cream)' }}>TOTAL FINAL</span>
                                <span className={styles.summaryTotal} style={{ fontSize: '2rem' }}>
                                    ${total.toLocaleString()}
                                </span>
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
