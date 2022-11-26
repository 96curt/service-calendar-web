import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService, Login, User} from 'openapi';
import { map } from 'rxjs';
import {StorageService} from './'

@Injectable()
export class AuthHelperService {
  
  get isLoggedIn(): boolean {
    return !!this.storageService.getUser();
  }

  constructor(
    private authService: AuthService,
    private storageService: StorageService,
    private router: Router
  ) { }


  login(username: string, password: string){
    const auth = {
      username: username,
      password: password
    } as Login;
    const user = {
      username:username
    } as User
    return this.authService.authLoginCreate(auth).pipe(
      map(
        response => {
          this.storageService.saveUser(user);
        },
      )
    );
  }

  async logout() {
    this.authService.authLogoutCreate().subscribe();
    this.storageService.clear();
    this.router.navigate(['/login-form']);
  }
}
