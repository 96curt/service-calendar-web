import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpHeaders
} from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { AuthHelperService } from './auth-helper.service';
import { environment } from 'environments/environment';
import { CookieService } from 'ngx-cookie-service';
import notify from 'devextreme/ui/notify';

@Injectable()
export class AuthHelperInterceptor implements HttpInterceptor {

  constructor(
    private authHelperService: AuthHelperService,
    private cookieService: CookieService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const headerName = 'X-CSRF-TOKEN';
    const token = this.cookieService.get('csrf-token');
    let newReq = request.clone();

    if((request.url.includes('http') || request.url.includes('https'))
      && (request.method === 'POST' || request.method === 'PUT' || request.method === 'PATCH' || request.method === 'DELETE')
      && !request.url.includes('auth')
      && token !== null
      && !request.headers.get(headerName)
    ) {
      newReq = request.clone({headers: request.headers.append(headerName,token)});
    }  
    
    return next.handle(newReq)
    .pipe(catchError((error) => {
      switch(error.status) {
        case 0:
          notify(`error: ${error.url} is unreachable`, 'error');
          break;
        case 403:
        case 401:
          if(error.url.includes('logout'))
            this.authHelperService.logOut();
          break;
      }
      return throwError(() => error);
    }));
  }
}
