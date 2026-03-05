import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/admin.service';
import { uploadService } from '../../services/upload.service';
import { api } from '../../lib/api';
import styles from './styles/dashboard.module.css';
import { LuArrowLeft, LuUpload, LuX, LuPlus, LuSparkles } from 'react-icons/lu';

interface Category {
    id: string;
    nombre: string;
}

interface Subcategory {
    categoriaId: string;
    nroSubcategoria: number;
    nombre: string;
}

const CreateProductView: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);

    // Form state
    const [nombre, setNombre] = useState('');
    const [descripcion, setDescripcion] = useState('');
    const [precioActual, setPrecioActual] = useState(0);
    const [stock, setStock] = useState(0);
    const [marca, setMarca] = useState('');
    const [categoriaId, setCategoriaId] = useState('');
    const [nroSubcategoria, setNroSubcategoria] = useState<number | ''>('');
    const [foto, setFoto] = useState('');
    const [esDestacado, setEsDestacado] = useState(false);

    // Dynamic arrays
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [caracteristicas, setCaracteristicas] = useState<{ nombre: string, valor: string }[]>([]);
    const [charName, setCharName] = useState('');
    const [charValue, setCharValue] = useState('');

    const [loading, setLoading] = useState(false);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [generatingTags, setGeneratingTags] = useState(false);

    useEffect(() => {
        // Fetch categories for the dropdown
        const fetchCategories = async () => {
            try {
                // Adjusting based on filterService format natively available in API
                const results = await api.get('categories').json<{ data: Category[] }>();
                if (results && results.data) setCategories(results.data);
            } catch (err) {
                console.error("Failed to fetch categories", err);
            }
        };
        fetchCategories();

        if ((window as any).triggerSileo) {
            (window as any).triggerSileo('info', 'Completá los campos para crear un nuevo producto.');
        }
    }, []);

    // Load subcategories dynamically when a category is selected
    useEffect(() => {
        if (!categoriaId) {
            setSubcategories([]);
            return;
        }

        const fetchSubcategories = async () => {
            try {
                const results = await api.get(`subcategories?categoriaId=${categoriaId}`).json<{ data: Subcategory[] }>();
                if (results && results.data) setSubcategories(results.data);
            } catch (err) {
                console.error("Failed to fetch subcategories", err);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'Error al cargar subcategorías');
                }
            }
        };
        fetchSubcategories();
    }, [categoriaId]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const url = await uploadService.uploadImage(file, 'marketflex/products');
            setFoto(url);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('success', 'Imagen subida correctamente');
            }
        } catch (error) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al subir la imagen');
            }
        } finally {
            setUploadingImage(false);
        }
    };

    const handleGenerateTags = async () => {
        if (!nombre || !descripcion) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('warning', 'Ingresá el nombre y la descripción primero.');
            }
            return;
        }

        setGeneratingTags(true);
        try {
            const result = await AdminService.generateTags(nombre, descripcion);
            if (result.status === 'success' && result.data) {
                const newTags = result.data.filter(t => !tags.includes(t));
                if (newTags.length > 0) {
                    setTags([...tags, ...newTags]);
                }
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', 'Tags generados con IA');
                }
            } else {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', result.message || 'Error al generar tags');
                }
            }
        } catch (error) {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error crítico al contactar la IA');
            }
        } finally {
            setGeneratingTags(false);
        }
    };

    const addTag = (e: React.KeyboardEvent | React.MouseEvent) => {
        if ('key' in e && e.key !== 'Enter') return;
        e.preventDefault();
        const trimmed = tagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const addCaracteristica = (e: React.FormEvent) => {
        e.preventDefault();
        const n = charName.trim();
        const v = charValue.trim();
        if (n && v) {
            setCaracteristicas([...caracteristicas, { nombre: n, valor: v }]);
            setCharName('');
            setCharValue('');
        }
    };

    const removeCaracteristica = (index: number) => {
        setCaracteristicas(caracteristicas.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!nombre || !descripcion || !precioActual || !stock || !marca || !categoriaId || nroSubcategoria === '') {
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('warning', 'Por favor, completá todos los campos base obligatorios.');
            }
            return;
        }

        const payload = {
            nombre,
            descripcion,
            precioActual: Number(precioActual),
            stock: Number(stock),
            marca,
            categoriaId,
            nroSubcategoria: Number(nroSubcategoria),
            foto: foto || undefined,
            esDestacado,
            tags,
            caracteristicas
        };

        try {
            setLoading(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();

            const result = await AdminService.createProduct(payload);

            if (result.status === 'success') {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', '¡Producto creado exitosamente!');
                }
                setTimeout(() => {
                    window.location.href = '/admin/products';
                }, 1500);
            } else {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', result.message || 'Error al crear el producto');
                }
            }
        } catch (error) {
            console.error('Error creating product:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error crítico al procesar la solicitud');
            }
        } finally {
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    // UI helpers

    return (
        <div style={{ padding: '0 1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
                <a
                    href="/admin/products"
                    className={styles.actionBtn}
                    style={{
                        width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '10px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: 'var(--neon-green)', transition: 'all 0.3s ease'
                    }}
                >
                    <LuArrowLeft size={20} />
                </a>
                <h1 style={{ margin: 0, fontSize: '2.5rem', fontWeight: '800', color: 'var(--neon-green)', letterSpacing: '-1px' }}>
                    Nuevo Producto
                </h1>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Info Básica */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                        <label htmlFor="nombre" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Nombre del Producto *</label>
                        <input id="nombre" required type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                            style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: '1 / -1' }}>
                        <label htmlFor="descripcion" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Descripción *</label>
                        <textarea id="descripcion" required value={descripcion} onChange={e => setDescripcion(e.target.value)} rows={4}
                            style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="precioActual" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Precio ($) *</label>
                        <input id="precioActual" required type="number" step="0.01" min="0" value={precioActual} onChange={e => setPrecioActual(Number(e.target.value))}
                            style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="stock" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Stock Inicial *</label>
                        <input id="stock" required type="number" min="0" value={stock} onChange={e => setStock(Number(e.target.value))}
                            style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                    </div>
                </div>

                {/* Relaciones Básicas */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label htmlFor="categoriaId" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Categoría *</label>
                        <select id="categoriaId" required value={categoriaId} onChange={e => { setCategoriaId(e.target.value); setNroSubcategoria(''); }}
                            style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
                            <option value="" style={{ background: '#1a1a1a', color: 'white' }}>Seleccionar Categoría...</option>
                            {categories.map(c => <option key={c.id} value={c.id} style={{ background: '#1a1a1a', color: 'white' }}>{c.nombre}</option>)}
                        </select>
                    </div>

                    {subcategories.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <label htmlFor="nroSubcategoria" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Subcategoría *</label>
                            <select id="nroSubcategoria" required value={nroSubcategoria} onChange={e => setNroSubcategoria(Number(e.target.value))} disabled={!categoriaId}
                                style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white', opacity: !categoriaId ? 0.5 : 1 }}>
                                <option value="" style={{ background: '#1a1a1a', color: 'white' }}>Seleccionar Subcategoría...</option>
                                {subcategories.map(s => <option key={s.nroSubcategoria} value={s.nroSubcategoria} style={{ background: '#1a1a1a', color: 'white' }}>{s.nombre}</option>)}
                            </select>
                        </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', gridColumn: subcategories.length > 0 ? '1 / -1' : 'auto' }}>
                        <label htmlFor="marca" style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Marca (Creatable) *</label>
                        <input id="marca" required type="text" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Ej: Nike, Sony, Editorial Planeta..."
                            style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Si la marca no existe, se creará automáticamente.</span>
                    </div>
                </div>

                {/* Subida de Imagen y Tags */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <label style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Imagen Principal</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            {foto ? (
                                <img src={foto} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '12px', border: '1px solid var(--neon-green)' }} />
                            ) : (
                                <div style={{ width: '80px', height: '80px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px dashed rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <LuUpload size={24} color="rgba(255,255,255,0.3)" />
                                </div>
                            )}
                            <div style={{ flex: 1 }}>
                                <input type="file" id="productImage" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} />
                                <label htmlFor="productImage" style={{ display: 'inline-flex', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', color: 'white', fontWeight: '500' }}>
                                    {uploadingImage ? 'Subiendo...' : (foto ? 'Cambiar Imagen' : 'Seleccionar Archivo')}
                                </label>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Tags (Etiquetas)</label>
                            <button type="button" onClick={handleGenerateTags} disabled={generatingTags || !nombre || !descripcion} style={{ padding: '0.3rem 0.8rem', background: 'rgba(0, 255, 136, 0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0, 255, 136, 0.3)', borderRadius: '8px', cursor: (generatingTags || !nombre || !descripcion) ? 'not-allowed' : 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'all 0.2s', opacity: (generatingTags || !nombre || !descripcion) ? 0.5 : 1 }}>
                                <LuSparkles size={16} /> {generatingTags ? 'Generando...' : 'IA Tags'}
                            </button>
                        </div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <input type="text" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Ej: novedad"
                                style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                            <button type="button" onClick={addTag} style={{ padding: '0 1rem', background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '10px', cursor: 'pointer' }}>
                                <LuPlus size={20} />
                            </button>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {tags.map(t => (
                                <span key={t} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem', background: 'rgba(255,255,255,0.1)', borderRadius: '6px', fontSize: '0.85rem', color: 'white' }}>
                                    {t}
                                    <LuX size={14} style={{ cursor: 'pointer' }} onClick={() => removeTag(t)} />
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Características Dinámicas */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <label style={{ color: 'var(--green-cream)', fontWeight: '600' }}>Características Técnicas</label>

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" value={charName} onChange={e => setCharName(e.target.value)} placeholder="Clave (Ej: Idioma)"
                            style={{ flex: 1, padding: '0.8rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                        <input type="text" value={charValue} onChange={e => setCharValue(e.target.value)} placeholder="Valor (Ej: Español)"
                            style={{ flex: 2, padding: '0.8rem', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }} />
                        <button type="button" onClick={addCaracteristica} style={{ padding: '0 1rem', background: 'rgba(0,255,136,0.1)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,136,0.2)', borderRadius: '10px', cursor: 'pointer' }}>
                            <LuPlus size={20} />
                        </button>
                    </div>

                    {caracteristicas.length > 0 && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '1rem' }}>
                            {caracteristicas.map((c, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', marginRight: '0.5rem' }}>{c.nombre}:</span>
                                        <span style={{ color: 'white', fontWeight: '500' }}>{c.valor}</span>
                                    </div>
                                    <LuX size={16} color="var(--neon-green)" style={{ cursor: 'pointer' }} onClick={() => removeCaracteristica(i)} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Toggles y Switches */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', background: 'rgba(0,255,136,0.05)', borderRadius: '12px', border: '1px solid rgba(0,255,136,0.1)' }}>
                    <input type="checkbox" id="esDestacado" checked={esDestacado} onChange={e => setEsDestacado(e.target.checked)} style={{ width: '1.2rem', height: '1.2rem', accentColor: 'var(--neon-green)' }} />
                    <label htmlFor="esDestacado" style={{ color: 'white', fontWeight: '500', cursor: 'pointer' }}>Marcar como Producto Destacado</label>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1.25rem', marginTop: '1rem', paddingTop: '2rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                    <a href="/admin/products" className={styles.btnSecondary} style={{ textDecoration: 'none', padding: '0.8rem 2rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                        Cancelar
                    </a>
                    <button type="submit" className={styles.createButton} disabled={loading}
                        style={{ padding: '0.8rem 3rem', fontSize: '1rem', fontWeight: '700', borderRadius: '12px', background: 'var(--neon-green)', color: 'var(--deep-black)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem', boxShadow: '0 8px 20px rgba(0, 255, 136, 0.2)' }}>
                        <LuPlus size={20} />
                        {loading ? 'Guardando...' : 'Crear Producto'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateProductView;
