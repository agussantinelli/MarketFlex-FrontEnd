import React, { useState, useEffect } from 'react';
import type { Promotion, CreatePromotionInput } from '../../types/promotion.types';
import { categoryService } from '../../services/category.service';
import * as productService from '../../services/product.service';
import type { Category } from '../../types/category.types';
import { LuSave, LuX, LuSearch, LuCheck, LuPlus } from 'react-icons/lu';
import styles from './styles/PromotionForm.module.css';

interface PromotionFormProps {
    promotion: Promotion | undefined;
    onSubmit: (data: CreatePromotionInput) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

const PromotionForm: React.FC<PromotionFormProps> = ({ promotion, onSubmit, onCancel, loading: externalLoading }) => {
    const isEdit = !!promotion;
    const [formData, setFormData] = useState<CreatePromotionInput>({
        nombre: promotion?.nombre || '',
        descripcion: promotion?.descripcion || '',
        tipoPromocion: promotion?.tipoPromocion || 'NxM',
        alcance: promotion?.alcance || 'GLOBAL',
        fechaInicio: (promotion?.fechaInicio ? new Date(promotion.fechaInicio).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]) as string,
        fechaFin: (promotion?.fechaFin ? new Date(promotion.fechaFin).toISOString().split('T')[0] : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]) as string,
        foto: promotion?.foto || '',
        esDestacado: promotion?.esDestacado || false,
        estado: promotion?.estado || 'PENDIENTE',
        cantCompra: promotion?.cantCompra || 2,
        cantPaga: promotion?.cantPaga || 1,
        porcentajeDescuentoSegunda: promotion?.porcentajeDescuentoSegunda || '50.00',
        categoryIds: promotion?.categoryIds || [],
        productIds: promotion?.productIds || []
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [productSearch, setProductSearch] = useState('');
    const [loadingData, setLoadingData] = useState(false);

    useEffect(() => {
        const loadInitialData = async () => {
            setLoadingData(true);
            try {
                const cats = await categoryService.getCategories();
                setCategories(cats);

                // Load some initial products for selection
                const prodResponse = await productService.getProducts(1, 50);
                setProducts(prodResponse.data || []);
            } catch (error) {
                console.error('Error loading form data:', error);
            } finally {
                setLoadingData(false);
            }
        };
        loadInitialData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleToggleId = (listName: 'categoryIds' | 'productIds', id: string) => {
        setFormData(prev => {
            const currentList = (prev[listName] as string[]) || [];
            const newList = currentList.includes(id)
                ? currentList.filter(i => i !== id)
                : [...currentList, id];
            return { ...prev, [listName]: newList };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const filteredProducts = products.filter(p =>
        p.nombre.toLowerCase().includes(productSearch.toLowerCase())
    );

    return (
        <form onSubmit={handleSubmit} className={styles.promoForm}>
            <div className={styles.formGrid}>
                {/* Basic Info */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Información Básica</h3>
                    <div className={styles.inputGroup}>
                        <label>Nombre de la Promoción</label>
                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            placeholder="Ej: 2x1 en Clásicos"
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label>Descripción</label>
                        <textarea
                            name="descripcion"
                            value={formData.descripcion || ''}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Describe los beneficios de esta promoción..."
                        />
                    </div>
                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Estado</label>
                            <select name="estado" value={formData.estado} onChange={handleChange}>
                                <option value="PENDIENTE">PENDIENTE</option>
                                <option value="ACTIVO">ACTIVO</option>
                                <option value="INACTIVO">INACTIVO</option>
                            </select>
                        </div>
                        <div className={styles.inputGroup}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '32px' }}>
                                <input
                                    type="checkbox"
                                    name="esDestacado"
                                    checked={formData.esDestacado}
                                    onChange={handleChange}
                                />
                                <span>Destacar en Inicio (Hero)</span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Configuration */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Configuración de Oferta</h3>
                    <div className={styles.inputGroup}>
                        <label>Tipo de Promoción</label>
                        <select name="tipoPromocion" value={formData.tipoPromocion} onChange={handleChange}>
                            <option value="NxM">NxM (Ej: 3x2, 2x1)</option>
                            <option value="DESCUENTO_SEGUNDA_UNIDAD">Descuento 2da Unidad</option>
                        </select>
                    </div>

                    {formData.tipoPromocion === 'NxM' && (
                        <div className={styles.row}>
                            <div className={styles.inputGroup}>
                                <label>Lleva (N)</label>
                                <input
                                    type="number"
                                    name="cantCompra"
                                    value={formData.cantCompra || 2}
                                    onChange={handleChange}
                                    min={2}
                                />
                            </div>
                            <div className={styles.inputGroup}>
                                <label>Paga (M)</label>
                                <input
                                    type="number"
                                    name="cantPaga"
                                    value={formData.cantPaga || 1}
                                    onChange={handleChange}
                                    min={1}
                                />
                            </div>
                        </div>
                    )}

                    {formData.tipoPromocion === 'DESCUENTO_SEGUNDA_UNIDAD' && (
                        <div className={styles.inputGroup}>
                            <label>% Descuento en la 2da unidad</label>
                            <input
                                type="text"
                                name="porcentajeDescuentoSegunda"
                                value={formData.porcentajeDescuentoSegunda || '50.00'}
                                onChange={handleChange}
                                placeholder="70.00"
                            />
                        </div>
                    )}

                    <div className={styles.row}>
                        <div className={styles.inputGroup}>
                            <label>Fecha Inicio</label>
                            <input
                                type="date"
                                name="fechaInicio"
                                value={formData.fechaInicio}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className={styles.inputGroup}>
                            <label>Fecha Fin</label>
                            <input
                                type="date"
                                name="fechaFin"
                                value={formData.fechaFin}
                                onChange={handleChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Media */}
                <div className={styles.formSection}>
                    <h3 className={styles.sectionTitle}>Imagen y Alcance</h3>
                    <div className={styles.inputGroup}>
                        <label>URL de la Foto {formData.esDestacado && <span style={{ color: 'var(--neon-orange)' }}>* Requerido p/ destacados</span>}</label>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <input
                                type="text"
                                name="foto"
                                value={formData.foto || ''}
                                onChange={handleChange}
                                placeholder="https://..."
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    {formData.foto && (
                        <div className={styles.imagePreview}>
                            <img src={formData.foto} alt="Preview" />
                        </div>
                    )}

                    <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
                        <label>Alcance de la Promoción</label>
                        <select name="alcance" value={formData.alcance} onChange={handleChange}>
                            <option value="GLOBAL">GLOBAL (Todo el catálogo)</option>
                            <option value="POR_TIPO">POR CATEGORÍA (Seleccionar...)</option>
                            <option value="POR_PRODUCTO">POR PRODUCTO (Seleccionar...)</option>
                        </select>
                    </div>
                </div>

                {/* Scope Selection */}
                {(formData.alcance === 'POR_TIPO' || formData.alcance === 'POR_PRODUCTO') && (
                    <div className={styles.formSection} style={{ gridColumn: '1 / -1' }}>
                        <h3 className={styles.sectionTitle}>
                            Selección de {formData.alcance === 'POR_TIPO' ? 'Categorías' : 'Productos'}
                            <span className={styles.badge} style={{ marginLeft: '1rem' }}>
                                {formData.alcance === 'POR_TIPO' ? formData.categoryIds?.length : formData.productIds?.length} seleccionados
                            </span>
                        </h3>

                        {formData.alcance === 'POR_TIPO' ? (
                            <div className={styles.selectionGrid}>
                                {categories.map(cat => (
                                    <div
                                        key={cat.id}
                                        className={`${styles.selectItem} ${formData.categoryIds?.includes(cat.id) ? styles.active : ''}`}
                                        onClick={() => handleToggleId('categoryIds', cat.id)}
                                    >
                                        {formData.categoryIds?.includes(cat.id) ? <LuCheck /> : <LuPlus />}
                                        {cat.nombre}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.productSelection}>
                                <div className={styles.searchBar}>
                                    <LuSearch />
                                    <input
                                        type="text"
                                        placeholder="Buscar productos para la promoción..."
                                        value={productSearch}
                                        onChange={(e) => setProductSearch(e.target.value)}
                                    />
                                </div>
                                <div className={styles.selectionList} style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
                                    {filteredProducts.map(p => (
                                        <div
                                            key={p.id}
                                            className={`${styles.productRow} ${formData.productIds?.includes(p.id) ? styles.active : ''}`}
                                            onClick={() => handleToggleId('productIds', p.id)}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                                <img src={p.foto} alt={p.nombre} style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }} />
                                                <span>{p.nombre}</span>
                                            </div>
                                            {formData.productIds?.includes(p.id) ? <LuCheck color="var(--primary)" /> : <LuPlus opacity={0.5} />}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.formActions}>
                <button type="button" onClick={onCancel} className={styles.cancelBtn}>
                    <LuX /> Cancelar
                </button>
                <button type="submit" disabled={externalLoading || loadingData} className={styles.saveBtn}>
                    <LuSave /> {isEdit ? 'Guardar Cambios' : 'Crear Promoción'}
                </button>
            </div>
        </form>
    );
};

export default PromotionForm;
