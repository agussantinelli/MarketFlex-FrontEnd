import React, { useEffect, useState } from 'react';
import { LuPlus, LuEye, LuPencil, LuTrash2, LuTriangleAlert, LuPackage } from 'react-icons/lu';
import styles from './styles/dashboard.module.css';
import { characteristicsService } from '../../services/characteristics.service';
import type { Characteristic, ProductSummary } from '../../types/characteristics.types';
import StatTable from './StatTable';

const CharacteristicsListView: React.FC = () => {
    const [characteristics, setCharacteristics] = useState<Characteristic[]>([]);
    const [selectedChar, setSelectedChar] = useState<Characteristic | null>(null);
    const [products, setProducts] = useState<ProductSummary[]>([]);
    const [viewProductsModal, setViewProductsModal] = useState(false);
    const [editModal, setEditModal] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
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

    const handleEdit = (char: Characteristic) => {
        setSelectedChar(char);
        setEditName(char.nombre);
        setEditModal(true);
    };

    const handleDeleteClick = (char: Characteristic) => {
        setSelectedChar(char);
        setDeleteModal(true);
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

    const handleDelete = async () => {
        if (!selectedChar) return;
        try {
            setModalLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();
            await characteristicsService.delete(selectedChar.id);
            setCharacteristics(characteristics.filter(c => c.id !== selectedChar.id));
            setDeleteModal(false);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Característica eliminada');
            }
        } catch (error) {
            console.error('Error deleting characteristic:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al eliminar la característica');
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
                                <td className={styles.userCell} style={{ fontWeight: '600' }}>{char.nombre}</td>
                                <td className={styles.amount}>{char.productCount || 0} productos</td>
                                <td>
                                    <div className={styles.actionButtons} style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleViewProducts(char)}
                                            title="Ver productos"
                                        >
                                            <LuEye size={18} />
                                        </button>
                                        <button
                                            className={styles.actionBtn}
                                            onClick={() => handleEdit(char)}
                                            title="Editar"
                                        >
                                            <LuPencil size={18} />
                                        </button>
                                        <button
                                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                                            onClick={() => handleDeleteClick(char)}
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
                            <LuPackage className={styles.modalIcon} />
                            <h2>{selectedChar?.nombre}</h2>
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
                                                {p.valor && (
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--neon-green)', opacity: 0.8, marginTop: '1px' }}>
                                                        {selectedChar?.nombre}: <span style={{ color: '#fff', opacity: 0.7 }}>{p.valor}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No hay productos asociados.</p>
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
                            <h2>Editar Característica</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la característica</label>
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
                            <button className={styles.modalCloseBtn} disabled={modalLoading} onClick={handleUpdate}>
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
                            <h2>¿Eliminar Característica?</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>Estás a punto de eliminar <strong>{selectedChar?.nombre}</strong>. </p>
                            <p style={{ fontSize: '0.9rem', color: '#94a3b8', marginTop: '0.5rem' }}>
                                Esta acción eliminará las asociaciones con todos los productos, pero los productos en sí no se verán afectados.
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
                            <h2>Nueva Característica</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                <label style={{ fontSize: '0.9rem', color: '#94a3b8' }}>Nombre de la característica</label>
                                <input
                                    type="text"
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
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
