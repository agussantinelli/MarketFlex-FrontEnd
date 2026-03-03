import React, { useState, useEffect } from 'react';
import AdminAuthInputs from './AdminAuthInputs';
import { AdminService } from '../../services/admin.service';
import styles from './styles/dashboard.module.css';
import { LuSave, LuArrowLeft } from 'react-icons/lu';

interface UserEditViewProps {
    userId: string;
}

const UserEditView: React.FC<UserEditViewProps> = ({ userId }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        tipoDni: '',
        email: '',
        password: '',
        fechaNacimiento: '',
        paisNacimiento: '',
        ciudadResidencia: '',
        codigoPostal: '',
        rol: ''
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isDniInitialNull, setIsDniInitialNull] = useState(false);
    const [hasPassword, setHasPassword] = useState(true);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                const result = await AdminService.getUserById(userId);

                if (result.status === 'success' && result.data) {
                    const user = result.data;
                    setFormData({
                        nombre: user.nombre || '',
                        apellido: user.apellido || '',
                        dni: user.dni || '',
                        tipoDni: user.tipoDni || 'DNI',
                        email: user.email || '',
                        password: '', // Password stays empty unless changing
                        fechaNacimiento: user.fechaNacimiento ? user.fechaNacimiento.substring(0, 10) : '',
                        paisNacimiento: user.pais || '',
                        ciudadResidencia: user.ciudad || '',
                        codigoPostal: user.codigoPostal || '',
                        rol: user.rol || 'customer'
                    });
                    setIsDniInitialNull(!user.dni);
                    setHasPassword(!!user.password);
                } else {
                    if ((window as any).triggerSileo) {
                        (window as any).triggerSileo('error', result.message || 'No se pudo cargar el usuario');
                    }
                }
            } catch (err) {
                console.error(err);
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', 'Error al cargar los datos del usuario');
                }
            } finally {
                setLoading(false);
                if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
            }
        };

        fetchUserData();
    }, [userId]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            setSaving(true);
            if ((window as any).showAdminLoader) (window as any).showAdminLoader();

            // Prepare data: email is always immutable
            let updatePayload: any = { ...formData };
            delete updatePayload.email;

            // If DNI was already present, don't allow re-sending it (backend rule)
            if (!isDniInitialNull) {
                delete updatePayload.dni;
                delete updatePayload.tipoDni;
            }

            // If password is empty, don't send it
            if (!updatePayload.password) {
                delete updatePayload.password;
            }

            const result = await AdminService.updateUser(userId, updatePayload);

            if (result.status === 'success') {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('success', '¡Usuario actualizado con éxito!');
                }
                setTimeout(() => {
                    window.location.href = '/admin/users';
                }, 1500);
            } else {
                if ((window as any).triggerSileo) {
                    (window as any).triggerSileo('error', result.message || 'Error al actualizar el usuario');
                }
            }
        } catch (error) {
            console.error('Error in handleSubmit:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error crítico al procesar la actualización');
            }
        } finally {
            setSaving(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    };

    if (loading) return null; // Let global loader handle it

    return (
        <div className={styles.dashboardContainer} style={{ maxWidth: '900px', margin: '0 auto', padding: '1rem 2rem' }}>
            <header className={styles.header} style={{ marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '0.75rem' }}>
                    <a
                        href="/admin/users"
                        className={styles.actionBtn}
                        title="Volver a Usuarios"
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
                        Editar Usuario
                    </h1>
                </div>
                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--green-cream)',
                    opacity: 0.7,
                    marginLeft: '3.75rem'
                }}>
                    Modifica los datos del usuario seleccionado. Los campos de identidad no son editables.
                </p>
            </header>

            <div style={{
                background: 'rgba(15, 23, 42, 0.4)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                borderRadius: '24px',
                padding: '3rem',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)'
            }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <AdminAuthInputs
                        formData={formData}
                        onChange={handleChange}
                        readonlyFields={isDniInitialNull ? ['email'] : ['email', 'dni', 'tipoDni']}
                        isEdit={true}
                        hasPassword={hasPassword}
                    />

                    <div style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1.25rem',
                        marginTop: '2rem',
                        paddingTop: '2rem',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                        <a
                            href="/admin/users"
                            className={styles.btnSecondary}
                            style={{
                                textDecoration: 'none',
                                padding: '0.8rem 2rem',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Cancelar
                        </a>
                        <button
                            type="submit"
                            className={styles.createButton}
                            disabled={saving}
                            style={{
                                padding: '0.8rem 3rem',
                                fontSize: '1rem',
                                fontWeight: '700',
                                borderRadius: '12px',
                                background: 'var(--neon-green)',
                                color: 'var(--deep-black)',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 8px 20px rgba(0, 255, 136, 0.2)'
                            }}
                        >
                            <LuSave size={20} />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserEditView;
