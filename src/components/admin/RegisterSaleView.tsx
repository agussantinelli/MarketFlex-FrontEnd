import React, { useState, useMemo } from 'react';
import styles from './styles/RegisterSaleView.module.css';
import dashboardStyles from './styles/dashboard.module.css';
import { LuChevronLeft, LuChevronRight, LuCheck, LuArrowLeft, LuPlus, LuPackage, LuMinus, LuTrash2, LuDollarSign, LuCreditCard, LuStore, LuTruck, LuTag } from 'react-icons/lu';
import { api } from '../../lib/api';
import { AdminService } from '../../services/admin.service';
import { getImageUrl } from '../../lib/url';
import { calculatePromotions } from '../../store/promotionEngine';
import type { CartItem } from '../../types/cart.types';

// Types
export interface SelectedProduct {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    stock: number;
    foto: string | null;
    precioConDescuento: number | null;
    descuentoActivo: { nombre: string; porcentaje: number | null; montoFijo: number | null } | null;
    promocionActiva: { nombre: string; tipoPromocion: string; cantCompra: number | null; cantPaga: number | null; porcentajeDescuentoSegunda: string | null } | null;
}

const RegisterSaleView: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    const [paymentMethod, setPaymentMethod] = useState<'Mercado Pago' | 'Efectivo'>('Efectivo');
    const [deliveryMethod, setDeliveryMethod] = useState<'ENVIO_DOMICILIO' | 'RETIRO_LOCAL' | 'RETIRO_SUCURSAL'>('ENVIO_DOMICILIO');
    const [shippingData, setShippingData] = useState({
        nombreCompleto: '',
        email: '',
        direccion: '',
        ciudad: '',
        provincia: '',
        codigoPostal: '',
        telefono: ''
    });

    const steps = [
        { id: 1, label: 'Seleccionar Productos' },
        { id: 2, label: 'Detalles de Venta' },
        { id: 3, label: 'Confirmación' }
    ];

    const nextStep = () => {
        if (currentStep === 2) {
            if (deliveryMethod === 'ENVIO_DOMICILIO') {
                const { nombreCompleto, email, direccion, ciudad, provincia, codigoPostal, telefono } = shippingData;
                if (!nombreCompleto.trim() || !email.trim() || !direccion.trim() || !ciudad.trim() || !provincia.trim() || !codigoPostal.trim() || !telefono.trim()) {
                    if ((window as any).triggerSileo) {
                        (window as any).triggerSileo('error', 'Completá todos los campos de envío obligatorios');
                    }
                    return;
                }
            }
        }
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
                foto: product.foto,
                precioConDescuento: product.precioConDescuento ? parseFloat(product.precioConDescuento) : null,
                descuentoActivo: product.descuentoActivo || null,
                promocionActiva: product.promocionActiva || null
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

    // Promotion calculation
    const promoResult = useMemo(() => {
        if (selectedProducts.length === 0) return { subtotal: 0, discount: 0, total: 0, appliedPromotions: [] };
        const cartItems: CartItem[] = selectedProducts.map(p => ({
            id: p.id,
            nombre: p.nombre,
            descripcion: null,
            caracteristicas: [],
            foto: p.foto,
            categoria: null,
            subcategoria: null,
            precioActual: p.precio,
            precioConDescuento: p.precioConDescuento,
            descuentoActivo: p.descuentoActivo,
            esDestacado: false,
            stock: p.stock,
            envioGratis: false,
            marca: null,
            autor: null,
            fechaLlegada: null,
            promocionActiva: p.promocionActiva,
            quantity: p.cantidad,
            cantidad: p.cantidad
        } as any));
        return calculatePromotions(cartItems);
    }, [selectedProducts]);

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
                                                    aria-label="Eliminar producto"
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
                return (
                    <div className={styles.stepContent}>
                        <div className={styles.formGroup}>
                            <h4 className={styles.sectionLabel}>Método de Pago</h4>
                            <div className={styles.selectionGrid}>
                                <div
                                    className={`${styles.selectionTile} ${paymentMethod === 'Mercado Pago' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('Mercado Pago')}
                                >
                                    <LuCreditCard className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Mercado Pago</span>
                                    {paymentMethod === 'Mercado Pago' && <LuCheck className={styles.activeCheck} />}
                                </div>
                                <div
                                    className={`${styles.selectionTile} ${paymentMethod === 'Efectivo' ? styles.active : ''}`}
                                    onClick={() => setPaymentMethod('Efectivo')}
                                >
                                    <LuDollarSign className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Efectivo</span>
                                    {paymentMethod === 'Efectivo' && <LuCheck className={styles.activeCheck} />}
                                </div>
                            </div>
                        </div>

                        <div className={styles.formGroup} style={{ marginTop: '3rem' }}>
                            <h4 className={styles.sectionLabel}>Método de Entrega</h4>
                            <div className={styles.selectionGrid}>
                                <div
                                    className={`${styles.selectionTile} ${deliveryMethod === 'RETIRO_LOCAL' ? styles.active : ''}`}
                                    onClick={() => setDeliveryMethod('RETIRO_LOCAL')}
                                >
                                    <LuStore className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Retiro en Local</span>
                                </div>
                                <div
                                    className={`${styles.selectionTile} ${deliveryMethod === 'RETIRO_SUCURSAL' ? styles.active : ''}`}
                                    onClick={() => setDeliveryMethod('RETIRO_SUCURSAL')}
                                >
                                    <LuPackage className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Retiro en Sucursal</span>
                                </div>
                                <div
                                    className={`${styles.selectionTile} ${deliveryMethod === 'ENVIO_DOMICILIO' ? styles.active : ''}`}
                                    onClick={() => setDeliveryMethod('ENVIO_DOMICILIO')}
                                >
                                    <LuTruck className={styles.tileIcon} />
                                    <span className={styles.tileLabel}>Envío a Domicilio</span>
                                </div>
                            </div>

                            <div style={{
                                marginTop: '2rem',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem'
                            }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Nombre Completo {deliveryMethod === 'ENVIO_DOMICILIO' && <span style={{ color: 'var(--error-red)' }}>*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Nombre y Apellido"
                                        value={shippingData.nombreCompleto}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, nombreCompleto: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Email {deliveryMethod === 'ENVIO_DOMICILIO' && <span style={{ color: 'var(--error-red)' }}>*</span>}
                                    </label>
                                    <input
                                        type="email"
                                        placeholder="email@ejemplo.com"
                                        value={shippingData.email}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, email: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                                <div style={{ gridColumn: deliveryMethod === 'ENVIO_DOMICILIO' ? 'auto' : '1 / -1' }}>
                                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Teléfono {deliveryMethod === 'ENVIO_DOMICILIO' && <span style={{ color: 'var(--error-red)' }}>*</span>}
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Teléfono de contacto"
                                        value={shippingData.telefono}
                                        onChange={(e) => setShippingData(prev => ({ ...prev, telefono: e.target.value }))}
                                        className={dashboardStyles.toggleBtn}
                                        style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                    />
                                </div>
                            </div>

                            {deliveryMethod === 'ENVIO_DOMICILIO' ? (
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
                                    <LuTruck style={{ color: 'var(--neon-green)' }} />
                                    Completá los datos de envío del cliente a continuación.
                                </div>
                            ) : (
                                <div style={{
                                    marginTop: '1.5rem',
                                    padding: '1rem',
                                    background: 'rgba(245, 158, 11, 0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(245, 158, 11, 0.1)',
                                    color: 'var(--warning-yellow)',
                                    fontSize: '0.9rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <LuStore style={{ color: 'var(--warning-yellow)' }} />
                                    El cliente retirará el pedido. Los datos de contacto son opcionales.
                                </div>
                            )}

                            {deliveryMethod === 'ENVIO_DOMICILIO' && (
                                <div style={{
                                    marginTop: '2rem',
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr',
                                    gap: '1rem'
                                }}>
                                    <div style={{ gridColumn: '1 / -1' }}>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Dirección</label>
                                        <input
                                            type="text"
                                            placeholder="Calle y número"
                                            value={shippingData.direccion}
                                            onChange={(e) => setShippingData(prev => ({ ...prev, direccion: e.target.value }))}
                                            className={dashboardStyles.toggleBtn}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Ciudad</label>
                                        <input
                                            type="text"
                                            placeholder="Ciudad"
                                            value={shippingData.ciudad}
                                            onChange={(e) => setShippingData(prev => ({ ...prev, ciudad: e.target.value }))}
                                            className={dashboardStyles.toggleBtn}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Provincia</label>
                                        <input
                                            type="text"
                                            placeholder="Provincia"
                                            value={shippingData.provincia}
                                            onChange={(e) => setShippingData(prev => ({ ...prev, provincia: e.target.value }))}
                                            className={dashboardStyles.toggleBtn}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Código Postal</label>
                                        <input
                                            type="text"
                                            placeholder="CP"
                                            value={shippingData.codigoPostal}
                                            onChange={(e) => setShippingData(prev => ({ ...prev, codigoPostal: e.target.value }))}
                                            className={dashboardStyles.toggleBtn}
                                            style={{ width: '100%', background: 'rgba(255,255,255,0.05)', textAlign: 'left', padding: '0.85rem 1rem' }}
                                        />
                                    </div>
                                </div>
                            )}
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
                                <span className={styles.summaryValue}>${promoResult.subtotal.toLocaleString()}</span>
                            </div>
                            {promoResult.discount > 0 && (
                                <>
                                    {promoResult.appliedPromotions.map((promo, idx) => (
                                        <div key={idx} className={styles.summaryRow} style={{ borderColor: 'rgba(0,255,136,0.08)' }}>
                                            <span className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                <LuTag size={14} style={{ color: 'var(--neon-green)', flexShrink: 0 }} />
                                                {promo.nombre}
                                            </span>
                                            <span style={{ color: 'var(--neon-green)', fontWeight: 600, fontSize: '0.9rem' }}>-${promo.monto.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel} style={{ fontWeight: 700 }}>Descuento Total</span>
                                        <span style={{ color: 'var(--neon-green)', fontWeight: 700, fontSize: '1rem' }}>-${promoResult.discount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                            <div className={styles.summaryRow}>
                                <span className={styles.summaryLabel}>Total a Pagar</span>
                                <span className={styles.summaryTotal}>${promoResult.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className={styles.stepContent}>
                        <h4 className={styles.sectionLabel}>Resumen de la Venta</h4>

                        <div className={styles.summaryCard} style={{ marginTop: '0', marginBottom: '2rem' }}>
                            <div className={styles.summaryRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {paymentMethod === 'Efectivo' ? <LuDollarSign style={{ color: 'var(--neon-green)' }} /> : <LuCreditCard style={{ color: 'var(--neon-green)' }} />}
                                    <span className={styles.summaryLabel}>Método de Pago</span>
                                </div>
                                <span className={styles.summaryValue} style={{ color: 'var(--neon-green)' }}>
                                    {paymentMethod}
                                </span>
                            </div>
                            <div className={styles.summaryRow}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    {deliveryMethod === 'ENVIO_DOMICILIO' ? <LuTruck style={{ color: 'var(--neon-green)' }} /> : <LuStore style={{ color: 'var(--neon-green)' }} />}
                                    <span className={styles.summaryLabel}>Método de Entrega</span>
                                </div>
                                <span className={styles.summaryValue}>
                                    {deliveryMethod === 'ENVIO_DOMICILIO' ? 'Envío a Domicilio' : deliveryMethod === 'RETIRO_LOCAL' ? 'Retiro en Local' : 'Retiro en Sucursal'}
                                </span>
                            </div>
                            {deliveryMethod === 'ENVIO_DOMICILIO' && (
                                <div className={styles.summaryRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '4px' }}>
                                    <span className={styles.summaryLabel} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                                        <LuTruck size={14} style={{ color: 'var(--neon-green)' }} /> Datos de Envío
                                    </span>
                                    <div style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.6, paddingLeft: '20px' }}>
                                        <div style={{ fontWeight: 600, opacity: 1 }}>{shippingData.nombreCompleto}</div>
                                        <div>{shippingData.email}</div>
                                        <div>{shippingData.direccion}</div>
                                        <div>{shippingData.ciudad}, {shippingData.provincia} ({shippingData.codigoPostal})</div>
                                        <div>Tel: {shippingData.telefono}</div>
                                    </div>
                                </div>
                            )}
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

                        {promoResult.appliedPromotions.length > 0 && (
                            <>
                                <h4 className={styles.sectionLabel} style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '1.5rem' }}>
                                    <LuTag size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
                                    Promociones Aplicadas
                                </h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '1.5rem' }}>
                                    {promoResult.appliedPromotions.map((promo, idx) => (
                                        <div key={idx} style={{
                                            backgroundColor: 'rgba(0, 255, 136, 0.08)',
                                            padding: '8px 14px',
                                            borderRadius: '10px',
                                            border: '1px solid rgba(0, 255, 136, 0.15)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            fontSize: '0.8rem'
                                        }}>
                                            <span style={{ fontWeight: 600, color: 'var(--neon-green)' }}>{promo.nombre}</span>
                                            <span style={{ opacity: 0.6 }}>|</span>
                                            <span style={{ color: 'var(--neon-green)' }}>-${promo.monto.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        <div className={styles.summaryCard} style={{ marginTop: '2rem', border: '1px solid rgba(0, 255, 136, 0.2)' }}>
                            {promoResult.discount > 0 && (
                                <>
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel}>Subtotal</span>
                                        <span className={styles.summaryValue}>${promoResult.subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className={styles.summaryRow}>
                                        <span className={styles.summaryLabel} style={{ color: 'var(--neon-green)' }}>Descuento</span>
                                        <span style={{ color: 'var(--neon-green)', fontWeight: 700 }}>-${promoResult.discount.toLocaleString()}</span>
                                    </div>
                                </>
                            )}
                            <div className={styles.summaryRow} style={{ borderBottom: 'none', padding: '0' }}>
                                <span style={{ fontWeight: 800, fontSize: '1.2rem', color: 'var(--green-cream)' }}>TOTAL FINAL</span>
                                <span className={styles.summaryTotal} style={{ fontSize: '2rem' }}>
                                    ${promoResult.total.toLocaleString()}
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
                tipoEntrega: deliveryMethod,
                ventaEnFisico: deliveryMethod !== 'ENVIO_DOMICILIO',
                // Always send shipping data if at least one field is filled, or if it's mandatory
                envio: (deliveryMethod === 'ENVIO_DOMICILIO' || Object.values(shippingData).some(v => v.trim())) ? {
                    nombreCompleto: shippingData.nombreCompleto,
                    email: shippingData.email,
                    direccion: shippingData.direccion,
                    ciudad: shippingData.ciudad,
                    provincia: shippingData.provincia,
                    codigoPostal: shippingData.codigoPostal,
                    telefono: shippingData.telefono
                } : undefined
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
