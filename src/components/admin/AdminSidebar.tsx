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
    ListTree
} from 'lucide-react';
import styles from './styles/AdminSidebar.module.css';

const AdminSidebar = () => {
    const [currentPath, setCurrentPath] = useState('');

    useEffect(() => {
        setCurrentPath(window.location.pathname);
    }, []);

    const navItems = [
        { href: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', section: 'Principal' },
        { href: '/admin/analytics', icon: BarChart3, label: 'Analíticas', section: 'Principal' },

        { href: '/admin/products', icon: Package, label: 'Productos', section: 'Catálogo' },
        { href: '/admin/categories', icon: Tags, label: 'Categorías', section: 'Catálogo' },
        { href: '/admin/brands', icon: Award, label: 'Marcas', section: 'Catálogo' },
        { href: '/admin/features', icon: ListTree, label: 'Características', section: 'Catálogo' },

        { href: '/admin/users', icon: Users, label: 'Usuarios', section: 'Gestión' },
        { href: '/admin/sales', icon: ShoppingCart, label: 'Ventas', section: 'Gestión' },
        { href: '/admin/promotions', icon: TicketPercent, label: 'Promociones', section: 'Gestión' },
        { href: '/admin/support', icon: MessageSquare, label: 'Mensajes', section: 'Gestión' },
        { href: '/admin/claims', icon: AlertCircle, label: 'Reclamos', section: 'Gestión' },
    ];

    const sections = [...new Set(navItems.map(item => item.section))];

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logoContainer}>
                <a href="/admin/dashboard" className={styles.logoLink}>
                    <img src="/logo-marketflex-letters.png" alt="MarketFlex Logo" className={styles.logoImg} />
                    <span className={styles.logoText}>Administración</span>
                </a>
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
    );
};

export default AdminSidebar;
