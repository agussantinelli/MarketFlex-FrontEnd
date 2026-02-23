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

    const fullNameElement = document.getElementById('user-full-name');
    const emailElement = document.getElementById('user-email');
    const dniElement = document.getElementById('user-dni');
    const birthElement = document.getElementById('user-birth');
    const nationalityElement = document.getElementById('user-nationality');
    const residenceElement = document.getElementById('user-residence');
    const googleElement = document.getElementById('social-google');
    const facebookElement = document.getElementById('social-facebook');

    if (fullNameElement) fullNameElement.textContent = `${user.nombre} ${user.apellido || ''}`;
    if (emailElement) emailElement.textContent = user.email;
    if (dniElement) dniElement.textContent = user.dni ? `${user.tipoDni} ${user.dni}` : 'No especificado';
    if (birthElement) birthElement.textContent = user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : 'No especificado';
    if (nationalityElement) nationalityElement.textContent = user.paisNacimiento || 'No especificado';
    if (residenceElement) residenceElement.textContent = user.ciudadResidencia ? `${user.ciudadResidencia} ${user.codigoPostal ? `(${user.codigoPostal})` : ''}` : 'No especificado';

    if (googleElement) googleElement.style.display = user.logueado_con_google ? 'inline-block' : 'none';
    if (facebookElement) facebookElement.style.display = user.logueado_con_facebook ? 'inline-block' : 'none';

    // Transition from loading to ready
    container.classList.remove(styles.loading);
    container.classList.add(styles.isReady);
}
