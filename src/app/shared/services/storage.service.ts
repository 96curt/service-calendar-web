import { Injectable } from '@angular/core';

const USER_KEY = 'auth-user';

@Injectable()
export class StorageService {

    constructor() { }

    clearAll(): void {
        window.sessionStorage.clear();
    }

    public saveUser(username: string): void {
        window.sessionStorage.removeItem(USER_KEY);
        window.sessionStorage.setItem(USER_KEY, username);
    }
    
    public getUser(): string | null {
        return sessionStorage.getItem(USER_KEY);
    }
}