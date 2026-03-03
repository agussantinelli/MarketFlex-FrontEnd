import React, { useEffect, useState, useCallback } from 'react';
import type { SupportMessageOutput } from '../../types/support.types';
import { getSupportMessages, replyToSupportMessage } from '../../services/support.service';
import { LuMail, LuCheck, LuClock, LuTrash2, LuInbox, LuArrowRight, LuSend, LuX, LuLoader } from 'react-icons/lu';
import styles from './styles/SalesListView.module.css';

const SupportListView: React.FC = () => {
    const [messages, setMessages] = useState<SupportMessageOutput[]>([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    const [replyText, setReplyText] = useState('');
    const [sendingReply, setSendingReply] = useState(false);
    const [filter, setFilter] = useState<'todos' | 'respondidos' | 'no-leidos'>('todos');

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

    const filteredMessages = messages.filter(msg => {
        if (filter === 'todos') return true;
        if (filter === 'respondidos') return msg.estado?.toLowerCase() === 'respondido';
        if (filter === 'no-leidos') return msg.estado?.toLowerCase() !== 'respondido';
        return true;
    });

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

                <div style={{
                    display: 'flex',
                    background: 'rgba(30, 41, 59, 0.5)',
                    padding: '4px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    marginTop: '1rem'
                }}>
                    {(['todos', 'respondidos', 'no-leidos'] as const).map((opt) => (
                        <button
                            key={opt}
                            onClick={() => setFilter(opt)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: 'none',
                                background: filter === opt ? 'rgba(0, 255, 157, 0.1)' : 'transparent',
                                color: filter === opt ? 'var(--neon-green)' : '#94a3b8',
                                cursor: 'pointer',
                                fontSize: '0.85rem',
                                fontWeight: filter === opt ? '700' : '500',
                                transition: 'all 0.2s',
                                textTransform: 'capitalize'
                            }}
                        >
                            {opt.replace('-', ' ')}
                        </button>
                    ))}
                </div>
            </header>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
                gap: '1.5rem'
            }}>
                {filteredMessages.map(msg => (
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
                                        minHeight: '120px',
                                        background: 'rgba(0, 0, 0, 0.2)',
                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        color: '#fff',
                                        outline: 'none',
                                        resize: 'vertical',
                                        fontFamily: 'inherit',
                                        fontSize: '0.95rem',
                                        transition: 'border-color 0.2s',
                                    }}
                                    onFocus={(e) => e.currentTarget.style.borderColor = 'var(--neon-blue)'}
                                    onBlur={(e) => e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'}
                                    autoFocus
                                />
                                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                                    <button
                                        onClick={() => setReplyingTo(null)}
                                        style={{
                                            background: 'rgba(255, 255, 255, 0.05)',
                                            border: '1px solid rgba(255, 255, 255, 0.1)',
                                            color: '#94a3b8',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            padding: '10px 18px',
                                            borderRadius: '10px',
                                            fontSize: '0.85rem',
                                            fontWeight: '600',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                                            e.currentTarget.style.color = '#fff';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                                            e.currentTarget.style.color = '#94a3b8';
                                        }}
                                    >
                                        <LuX size={16} /> Cancelar
                                    </button>
                                    <button
                                        onClick={() => handleSendReply(msg.id)}
                                        disabled={sendingReply || !replyText.trim()}
                                        style={{
                                            marginLeft: 'auto',
                                            background: (sendingReply || !replyText.trim())
                                                ? 'rgba(0, 255, 157, 0.1)'
                                                : 'linear-gradient(135deg, #00ff9d, #00d2ff)',
                                            color: (sendingReply || !replyText.trim()) ? '#64748b' : '#000',
                                            border: 'none',
                                            padding: '10px 24px',
                                            borderRadius: '10px',
                                            fontWeight: '800',
                                            cursor: (sendingReply || !replyText.trim()) ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                                            boxShadow: (sendingReply || !replyText.trim())
                                                ? 'none'
                                                : '0 4px 15px rgba(0, 255, 157, 0.2)',
                                            fontSize: '0.9rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            if (!sendingReply && replyText.trim()) {
                                                e.currentTarget.style.transform = 'translateY(-2px)';
                                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 255, 157, 0.4)';
                                            }
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = (sendingReply || !replyText.trim())
                                                ? 'none'
                                                : '0 4px 15px rgba(0, 255, 157, 0.2)';
                                        }}
                                    >
                                        {sendingReply ? (
                                            <>
                                                <LuLoader style={{ animation: 'spin 1s linear infinite' }} size={18} /> Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <LuSend size={18} /> Enviar Respuesta
                                            </>
                                        )}
                                    </button>
                                </div>
                                <style>{`
                                    @keyframes spin {
                                        from { transform: rotate(0deg); }
                                        to { transform: rotate(360deg); }
                                    }
                                `}</style>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                                {msg.estado?.toLowerCase() !== 'respondido' && (
                                    <button
                                        onClick={() => handleReplyClick(msg.id)}
                                        style={{
                                            flex: 1,
                                            background: 'rgba(0, 255, 157, 0.05)',
                                            border: '1px solid rgba(0, 255, 157, 0.2)',
                                            color: 'var(--neon-green)',
                                            padding: '10px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontWeight: '700',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '8px',
                                            transition: 'all 0.2s',
                                            fontSize: '0.9rem'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.1)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'rgba(0, 255, 157, 0.05)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }}
                                    >
                                        <LuArrowRight size={18} /> Responder
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDelete(msg)}
                                    style={{
                                        width: msg.estado?.toLowerCase() === 'respondido' ? '100%' : '45px',
                                        height: '45px',
                                        background: 'rgba(239, 68, 68, 0.1)',
                                        border: '1px solid rgba(239, 68, 68, 0.2)',
                                        color: '#ef4444',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        gap: '8px',
                                        fontWeight: '700'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                                        e.currentTarget.style.transform = 'translateY(-1px)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                        e.currentTarget.style.transform = 'translateY(0)';
                                    }}
                                >
                                    <LuTrash2 size={18} />
                                    {msg.estado?.toLowerCase() === 'respondido' && <span>Borrar Mensaje</span>}
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
