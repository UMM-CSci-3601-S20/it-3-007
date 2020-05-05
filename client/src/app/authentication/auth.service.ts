import { Injectable } from '@angular/core';
import createAuth0Client from '@auth0/auth0-spa-js';
import Auth0Client from '@auth0/auth0-spa-js/dist/typings/Auth0Client';
import { from, Observable, throwError, iif, ReplaySubject, Subject } from 'rxjs';
import { catchError, concatMap, shareReplay, take, map, flatMap } from 'rxjs/operators';
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
  auth0Client$: Observable<Auth0Client> = from(createAuth0Client({
    domain: environment.AUTH_DOMAIN,
    client_id: environment.AUTH_CLIENT_ID,
    redirect_uri: REDIRECT_URL,
    audience: environment.AUTH_API_DOMAIN
  })).pipe(shareReplay(1), catchError(err => throwError(err)));

  handleRedirectCallback$ = this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
    from(client.handleRedirectCallback())
  ));

  // When anyone asks for a value from isAuthenicated$, give back the last
  // value pushed to it.
  // (Aside: we're not using a BehaviorSubject because when you construct a
  // BehaviorSubject, you need to provide an initial value to it immediately.
  // By contrast, if you make a ReplaySubject with buffer size 1, you can hold
  // off giving it an initial value until you're ready.)
  private _isAuthenticated$: Subject<boolean> = new ReplaySubject(1);

  // Only expose the "reading" methods of isAuthenticated$ to the world at
  // large, not the "writing" methods.
  public isAuthenticated$ = this._isAuthenticated$.asObservable();

  constructor(public router: Router) {
    // Get the first value of isAuthenticated$ by calling down to the
    // underlying Auth0Client. (There shouldn't be any worry of race
    // conditions; everyone we care about waits for a value from
    // isAuthenticated$ before proceeding.)
    this.updateIsAuthenticated().subscribe();
  }

  getUser$(options?): Observable<any> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
      from(client.getUser(options))
    ));
  }

  getTokenSilently$(options?): Observable<string> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
      from(client.getTokenSilently(options))
    ));
  }

  login(redirectPath: string = '/home/dashboard'): Observable<void> {
    return this.auth0Client$.pipe(concatMap((client: Auth0Client) =>
      client.loginWithRedirect({
        redirect_uri: REDIRECT_URL,
        appState: { target: redirectPath },
      })
    ));
  }

  handleAuthCallback(): Observable<{ loggedIn: boolean; targetUrl: string }> {
    return this.updateIsAuthenticated().pipe(concatMap(() =>
      iif(
        () => this.areCallbackQueryParamsPresent(),
        this.handleRedirectCallback$.pipe(concatMap(redirectResult =>
          this.isAuthenticated$.pipe(take(1), map(loggedIn => {
            let targetUrl;
            if (redirectResult.appState && redirectResult.appState.target) {
              targetUrl = redirectResult.appState.target;
            } else {
              targetUrl = '/';
            }
            return { loggedIn, targetUrl };
          }))
        )),
        this.isAuthenticated$.pipe(take(1), map(loggedIn =>
          ({ loggedIn, targetUrl: null }),
        )),
      )
    ));
  }

  areCallbackQueryParamsPresent(): boolean {
    return window.location.search.includes('code=')
      && window.location.search.includes('state=');
  }

  logout() {
    this.auth0Client$.subscribe((client: Auth0Client) => {
      client.logout({
        client_id: environment.AUTH_CLIENT_ID,
        returnTo: LOGOUT_URL,
      });
      this.updateIsAuthenticated().subscribe();
    });
  }

  private updateIsAuthenticated(): Observable<void> {
    return this.auth0Client$.pipe(flatMap(client =>
      // of(this._isAuthenticated$.next(false))
      from(client.isAuthenticated()).pipe(map(loggedIn =>
        this._isAuthenticated$.next(loggedIn)
      ))
    ));
  }
}
