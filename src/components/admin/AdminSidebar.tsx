import { useState, useEffect } from 'react';
import styles from './styles/AdminSidebar.module.css';

const AdminSidebar = () => {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <a href="/" className={styles.logoLink}>
                    <img src="/logo-marketflex-letters.png" alt="MarketFlex Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>Administración</span>
                </a>
            </div>

            <nav className={styles.navMenu}>
                <p className={styles.navSectionTitle}>Principal</p>

                <a href="/admin/dashboard" className={`${styles.navItem} ${currentPath === '/admin/dashboard' ? styles.active : ''}`}>
                    <span className={styles.iconWrapper}>
                        {/* Using raw SVG since Iconify in React can sometimes conflict with Astro's SSR in a mixed env, 
                            but we'll assume a standard SVG or span class for icons if @iconify/react isn't strictly configured.
                            Using a standard generic icon implementation for safety in TSX. */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>
                    </span>
                    Dashboard
                </a>

                {/* Future Links - Add as needed */}
                <a href="/admin/products" className={`${styles.navItem} ${styles.disabled}`}>
                    <span className={styles.iconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
                    </span>
                    Productos (Próximamente)
                </a>

                <a href="/admin/users" className={`${styles.navItem} ${styles.disabled}`}>
                    <span className={styles.iconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    </span>
                    Usuarios (Próximamente)
                </a>
            </nav>

            <div className={styles.bottomSection}>
                <a href="/" className={styles.clientModeBtn}>
                    <span className={styles.iconWrapper}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                    </span>
                    Volver a Tienda
                </a>
            </div>
        </aside>
    );
};

export default AdminSidebar;
