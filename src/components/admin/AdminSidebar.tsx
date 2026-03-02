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
import styles from './styles/AdminSidebar.module.css';

const AdminSidebar = () => {
    const [currentPath, setCurrentPath] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setCurrentPath(window.location.pathname);

        const handleToggle = () => setIsOpen(prev => !prev);
        window.addEventListener('toggle-admin-sidebar', handleToggle);

        return () => window.removeEventListener('toggle-admin-sidebar', handleToggle);
    }, []);

    const closeSidebar = () => setIsOpen(false);

    const navItems = [
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
        { href: '/admin/analytics', icon: BarChart3, label: 'Analíticas', section: 'Principal' },

        { href: '/admin/users', icon: Users, label: 'Usuarios', section: 'Gestión' },
        { href: '/admin/sales', icon: ShoppingCart, label: 'Ventas', section: 'Gestión' },
        { href: '/admin/promotions', icon: TicketPercent, label: 'Promociones', section: 'Gestión' },
        { href: '/admin/support', icon: MessageSquare, label: 'Mensajes', section: 'Gestión' },
        { href: '/admin/claims', icon: AlertCircle, label: 'Reclamos', section: 'Gestión' },

        { href: '/admin/products', icon: Package, label: 'Productos', section: 'Catálogo' },
        { href: '/admin/categories', icon: Tags, label: 'Categorías', section: 'Catálogo' },
        { href: '/admin/brands', icon: Award, label: 'Marcas', section: 'Catálogo' },
        { href: '/admin/characteristics', icon: ListTree, label: 'Características', section: 'Catálogo' },
    ];

    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && <div className={styles.overlay} onClick={closeSidebar} />}

            <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
                <div className={styles.logoContainer}>
                    <a href="/admin/dashboard" className={styles.logoLink}>
                        <img src="/logo-marketflex-letters.png" alt="MarketFlex Logo" className={styles.logoImg} />
                        <span className={styles.logoText}>Administración</span>
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

export default AdminSidebar;
