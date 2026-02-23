import type { User } from "./user.types";



export type LoginResponse = {
    user: User;
    accessToken: string;
    refreshToken: string;
};

export type GoogleLoginResponse = LoginResponse & {
    isNewUser: boolean;
};
