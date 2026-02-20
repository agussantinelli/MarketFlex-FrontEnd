export type User = {
    id: number;
    email: string;
    nombre: string;
    rol: string;
    foto?: string;
};

export type LoginResponse = {
    user: User;
    token: string;
};

export type GoogleLoginResponse = LoginResponse & {
    isNewUser: boolean;
};
