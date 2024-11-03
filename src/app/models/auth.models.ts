export namespace ModelsAuth {
    export const PathUsers = 'Users';
    export const PathIntentsLogin = 'intentsLogin';

    export const StrongPasswordRegx: RegExp = /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d).{8,}$/; // Minimo 8 caracteres, al menos una letra mayúscula, una letra minúscula y un número

    export type IdProviderLogin = 'password' | 'google' | 'facebook' | 'apple'; // Valores disponibles para el id de los proveedores de login

    export type Role = 'admin' | 'client' | 'dealer';

    export interface DataResgister {
        email: string;
        password: string;
    }

    export interface DataLogin {
        email: string;
        password: string;
    }

    export interface UpdateProfileI {
        displayName?: string,
        photoURL?: string
    }

    export interface UserProfile {
        name: string;
        photo: string;
        age: number;
        id: string;
        email: string;

        roles?: {
            admin?: boolean;
            client?: boolean;
            dealer?: boolean;
        }
        token?: string;
    }

    export interface Roles {
        admin?: boolean;
        client?: boolean;
        dealer?: boolean;
    }

    export interface ProviderLoginI {
        name: string;
        id: IdProviderLogin;
        color: string;
        textColor: string;
        icon: string;
    }
}