import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService, Configuration, Login} from 'openapi';
import { Observable, throwError,map } from 'rxjs';
import {StorageService} from './storage.service'
import { User } from 'openapi';
import { CookieService } from 'ngx-cookie-service';

const defaultPath = '/';

@Injectable()
export class AuthHelperService {
  
  get loggedIn(): boolean {
    return !!this.storageService.getUser();
  }

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
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
    return this.authService.authLoginCreate(auth,).pipe(
      map(
        response => {
          this.storageService.saveUser(username);
        },
      )
    );
  }

  getUser(): string {
    let username = this.storageService.getUser();
    if (!username){
      this.logOut();
      return '';
    }
    return username;
  }

  async logOut() {
    this.authService.authLogoutCreate().subscribe();
    this.storageService.clearAll();
    this.router.navigate(['/login-form']);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthHelperService) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    const isLoggedIn = this.authService.loggedIn;
    const isAuthForm = [
      'login-form'
    ].includes(route.routeConfig?.path || defaultPath);

    if (isLoggedIn && isAuthForm) {
      this.authService.lastAuthenticatedPath = defaultPath;
      this.router.navigate([defaultPath]);
      return false;
    }

    if (!isLoggedIn && !isAuthForm) {
      this.router.navigate(['/login-form']);
    }

    if (isLoggedIn) {
      this.authService.lastAuthenticatedPath = route.routeConfig?.path || defaultPath;
    }

    return isLoggedIn || isAuthForm;
  }
}
