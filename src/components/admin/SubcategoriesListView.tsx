import React, { useEffect, useState } from 'react';
import { LuPlus, LuPencil, LuTrash2, LuArrowLeft } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { subcategoryService } from '../../services/subcategory.service';
import type { Subcategory } from '../../types/subcategory.types';
import StatTable from './StatTable';

interface Props {
    categoriaId: string;
}

const SubcategoriesListView: React.FC<Props> = ({ categoriaId }) => {
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null);
    const [editModal, setEditModal] = useState(false);
    const [createModal, setCreateModal] = useState(false);
    const [editName, setEditName] = useState('');
    const [newName, setNewName] = useState('');
    const [modalLoading, setModalLoading] = useState(false);
    const [loading, setLoading] = useState(true);

    const loadSubcategories = async () => {
        try {
            setLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            const data = await subcategoryService.getSubcategories(categoriaId);
            setSubcategories(data);
        } catch (error) {
            console.error('Error loading subcategories:', error);
        } finally {
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    useEffect(() => {
        loadSubcategories();
    }, [categoriaId]);

    const handleEdit = (sub: Subcategory) => {
        setSelectedSub(sub);
        setEditName(sub.nombre);
        setEditModal(true);
    };

    const handleDeleteClick = (sub: Subcategory) => {
        if ((window as any).showDeleteSubcategoryModal) {
            (window as any).showDeleteSubcategoryModal(async () => {
                try {
                    setLoading(true);
                    if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                    const success = await subcategoryService.deleteSubcategory(categoriaId, sub.nroSubcategoria);
                    if (success) {
                        setSubcategories(prev => prev.filter(s => s.nroSubcategoria !== sub.nroSubcategoria));
                        if ((window as any).triggerSileo) {
                            (window as any).triggerSileo('success', 'Subcategoría eliminada');
                        }
                    }
                } catch (error) {
                    console.error('Error deleting subcategory:', error);
                } finally {
                    setLoading(false);
                    if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
                }
            });
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;

        const isDuplicate = subcategories.some(s => s.nombre.toLowerCase() === newName.trim().toLowerCase());
        if (isDuplicate) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Ya existe esa subcategoría');
            }
            return;
        }

        try {
            setModalLoading(true);
            const created = await subcategoryService.createSubcategory(categoriaId, newName);
            if (created) {
                setSubcategories([...subcategories, { ...created, productCount: 0 }]);
                setCreateModal(false);
                setNewName('');
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', 'Subcategoría creada');
                }
            }
        } catch (error) {
            console.error('Error creating subcategory:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const handleUpdate = async () => {
        if (!selectedSub || !editName.trim()) return;

        const isDuplicate = subcategories.some(s =>
            s.nroSubcategoria !== selectedSub.nroSubcategoria &&
            s.nombre.toLowerCase() === editName.trim().toLowerCase()
        );
        if (isDuplicate) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Ya existe otra subcategoría con ese nombre');
            }
            return;
        }

        try {
            setModalLoading(true);
            const updated = await subcategoryService.updateSubcategory(categoriaId, selectedSub.nroSubcategoria, editName);
            if (updated) {
                setSubcategories(subcategories.map(s =>
                    s.nroSubcategoria === selectedSub.nroSubcategoria ? { ...s, nombre: updated.nombre } : s
                ));
                setEditModal(false);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', 'Subcategoría actualizada');
                }
            }
        } catch (error) {
            console.error('Error updating subcategory:', error);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className={styles.dashboardContainer} style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <header className={styles.header} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <a
                        href="/admin/categories"
                        className={styles.actionBtn}
                        title="Volver a Categorías"
                        style={{
                            width: '40px',
                            height: '40px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '10px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'var(--neon-green)'
                        }}
                    >
                        <LuArrowLeft size={20} />
                    </a>
                    <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: 'var(--neon-green)' }}>
                        Subcategorías
                    </h1>
                    <button className={styles.createButton} onClick={() => setCreateModal(true)} style={{ marginLeft: 'auto' }}>
                        <LuPlus /> Nueva Subcategoría
                    </button>
                </div>
                <p style={{ opacity: 0.7, marginLeft: '3.75rem' }}>Gestiona las subcategorías asociadas a esta categoría principal.</p>
            </header>

            <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr' }}>
                {loading ? (
                    <p>Cargando subcategorías...</p>
                ) : (
                    <StatTable
                        title="Lista de Subcategorías"
                        headers={['Nombre', 'Productos', 'Acciones']}
                        data={subcategories}
                        renderRow={(sub) => (
                            <tr key={`${sub.categoriaId}-${sub.nroSubcategoria}`}>
                                <td><span className={styles.userCell}>{sub.nombre}</span></td>
                                <td className={styles.amount}>{sub.productCount || 0} productos</td>
                                <td>
                                    <div className={styles.actionButtons}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEdit(sub)}
                                            title="Editar"
                                        >
                                            <LuPencil size={18} />
                                        </button>
                                        {(sub.productCount === undefined || sub.productCount === 0) && (
                                            <button
                                                className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                                onClick={() => handleDeleteClick(sub)}
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

            {/* Modal: Edit */}
            {editModal && (
                <div className={styles.modalOverlay} onClick={() => setEditModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPencil className={styles.modalIcon} />
                            <h2>Editar Subcategoría</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,254,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    autoFocus
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

            {/* Modal: Create */}
            {createModal && (
                <div className={styles.modalOverlay} onClick={() => setCreateModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPlus className={styles.modalIcon} />
                            <h2>Nueva Subcategoría</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                                    placeholder="Ej: Ficción, Terror, Juvenil..."
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                    autoFocus
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setCreateModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading || !newName.trim()} onClick={handleCreate}>
                                {modalLoading ? 'Creando...' : 'Crear Subcategoría'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubcategoriesListView;
