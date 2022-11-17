import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { environment } from 'environments/environment';
import { ApiService, ServiceService, TokenObtainPair,TokenRefresh,UserService } from 'openapi';
import { throwError } from 'rxjs';
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
    
    this.apiService.apiTokenCreate(auth).subscribe({
      next: (response) => {
        this.storageService.saveAccessToken(response.access);
        this.storageService.saveRefreshToken(response.refresh);
        this.storageService.saveUser(username);
        this.router.navigate([this._lastAuthenticatedPath]);
      },
      error: (error) => {
        return error;
      },
      complete: () => {
        console.log('token create complete')
      }
    }); 
  }

  getUser(): string{
    let username = this.storageService.getUser();
    if (!username){
      this.logOut();
      return '';
    }
    return username;
  }

  // async createAccount(email: string, password: string) {
  //   try {
  //     // Send request
  //     console.log(email, password);

  //     this.router.navigate(['/create-account']);
  //     return {
  //       isOk: true
  //     };
  //   }
  //   catch {
  //     return {
  //       isOk: false,
  //       message: "Failed to create account"
  //     };
  //   }
  // }

  // async changePassword(email: string, recoveryCode: string) {
  //   try {
  //     // Send request
  //     console.log(email, recoveryCode);

  //     return {
  //       isOk: true
  //     };
  //   }
  //   catch {
  //     return {
  //       isOk: false,
  //       message: "Failed to change password"
  //     }
  //   };
  // }

  // async resetPassword(email: string) {
  //   try {
  //     // Send request
  //     console.log(email);

  //     return {
  //       isOk: true
  //     };
  //   }
  //   catch {
  //     return {
  //       isOk: false,
  //       message: "Failed to reset password"
  //     };
  //   }
  // }

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
