import React, { useEffect, useState, useCallback } from 'react';
import type { SupportMessageOutput } from '../../types/support.types';
import { getSupportMessages } from '../../services/support.service';
import { LuMail, LuCheck, LuClock, LuTrash2, LuInbox, LuArrowRight } from 'react-icons/lu';
import styles from './styles/SalesListView.module.css';

const SupportListView: React.FC = () => {
    const [messages, setMessages] = useState<SupportMessageOutput[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = useCallback(async () => {
        setLoading(true);
        if ((window as any).showAdminLoader) (window as any).showAdminLoader();
        try {
            const data = await getSupportMessages();
            setMessages(data);
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        } catch (error) {
            console.error('Error al cargar los mensajes de soporte:', error);
            if ((window as any).triggerSileo) {
                (window as any).triggerSileo('error', 'Error al cargar los mensajes.');
            }
            setLoading(false); // Ensure loading is set to false even on error
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader(); // Ensure loader is hidden even on error
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleReply = (msg: SupportMessageOutput) => {
        if (window.triggerSileo) window.triggerSileo('info', `Responder a ${msg.email} (En desarrollo)`);
    };

    const handleDelete = (msg: SupportMessageOutput) => {
        if (window.confirm(`¿Seguro que quieres eliminar el mensaje de ${msg.nombre}?`)) {
            if (window.triggerSileo) window.triggerSileo('info', `Mensaje eliminado (En desarrollo)`);
        }
    };

    const getStatusIcon = (status: string | null) => {
        if (!status) return <LuInbox />;
        switch (status.toLowerCase()) {
            case 'pendiente': return <LuClock style={{ color: 'var(--neon-orange)' }} />;
            case 'leido': return <LuMail style={{ color: 'var(--neon-blue)' }} />;
            case 'respondido': return <LuCheck style={{ color: 'var(--neon-green)' }} />;
            case 'borrado': return <LuTrash2 style={{ color: 'var(--error-red)' }} />;
            default: return <LuInbox />;
        }
    };

    if (loading && messages.length === 0) {
        // Let global loader handle
    }

    if (messages.length === 0) {
        return (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                <LuInbox size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
                <h3>Bandeja de entrada vacía</h3>
                <p>No hay mensajes de soporte en este momento.</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div className={styles.titleSection}>
                    <h1>Mensajes de Soporte</h1>
                    <p>Bandeja de gestión de tickets y consultas de usuarios</p>
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '1.5rem'
            }}>
                {messages.map(msg => (
                    <div key={msg.id} style={{
                        background: 'rgba(30, 41, 59, 0.7)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '12px',
                        padding: '1.5rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '1rem',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-5px)';
                            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0, 0, 0, 0.2)';
                            e.currentTarget.style.borderColor = 'rgba(0, 255, 157, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                        }}
                    >
                        {/* Header: Status and Date */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                {getStatusIcon(msg.estado)}
                                <span style={{
                                    color: msg.estado.toLowerCase() === 'pendiente' ? 'var(--neon-orange)' :
                                        msg.estado.toLowerCase() === 'leido' ? 'var(--neon-blue)' :
                                            msg.estado.toLowerCase() === 'respondido' ? 'var(--neon-green)' : '#94a3b8'
                                }}>
                                    {msg.estado.toUpperCase()}
                                </span>
                            </div>
                            <span style={{ color: '#64748b' }}>
                                {new Date(msg.creadoEn).toLocaleDateString('es-AR', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>

                        {/* Body: Sender and Subject */}
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: '600' }}>
                                {msg.asunto}
                            </h3>
                            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                                De: <strong style={{ color: '#fff' }}>{msg.nombre}</strong> ({msg.email})
                                {msg.usuarioId && <span style={{ marginLeft: '8px', padding: '2px 6px', background: 'rgba(0,255,157,0.1)', color: 'var(--neon-green)', borderRadius: '4px', fontSize: '0.75rem' }}>Acreditado</span>}
                            </div>
                            <div style={{
                                fontSize: '0.95rem',
                                color: '#94a3b8',
                                lineHeight: '1.5',
                                background: 'rgba(15, 23, 42, 0.5)',
                                padding: '1rem',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--neon-blue)',
                                maxHeight: '100px',
                                overflowY: 'auto',
                                wordBreak: 'break-word'
                            }}>
                                "{msg.mensaje}"
                            </div>
                        </div>

                        {/* Footer: Actions */}
                        <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                            <button
                                onClick={() => handleReply(msg)}
                                style={{
                                    flex: 1,
                                    background: 'linear-gradient(135deg, rgba(0, 255, 157, 0.1), rgba(0, 200, 255, 0.1))',
                                    border: '1px solid rgba(0, 255, 157, 0.3)',
                                    color: 'var(--neon-green)',
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    gap: '8px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 157, 0.2), rgba(0, 200, 255, 0.2))';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0, 255, 157, 0.1), rgba(0, 200, 255, 0.1))';
                                }}
                            >
                                <LuArrowRight size={18} />
                                Responder
                            </button>
                            <button
                                onClick={() => handleDelete(msg)}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255, 100, 100, 0.3)',
                                    color: '#f87171',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    transition: 'all 0.2s',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(255, 100, 100, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                                title="Eliminar mensaje"
                            >
                                <LuTrash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupportListView;
