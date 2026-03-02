import React, { useEffect, useState } from 'react';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuTriangleAlert, LuPackage, LuLayers } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { categoryService } from '../../services/category.service';
import type { Category, CategoryWithCount, CategoryProductSummary } from '../../types/category.types';
import StatTable from './StatTable';

const CategoriesListView: React.FC = () => {
    const [categories, setCategories] = useState<CategoryWithCount[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [products, setProducts] = useState<CategoryProductSummary[]>([]);
    const [viewProductsModal, setViewProductsModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadCategories = async () => {
        try {
            setLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            const data = await categoryService.getCategories();
            setCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'No se pudieron cargar las categorías');
            }
        } finally {
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const handleViewProducts = async (category: Category) => {
        setSelectedCategory(category);
        try {
            setModalLoading(true);
            setViewProductsModal(true);
            const data = await categoryService.getProductsByCategory(category.id);
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

    const handleEdit = (category: Category) => {
        setSelectedCategory(category);
        setEditName(category.nombre);
        setEditModal(true);
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setDeleteModal(true);
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            setModalLoading(true);
            const created = await categoryService.createCategory(newName);
            if (created) {
                setCategories([...categories, { ...created, productCount: 0 }]);
                setCreateModal(false);
                setNewName('');
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', 'Categoría creada exitosamente');
                }
            }
        } catch (error) {
            console.error('Error creating category:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al crear la categoría');
            }
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedCategory || !editName.trim()) return;
        try {
            setModalLoading(true);
            const updated = await categoryService.updateCategory(selectedCategory.id, editName);
            if (updated) {
                setCategories(categories.map(c =>
                    c.id === selectedCategory.id ? { ...c, nombre: updated.nombre } : c
                ));
                setEditModal(false);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', 'Categoría actualizada');
                }
            }
        } catch (error) {
            console.error('Error updating category:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al actualizar la categoría');
            }
        } finally {
            setModalLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedCategory) return;
        try {
            setModalLoading(true);
            const success = await categoryService.deleteCategory(selectedCategory.id);
            if (success) {
                setCategories(categories.filter(c => c.id !== selectedCategory.id));
                setDeleteModal(false);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', 'Categoría eliminada');
                }
            } else {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'No se puede eliminar la categoría porque tiene productos asociados');
                }
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al eliminar la categoría');
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
                        <h1>Gestión de Categorías</h1>
                        <button className={styles.createButton} onClick={() => setCreateModal(true)}>
                            <LuPlus /> Nueva Categoría
                        </button>
                    </div>
                    <p>Administra las categorías principales de tu catálogo</p>
                </div>
            </header>

            <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                {loading ? (
                    <p>Cargando categorías...</p>
                ) : (
                    <StatTable
                        title="Categorías"
                        headers={['Nombre', 'Productos', 'Acciones']}
                        data={categories}
                        renderRow={(category) => (
                            <tr key={category.id}>
                                <td><span className={styles.userCell}>{category.nombre}</span></td>
                                <td className={styles.amount}>{category.productCount || 0} productos</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        {category.productCount !== undefined && category.productCount > 0 && (
                                            <button
                                                className={styles.actionBtn}
                                                onClick={() => handleViewProducts(category)}
                                                title="Ver productos"
                                            >
                                                <LuEye size={18} />
                                            </button>
                                        )}
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEdit(category)}
                                            title="Editar"
                                        >
                                            <LuPencil size={18} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => handleDeleteClick(category)}
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
                            <LuLayers className={styles.modalIcon} />
                            <h2>{selectedCategory?.nombre}</h2>
                            <p style={{ margin: 0, opacity: 0.6, fontSize: '0.85rem' }}>Total: {products.length} productos</p>
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
                                <p>No hay productos registrados en esta categoría.</p>
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
                            <h2>Editar Categoría</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la categoría</label>
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
                            <h2>¿Eliminar Categoría?</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Estás a punto de eliminar <strong>{selectedCategory?.nombre}</strong>. </p>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                Esta acción solo se permitirá si no hay productos asociados a esta categoría.
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
                            <h2>Nueva Categoría</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la categoría</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Ej: Libro, Revista, Coleccionable..."
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setCreateModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading || !newName.trim()} onClick={handleCreate}>
                                {modalLoading ? 'Creando...' : 'Crear Categoría'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoriesListView;
