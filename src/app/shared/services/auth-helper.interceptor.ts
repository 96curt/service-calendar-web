import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthHelperService } from './auth-helper.service';

@Injectable()
export class AuthHelperInterceptor implements HttpInterceptor {

  constructor(private authHelperService: AuthHelperService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error) => {
        if ((error.status === 403 || error.status == 401) && !error.url.includes('logout')){
          this.authHelperService.logOut();
          return throwError(() => Error('Invalid username or password'));
        }
        return throwError(() => error);
      })
    );
  }
}
