import { getProfile } from "../services/user.service";
import { getUser, logout } from "../services/auth.service";
import type { User } from "../types/user.types";


export async function initProfile(styles: Record<string, string>, modalStyles: Record<string, string>) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    const localUser = getUser();
    if (!localUser) {
        window.location.href = '/login';
        return;
    }

    try {
        const profile = await getProfile();
        populateProfile(profile, styles);
    } catch (error) {
        console.error("Error fetching profile:", error);
        container.classList.add(styles.hasError);
    }

    // Modal Logic
    const logoutModal = document.getElementById('logout-modal');
    const logoutBtn = document.getElementById('logout-btn');
    const cancelModalBtn = document.getElementById('logout-modal-cancel');
    const confirmLogoutBtn = document.getElementById('logout-modal-confirm');

    const showModal = () => logoutModal?.classList.add(modalStyles.active);
    const hideModal = () => logoutModal?.classList.remove(modalStyles.active);

    logoutBtn?.addEventListener('click', showModal);
    cancelModalBtn?.addEventListener('click', hideModal);

    // Close modal if clicking outside
    logoutModal?.addEventListener('click', (e) => {
        if (e.target === logoutModal) hideModal();
    });

    confirmLogoutBtn?.addEventListener('click', () => {
        logout();
    });

    // Setup retry
    document.getElementById('retry-btn')?.addEventListener('click', () => {
        window.location.reload();
    });
}

function populateProfile(user: User, styles: Record<string, string>) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    // Helper to set text or hide if empty
    const setText = (id: string, text: string | null | undefined, fallback: string = 'No especificado') => {
        const el = document.getElementById(id);
        if (el) el.textContent = text || fallback;
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=7c3aed&color=fff`;

    // Set values
    const avatarImg = document.getElementById('profile-avatar') as HTMLImageElement;
    if (avatarImg) avatarImg.src = user.foto || defaultAvatar;

    setText('user-full-name', `${user.nombre} ${user.apellido}`);
    setText('user-email', user.email);
    setText('user-dni', user.dni ? `${user.tipoDni} ${user.dni}` : null);
    setText('user-birth', user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : null);
    setText('user-nationality', user.paisNacimiento);
    setText('user-residence', user.ciudadResidencia ? `${user.ciudadResidencia} ${user.codigoPostal ? `(${user.codigoPostal})` : ''}` : null);
    setText('user-id', user.id);

    const roleBadge = document.getElementById('user-role-badge');
    if (roleBadge) {
        roleBadge.textContent = user.rol.toUpperCase();
        roleBadge.className = `${styles.badge} ${styles[user.rol.toLowerCase()]}`;
    }

    // Transition from loading to ready
    container.classList.remove(styles.loading);
    container.classList.add(styles.isReady);
}
