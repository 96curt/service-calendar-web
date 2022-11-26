import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthHelperService } from './auth-helper.service';
import { StorageService } from './storage.service';

const defaultPath = '/'

@Injectable()
export class AuthGuard implements CanActivate {

  lastAuthenticatedPath = defaultPath;

  constructor(
    private authHelperService: AuthHelperService,
    private router: Router
  ){}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
    ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return true;
    const isLoggedIn = this.authHelperService.isLoggedIn;
    const isAuthForm = [
      'login-form'
    ].includes(route.routeConfig?.path || defaultPath);

    if (isLoggedIn && isAuthForm) {
      this.lastAuthenticatedPath = defaultPath;
      this.router.navigate([defaultPath]);
      return false;
    }

    if (!isLoggedIn && !isAuthForm) {
      this.router.navigate(['/login-form']);
    }

    if (isLoggedIn) {
      this.lastAuthenticatedPath = route.routeConfig?.path || defaultPath;
    }

    return !(isLoggedIn || isAuthForm);
  }
}
