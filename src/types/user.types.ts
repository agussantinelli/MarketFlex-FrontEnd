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
    pais?: string | null;
    direccion?: string | null;
    ciudad?: string | null;
    provincia?: string | null;
    codigoPostal?: string | null;
    telefono?: string | null;
    logueado_con_google: boolean;
    logueado_con_facebook: boolean;
};

export type UserResponse = {
    status: string;
    data: User;
};

export type UpdateUserInput = Partial<Omit<User, 'id' | 'email' | 'rol' | 'logueado_con_google' | 'logueado_con_facebook'>>;
