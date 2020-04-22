import { Injectable } from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { from, of, Observable, throwError, iif } from 'rxjs';
import { tap, catchError, concatMap, shareReplay, take, map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';

// We should really have a better log-out url.
// But that's a problem for another day.
export const REDIRECT_URL = environment.BASE_URL;
export const LOGOUT_URL = environment.BASE_URL;

// Based on https://community.auth0.com/t/angular-8-isauthenticated-race-condition/37474/3
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(public router: Router) {}

  auth0Client$: Observable<Auth0Client> = from(createAuth0Client({
    domain: environment.AUTH_DOMAIN,
    client_id: environment.AUTH_CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    audience: environment.AUTH_API_DOMAIN
  })).pipe(shareReplay(1), catchError(err => throwError(err)));

  isAuthenticated$ = this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
    from(client.isAuthenticated()),
  ));

  handleRedirectCallback$ = this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
    from(client.handleRedirectCallback()),
  ));

  getUser$(options?): Observable<any> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
      from(client.getUser(options)),
    ));
  }

  getTokenSilently$(options?): Observable<string> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
      from(client.getTokenSilently(options)),
    ));
  }

  login(redirectPath: string = '/home/dashboard'): Observable<void> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
      client.loginWithRedirect({
        redirect_uri: REDIRECT_URL,
        appState: { target: redirectPath },
      }),
    ));
  }

  handleAuthCallback(): Observable<{ loggedIn: boolean; targetUrl: string }> {
    return of(window.location.search).pipe(concatMap(params =>
      iif(
        () => params.includes('code=') && params.includes('state='),
        this.handleRedirectCallback$.pipe(concatMap(redirectResult =>
          this.isAuthenticated$.pipe(take(1), map(loggedIn => {
            let targetUrl;
            if (redirectResult.appState && redirectResult.appState.target) {
              targetUrl = redirectResult.appState.target;
            } else {
              targetUrl = '/';
            }
            return { loggedIn, targetUrl };
          })),
        )),
        this.isAuthenticated$.pipe(take(1), map(loggedIn =>
          ({ loggedIn, targetUrl: null }),
        )),
      ),
    ));
  }

  logout() {
   this.auth0Client$.subscribe((client: Auth0Client) => {
     client.logout({
       client_id: environment.AUTH_CLIENT_ID,
       returnTo: LOGOUT_URL,
    });
  });
 }
}
