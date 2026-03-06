import React, { useEffect, useState } from 'react';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuPackage } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { characteristicsService } from '../../services/characteristics.service';
import { AdminService } from '../../services/admin.service';
import type { Characteristic, ProductSummary } from '../../types/characteristics.types';
import StatTable from './StatTable';

const CharacteristicsListView: React.FC = () => {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [selectedChar, setSelectedChar] = useState<Characteristic | null>(null);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [viewProductsModal, setViewProductsModal] = useState(false);
    // Add Product state
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
    const [assocValue, setAssocValue] = useState('');
    const [searching, setSearching] = useState(false);
    const [associating, setAssociating] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadCharacteristics = async () => {
        try {
            setLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            const data = await characteristicsService.getAll();
            setCharacteristics(data);
        } catch (error) {
            console.error('Error loading characteristics:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se pudieron cargar las características');
            }
        } finally {
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    useEffect(() => {
        loadCharacteristics();
    }, []);

    const handleViewProducts = async (char: Characteristic) => {
        setSelectedChar(char);
        setShowAddProduct(false);
        setSelectedProduct(null);
        setSearchQuery('');
        setSearchResults([]);
        setAssocValue('');
        try {
            setModalLoading(true);
            setViewProductsModal(true);
            const data = await characteristicsService.getProducts(char.id);
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se pudieron cargar los productos asociados');
            }
        } finally {
            setModalLoading(false);
        }
    };

    const handleProductSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            return;
        }

        try {
            setSearching(true);
            const results = await AdminService.searchProducts(query);
            setSearchResults(results);
        } catch (error) {
            console.error('Error searching products:', error);
        } finally {
            setSearching(false);
        }
    };

    const handleSelectProduct = (product: any) => {
        const alreadyHasChar = products.some(p => p.id === product.id);
        if (alreadyHasChar) return;

        setSelectedProduct(product);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleAssociateProduct = async () => {
        if (!selectedChar || !selectedProduct || !assocValue.trim()) return;

        try {
            setAssociating(true);
            await characteristicsService.associate(selectedChar.id, selectedProduct.id, assocValue.trim());

            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Producto asociado correctamente');
            }

            // Refresh products list
            const data = await characteristicsService.getProducts(selectedChar.id);
            setProducts(data);

            // Increment count in local state
            setCharacteristics(prev => prev.map(c =>
                c.id === selectedChar.id ? { ...c, productCount: (c.productCount || 0) + 1 } : c
            ));

            // Reset state
            setShowAddProduct(false);
            setSelectedProduct(null);
            setAssocValue('');
        } catch (error: any) {
            console.error('Error associating product:', error);
            const msg = error.response?.status === 409
                ? 'El producto ya tiene esta característica'
                : 'Error al asociar el producto';
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', msg);
            }
        } finally {
            setAssociating(false);
        }
    };

    const handleEdit = (char: Characteristic) => {
        setSelectedChar(char);
        setEditName(char.nombre);
        setEditModal(true);
    };

    const handleDeleteClick = (char: Characteristic) => {
        if ((window as any).showDeleteCharacteristicModal) {
            (window as any).showDeleteCharacteristicModal(async () => {
                try {
                    setLoading(true);
                    if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                    await characteristicsService.delete(char.id);
                    setCharacteristics(prev => prev.filter(c => c.id !== char.id));
                    if ((window as any).triggerSileo) {
                        (window as any).triggerSileo('success', 'Característica eliminada');
                    }
                } finally {
                    setLoading(false);
                    if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
                }
            });
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            setModalLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            const created = await characteristicsService.create(newName);
            setCharacteristics([...characteristics, { ...created, productCount: 0 }]);
            setCreateModal(false);
            setNewName('');
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Característica creada');
            }
        } catch (error) {
            console.error('Error creating characteristic:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al crear la característica');
            }
        } finally {
            setModalLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    const handleUpdate = async () => {
        if (!selectedChar || !editName.trim()) return;
        try {
            setModalLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            await characteristicsService.update(selectedChar.id, editName);
            setCharacteristics(characteristics.map(c =>
                c.id === selectedChar.id ? { ...c, nombre: editName } : c
            ));
            setEditModal(false);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Característica actualizada');
            }
        } catch (error) {
            console.error('Error updating characteristic:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al actualizar la característica');
            }
        } finally {
            setModalLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.dashboardHeader}>
                        <h1>Gestión de Características</h1>
                        <button className={styles.createButton} onClick={() => setCreateModal(true)}>
                            <LuPlus /> Nueva Característica
                        </button>
                    </div>
                    <p>Administra los atributos de tus productos y sus asociaciones</p>
                </div>
            </header>

            <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                {loading ? (
                    <p>Cargando características...</p>
                ) : (
                    <StatTable
                        title="Características Disponibles"
                        headers={['Nombre', 'Productos Asociados', 'Acciones']}
                        data={characteristics}
                        renderRow={(char) => (
                            <tr key={char.id}>
                                <td><span className={styles.userCell}>{char.nombre}</span></td>
                                <td className={styles.amount}>{char.productCount || 0} productos</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        {char.productCount !== undefined && char.productCount > 0 && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleViewProducts(char)}
                                                title="Ver productos"
                                            >
                                                <LuEye size={18} />
                                            </button>
                                        )}
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEdit(char)}
                                            title="Editar"
                                        >
                                            <LuPencil size={18} />
                                        </button>
                                        {(char.productCount === undefined || char.productCount === 0) && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDeleteClick(char)}
                                                title="Eliminar"
                                            >
                                                <LuTrash2 size={18} />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        )}
                    />
                )}
            </div>

            {/* Modal: View Products */}
            {viewProductsModal && (
                <div className={styles.modalOverlay} onClick={() => setViewProductsModal(false)}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px', width: '95%' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPackage className={styles.modalIcon} />
                            <h2>{selectedChar?.nombre}</h2>
                            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Total: {products.length} productos</p>
                        </div>
                        <div className={`${styles.modalBody} ${styles.modalScrollList}`} style={{ margin: '0.5rem -1rem' }}>
                            <div style={{ padding: '0 1rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}>
                                <button
                                    className={styles.createButton}
                                    style={{ fontSize: '0.8rem', padding: '0.5rem 1rem' }}
                                    onClick={() => setShowAddProduct(true)}
                                >
                                    <LuPlus size={14} /> Asociar Producto
                                </button>
                            </div>

                            {modalLoading ? (
                                <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>Cargando productos...</p>
                            ) : products.length > 0 ? (
                                <div className={styles.tableContainer} style={{ margin: 0 }}>
                                    <table className={styles.table} style={{ minWidth: 'auto' }}>
                                        <thead>
                                            <tr>
                                                <th style={{ paddingLeft: '1rem', fontSize: '0.7rem' }}>Producto</th>
                                                <th style={{ fontSize: '0.7rem' }}>Valor</th>
                                                <th style={{ paddingRight: '1rem', fontSize: '0.7rem' }}>Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {products.map(p => (
                                                <tr key={p.id}>
                                                    <td style={{ paddingLeft: '1rem' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                            {p.foto ? (
                                                                <img src={p.foto} alt={p.nombre} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                                                            ) : (
                                                                <div style={{ width: '32px', height: '32px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                    <LuPackage size={14} style={{ opacity: 0.4 }} />
                                                                </div>
                                                            )}
                                                            <div style={{ fontWeight: '600', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }} title={p.nombre}>
                                                                {p.nombre}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style={{ fontSize: '0.85rem', color: 'var(--neon-green)', fontWeight: '600' }}>
                                                        {p.valor || '—'}
                                                    </td>
                                                    <td style={{ paddingRight: '1rem' }}>
                                                        <button
                                                            className={styles.actionBtn}
                                                            onClick={() => window.location.href = `/admin/products/${p.id}`}
                                                            title="Ver producto"
                                                            style={{ width: '32px', height: '32px' }}
                                                        >
                                                            <LuEye size={16} />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p style={{ textAlign: 'center', padding: '2rem', opacity: 0.6 }}>No hay productos asociados.</p>
                            )}
                        </div>
                        <button className={styles.modalCloseBtn} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }} onClick={() => setViewProductsModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal: Add Product to Characteristic */}
            {showAddProduct && (
                <div className={styles.modalOverlay} onClick={() => setShowAddProduct(false)}>
                    <div className={styles.modalContent} style={{ maxWidth: '400px', width: '95%' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPlus className={styles.modalIcon} />
                            <h2>Asociar a {selectedChar?.nombre}</h2>
                            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Busca un producto para asignarle un valor</p>
                        </div>
                        <div className={styles.modalBody}>
                            {!selectedProduct ? (
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        placeholder="Buscar producto por nombre..."
                                        value={searchQuery}
                                        onChange={(e) => handleProductSearch(e.target.value)}
                                        className={styles.searchInput}
                                        style={{ width: '100%', fontSize: '0.9rem', padding: '0.75rem' }}
                                        autoFocus
                                    />
                                    {searching && (
                                        <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', opacity: 0.5 }}>
                                            Buscando...
                                        </div>
                                    )}
                                    {searchResults.length > 0 && (
                                        <div className={styles.modalScrollList} style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            background: '#1a1a1a',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            borderRadius: '8px',
                                            zIndex: 20,
                                            maxHeight: '200px',
                                            overflowY: 'auto',
                                            boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                                            marginTop: '4px'
                                        }}>
                                            {searchResults.map(p => {
                                                const isAssociated = products.some(assoc => assoc.id === p.id);
                                                return (
                                                    <div
                                                        key={p.id}
                                                        onClick={() => !isAssociated && handleSelectProduct(p)}
                                                        style={{
                                                            padding: '0.75rem',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.75rem',
                                                            cursor: isAssociated ? 'not-allowed' : 'pointer',
                                                            background: 'transparent',
                                                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                                                            opacity: isAssociated ? 0.4 : 1
                                                        }}
                                                        onMouseEnter={(e) => !isAssociated && (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
                                                        onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                                    >
                                                        <img src={p.foto} style={{ width: '32px', height: '32px', borderRadius: '4px' }} alt="" />
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{p.nombre}</div>
                                                            <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>Stock: {p.stock}</div>
                                                        </div>
                                                        {isAssociated && <span style={{ fontSize: '0.65rem', color: 'var(--neon-green)', fontWeight: '600' }}>Ya asociado</span>}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '1rem',
                                        padding: '0.75rem',
                                        background: 'rgba(255,255,255,0.05)',
                                        borderRadius: '12px',
                                        border: '1px solid rgba(255,255,255,0.1)'
                                    }}>
                                        <img src={selectedProduct.foto} style={{ width: '48px', height: '48px', borderRadius: '8px' }} alt="" />
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: '0.9rem', fontWeight: '700', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{selectedProduct.nombre}</div>
                                            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>ID: {selectedProduct.id.substring(0, 8)}...</div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedProduct(null)}
                                            style={{ background: 'rgba(255,77,77,0.1)', border: 'none', color: '#ff4d4d', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }}
                                            title="Cambiar producto"
                                        >
                                            <LuTrash2 size={16} />
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.85rem', opacity: 0.7, paddingLeft: '0.25rem' }}>Valor de la característica</label>
                                        <input
                                            type="text"
                                            placeholder="Ej: Algodón, XL, 500ml..."
                                            value={assocValue}
                                            onChange={(e) => setAssocValue(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && assocValue.trim() && handleAssociateProduct()}
                                            style={{
                                                padding: '0.75rem',
                                                borderRadius: '8px',
                                                background: 'rgba(255,255,255,0.05)',
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                color: 'white',
                                                fontSize: '0.9rem'
                                            }}
                                            autoFocus
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <button
                                className={styles.modalCloseBtn}
                                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', flex: 1 }}
                                onClick={() => {
                                    setShowAddProduct(false);
                                    setSelectedProduct(null);
                                    setSearchQuery('');
                                    setSearchResults([]);
                                    setAssocValue('');
                                }}
                            >
                                Cancelar
                            </button>
                            <button
                                className={styles.modalCloseBtn}
                                style={{ flex: 1.5 }}
                                disabled={associating || !selectedProduct || !assocValue.trim()}
                                onClick={handleAssociateProduct}
                            >
                                {associating ? 'Asociando...' : 'Confirmar Asociación'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Edit */}
            {editModal && (
                <div className={styles.modalOverlay} onClick={() => setEditModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPencil className={styles.modalIcon} />
                            <h2>Editar Característica</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la característica</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,254,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setEditModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading} onClick={handleUpdate}>
                                {modalLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Create */}
            {createModal && (
                <div className={styles.modalOverlay} onClick={() => setCreateModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPlus className={styles.modalIcon} />
                            <h2>Nueva Característica</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la característica</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    placeholder="Ej: Material, Color, Talle..."
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setCreateModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading || !newName.trim()} onClick={handleCreate}>
                                {modalLoading ? 'Creando...' : 'Crear Característica'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacteristicsListView;
