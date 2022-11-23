import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { AuthService, Configuration, Login} from 'openapi';
import { Observable, throwError,map } from 'rxjs';
import {TokenStorageService} from './token-storage.service'
import { User } from 'openapi';
import { CookieService } from 'ngx-cookie-service';

const defaultPath = '/';
//const defaultUser = {
//   username: 'sandra@example.com',
//   avatarUrl: 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/06.png'
//};

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
    private storageService: TokenStorageService,
    private cookieService: CookieService,
    private router: Router
  ) { }

  
  login(username: string, password: string){
    const auth = {
      username: username,
      password: password
    } as Login;
    //let authConfig = new Configuration(this.authService.configuration)
    //authConfig.withCredentials=false
    //this.authService.configuration = authConfig
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
    this.storageService.signOut();

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
