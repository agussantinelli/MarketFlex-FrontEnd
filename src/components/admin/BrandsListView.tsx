import React, { useEffect, useState } from 'react';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuTriangleAlert, LuPackage, LuAward } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { brandService } from '../../services/brand.service';
import type { Brand, BrandWithCount, BrandProductSummary } from '../../types/brand.types';
import StatTable from './StatTable';

const BrandsListView: React.FC = () => {
    const [brands, setBrands] = useState<BrandWithCount[]>([]);
    const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
    const [products, setProducts] = useState<BrandProductSummary[]>([]);
    const [viewProductsModal, setViewProductsModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadBrands = async () => {
        try {
            setLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            const data = await brandService.getAll();
            setBrands(data);
        } catch (error) {
            console.error('Error loading brands:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se pudieron cargar las marcas');
            }
        } finally {
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    useEffect(() => {
        loadBrands();
    }, []);

    const handleViewProducts = async (brand: Brand) => {
        setSelectedBrand(brand);
        try {
            setModalLoading(true);
            setViewProductsModal(true);
            const data = await brandService.getProducts(brand.id);
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

    const handleEdit = (brand: Brand) => {
        setSelectedBrand(brand);
        setEditName(brand.nombre);
        setEditModal(true);
    };

    const handleDeleteClick = (brand: Brand) => {
        setSelectedBrand(brand);
        setDeleteModal(true);
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            setModalLoading(true);
            const created = await brandService.create(newName);
            setBrands([...brands, { ...created, productCount: 0 }]);
            setCreateModal(false);
            setNewName('');
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Marca creada exitosamente');
            }
        } catch (error) {
            console.error('Error creating brand:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al crear la marca');
            }
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedBrand || !editName.trim()) return;
        try {
            setModalLoading(true);
            const updated = await brandService.update(selectedBrand.id, editName);
            setBrands(brands.map(b =>
                b.id === selectedBrand.id ? { ...b, nombre: updated.nombre } : b
            ));
            setEditModal(false);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Marca actualizada');
            }
        } catch (error) {
            console.error('Error updating brand:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al actualizar la marca');
            }
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedBrand) return;
        try {
            setModalLoading(true);
            await brandService.delete(selectedBrand.id);
            setBrands(brands.filter(b => b.id !== selectedBrand.id));
            setDeleteModal(false);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Marca eliminada');
            }
        } catch (error) {
            console.error('Error deleting brand:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al eliminar la marca');
            }
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <div className={styles.dashboardHeader}>
                        <h1>Gestión de Marcas</h1>
                        <button className={styles.createButton} onClick={() => setCreateModal(true)}>
                            <LuPlus /> Nueva Marca
                        </button>
                    </div>
                    <p>Administra las editoriales y marcas de tus productos</p>
                </div>
            </header>

            <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                {loading ? (
                    <p>Cargando marcas...</p>
                ) : (
                    <StatTable
                        title="Marcas / Editoriales"
                        headers={['Nombre', 'Productos', 'Acciones']}
                        data={brands}
                        renderRow={(brand) => (
                            <tr key={brand.id}>
                                <td className={styles.userCell} style={{ fontWeight: '600' }}>{brand.nombre}</td>
                                <td className={styles.amount}>{brand.productCount || 0} productos</td>
                                <td>
                                    <div className={styles.actionButtons} style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleViewProducts(brand)}
                                            title="Ver productos"
                                        >
                                            <LuEye size={18} />
                                        </button>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEdit(brand)}
                                            title="Editar"
                                        >
                                            <LuPencil size={18} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => handleDeleteClick(brand)}
                                            title="Eliminar"
                                        >
                                            <LuTrash2 size={18} />
                                        </button>
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
                            <LuAward className={styles.modalIcon} />
                            <h2>{selectedBrand?.nombre}</h2>
                            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Lanzamientos: {products.length} productos</p>
                        </div>
                        <div className={`${styles.modalBody} ${styles.modalScrollList}`}>
                            {modalLoading ? (
                                <p>Cargando productos...</p>
                            ) : products.length > 0 ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                    {products.map(p => (
                                        <div key={p.id} className={styles.productItem}>
                                            {p.foto ? (
                                                <img src={p.foto} alt={p.nombre} style={{ width: '35px', height: '35px', borderRadius: '6px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '35px', height: '35px', borderRadius: '6px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                    <LuPackage size={14} style={{ opacity: 0.4 }} />
                                                </div>
                                            )}
                                            <div style={{ flex: 1, textAlign: 'left' }}>
                                                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{p.nombre}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No hay productos registrados para esta marca.</p>
                            )}
                        </div>
                        <button className={styles.modalCloseBtn} style={{ padding: '0.6rem 1.5rem', fontSize: '0.9rem' }} onClick={() => setViewProductsModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}

            {/* Modal: Edit */}
            {editModal && (
                <div className={styles.modalOverlay} onClick={() => setEditModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPencil className={styles.modalIcon} />
                            <h2>Editar Marca</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la marca / editorial</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,254,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setEditModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading || !editName.trim()} onClick={handleUpdate}>
                                {modalLoading ? 'Guardando...' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal: Delete */}
            {deleteModal && (
                <div className={styles.modalOverlay} onClick={() => setDeleteModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader} style={{ color: '#ef4444' }}>
                            <LuTriangleAlert className={styles.modalIcon} />
                            <h2>¿Eliminar Marca?</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Estás a punto de eliminar <strong>{selectedBrand?.nombre}</strong>. </p>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                Esta acción eliminará la asociación con todos los productos, pero los productos en sí no se verán afectados.
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setDeleteModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} style={{ background: '#ef4444' }} disabled={modalLoading} onClick={handleDelete}>
                                {modalLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
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
                            <h2>Nueva Marca</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la marca / editorial</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ej: Nike, Adidas, Salamandra..."
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setCreateModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading || !newName.trim()} onClick={handleCreate}>
                                {modalLoading ? 'Creando...' : 'Crear Marca'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrandsListView;
