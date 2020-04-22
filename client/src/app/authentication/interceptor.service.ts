import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable, throwError } from 'rxjs';
import { catchError, concatMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class InterceptorService implements HttpInterceptor {

  constructor(private auth: AuthService) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return this.auth.isAuthenticated$.pipe(concatMap(loggedIn => {
      if (!loggedIn) {
        return next.handle(req);
      }
      return this.auth.getTokenSilently$().pipe(
        concatMap(token =>
          next.handle(req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
          })),
        ),
        catchError(err => throwError(err))
      );
    }));
  }
}
