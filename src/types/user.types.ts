export type User = {
    id: string; // UUID
    email: string;
    nombre: string;
    apellido: string;
    rol: string;
    foto?: string | null;
    dni?: string | null;
    tipoDni?: string | null;
    fechaNacimiento?: string | null;
    paisNacimiento?: string | null;
    codigoPostal?: string | null;
    ciudadResidencia?: string | null;
    logueado_con_google: boolean;
    logueado_con_facebook: boolean;
};
