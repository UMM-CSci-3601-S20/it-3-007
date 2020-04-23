import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivate } from '@angular/router';
import { Observable, iif, of } from 'rxjs';
import { AuthService } from './auth.service';
import { concatMap, map } from 'rxjs/operators';

// Based on https://community.auth0.com/t/angular-8-isauthenticated-race-condition/37474/3
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      concatMap(() => this.authService.handleAuthCallback()),
      concatMap(result =>
        iif(
          () => result.loggedIn,
          of(true),
          this.authService.login(state.url).pipe(map(() => false)),
        )
      ),
    );
  }
}
