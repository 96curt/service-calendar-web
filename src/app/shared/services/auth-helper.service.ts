import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, Login, User } from 'openapi';
import { catchError, lastValueFrom, map, Observable } from 'rxjs';
import { StorageService } from './storage.service';

@Injectable()
export class AuthHelperService {

  constructor(
    private storageService: StorageService,
    private authService: AuthService,
    private router: Router
  ) { }

  get isLoggedIn(): boolean {
    return !!this.storageService.getUser();
  }

  public login(username:string, password:string){
    const login = {
      username:username,
      password:password
    } as Login;
    const user = {
      username:username  
    } as User;
    return this.authService.authLoginCreate(login)
    .pipe(map(response => {
      this.storageService.saveUser(user);
    }));
  }

  public logout(){
    this.storageService.clear();
    this.authService.authLogoutCreate().subscribe();
    this.router.navigate(['/login-form']);

  }
}
