import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { ApiService, ServiceService, TokenObtainPair,TokenRefresh,UserService } from 'openapi';
import { Observable, throwError,map } from 'rxjs';
import {TokenStorageService} from './token-storage.service'
import { User } from 'openapi';

const defaultPath = '/';
//const defaultUser = {
//   username: 'sandra@example.com',
//   avatarUrl: 'https://js.devexpress.com/Demos/WidgetsGallery/JSDemos/images/employees/06.png'
//};

@Injectable()
export class AuthService {
  
  get loggedIn(): boolean {
    return !!this.storageService.getUser();
  }

  private _lastAuthenticatedPath: string = defaultPath;
  set lastAuthenticatedPath(value: string) {
    this._lastAuthenticatedPath = value;
  }

  constructor(
    private apiService: ApiService,
    private storageService: TokenStorageService,
    private userService: UserService,
    private router: Router
  ) {
    //if(this.loggedIn)
    //check accessToken
    
    //this.router.navigate(['/login-form']);
  }

  private _refreshToken(){
    const refresh = {
      refresh: this.storageService.getRefreshToken()
    } as TokenRefresh;
    this.apiService.apiTokenRefreshCreate(refresh)
    .subscribe({
      next: (value) => {
        console.log(value);
        this.apiService.apiTokenRefreshCreate(refresh).subscribe({
          next: (response) => {
            this.storageService.saveAccessToken(response.access);
            console.log(response)
          },
          error: (error) => {
    
          }
        });
      }
    })
    
  }
  
  login(username: string, password: string){
    const auth = {
      username: username,
      password: password
    } as TokenObtainPair;
    
    return this.apiService.apiTokenCreate(auth).pipe(
      map(
        response => {
          this.storageService.saveAccessToken(response.access);
          this.storageService.saveRefreshToken(response.refresh);
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

  getAccessToken(){
    return this.storageService.getAccessToken()
  }
  async logOut() {
    this.storageService.signOut();
    this.router.navigate(['/login-form']);
  }
}

@Injectable()
export class AuthGuardService implements CanActivate {
  constructor(private router: Router, private authService: AuthService) { }

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
