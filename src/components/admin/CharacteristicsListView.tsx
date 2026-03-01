import React, { useEffect, useState } from 'react';
import { LuEye, LuPencil, LuTrash2, LuTriangleAlert, LuPackage } from 'react-icons/lu';
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
    const [editName, setEditName] = useState('');
    const [modalLoading, setModalLoading] = useState(false);

    const loadCharacteristics = async () => {
        try {
            const data = await characteristicsService.getAll();
            setCharacteristics(data);
        } catch (error) {
            console.error('Error loading characteristics:', error);
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

    const onUpdate = async () => {
        if (!selectedChar || !editName.trim()) return;
        try {
            setModalLoading(true);
            await characteristicsService.update(selectedChar.id, editName);
            await loadCharacteristics();
            setEditModal(false);
        } catch (error) {
            console.error('Error updating:', error);
        } finally {
            setModalLoading(false);
        }
    };

    const onDelete = async () => {
        if (!selectedChar) return;
        try {
            setModalLoading(true);
            await characteristicsService.delete(selectedChar.id);
            await loadCharacteristics();
            setDeleteModal(false);
        } catch (error) {
            console.error('Error deleting:', error);
        } finally {
            setModalLoading(false);
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Gestión de Características</h1>
                    <p>Administra los atributos de tus productos y sus asociaciones</p>
                </div>
            </header>

            <div className={styles.statsGrid} style={{ gridTemplateColumns: '1fr', marginTop: '1rem' }}>
                <StatTable
                    title="Características Disponibles"
                    headers={['Nombre', 'Productos Asociados', 'Acciones']}
                    data={characteristics}
                    renderRow={(char) => (
                        <tr key={char.id}>
                            <td className={styles.userCell} style={{ fontWeight: '600' }}>{char.nombre}</td>
                            <td className={styles.amount}>{char.productCount} productos</td>
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
                                        className={styles.actionBtn}
                                        onClick={() => handleDeleteClick(char)}
                                        title="Eliminar"
                                        style={{ color: '#ef4444' }}
                                    >
                                        <LuTrash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    )}
                />
            </div>

            {/* Modal: View Products */}
            {viewProductsModal && (
                <div className={styles.modalOverlay} onClick={() => setViewProductsModal(false)}>
                    <div className={styles.modalContent} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuPackage className={styles.modalIcon} />
                            <h2>Productos con {selectedChar?.nombre}</h2>
                        </div>
                        <div className={styles.modalBody}>
                            {modalLoading ? (
                                <p>Cargando productos...</p>
                            ) : products.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {products.map(p => (
                                        <li key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                            {p.foto ? (
                                                <img src={p.foto} alt={p.nombre} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                            ) : (
                                                <div style={{ width: '40px', height: '40px', borderRadius: '4px', background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <LuPackage size={16} />
                                                </div>
                                            )}
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontWeight: '500' }}>{p.nombre}</div>
                                                {p.valor && <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Valor: {p.valor}</div>}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No hay productos asociados a esta característica.</p>
                            )}
                        </div>
                        <button className={styles.modalCloseBtn} onClick={() => setViewProductsModal(false)}>Cerrar</button>
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
                                    style={{ padding: '0.75rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}
                                />
                            </div>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                            <button className={styles.modalCloseBtn} style={{ background: 'transparent', border: '1px solid #334155' }} onClick={() => setEditModal(false)}>Cancelar</button>
                            <button className={styles.modalCloseBtn} disabled={modalLoading} onClick={onUpdate}>
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
                            <button className={styles.modalCloseBtn} style={{ background: '#ef4444' }} disabled={modalLoading} onClick={onDelete}>
                                {modalLoading ? 'Eliminando...' : 'Eliminar permanentemente'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CharacteristicsListView;
