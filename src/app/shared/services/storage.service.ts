//code from https://www.bezkoder.com/angular-12-refresh-token/

import { Injectable } from '@angular/core';
import { User } from 'openapi';

const USER_KEY = 'auth-user';

@Injectable()
export class StorageService {

    constructor() { }

    public clear(): void {
        window.localStorage.clear();
    }

    public saveUser(user:User): void {
        window.localStorage.removeItem(USER_KEY);
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    public getUser(): User | null {
        let json = localStorage.getItem(USER_KEY);
        if (json)
            return JSON.parse(json);
        return null;
    }

}