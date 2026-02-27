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
        if (styles.hasError) container.classList.add(styles.hasError);
    }

    // Modal Logic & Event Listeners
    const setupListeners = () => {
        const logoutModal = document.getElementById('profile-logout-modal');
        const logoutBtn = document.getElementById('profile-logout-btn');
        const cancelModalBtn = document.getElementById('profile-logout-modal-cancel');
        const confirmLogoutBtn = document.getElementById('profile-logout-modal-confirm');
        const retryBtn = document.getElementById('retry-btn');


        const showModal = () => { if (modalStyles.active) logoutModal?.classList.add(modalStyles.active); };
        const hideModal = () => { if (modalStyles.active) logoutModal?.classList.remove(modalStyles.active); };

        logoutBtn?.addEventListener('click', (e) => {
            e.preventDefault();
            showModal();
        });

        cancelModalBtn?.addEventListener('click', hideModal);

        logoutModal?.addEventListener('click', (e) => {
            if (e.target === logoutModal) hideModal();
        });

        confirmLogoutBtn?.addEventListener('click', () => {
            logout();
        });

        retryBtn?.addEventListener('click', () => {
            window.location.reload();
        });
    };

    setupListeners();
}


function populateProfile(user: User, styles: Record<string, string>) {
    const container = document.getElementById('profile-content');
    if (!container) return;

    const defaultAvatar = `https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=7c3aed&color=fff`;

    // Set values
    const avatarImg = document.getElementById('profile-avatar') as HTMLImageElement;
    if (avatarImg) avatarImg.src = user.foto || defaultAvatar;

    const fullNameElement = document.getElementById('user-full-name');
    const emailElement = document.getElementById('user-email');
    const dniElement = document.getElementById('user-dni');
    const birthElement = document.getElementById('user-birth');
    const phoneElement = document.getElementById('user-phone');
    const nationalityElement = document.getElementById('user-nationality');
    const provinceElement = document.getElementById('user-province');
    const cityElement = document.getElementById('user-city');
    const addressElement = document.getElementById('user-address');
    const zipElement = document.getElementById('user-zip');
    const googleElement = document.getElementById('social-google');
    const facebookElement = document.getElementById('social-facebook');

    if (fullNameElement) fullNameElement.textContent = `${user.nombre} ${user.apellido || ''}`;
    if (emailElement) emailElement.textContent = user.email;
    if (dniElement) dniElement.textContent = user.dni ? `${user.tipoDni} ${user.dni}` : 'No especificado';
    if (birthElement) birthElement.textContent = user.fechaNacimiento ? new Date(user.fechaNacimiento).toLocaleDateString() : 'No especificado';
    if (phoneElement) phoneElement.textContent = user.telefono || 'No especificado';
    if (nationalityElement) nationalityElement.textContent = user.pais || 'No especificado';
    if (provinceElement) provinceElement.textContent = user.provincia || 'No especificado';
    if (cityElement) cityElement.textContent = user.ciudad || 'No especificado';
    if (addressElement) addressElement.textContent = user.direccion || 'No especificado';
    if (zipElement) zipElement.textContent = user.codigoPostal || 'No especificado';

    if (googleElement) googleElement.style.display = user.logueado_con_google ? 'flex' : 'none';
    if (facebookElement) facebookElement.style.display = user.logueado_con_facebook ? 'flex' : 'none';

    // Check for incomplete profile
    const isIncomplete = !user.dni || !user.fechaNacimiento || !user.pais || !user.ciudad || !user.direccion || !user.telefono || !user.provincia || !user.codigoPostal;
    const editBtn = document.getElementById('edit-profile-btn') as HTMLButtonElement;
    if (editBtn) {
        editBtn.textContent = isIncomplete ? 'Completar Perfil' : 'Editar Perfil';
        if (styles.editBtn) editBtn.className = styles.editBtn;
    }

    // Transition from loading to ready
    if (styles.loading) container.classList.remove(styles.loading);
    if (styles.isReady) container.classList.add(styles.isReady);
}
