import React, { useState } from 'react';
import { LuDollarSign, LuShoppingCart, LuPackage, LuTrendingUp, LuInfo } from 'react-icons/lu';
import styles from '../admin/styles/dashboard.module.css';

const SellerDashboardView: React.FC = () => {
    const [infoModal, setInfoModal] = useState<{ title: string, text: string } | null>(null);

    // Placeholder data for now
    const stats = [
        {
            title: "Monto Vendido Hoy",
            value: "$0,00",
            icon: LuDollarSign,
            color: styles.colorGreen,
            description: "Total facturado por tus ventas completadas durante el día de hoy."
        },
        {
            title: "Nro de Ventas Hoy",
            value: "0",
            icon: LuShoppingCart,
            color: styles.colorBlue,
            description: "Cantidad total de órdenes completadas el día de hoy."
        },
        {
            title: "Productos Vendidos Hoy",
            value: "0",
            icon: LuPackage,
            color: styles.colorPurple,
            description: "Suma total de unidades de productos vendidas hoy."
        }
    ];

    return (
        <div className={styles.dashboardContainer}>
            <header className={styles.dashboardHeader}>
                <div>
                    <h1>Panel de Vendedor</h1>
                    <p>Bienvenido a tu panel de gestión. Aquí podrás ver el rendimiento de tus ventas.</p>
                </div>
            </header>

            <div className={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <div
                        key={index}
                        className={styles.statCard}
                        style={{ animationDelay: `${index * 0.1}s` }}
                    >
                        <div className={`${styles.statIconWrapper} ${stat.color}`}>
                            <stat.icon className={styles.statIcon} />
                        </div>
                        <button
                            className={styles.infoBtn}
                            onClick={() => setInfoModal({ title: stat.title, text: stat.description })}
                        >
                            <LuInfo />
                        </button>
                        <div className={styles.statInfo}>
                            <h3>{stat.title}</h3>
                            <div className={styles.statValue}>{stat.value}</div>
                        </div>
                    </div>
                ))}
            </div>

            <div className={styles.tablesGrid}>
                <div style={{ background: 'rgba(255,255,255,0.02)', padding: '2rem', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', gridColumn: 'span 2' }}>
                    <LuTrendingUp size={48} style={{ color: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }} />
                    <h3 style={{ color: 'rgba(255,255,255,0.4)' }}>Próximamente: Gráficos y Listados Detallados</h3>
                    <p style={{ color: 'rgba(255,255,255,0.2)' }}>Estamos preparando las mejores herramientas para que potencies tus ventas.</p>
                </div>
            </div>

            {infoModal && (
                <div className={styles.modalOverlay} onClick={() => setInfoModal(null)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            <LuInfo className={styles.modalIcon} />
                            <h2>{infoModal.title}</h2>
                        </div>
                        <div className={styles.modalBody}>
                            <p>{infoModal.text}</p>
                        </div>
                        <button className={styles.modalCloseBtn} onClick={() => setInfoModal(null)}>
                            Entendido
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SellerDashboardView;
