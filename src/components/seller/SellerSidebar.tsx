import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    ShoppingCart,
    MessageSquare,
    X
} from 'lucide-react';
import styles from './styles/SellerSidebar.module.css';

const SellerSidebar = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrentPath(window.location.pathname);

        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-management-sidebar', handleToggle);

        return () => window.removeEventListener('toggle-management-sidebar', handleToggle);
    }, []);

    const closeSidebar = () => setIsOpen(false);

    const navItems = [
        { href: '/seller/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
        { href: '/seller/products', icon: Package, label: 'Mis Productos', section: 'Gestión' },
        { href: '/seller/sales', icon: ShoppingCart, label: 'Mis Ventas', section: 'Gestión' },
        { href: '/seller/messages', icon: MessageSquare, label: 'Mensajes', section: 'Soporte' },
    ];

    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <>
            {isOpen && <div className={styles.overlay} onClick={closeSidebar} />}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logoContainer}>
                    <a href="/seller/dashboard" className={styles.logoLink}>
                        <img src="/logo-marketflex-letters.png" alt="MarketFlex Logo" className={styles.logoImg} />
                        <span className={styles.logoText}>Vendedor</span>
                    </a>
                    <button className={styles.closeBtn} onClick={closeSidebar} aria-label="Cerrar menú">
                        <X size={24} />
                    </button>
                </div>

                <nav className={styles.navMenu}>
                    {sections.map(section => (
                        <div key={section} className={styles.navGroup}>
                            <p className={styles.navSectionTitle}>{section}</p>
                            {navItems.filter(item => item.section === section).map(item => (
                                <a
                                    key={item.href}
                                    href={item.href}
                                    className={`${styles.navItem} ${currentPath === item.href ? styles.active : ''}`}
                                    onClick={closeSidebar}
                                >
                                    <span className={styles.iconWrapper}>
                                        <item.icon size={20} />
                                    </span>
                                    {item.label}
                                </a>
                            ))}
                        </div>
                    ))}
                </nav>
            </aside>
        </>
    );
};

export default SellerSidebar;

