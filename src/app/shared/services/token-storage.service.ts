import { Injectable } from '@angular/core';
import { User } from 'openapi';

const ACCESS_KEY = 'auth-token';
const REFRESH_KEY = 'refesh-token';
const USER_KEY = 'auth-user';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {

    constructor() { }

    signOut(): void {
        window.sessionStorage.clear();
    }

    public saveAccessToken(token: string): void {
        window.sessionStorage.removeItem(ACCESS_KEY);
        window.sessionStorage.setItem(ACCESS_KEY, token);
    }

    public saveRefreshToken(token: string): void {
        window.sessionStorage.removeItem(REFRESH_KEY);
        window.sessionStorage.setItem(REFRESH_KEY, token);
    }

    public saveUser(username: string): void {
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, username);
    }

    public getAccessToken(): string | null {
        return sessionStorage.getItem(ACCESS_KEY);
    }

    public getRefreshToken(): string | null {
        return sessionStorage.getItem(REFRESH_KEY);
    }
    
    public getUser(): string | null {
        return sessionStorage.getItem(USER_KEY);
    }
}