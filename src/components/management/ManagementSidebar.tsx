import { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    Package,
    Users,
    MessageSquare,
    BarChart3,
    Tags,
    Award,
    ShoppingCart,
    TicketPercent,
    AlertCircle,
    ListTree,
    X
} from 'lucide-react';
import styles from './styles/ManagementSidebar.module.css';

const ManagementSidebar = () => {
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
        { href: '/management/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
        { href: '/management/analytics', icon: BarChart3, label: 'Analíticas', section: 'Principal' },

        { href: '/management/users', icon: Users, label: 'Usuarios', section: 'Gestión' },
        { href: '/management/sales', icon: ShoppingCart, label: 'Ventas', section: 'Gestión' },
        { href: '/management/promotions', icon: TicketPercent, label: 'Promociones', section: 'Gestión' },
        { href: '/management/support', icon: MessageSquare, label: 'Mensajes', section: 'Gestión' },
        { href: '/management/claims', icon: AlertCircle, label: 'Reclamos', section: 'Gestión' },

        { href: '/management/products', icon: Package, label: 'Productos', section: 'Catálogo' },
        { href: '/management/categories', icon: Tags, label: 'Categorías', section: 'Catálogo' },
        { href: '/management/brands', icon: Award, label: 'Marcas', section: 'Catálogo' },
        { href: '/management/characteristics', icon: ListTree, label: 'Características', section: 'Catálogo' },
    ];

    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className={styles.overlay} onClick={closeSidebar} />}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logoContainer}>
                    <a href="/management/dashboard" className={styles.logoLink}>
                        <img src="/logo-marketflex-letters.png" alt="MarketFlex Logo" className={styles.logoImg} />
                        <span className={styles.logoText}>Gestión</span>
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

export default ManagementSidebar;
