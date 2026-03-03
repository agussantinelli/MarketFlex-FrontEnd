import React from 'react';
import styles from './styles/AdminAuthInputs.module.css';
import { LuUser, LuMail, LuLock, LuIdCard, LuCalendar, LuGlobe, LuMapPin, LuHash, LuInfo } from 'react-icons/lu';

interface AdminAuthInputsProps {
    formData: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    readonlyFields?: string[];
    isEdit?: boolean;
}

const AdminAuthInputs: React.FC<AdminAuthInputsProps> = ({ formData, onChange, readonlyFields = [], isEdit = false }) => {
    const isReadOnly = (fieldName: string) => readonlyFields.includes(fieldName);

    const getReadOnlyStyle = (fieldName: string) =>
        isReadOnly(fieldName) ? { opacity: 0.6, cursor: 'not-allowed', backgroundColor: 'rgba(255, 255, 255, 0.02)' } : {};

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div className={styles.formGroup}>
                    <label htmlFor="nombre">Nombre</label>
                    <div className={styles.inputWrapper}>
                        <LuUser className={styles.inputIcon} />
                        <input
                            type="text"
                            id="nombre"
                            name="nombre"
                            value={formData.nombre}
                            onChange={onChange}
                            placeholder="Ej: Juan"
                            required
                            className={styles.inputField}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="apellido">Apellido</label>
                    <div className={styles.inputWrapper}>
                        <LuUser className={styles.inputIcon} />
                        <input
                            type="text"
                            id="apellido"
                            name="apellido"
                            value={formData.apellido}
                            onChange={onChange}
                            placeholder="Ej: Pérez"
                            required
                            className={styles.inputField}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                    <label htmlFor="tipoDni">Tipo de ID</label>
                    <div className={styles.inputWrapper} style={getReadOnlyStyle('tipoDni')}>
                        <LuIdCard className={styles.inputIcon} />
                        <select
                            id="tipoDni"
                            name="tipoDni"
                            value={formData.tipoDni}
                            onChange={onChange}
                            required
                            disabled={isReadOnly('tipoDni')}
                            className={styles.inputField}
                        >
                            <option value="DNI">DNI</option>
                            <option value="PASSPORT">Pasaporte</option>
                            <option value="ID">ID Extranjero</option>
                        </select>
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="dni">DNI / ID</label>
                    <div className={styles.inputWrapper} style={getReadOnlyStyle('dni')}>
                        <LuIdCard className={styles.inputIcon} />
                        <input
                            type="text"
                            id="dni"
                            name="dni"
                            value={formData.dni}
                            onChange={onChange}
                            placeholder="12.345.678"
                            required
                            readOnly={isReadOnly('dni')}
                            className={styles.inputField}
                        />
                    </div>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="rol">Rol del Usuario</label>
                <div className={styles.inputWrapper}>
                    <LuUser className={styles.inputIcon} />
                    <select
                        id="rol"
                        name="rol"
                        value={formData.rol}
                        onChange={onChange}
                        required
                        className={styles.inputField}
                    >
                        <option value="customer">Cliente (Customer)</option>
                        <option value="seller">Vendedor (Seller)</option>
                        <option value="admin">Administrador (Admin)</option>
                    </select>
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="email">Correo Electrónico</label>
                <div className={styles.inputWrapper} style={getReadOnlyStyle('email')}>
                    <LuMail className={styles.inputIcon} />
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={onChange}
                        placeholder="nombre@ejemplo.com"
                        required
                        readOnly={isReadOnly('email')}
                        className={styles.inputField}
                    />
                </div>
            </div>

            <div className={styles.formGroup}>
                <label htmlFor="password">Contraseña</label>
                <div className={styles.inputWrapper}>
                    <LuLock className={styles.inputIcon} />
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={onChange}
                        placeholder="••••••••"
                        className={styles.inputField}
                    />
                </div>
                {!isEdit && (
                    <p className={styles.passwordHint}>
                        <LuHash size={14} />
                        Si se deja vacío, se asignará por defecto: <strong>Hola123</strong>
                    </p>
                )}
                {isEdit && (
                    <p className={styles.passwordHint}>
                        <LuInfo size={14} />
                        Deja este campo vacío si no deseas cambiar la contraseña.
                    </p>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                    <label htmlFor="fechaNacimiento">Fecha Nacimiento</label>
                    <div className={styles.inputWrapper}>
                        <LuCalendar className={styles.inputIcon} />
                        <input
                            type="date"
                            id="fechaNacimiento"
                            name="fechaNacimiento"
                            value={formData.fechaNacimiento}
                            onChange={onChange}
                            required
                            className={styles.inputField}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="paisNacimiento">País</label>
                    <div className={styles.inputWrapper}>
                        <LuGlobe className={styles.inputIcon} />
                        <input
                            type="text"
                            id="paisNacimiento"
                            name="paisNacimiento"
                            value={formData.paisNacimiento}
                            onChange={onChange}
                            placeholder="Ej: Argentina"
                            required
                            className={styles.inputField}
                        />
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1rem' }}>
                <div className={styles.formGroup}>
                    <label htmlFor="ciudadResidencia">Ciudad</label>
                    <div className={styles.inputWrapper}>
                        <LuMapPin className={styles.inputIcon} />
                        <input
                            type="text"
                            id="ciudadResidencia"
                            name="ciudadResidencia"
                            value={formData.ciudadResidencia}
                            onChange={onChange}
                            placeholder="Ej: Rosario"
                            required
                            className={styles.inputField}
                        />
                    </div>
                </div>

                <div className={styles.formGroup}>
                    <label htmlFor="codigoPostal">Código Postal</label>
                    <div className={styles.inputWrapper}>
                        <LuHash className={styles.inputIcon} />
                        <input
                            type="text"
                            id="codigoPostal"
                            name="codigoPostal"
                            value={formData.codigoPostal}
                            onChange={onChange}
                            placeholder="Ej: 2000"
                            required
                            className={styles.inputField}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminAuthInputs;
