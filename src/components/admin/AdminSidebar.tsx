import { useState, useEffect } from 'react';
import { LayoutDashboard, Package, Users, MessageSquare, BarChart3 } from 'lucide-react';
import styles from './styles/AdminSidebar.module.css';

const AdminSidebar = () => {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <a href="/admin/dashboard" className={styles.logoLink}>
                    <img src="/logo-marketflex-letters.png" alt="MarketFlex Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>Administración</span>
                </a>
            </div>

            <nav className={styles.navMenu}>
                <p className={styles.navSectionTitle}>Principal</p>

                <a href="/admin/dashboard" className={`${styles.navItem} ${currentPath === '/admin/dashboard' ? styles.active : ''}`}>
                    <span className={styles.iconWrapper}>
                        <LayoutDashboard size={20} />
                    </span>
                    Dashboard
                </a>

                <a href="/admin/analytics" className={`${styles.navItem} ${currentPath === '/admin/analytics' ? styles.active : ''}`}>
                    <span className={styles.iconWrapper}>
                        <BarChart3 size={20} />
                    </span>
                    Analíticas
                </a>

                {/* Future Links - Add as needed */}
                <a href="/admin/products" className={`${styles.navItem} ${styles.disabled}`}>
                    <span className={styles.iconWrapper}>
                        <Package size={20} />
                    </span>
                    Productos (Próximamente)
                </a>

                <a href="/admin/users" className={`${styles.navItem} ${styles.disabled}`}>
                    <span className={styles.iconWrapper}>
                        <Users size={20} />
                    </span>
                    Usuarios (Próximamente)
                </a>

                <a href="/admin/messages" className={`${styles.navItem} ${styles.disabled}`}>
                    <span className={styles.iconWrapper}>
                        <MessageSquare size={20} />
                    </span>
                    Mensajes (Próximamente)
                </a>
            </nav>
        </aside>
    );
};

export default AdminSidebar;
