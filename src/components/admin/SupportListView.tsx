import React, { useEffect, useState, useCallback } from 'react';
import type { SupportMessageOutput } from '../../types/support.types';
import { getSupportMessages, replyToSupportMessage } from '../../services/support.service';
import { LuMail, LuCheck, LuClock, LuTrash2, LuInbox, LuArrowRight, LuSend, LuX } from 'react-icons/lu';
import styles from './styles/SalesListView.module.css';

const SupportListView: React.FC = () => {
    const [messages, setMessages] = useState<SupportMessageOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);

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
            setLoading(false);
            if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
        }
    }, []);

    useEffect(() => {
        fetchMessages();
    }, [fetchMessages]);

    const handleReplyClick = (id: string) => {
        setReplyingTo(id);
        setReplyText('');
    };

    const handleSendReply = async (id: string) => {
        if (!replyText.trim()) return;
        setSendingReply(true);
        try {
            const result = await replyToSupportMessage(id, replyText);
            if (result.status === 'success') {
                if (window.triggerSileo) window.triggerSileo('success', 'Respuesta enviada y mail enviado correctamente');
                setMessages((prev: SupportMessageOutput[]) =>
                    prev.map((m: SupportMessageOutput) =>
                        m.id === id ? { ...m, estado: 'Respondido', respuesta: replyText } : m
                    )
                );
                setReplyingTo(null);
                setReplyText('');
            }
        } catch (error) {
            // Error managed by global interceptor
        } finally {
            setSendingReply(false);
        }
    };

    const handleDelete = async (msg: SupportMessageOutput) => {
        if ((window as any).showDeleteSupportModal) {
            (window as any).showDeleteSupportModal(async () => {
                try {
                    if ((window as any).showAdminLoader) (window as any).showAdminLoader();
                    const { AdminService } = await import('../../services/admin.service');
                    const result = await AdminService.deleteSupportMessage(msg.id);
                    if (result.status === 'success') {
                        setMessages((prev: SupportMessageOutput[]) => prev.filter((m: SupportMessageOutput) => m.id !== msg.id));
                        if (window.triggerSileo) window.triggerSileo('success', 'Mensaje de soporte borrado correctamente');
                    } else {
                        if (window.triggerSileo) window.triggerSileo('error', result.message);
                    }
                } catch (error) {
                    console.error('Error deleting support message:', error);
                    if (window.triggerSileo) window.triggerSileo('error', 'No se pudo borrar el mensaje');
                } finally {
                    if ((window as any).hideAdminLoader) (window as any).hideAdminLoader();
                }
            });
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

    if (loading && messages.length === 0) return null;

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
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
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
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        {/* Status Label */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '600' }}>
                                {getStatusIcon(msg.estado)}
                                <span style={{
                                    color: (msg.estado || '').toLowerCase() === 'pendiente' ? 'var(--neon-orange)' :
                                        (msg.estado || '').toLowerCase() === 'leido' ? 'var(--neon-blue)' :
                                            (msg.estado || '').toLowerCase() === 'respondido' ? 'var(--neon-green)' : '#94a3b8'
                                }}>
                                    {(msg.estado || 'PENDIENTE').toUpperCase()}
                                </span>
                            </div>
                            <span style={{ color: '#64748b' }}>
                                {new Date(msg.creadoEn).toLocaleDateString('es-AR', {
                                    day: '2-digit', month: 'short', year: 'numeric',
                                    hour: '2-digit', minute: '2-digit'
                                })}
                            </span>
                        </div>

                        {/* Content */}
                        <div>
                            <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.1rem', color: '#f8fafc', fontWeight: '600' }}>
                                {msg.asunto}
                            </h3>
                            <div style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '0.75rem' }}>
                                De: <strong style={{ color: '#fff' }}>{msg.nombre}</strong> ({msg.email})
                            </div>
                            <div style={{
                                fontSize: '0.95rem',
                                color: '#94a3b8',
                                background: 'rgba(15, 23, 42, 0.5)',
                                padding: '1rem',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--neon-blue)',
                                wordBreak: 'break-word'
                            }}>
                                "{msg.mensaje}"
                            </div>
                        </div>

                        {/* Previous Response if any */}
                        {msg.respuesta && (
                            <div style={{
                                fontSize: '0.9rem',
                                color: 'var(--neon-green)',
                                background: 'rgba(0, 255, 157, 0.05)',
                                padding: '0.8rem',
                                borderRadius: '8px',
                                borderLeft: '3px solid var(--neon-green)',
                                marginTop: '0.5rem'
                            }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '0.75rem' }}>RESPUESTA ENVIADA:</div>
                                "{msg.respuesta}"
                            </div>
                        )}

                        {/* Inline Reply Form */}
                        {replyingTo === msg.id ? (
                            <div style={{
                                marginTop: '1rem',
                                padding: '1rem',
                                background: 'rgba(15, 23, 42, 0.8)',
                                borderRadius: '8px',
                                border: '1px solid var(--neon-blue)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px'
                            }}>
                                <textarea
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                    placeholder="Escribe tu respuesta aquí..."
                                    style={{
                                        width: '100%',
                                        minHeight: '100px',
                                        background: 'transparent',
                                        border: 'none',
                                        color: '#fff',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit'
                                    }}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                                    >
                                        <LuX size={16} /> Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleSendReply(msg.id)}
                                        disabled={sendingReply || !replyText.trim()}
                                        style={{
                                            marginLeft: 'auto',
                                            background: 'var(--neon-blue)',
                                            color: '#000',
                                            border: 'none',
                                            padding: '6px 15px',
                                            borderRadius: '4px',
                                            fontWeight: 'bold',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '8px',
                                            opacity: (sendingReply || !replyText.trim()) ? 0.5 : 1
                                        }}
                                    >
                                        <LuSend size={16} /> {sendingReply ? 'Enviando...' : 'Enviar Respuesta'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                <button
                                    onClick={() => handleReplyClick(msg.id)}
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
                                >
                                    <LuTrash2 size={18} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default SupportListView;
