import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/authentication/auth.service';
import { Observable, BehaviorSubject, of, from } from 'rxjs';
import { Auth0Client, IdToken, RedirectLoginResult } from '@auth0/auth0-spa-js';
import { environment } from 'src/environments/environment';
import { concatMap } from 'rxjs/operators';

@Injectable()
export class MockAuthService extends AuthService {
  constructor() {
    super(null);
  }

  auth0Client$ = null;

  isAuthenticated$ = of(true);

  handleRedirectCallback$ = of({
    appState: {
      target: '/',
    },
  });

  getUser$() {
    return of(professorJohnson);
  }

  handleAuthCallback() {
    return of({
      loggedIn: true,
      targetUrl: '/',
    });
  }


  getTokenSilently$() {
    return of('Hi, I\'m a JWT!');
  }

  login() { return of(undefined); }

  logout() {}
}

// See https://auth0.com/docs/api/management/v2#!/Users/get_users
export const professorJohnson = {
  user_id: 'auth0|507f1f77bcf86cd799439020',
  email: 'rmjohns@morris.umn.edu',
  email_verified: false,
  username: 'rmjohns',
  phone_number: '+199999999999999',
  phone_verified: false,
  created_at: '',
  updated_at: '',
  identities: [
    {
      connection: 'Initial-Connection',
      user_id: '507f1f77bcf86cd799439020',
      provider: 'auth0',
      isSocial: false
    }
  ],
  picture: '',
  name: 'Rachel Johnson',
  nickname: 'rmjohns',
  multifactor: [
    ''
  ],
  last_ip: '',
  last_login: '',
  logins_count: 0,
  blocked: false,
  given_name: 'Rachel',
  family_name: 'Johnson'
};

// See https://github.com/auth0/auth0-spa-js/blob/178b65f30c9b7a76ce762a1b4de1bd3ccfca5e5a/src/global.ts#L282
export const professorJohnsonsIdToken: IdToken = {
  __raw: '',
  name: professorJohnson.name,
  given_name: professorJohnson.given_name,
  family_name: professorJohnson.family_name,
  nickname: professorJohnson.nickname,
  picture: professorJohnson.picture,
  email: professorJohnson.email,
  email_verified: professorJohnson.email_verified,
  phone_number: professorJohnson.phone_number,
  phone_number_verified: professorJohnson.phone_verified,
  updated_at: professorJohnson.updated_at,
  iss: environment.AUTH_DOMAIN,
  aud: environment.AUTH_API_DOMAIN,
}
