export type User = {
    id: number;
    email: string;
    nombre: string;
    rol: string;
};

export type LoginResponse = {
    user: User;
    token: string;
};
